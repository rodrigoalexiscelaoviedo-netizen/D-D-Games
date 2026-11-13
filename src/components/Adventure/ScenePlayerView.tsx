import type { PlayerSceneData, PlayerOptionData } from '../../lib/adventure-types';
import type { AdventureModule, ModuleScene } from '../../content/modules/types';
import { PlayerVisuals } from './SceneVisuals';
import './playthrough-screen.css';

interface Props {
  scene: PlayerSceneData;
  options: PlayerOptionData[];
  onSelectOption?: (optionId: string) => Promise<void>;
  isLoading?: boolean;
  module?: AdventureModule;
  moduleScene?: ModuleScene;
  flags?: Record<string, boolean>;
}

export const ScenePlayerView = ({ scene, options, onSelectOption, isLoading, module, moduleScene, flags = {} }: Props) => {
  const content =
    module && moduleScene ? (
      <PlayerVisuals module={module} scene={moduleScene} isDM={false} flags={flags} />
    ) : (
      scene.player_text && <p className="ps-player-text">{scene.player_text}</p>
    );

  if (scene.scene_type === 'combate') {
    return (
      <div className="ps-player-body">
        {content}
        <p className="ps-banner" role="status">
          ¡Combate! Preparen sus armas. El director dirige la pelea.
        </p>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="ps-player-body">
        {content}
        <p className="ps-end">Fin de la aventura. Gracias por jugar.</p>
      </div>
    );
  }

  if (options.length === 1) {
    return (
      <div className="ps-player-body">
        {content}
        <button
          className="ps-btn ps-btn-primary"
          onClick={() => onSelectOption?.(options[0].id)}
          disabled={isLoading}
        >
          Continuar →
        </button>
      </div>
    );
  }

  return (
    <div className="ps-player-body">
      {content}
      <section className="ps-player-choices" aria-labelledby="ps-choices-title">
        <h2 id="ps-choices-title" className="ps-subtitle-player">¿Qué hacen?</h2>
        <p className="ps-panel-note">Elijan una opción. La aventura sigue desde ahí.</p>
        <div className="ps-option-list">
          {options.map((opt) => (
            <button
              key={opt.id}
              className="ps-option"
              onClick={() => onSelectOption?.(opt.id)}
              disabled={isLoading}
            >
              <span className="ps-option-label">{opt.player_label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
