import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { xpForNextLevel } from '../../lib/combat-return';
import { abilityMod, roll } from '../../lib/combat-engine';
import { hasSpellSlots, slotsFor } from '../../lib/spell-catalog';

interface Member {
  id: string;
  character_name: string;
  character_class?: string | null;
  subclass?: string | null;
  race?: string | null;
  level?: number | null;
  xp?: number | null;
  con?: number | null;
  hit_dice_left?: number | null;
  hp_current?: number | null;
  hp_max?: number | null;
  portrait_url?: string | null;
  spell_slots?: Record<string, number> | null;
}

// Dado de golpe por clase (5e).
const HIT_DIE: Record<string, number> = {
  'Bárbaro': 12,
  'Guerrero': 10, 'Paladín': 10, 'Explorador': 10,
  'Bardo': 8, 'Clérigo': 8, 'Druida': 8, 'Monje': 8, 'Pícaro': 8, 'Brujo': 8, 'Artificiero': 8,
  'Hechicero': 6, 'Mago': 6,
};

const hitDieOf = (cls?: string | null) => HIT_DIE[cls ?? ''] ?? 8;

/** Estado del grupo para el DM: vida, nivel, experiencia y descansos. */
export const PartyPanel = ({ campaignId }: { campaignId: string }) => {
  const [party, setParty] = useState<Member[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data } = await supabase
      .from('characters')
      .select('id, character_name, character_class, subclass, race, level, xp, con, hit_dice_left, hp_current, hp_max, portrait_url, spell_slots')
      .eq('campaign_id', campaignId)
      .order('character_name', { ascending: true });
    setParty((data ?? []) as Member[]);
  };

  useEffect(() => {
    void load();
  }, [campaignId]);

  // Descanso corto (5e): se gastan dados de golpe; cada uno cura su tirada + CON (mínimo 0).
  // Descanso largo (5e): vida completa, espacios de conjuro al máximo y vuelve la mitad de los dados de golpe.
  const rest = async (kind: 'short' | 'long') => {
    if (!party) return;
    setBusy(true);
    setMessage('');
    let failed = false;
    const lines: string[] = [];

    for (const m of party) {
      const level = Math.max(1, m.level ?? 1);
      const max = m.hp_max ?? 0;
      const cur0 = Math.max(0, m.hp_current ?? max);
      const diceLeft = m.hit_dice_left ?? level;
      const patch: Record<string, unknown> = {};

      if (kind === 'long') {
        patch.hp_current = max;
        patch.hit_dice_left = Math.min(level, diceLeft + Math.max(1, Math.floor(level / 2)));
        const slots = m.spell_slots ?? {};
        if (hasSpellSlots(m.character_class, m.subclass)) {
          // Lanzador: vuelven todos los espacios de su clase y nivel.
          const maxSlots = slotsFor(m.character_class ?? '', level, m.subclass);
          patch.spell_slots = { ...maxSlots, max1: maxSlots['1'] };
        } else if (typeof slots['max1'] === 'number') {
          patch.spell_slots = { ...slots, '1': slots['max1'] };
        }
        lines.push(`${m.character_name}: vida completa.`);
      } else {
        const die = hitDieOf(m.character_class);
        const con = abilityMod(m.con ?? 10);
        let hp = cur0;
        let dice = diceLeft;
        let spent = 0;
        let healed = 0;
        while (dice > 0 && hp < max) {
          const heal = Math.max(0, roll(die) + con);
          hp = Math.min(max, hp + heal);
          dice -= 1;
          spent += 1;
        }
        healed = hp - cur0; // lo que realmente se curó (no lo que tiraron los dados)
        if (spent === 0) {
          lines.push(`${m.character_name}: no necesita curarse o no le quedan dados.`);
          continue;
        }
        patch.hp_current = hp;
        patch.hit_dice_left = dice;
        lines.push(`${m.character_name}: gastó ${spent} dado${spent === 1 ? '' : 's'} de golpe y recuperó ${healed} PV.`);
      }

      if (Object.keys(patch).length === 0) continue;
      const { error } = await supabase.from('characters').update(patch).eq('id', m.id);
      if (error) failed = true;
    }

    await load();
    setBusy(false);
    setMessage(
      failed
        ? 'No se pudo actualizar a algún personaje.'
        : `${kind === 'long' ? 'Descanso largo' : 'Descanso corto'}. ${lines.join(' ')}`
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
            title="Una hora de pausa. Cada personaje gasta dados de golpe para curarse (tirada del dado + Constitución)."
          >
            Descanso corto
          </button>
          <button
            className="ps-btn ps-btn-ghost"
            onClick={() => rest('long')}
            disabled={busy || party.length === 0}
            title="Una noche entera. Recuperan toda la vida, los espacios de conjuro y la mitad de los dados de golpe."
          >
            Descanso largo
          </button>
        </div>
      </div>

      {message && <p className="pp-message" role="status">{message}</p>}

      <details className="pp-help">
        <summary>¿Para qué sirve cada dado? (guía para el DM)</summary>
        <ul>
          <li>
            <strong>d20 de los enemigos:</strong> cuando un enemigo ataca, tira un d20 y le suma su bonificador. Si llega a la CA de un
            personaje, le acierta. El combate lo tira la app; vos solo tocás “Continuar”.
          </li>
          <li>
            <strong>d20 de las pruebas:</strong> una prueba de habilidad (por ejemplo, Persuasión contra dificultad 12) se resuelve con
            un d20 más el bonificador del personaje. Si llega a la dificultad, lo logran.
          </li>
          <li>
            <strong>Dados de golpe:</strong> cada personaje tiene uno por nivel. El descanso corto los gasta para curarse; el largo
            devuelve la mitad.
          </li>
          <li>
            <strong>Iniciativa:</strong> al empezar el combate, cada uno tira un d20 con su Destreza para decidir el orden de turno.
          </li>
          <li>
            <strong>Tiradas de muerte:</strong> cuando alguien cae a 0 PV, en cada turno tira un d20. 10 o más es un éxito; tres éxitos
            lo estabilizan y tres fallos lo matan.
          </li>
        </ul>
        <p className="cs-hint">Ventaja y desventaja: tirás dos d20 y te quedás con el mayor o el menor. Detalle completo en el <a href="/manual" target="_blank" rel="noreferrer">manual</a>.</p>
      </details>

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
            const dice = m.hit_dice_left ?? level;
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
                    <span>{`Dados de golpe: ${dice} de ${level}`}</span>
                  </div>
                  <div className="pp-line pp-nums">
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
