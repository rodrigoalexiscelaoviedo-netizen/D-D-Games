// Reglas de subida de nivel de 5e (hasta el nivel 20).
// Qué gana un personaje al pasar de un nivel a otro: mejoras de característica, subclase y conjuros nuevos.

import { SUBCLASSES } from '../content/subclasses';

export type Ability = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export const ABILITY_LABEL: Record<Ability, string> = {
  str: 'Fuerza',
  dex: 'Destreza',
  con: 'Constitución',
  int: 'Inteligencia',
  wis: 'Sabiduría',
  cha: 'Carisma',
};

/** Niveles en que se gana una mejora de característica (5e). */
export const ASI_LEVELS = [4, 8, 12, 16, 19];

/**
 * Conjuros conocidos por nivel de personaje (índice 0 = nivel 1), para los lanzadores que
 * aprenden conjuros en lugar de prepararlos.
 * Verificar contra el Manual del Jugador antes de publicar.
 */
const KNOWN_SPELLS: Record<string, number[]> = {
  Hechicero: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15],
  Bardo: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19],
  Brujo: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
  Explorador: [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
};

const knownAt = (cls: string, level: number): number => {
  const table = KNOWN_SPELLS[cls];
  if (!table) return 0;
  return table[Math.min(20, Math.max(1, level)) - 1] ?? 0;
};

export interface LevelGains {
  /** Cantidad de mejoras de característica ganadas (cada una es +2 repartible). */
  asi: number;
  /** Conjuros nuevos a elegir (solo lanzadores que los aprenden). */
  spells: number;
}

/**
 * Conjuros conocidos del Caballero místico por nivel de personaje (índice 0 = nivel 1).
 * Solo de Abjuración y Evocación (más dos de otra escuela, que la app no limita). Trucos no incluidos.
 * Verificar contra el Manual del Jugador antes de publicar.
 */
const KNIGHT_KNOWN = [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13];

export const knightKnownAt = (level: number): number => KNIGHT_KNOWN[Math.min(20, Math.max(1, level)) - 1] ?? 0;

/**
 * Lo que gana un personaje al subir de `from` a `to`.
 * El Mago suma 2 conjuros al libro por nivel; los lanzadores con lista de conjuros conocidos
 * suman la diferencia de la tabla. Los que preparan conjuros no aprenden nada al subir.
 */
export function levelUpGains(characterClass: string, from: number, to: number, subclass?: string | null): LevelGains {
  const asi = ASI_LEVELS.filter((l) => l > from && l <= to).length;
  let spells = 0;
  if (to > from) {
    if (characterClass === 'Mago') {
      spells = 2 * (to - from);
    } else if (characterClass === 'Guerrero' && subclass === 'Caballero místico') {
      spells = knightKnownAt(to) - knightKnownAt(from);
    } else if (KNOWN_SPELLS[characterClass]) {
      spells = knownAt(characterClass, to) - knownAt(characterClass, from);
    }
  }
  return { asi, spells: Math.max(0, spells) };
}

/** ¿Tiene que elegir subclase? Sí cuando llegó al nivel de elección y todavía no tiene una. */
export function needsSubclass(characterClass: string | null | undefined, level: number, subclass: string | null | undefined): boolean {
  const set = SUBCLASSES[characterClass ?? ''];
  return Boolean(set && !subclass && level >= set.level);
}

export interface AbilityIncrease {
  ability: Ability;
  /** Suma de este aumento: 1 o 2. */
  amount: 1 | 2;
}

/**
 * Aplica las mejoras de característica elegidas.
 * Reglas: la suma total tiene que ser 2 por cada mejora pendiente, cada aumento es de 1 o 2,
 * y ninguna característica puede pasar de 20.
 */
export function applyAbilityIncreases(
  scores: Record<Ability, number>,
  increases: AbilityIncrease[],
  pending: number,
): { ok: true; scores: Record<Ability, number> } | { ok: false; error: string } {
  const total = increases.reduce((sum, i) => sum + i.amount, 0);
  if (total !== pending * 2) {
    return { ok: false, error: `Tenés que repartir exactamente ${pending * 2} puntos (ahora son ${total}).` };
  }
  const next = { ...scores };
  for (const inc of increases) {
    next[inc.ability] = (next[inc.ability] ?? 10) + inc.amount;
    if (next[inc.ability] > 20) {
      return { ok: false, error: `${ABILITY_LABEL[inc.ability]} no puede pasar de 20.` };
    }
  }
  return { ok: true, scores: next };
}
