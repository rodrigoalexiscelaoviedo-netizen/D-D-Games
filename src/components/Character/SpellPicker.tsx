import { useMemo, useState } from 'react';
import type { SpellEntry } from '../../lib/types';
import { FULL_CASTER_CLASSES, fullCasterSlots, spellsForClass, type CatalogSpell } from '../../lib/spell-catalog';

interface Props {
  characterClass: string;
  characterLevel: number;
  selected: SpellEntry[];
  onChange: (next: SpellEntry[]) => void;
}

const levelLabel = (level: number) => (level === 0 ? 'Truco' : `Nivel ${level}`);

/**
 * Elige conjuros del SRD para la clase y el nivel del personaje.
 * Lanzadores completos solo ven los conjuros que pueden lanzar con su nivel actual.
 * Los nombres y descripciones quedan en inglés, como en el SRD.
 */
export const SpellPicker = ({ characterClass, characterLevel, selected, onChange }: Props) => {
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const isFull = FULL_CASTER_CLASSES.has(characterClass);
  const maxLevel = isFull
    ? Math.max(...Object.keys(fullCasterSlots(characterLevel)).map(Number))
    : 9;

  const available = useMemo(
    () => (characterClass ? spellsForClass(characterClass, maxLevel) : []),
    [characterClass, maxLevel],
  );

  if (!characterClass) {
    return <p className="cf-hint">Elegí una clase en el paso anterior para ver sus conjuros.</p>;
  }
  if (available.length === 0) {
    return <p className="cf-hint">La clase {characterClass} no tiene conjuros en el SRD.</p>;
  }

  const selectedNames = new Set(selected.map((s) => s.name));
  const q = query.trim().toLowerCase();
  const shown = available.filter(
    (s) =>
      (levelFilter === 'all' || s.level === levelFilter) &&
      (!q || s.name.toLowerCase().includes(q)),
  );

  const toggle = (spell: CatalogSpell) => {
    if (selectedNames.has(spell.name)) {
      onChange(selected.filter((s) => s.name !== spell.name));
    } else {
      onChange([...selected, { name: spell.name, level: spell.level, slug: spell.slug }]);
    }
  };

  // Entradas que no están en el catálogo (texto libre de versiones anteriores).
  const catalogNames = new Set(available.map((s) => s.name));
  const otherEntries = selected.filter((s) => !catalogNames.has(s.name));

  const levels = Array.from({ length: maxLevel + 1 }, (_, i) => i);

  return (
    <div className="spell-picker">
      <p className="cf-hint">
        {isFull
          ? `Hasta nivel de conjuro ${maxLevel} según tu nivel ${characterLevel}.`
          : 'Elegí los conjuros que tu personaje conoce o prepara.'}{' '}
        Elegidos: {selected.length}. Los trucos (Truco) no gastan espacios; los de nivel 1 o más gastan un espacio de su nivel cada vez que se lanzan.
      </p>

      <div className="spell-picker-controls">
        <input
          className="cf-input"
          placeholder="Buscar conjuro"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar conjuro"
        />
        <select
          className="cf-input"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          aria-label="Filtrar por nivel"
        >
          <option value="all">Todos los niveles</option>
          {levels.map((l) => (
            <option key={l} value={l}>
              {levelLabel(l)}
            </option>
          ))}
        </select>
      </div>

      {otherEntries.length > 0 && (
        <div className="spell-picker-other">
          <span className="cf-hint">Otros (texto libre):</span>
          {otherEntries.map((s) => (
            <button
              key={s.name}
              type="button"
              className="cf-chip is-on"
              onClick={() => onChange(selected.filter((x) => x.name !== s.name))}
              aria-label={`Quitar ${s.name}`}
            >
              {s.name} ✕
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="cf-hint">No hay conjuros con ese filtro.</p>
      ) : (
        <ul className="spell-picker-list">
          {shown.map((spell) => {
            const on = selectedNames.has(spell.name);
            const open = openSlug === spell.slug;
            return (
              <li key={spell.slug} className={`spell-picker-item ${on ? 'is-on' : ''}`}>
                <div className="spell-picker-row">
                  <button
                    type="button"
                    className={`cf-chip ${on ? 'is-on' : ''}`}
                    aria-pressed={on}
                    onClick={() => toggle(spell)}
                  >
                    {on ? '✓ ' : ''}
                    {spell.name}
                  </button>
                  <span className="cf-hint">
                    {levelLabel(spell.level)} · {spell.school} · {spell.castingTime}
                    {spell.concentration ? ' · Concentración' : ''}
                  </span>
                  <button
                    type="button"
                    className="cf-btn cf-btn-ghost"
                    aria-expanded={open}
                    onClick={() => setOpenSlug(open ? null : spell.slug)}
                  >
                    {open ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
                {open && (
                  <div className="spell-picker-detail">
                    <p>
                      <strong>Alcance:</strong> {spell.range} · <strong>Duración:</strong> {spell.duration} ·{' '}
                      <strong>Componentes:</strong> {spell.components}
                      {spell.material ? ` (${spell.material})` : ''}
                    </p>
                    <p>{spell.desc}</p>
                    {spell.higherLevel && <p>
                      <strong>A niveles superiores:</strong> {spell.higherLevel}
                    </p>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
