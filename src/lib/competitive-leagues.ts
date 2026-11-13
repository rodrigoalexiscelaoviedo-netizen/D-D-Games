// Competitive leagues and ranking system

export type LeagueType = 'casual' | 'ranked' | 'tournament' | 'seasonal';
export type MatchStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface League {
  id: string;
  name: string;
  type: LeagueType;
  description?: string;
  createdBy: string;
  createdAt: Date;
  startDate: Date;
  endDate?: Date;
  maxParticipants?: number;
  participants: LeagueParticipant[];
  isActive: boolean;
  prizePool?: number;
  rules?: string;
}

export interface LeagueParticipant {
  id: string;
  leagueId: string;
  playerId: string;
  playerName: string;
  joinedAt: Date;
  rating: number; // ELO rating
  wins: number;
  losses: number;
  draws: number;
  streak: number; // Current win/loss streak
  rank: number;
}

export interface Match {
  id: string;
  leagueId: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  status: MatchStatus;
  winner?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in minutes
  ratingChange1?: number;
  ratingChange2?: number;
  notes?: string;
}

export interface LeagueStats {
  totalMatches: number;
  totalParticipants: number;
  avgRating: number;
  topRated: LeagueParticipant[];
  upcomingMatches: number;
}

export interface RankingTier {
  name: string;
  minRating: number;
  maxRating: number;
  icon: string;
  color: string;
}

// Ranking tiers
export const RANKING_TIERS: RankingTier[] = [
  { name: 'Novice', minRating: 0, maxRating: 1200, icon: '🥉', color: '#999' },
  { name: 'Apprentice', minRating: 1200, maxRating: 1400, icon: '🥉', color: '#16a34a' },
  { name: 'Journeyman', minRating: 1400, maxRating: 1600, icon: '🥈', color: '#0ea5e9' },
  { name: 'Expert', minRating: 1600, maxRating: 1800, icon: '🥇', color: '#fbbf24' },
  { name: 'Master', minRating: 1800, maxRating: 2000, icon: '👑', color: '#a855f7' },
  { name: 'Legendary', minRating: 2000, maxRating: 9999, icon: '⭐', color: '#ef4444' },
];

// Create league
export function createLeague(
  name: string,
  type: LeagueType,
  createdBy: string
): League {
  return {
    id: `league_${Date.now()}`,
    name,
    type,
    createdBy,
    createdAt: new Date(),
    startDate: new Date(),
    participants: [],
    isActive: true,
  };
}

// Add participant to league
export function addParticipant(
  league: League,
  playerId: string,
  playerName: string
): LeagueParticipant {
  const participant: LeagueParticipant = {
    id: `participant_${Date.now()}`,
    leagueId: league.id,
    playerId,
    playerName,
    joinedAt: new Date(),
    rating: 1200, // Starting rating
    wins: 0,
    losses: 0,
    draws: 0,
    streak: 0,
    rank: league.participants.length + 1,
  };

  return participant;
}

// Calculate ELO rating change
export function calculateEloChange(
  winner: LeagueParticipant,
  loser: LeagueParticipant,
  kFactor: number = 32
): { winnerChange: number; loserChange: number } {
  const ratingDiff = loser.rating - winner.rating;
  const expectedWinner = 1 / (1 + Math.pow(10, ratingDiff / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, -ratingDiff / 400));

  const winnerChange = Math.round(kFactor * (1 - expectedWinner));
  const loserChange = Math.round(kFactor * (0 - expectedLoser));

  return { winnerChange, loserChange };
}

// Record match result
export function recordMatchResult(
  match: Match,
  winner: LeagueParticipant,
  loser: LeagueParticipant
): {
  updatedWinner: LeagueParticipant;
  updatedLoser: LeagueParticipant;
  matchResult: Match;
} {
  const eloChange = calculateEloChange(winner, loser);

  const updatedWinner = {
    ...winner,
    rating: Math.max(0, winner.rating + eloChange.winnerChange),
    wins: winner.wins + 1,
    streak: Math.max(0, winner.streak) + 1,
  };

  const updatedLoser = {
    ...loser,
    rating: Math.max(0, loser.rating + eloChange.loserChange),
    losses: loser.losses + 1,
    streak: Math.min(0, loser.streak) - 1,
  };

  const matchResult = {
    ...match,
    status: 'completed' as MatchStatus,
    winner: winner.playerId,
    endTime: new Date(),
    ratingChange1: eloChange.winnerChange,
    ratingChange2: eloChange.loserChange,
  };

  return { updatedWinner, updatedLoser, matchResult };
}

// Get ranking tier
export function getRankingTier(rating: number): RankingTier {
  return RANKING_TIERS.find((tier) => rating >= tier.minRating && rating <= tier.maxRating) || RANKING_TIERS[0];
}

// Calculate win rate
export function calculateWinRate(participant: LeagueParticipant): number {
  const total = participant.wins + participant.losses + participant.draws;
  if (total === 0) return 0;
  return (participant.wins / total) * 100;
}

// Get league standings
export function getLeagueStandings(league: League): LeagueParticipant[] {
  return [...league.participants].sort((a, b) => {
    // Sort by wins first
    if (b.wins !== a.wins) return b.wins - a.wins;
    // Then by rating
    return b.rating - a.rating;
  });
}

// Get top players
export function getTopPlayers(league: League, limit: number = 10): LeagueParticipant[] {
  return getLeagueStandings(league).slice(0, limit);
}

// Calculate league statistics
export function calculateLeagueStats(league: League): LeagueStats {
  const allMatches = league.participants.reduce((sum, p) => sum + p.wins + p.losses + p.draws, 0) / 2;
  const avgRating = league.participants.length > 0
    ? Math.round(league.participants.reduce((sum, p) => sum + p.rating, 0) / league.participants.length)
    : 0;

  return {
    totalMatches: Math.floor(allMatches),
    totalParticipants: league.participants.length,
    avgRating,
    topRated: getTopPlayers(league, 5),
    upcomingMatches: 0, // Would be calculated from matches
  };
}

// Create match
export function createMatch(
  leagueId: string,
  player1: LeagueParticipant,
  player2: LeagueParticipant
): Match {
  return {
    id: `match_${Date.now()}`,
    leagueId,
    player1Id: player1.playerId,
    player2Id: player2.playerId,
    player1Name: player1.playerName,
    player2Name: player2.playerName,
    status: 'pending',
    startTime: new Date(),
  };
}

// Generate bracket for tournament
export function generateTournamentBracket(participants: LeagueParticipant[]): Match[] {
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  const matches: Match[] = [];

  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      matches.push(
        createMatch(`tournament_${Date.now()}`, shuffled[i], shuffled[i + 1])
      );
    }
  }

  return matches;
}

// Export league data
export function exportLeagueData(league: League): string {
  return JSON.stringify(league, null, 2);
}

// Import league data
export function importLeagueData(json: string): League {
  return JSON.parse(json);
}

// Season utilities
export function isSeasonActive(league: League): boolean {
  if (league.type !== 'seasonal') return league.isActive;
  const now = new Date();
  return league.startDate <= now && (!league.endDate || league.endDate >= now);
}

export function getRemainingSeasonDays(league: League): number {
  if (!league.endDate) return -1;
  const now = new Date();
  return Math.ceil((league.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
