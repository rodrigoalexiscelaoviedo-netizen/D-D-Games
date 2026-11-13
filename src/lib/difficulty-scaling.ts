// Encounter difficulty and scaling system

export type DifficultyLevel = "trivial" | "easy" | "medium" | "hard" | "deadly" | "impossible";

export interface EncounterDifficulty {
  difficulty: DifficultyLevel;
  xpBudget: number;
  partyXPMultiplier: number;
  description: string;
  expectedSurvivalRate: number;
}

export interface ScalingOptions {
  partySize: number;
  averagePartyLevel: number;
  desiredDifficulty: DifficultyLevel;
  enemyCount: number;
  adjustForAction: boolean;
}

export interface ScaledEncounter {
  originalCreatures: string[];
  scaledCreatures: Array<{
    name: string;
    cr: number;
    hp: number;
    ac: number;
    count: number;
  }>;
  totalXP: number;
  difficulty: DifficultyLevel;
  recommendedAdjustments: string[];
}

export const DIFFICULTY_THRESHOLDS: Record<DifficultyLevel, EncounterDifficulty> = {
  trivial: {
    difficulty: "trivial",
    xpBudget: 0.25,
    partyXPMultiplier: 0.25,
    description: "No threat to the party",
    expectedSurvivalRate: 1.0,
  },
  easy: {
    difficulty: "easy",
    xpBudget: 0.5,
    partyXPMultiplier: 0.5,
    description: "Minimal threat, good for warmup",
    expectedSurvivalRate: 0.99,
  },
  medium: {
    difficulty: "medium",
    xpBudget: 1.0,
    partyXPMultiplier: 1.0,
    description: "Moderate threat, engaging combat",
    expectedSurvivalRate: 0.95,
  },
  hard: {
    difficulty: "hard",
    xpBudget: 1.5,
    partyXPMultiplier: 1.5,
    description: "Significant threat, requires strategy",
    expectedSurvivalRate: 0.5,
  },
  deadly: {
    difficulty: "deadly",
    xpBudget: 2.0,
    partyXPMultiplier: 2.0,
    description: "Extreme threat, potential for death",
    expectedSurvivalRate: 0.1,
  },
  impossible: {
    difficulty: "impossible",
    xpBudget: 3.0,
    partyXPMultiplier: 3.0,
    description: "Virtually unbeatable without special circumstances",
    expectedSurvivalRate: 0.01,
  },
};

export const XP_THRESHOLDS_BY_LEVEL: Record<number, Record<DifficultyLevel, number>> = {
  1: {
    trivial: 25,
    easy: 50,
    medium: 100,
    hard: 150,
    deadly: 200,
    impossible: 500,
  },
  2: {
    trivial: 50,
    easy: 100,
    medium: 200,
    hard: 300,
    deadly: 400,
    impossible: 1000,
  },
  3: {
    trivial: 75,
    easy: 150,
    medium: 300,
    hard: 450,
    deadly: 600,
    impossible: 1500,
  },
  4: {
    trivial: 125,
    easy: 250,
    medium: 500,
    hard: 750,
    deadly: 1000,
    impossible: 2500,
  },
  5: {
    trivial: 250,
    easy: 500,
    medium: 1000,
    hard: 1500,
    deadly: 2000,
    impossible: 5000,
  },
};

export function calculateEncounterDifficulty(
  partyXP: number,
  difficulty: DifficultyLevel,
  partySize: number
): EncounterDifficulty {
  const xpBudget =
    partyXP *
    DIFFICULTY_THRESHOLDS[difficulty].xpBudget *
    calculateMultiplierByPartySize(partySize);

  return {
    ...DIFFICULTY_THRESHOLDS[difficulty],
    xpBudget,
  };
}

export function calculateMultiplierByPartySize(size: number): number {
  const multipliers: Record<number, number> = {
    1: 1.0,
    2: 1.5,
    3: 2.5,
    4: 3.5,
    5: 4.0,
    6: 5.0,
  };

  return multipliers[Math.min(size, 6)] || 5.0;
}

export function scaleCR(
  baseCR: number,
  partyLevel: number,
  targetDifficulty: DifficultyLevel
): number {
  const crAdjustment = partyLevel - baseCR;
  const difficultyModifier = DIFFICULTY_THRESHOLDS[targetDifficulty].partyXPMultiplier;

  return Math.max(0, baseCR + crAdjustment * (difficultyModifier - 1));
}

export function scaleHP(
  baseHP: number,
  cr: number,
  newCR: number
): number {
  const crDifference = newCR - cr;
  const hpPerCR = Math.floor(baseHP / Math.max(1, cr));

  return baseHP + hpPerCR * crDifference;
}

export function getEncounterDescription(
  difficulty: DifficultyLevel,
  partySize: number
): string {
  const base = DIFFICULTY_THRESHOLDS[difficulty];
  const survivals = Math.round(base.expectedSurvivalRate * 100);

  return `${base.description} (${survivals}% expected survival rate for a party of ${partySize})`;
}

export function recommendScaling(
  originalDifficulty: DifficultyLevel,
  desiredDifficulty: DifficultyLevel
): string[] {
  const recommendations: string[] = [];

  if (originalDifficulty === desiredDifficulty) {
    recommendations.push("Encounter difficulty is already as desired");
    return recommendations;
  }

  if (desiredDifficulty === "easy" && originalDifficulty === "hard") {
    recommendations.push("Remove 1-2 weaker enemies");
    recommendations.push("Reduce enemy HP by 20%");
  }

  if (desiredDifficulty === "hard" && originalDifficulty === "medium") {
    recommendations.push("Add more enemies of lower CR");
    recommendations.push("Increase enemy AC by 1-2");
    recommendations.push("Give enemies advantageous terrain");
  }

  if (desiredDifficulty === "deadly" && originalDifficulty !== "deadly") {
    recommendations.push("Add a powerful boss creature");
    recommendations.push("Include reinforcements");
    recommendations.push("Use environmental hazards");
  }

  return recommendations;
}
