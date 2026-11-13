// Player progression and milestone tracking

export interface PlayerMilestone {
  id: string;
  characterId: string;
  title: string;
  description: string;
  type: "level-up" | "quest-complete" | "achievement" | "story" | "custom";
  importance: "minor" | "major" | "legendary";
  dateAchieved: Date;
  rewards?: {
    xp: number;
    gold: number;
    items: string[];
  };
  tags: string[];
}

export interface ProgressionStats {
  characterId: string;
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalMilestones: number;
  lastLevelUpDate: Date;
  averageLevelUpTime: number;
  totalPlaytime: number;
  deathCount: number;
  resurrectCount: number;
}

export interface CharacterJourney {
  characterId: string;
  characterName: string;
  birthDate: Date;
  deathDates: Date[];
  majorEvents: PlayerMilestone[];
  questsCompleted: string[];
  relationships: CharacterRelationship[];
}

export interface CharacterRelationship {
  characterId: string;
  otherCharacterId: string;
  type: "ally" | "enemy" | "romantic" | "mentor" | "apprentice" | "sibling" | "rival";
  history: string;
  favorLevel: number;
}

export function createMilestone(
  characterId: string,
  title: string,
  description: string,
  type: PlayerMilestone["type"],
  importance: PlayerMilestone["importance"]
): PlayerMilestone {
  return {
    id: `milestone_${Date.now()}`,
    characterId,
    title,
    description,
    type,
    importance,
    dateAchieved: new Date(),
    tags: [],
  };
}

export function createProgressionStats(
  characterId: string,
  level: number,
  xp: number
): ProgressionStats {
  return {
    characterId,
    currentLevel: level,
    currentXP: xp,
    xpToNextLevel: calculateXPToNextLevel(level, xp),
    totalMilestones: 0,
    lastLevelUpDate: new Date(),
    averageLevelUpTime: 0,
    totalPlaytime: 0,
    deathCount: 0,
    resurrectCount: 0,
  };
}

export function calculateXPToNextLevel(level: number, currentXP: number): number {
  const xpThresholds = [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000,
    120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
  ];

  if (level >= 20) return 0;
  return Math.max(0, xpThresholds[level + 1] - currentXP);
}

export function awardXP(
  stats: ProgressionStats,
  amount: number
): ProgressionStats {
  return {
    ...stats,
    currentXP: stats.currentXP + amount,
    xpToNextLevel: calculateXPToNextLevel(stats.currentLevel, stats.currentXP + amount),
  };
}

export function levelUp(stats: ProgressionStats): ProgressionStats {
  if (stats.currentLevel >= 20) {
    throw new Error("Character is already max level");
  }

  return {
    ...stats,
    currentLevel: stats.currentLevel + 1,
    lastLevelUpDate: new Date(),
  };
}

export function recordDeath(stats: ProgressionStats): ProgressionStats {
  return {
    ...stats,
    deathCount: stats.deathCount + 1,
  };
}

export function recordResurrection(stats: ProgressionStats): ProgressionStats {
  return {
    ...stats,
    resurrectCount: stats.resurrectCount + 1,
  };
}

export function createCharacterJourney(
  characterId: string,
  characterName: string
): CharacterJourney {
  return {
    characterId,
    characterName,
    birthDate: new Date(),
    deathDates: [],
    majorEvents: [],
    questsCompleted: [],
    relationships: [],
  };
}

export function addMajorEvent(
  journey: CharacterJourney,
  event: PlayerMilestone
): CharacterJourney {
  return {
    ...journey,
    majorEvents: [...journey.majorEvents, event],
  };
}

export function completeQuest(
  journey: CharacterJourney,
  questId: string
): CharacterJourney {
  return {
    ...journey,
    questsCompleted: [...journey.questsCompleted, questId],
  };
}

export function recordJourneyDeath(journey: CharacterJourney): CharacterJourney {
  return {
    ...journey,
    deathDates: [...journey.deathDates, new Date()],
  };
}

export function addRelationship(
  journey: CharacterJourney,
  otherCharacterId: string,
  type: CharacterRelationship["type"],
  history: string
): CharacterJourney {
  const relationship: CharacterRelationship = {
    characterId: journey.characterId,
    otherCharacterId,
    type,
    history,
    favorLevel: 0,
  };

  return {
    ...journey,
    relationships: [...journey.relationships, relationship],
  };
}

export function updateFavor(
  journey: CharacterJourney,
  otherCharacterId: string,
  amount: number
): CharacterJourney {
  return {
    ...journey,
    relationships: journey.relationships.map((r) =>
      r.otherCharacterId === otherCharacterId
        ? { ...r, favorLevel: Math.max(-100, Math.min(100, r.favorLevel + amount)) }
        : r
    ),
  };
}

export function getCharacterLegacy(journey: CharacterJourney): {
  legendaryDeeds: number;
  majorDeaths: number;
  importantRelationships: number;
  questsCompleted: number;
} {
  return {
    legendaryDeeds: journey.majorEvents.filter((e) => e.importance === "legendary").length,
    majorDeaths: journey.deathDates.length,
    importantRelationships: journey.relationships.filter((r) => r.favorLevel > 50).length,
    questsCompleted: journey.questsCompleted.length,
  };
}
