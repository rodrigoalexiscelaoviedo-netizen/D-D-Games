import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { xpForNextLevel } from '../../lib/combat-return';
import type { SpellEntry } from '../../lib/types';
import { LevelUpPanel } from '../Character/LevelUpPanel';
import { hasSpellSlots } from '../../lib/spell-catalog';

interface Sheet {
  id: string;
  character_name: string;
  race: string | null;
  character_class: string | null;
  level: number | null;
  xp: number | null;
  hp_current: number | null;
  hp_max: number | null;
  armor_class: number | null;
  speed: number | null;
  str: number | null;
  dex: number | null;
  con: number | null;
  int: number | null;
  wis: number | null;
  cha: number | null;
  spell_slots: Record<string, number> | null;
  inventory: Array<{ name?: string }> | null;
  portrait_url: string | null;
  subclass: string | null;
  pending_asi: number | null;
  pending_spells: number | null;
  spells: SpellEntry[] | null;
}

// Clases que usan espacios de conjuro (igual que en el combate).

const mod = (score: number | null) => (score == null ? '—' : `${Math.floor((score - 10) / 2) >= 0 ? '+' : ''}${Math.floor((score - 10) / 2)}`);

/** Ficha del propio personaje, para consultar durante la partida. Solo lectura. */
export const PlayerSheet = ({ playthroughId }: { playthroughId: string }) => {
  const { user } = useAuth();
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    (async () => {
      // El personaje es el que la persona eligió en el lobby (fila del participante).
      const { data: me } = await supabase
        .from('playthrough_participants')
        .select('character_id, playthrough_id')
        .eq('playthrough_id', playthroughId)
        .eq('user_id', user.id)
        .not('character_id', 'is', null)
        .limit(1)
        .maybeSingle();
      const { data } = me?.character_id
        ? await supabase
            .from('characters')
            .select('id, character_name, race, character_class, level, xp, hp_current, hp_max, armor_class, speed, str, dex, con, int, wis, cha, spell_slots, inventory, portrait_url, subclass, pending_asi, pending_spells, spells')
            .eq('id', me.character_id)
            .maybeSingle()
        : { data: null };
      if (alive) {
        setSheet((data as Sheet) ?? null);
        setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [playthroughId, user?.id, reloadKey]);

  if (!loaded) return <p className="ps-panel-note">Cargando tu ficha…</p>;
  if (!sheet) {
    return (
      <section className="ps-sheet">
        <p className="ps-panel-note">No tenés un personaje asignado en esta campaña. Pedile al director que te asigne uno en el lobby.</p>
      </section>
    );
  }

  const level = Math.max(1, sheet.level ?? 1);
  const xp = sheet.xp ?? 0;
  const next = xpForNextLevel(level);
  const hp = Math.max(0, sheet.hp_current ?? 0);
  const hpMax = sheet.hp_max ?? 0;
  const slots = sheet.spell_slots ?? {};
  const items = (sheet.inventory ?? []).map((i) => i?.name).filter(Boolean) as string[];

  return (
    <section className="ps-sheet" aria-labelledby="ps-sheet-title">
      <header className="ps-sheet-head">
        {sheet.portrait_url ? (
          <img className="ps-sheet-portrait" src={sheet.portrait_url} alt="" />
        ) : (
          <span className="ps-sheet-portrait ps-sheet-initial" aria-hidden="true">
            {sheet.character_name.charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <p className="ps-eyebrow">Tu personaje</p>
          <h2 id="ps-sheet-title">{sheet.character_name}</h2>
          <p className="ps-panel-note">
            {[sheet.race, sheet.character_class, sheet.subclass, `nivel ${level}`].filter(Boolean).join(' · ')}
          </p>
        </div>
      </header>

      <LevelUpPanel
        sheet={{
          id: sheet.id,
          character_class: sheet.character_class,
          level,
          subclass: sheet.subclass,
          pending_asi: sheet.pending_asi ?? 0,
          pending_spells: sheet.pending_spells ?? 0,
          scores: {
            str: sheet.str ?? 10,
            dex: sheet.dex ?? 10,
            con: sheet.con ?? 10,
            int: sheet.int ?? 10,
            wis: sheet.wis ?? 10,
            cha: sheet.cha ?? 10,
          },
          spells: sheet.spells ?? [],
        }}
        onSaved={() => setReloadKey((k) => k + 1)}
      />

      <div className="ps-sheet-stats">
        <div className="ps-sheet-stat">
          <span>Vida</span>
          <strong>{hp} / {hpMax}</strong>
          <div className="ps-sheet-bar" aria-hidden="true">
            <span style={{ width: `${hpMax > 0 ? Math.min(100, (hp / hpMax) * 100) : 0}%` }} />
          </div>
        </div>
        <div className="ps-sheet-stat">
          <span>Armadura (CA)</span>
          <strong>{sheet.armor_class ?? '—'}</strong>
          <small>Cuánto cuesta acertarte</small>
        </div>
        <div className="ps-sheet-stat">
          <span>Velocidad</span>
          <strong>{sheet.speed ?? 30} pies</strong>
          <small>{Math.floor((sheet.speed ?? 30) / 5)} casillas por turno</small>
        </div>
        <div className="ps-sheet-stat">
          <span>Experiencia</span>
          <strong>{xp}{next ? ` / ${next}` : ''}</strong>
          <small>{next ? 'Para el siguiente nivel' : 'Nivel máximo'}</small>
        </div>
      </div>

      <div className="ps-sheet-block">
        <h3>Atributos</h3>
        <ul className="ps-sheet-abilities">
          {[
            ['Fuerza', sheet.str],
            ['Destreza', sheet.dex],
            ['Constitución', sheet.con],
            ['Inteligencia', sheet.int],
            ['Sabiduría', sheet.wis],
            ['Carisma', sheet.cha],
          ].map(([name, value]) => (
            <li key={name as string}>
              <span>{name}</span>
              <strong>{value ?? '—'}</strong>
              <small>{mod(value as number | null)}</small>
            </li>
          ))}
        </ul>
      </div>

      {hasSpellSlots(sheet.character_class, sheet.subclass) && (
        <div className="ps-sheet-block">
          <h3>Espacios de conjuro</h3>
          <p className="ps-panel-note">
            Nivel 1: {slots['1'] ?? 0} {slots['max1'] != null ? `de ${slots['max1']}` : ''}. Se recuperan con un descanso largo.
          </p>
        </div>
      )}

      <div className="ps-sheet-block">
        <h3>Equipo</h3>
        {items.length === 0 ? (
          <p className="ps-panel-note">Sin objetos. Pedile al director que te agregue equipo.</p>
        ) : (
          <ul className="ps-sheet-items">
            {items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
