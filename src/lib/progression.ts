// Character progression and leveling system

export interface Experience {
  current_xp: number;
  next_level_xp: number;
  total_xp_earned: number;
}

export interface LevelUp {
  new_level: number;
  hp_gained: number;
  ability_score_increase?: boolean;
  new_features?: string[];
}

// XP thresholds for D&D 5e
export const XP_THRESHOLDS = [
  0,
  300,
  900,
  2700,
  6500,
  14000,
  23000,
  34000,
  48000,
  64000,
  85000,
  100000,
  120000,
  140000,
  165000,
  195000,
  225000,
  265000,
  305000,
  355000,
];

// D&D 5e proficiency bonus by level
export const PROFICIENCY_BY_LEVEL = [
  0,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  6,
  6,
  6,
];

// Calculate current level from XP
export function getLevelFromXP(totalXP: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= XP_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

// Get XP needed for next level
export function getXPForNextLevel(currentXP: number): number {
  const currentLevel = getLevelFromXP(currentXP);
  if (currentLevel >= 20) return 0;
  return XP_THRESHOLDS[currentLevel] - currentXP;
}

// Calculate proficiency bonus for a level
export function getProficiencyBonus(level: number): number {
  if (level < 1 || level > 20) return 2;
  return PROFICIENCY_BY_LEVEL[level - 1];
}

// Roll HP gain on level up (d8, d10, or d12 depending on class)
export function rollHPGain(dieType: 8 | 10 | 12 = 8, constitution: number = 10): number {
  const conModifier = Math.floor((constitution - 10) / 2);
  const roll = Math.floor(Math.random() * dieType) + 1;
  return Math.max(1, roll + conModifier);
}

// Process a level up
export function processLevelUp(
  currentLevel: number,
  constitution: number = 10
): LevelUp {
  const newLevel = currentLevel + 1;
  const hpGain = rollHPGain(8, constitution);
  const abilityIncrease = newLevel % 4 === 0 && newLevel <= 20;

  const features: string[] = [];

  // Add features based on level
  if (newLevel === 5) features.push('Extra Attack (if applicable)');
  if (newLevel === 6 || newLevel === 14) features.push('Ability Score Improvement');
  if (newLevel === 9) features.push('Indomitable (if Fighter)');
  if (newLevel === 11) features.push('+1 to damage rolls (if applicable)');

  return {
    new_level: newLevel,
    hp_gained: hpGain,
    ability_score_increase: abilityIncrease,
    new_features: features,
  };
}

// Add experience to a character
export function addExperience(
  currentXP: number,
  xpGain: number
): { currentXP: number; leveledUp: boolean; levels_gained: number } {
  const newXP = currentXP + xpGain;
  const oldLevel = getLevelFromXP(currentXP);
  const newLevel = getLevelFromXP(newXP);

  return {
    currentXP: newXP,
    leveledUp: newLevel > oldLevel,
    levels_gained: newLevel - oldLevel,
  };
}

// Calculate CR XP reward
export function getCRExperience(cr: number): number {
  const crExperiences: Record<number, number> = {
    0: 0,
    0.125: 25,
    0.25: 50,
    0.5: 100,
    1: 200,
    2: 450,
    3: 700,
    4: 1100,
    5: 1800,
    6: 2300,
    7: 2900,
    8: 3900,
    9: 5000,
    10: 5900,
    11: 7200,
    12: 8400,
    13: 10000,
    14: 11500,
    15: 13000,
    16: 15000,
    17: 18000,
    18: 20000,
    19: 22000,
    20: 25000,
  };

  return crExperiences[cr] || 0;
}

// Milestone leveling: simple level progression
export function milestoneLevel(
  currentLevel: number
): { new_level: number; hp_gain: number } {
  const newLevel = Math.min(currentLevel + 1, 20);
  const hpGain = 6 + Math.floor((newLevel - currentLevel) * 1.5);

  return {
    new_level: newLevel,
    hp_gain: hpGain,
  };
}

// Get milestone description for D&D 5e
export const MILESTONE_DESCRIPTIONS = [
  'Completing a major quest',
  'Defeating a significant enemy',
  'Discovering important lore or treasure',
  'Completing a story arc',
  'Major story progression',
  'Resolving a character conflict',
];

// Calculate multiclass support
export function calculateMulticlassSpellSlots(
  level1: number,
  level2: number,
  cantripsOnly: boolean = false
): number {
  if (cantripsOnly) return 1;

  // Simplified multiclass spell slot calculation
  const totalLevels = level1 + level2;
  const spellcasterLevel = Math.floor(totalLevels / 2) + 1;

  return Math.min(spellcasterLevel, 9);
}
