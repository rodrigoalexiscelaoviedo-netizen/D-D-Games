import { EncounterPrepView } from '../Combat/EncounterPrepView';
import type { Scene, SceneOption } from '../../lib/adventure-types';

interface Props {
  scene: Scene;
  options: SceneOption[];
  hiddenOptions: SceneOption[];
  onSelectOption?: (optionId: string) => void | Promise<void>;
  onGoToPreviousScene?: () => Promise<void>;
  canGoToPreviousScene?: boolean;
  onInitiateCombat?: () => Promise<void>;
  onResolveCombatVictory?: () => Promise<void>;
  onResolveCombatDefeat?: () => Promise<void>;
  onCancelCombat?: () => Promise<void>;
  isLoading?: boolean;
  sceneCount?: number;
}

export const SceneDMView = ({
  scene,
  options,
  hiddenOptions,
  onSelectOption,
  onGoToPreviousScene,
  canGoToPreviousScene,
  onInitiateCombat,
  onResolveCombatVictory,
  onResolveCombatDefeat,
  onCancelCombat,
  isLoading,
  sceneCount,
}: Props) => {
  return (
    <div className="scene-dm">
      {sceneCount && sceneCount > 0 && (
        <div className="scene-progress">
          Escena {scene.scene_order} de {sceneCount} · {scene.title} · {scene.scene_type}
        </div>
      )}

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
            <p>
              {scene.encounter.count} × {scene.encounter.bestiary_name}
            </p>
            {scene.encounter.note && (
              <p className="encounter-note">{scene.encounter.note}</p>
            )}
          </div>
        )}
      </div>

      <div className="scene-options">
        {scene.scene_type === 'combate' && (
          <>
            <EncounterPrepView
              scene={scene}
              onInitiateCombat={onInitiateCombat}
              isLoading={isLoading}
            />
            {(onResolveCombatVictory || onResolveCombatDefeat || onCancelCombat) && (
              <div className="combat-manual-resolution">
                <p className="resolution-label">O resolver manualmente:</p>
                <div className="resolution-buttons">
                  {onResolveCombatVictory && (
                    <button
                      className="btn-secondary"
                      onClick={onResolveCombatVictory}
                      disabled={isLoading}
                    >
                      Resolver: Victoria
                    </button>
                  )}
                  {onResolveCombatDefeat && (
                    <button
                      className="btn-secondary"
                      onClick={onResolveCombatDefeat}
                      disabled={isLoading}
                    >
                      Resolver: Derrota
                    </button>
                  )}
                  {onCancelCombat && (
                    <button
                      className="btn-secondary"
                      onClick={onCancelCombat}
                      disabled={isLoading}
                      style={{ opacity: '0.7' }}
                    >
                      Cancelar combate
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {options.length > 0 && scene.scene_type !== 'combate' && (
          <div className="visible-options">
            <h3>Opciones disponibles</h3>
            {options.map((opt) => (
              <button
                key={opt.id}
                className={`option-card clickable ${options.length === 1 ? 'single' : ''}`}
                onClick={() => onSelectOption?.(opt.id)}
                disabled={isLoading}
              >
                <p className="option-label">{opt.player_label}</p>
                {opt.dm_note && <p className="dm-note">DM: {opt.dm_note}</p>}
              </button>
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

        {onGoToPreviousScene && (
          <div className="previous-scene-section">
            <button
              className="btn-secondary"
              onClick={onGoToPreviousScene}
              disabled={isLoading || !canGoToPreviousScene}
            >
              ← Escena anterior
            </button>
            <p className="no-undo-note">No deshace flags</p>
          </div>
        )}
      </div>
    </div>
  );
};
