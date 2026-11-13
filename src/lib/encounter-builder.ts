// Advanced encounter building and difficulty calculation

export interface EncounterEnemy {
  name: string;
  cr: number;
  hp: number;
  ac: number;
  quantity: number;
}

export interface PartyMember {
  name: string;
  level: number;
}

export interface EncounterDifficulty {
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Deadly';
  adjustedXP: number;
  totalXP: number;
  partyXP: number;
  difficultyRating: number;
}

// XP thresholds per character (by level)
const XP_THRESHOLDS_BY_LEVEL: Record<number, Record<string, number>> = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
  11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
};

// XP awards for CR
const XP_BY_CR: Record<number, number> = {
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

// Multiplier for multiple enemies
export function getEncounterMultiplier(enemyCount: number): number {
  if (enemyCount === 1) return 1;
  if (enemyCount === 2) return 1.5;
  if (enemyCount <= 6) return 2;
  if (enemyCount <= 10) return 2.5;
  if (enemyCount <= 14) return 3;
  return 4;
}

// Calculate party XP threshold
export function getPartyXPThreshold(
  party: PartyMember[],
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly'
): number {
  return party.reduce((total, member) => {
    const level = Math.max(1, Math.min(20, member.level));
    const thresholds = XP_THRESHOLDS_BY_LEVEL[level] || XP_THRESHOLDS_BY_LEVEL[20];
    return total + thresholds[difficulty];
  }, 0);
}

// Calculate XP for an encounter
export function getEncounterXP(enemies: EncounterEnemy[]): number {
  let totalXP = 0;
  let totalEnemies = 0;

  enemies.forEach((enemy) => {
    const crXP = XP_BY_CR[enemy.cr] || 0;
    totalXP += crXP * enemy.quantity;
    totalEnemies += enemy.quantity;
  });

  const multiplier = getEncounterMultiplier(totalEnemies);
  return Math.floor(totalXP * multiplier);
}

// Calculate encounter difficulty
export function calculateEncounterDifficulty(
  enemies: EncounterEnemy[],
  party: PartyMember[]
): EncounterDifficulty {
  const totalXP = getEncounterXP(enemies);
  const baseXP = enemies.reduce((sum, e) => {
    return sum + (XP_BY_CR[e.cr] || 0) * e.quantity;
  }, 0);

  const easyThreshold = getPartyXPThreshold(party, 'easy');
  const mediumThreshold = getPartyXPThreshold(party, 'medium');
  const hardThreshold = getPartyXPThreshold(party, 'hard');
  const deadlyThreshold = getPartyXPThreshold(party, 'deadly');

  let difficulty: 'Easy' | 'Medium' | 'Hard' | 'Deadly' = 'Easy';
  let difficultyRating = 0;

  if (totalXP <= easyThreshold) {
    difficulty = 'Easy';
    difficultyRating = totalXP / easyThreshold;
  } else if (totalXP <= mediumThreshold) {
    difficulty = 'Medium';
    difficultyRating = totalXP / mediumThreshold;
  } else if (totalXP <= hardThreshold) {
    difficulty = 'Hard';
    difficultyRating = totalXP / hardThreshold;
  } else {
    difficulty = 'Deadly';
    difficultyRating = totalXP / deadlyThreshold;
  }

  return {
    difficulty,
    adjustedXP: totalXP,
    totalXP: baseXP,
    partyXP: party.length * 200,
    difficultyRating: Math.round(difficultyRating * 100) / 100,
  };
}

// Get suggested CR for a party
export function suggestCRForParty(party: PartyMember[]): number {
  const averageLevel = party.reduce((sum, m) => sum + m.level, 0) / party.length;
  return Math.round(averageLevel - 1);
}

// Scale encounter difficulty up or down
export function scaleEncounter(
  enemies: EncounterEnemy[],
  direction: 'up' | 'down'
): EncounterEnemy[] {
  if (direction === 'up') {
    return enemies.map((enemy) => ({
      ...enemy,
      quantity: Math.ceil(enemy.quantity * 1.5),
    }));
  } else {
    return enemies.map((enemy) => ({
      ...enemy,
      quantity: Math.max(1, Math.floor(enemy.quantity * 0.75)),
    }));
  }
}

// Generate balanced random encounter
export function generateRandomEncounter(
  party: PartyMember[],
  targetDifficulty: 'easy' | 'medium' | 'hard' | 'deadly',
  availableCRs: number[] = [0.5, 1, 2, 3, 5, 8, 10]
): EncounterEnemy[] {
  const suggestedCR = suggestCRForParty(party);
  const targetXP = getPartyXPThreshold(party, targetDifficulty);
  const multiplier = getEncounterMultiplier(party.length);

  const enemies: EncounterEnemy[] = [];
  let currentXP = 0;

  // Pick random creatures and quantities
  for (let i = 0; i < 3; i++) {
    const cr = availableCRs[Math.floor(Math.random() * availableCRs.length)] || suggestedCR;
    const crXP = XP_BY_CR[cr] || 200;
    const maxQuantity = Math.max(1, Math.floor((targetXP - currentXP) / (crXP * multiplier)));

    if (maxQuantity > 0) {
      const quantity = Math.floor(Math.random() * Math.min(maxQuantity, 6)) + 1;
      enemies.push({
        name: `Enemy ${i + 1}`,
        cr,
        hp: 10 + cr * 10,
        ac: 10 + Math.floor(cr / 2),
        quantity,
      });
      currentXP += crXP * quantity;
    }
  }

  return enemies;
}

// Get difficulty color
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Easy':
      return '#4ade80';
    case 'Medium':
      return '#fbbf24';
    case 'Hard':
      return '#f97316';
    case 'Deadly':
      return '#ef4444';
    default:
      return '#999';
  }
}
