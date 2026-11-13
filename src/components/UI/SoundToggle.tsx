import { useEffect, useState } from 'react';
import { audioManager } from '../../lib/audio';

/** Activa o silencia la música y los efectos. La preferencia se recuerda entre visitas. */
export const SoundToggle = () => {
  const [enabled, setEnabled] = useState(audioManager.isEnabled());

  useEffect(() => audioManager.subscribe(setEnabled), []);

  return (
    <button
      type="button"
      className={`sound-toggle ${enabled ? 'is-on' : ''}`}
      aria-pressed={enabled}
      onClick={() => audioManager.setEnabled(!enabled)}
      title={enabled ? 'Silenciar música y efectos' : 'Activar música y efectos'}
    >
      <span aria-hidden="true">♪</span>
      {enabled ? 'Sonido activado' : 'Sonido apagado'}
    </button>
  );
};
