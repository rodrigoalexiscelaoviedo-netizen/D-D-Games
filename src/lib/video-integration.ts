// Video integration and streaming system

export type VideoSource = 'youtube' | 'twitch' | 'local' | 'url';
export type VideoQuality = '480p' | '720p' | '1080p' | '2160p' | 'auto';

export interface VideoLink {
  id: string;
  title: string;
  source: VideoSource;
  url: string;
  thumbnailUrl?: string;
  duration?: number; // in seconds
  addedBy: string;
  addedDate: Date;
  description?: string;
  isPlaying?: boolean;
}

export interface VideoPlayer {
  id: string;
  currentVideo?: VideoLink;
  playlist: VideoLink[];
  isPlaying: boolean;
  currentTime: number; // in seconds
  duration: number;
  volume: number; // 0-100
  quality: VideoQuality;
  autoplay: boolean;
  loop: boolean;
}

// Create video link
export function createVideoLink(
  title: string,
  source: VideoSource,
  url: string,
  addedBy: string
): VideoLink {
  return {
    id: `video_${Date.now()}`,
    title,
    source,
    url,
    addedBy,
    addedDate: new Date(),
  };
}

// Extract video ID from YouTube URL
export function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Extract stream ID from Twitch URL
export function extractTwitchChannel(url: string): string | null {
  const regExp = /twitch\.tv\/([a-zA-Z0-9_]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

// Get YouTube embed URL
export function getYouTubeEmbedUrl(url: string): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;

  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
}

// Get Twitch embed URL
export function getTwitchEmbedUrl(channel: string): string {
  const parent = window.location.hostname;
  return `https://player.twitch.tv/?channel=${channel}&parent=${parent}&muted=true`;
}

// Create video player
export function createVideoPlayer(): VideoPlayer {
  return {
    id: `player_${Date.now()}`,
    playlist: [],
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 80,
    quality: 'auto',
    autoplay: false,
    loop: false,
  };
}

// Add video to playlist
export function addToPlaylist(player: VideoPlayer, video: VideoLink): VideoPlayer {
  return {
    ...player,
    playlist: [...player.playlist, video],
  };
}

// Remove video from playlist
export function removeFromPlaylist(player: VideoPlayer, videoId: string): VideoPlayer {
  return {
    ...player,
    playlist: player.playlist.filter((v) => v.id !== videoId),
  };
}

// Play video
export function playVideo(player: VideoPlayer, videoId: string): VideoPlayer {
  const video = player.playlist.find((v) => v.id === videoId);

  if (!video) return player;

  return {
    ...player,
    currentVideo: video,
    isPlaying: true,
    currentTime: 0,
  };
}

// Pause video
export function pauseVideo(player: VideoPlayer): VideoPlayer {
  return {
    ...player,
    isPlaying: false,
  };
}

// Stop video
export function stopVideo(player: VideoPlayer): VideoPlayer {
  return {
    ...player,
    isPlaying: false,
    currentTime: 0,
    currentVideo: undefined,
  };
}

// Seek video
export function seekVideo(player: VideoPlayer, time: number): VideoPlayer {
  return {
    ...player,
    currentTime: Math.max(0, Math.min(time, player.duration)),
  };
}

// Set volume
export function setVolume(player: VideoPlayer, volume: number): VideoPlayer {
  return {
    ...player,
    volume: Math.max(0, Math.min(100, volume)),
  };
}

// Set quality
export function setQuality(player: VideoPlayer, quality: VideoQuality): VideoPlayer {
  return {
    ...player,
    quality,
  };
}

// Toggle autoplay
export function toggleAutoplay(player: VideoPlayer): VideoPlayer {
  return {
    ...player,
    autoplay: !player.autoplay,
  };
}

// Toggle loop
export function toggleLoop(player: VideoPlayer): VideoPlayer {
  return {
    ...player,
    loop: !player.loop,
  };
}

// Format time
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Get next video in playlist
export function getNextVideo(player: VideoPlayer): VideoLink | undefined {
  if (!player.currentVideo) return player.playlist[0];

  const currentIndex = player.playlist.findIndex((v) => v.id === player.currentVideo?.id);
  if (currentIndex === -1) return undefined;

  if (currentIndex + 1 < player.playlist.length) {
    return player.playlist[currentIndex + 1];
  } else if (player.loop) {
    return player.playlist[0];
  }

  return undefined;
}

// Validate video URL
export function isValidVideoUrl(url: string): boolean {
  try {
    new URL(url);
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('twitch.tv') || url.startsWith('http');
  } catch {
    return false;
  }
}
