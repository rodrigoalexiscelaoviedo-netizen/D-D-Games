import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { cerrarCombate } from '../../lib/combat-return';
import { resolveAttack, nextAliveIndex, isCombatOver, abilityMod, roll, skillCheck, getAbility } from '../../lib/combat-engine';
import { CombatAnimation } from './CombatAnimations';
import type { RollResult } from '../../lib/combat-engine';

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
        .select('id, character_class')
        .in('id', charIds);
      const map: Record<string, string> = {};
      (chars || []).forEach((c) => {
        map[c.id] = c.character_class;
      });
      setClassMap(map);
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
      await supabase
        .from('combat_participants')
        .update({ hp_current: opts.newTargetHp, status: opts.newTargetHp <= 0 ? 'unconscious' : 'ready' })
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

    const result = resolveAttack(current.attack_bonus ?? 2, effectiveAC(target), current.damage_dice ?? 8);
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
    await supabase.from('combat_participants').update({ temp_ac_bonus: 2 }).eq('id', current.id);
    await commitTurn({
      newLog: [...log, `${current.name} se pone en guardia · CA ${effectiveAC(current)} → ${effectiveAC(current) + 2} hasta su próximo turno`],
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
      ability.damageDice ?? 10
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

    const result = resolveAttack(current.attack_bonus ?? 3, effectiveAC(target), current.damage_dice ?? 6);
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

  if (loading) return <div className="page-pad">Cargando combate...</div>;

  const outcome = isCombatOver(participants);

  return (
    <div className="cbt">
      <div className="cbt-top">
        <span className="cbt-round">Ronda {combat?.round ?? 1}</span>
        <button className="btn-secondary sm" onClick={finish}>
          Guardar y salir
        </button>
      </div>

      <div className="cbt-stage">
        {outcome === 'victory' && (
          <div className="cbt-outcome win">
            <h2>Victoria</h2>
            <p>No queda ningún enemigo en pie.</p>
            <button className="btn-primary" onClick={finish}>
              Terminar combate
            </button>
          </div>
        )}

        {outcome === 'defeat' && (
          <div className="cbt-outcome lose">
            <h2>El grupo cae</h2>
            <p>Todos los personajes están inconscientes.</p>
            <button className="btn-primary" onClick={finish}>
              Terminar combate
            </button>
          </div>
        )}

        {!outcome && lastRoll && phase === 'showing_roll' && (
          <div
            className={`dice-scene ${lastRoll.critical ? 'crit' : lastRoll.fumble ? 'fumble' : lastRoll.hit ? 'hit' : 'miss'}`}
          >
            <p className="dice-who">{lastRoll.actorName}</p>
            <div className="d20">
              <span className="d20-num">{lastRoll.d20}</span>
            </div>
            <p className="dice-math">
              {lastRoll.d20} {lastRoll.bonus >= 0 ? '+' : '−'} {Math.abs(lastRoll.bonus)} ={' '}
              <strong>{lastRoll.total}</strong> vs CA {lastRoll.targetAC}
            </p>
            <p className={`dice-verdict ${lastRoll.hit ? 'ok' : 'no'}`}>
              {lastRoll.critical ? '¡CRÍTICO!' : lastRoll.fumble ? 'Pifia' : lastRoll.hit ? 'Golpea' : 'Falla'}
              {lastRoll.hit && ` · ${lastRoll.damage} de daño`}
            </p>
            <p className="dice-explain">{lastRoll.explanation}</p>
          </div>
        )}

        {!outcome && phase === 'awaiting_player' && (
          <div className="turn-intro">
            <p className="turn-label">Turno de</p>
            <h2>{current?.name}</h2>
            <p className="turn-sub">
              {aliveEnemies.length === 1
                ? `Queda ${aliveEnemies[0].name} en pie`
                : `Quedan ${aliveEnemies.length} enemigos en pie`}
            </p>
          </div>
        )}

        {!outcome && phase === 'awaiting_dm_continue' && (
          <div className="turn-intro enemy">
            <p className="turn-label">Turno del enemigo</p>
            <h2>{current?.name}</h2>
            <p className="turn-sub">Narrá lo que hace y después continuá.</p>
          </div>
        )}
      </div>

      <div className="cbt-actions">
        {phase === 'awaiting_dm_continue' && (
          <button className="big-btn primary" disabled={busy} onClick={runEnemyTurn}>
            Continuar →
          </button>
        )}

        {phase === 'showing_roll' && (
          <button className="big-btn ghost" disabled>
            Resolviendo...
          </button>
        )}

        {phase === 'awaiting_player' &&
          !pickingTarget &&
          (() => {
            const ability = getAbility(classMap[current?.character_id]);
            const abilitySpent = current?.ability_used;
            return (
              <>
                <button
                  className="big-btn primary"
                  disabled={busy}
                  onClick={() =>
                    aliveEnemies.length === 1 ? doAttack(aliveEnemies[0]) : setPickingTarget('attack')
                  }
                >
                  Atacar
                  <small>d20 + {current?.attack_bonus ?? 2} · daño d{current?.damage_dice ?? 8}</small>
                </button>

                <button className="big-btn" disabled={busy} onClick={doDefend}>
                  Defenderse
                  <small>+2 CA hasta tu próximo turno</small>
                </button>

                <button
                  className="big-btn"
                  disabled={busy || abilitySpent}
                  onClick={() => {
                    if (ability.kind !== 'attack') return doAbility();
                    return aliveEnemies.length === 1
                      ? doAbility(aliveEnemies[0])
                      : setPickingTarget('ability');
                  }}
                >
                  {ability.name}
                  <small>{abilitySpent ? 'Ya la usaste en este combate' : ability.description}</small>
                </button>

                <button className="big-btn" disabled={busy} onClick={doFlee}>
                  Huir
                  <small>Chequeo de DES contra dificultad 12</small>
                </button>
              </>
            );
          })()}

        {phase === 'awaiting_player' && pickingTarget && (
          <>
            <p className="pick-label">¿A quién?</p>
            {aliveEnemies.map((e) => (
              <button
                key={e.id}
                className="big-btn primary"
                onClick={() => (pickingTarget === 'attack' ? doAttack(e) : doAbility(e))}
              >
                {e.name} · {e.hp_current}/{e.hp_max} PV · CA {effectiveAC(e)}
              </button>
            ))}
            <button className="big-btn ghost" onClick={() => setPickingTarget(null)}>
              Cancelar
            </button>
          </>
        )}
      </div>

      <div className="cbt-roster">
        {participants.map((p) => {
          const pct = Math.max(0, (p.hp_current / p.hp_max) * 100);
          const isCurrent = p.id === current?.id;
          return (
            <div
              key={p.id}
              className={`roster-row ${p.is_player ? 'ally' : 'foe'} ${p.hp_current <= 0 ? 'down' : ''} ${
                isCurrent ? 'now' : ''
              }`}
            >
              <span className="roster-name">{p.name}</span>
              <div className="roster-bar">
                <div className="roster-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="roster-hp">
                {p.has_fled ? 'huyó' : p.hp_current <= 0 ? 'caído' : `${p.hp_current}/${p.hp_max}`}
                {p.temp_ac_bonus > 0 && <em className="ac-buff"> · CA {effectiveAC(p)}</em>}
              </span>
            </div>
          );
        })}
      </div>

      {log.length > 0 && (
        <details className="cbt-log">
          <summary>Historial ({log.length})</summary>
          {log
            .slice()
            .reverse()
            .map((l, i) => (
              <p key={i}>{l}</p>
            ))}
        </details>
      )}

      {animationQueue.map(anim => (
        <CombatAnimation
          key={anim.id}
          type={anim.type}
          value={anim.value}
          x={anim.x}
          y={anim.y}
        />
      ))}
    </div>
  );
};
