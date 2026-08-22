import { RACIAL_BONUSES } from './d5e-data';
import type { RacialBonus } from './types';

export const abilityMod = (score?: number): number => {
  if (score == null) return 0;
  return Math.floor((score - 10) / 2);
};

export const fmtMod = (score?: number): string => {
  const m = abilityMod(score);
  return m >= 0 ? `+${m}` : `${m}`;
};

export const getRacialBonuses = (race?: string): RacialBonus | null => {
  if (!race) return null;
  return RACIAL_BONUSES.find(r => r.race === race) || null;
};

export const applyRacialBonuses = (
  race: string | undefined,
  stats: { str?: number; dex?: number; con?: number; int?: number; wis?: number; cha?: number }
) => {
  if (!race) return stats;
  const bonus = getRacialBonuses(race);
  if (!bonus) return stats;
  return {
    str: (stats.str ?? 10) + (bonus.str ?? 0),
    dex: (stats.dex ?? 10) + (bonus.dex ?? 0),
    con: (stats.con ?? 10) + (bonus.con ?? 0),
    int: (stats.int ?? 10) + (bonus.int ?? 0),
    wis: (stats.wis ?? 10) + (bonus.wis ?? 0),
    cha: (stats.cha ?? 10) + (bonus.cha ?? 0),
  };
};

export const SKILLS_5E = [
  'Acrobacias',
  'Atletismo',
  'C. Arcano',
  'Engaño',
  'Historia',
  'Interpretación',
  'Intimidación',
  'Investigación',
  'Juego de Manos',
  'Medicina',
  'Naturaleza',
  'Percepción',
  'Perspicacia',
  'Persuasión',
  'Religión',
  'Sigilo',
  'Supervivencia',
  'Trato con Animales',
];

export const CONDITIONS_5E = [
  'Agarrado',
  'Apresado',
  'Aturdido',
  'Cegado',
  'Derribado',
  'Encantado',
  'Ensordecido',
  'Envenenado',
  'Asustado',
  'Incapacitado',
  'Invisible',
  'Paralizado',
  'Petrificado',
  'Inconsciente',
];
