export interface RollResult {
  d20: number;
  bonus: number;
  total: number;
  targetAC: number;
  hit: boolean;
  critical: boolean;
  fumble: boolean;
  damage: number;
  explanation: string;
}

export const roll = (sides: number): number => Math.floor(Math.random() * sides) + 1;

export const abilityMod = (score?: number): number =>
  score == null ? 0 : Math.floor((score - 10) / 2);

export const rollInitiative = (dexterity: number) => {
  const d20 = roll(20);
  const bonus = abilityMod(dexterity);
  return { d20, bonus, total: d20 + bonus };
};

export const resolveAttack = (
  attackBonus: number,
  targetAC: number,
  damageDice: number,
  damageBonus: number = 0
): RollResult => {
  const d20 = roll(20);
  const total = d20 + attackBonus;
  const fumble = d20 === 1;
  const critical = d20 === 20;
  const hit = critical || (!fumble && total >= targetAC);

  let damage = 0;
  if (hit) {
    const dmgRoll = roll(damageDice);
    damage = critical
      ? dmgRoll + roll(damageDice) + damageBonus
      : dmgRoll + damageBonus;
  }

  let explanation = '';
  if (fumble) {
    explanation = `Sacó 1 natural — falla automática, no importa la CA.`;
  } else if (critical) {
    explanation = `Sacó 20 natural — crítico. Se tira el dado de daño dos veces.`;
  } else if (hit) {
    explanation = `${d20} + ${attackBonus} de bonificador = ${total}, contra CA ${targetAC}. Alcanza, así que golpea.`;
  } else {
    explanation = `${d20} + ${attackBonus} de bonificador = ${total}, contra CA ${targetAC}. Le faltaron ${targetAC - total} puntos.`;
  }

  return { d20, bonus: attackBonus, total, targetAC, hit, critical, fumble, damage, explanation };
};

export const nextAliveIndex = (
  participants: Array<{ hp_current: number }>,
  fromIndex: number
): number => {
  const n = participants.length;
  for (let i = 1; i <= n; i++) {
    const idx = (fromIndex + i) % n;
    if (participants[idx].hp_current > 0) return idx;
  }
  return -1;
};

export const isCombatOver = (participants: Array<{ is_player: boolean; hp_current: number }>) => {
  const playersAlive = participants.some((p) => p.is_player && p.hp_current > 0);
  const enemiesAlive = participants.some((p) => !p.is_player && p.hp_current > 0);
  if (!enemiesAlive) return 'victory';
  if (!playersAlive) return 'defeat';
  return null;
};
