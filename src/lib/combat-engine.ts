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

export type RollMode = 'normal' | 'advantage' | 'disadvantage';

// Ventaja: se tiran dos d20 y se queda el mayor. Desventaja: el menor (regla de 5e).
const rollD20 = (mode: RollMode): number => {
  if (mode === 'normal') return roll(20);
  const a = roll(20);
  const b = roll(20);
  return mode === 'advantage' ? Math.max(a, b) : Math.min(a, b);
};

export const resolveAttack = (
  attackBonus: number,
  targetAC: number,
  damageDice: number,
  damageBonus: number = 0,
  mode: RollMode = 'normal'
): RollResult => {
  const d20 = rollD20(mode);
  const total = d20 + attackBonus;
  const fumble = d20 === 1;
  const critical = d20 === 20;
  const hit = critical || (!fumble && total >= targetAC);

  let damage = 0;
  if (hit) {
    const dmgRoll = roll(damageDice);
    // Un golpe que acierta hace al menos 1 de daño, aunque el modificador sea negativo.
    damage = Math.max(1, critical
      ? dmgRoll + roll(damageDice) + damageBonus
      : dmgRoll + damageBonus);
  }

  const modeNote = mode === 'disadvantage' ? ' (con desventaja)' : mode === 'advantage' ? ' (con ventaja)' : '';
  let explanation = '';
  if (fumble) {
    explanation = `Sacó 1 natural — falla automática, no importa la CA.`;
  } else if (critical) {
    explanation = `Sacó 20 natural — crítico. Se tira el dado de daño dos veces.`;
  } else if (hit) {
    explanation = `${d20} + ${attackBonus} de bonificador = ${total}, contra CA ${targetAC}${modeNote}. Alcanza, así que golpea.`;
  } else {
    explanation = `${d20} + ${attackBonus} de bonificador = ${total}, contra CA ${targetAC}${modeNote}. Le faltaron ${targetAC - total} puntos.`;
  }

  return { d20, bonus: attackBonus, total, targetAC, hit, critical, fumble, damage, explanation };
};

// Estado de muerte de un personaje, guardado en combat_participants.status:
// 'dying:S:F' (S éxitos, F fallos), 'stable' (inconsciente, estable), 'dead', o cualquier otro valor.
export interface DyingState {
  dying: boolean;
  successes: number;
  failures: number;
}

export const parseDying = (status?: string | null): DyingState => {
  const m = /^dying:(\d+):(\d+)$/.exec(status ?? '');
  if (m) return { dying: true, successes: Number(m[1]), failures: Number(m[2]) };
  return { dying: false, successes: 0, failures: 0 };
};

export const dyingStatus = (successes: number, failures: number): string =>
  `dying:${successes}:${failures}`;

/** Puede actuar en su turno: vivo y de pie, o cayendo (hace tiradas de muerte). */
export const canAct = (p: { hp_current: number; has_fled?: boolean | null; status?: string | null }): boolean => {
  if (p.has_fled || p.status === 'dead') return false;
  return p.hp_current > 0 || parseDying(p.status).dying;
};

export const nextAliveIndex = (
  participants: Array<{ hp_current: number; has_fled?: boolean | null; status?: string | null }>,
  fromIndex: number
): number => {
  const n = participants.length;
  for (let i = 1; i <= n; i++) {
    const idx = (fromIndex + i) % n;
    if (canAct(participants[idx])) return idx;
  }
  return -1;
};

export const isCombatOver = (
  participants: Array<{ is_player: boolean; hp_current: number; has_fled?: boolean | null; status?: string | null }>
) => {
  const playersAlive = participants.some((p) => p.is_player && canAct(p));
  const enemiesAlive = participants.some((p) => !p.is_player && p.hp_current > 0 && !p.has_fled);
  if (!enemiesAlive) return 'victory';
  if (!playersAlive) return 'defeat';
  return null;
};

/**
 * Qué le pasa a un objetivo cuando lo golpean (5e):
 * - Enemigo a 0 PV: muere.
 * - Personaje de pie a 0 PV: cae y empieza a morir.
 * - Personaje que ya cae: cada golpe suma un fallo (crítico: dos). Tres fallos, muerte.
 */
export const targetOutcome = (
  target: { is_player: boolean; hp_current: number; status?: string | null },
  result: { hit: boolean; damage: number; critical: boolean }
): { hp: number; status?: string } => {
  if (!result.hit) return { hp: target.hp_current };

  if (target.is_player && (target.hp_current <= 0 || parseDying(target.status).dying)) {
    const dy = parseDying(target.status);
    const failures = dy.failures + (result.critical ? 2 : 1);
    return { hp: 0, status: failures >= 3 ? 'dead' : dyingStatus(dy.successes, failures) };
  }

  const hp = Math.max(0, target.hp_current - result.damage);
  if (hp > 0) return { hp };
  return { hp: 0, status: target.is_player ? dyingStatus(0, 0) : 'dead' };
};

/** Resultado de una tirada de muerte al empezar el turno de quien cae. */
export const deathSave = (
  current: { hp_current: number; status?: string | null }
): { status: string; hp: number; text: string; d20: number } => {
  const dy = parseDying(current.status);
  const d20 = roll(20);
  let s = dy.successes;
  let f = dy.failures;
  let hp = current.hp_current;
  let text: string;

  if (d20 === 20) {
    hp = 1;
    text = 'se levanta con un 20 natural y vuelve a 1 PV';
    return { status: 'ready', hp, text, d20 };
  }
  if (d20 === 1) {
    f += 2;
    text = 'saca 1 natural: dos fallos';
  } else if (d20 >= 10) {
    s += 1;
    text = `saca ${d20}: un éxito`;
  } else {
    f += 1;
    text = `saca ${d20}: un fallo`;
  }

  if (f >= 3) return { status: 'dead', hp: 0, text: `${text}. Tres fallos: muere`, d20 };
  if (s >= 3) return { status: 'stable', hp: 0, text: `${text}. Tres éxitos: queda estable e inconsciente`, d20 };
  return { status: dyingStatus(s, f), hp: 0, text, d20 };
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
