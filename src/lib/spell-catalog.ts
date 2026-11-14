// Catálogo de conjuros SRD 5.1 (CC-BY-4.0, vía Open5e).
// Nombres de clase traducidos al español; las descripciones se mantienen en inglés.

import spellsJson from '../content/spells/srd-spells.json';

export interface CatalogSpell {
  slug: string;
  name: string;
  level: number; // 0 = truco
  school: string;
  castingTime: string;
  range: string;
  components: string;
  material: string | null;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  /** Clases que pueden preparar/lanzar este conjuro, en español. */
  classes: string[];
  desc: string;
  higherLevel: string | null;
}

/** Equivalencia de nombres de clase (inglés en el SRD → español en la app). */
export const CLASS_ES: Record<string, string> = {
  Bard: 'Bardo',
  Cleric: 'Clérigo',
  Druid: 'Druida',
  Paladin: 'Paladín',
  Ranger: 'Explorador',
  Sorcerer: 'Hechicero',
  Warlock: 'Brujo',
  Wizard: 'Mago',
  Artificer: 'Artificiero',
};

const toCatalogSpell = (raw: (typeof spellsJson)[number]): CatalogSpell => ({
  slug: raw.slug,
  name: raw.name,
  level: raw.level,
  school: raw.school,
  castingTime: raw.castingTime,
  range: raw.range,
  components: raw.components,
  material: raw.material ?? null,
  duration: raw.duration,
  concentration: raw.concentration,
  ritual: raw.ritual,
  classes: raw.classes.map((c) => CLASS_ES[c]).filter((c): c is string => Boolean(c)),
  desc: raw.desc,
  higherLevel: raw.higherLevel || null,
});

export const SPELL_CATALOG: CatalogSpell[] = spellsJson.map(toCatalogSpell);

/** Conjuros que puede aprender o preparar una clase (en español), por nivel. */
export function spellsForClass(className: string, maxLevel = 9): CatalogSpell[] {
  return SPELL_CATALOG.filter((s) => s.classes.includes(className) && s.level <= maxLevel);
}

/**
 * Espacios de conjuro de un lanzador completo (Mago, Clérigo, Hechicero, Bardo, Druida).
 * Índice 0 = nivel de conjuro 1. Valores 5e para niveles de personaje 1–20.
 */
const FULL_CASTER_SLOTS: number[][] = [
  [2],
  [3],
  [4, 2],
  [4, 3],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

/** Clases que tienen espacios de conjuro completos (en español, como se guardan en la ficha). */
export const FULL_CASTER_CLASSES = new Set(['Mago', 'Clérigo', 'Hechicero', 'Bardo', 'Druida']);

/**
 * Al subir de nivel, los espacios máximos crecen y los ya gastados se mantienen gastados.
 * `max1` guarda el máximo de nivel 1 (lo usa el combate para mostrar cuántos quedan).
 */
export function rescaleSlots(
  current: Record<string, number> | null | undefined,
  fromLevel: number,
  toLevel: number,
): Record<string, number> {
  const oldMax = fullCasterSlots(fromLevel);
  const newMax = fullCasterSlots(toLevel);
  const out: Record<string, number> = {};
  for (const key of Object.keys(newMax)) {
    const oldCount = oldMax[key] ?? 0;
    const cur = current?.[key];
    const used = Math.max(0, oldCount - (typeof cur === 'number' ? cur : oldCount));
    out[key] = Math.max(0, newMax[key] - used);
  }
  out['max1'] = newMax['1'] ?? 0;
  return out;
}

/** Espacios de conjuro máximos por nivel de conjuro (1–9) para un lanzador completo. */
export function fullCasterSlots(characterLevel: number): Record<string, number> {
  const lvl = Math.min(20, Math.max(1, Math.floor(characterLevel)));
  const row = FULL_CASTER_SLOTS[lvl - 1];
  const out: Record<string, number> = {};
  row.forEach((count, i) => {
    out[String(i + 1)] = count;
  });
  return out;
}

export type SpellCombatMode = 'attack' | 'heal' | 'narrative';

export interface SpellCombatProfile {
  /** attack: tirada de ataque y daño. heal: cura a quien lanza. narrative: sin cálculo automático. */
  mode: SpellCombatMode;
  /** Cantidad de dados de la primera expresión de dados de la descripción. */
  count: number;
  /** Caras del dado (la primera expresión de dados, por ejemplo 1d8 → 8). */
  sides: number;
  /** Alcance a distancia (no solo "Touch" o "Self"). */
  ranged: boolean;
}

/**
 * Interpreta un conjuro para el combate usando su descripción en inglés del SRD.
 * Es una aproximación: solo toma la primera expresión de dados y no maneja niveles superiores
 * ni tiradas de salvación (esos quedan como 'narrative').
 */
export function spellCombatProfile(spell: CatalogSpell): SpellCombatProfile {
  const m = /(\d+)d(\d+)/i.exec(spell.desc);
  const count = m ? Number(m[1]) : 0;
  const sides = m ? Number(m[2]) : 0;
  const ranged = !/touch|self/i.test(spell.range);
  const hasDice = Boolean(m);
  const usesSave = /saving throw/i.test(spell.desc);

  if (hasDice && /spell attack/i.test(spell.desc) && /damage/i.test(spell.desc)) {
    return { mode: 'attack', count, sides, ranged };
  }
  if (hasDice && !usesSave && !/damage/i.test(spell.desc) && /regains?|hit points/i.test(spell.desc)) {
    return { mode: 'heal', count, sides, ranged };
  }
  return { mode: 'narrative', count, sides, ranged };
}
