// Session recording and playback system

export type RecordingEventType = 
  | "character-action"
  | "dice-roll"
  | "damage"
  | "healing"
  | "spell-cast"
  | "skill-check"
  | "combat-turn"
  | "chat-message"
  | "npc-action"
  | "environment-change"
  | "session-milestone";

export interface RecordedEvent {
  id: string;
  timestamp: number;
  type: RecordingEventType;
  characterId: string;
  characterName: string;
  action: string;
  result?: string | number;
  details?: Record<string, any>;
}

export interface SessionRecording {
  id: string;
  sessionId: string;
  campaignId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  events: RecordedEvent[];
  isFinalized: boolean;
  isPublic: boolean;
  views: number;
  likes: number;
  description?: string;
}

export interface PlaybackState {
  currentEventIndex: number;
  isPlaying: boolean;
  speed: number;
  recordingId: string;
}

export interface RecordingStatistics {
  totalEvents: number;
  eventsByType: Record<RecordingEventType, number>;
  diceRolls: number;
  totalDamageDealt: number;
  characterActions: number;
  spellsCast: number;
  averageTurnDuration: number;
}

export function createSessionRecording(
  sessionId: string,
  campaignId: string
): SessionRecording {
  return {
    id: `recording_${Date.now()}`,
    sessionId,
    campaignId,
    startTime: new Date(),
    duration: 0,
    events: [],
    isFinalized: false,
    isPublic: false,
    views: 0,
    likes: 0,
  };
}

export function recordEvent(
  recording: SessionRecording,
  type: RecordingEventType,
  characterId: string,
  characterName: string,
  action: string,
  result?: string | number
): SessionRecording {
  const event: RecordedEvent = {
    id: `event_${Date.now()}`,
    timestamp: Date.now() - recording.startTime.getTime(),
    type,
    characterId,
    characterName,
    action,
    result,
  };

  return {
    ...recording,
    events: [...recording.events, event],
    duration: event.timestamp,
  };
}

export function finalizeRecording(recording: SessionRecording): SessionRecording {
  return {
    ...recording,
    endTime: new Date(),
    isFinalized: true,
  };
}

export function getRecordingStats(recording: SessionRecording): RecordingStatistics {
  const eventsByType: Record<RecordingEventType, number> = {
    "character-action": 0,
    "dice-roll": 0,
    "damage": 0,
    "healing": 0,
    "spell-cast": 0,
    "skill-check": 0,
    "combat-turn": 0,
    "chat-message": 0,
    "npc-action": 0,
    "environment-change": 0,
    "session-milestone": 0,
  };

  let totalDamage = 0;
  let spellCount = 0;

  recording.events.forEach((event) => {
    eventsByType[event.type]++;
    if (event.type === "damage" && typeof event.result === "number") {
      totalDamage += event.result;
    }
    if (event.type === "spell-cast") spellCount++;
  });

  return {
    totalEvents: recording.events.length,
    eventsByType,
    diceRolls: eventsByType["dice-roll"],
    totalDamageDealt: totalDamage,
    characterActions: eventsByType["character-action"],
    spellsCast: spellCount,
    averageTurnDuration: recording.duration / Math.max(eventsByType["combat-turn"], 1),
  };
}

export function getEventsByCharacter(
  recording: SessionRecording,
  characterId: string
): RecordedEvent[] {
  return recording.events.filter((e) => e.characterId === characterId);
}

export function getEventsByType(
  recording: SessionRecording,
  type: RecordingEventType
): RecordedEvent[] {
  return recording.events.filter((e) => e.type === type);
}

export function exportRecordingJSON(recording: SessionRecording): string {
  return JSON.stringify(recording, null, 2);
}

export function publishRecording(recording: SessionRecording): SessionRecording {
  return {
    ...recording,
    isPublic: true,
  };
}

export function likeRecording(recording: SessionRecording): SessionRecording {
  return {
    ...recording,
    likes: recording.likes + 1,
  };
}

export function recordView(recording: SessionRecording): SessionRecording {
  return {
    ...recording,
    views: recording.views + 1,
  };
}
