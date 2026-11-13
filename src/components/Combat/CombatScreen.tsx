import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { cerrarCombate } from '../../lib/combat-return';
import { resolveAttack, nextAliveIndex, isCombatOver, abilityMod, roll, skillCheck, getAbility } from '../../lib/combat-engine';
import { CombatAnimation } from './CombatAnimations';
import type { RollResult } from '../../lib/combat-engine';
import './combat-screen.css';

type Phase = 'awaiting_player' | 'awaiting_dm_continue' | 'showing_roll' | 'finished';
type PickingFor = 'attack' | 'ability' | null;

export const CombatScreen = () => {
  const { campaignId, combatId } = useParams();
  const navigate = useNavigate();

  const [combat, setCombat] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [lastRoll, setLastRoll] = useState<(RollResult & { actorName: string; targetName: string }) | null>(null);
  const [phase, setPhase] = useState<Phase>('awaiting_player');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pickingTarget, setPickingTarget] = useState<PickingFor>(null);
  const [classMap, setClassMap] = useState<Record<string, string>>({});
  const [strMap, setStrMap] = useState<Record<string, number>>({});
  const [animationQueue, setAnimationQueue] = useState<Array<{ id: string; type: 'attack' | 'damage' | 'heal' | 'miss'; value?: number; x: number; y: number }>>([]);

  const refetch = useCallback(async () => {
    const { data: c } = await supabase
      .from('combats')
      .select('*')
      .eq('id', combatId)
      .single();
    const { data: p } = await supabase
      .from('combat_participants')
      .select('*')
      .eq('combat_id', combatId)
      .order('turn_order', { ascending: true });

    setCombat(c);
    setParticipants(p || []);
    try {
      setLog(JSON.parse(c?.log || '[]'));
    } catch {
      setLog([]);
    }

    const charIds = (p || []).map((x) => x.character_id).filter(Boolean);
    if (charIds.length > 0) {
      const { data: chars } = await supabase
        .from('characters')
        .select('id, character_class, str')
        .in('id', charIds);
      const map: Record<string, string> = {};
      const strengths: Record<string, number> = {};
      (chars || []).forEach((c) => {
        map[c.id] = c.character_class;
        strengths[c.id] = c.str;
      });
      setClassMap(map);
      setStrMap(strengths);
    }

    const over = isCombatOver(p || []);
    if (over) {
      setPhase('finished');
      return { c, p: p || [], over };
    }

    const actor = (p || [])[c?.turn_index ?? 0];
    setPhase(actor?.is_player ? 'awaiting_player' : 'awaiting_dm_continue');
    return { c, p: p || [], over: null };
  }, [combatId]);

  useEffect(() => {
    (async () => {
      await refetch();
      setLoading(false);
    })();
  }, [refetch]);

  const current = participants[combat?.turn_index ?? 0];
  const enemies = participants.filter((p) => !p.is_player);
  const allies = participants.filter((p) => p.is_player);
  const aliveEnemies = enemies.filter((e) => e.hp_current > 0 && !e.has_fled);
  const aliveAllies = allies.filter((a) => a.hp_current > 0);

  const effectiveAC = (p: any) => (p?.armor_class ?? 10) + (p?.temp_ac_bonus ?? 0);

  const addAnimation = (type: 'attack' | 'damage' | 'heal' | 'miss', value: number | undefined, x: number, y: number) => {
    const animId = `${Date.now()}-${Math.random()}`;
    setAnimationQueue(prev => [...prev, { id: animId, type, value, x, y }]);
    setTimeout(() => {
      setAnimationQueue(prev => prev.filter(a => a.id !== animId));
    }, 1200);
  };

  const commitTurn = async (opts: { newLog: string[]; targetId?: string; newTargetHp?: number }) => {
    if (opts.targetId != null && opts.newTargetHp != null) {
      // Solo cambia el estado si cae inconsciente: así no se pierde una esquiva activa.
      await supabase
        .from('combat_participants')
        .update(
          opts.newTargetHp <= 0
            ? { hp_current: opts.newTargetHp, status: 'unconscious' }
            : { hp_current: opts.newTargetHp }
        )
        .eq('id', opts.targetId);
    }

    const { data: fresh } = await supabase
      .from('combat_participants')
      .select('*')
      .eq('combat_id', combatId)
      .order('turn_order', { ascending: true });
    const list = fresh || [];

    const over = isCombatOver(list);
    if (over) {
      await supabase
        .from('combats')
        .update({ log: JSON.stringify(opts.newLog) })
        .eq('id', combatId);
      await refetch();
      await closeCombat(over);
      return;
    }

    const idx = combat?.turn_index ?? 0;
    const nextIdx = nextAliveIndex(list, idx);

    // La esquiva dura hasta el inicio del próximo turno de quien esquivó.
    if (list[nextIdx]?.status === 'dodging') {
      await supabase.from('combat_participants').update({ status: 'ready' }).eq('id', list[nextIdx].id);
    }

    if (list[nextIdx]?.temp_ac_bonus > 0) {
      await supabase.from('combat_participants').update({ temp_ac_bonus: 0 }).eq('id', list[nextIdx].id);
    }

    const newRound = nextIdx <= idx ? (combat?.round ?? 1) + 1 : combat?.round ?? 1;

    await supabase
      .from('combats')
      .update({ turn_index: nextIdx, round: newRound, log: JSON.stringify(opts.newLog) })
      .eq('id', combatId);

    await refetch();
  };

  const doAttack = async (target: any) => {
    if (busy || !current) return;
    setBusy(true);
    setPickingTarget(null);

    const result = resolveAttack(
      current.attack_bonus ?? 2,
      effectiveAC(target),
      current.damage_dice ?? 8,
      current.is_player ? abilityMod(strMap[current.character_id]) : 0,
      target.status === 'dodging' ? 'disadvantage' : 'normal'
    );
    setLastRoll({ ...result, actorName: current.name, targetName: target.name });
    setPhase('showing_roll');

    const newHp = result.hit ? Math.max(0, target.hp_current - result.damage) : target.hp_current;
    const line = result.hit
      ? `${current.name} → ${target.name}: ${result.total} vs CA ${effectiveAC(target)} · ${
          result.critical ? 'CRÍTICO ' : ''
        }${result.damage} de daño${newHp <= 0 ? ' · cae' : ''}`
      : `${current.name} → ${target.name}: ${result.total} vs CA ${effectiveAC(target)} · falla`;

    if (result.hit) {
      addAnimation('damage', result.damage, window.innerWidth / 2, window.innerHeight / 2);
    } else {
      addAnimation('miss', undefined, window.innerWidth / 2, window.innerHeight / 2);
    }

    setTimeout(async () => {
      await commitTurn({ newLog: [...log, line], targetId: target.id, newTargetHp: newHp });
      setBusy(false);
    }, 1600);
  };

  const doDefend = async () => {
    if (busy || !current) return;
    setBusy(true);
    setLastRoll(null);
    // Esquivar (regla de 5e): los ataques contra este personaje tienen desventaja hasta su próximo turno.
    await supabase.from('combat_participants').update({ status: 'dodging' }).eq('id', current.id);
    await commitTurn({
      newLog: [...log, `${current.name} esquiva: los ataques contra él tienen desventaja hasta su próximo turno`],
    });
    setBusy(false);
  };

  const doAbility = async (target?: any) => {
    if (busy || !current) return;
    const ability = getAbility(classMap[current.character_id]);
    setBusy(true);
    setPickingTarget(null);

    if (ability.kind === 'heal') {
      const healed = roll(ability.healDice ?? 8) + 2;
      const newHp = Math.min(current.hp_max, current.hp_current + healed);
      addAnimation('heal', healed, window.innerWidth / 2, window.innerHeight / 2);
      await supabase
        .from('combat_participants')
        .update({ hp_current: newHp, ability_used: true })
        .eq('id', current.id);
      await commitTurn({
        newLog: [...log, `${current.name} usa ${ability.name} · recupera ${healed} PV (${newHp}/${current.hp_max})`],
      });
      setBusy(false);
      return;
    }

    if (ability.kind === 'buff') {
      await supabase
        .from('combat_participants')
        .update({ temp_ac_bonus: ability.acBonus ?? 3, ability_used: true })
        .eq('id', current.id);
      await commitTurn({
        newLog: [...log, `${current.name} usa ${ability.name} · +${ability.acBonus} CA hasta su próximo turno`],
      });
      setBusy(false);
      return;
    }

    if (!target) {
      setBusy(false);
      return;
    }
    const result = resolveAttack(
      (current.attack_bonus ?? 2) + (ability.bonusToHit ?? 0),
      effectiveAC(target),
      ability.damageDice ?? 10,
      abilityMod(strMap[current.character_id]),
      target.status === 'dodging' ? 'disadvantage' : 'normal'
    );
    setLastRoll({
      ...result,
      actorName: `${current.name} · ${ability.name}`,
      targetName: target.name,
    });
    setPhase('showing_roll');

    const newHp = result.hit ? Math.max(0, target.hp_current - result.damage) : target.hp_current;
    const line = result.hit
      ? `${current.name} usa ${ability.name} → ${target.name}: ${result.total} vs CA ${effectiveAC(target)} · ${
          result.critical ? 'CRÍTICO ' : ''
        }${result.damage} de daño${newHp <= 0 ? ' · cae' : ''}`
      : `${current.name} usa ${ability.name} → ${target.name}: ${result.total} vs CA ${effectiveAC(target)} · falla`;

    if (result.hit) {
      addAnimation('damage', result.damage, window.innerWidth / 2, window.innerHeight / 2);
    } else {
      addAnimation('miss', undefined, window.innerWidth / 2, window.innerHeight / 2);
    }

    await supabase.from('combat_participants').update({ ability_used: true }).eq('id', current.id);

    setTimeout(async () => {
      await commitTurn({ newLog: [...log, line], targetId: target.id, newTargetHp: newHp });
      setBusy(false);
    }, 1600);
  };

  const doFlee = async () => {
    if (busy || !current) return;
    setBusy(true);
    const check = skillCheck(abilityMod(current.dexterity), 12);
    setLastRoll({
      d20: check.d20,
      bonus: check.bonus,
      total: check.total,
      targetAC: check.dc,
      hit: check.success,
      critical: false,
      fumble: false,
      damage: 0,
      explanation: check.explanation,
      actorName: `${current.name} intenta huir`,
      targetName: '',
    } as any);
    setPhase('showing_roll');

    const line = check.success
      ? `${current.name} escapa del combate (${check.total} vs 12)`
      : `${current.name} intenta huir y no lo logra (${check.total} vs 12)`;

    if (check.success) {
      await supabase.from('combat_participants').update({ has_fled: true, hp_current: 0 }).eq('id', current.id);
    }

    setTimeout(async () => {
      await commitTurn({ newLog: [...log, line] });
      setBusy(false);
    }, 1600);
  };

  const runEnemyTurn = async () => {
    if (busy || !current || current.is_player) return;
    setBusy(true);

    const target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
    if (!target) {
      setBusy(false);
      return;
    }

    const result = resolveAttack(
      current.attack_bonus ?? 3,
      effectiveAC(target),
      current.damage_dice ?? 6,
      0,
      target.status === 'dodging' ? 'disadvantage' : 'normal'
    );
    setLastRoll({ ...result, actorName: current.name, targetName: target.name });
    setPhase('showing_roll');

    const newHp = result.hit ? Math.max(0, target.hp_current - result.damage) : target.hp_current;
    const line = result.hit
      ? `${current.name} → ${target.name}: ${result.total} vs CA ${effectiveAC(target)} · ${
          result.critical ? 'CRÍTICO ' : ''
        }${result.damage} de daño${newHp <= 0 ? ' · cae' : ''}`
      : `${current.name} → ${target.name}: ${result.total} vs CA ${effectiveAC(target)} · falla`;

    if (result.hit) {
      addAnimation('damage', result.damage, window.innerWidth / 2, window.innerHeight / 2);
    } else {
      addAnimation('miss', undefined, window.innerWidth / 2, window.innerHeight / 2);
    }

    setTimeout(async () => {
      await commitTurn({ newLog: [...log, line], targetId: target.id, newTargetHp: newHp });
      setBusy(false);
    }, 1600);
  };

  const closeCombat = async (resultado: 'victory' | 'defeat') => {
    if (!combat || !combatId) return;

    if (combat.playthrough_id && combat.scene_id) {
      await cerrarCombate(combat.playthrough_id, combat.scene_id, resultado, combatId);
      navigate(`/campaign/${campaignId}/play/${combat.playthrough_id}`);
    } else {
      const statusToSet = resultado === 'victory' ? 'finished' : 'defeat';
      await supabase
        .from('combats')
        .update({ status: statusToSet })
        .eq('id', combatId);
      navigate(`/campaign/${campaignId}`);
    }
  };

  const finish = async () => {
    const outcome = isCombatOver(participants);
    if (outcome) {
      await closeCombat(outcome);
    } else {
      if (!combat) return;
      const statusToSet = 'finished';
      await supabase
        .from('combats')
        .update({ status: statusToSet })
        .eq('id', combatId);
      navigate(`/campaign/${campaignId}`);
    }
  };

  if (loading) {
    return (
      <div className="cs-state" role="status">
        <p>Preparando el combate…</p>
      </div>
    );
  }

  const outcome = isCombatOver(participants);
  const foes = enemies;

  const rowStatus = (p: any) => {
    if (p.has_fled) return 'Huyó';
    if (p.hp_current <= 0) return 'Caído';
    return `${p.hp_current}/${p.hp_max} PV`;
  };

  const renderRoster = (list: any[]) =>
    list.map((p) => {
      const pct = Math.max(0, Math.min(100, (p.hp_current / (p.hp_max || 1)) * 100));
      const isCurrent = p.id === current?.id;
      const down = p.hp_current <= 0 || p.has_fled;
      return (
        <li key={p.id} className={`cs-row ${isCurrent ? 'is-now' : ''} ${down ? 'is-down' : ''}`}>
          <div className="cs-row-head">
            <span className="cs-row-name">
              {isCurrent && <span className="cs-row-turn">Juega ahora · </span>}
              {p.name}
            </span>
            <span className="cs-row-status">
              {rowStatus(p)}
              {p.status === 'dodging' && <em className="cs-row-buff"> · esquivando</em>}
            </span>
          </div>
          <div
            className="cs-bar"
            role="progressbar"
            aria-label={`Vida de ${p.name}`}
            aria-valuemin={0}
            aria-valuemax={p.hp_max}
            aria-valuenow={Math.max(0, p.hp_current)}
          >
            <div className="cs-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </li>
      );
    });

  return (
    <div className="cs">
      <header className="cs-top">
        <div className="cs-top-title">
          <p className="cs-eyebrow">Combate en curso</p>
          <h1>Ronda {Math.max(1, combat?.round ?? 1)}</h1>
        </div>
        <button className="cs-btn cs-btn-ghost" onClick={finish}>
          Salir del combate
        </button>
      </header>

      <p className="cs-hint-bar">
        Cada personaje juega en orden. Cuando juega un enemigo, el director narra lo que hace y toca “Continuar”.
      </p>

      <div className="cs-body">
        <section className="cs-stage" aria-live="polite">
          {outcome === 'victory' && (
            <div className="cs-outcome cs-win">
              <h2>¡Ganaron!</h2>
              <p>Ya no queda ningún enemigo en pie.</p>
              <button className="cs-btn cs-btn-primary" onClick={finish}>
                Volver a la aventura
              </button>
            </div>
          )}

          {outcome === 'defeat' && (
            <div className="cs-outcome cs-lose">
              <h2>El grupo cayó</h2>
              <p>Todos los personajes están inconscientes.</p>
              <button className="cs-btn cs-btn-primary" onClick={finish}>
                Volver a la aventura
              </button>
            </div>
          )}

          {!outcome && lastRoll && phase === 'showing_roll' && (
            <div
              className={`cs-roll cs-roll-${
                lastRoll.critical ? 'crit' : lastRoll.fumble ? 'fumble' : lastRoll.hit ? 'hit' : 'miss'
              }`}
            >
              <p className="cs-roll-who">{lastRoll.actorName}</p>
              <div className="cs-die" aria-label={`Dado: ${lastRoll.d20}`}>
                {lastRoll.d20}
              </div>
              <p className="cs-roll-math">
                {lastRoll.d20} {lastRoll.bonus >= 0 ? '+' : '−'} {Math.abs(lastRoll.bonus)} ={' '}
                <strong>{lastRoll.total}</strong> contra la CA {lastRoll.targetAC}
              </p>
              <p className="cs-roll-verdict">
                {lastRoll.critical ? '¡Golpe crítico!' : lastRoll.fumble ? 'Pifia' : lastRoll.hit ? 'Acierta' : 'Falla'}
                {lastRoll.hit && ` · ${lastRoll.damage} de daño`}
              </p>
              <p className="cs-hint">{lastRoll.explanation}</p>
            </div>
          )}

          {!outcome && phase === 'awaiting_player' && (
            <div className="cs-turn">
              <p className="cs-eyebrow">Le toca a</p>
              <h2>{current?.name}</h2>
              <p className="cs-hint">
                {aliveEnemies.length === 1
                  ? `Queda 1 enemigo en pie: ${aliveEnemies[0].name}.`
                  : `Quedan ${aliveEnemies.length} enemigos en pie.`}
              </p>
            </div>
          )}

          {!outcome && phase === 'awaiting_dm_continue' && (
            <div className="cs-turn cs-turn-enemy">
              <p className="cs-eyebrow">Le toca al enemigo</p>
              <h2>{current?.name}</h2>
              <p className="cs-hint">Contá qué hace y después tocá “Continuar”.</p>
            </div>
          )}
        </section>

        <section className="cs-actions" aria-label="Qué puede hacer el personaje">
          {phase === 'awaiting_dm_continue' && (
            <button className="cs-action cs-action-main" disabled={busy} onClick={runEnemyTurn}>
              <span className="cs-action-title">Continuar</span>
              <span className="cs-action-sub">El enemigo ataca a uno de los personajes</span>
            </button>
          )}

          {phase === 'showing_roll' && <p className="cs-hint">Resolviendo el turno…</p>}

          {phase === 'awaiting_player' &&
            !pickingTarget &&
            (() => {
              const ability = getAbility(classMap[current?.character_id]);
              const abilitySpent = current?.ability_used;
              return (
                <>
                  <button
                    className="cs-action cs-action-main"
                    disabled={busy}
                    onClick={() => (aliveEnemies.length === 1 ? doAttack(aliveEnemies[0]) : setPickingTarget('attack'))}
                  >
                    <span className="cs-action-title">Atacar</span>
                    <span className="cs-action-sub">
                      Tirá un d20 y sumá {current?.attack_bonus ?? 2}. Si acierta, hace d{current?.damage_dice ?? 8} de daño.
                    </span>
                  </button>

                  <button className="cs-action" disabled={busy} onClick={doDefend}>
                    <span className="cs-action-title">Defenderse</span>
                    <span className="cs-action-sub">Hasta tu próximo turno, los ataques contra vos tienen desventaja.</span>
                  </button>

                  <button
                    className="cs-action"
                    disabled={busy || abilitySpent}
                    onClick={() => {
                      if (ability.kind !== 'attack') return doAbility();
                      return aliveEnemies.length === 1 ? doAbility(aliveEnemies[0]) : setPickingTarget('ability');
                    }}
                  >
                    <span className="cs-action-title">{ability.name}</span>
                    <span className="cs-action-sub">
                      {abilitySpent ? 'Ya la usaste en este combate.' : `Regla casera: ${ability.description}`}
                    </span>
                  </button>

                  <button className="cs-action" disabled={busy} onClick={doFlee}>
                    <span className="cs-action-title">Huir</span>
                    <span className="cs-action-sub">Regla casera: tirá Destreza. Con 12 o más, escapa del combate.</span>
                  </button>
                </>
              );
            })()}

          {phase === 'awaiting_player' && pickingTarget && (
            <div className="cs-pick">
              <p className="cs-pick-title">¿A quién apuntás?</p>
              {aliveEnemies.map((e) => (
                <button
                  key={e.id}
                  className="cs-action cs-action-main"
                  onClick={() => (pickingTarget === 'attack' ? doAttack(e) : doAbility(e))}
                >
                  <span className="cs-action-title">{e.name}</span>
                  <span className="cs-action-sub">
                    {e.hp_current}/{e.hp_max} PV · CA {effectiveAC(e)}
                  </span>
                </button>
              ))}
              <button className="cs-btn cs-btn-ghost" onClick={() => setPickingTarget(null)}>
                Volver
              </button>
            </div>
          )}
        </section>

        <aside className="cs-side" aria-label="Estado del combate">
          <section className="cs-panel">
            <h2>Tu grupo</h2>
            <ul className="cs-roster">{renderRoster(allies)}</ul>
          </section>
          <section className="cs-panel">
            <h2>Enemigos</h2>
            <ul className="cs-roster">{renderRoster(foes)}</ul>
          </section>
        </aside>
      </div>

      {log.length > 0 && (
        <details className="cs-log">
          <summary>Qué pasó en el combate ({log.length})</summary>
          <ol>
            {log
              .slice()
              .reverse()
              .map((l, i) => (
                <li key={i}>{l}</li>
              ))}
          </ol>
        </details>
      )}

      {animationQueue.map((anim) => (
        <CombatAnimation key={anim.id} type={anim.type} value={anim.value} x={anim.x} y={anim.y} />
      ))}
    </div>
  );
};