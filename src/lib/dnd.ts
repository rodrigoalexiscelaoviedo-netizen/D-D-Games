export const abilityMod = (score?: number): number => {
  if (score == null) return 0;
  return Math.floor((score - 10) / 2);
};

export const fmtMod = (score?: number): string => {
  const m = abilityMod(score);
  return m >= 0 ? `+${m}` : `${m}`;
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
