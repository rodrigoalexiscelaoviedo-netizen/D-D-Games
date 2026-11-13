// Sonido de la mesa: música de ambiente (archivos de Mixkit) y efectos de combate
// generados con Web Audio (no hace falta descargar nada). La preferencia de sonido
// se recuerda entre visitas.

export const audioLibrary = {
  ambient: {
    dungeon: 'https://assets.mixkit.co/active_storage/sfx/2721/2721-preview.mp3',
    tavern: 'https://assets.mixkit.co/active_storage/sfx/2718/2718-preview.mp3',
    forest: 'https://assets.mixkit.co/active_storage/sfx/2713/2713-preview.mp3',
  },
};

export type AmbientKey = keyof typeof audioLibrary.ambient;
export type EffectKey = 'dice' | 'hit' | 'miss' | 'crit' | 'heal' | 'attack';

const STORAGE_KEY = 'dnd_sound';

const readStoredPreference = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
};

class AudioManager {
  private ambientAudio: HTMLAudioElement | null = null;
  private lastAmbient: { key: AmbientKey; loop: boolean } | null = null;
  private enabled = readStoredPreference();
  private ctx: AudioContext | null = null;
  private listeners = new Set<(enabled: boolean) => void>();

  isEnabled() {
    return this.enabled;
  }

  subscribe(fn: (enabled: boolean) => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
    } catch {
      // Sin almacenamiento: la preferencia dura solo esta visita.
    }
    if (!enabled) {
      this.ambientAudio?.pause();
    } else if (this.lastAmbient) {
      this.playAmbient(this.lastAmbient.key, this.lastAmbient.loop);
    }
    this.listeners.forEach((fn) => fn(enabled));
  }

  playAmbient(ambient: AmbientKey, loop = true) {
    this.lastAmbient = { key: ambient, loop };
    if (!this.enabled) return;

    this.ambientAudio?.pause();
    const audio = new Audio(audioLibrary.ambient[ambient]);
    audio.loop = loop;
    audio.volume = 0.3;
    audio.play().catch(() => {}); // El navegador puede bloquearlo hasta la primera interacción.
    this.ambientAudio = audio;
  }

  stopAmbient() {
    this.ambientAudio?.pause();
    this.ambientAudio = null;
    this.lastAmbient = null;
  }

  playEffect(effect: EffectKey) {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    switch (effect) {
      case 'dice':
        // Dado rebotando: clics de ruido cada vez más suaves.
        [0, 0.07, 0.15, 0.24, 0.34].forEach((d, i) => this.noise(ctx, t + d, 0.03, 0.22 - i * 0.035, 2400));
        break;
      case 'hit':
      case 'attack':
        this.tone(ctx, t, 140, 55, 0.18, 0.35, 'sine');
        this.noise(ctx, t, 0.06, 0.18, 900);
        break;
      case 'miss':
        this.noise(ctx, t, 0.22, 0.12, 3200, 600);
        break;
      case 'crit':
        this.tone(ctx, t, 660, 660, 0.18, 0.18, 'triangle');
        this.tone(ctx, t + 0.12, 990, 990, 0.32, 0.2, 'triangle');
        this.tone(ctx, t, 140, 55, 0.2, 0.35, 'sine');
        break;
      case 'heal':
        [523, 659, 784].forEach((f, i) => this.tone(ctx, t + i * 0.09, f, f, 0.25, 0.14, 'triangle'));
        break;
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  private tone(ctx: AudioContext, at: number, from: number, to: number, dur: number, vol: number, type: OscillatorType) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, at);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), at + dur);
    gain.gain.setValueAtTime(vol, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + dur + 0.02);
  }

  private noise(ctx: AudioContext, at: number, dur: number, vol: number, freq: number, freqEnd?: number) {
    const length = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq, at);
    if (freqEnd) filter.frequency.exponentialRampToValueAtTime(freqEnd, at + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + dur);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(at);
    src.stop(at + dur + 0.02);
  }
}

export const audioManager = new AudioManager();
