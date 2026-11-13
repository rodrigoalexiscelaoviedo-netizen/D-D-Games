// Performance and analytics tracking

export interface PlayerPerformance {
  characterId: string;
  characterName: string;
  damageDealt: number;
  damageReceived: number;
  healingProvided: number;
  kills: number;
  deaths: number;
  criticalHits: number;
  missedAttacks: number;
  accuracyRate: number;
  avgDamagePerTurn: number;
  survivalRate: number;
}

export interface CombatAnalytics {
  combatId: string;
  duration: number;
  roundsLasted: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  enemiesDefeated: number;
  playerDeaths: number;
  turnsByCharacter: Record<string, number>;
  effectiveness: number;
}

export interface CampaignAnalyticsData {
  campaignId: string;
  totalSessions: number;
  totalPlaytime: number;
  totalCombats: number;
  playerDeaths: number;
  questsCompleted: number;
  itemsFound: number;
  goldAcquired: number;
  avgSessionDuration: number;
  playerRetention: number;
  engagementScore: number;
}

export interface PerformanceMetrics {
  overallDPS: number;
  controlRating: number;
  survivalScore: number;
  utilityScore: number;
  teamworkScore: number;
}

export function createPlayerPerformance(
  characterId: string,
  characterName: string
): PlayerPerformance {
  return {
    characterId,
    characterName,
    damageDealt: 0,
    damageReceived: 0,
    healingProvided: 0,
    kills: 0,
    deaths: 0,
    criticalHits: 0,
    missedAttacks: 0,
    accuracyRate: 1.0,
    avgDamagePerTurn: 0,
    survivalRate: 1.0,
  };
}

export function updatePerformance(
  performance: PlayerPerformance,
  damageDealt: number = 0,
  damageReceived: number = 0,
  healing: number = 0,
  hit: boolean = true,
  isCritical: boolean = false
): PlayerPerformance {
  const totalAttacks = performance.missedAttacks + Math.max(0, Math.abs(damageDealt));
  const newMissedAttacks = !hit ? performance.missedAttacks + 1 : performance.missedAttacks;

  return {
    ...performance,
    damageDealt: performance.damageDealt + damageDealt,
    damageReceived: performance.damageReceived + damageReceived,
    healingProvided: performance.healingProvided + healing,
    missedAttacks: newMissedAttacks,
    criticalHits: isCritical ? performance.criticalHits + 1 : performance.criticalHits,
    accuracyRate: totalAttacks > 0 ? (totalAttacks - newMissedAttacks) / totalAttacks : 1.0,
  };
}

export function recordKill(performance: PlayerPerformance): PlayerPerformance {
  return {
    ...performance,
    kills: performance.kills + 1,
  };
}

export function recordDeath(performance: PlayerPerformance): PlayerPerformance {
  return {
    ...performance,
    deaths: performance.deaths + 1,
    survivalRate: 0,
  };
}

export function calculatePerformanceMetrics(
  performance: PlayerPerformance,
  combatDuration: number
): PerformanceMetrics {
  const dps = combatDuration > 0 ? performance.damageDealt / combatDuration : 0;
  const controlRating =
    (performance.kills * 10 + performance.damageDealt / 100) / Math.max(1, performance.deaths);
  const survivalScore = performance.deaths === 0 ? 100 : 50 / (performance.deaths + 1);
  const utilityScore = performance.healingProvided + performance.damageReceived / 10;
  const teamworkScore = (performance.healingProvided + performance.damageDealt) / 200;

  return {
    overallDPS: Math.round(dps * 100) / 100,
    controlRating: Math.round(controlRating * 10) / 10,
    survivalScore: Math.round(survivalScore * 10) / 10,
    utilityScore: Math.round(utilityScore * 10) / 10,
    teamworkScore: Math.round(teamworkScore * 10) / 10,
  };
}

export function createCombatAnalytics(
  combatId: string,
  duration: number,
  roundsLasted: number
): CombatAnalytics {
  return {
    combatId,
    duration,
    roundsLasted,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    enemiesDefeated: 0,
    playerDeaths: 0,
    turnsByCharacter: {},
    effectiveness: 0,
  };
}

export function createCampaignAnalytics(
  campaignId: string
): CampaignAnalyticsData {
  return {
    campaignId,
    totalSessions: 0,
    totalPlaytime: 0,
    totalCombats: 0,
    playerDeaths: 0,
    questsCompleted: 0,
    itemsFound: 0,
    goldAcquired: 0,
    avgSessionDuration: 0,
    playerRetention: 1.0,
    engagementScore: 0,
  };
}

export function calculateEngagementScore(
  analytics: CampaignAnalyticsData
): number {
  let score = 0;

  score += Math.min(analytics.totalSessions * 5, 50);
  score += Math.min(analytics.totalCombats * 2, 30);
  score += Math.min(analytics.questsCompleted * 5, 20);

  return Math.round(score);
}

export function getPlayerRankings(
  performances: PlayerPerformance[]
): Array<{
  rank: number;
  character: string;
  dps: number;
  kills: number;
  survivability: number;
}> {
  const ranked = [...performances]
    .map((p) => ({
      character: p.characterName,
      dps: p.damageDealt,
      kills: p.kills,
      survivability: p.survivalRate * 100,
    }))
    .sort((a, b) => b.dps - a.dps);

  return ranked.map((p, idx) => ({
    rank: idx + 1,
    ...p,
  }));
}

export function generatePerformanceReport(
  analytics: CampaignAnalyticsData
): string {
  let report = `# Campaign Analytics Report\n\n`;
  report += `## Campaign Statistics\n`;
  report += `- Total Sessions: ${analytics.totalSessions}\n`;
  report += `- Total Playtime: ${analytics.totalPlaytime} hours\n`;
  report += `- Average Session Duration: ${analytics.avgSessionDuration} minutes\n`;
  report += `- Total Combats: ${analytics.totalCombats}\n\n`;
  report += `## Achievements\n`;
  report += `- Quests Completed: ${analytics.questsCompleted}\n`;
  report += `- Items Found: ${analytics.itemsFound}\n`;
  report += `- Gold Acquired: ${analytics.goldAcquired}\n`;
  report += `- Player Deaths: ${analytics.playerDeaths}\n\n`;
  report += `## Engagement\n`;
  report += `- Player Retention: ${Math.round(analytics.playerRetention * 100)}%\n`;
  report += `- Engagement Score: ${analytics.engagementScore}/100\n`;

  return report;
}
