// Achievement and badge system

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  requirement: number; // Progress needed to unlock
  reward?: { xp?: number; gold?: number };
  hidden?: boolean; // Don't show until unlocked
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  unlockedAt?: Date;
  isUnlocked: boolean;
}

export interface AchievementProgress {
  achievement: Achievement;
  progress: number;
  percentComplete: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

// Achievement definitions
export const ACHIEVEMENTS: Record<string, Achievement> = {
  'first-combat': {
    id: 'first-combat',
    name: 'Trial by Fire',
    description: 'Complete your first combat encounter',
    icon: '⚔️',
    rarity: 'common',
    requirement: 1,
    reward: { xp: 50 },
  },
  'first-level-up': {
    id: 'first-level-up',
    name: 'Leveling Up',
    description: 'Reach level 2',
    icon: '📈',
    rarity: 'common',
    requirement: 1,
    reward: { xp: 100 },
  },
  'first-spell': {
    id: 'first-spell',
    name: 'Spellcaster',
    description: 'Cast your first spell',
    icon: '✨',
    rarity: 'uncommon',
    requirement: 1,
    reward: { xp: 75 },
  },
  'critical-strike': {
    id: 'critical-strike',
    name: 'Critical Success',
    description: 'Land 10 critical hits',
    icon: '💥',
    rarity: 'uncommon',
    requirement: 10,
    reward: { xp: 150 },
  },
  'dragon-slayer': {
    id: 'dragon-slayer',
    name: 'Dragon Slayer',
    description: 'Defeat 5 dragons',
    icon: '🐉',
    rarity: 'epic',
    requirement: 5,
    reward: { xp: 500, gold: 1000 },
  },
  'master-of-magic': {
    id: 'master-of-magic',
    name: 'Master of Magic',
    description: 'Cast 50 spells',
    icon: '🧙',
    rarity: 'rare',
    requirement: 50,
    reward: { xp: 300 },
  },
  'treasure-hunter': {
    id: 'treasure-hunter',
    name: 'Treasure Hunter',
    description: 'Find 100 loot items',
    icon: '💰',
    rarity: 'rare',
    requirement: 100,
    reward: { gold: 500 },
  },
  'party-leader': {
    id: 'party-leader',
    name: 'Party Leader',
    description: 'Create 5 campaigns',
    icon: '👑',
    rarity: 'rare',
    requirement: 5,
    reward: { xp: 200 },
  },
  'legendary-hero': {
    id: 'legendary-hero',
    name: 'Legendary Hero',
    description: 'Reach level 20',
    icon: '⭐',
    rarity: 'legendary',
    requirement: 1,
    reward: { xp: 1000, gold: 5000 },
  },
  'speedrunner': {
    id: 'speedrunner',
    name: 'Speedrunner',
    description: 'Complete combat in under 3 minutes',
    icon: '🏃',
    rarity: 'uncommon',
    requirement: 1,
    reward: { xp: 100 },
  },
  'survivalist': {
    id: 'survivalist',
    name: 'Survivalist',
    description: 'Survive 20 combats at low health',
    icon: '💪',
    rarity: 'rare',
    requirement: 20,
    reward: { xp: 250 },
  },
  'collector': {
    id: 'collector',
    name: 'Collector',
    description: 'Obtain 50 unique items',
    icon: '📦',
    rarity: 'uncommon',
    requirement: 50,
    reward: { xp: 150 },
  },
  'social-butterfly': {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Join 5 leagues',
    icon: '🦋',
    rarity: 'uncommon',
    requirement: 5,
    reward: { xp: 100 },
  },
  'perfect-roll': {
    id: 'perfect-roll',
    name: 'Perfect Roll',
    description: 'Roll a natural 20',
    icon: '🎲',
    rarity: 'rare',
    requirement: 1,
    reward: { xp: 50 },
  },
};

// Create user achievement
export function createUserAchievement(
  userId: string,
  achievementId: string
): UserAchievement {
  return {
    id: `achievement_${Date.now()}`,
    userId,
    achievementId,
    progress: 0,
    isUnlocked: false,
  };
}

// Update achievement progress
export function updateProgress(
  userAchievement: UserAchievement,
  achievement: Achievement,
  amount: number = 1
): UserAchievement {
  const newProgress = Math.min(
    userAchievement.progress + amount,
    achievement.requirement
  );

  const isNowUnlocked =
    newProgress >= achievement.requirement && !userAchievement.isUnlocked;

  return {
    ...userAchievement,
    progress: newProgress,
    isUnlocked: isNowUnlocked || userAchievement.isUnlocked,
    unlockedAt: isNowUnlocked ? new Date() : userAchievement.unlockedAt,
  };
}

// Get achievement progress
export function getAchievementProgress(
  userAchievement: UserAchievement,
  achievement: Achievement
): AchievementProgress {
  const percentComplete = Math.min(
    (userAchievement.progress / achievement.requirement) * 100,
    100
  );

  return {
    achievement,
    progress: userAchievement.progress,
    percentComplete,
    isUnlocked: userAchievement.isUnlocked,
    unlockedAt: userAchievement.unlockedAt,
  };
}

// Get all achievements for user
export function getUserAchievements(
  userAchievements: UserAchievement[]
): AchievementProgress[] {
  return userAchievements
    .map((ua) => {
      const achievement = ACHIEVEMENTS[ua.achievementId];
      if (!achievement) return null;
      return getAchievementProgress(ua, achievement);
    })
    .filter((ap) => ap !== null) as AchievementProgress[];
}

// Get unlocked achievements
export function getUnlockedAchievements(
  userAchievements: UserAchievement[]
): AchievementProgress[] {
  return getUserAchievements(userAchievements).filter((ap) => ap.isUnlocked);
}

// Get achievement stats
export function getAchievementStats(userAchievements: UserAchievement[]): {
  total: number;
  unlocked: number;
  percentComplete: number;
  totalXP: number;
  totalGold: number;
} {
  const achievements = getUserAchievements(userAchievements);
  const unlocked = getUnlockedAchievements(userAchievements);

  const totalXP = unlocked.reduce((sum, ap) => sum + (ap.achievement.reward?.xp || 0), 0);
  const totalGold = unlocked.reduce((sum, ap) => sum + (ap.achievement.reward?.gold || 0), 0);

  return {
    total: achievements.length,
    unlocked: unlocked.length,
    percentComplete: Math.round((unlocked.length / achievements.length) * 100),
    totalXP,
    totalGold,
  };
}

// Get rarity color
export function getRarityColor(rarity: AchievementRarity): string {
  switch (rarity) {
    case 'common':
      return '#999';
    case 'uncommon':
      return '#4ade80';
    case 'rare':
      return '#0ea5e9';
    case 'epic':
      return '#a855f7';
    case 'legendary':
      return '#fbbf24';
    default:
      return '#ccc';
  }
}

// Check if achievement was just unlocked
export function wasJustUnlocked(
  oldProgress: number,
  newProgress: number,
  requirement: number
): boolean {
  return oldProgress < requirement && newProgress >= requirement;
}

// Export achievements as JSON
export function exportAchievements(userAchievements: UserAchievement[]): string {
  return JSON.stringify(userAchievements, null, 2);
}
