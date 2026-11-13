// Voice chat and audio management system

export type AudioQuality = 'low' | 'medium' | 'high';
export type AudioEffect = 'none' | 'echo' | 'reverb' | 'robot' | 'whisper';

export interface VoiceChannel {
  id: string;
  name: string;
  participants: VoiceParticipant[];
  isActive: boolean;
  recordingEnabled?: boolean;
}

export interface VoiceParticipant {
  id: string;
  name: string;
  isMuted: boolean;
  volume: number; // 0-100
  audioEffect?: AudioEffect;
  joinedAt: Date;
}

export interface VoiceSettings {
  microphoneEnabled: boolean;
  speakersEnabled: boolean;
  audioQuality: AudioQuality;
  defaultAudioEffect: AudioEffect;
  noiseReduction: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  volume: number; // 0-100
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  microphoneEnabled: true,
  speakersEnabled: true,
  audioQuality: 'medium',
  defaultAudioEffect: 'none',
  noiseReduction: true,
  echoCancellation: true,
  autoGainControl: true,
  volume: 80,
};

// Audio quality settings
export const AUDIO_QUALITY_SETTINGS: Record<AudioQuality, { bitrate: number; sampleRate: number }> = {
  low: { bitrate: 24, sampleRate: 16000 },
  medium: { bitrate: 64, sampleRate: 44100 },
  high: { bitrate: 128, sampleRate: 48000 },
};

// Create voice channel
export function createVoiceChannel(name: string): VoiceChannel {
  return {
    id: `voice_${Date.now()}`,
    name,
    participants: [],
    isActive: false,
  };
}

// Add participant to channel
export function addParticipant(
  channel: VoiceChannel,
  name: string
): { channel: VoiceChannel; participant: VoiceParticipant } {
  const participant: VoiceParticipant = {
    id: `user_${Date.now()}`,
    name,
    isMuted: false,
    volume: 100,
    joinedAt: new Date(),
  };

  return {
    channel: {
      ...channel,
      participants: [...channel.participants, participant],
    },
    participant,
  };
}

// Remove participant from channel
export function removeParticipant(channel: VoiceChannel, participantId: string): VoiceChannel {
  return {
    ...channel,
    participants: channel.participants.filter((p) => p.id !== participantId),
  };
}

// Toggle mute
export function toggleMute(channel: VoiceChannel, participantId: string): VoiceChannel {
  return {
    ...channel,
    participants: channel.participants.map((p) =>
      p.id === participantId ? { ...p, isMuted: !p.isMuted } : p
    ),
  };
}

// Set participant volume
export function setParticipantVolume(
  channel: VoiceChannel,
  participantId: string,
  volume: number
): VoiceChannel {
  return {
    ...channel,
    participants: channel.participants.map((p) =>
      p.id === participantId ? { ...p, volume: Math.max(0, Math.min(100, volume)) } : p
    ),
  };
}

// Apply audio effect
export function applyAudioEffect(
  channel: VoiceChannel,
  participantId: string,
  effect: AudioEffect
): VoiceChannel {
  return {
    ...channel,
    participants: channel.participants.map((p) =>
      p.id === participantId ? { ...p, audioEffect: effect } : p
    ),
  };
}

// Check if participant is muted
export function isParticipantMuted(channel: VoiceChannel, participantId: string): boolean {
  const participant = channel.participants.find((p) => p.id === participantId);
  return participant?.isMuted ?? false;
}

// Get participant count
export function getParticipantCount(channel: VoiceChannel): number {
  return channel.participants.length;
}

// Start channel
export function startChannel(channel: VoiceChannel): VoiceChannel {
  return { ...channel, isActive: true };
}

// Stop channel
export function stopChannel(channel: VoiceChannel): VoiceChannel {
  return { ...channel, isActive: false, participants: [] };
}

// Calculate audio latency (simulated)
export function calculateAudioLatency(quality: AudioQuality): number {
  const latencies: Record<AudioQuality, number> = {
    low: 50,
    medium: 100,
    high: 200,
  };
  return latencies[quality];
}

// Format duration
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}
