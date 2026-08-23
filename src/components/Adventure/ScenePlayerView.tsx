import type { PlayerSceneData, PlayerOptionData } from '../../lib/adventure-types';

interface Props {
  scene: PlayerSceneData;
  options: PlayerOptionData[];
  onSelectOption?: (optionId: string) => Promise<void>;
  isLoading?: boolean;
}

export const ScenePlayerView = ({ scene, options, onSelectOption, isLoading }: Props) => {
  if (scene.scene_type === 'combate') {
    return (
      <div className="scene-player">
        <div className="scene-content">
          {scene.player_text && <div className="scene-text">{scene.player_text}</div>}
        </div>
        <div className="scene-options">
          <button className="option-btn" disabled>
            Iniciar combate (pendiente Paso 4)
          </button>
        </div>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="scene-player">
        <div className="scene-content">
          {scene.player_text && <div className="scene-text">{scene.player_text}</div>}
        </div>
        <div className="scene-options">
          <p className="final-text">Fin de la aventura.</p>
        </div>
      </div>
    );
  }

  if (options.length === 1) {
    return (
      <div className="scene-player">
        <div className="scene-content">
          {scene.player_text && <div className="scene-text">{scene.player_text}</div>}
        </div>
        <div className="scene-options">
          <button
            className="option-btn"
            onClick={() => onSelectOption?.(options[0].id)}
            disabled={isLoading}
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="scene-player">
      <div className="scene-content">
        {scene.player_text && <div className="scene-text">{scene.player_text}</div>}
      </div>
      <div className="scene-options">
        {options.map((opt) => (
          <button
            key={opt.id}
            className="option-btn"
            onClick={() => onSelectOption?.(opt.id)}
            disabled={isLoading}
          >
            {opt.player_label}
          </button>
        ))}
      </div>
    </div>
  );
};
