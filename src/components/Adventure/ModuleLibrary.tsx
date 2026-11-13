import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { MODULES, validateModule } from '../../content/modules';
import type { AdventureModule } from '../../content/modules/types';
import { findInstalledAdventureId, installModule } from '../../lib/module-installer';

const SCENE_TYPE_LABEL: Record<string, string> = {
  narracion: 'Narración',
  decision: 'Decisión',
  tirada: 'Pruebas',
  combate: 'Combate',
  descanso: 'Descanso',
};

type Status = { state: 'checking' } | { state: 'available' } | { state: 'installing' } | { state: 'installed'; adventureId: string } | { state: 'error'; message: string };

export const ModuleLibrary = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [notice, setNotice] = useState('');

  useEffect(() => {
    MODULES.forEach(async (mod) => {
      setStatus((s) => ({ ...s, [mod.slug]: { state: 'checking' } }));
      try {
        const id = await findInstalledAdventureId(mod);
        setStatus((s) => ({ ...s, [mod.slug]: id ? { state: 'installed', adventureId: id } : { state: 'available' } }));
      } catch (err) {
        setStatus((s) => ({ ...s, [mod.slug]: { state: 'error', message: (err as Error).message } }));
      }
    });
  }, []);

  const handleInstall = async (mod: AdventureModule) => {
    if (!user) return;
    setStatus((s) => ({ ...s, [mod.slug]: { state: 'installing' } }));
    try {
      const result = await installModule(mod, user.id);
      setStatus((s) => ({ ...s, [mod.slug]: { state: 'installed', adventureId: result.adventureId } }));
      setNotice(
        `"${mod.title}" instalada.` +
          (result.monstersAdded.length ? ` Añadidos al bestiario: ${result.monstersAdded.join(', ')}.` : ''),
      );
    } catch (err) {
      setStatus((s) => ({ ...s, [mod.slug]: { state: 'error', message: (err as Error).message } }));
    }
  };

  return (
    <div className="module-library page-pad">
      <button className="btn-secondary" onClick={() => navigate(`/campaign/${campaignId}/adventures`)}>
        ← Aventuras
      </button>

      <header className="module-library-header">
        <h1>Biblioteca de módulos</h1>
        <p>
          Una campaña completa de nivel 1 a 4 en tres aventuras enlazadas. Cada módulo incluye texto para leer en voz alta,
          notas de DM, mapas tácticos con niebla de guerra, documentos para entregar a los jugadores, pruebas con dados,
          PNJ con indicaciones de voz y varios finales.
        </p>
      </header>

      {notice && <div className="module-notice" role="status">{notice}</div>}

      <div className="module-grid">
        {MODULES.map((mod, idx) => (
          <ModuleCard
            key={mod.slug}
            mod={mod}
            chapter={idx + 1}
            status={status[mod.slug] ?? { state: 'checking' }}
            onInstall={() => handleInstall(mod)}
            onPlay={() => navigate(`/campaign/${campaignId}/adventures`)}
            onPreview={() => navigate(`/campaign/${campaignId}/modules/${mod.slug}`)}
          />
        ))}
      </div>

      <footer className="module-legal">
        Aventuras originales escritas para D&amp;D VTT. Las estadísticas de los monstruos se basan en el System Reference
        Document 5.1 de Wizards of the Coast LLC, disponible bajo licencia{' '}
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC-BY-4.0</a>.
        Fotografías de escena de Unsplash; ver <a href="/modules/CREDITOS.md" target="_blank" rel="noreferrer">créditos</a>.
      </footer>
    </div>
  );
};

const ModuleCard = ({
  mod,
  chapter,
  status,
  onInstall,
  onPlay,
  onPreview,
}: {
  mod: AdventureModule;
  chapter: number;
  status: Status;
  onInstall: () => void;
  onPlay: () => void;
  onPreview: () => void;
}) => {
  const [coverFailed, setCoverFailed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const issues = import.meta.env.DEV ? validateModule(mod) : [];

  const stats = {
    escenas: mod.scenes.length,
    mapas: mod.scenes.filter((s) => s.map).length,
    documentos: mod.scenes.reduce((n, s) => n + (s.handouts?.length ?? 0), 0),
    combates: mod.scenes.filter((s) => s.type === 'combate').length,
    finales: mod.scenes.filter((s) => s.ending).length,
  };

  return (
    <article className="module-card" style={{ ['--accent' as string]: mod.accent }}>
      <div className="module-cover">
        {mod.cover && !coverFailed ? (
          <img src={mod.cover} alt="" onError={() => setCoverFailed(true)} />
        ) : (
          <div className="module-cover-fallback" aria-hidden="true" />
        )}
        <span className="module-chapter">Capítulo {chapter}</span>
        <span className="module-level">Nivel {mod.level}</span>
      </div>

      <div className="module-body">
        <h2>{mod.title}</h2>
        <p className="module-subtitle">{mod.subtitle}</p>
        <p className="module-meta">{mod.players} · {mod.duration}</p>
        <p className="module-synopsis">{mod.synopsis}</p>

        <ul className="module-stats">
          {Object.entries(stats).map(([k, v]) => (
            <li key={k}><strong>{v}</strong> {k}</li>
          ))}
        </ul>

        {issues.length > 0 && (
          <ul className="module-issues">
            {issues.map((i) => <li key={i}>⚠ {i}</li>)}
          </ul>
        )}

        <div className="module-actions">
          {status.state === 'installed' ? (
            <button className="btn-primary" onClick={onPlay}>✓ Instalada · Jugar</button>
          ) : (
            <button
              className="btn-primary"
              onClick={onInstall}
              disabled={status.state === 'installing' || status.state === 'checking'}
            >
              {status.state === 'installing' ? 'Instalando…' : status.state === 'checking' ? 'Comprobando…' : 'Instalar aventura'}
            </button>
          )}
          <button className="btn-secondary" onClick={onPreview}>📖 Preparar</button>
          <button className="btn-secondary" onClick={() => setShowGuide((v) => !v)}>
            {showGuide ? 'Ocultar índice' : 'Índice'}
          </button>
        </div>
        {status.state === 'error' && <p className="module-error">{status.message}</p>}

        {showGuide && (
          <ol className="module-guide">
            {mod.scenes.map((s) => (
              <li key={s.key}>
                <span className={`scene-chip scene-chip-${s.type}`}>{SCENE_TYPE_LABEL[s.type]}</span>
                <strong>{s.title}</strong>
                {s.encounter && <span className="module-guide-enc"> · {s.encounter.count} × {s.encounter.monster}</span>}
                {s.map && <span title="Mapa táctico"> 🗺️</span>}
                {s.handouts?.length ? <span title="Documentos"> 📜</span> : null}
                {s.ending && <span className="module-guide-end"> · final</span>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </article>
  );
};
