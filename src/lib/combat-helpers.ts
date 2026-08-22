export const rollD20 = (): number => Math.floor(Math.random() * 20) + 1;

export const rollDice = (sides: number): number => Math.floor(Math.random() * sides) + 1;

export const rollDamage = (dice: string): number => {
  const [numStr, sidesStr] = dice.split('d');
  const num = parseInt(numStr) || 1;
  const sides = parseInt(sidesStr);
  let total = 0;
  for (let i = 0; i < num; i++) {
    total += rollDice(sides);
  }
  return total;
};

export const calculateInitiative = (dexterity: number): number => {
  const dexMod = Math.floor((dexterity - 10) / 2);
  const roll = rollD20();
  return roll + dexMod;
};

export const isCritical = (roll: number): boolean => roll === 20;

export const isFail = (roll: number): boolean => roll === 1;

export const isHit = (roll: number, targetAC: number): boolean => roll >= targetAC;

export const calculateDamage = (
  baseDamage: number,
  isCrit: boolean,
  modifier: number = 0
): number => {
  const roll = rollDamage('d' + baseDamage);
  const modifiedRoll = roll + modifier;
  return isCrit ? modifiedRoll * 2 : modifiedRoll;
};
