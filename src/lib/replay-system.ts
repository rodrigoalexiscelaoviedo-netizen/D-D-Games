// Combat replay and recording system

export interface ReplayFrame {
  timestamp: number;
  type: 'action' | 'roll' | 'damage' | 'state' | 'chat';
  data: Record<string, any>;
  actor?: string;
  description?: string;
}

export interface CombatReplay {
  id: string;
  campaignId: string;
  combatName: string;
  date: Date;
  duration: number; // in seconds
  recordedBy: string;
  participants: string[];
  winner?: string;
  frames: ReplayFrame[];
  isPublic?: boolean;
  views: number;
  likes: number;
}

export interface ReplayTimeline {
  currentFrame: number;
  isPlaying: boolean;
  speed: number; // 0.5, 1, 1.5, 2
  duration: number;
}

export interface ReplayAnalytics {
  totalActions: number;
  totalDamage: number;
  averageDamagePerRound: number;
  criticalHits: number;
  missedAttacks: number;
  spellsCast: number;
  itemsUsed: number;
  survivingCharacters: string[];
  fallenCharacters: string[];
}

// Create replay session
export function createReplay(
  campaignId: string,
  combatName: string,
  recordedBy: string,
  participants: string[]
): CombatReplay {
  return {
    id: `replay_${Date.now()}`,
    campaignId,
    combatName,
    date: new Date(),
    duration: 0,
    recordedBy,
    participants,
    frames: [],
    views: 0,
    likes: 0,
  };
}

// Add frame to replay
export function addFrameToReplay(replay: CombatReplay, frame: ReplayFrame): CombatReplay {
  const newReplay = { ...replay };
  newReplay.frames.push(frame);

  // Update duration
  if (frame.timestamp > replay.duration) {
    newReplay.duration = frame.timestamp;
  }

  return newReplay;
}

// Create action frame
export function createActionFrame(
  timestamp: number,
  actor: string,
  description: string,
  data: any
): ReplayFrame {
  return {
    timestamp,
    type: 'action',
    actor,
    description,
    data,
  };
}

// Create roll frame
export function createRollFrame(
  timestamp: number,
  actor: string,
  rollType: string,
  result: number,
  modifier: number = 0
): ReplayFrame {
  return {
    timestamp,
    type: 'roll',
    actor,
    description: `${actor} rolled ${rollType}: ${result + modifier} (${result}${modifier > 0 ? '+' : ''}${modifier})`,
    data: {
      rollType,
      result,
      modifier,
      total: result + modifier,
    },
  };
}

// Create damage frame
export function createDamageFrame(
  timestamp: number,
  source: string,
  target: string,
  amount: number,
  type: string = 'slashing'
): ReplayFrame {
  return {
    timestamp,
    type: 'damage',
    actor: source,
    description: `${source} dealt ${amount} ${type} damage to ${target}`,
    data: {
      source,
      target,
      amount,
      type,
    },
  };
}

// Create state frame
export function createStateFrame(
  timestamp: number,
  state: Record<string, any>
): ReplayFrame {
  return {
    timestamp,
    type: 'state',
    description: 'State snapshot',
    data: state,
  };
}

// Create chat frame
export function createChatFrame(
  timestamp: number,
  actor: string,
  message: string
): ReplayFrame {
  return {
    timestamp,
    type: 'chat',
    actor,
    description: message,
    data: {
      message,
    },
  };
}

// Get frames by time range
export function getFramesByTimeRange(
  replay: CombatReplay,
  startTime: number,
  endTime: number
): ReplayFrame[] {
  return replay.frames.filter((f) => f.timestamp >= startTime && f.timestamp <= endTime);
}

// Get frame at specific time
export function getFrameAtTime(replay: CombatReplay, time: number): ReplayFrame | undefined {
  let closest: ReplayFrame | undefined;
  let closestDiff = Infinity;

  for (const frame of replay.frames) {
    const diff = Math.abs(frame.timestamp - time);
    if (diff < closestDiff) {
      closest = frame;
      closestDiff = diff;
    }
  }

  return closest;
}

// Calculate analytics
export function calculateReplayAnalytics(replay: CombatReplay): ReplayAnalytics {
  const analytics: ReplayAnalytics = {
    totalActions: 0,
    totalDamage: 0,
    averageDamagePerRound: 0,
    criticalHits: 0,
    missedAttacks: 0,
    spellsCast: 0,
    itemsUsed: 0,
    survivingCharacters: [],
    fallenCharacters: [],
  };

  for (const frame of replay.frames) {
    if (frame.type === 'action') {
      analytics.totalActions++;
      if (frame.description?.toLowerCase().includes('casts')) {
        analytics.spellsCast++;
      }
      if (frame.description?.toLowerCase().includes('uses')) {
        analytics.itemsUsed++;
      }
    }

    if (frame.type === 'damage') {
      analytics.totalDamage += frame.data.amount || 0;
      if (frame.description?.includes('critical')) {
        analytics.criticalHits++;
      }
    }

    if (frame.type === 'roll') {
      if (frame.data.total < 10) {
        analytics.missedAttacks++;
      }
    }
  }

  // Calculate average damage per round (assuming 6 seconds per round in combat time)
  const rounds = Math.ceil(replay.duration / 6);
  analytics.averageDamagePerRound = rounds > 0 ? Math.round(analytics.totalDamage / rounds) : 0;

  return analytics;
}

// Export replay as JSON
export function exportReplayJSON(replay: CombatReplay): string {
  return JSON.stringify(replay, null, 2);
}

// Import replay from JSON
export function importReplayJSON(json: string): CombatReplay {
  const data = JSON.parse(json);
  data.date = new Date(data.date);
  return data;
}

// Compress replay (remove some frames for smaller file size)
export function compressReplay(replay: CombatReplay, compressionRatio: number = 0.5): CombatReplay {
  const frameCount = Math.ceil(replay.frames.length * compressionRatio);
  const step = Math.ceil(replay.frames.length / frameCount);

  return {
    ...replay,
    frames: replay.frames.filter((_, idx) => idx % step === 0),
  };
}

// Generate replay summary
export function generateReplaySummary(replay: CombatReplay): string {
  const analytics = calculateReplayAnalytics(replay);
  const duration = `${Math.floor(replay.duration / 60)}m ${replay.duration % 60}s`;

  return `
Combat: ${replay.combatName}
Date: ${replay.date.toLocaleDateString()}
Duration: ${duration}
Participants: ${replay.participants.join(', ')}
---
Total Actions: ${analytics.totalActions}
Total Damage: ${analytics.totalDamage}
Spells Cast: ${analytics.spellsCast}
Critical Hits: ${analytics.criticalHits}
Missed Attacks: ${analytics.missedAttacks}
Winner: ${replay.winner || 'Unknown'}
  `.trim();
}

// Search replays
export function searchReplays(
  replays: CombatReplay[],
  query: string
): CombatReplay[] {
  const lowerQuery = query.toLowerCase();
  return replays.filter(
    (r) =>
      r.combatName.toLowerCase().includes(lowerQuery) ||
      r.participants.some((p) => p.toLowerCase().includes(lowerQuery)) ||
      r.recordedBy.toLowerCase().includes(lowerQuery)
  );
}

// Sort replays
export function sortReplays(
  replays: CombatReplay[],
  sortBy: 'date' | 'duration' | 'views' | 'likes' = 'date'
): CombatReplay[] {
  const sorted = [...replays];

  switch (sortBy) {
    case 'date':
      return sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
    case 'duration':
      return sorted.sort((a, b) => b.duration - a.duration);
    case 'views':
      return sorted.sort((a, b) => b.views - a.views);
    case 'likes':
      return sorted.sort((a, b) => b.likes - a.likes);
    default:
      return sorted;
  }
}
