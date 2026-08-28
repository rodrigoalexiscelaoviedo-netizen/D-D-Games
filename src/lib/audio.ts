export const audioLibrary = {
  effects: {
    attack: new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='),
    heal: new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='),
    miss: new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='),
  },
  ambient: {
    dungeon: 'https://assets.mixkit.co/active_storage/sfx/2721/2721-preview.mp3',
    tavern: 'https://assets.mixkit.co/active_storage/sfx/2718/2718-preview.mp3',
    forest: 'https://assets.mixkit.co/active_storage/sfx/2713/2713-preview.mp3',
  },
};

class AudioManager {
  private ambientAudio: HTMLAudioElement | null = null;
  private enabled = true;

  playEffect(effect: keyof typeof audioLibrary.effects) {
    if (!this.enabled) return;
    const audio = audioLibrary.effects[effect];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {}); // Silenciar si no hay permiso
    }
  }

  playAmbient(ambient: keyof typeof audioLibrary.ambient, loop = true) {
    if (!this.enabled) return;

    if (this.ambientAudio) {
      this.ambientAudio.pause();
    }

    const audio = new Audio(audioLibrary.ambient[ambient]);
    audio.loop = loop;
    audio.volume = 0.3;
    audio.play().catch(() => {});
    this.ambientAudio = audio;
  }

  stopAmbient() {
    if (this.ambientAudio) {
      this.ambientAudio.pause();
      this.ambientAudio = null;
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && this.ambientAudio) {
      this.ambientAudio.pause();
    }
  }
}

export const audioManager = new AudioManager();
