import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { SUBCLASSES } from '../../content/subclasses';
import {
  ABILITY_LABEL,
  applyAbilityIncreases,
  needsSubclass,
  type Ability,
  type AbilityIncrease,
} from '../../lib/level-up';
import type { SpellEntry } from '../../lib/types';
import { SpellPicker } from './SpellPicker';

export interface LevelUpSheet {
  id: string;
  character_class: string | null;
  level: number;
  subclass: string | null;
  pending_asi: number;
  pending_spells: number;
  scores: Record<Ability, number>;
  spells: SpellEntry[];
}

const ABILITIES: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

interface AsiChoice {
  /** 'one': +2 a una característica. 'two': +1 a dos características distintas. */
  mode: 'one' | 'two';
  a: Ability;
  b: Ability;
}

/**
 * Elecciones pendientes por subida de nivel: subclase, mejoras de característica y conjuros nuevos.
 * Se muestra en la ficha del propio personaje. Si no hay nada pendiente, no muestra nada.
 */
export const LevelUpPanel = ({ sheet, onSaved }: { sheet: LevelUpSheet; onSaved: () => void }) => {
  const needSub = needsSubclass(sheet.character_class, sheet.level, sheet.subclass);
  const subSet = SUBCLASSES[sheet.character_class ?? ''];
  const [subclass, setSubclass] = useState('');
  const [asi, setAsi] = useState<AsiChoice[]>(() =>
    Array.from({ length: sheet.pending_asi }, () => ({ mode: 'one' as const, a: 'str' as Ability, b: 'dex' as Ability })),
  );
  const [newSpells, setNewSpells] = useState<SpellEntry[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!needSub && sheet.pending_asi === 0 && sheet.pending_spells === 0) return null;

  const updateAsi = (i: number, patch: Partial<AsiChoice>) =>
    setAsi((list) => list.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  const save = async () => {
    setError('');
    if (needSub && !subclass) {
      setError('Elegí la subclase antes de guardar.');
      return;
    }
    if (sheet.pending_spells > 0 && newSpells.length !== sheet.pending_spells) {
      setError(`Elegí exactamente ${sheet.pending_spells} conjuros nuevos (llevás ${newSpells.length}).`);
      return;
    }

    let scores = sheet.scores;
    if (sheet.pending_asi > 0) {
      const increases: AbilityIncrease[] = asi.flatMap((c): AbilityIncrease[] =>
        c.mode === 'one'
          ? [{ ability: c.a, amount: 2 as const }]
          : [
              { ability: c.a, amount: 1 as const },
              { ability: c.b, amount: 1 as const },
            ],
      );
      const res = applyAbilityIncreases(sheet.scores, increases, sheet.pending_asi);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      scores = res.scores;
    }

    const patch: Record<string, unknown> = {
      pending_asi: 0,
      pending_spells: 0,
      str: scores.str,
      dex: scores.dex,
      con: scores.con,
      int: scores.int,
      wis: scores.wis,
      cha: scores.cha,
    };
    if (needSub) patch.subclass = subclass;
    if (newSpells.length > 0) patch.spells = [...sheet.spells, ...newSpells];

    setSaving(true);
    const { error: err } = await supabase.from('characters').update(patch).eq('id', sheet.id);
    setSaving(false);
    if (err) {
      setError('No se pudo guardar. Probá de nuevo.');
      return;
    }
    onSaved();
  };

  return (
    <section className="lu" aria-labelledby="lu-title">
      <h3 id="lu-title">Subiste de nivel: elegí lo que te toca</h3>
      <p className="ps-panel-note">
        Lo que elijas se guarda en tu ficha. No se puede cambiar después salvo que el director lo permita.
      </p>

      {needSub && subSet && (
        <fieldset className="lu-block">
          <legend>
            {subSet.label}
            <span className="lu-hint"> · Elegila ahora. Define qué poderes tiene tu {sheet.character_class?.toLowerCase()}.</span>
          </legend>
          {subSet.options.map((opt) => (
            <label key={opt.name} className="lu-option">
              <input
                type="radio"
                name="subclass"
                checked={subclass === opt.name}
                onChange={() => setSubclass(opt.name)}
              />
              <span>
                <strong>{opt.name}</strong>
                <span className="lu-hint"> — {opt.summary}</span>
              </span>
            </label>
          ))}
        </fieldset>
      )}

      {sheet.pending_asi > 0 && (
        <fieldset className="lu-block">
          <legend>Mejoras de característica</legend>
          <p className="lu-hint">
            Cada mejora reparte 2 puntos. Podés sumar +2 a una característica, o +1 a dos. Ninguna puede pasar de 20.
          </p>
          {asi.map((choice, i) => (
            <div key={i} className="lu-asi">
              <p className="lu-asi-title">Mejora {i + 1} de {sheet.pending_asi}</p>
              <div className="lu-row">
                <label>
                  <input
                    type="radio"
                    name={`asi-${i}`}
                    checked={choice.mode === 'one'}
                    onChange={() => updateAsi(i, { mode: 'one' })}
                  />
                  +2 a una
                </label>
                <label>
                  <input
                    type="radio"
                    name={`asi-${i}`}
                    checked={choice.mode === 'two'}
                    onChange={() => updateAsi(i, { mode: 'two' })}
                  />
                  +1 a dos
                </label>
              </div>
              <div className="lu-row">
                <select className="cf-input" value={choice.a} onChange={(e) => updateAsi(i, { a: e.target.value as Ability })} aria-label={`Característica ${i + 1}`}>
                  {ABILITIES.map((ab) => (
                    <option key={ab} value={ab}>
                      {ABILITY_LABEL[ab]} ({sheet.scores[ab]})
                    </option>
                  ))}
                </select>
                {choice.mode === 'two' && (
                  <select className="cf-input" value={choice.b} onChange={(e) => updateAsi(i, { b: e.target.value as Ability })} aria-label={`Segunda característica ${i + 1}`}>
                    {ABILITIES.map((ab) => (
                      <option key={ab} value={ab}>
                        {ABILITY_LABEL[ab]} ({sheet.scores[ab]})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </fieldset>
      )}

      {sheet.pending_spells > 0 && (
        <fieldset className="lu-block">
          <legend>Conjuros nuevos</legend>
          <p className="lu-hint">Elegí {sheet.pending_spells} conjuros nuevos de tu clase y de tu nivel.</p>
          <SpellPicker
            characterClass={sheet.character_class ?? ''}
            characterLevel={sheet.level}
            selected={newSpells}
            onChange={setNewSpells}
            limit={sheet.pending_spells}
            exclude={sheet.spells.map((s) => s.name)}
            minLevel={1}
          />
        </fieldset>
      )}

      {error && <p className="lu-error" role="alert">{error}</p>}
      <button className="ps-btn ps-btn-primary" onClick={save} disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar elecciones'}
      </button>
    </section>
  );
};
