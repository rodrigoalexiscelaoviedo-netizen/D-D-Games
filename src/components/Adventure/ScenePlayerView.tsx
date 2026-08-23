import type { PlayerSceneData, PlayerOptionData } from '../../lib/adventure-types';

interface Props {
  scene: PlayerSceneData;
  options: PlayerOptionData[];
}

export const ScenePlayerView = ({ scene, options }: Props) => {
  return (
    <div className="scene-player">
      <div className="scene-content">
        {scene.player_text && <div className="scene-text">{scene.player_text}</div>}
      </div>

      {options.length > 0 && (
        <div className="scene-options">
          {options.map((opt) => (
            <button key={opt.id} className="option-btn">
              {opt.player_label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
