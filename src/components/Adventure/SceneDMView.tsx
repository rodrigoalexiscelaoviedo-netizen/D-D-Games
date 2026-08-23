import type { Scene, SceneOption } from '../../lib/adventure-types';

interface Props {
  scene: Scene;
  options: SceneOption[];
  hiddenOptions: SceneOption[];
}

export const SceneDMView = ({ scene, options, hiddenOptions }: Props) => {
  return (
    <div className="scene-dm">
      <div className="scene-content">
        <div className="dm-text">
          <strong>Vista DM:</strong>
          <p>{scene.dm_text}</p>
        </div>

        {scene.player_text && (
          <div className="player-text">
            <strong>Qué ven los jugadores:</strong>
            <p>{scene.player_text}</p>
          </div>
        )}

        {scene.encounter && (
          <div className="encounter-info">
            <strong>Encuentro:</strong>
            <ul>
              {scene.encounter.enemies?.map((enemy: string) => (
                <li key={enemy}>{enemy}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="scene-options">
        {scene.scene_type === 'combate' && (
          <div className="combat-section">
            <p className="combat-label">Escena de combate</p>
            <button className="btn-primary" disabled>
              Iniciar combate (pendiente Paso 4)
            </button>
          </div>
        )}

        {options.length > 0 && scene.scene_type !== 'combate' && (
          <div className="visible-options">
            <h3>Opciones disponibles</h3>
            {options.map((opt) => (
              <div key={opt.id} className="option-card">
                <p className="option-label">{opt.player_label}</p>
                {opt.dm_note && <p className="dm-note">DM: {opt.dm_note}</p>}
                {opt.sets_flag && <p className="flag-set">Marca flag: {opt.sets_flag}</p>}
              </div>
            ))}
          </div>
        )}

        {hiddenOptions.length > 0 && (
          <div className="hidden-options">
            <h3>Opciones bloqueadas</h3>
            {hiddenOptions.map((opt) => (
              <div key={opt.id} className="option-card blocked">
                <p className="option-label">{opt.player_label}</p>
                <p className="blocked-reason">Requiere: {opt.requires_flag}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
