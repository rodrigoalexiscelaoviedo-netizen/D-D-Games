import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { resolveAttack, nextAliveIndex, isCombatOver, abilityMod } from '../../lib/combat-engine';
import type { RollResult } from '../../lib/combat-engine';

type Phase = 'awaiting_player' | 'awaiting_dm_continue' | 'showing_roll' | 'finished';

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
  const [pickingTarget, setPickingTarget] = useState(false);

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
  const aliveEnemies = enemies.filter((e) => e.hp_current > 0);
  const aliveAllies = allies.filter((a) => a.hp_current > 0);

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
        .update({ log: JSON.stringify(opts.newLog), status: over === 'victory' ? 'finished' : 'defeat' })
        .eq('id', combatId);
      await refetch();
      setPhase('finished');
      return;
    }

    const idx = combat?.turn_index ?? 0;
    const nextIdx = nextAliveIndex(list, idx);
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
    setPickingTarget(false);

    const attackBonus = current.is_player ? abilityMod(current.dexterity) + 2 : 3;
    const damageDice = current.is_player ? 8 : 6;

    const result = resolveAttack(attackBonus, target.armor_class, damageDice);
    setLastRoll({ ...result, actorName: current.name, targetName: target.name });
    setPhase('showing_roll');

    const newHp = result.hit ? Math.max(0, target.hp_current - result.damage) : target.hp_current;
    const line = result.hit
      ? `${current.name} → ${target.name}: ${result.total} vs CA ${target.armor_class} · ${
          result.critical ? 'CRÍTICO ' : ''
        }${result.damage} de daño${newHp <= 0 ? ' · cae' : ''}`
      : `${current.name} → ${target.name}: ${result.total} vs CA ${target.armor_class} · falla`;

    setTimeout(async () => {
      await commitTurn({ newLog: [...log, line], targetId: target.id, newTargetHp: newHp });
      setBusy(false);
    }, 1600);
  };

  const doSimpleAction = async (label: string) => {
    if (busy || !current) return;
    setBusy(true);
    setLastRoll(null);
    await commitTurn({ newLog: [...log, `${current.name}: ${label}`] });
    setBusy(false);
  };

  const runEnemyTurn = async () => {
    if (busy || !current || current.is_player) return;
    setBusy(true);

    const target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
    if (!target) {
      setBusy(false);
      return;
    }

    const result = resolveAttack(3, target.armor_class, 6);
    setLastRoll({ ...result, actorName: current.name, targetName: target.name });
    setPhase('showing_roll');

    const newHp = result.hit ? Math.max(0, target.hp_current - result.damage) : target.hp_current;
    const line = result.hit
      ? `${current.name} → ${target.name}: ${result.total} vs CA ${target.armor_class} · ${
          result.critical ? 'CRÍTICO ' : ''
        }${result.damage} de daño${newHp <= 0 ? ' · cae' : ''}`
      : `${current.name} → ${target.name}: ${result.total} vs CA ${target.armor_class} · falla`;

    setTimeout(async () => {
      await commitTurn({ newLog: [...log, line], targetId: target.id, newTargetHp: newHp });
      setBusy(false);
    }, 1600);
  };

  const finish = async () => {
    await supabase.from('combats').update({ status: 'finished' }).eq('id', combatId);
    navigate(`/campaign/${campaignId}`);
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
            <p className="dice-who">
              {lastRoll.actorName} ataca a {lastRoll.targetName}
            </p>
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

        {phase === 'showing_roll' && <button className="big-btn ghost" disabled>
          Resolviendo...
        </button>}

        {phase === 'awaiting_player' && !pickingTarget && (
          <>
            <button
              className="big-btn primary"
              disabled={busy}
              onClick={() =>
                aliveEnemies.length === 1 ? doAttack(aliveEnemies[0]) : setPickingTarget(true)
              }
            >
              Atacar
            </button>
            <button
              className="big-btn"
              disabled={busy}
              onClick={() => doSimpleAction('se pone en guardia (+2 CA hasta su próximo turno)')}
            >
              Defenderse
            </button>
            <button
              className="big-btn"
              disabled={busy}
              onClick={() => doSimpleAction('usa una habilidad o hechizo')}
            >
              Habilidad
            </button>
            <button className="big-btn" disabled={busy} onClick={() => doSimpleAction('intenta huir')}>
              Huir
            </button>
          </>
        )}

        {phase === 'awaiting_player' && pickingTarget && (
          <>
            <p className="pick-label">¿A quién ataca?</p>
            {aliveEnemies.map((e) => (
              <button key={e.id} className="big-btn primary" onClick={() => doAttack(e)}>
                {e.name} · {e.hp_current}/{e.hp_max} PV · CA {e.armor_class}
              </button>
            ))}
            <button className="big-btn ghost" onClick={() => setPickingTarget(false)}>
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
              <span className="roster-hp">{p.hp_current <= 0 ? 'caído' : `${p.hp_current}/${p.hp_max}`}</span>
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
    </div>
  );
};
