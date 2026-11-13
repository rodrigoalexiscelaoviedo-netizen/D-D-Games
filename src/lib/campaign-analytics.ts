// Campaign analytics and statistics tracking

export interface CampaignStats {
  campaignId: string;
  campaignName: string;
  createdDate: Date;
  lastSessionDate: Date;
  totalSessions: number;
  totalCombats: number;
  totalDeaths: number;
  averageSessionDuration: number; // in minutes
  totalPlaytimeMiles: number;
  charactersCreated: number;
  itemsFound: number;
  gold: number;
  xpDistributed: number;
}

export interface SessionSummary {
  sessionId: string;
  campaignId: string;
  date: Date;
  duration: number; // in minutes
  playersPresent: string[];
  combatsOccurred: number;
  itemsFound: number;
  xpAwarded: number;
  notes?: string;
}

export interface CharacterStat {
  characterId: string;
  characterName: string;
  class: string;
  level: number;
  totalXP: number;
  sessionCount: number;
  combatsParticipated: number;
  damageDealt: number;
  damageTaken: number;
  kills: number;
  deaths: number;
  itemsLooted: number;
}

export interface CampaignTimeline {
  date: Date;
  sessionCount: number;
  combatCount: number;
  xpAwarded: number;
  playersPresent: number;
}

// Create campaign stats
export function createCampaignStats(
  campaignId: string,
  campaignName: string
): CampaignStats {
  return {
    campaignId,
    campaignName,
    createdDate: new Date(),
    lastSessionDate: new Date(),
    totalSessions: 0,
    totalCombats: 0,
    totalDeaths: 0,
    averageSessionDuration: 0,
    totalPlaytimeMiles: 0,
    charactersCreated: 0,
    itemsFound: 0,
    gold: 0,
    xpDistributed: 0,
  };
}

// Update campaign stats after session
export function recordSession(
  stats: CampaignStats,
  session: SessionSummary
): CampaignStats {
  const totalDuration = stats.averageSessionDuration * stats.totalSessions + session.duration;
  const newSessionCount = stats.totalSessions + 1;

  return {
    ...stats,
    lastSessionDate: session.date,
    totalSessions: newSessionCount,
    totalCombats: stats.totalCombats + session.combatsOccurred,
    averageSessionDuration: Math.round(totalDuration / newSessionCount),
    itemsFound: stats.itemsFound + session.itemsFound,
    xpDistributed: stats.xpDistributed + session.xpAwarded,
  };
}

// Calculate player engagement
export function calculatePlayerEngagement(sessions: SessionSummary[]): Map<string, number> {
  const engagement = new Map<string, number>();

  for (const session of sessions) {
    for (const player of session.playersPresent) {
      engagement.set(player, (engagement.get(player) || 0) + 1);
    }
  }

  return engagement;
}

// Calculate combat statistics
export function calculateCombatStats(stats: CampaignStats): {
  combatsPerSession: number;
  averageCombatDuration: number;
  deathRate: number;
} {
  return {
    combatsPerSession:
      stats.totalSessions > 0
        ? Math.round((stats.totalCombats / stats.totalSessions) * 10) / 10
        : 0,
    averageCombatDuration:
      stats.totalCombats > 0
        ? Math.round((stats.totalPlaytimeMiles / stats.totalCombats) * 10) / 10
        : 0,
    deathRate: stats.totalCombats > 0
        ? Math.round((stats.totalDeaths / stats.totalCombats) * 100)
        : 0,
  };
}

// Get timeline data
export function generateTimeline(sessions: SessionSummary[]): CampaignTimeline[] {
  const timelineMap = new Map<string, CampaignTimeline>();

  for (const session of sessions) {
    const dateKey = session.date.toISOString().split('T')[0];
    const existing = timelineMap.get(dateKey);

    if (existing) {
      existing.sessionCount++;
      existing.combatCount += session.combatsOccurred;
      existing.xpAwarded += session.xpAwarded;
      existing.playersPresent = Math.max(
        existing.playersPresent,
        session.playersPresent.length
      );
    } else {
      timelineMap.set(dateKey, {
        date: session.date,
        sessionCount: 1,
        combatCount: session.combatsOccurred,
        xpAwarded: session.xpAwarded,
        playersPresent: session.playersPresent.length,
      });
    }
  }

  return Array.from(timelineMap.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
}

// Track character progression
export function trackCharacterProgression(
  stats: CharacterStat[]
): Array<{ characterName: string; xpGained: number; levelUp: boolean }> {
  return stats.map((stat) => ({
    characterName: stat.characterName,
    xpGained: stat.totalXP,
    levelUp: false, // Would be determined by level changes
  }));
}

// Calculate party balance
export function calculatePartyBalance(characters: CharacterStat[]): {
  averageLevel: number;
  levelSpread: number;
  avgItemsPerCharacter: number;
} {
  if (characters.length === 0) {
    return { averageLevel: 0, levelSpread: 0, avgItemsPerCharacter: 0 };
  }

  const levels = characters.map((c) => c.level);
  const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length;
  const levelSpread = Math.max(...levels) - Math.min(...levels);
  const avgItems =
    characters.reduce((sum, c) => sum + c.itemsLooted, 0) / characters.length;

  return {
    averageLevel: Math.round(avgLevel * 10) / 10,
    levelSpread,
    avgItemsPerCharacter: Math.round(avgItems * 10) / 10,
  };
}

// Get most impactful sessions
export function getMostImpactfulSessions(sessions: SessionSummary[], limit: number = 5): SessionSummary[] {
  return [...sessions]
    .sort((a, b) => {
      const aScore = a.combatsOccurred * 2 + a.xpAwarded / 100;
      const bScore = b.combatsOccurred * 2 + b.xpAwarded / 100;
      return bScore - aScore;
    })
    .slice(0, limit);
}

// Export analytics as JSON
export function exportAnalyticsJSON(stats: CampaignStats): string {
  return JSON.stringify(stats, null, 2);
}

// Calculate growth metrics
export function calculateGrowthMetrics(
  sessions: SessionSummary[]
): {
  totalPlaytime: number;
  gamesPerMonth: number;
  avgPlayersPerSession: number;
} {
  if (sessions.length === 0) {
    return { totalPlaytime: 0, gamesPerMonth: 0, avgPlayersPerSession: 0 };
  }

  const totalPlaytime = sessions.reduce((sum, s) => sum + s.duration, 0);
  const dateRange = (new Date().getTime() - sessions[0].date.getTime()) / (1000 * 60 * 60 * 24 * 30);
  const gamesPerMonth = Math.round((sessions.length / Math.max(dateRange, 1)) * 10) / 10;
  const avgPlayers = Math.round(
    sessions.reduce((sum, s) => sum + s.playersPresent.length, 0) / sessions.length
  );

  return {
    totalPlaytime,
    gamesPerMonth,
    avgPlayersPerSession: avgPlayers,
  };
}
