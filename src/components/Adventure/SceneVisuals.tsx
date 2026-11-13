import { useState } from 'react';
import type { AdventureModule, Handout, ModuleScene, SkillCheck } from '../../content/modules/types';
import { BattleMap } from './BattleMap';

/** Claves de flags (playthroughs.flags) que sincronizan lo que el DM comparte. */
export const visualFlags = {
  map: (order: number) => `vis:map:${order}`,
  area: (order: number, areaId: string) => `vis:area:${order}:${areaId}`,
  handout: (id: string) => `vis:handout:${id}`,
};

interface Props {
  module: AdventureModule;
  scene: ModuleScene;
  isDM: boolean;
  flags: Record<string, boolean>;
  onToggleFlag?: (flag: string) => void;
}

export const SceneIllustration = ({ module, scene }: { module: AdventureModule; scene: ModuleScene }) => {
  // Cadena de respaldo: imagen de la escena → portada del módulo → degradado
  const candidates = [scene.image, module.cover].filter((s): s is string => Boolean(s));
  const [failedCount, setFailedCount] = useState(0);
  const src = candidates[failedCount];
  return (
    <figure className="scene-illustration" style={{ ['--accent' as string]: module.accent }}>
      {src ? (
        <img key={src} src={src} alt="" onError={() => setFailedCount((n) => n + 1)} />
      ) : (
        <div className="scene-illustration-fallback" aria-hidden="true" />
      )}
      <figcaption>
        <span className="scene-illustration-module">{module.title}</span>
        <span className="scene-illustration-title">{scene.title}</span>
      </figcaption>
    </figure>
  );
};

export const ReadAloud = ({ text, label }: { text: string; label?: string }) => (
  <section className="read-aloud">
    {label && <h3 className="read-aloud-label">{label}</h3>}
    {text.split('\n\n').map((p, i) => (
      <p key={i}>{p}</p>
    ))}
  </section>
);

export const HandoutCard = ({ handout }: { handout: Handout }) => (
  <article className={`handout handout-${handout.kind}`}>
    <h4>{handout.title}</h4>
    <div className="handout-text">
      {handout.text.split('\n').map((line, i) => (line ? <p key={i}>{line}</p> : <br key={i} />))}
    </div>
    {handout.signature && <p className="handout-signature">— {handout.signature}</p>}
  </article>
);

/** Ayudas visuales para los jugadores: solo lo que el DM ha compartido. */
export const PlayerVisuals = ({ module, scene, flags }: Props) => {
  const revealedAreas = new Set(
    (scene.map?.areas ?? []).filter((a) => flags[visualFlags.area(scene.order, a.id)]).map((a) => a.id),
  );
  const handouts = (scene.handouts ?? []).filter((h) => flags[visualFlags.handout(h.id)]);
  const mapShared = scene.map && flags[visualFlags.map(scene.order)];

  return (
    <div className="scene-visuals">
      <SceneIllustration key={scene.key} module={module} scene={scene} />
      <ReadAloud text={scene.readAloud} />
      {mapShared && scene.map && (
        <section className="visual-block">
          <h3>🗺️ {scene.map.name}</h3>
          <div className="battle-map-frame">
            <BattleMap map={scene.map} isDM={false} revealed={revealedAreas} />
          </div>
        </section>
      )}
      {handouts.length > 0 && (
        <section className="visual-block">
          <h3>📜 Documentos</h3>
          <div className="handout-grid">
            {handouts.map((h) => <HandoutCard key={h.id} handout={h} />)}
          </div>
        </section>
      )}
    </div>
  );
};

/** Panel completo del DM: lectura, mapa con niebla, handouts, pruebas, PNJ, tesoro, consejos. */
export const DMVisuals = ({ module, scene, flags, onToggleFlag }: Props) => {
  const [showMarkers, setShowMarkers] = useState(true);
  const revealedAreas = new Set(
    (scene.map?.areas ?? []).filter((a) => flags[visualFlags.area(scene.order, a.id)]).map((a) => a.id),
  );
  const hiddenAreas = (scene.map?.areas ?? []).filter((a) => a.hidden);
  const toggle = (flag: string) => onToggleFlag?.(flag);
  const mapShared = Boolean(flags[visualFlags.map(scene.order)]);

  return (
    <div className="scene-visuals scene-visuals-dm">
      <SceneIllustration key={scene.key} module={module} scene={scene} />
      <ReadAloud text={scene.readAloud} label="📖 Leer en voz alta" />

      {scene.map && (
        <section className="visual-block">
          <div className="visual-block-head">
            <h3>🗺️ {scene.map.name}</h3>
            <div className="visual-block-actions">
              <label className="toggle-inline">
                <input type="checkbox" checked={showMarkers} onChange={(e) => setShowMarkers(e.target.checked)} />
                Marcadores DM
              </label>
              <button
                className={mapShared ? 'btn-secondary btn-small' : 'btn-primary btn-small'}
                onClick={() => toggle(visualFlags.map(scene.order))}
              >
                {mapShared ? 'Ocultar mapa' : 'Mostrar mapa a jugadores'}
              </button>
            </div>
          </div>
          <div className="battle-map-frame">
            <BattleMap
              map={scene.map}
              isDM
              revealed={revealedAreas}
              showDmLayer={showMarkers}
              onToggleArea={(id) => toggle(visualFlags.area(scene.order, id))}
            />
          </div>
          {hiddenAreas.length > 0 && (
            <div className="fog-controls">
              <span>Niebla de guerra:</span>
              {hiddenAreas.map((a) => {
                const on = revealedAreas.has(a.id);
                return (
                  <button
                    key={a.id}
                    className={`chip ${on ? 'chip-on' : ''}`}
                    onClick={() => toggle(visualFlags.area(scene.order, a.id))}
                  >
                    {on ? '👁' : '🌫'} {a.label ?? a.id}
                  </button>
                );
              })}
            </div>
          )}
          {scene.map.dmMarkers && showMarkers && (
            <ul className="marker-legend">
              {scene.map.dmMarkers.map((m, i) => (
                <li key={i} className={`marker-legend-${m.kind}`}>{m.label}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {scene.handouts && scene.handouts.length > 0 && (
        <section className="visual-block">
          <h3>📜 Documentos para los jugadores</h3>
          <div className="handout-grid">
            {scene.handouts.map((h) => {
              const shown = Boolean(flags[visualFlags.handout(h.id)]);
              return (
                <div key={h.id} className="handout-wrap">
                  <HandoutCard handout={h} />
                  <button
                    className={shown ? 'btn-secondary btn-small' : 'btn-primary btn-small'}
                    onClick={() => toggle(visualFlags.handout(h.id))}
                  >
                    {shown ? '✓ Compartido · ocultar' : 'Entregar a los jugadores'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {scene.checks && scene.checks.length > 0 && (
        <section className="visual-block">
          <h3>🎲 Pruebas de característica</h3>
          <div className="check-grid">
            {scene.checks.map((c, i) => <SkillCheckCard key={i} check={c} />)}
          </div>
        </section>
      )}

      {Boolean(scene.npcs?.length || scene.treasure?.length || scene.dmTips?.length) && (
        <section className="visual-block dm-notes-grid">
          {scene.npcs && scene.npcs.length > 0 && (
            <div>
              <h3>🎭 PNJ</h3>
              {scene.npcs.map((n) => (
                <div key={n.name} className="npc-note">
                  <strong>{n.name}</strong> <span className="npc-role">· {n.role}</span>
                  <p>{n.voice}</p>
                </div>
              ))}
            </div>
          )}
          {scene.treasure && scene.treasure.length > 0 && (
            <div>
              <h3>💰 Tesoro</h3>
              <ul>{scene.treasure.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          )}
          {scene.dmTips && scene.dmTips.length > 0 && (
            <div>
              <h3>💡 Consejos</h3>
              <ul>{scene.dmTips.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          )}
        </section>
      )}

      <DiceTray />
    </div>
  );
};

const d = (sides: number) => Math.floor(Math.random() * sides) + 1;

const SkillCheckCard = ({ check }: { check: SkillCheck }) => {
  const [mod, setMod] = useState(0);
  const [mode, setMode] = useState<'normal' | 'ventaja' | 'desventaja'>('normal');
  const [roll, setRoll] = useState<{ dice: number[]; total: number } | null>(null);

  const doRoll = () => {
    const a = d(20);
    const b = d(20);
    const kept = mode === 'ventaja' ? Math.max(a, b) : mode === 'desventaja' ? Math.min(a, b) : a;
    setRoll({ dice: mode === 'normal' ? [a] : [a, b], total: kept + mod });
  };
  const success = roll ? roll.total >= check.dc : null;

  return (
    <div className={`check-card ${success === true ? 'check-ok' : success === false ? 'check-fail' : ''}`}>
      <div className="check-head">
        <strong>{check.skill}</strong>
        <span className="check-dc">CD {check.dc}</span>
      </div>
      <div className="check-controls">
        <label>
          Mod.
          <input type="number" value={mod} onChange={(e) => setMod(Number(e.target.value) || 0)} min={-5} max={15} />
        </label>
        <select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
          <option value="normal">Normal</option>
          <option value="ventaja">Ventaja</option>
          <option value="desventaja">Desventaja</option>
        </select>
        <button className="btn-primary btn-small" onClick={doRoll}>Tirar d20</button>
      </div>
      {roll && (
        <p className="check-result">
          🎲 {roll.dice.join(' / ')} {mod >= 0 ? '+' : '−'} {Math.abs(mod)} = <strong>{roll.total}</strong>
          {roll.dice.includes(20) && roll.dice.length === 1 && ' · ¡20 natural!'}
        </p>
      )}
      <p className="check-outcome"><span>Éxito:</span> {check.success}</p>
      <p className="check-outcome"><span>Fallo:</span> {check.failure}</p>
    </div>
  );
};

const DIE_SIDES = [4, 6, 8, 10, 12, 20, 100];

export const DiceTray = () => {
  const [history, setHistory] = useState<string[]>([]);
  const [count, setCount] = useState(1);

  const rollDie = (sides: number) => {
    const rolls = Array.from({ length: count }, () => d(sides));
    const total = rolls.reduce((a, b) => a + b, 0);
    const entry = `${count}d${sides}: ${rolls.join(' + ')}${count > 1 ? ` = ${total}` : ''}`;
    setHistory((h) => [entry, ...h].slice(0, 6));
  };

  return (
    <section className="visual-block dice-tray">
      <div className="visual-block-head">
        <h3>🎲 Bandeja de dados</h3>
        <label className="toggle-inline">
          Cantidad
          <input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} />
        </label>
      </div>
      <div className="dice-buttons">
        {DIE_SIDES.map((s) => (
          <button key={s} className="die-btn" onClick={() => rollDie(s)}>d{s}</button>
        ))}
      </div>
      {history.length > 0 && (
        <ol className="dice-history">
          {history.map((h, i) => <li key={i} className={i === 0 ? 'latest' : ''}>{h}</li>)}
        </ol>
      )}
    </section>
  );
};
