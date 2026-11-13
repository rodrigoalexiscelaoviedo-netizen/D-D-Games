import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MODULES } from '../../content/modules';
import { DMVisuals, PlayerVisuals } from './SceneVisuals';

/**
 * Modo preparación: el DM lee el módulo escena a escena, alterna vista DM/jugador
 * y prueba mapas, niebla y documentos con flags locales (no toca la base de datos).
 */
export const ModulePreview = () => {
  const { slug, campaignId } = useParams();
  const navigate = useNavigate();
  const mod = MODULES.find((m) => m.slug === slug);
  const [order, setOrder] = useState(1);
  const [asPlayer, setAsPlayer] = useState(false);
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  if (!mod) return <div className="page-pad">Módulo no encontrado.</div>;
  const scene = mod.scenes.find((s) => s.order === order) ?? mod.scenes[0];
  const toggle = (flag: string) => setFlags((f) => ({ ...f, [flag]: !f[flag] }));

  return (
    <div className="module-preview page-pad">
      <div className="module-preview-bar">
        <button
          className="btn-secondary"
          onClick={() => navigate(campaignId ? `/campaign/${campaignId}/modules` : '/dashboard')}
        >
          ← Biblioteca
        </button>
        <strong className="module-preview-title">Preparación · {mod.title}</strong>
        <div className="view-switch" role="group" aria-label="Vista">
          <button className={!asPlayer ? 'active' : ''} onClick={() => setAsPlayer(false)}>Vista DM</button>
          <button className={asPlayer ? 'active' : ''} onClick={() => setAsPlayer(true)}>Vista jugadores</button>
        </div>
      </div>

      <div className="module-preview-layout">
        <nav className="module-preview-nav" aria-label="Escenas">
          {mod.scenes.map((s) => (
            <button
              key={s.key}
              className={s.order === scene.order ? 'active' : ''}
              onClick={() => setOrder(s.order)}
            >
              <span className="nav-order">{s.order}</span>
              <span className="nav-title">{s.title}</span>
              <span className={`scene-chip scene-chip-${s.type}`}>{s.type}</span>
            </button>
          ))}
        </nav>

        <main className="module-preview-main">
          {asPlayer ? (
            <PlayerVisuals module={mod} scene={scene} isDM={false} flags={flags} />
          ) : (
            <>
              <DMVisuals module={mod} scene={scene} isDM flags={flags} onToggleFlag={toggle} />
              <section className="visual-block">
                <h3>🔒 Solo para el DM</h3>
                <div className="dm-text">{scene.dmText.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}</div>
              </section>
              {scene.options.length > 0 && (
                <section className="visual-block">
                  <h3>{scene.type === 'combate' ? '⚔️ Resultado del combate' : '➡️ Opciones'}</h3>
                  <ul className="preview-options">
                    {scene.options.map((o) => {
                      const target = mod.scenes.find((s) => s.key === o.to);
                      return (
                        <li key={o.label}>
                          <button className="link-btn" onClick={() => target && setOrder(target.order)}>
                            {o.label}
                          </button>
                          {target && <span className="preview-target"> → {target.order}. {target.title}</span>}
                          {o.requiresFlag && <span className="preview-flag"> · requiere {o.requiresFlag}</span>}
                          {o.setsFlag && <span className="preview-flag"> · activa {o.setsFlag}</span>}
                          {o.dmNote && <p className="dm-note">{o.dmNote}</p>}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
