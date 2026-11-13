import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { parseDying } from '../../lib/combat-engine';

interface Row {
  id: string;
  name: string;
  is_player: boolean;
  hp_current: number;
  hp_max: number;
  has_fled?: boolean;
  status?: string;
}

interface WatchState {
  round: number;
  currentName?: string;
  lastLine?: string;
  rows: Row[];
}

// Como en la mesa: los jugadores no ven los PV exactos de los enemigos, solo cómo se los ve.
const enemyCondition = (r: Row) => {
  if (r.has_fled) return 'Huyó';
  if (r.hp_current <= 0) return 'Caído';
  const pct = r.hp_current / (r.hp_max || 1);
  if (pct >= 1) return 'Ileso';
  if (pct > 0.5) return 'Herido';
  return 'Muy herido';
};

/** Estado del combate en vivo para la vista de jugadores. Se actualiza solo cada pocos segundos. */
export const CombatWatch = ({ playthroughId, sceneId }: { playthroughId: string; sceneId: string }) => {
  const [state, setState] = useState<WatchState | null>(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      const { data: combats } = await supabase
        .from('combats')
        .select('id, round, turn_index, log')
        .eq('playthrough_id', playthroughId)
        .eq('scene_id', sceneId)
        .order('created_at', { ascending: false })
        .limit(1);

      const combat = combats?.[0];
      if (!combat) {
        if (alive) setState(null);
        return;
      }

      const { data: parts } = await supabase
        .from('combat_participants')
        .select('id, name, is_player, hp_current, hp_max, has_fled, status')
        .eq('combat_id', combat.id)
        .order('turn_order', { ascending: true });

      let lastLine: string | undefined;
      try {
        const lines = JSON.parse(combat.log || '[]');
        lastLine = lines[lines.length - 1];
      } catch {
        lastLine = undefined;
      }

      const rows = (parts ?? []) as Row[];
      if (alive) {
        setState({
          round: Math.max(1, combat.round ?? 1),
          currentName: rows[combat.turn_index ?? 0]?.name,
          lastLine,
          rows,
        });
      }
    };

    void load();
    const id = window.setInterval(load, 2500);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [playthroughId, sceneId]);

  if (!state) return null;

  const allies = state.rows.filter((r) => r.is_player);
  const foes = state.rows.filter((r) => !r.is_player);

  return (
    <section className="cw-live" aria-labelledby="cw-live-title" aria-live="polite">
      <div className="cw-live-head">
        <h2 id="cw-live-title">Combate en vivo</h2>
        <span className="cw-live-round">Ronda {state.round}</span>
      </div>
      {state.currentName && (
        <p className="cw-live-turn">
          Le toca a <strong>{state.currentName}</strong>
        </p>
      )}

      <div className="cw-live-cols">
        <div>
          <h3>Tu grupo</h3>
          <ul>
            {allies.map((r) => {
              const pct = Math.max(0, Math.min(100, (r.hp_current / (r.hp_max || 1)) * 100));
              return (
                <li key={r.id}>
                  <span className="cw-live-name">{r.name}</span>
                  <span className="cw-live-hp">
                    {r.status === 'dead'
                      ? 'Murió'
                      : parseDying(r.status).dying
                        ? 'Cayendo'
                        : r.hp_current <= 0
                          ? 'Caído'
                          : `${r.hp_current}/${r.hp_max} PV`}
                    {r.status === 'dodging' && ' · esquivando'}
                  </span>
                  <span className="cw-live-bar" aria-hidden="true">
                    <span style={{ width: `${pct}%` }} />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h3>Enemigos</h3>
          <ul>
            {foes.map((r) => {
              const condition = enemyCondition(r);
              return (
                <li key={r.id}>
                  <span className="cw-live-name">{r.name}</span>
                  <span className={`cw-live-cond cw-cond-${condition === 'Ileso' ? 'ok' : condition === 'Herido' ? 'mid' : 'low'}`}>
                    {condition}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {state.lastLine && <p className="cw-live-last">Último: {state.lastLine}</p>}
    </section>
  );
};
