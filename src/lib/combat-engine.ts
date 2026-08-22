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

export interface ClassAbility {
  name: string;
  kind: 'attack' | 'heal' | 'buff';
  description: string;
  damageDice?: number;
  bonusToHit?: number;
  healDice?: number;
  acBonus?: number;
}

export const CLASS_ABILITIES: Record<string, ClassAbility> = {
  'Guerrero': { name: 'Ataque poderoso', kind: 'attack', damageDice: 12, bonusToHit: -2, description: 'Más daño, menos precisión' },
  'Bárbaro': { name: 'Furia', kind: 'attack', damageDice: 12, bonusToHit: 2, description: 'Golpe salvaje' },
  'Pícaro': { name: 'Ataque furtivo', kind: 'attack', damageDice: 12, bonusToHit: 4, description: 'Apunta a los puntos débiles' },
  'Explorador': { name: 'Disparo certero', kind: 'attack', damageDice: 10, bonusToHit: 3, description: 'Tiro apuntado' },
  'Monje': { name: 'Ráfaga de golpes', kind: 'attack', damageDice: 10, bonusToHit: 3, description: 'Varios impactos seguidos' },
  'Paladín': { name: 'Castigo divino', kind: 'attack', damageDice: 12, bonusToHit: 2, description: 'Energía radiante' },
  'Mago': { name: 'Proyectil mágico', kind: 'attack', damageDice: 10, bonusToHit: 5, description: 'Casi nunca falla' },
  'Hechicero': { name: 'Rayo de fuego', kind: 'attack', damageDice: 10, bonusToHit: 4, description: 'Magia innata' },
  'Brujo': { name: 'Descarga arcana', kind: 'attack', damageDice: 10, bonusToHit: 4, description: 'Poder del pacto' },
  'Artificiero': { name: 'Artefacto', kind: 'attack', damageDice: 8, bonusToHit: 3, description: 'Invento explosivo' },
  'Clérigo': { name: 'Curar heridas', kind: 'heal', healDice: 8, description: 'Recupera PV propios' },
  'Bardo': { name: 'Inspiración', kind: 'buff', acBonus: 3, description: '+3 CA hasta su próximo turno' },
};

export const DEFAULT_ABILITY: ClassAbility = {
  name: 'Esfuerzo extra',
  kind: 'attack',
  damageDice: 10,
  bonusToHit: 2,
  description: 'Un golpe con todo lo que tiene',
};

export const getAbility = (className?: string): ClassAbility =>
  (className && CLASS_ABILITIES[className]) || DEFAULT_ABILITY;

export const skillCheck = (bonus: number, dc: number) => {
  const d20 = roll(20);
  const total = d20 + bonus;
  return {
    d20,
    bonus,
    total,
    dc,
    success: total >= dc,
    explanation: total >= dc
      ? `${d20} + ${bonus} = ${total}, contra dificultad ${dc}. Lo logra.`
      : `${d20} + ${bonus} = ${total}, contra dificultad ${dc}. Le faltaron ${dc - total}.`,
  };
};
