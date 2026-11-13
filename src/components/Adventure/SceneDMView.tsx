import { EncounterPrepView } from '../Combat/EncounterPrepView';
import type { Scene, SceneOption } from '../../lib/adventure-types';
import type { AdventureModule, ModuleScene } from '../../content/modules/types';
import { DMVisuals } from './SceneVisuals';
import './playthrough-screen.css';

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
  module?: AdventureModule;
  moduleScene?: ModuleScene;
  flags?: Record<string, boolean>;
  onToggleFlag?: (flag: string) => void;
}

const SCENE_TYPE_LABEL: Record<string, string> = {
  combate: 'Combate',
  social: 'Escena social',
  exploration: 'Exploración',
};

const paragraphs = (text: string) =>
  text.split('\n\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>);

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
  module,
  moduleScene,
  flags = {},
  onToggleFlag,
}: Props) => {
  const isModule = Boolean(module && moduleScene);
  const isCombat = scene.scene_type === 'combate';
  const monster = module && scene.encounter
    ? module.monsters.find((m) => m.name === scene.encounter?.bestiary_name)
    : undefined;

  return (
    <div className="ps-dm-scene">
      <div className="ps-body">
        {sceneCount && sceneCount > 0 ? (
          <p className="ps-progress">
            Escena {scene.scene_order} de {sceneCount} · {SCENE_TYPE_LABEL[scene.scene_type] ?? scene.scene_type}
          </p>
        ) : null}

        {isModule && module && moduleScene && (
          <DMVisuals module={module} scene={moduleScene} isDM flags={flags} onToggleFlag={onToggleFlag} />
        )}

        <div className="ps-grid">
          {/* Lo que sabe solo el DM */}
          <section className="ps-panel ps-panel-secret" aria-labelledby="ps-secret-title">
            <span className="ps-tag ps-tag-secret">Solo para vos</span>
            <h2 id="ps-secret-title">Notas del director</h2>
            <p className="ps-panel-note">Los jugadores no ven esta parte.</p>
            {paragraphs(scene.dm_text)}

            {scene.encounter && (
              <div className="ps-encounter">
                <strong>
                  {scene.encounter.count} × {scene.encounter.bestiary_name}
                </strong>
                {scene.encounter.note && <p className="ps-panel-note">{scene.encounter.note}</p>}
                {monster && (
                  <dl className="stat-line">
                    <div><dt>PG</dt><dd>{monster.hp}</dd></div>
                    <div><dt>CA</dt><dd>{monster.armor_class}</dd></div>
                    <div><dt>Ataque</dt><dd>+{monster.attack_bonus} · d{monster.damage_dice}</dd></div>
                    <div><dt>XP</dt><dd>{monster.xp_value}</dd></div>
                  </dl>
                )}
                {monster && <p className="ps-panel-note">{monster.description}</p>}
              </div>
            )}
          </section>

          {/* Lo que ven los jugadores */}
          {!isModule && (
            <section className="ps-panel" aria-labelledby="ps-player-title">
              <span className="ps-tag">Visible para la mesa</span>
              <h2 id="ps-player-title">Lo que ven los jugadores</h2>
              {scene.player_text ? (
                paragraphs(scene.player_text)
              ) : (
                <p className="ps-panel-note">Esta escena no tiene texto para los jugadores. Podés describirla de palabra.</p>
              )}
            </section>
          )}

          {/* Decisiones */}
          <section className="ps-panel ps-actions" aria-labelledby="ps-actions-title">
            {isCombat && (
              <>
                <EncounterPrepView
                  scene={scene}
                  onInitiateCombat={onInitiateCombat}
                  isLoading={isLoading}
                />

                {(onResolveCombatVictory || onResolveCombatDefeat || onCancelCombat) && (
                  <div className="ps-manual">
                    <div className="ps-actions-head">
                      <h2>¿Sin usar el combate en pantalla?</h2>
                      <p className="ps-panel-note">
                        Podés decidir el resultado directamente. El grupo pasa a la siguiente escena.
                      </p>
                    </div>
                    <div className="ps-manual-buttons">
                      {onResolveCombatVictory && (
                        <button className="ps-btn ps-btn-ghost" onClick={onResolveCombatVictory} disabled={isLoading}>
                          El grupo gana
                        </button>
                      )}
                      {onResolveCombatDefeat && (
                        <button className="ps-btn ps-btn-ghost" onClick={onResolveCombatDefeat} disabled={isLoading}>
                          El grupo pierde
                        </button>
                      )}
                      {onCancelCombat && (
                        <button className="ps-btn ps-btn-ghost" onClick={onCancelCombat} disabled={isLoading}>
                          Cancelar combate
                        </button>
                      )}
                    </div>
                    {onCancelCombat && (
                      <p className="ps-panel-note">Cancelar no lo guarda en el registro de la aventura.</p>
                    )}
                  </div>
                )}
              </>
            )}

            {!isCombat && options.length > 0 && (
              <>
                <div className="ps-actions-head">
                  <h2 id="ps-actions-title">¿Qué decide el grupo?</h2>
                  <p className="ps-panel-note">Elegí la opción que tomó la mesa. La aventura avanza a la escena que corresponda.</p>
                </div>
                <div className="ps-option-list">
                  {options.map((opt) => (
                    <button
                      key={opt.id}
                      className="ps-option"
                      onClick={() => onSelectOption?.(opt.id)}
                      disabled={isLoading}
                    >
                      <span className="ps-option-label">{opt.player_label}</span>
                      {opt.dm_note && <span className="ps-option-note">Nota: {opt.dm_note}</span>}
                    </button>
                  ))}
                </div>
              </>
            )}

            {!isCombat && options.length === 0 && (
              <p className="ps-panel-note">No hay decisiones disponibles en esta escena.</p>
            )}

            {hiddenOptions.length > 0 && (
              <div className="ps-option-list" aria-label="Opciones bloqueadas">
                <p className="ps-panel-note"><strong>Bloqueadas por ahora</strong></p>
                {hiddenOptions.map((opt) => (
                  <div key={opt.id} className="ps-locked">
                    <span className="ps-locked-label">{opt.player_label}</span>
                    <span className="ps-locked-why">
                      Se desbloquea si el grupo hace algo antes en la aventura.
                    </span>
                    <span className="ps-locked-key">clave: {opt.requires_flag}</span>
                  </div>
                ))}
              </div>
            )}

            {onGoToPreviousScene && (
              <div className="ps-history">
                <button
                  className="ps-btn ps-btn-ghost"
                  onClick={onGoToPreviousScene}
                  disabled={isLoading || !canGoToPreviousScene}
                >
                  ← Volver a la escena anterior
                </button>
                <p className="ps-panel-note">
                  Quita la última decisión del registro. Lo que ya compartiste con la mesa (mapas, documentos) no cambia.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
