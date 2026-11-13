import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { generateBulkAdventures, getGeneratedAdventures } from '../../lib/adventure-bulk-generator';
import './admin-dashboard.css';

interface GenerationProgress {
  current: number;
  total: number;
  name: string;
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [adventures, setAdventures] = useState<any[]>([]);
  const [creatures, setCreatures] = useState<number>(0);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkAdmin();
    loadStats();
  }, []);

  const checkAdmin = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      // TODO: esto no es un control de acceso real. Cualquier usuario con sesión entra.
      // Falta una lista de administradores (por ejemplo, una tabla con RLS).
      setIsAdmin(!!user);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { count: creatureCount } = await supabase
        .from('creatures')
        .select('*', { count: 'exact', head: true });

      const advs = await getGeneratedAdventures();
      setAdventures(advs);
      setCreatures(creatureCount || 0);
    } catch (error) {
      console.error('Error loading stats:', error);
      setNotice({ kind: 'error', text: 'No pudimos cargar los números. Probá recargar la página.' });
    }
  };

  const handleGenerateAdventures = async () => {
    if (!window.confirm('¿Generar 10 aventuras nuevas con Gemini? Puede tardar entre 5 y 10 minutos.')) return;

    setGenerating(true);
    setNotice(null);
    try {
      const result = await generateBulkAdventures((current, total, name) => {
        setProgress({ current, total, name });
      });

      const errors = result.errors.length > 0 ? ` Primeros errores: ${result.errors.slice(0, 3).join(' · ')}` : '';
      setNotice({
        kind: result.failed > 0 ? 'error' : 'ok',
        text: `Terminó la generación: ${result.success} aventuras creadas y ${result.failed} con error.${errors}`,
      });

      setProgress(null);
      loadStats();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      setNotice({ kind: 'error', text: `No se pudo generar. ${msg}` });
    } finally {
      setGenerating(false);
    }
  };

  const handleClearAdventures = async () => {
    if (!window.confirm('¿Borrar las aventuras? Esto no se puede deshacer.')) return;

    try {
      await supabase.from('scenes').delete().neq('id', 'null');
      await supabase.from('adventures').delete().neq('id', 'null');
      setNotice({ kind: 'ok', text: 'Listo: las aventuras que podías borrar ya no están.' });
      loadStats();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      setNotice({ kind: 'error', text: `No se pudieron borrar. ${msg}` });
    }
  };

  if (loading) return <div className="ad-state" role="status"><p>Revisando tu acceso…</p></div>;

  if (!isAdmin) {
    return (
      <div className="ad-state">
        <p>No tenés acceso a este panel.</p>
        <button className="ad-btn ad-btn-ghost" onClick={() => navigate('/dashboard')}>
          Volver al inicio
        </button>
      </div>
    );
  }

  const pct = progress ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="ad">
      <header className="ad-top">
        <button className="ad-back" onClick={() => navigate('/dashboard')}>← Volver al inicio</button>
        <p className="ad-eyebrow">Herramientas internas</p>
        <h1>Panel de administración</h1>
        <p className="ad-lede">Desde acá generás aventuras nuevas y mirás cuántos datos hay cargados.</p>
      </header>

      <main className="ad-main">
        {notice && (
          <div className={`ad-notice ad-notice-${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
            <p>{notice.text}</p>
            <button className="ad-btn ad-btn-ghost" onClick={() => setNotice(null)}>Entendido</button>
          </div>
        )}

        <section className="ad-stats" aria-label="Números">
          <div className="ad-stat">
            <span className="ad-stat-label">Aventuras</span>
            <span className="ad-stat-value">{adventures.length}</span>
            <span className="ad-stat-hint">Generadas con Gemini</span>
          </div>
          <div className="ad-stat">
            <span className="ad-stat-label">Criaturas</span>
            <span className="ad-stat-value">{creatures}</span>
            <span className="ad-stat-hint">Importadas de Open5e</span>
          </div>
        </section>

        <section className="ad-card" aria-labelledby="ad-gen-title">
          <h2 id="ad-gen-title">Crear aventuras nuevas</h2>
          <p className="ad-hint">
            Crea 10 aventuras completas con Gemini. Cada una tiene varias escenas, encuentros y decisiones para el grupo.
          </p>

          {!generating && !progress && (
            <div className="ad-row">
              <button className="ad-btn ad-btn-primary" onClick={handleGenerateAdventures}>
                Generar 10 aventuras
              </button>
              <span className="ad-hint">Tarda entre 5 y 10 minutos.</span>
            </div>
          )}

          {progress && (
            <div className="ad-progress" role="status">
              <div className="ad-bar" aria-hidden="true">
                <div className="ad-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <p>
                Aventura {progress.current} de {progress.total}: <strong>{progress.name}</strong>
              </p>
            </div>
          )}
        </section>

        <section className="ad-card" aria-labelledby="ad-list-title">
          <h2 id="ad-list-title">Aventuras generadas</h2>
          {adventures.length === 0 ? (
            <p className="ad-empty">Todavía no hay aventuras generadas. Creá algunas arriba.</p>
          ) : (
            <ul className="ad-list">
              {adventures.map((adv) => (
                <li key={adv.id} className="ad-item">
                  <h3>{adv.title}</h3>
                  <p className="ad-meta">
                    Nivel {adv.suggested_level} · {adv.scene_count} escenas · {adv.duration}
                  </p>
                  {adv.synopsis && <p className="ad-synopsis">{adv.synopsis}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ad-card ad-danger" aria-labelledby="ad-danger-title">
          <h2 id="ad-danger-title">Zona de peligro</h2>
          <p className="ad-hint">
            Esto borra las aventuras que tenés permiso de borrar. No se puede deshacer.
          </p>
          <button className="ad-btn ad-btn-danger" onClick={handleClearAdventures}>
            Borrar aventuras
          </button>
        </section>
      </main>
    </div>
  );
};
