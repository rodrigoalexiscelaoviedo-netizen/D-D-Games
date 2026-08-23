import type { Scene, SceneOption } from '../../lib/adventure-types';

interface Props {
  scene: Scene;
  options: SceneOption[];
}

export const ScenePlayerView = ({ scene, options }: Props) => {
  return (
    <div className="scene-player">
      <div className="scene-content">
        {scene.player_text && <div className="scene-text">{scene.player_text}</div>}
        {!scene.player_text && scene.dm_text && (
          <div className="scene-text">{scene.dm_text}</div>
        )}
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
