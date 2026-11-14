import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { xpForNextLevel } from '../../lib/combat-return';

interface Member {
  id: string;
  character_name: string;
  character_class?: string | null;
  race?: string | null;
  level?: number | null;
  xp?: number | null;
  hp_current?: number | null;
  hp_max?: number | null;
  portrait_url?: string | null;
  spell_slots?: Record<string, number> | null;
}

/** Estado del grupo para el DM: vida, nivel, experiencia y descansos. */
export const PartyPanel = ({ campaignId }: { campaignId: string }) => {
  const [party, setParty] = useState<Member[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data } = await supabase
      .from('characters')
      .select('id, character_name, character_class, race, level, xp, hp_current, hp_max, portrait_url, spell_slots')
      .eq('campaign_id', campaignId)
      .order('character_name', { ascending: true });
    setParty((data ?? []) as Member[]);
  };

  useEffect(() => {
    void load();
  }, [campaignId]);

  // Descanso corto (simplificado): recupera la mitad de la vida perdida, redondeando hacia arriba.
  // Descanso largo: vida completa (regla de 5e).
  const rest = async (kind: 'short' | 'long') => {
    if (!party) return;
    setBusy(true);
    setMessage('');
    let failed = false;
    for (const m of party) {
      const max = m.hp_max ?? 0;
      const cur = Math.max(0, m.hp_current ?? max);
      const next = kind === 'long' ? max : Math.min(max, cur + Math.ceil((max - cur) / 2));

      // Descanso largo: también recupera los espacios de conjuro de nivel 1 (hasta su máximo guardado).
      const slots = m.spell_slots ?? {};
      const restoredSlots =
        kind === 'long' && typeof slots['max1'] === 'number'
          ? { ...slots, '1': slots['max1'] }
          : null;

      if (next === cur && !restoredSlots) continue;
      const patch: Record<string, unknown> = { hp_current: next };
      if (restoredSlots) patch.spell_slots = restoredSlots;
      const { error } = await supabase.from('characters').update(patch).eq('id', m.id);
      if (error) failed = true;
    }
    await load();
    setBusy(false);
    setMessage(
      failed
        ? 'No se pudo actualizar la vida de algún personaje.'
        : kind === 'long'
          ? 'Descanso largo: el grupo recuperó toda la vida.'
          : 'Descanso corto: cada personaje recuperó la mitad de la vida que le faltaba.'
    );
  };

  if (!party) return null;

  return (
    <section className="pp" aria-labelledby="pp-title">
      <div className="pp-head">
        <h2 id="pp-title">Tu grupo</h2>
        <div className="pp-actions">
          <button
            className="ps-btn ps-btn-ghost"
            onClick={() => rest('short')}
            disabled={busy || party.length === 0}
            title="Una hora de pausa. Regla simplificada: recuperan la mitad de la vida que les falta."
          >
            Descanso corto
          </button>
          <button
            className="ps-btn ps-btn-ghost"
            onClick={() => rest('long')}
            disabled={busy || party.length === 0}
            title="Una noche entera. Recuperan toda la vida."
          >
            Descanso largo
          </button>
        </div>
      </div>

      {message && <p className="pp-message" role="status">{message}</p>}

      {party.length === 0 ? (
        <p className="ps-panel-note">Todavía no hay personajes en la campaña.</p>
      ) : (
        <ul className="pp-list">
          {party.map((m) => {
            const max = m.hp_max ?? 0;
            const cur = Math.max(0, m.hp_current ?? max);
            const hpPct = max > 0 ? Math.min(100, (cur / max) * 100) : 0;
            const level = Math.max(1, m.level ?? 1);
            const xp = m.xp ?? 0;
            const next = xpForNextLevel(level);
            const prev = level > 1 ? xpForNextLevel(level - 1) ?? 0 : 0;
            const xpPct = next ? Math.min(100, ((xp - prev) / (next - prev)) * 100) : 100;
            const low = hpPct <= 30;
            return (
              <li key={m.id} className={`pp-member ${cur === 0 ? 'is-down' : ''}`}>
                {m.portrait_url ? (
                  <img className="pp-portrait" src={m.portrait_url} alt="" />
                ) : (
                  <span className="pp-portrait pp-initial" aria-hidden="true">
                    {m.character_name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="pp-info">
                  <div className="pp-line">
                    <strong>{m.character_name}</strong>
                    <span className="pp-sub">
                      {[m.character_class, `nivel ${level}`].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  <div className="pp-meter" aria-label={`Vida: ${cur} de ${max}`}>
                    <span className={`pp-hp ${low ? 'is-low' : ''}`} style={{ width: `${hpPct}%` }} />
                  </div>
                  <div className="pp-line pp-nums">
                    <span>{cur === 0 ? 'Caído' : `${cur}/${max} PV`}</span>
                    <span>{next ? `${xp} / ${next} XP` : `${xp} XP · nivel máximo`}</span>
                  </div>
                  <div className="pp-meter pp-meter-xp" aria-label={`Experiencia hacia el nivel ${level + 1}`}>
                    <span className="pp-xp" style={{ width: `${Math.max(0, xpPct)}%` }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
