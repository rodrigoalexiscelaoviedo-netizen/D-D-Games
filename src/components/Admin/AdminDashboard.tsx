import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { generateBulkAdventures, getGeneratedAdventures } from '../../lib/adventure-bulk-generator';

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

  useEffect(() => {
    checkAdmin();
    loadStats();
  }, []);

  const checkAdmin = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      // In a real app, check against admin list
      // For now, allow all authenticated users
      setIsAdmin(!!user);
      setLoading(false);
    } catch (error) {
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
    }
  };

  const handleGenerateAdventures = async () => {
    if (!window.confirm('Generar 10+ aventuras con Gemini? (puede tomar 5-10 minutos)')) return;

    setGenerating(true);
    try {
      const result = await generateBulkAdventures((current, total, name) => {
        setProgress({ current, total, name });
      });

      alert(
        `Generación completada:\n✓ ${result.success} aventuras\n✗ ${result.failed} fallidas${
          result.errors.length > 0 ? `\n\nErrores:\n${result.errors.slice(0, 3).join('\n')}` : ''
        }`
      );

      setProgress(null);
      loadStats();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error: ${msg}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleClearAdventures = async () => {
    if (!window.confirm('¿Borrar TODAS las aventuras? No se puede deshacer.')) return;

    try {
      await supabase.from('scenes').delete().neq('id', 'null');
      await supabase.from('adventures').delete().neq('id', 'null');
      alert('Aventuras eliminadas');
      loadStats();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error: ${msg}`);
    }
  };

  if (loading) return <div className="page-pad">Verificando permisos...</div>;

  if (!isAdmin) {
    return (
      <div className="page-pad">
        <p>No tienes acceso a este panel.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard page-pad">
      <header className="admin-header">
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          ← Dashboard
        </button>
        <h1>⚙️ Panel Administrativo</h1>
      </header>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-label">Aventuras</div>
          <div className="stat-value">{adventures.length}</div>
          <div className="stat-detail">Generadas con Gemini</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Criaturas</div>
          <div className="stat-value">{creatures}</div>
          <div className="stat-detail">Importadas de Open5e</div>
        </div>
      </div>

      <div className="admin-actions">
        <section className="admin-section">
          <h2>Generación de Aventuras</h2>
          <p className="section-hint">
            Genera 10 aventuras completas usando Gemini AI. Cada una con múltiples escenas,
            encuentros y opciones de juego.
          </p>

          {!generating && !progress && (
            <div>
              <button className="btn-primary btn-large" onClick={handleGenerateAdventures}>
                🚀 Generar 10+ Aventuras
              </button>
              <p className="action-hint">Tiempo estimado: 5-10 minutos</p>
            </div>
          )}

          {progress && (
            <div className="generation-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
              <p className="progress-text">
                {progress.current}/{progress.total}: <strong>{progress.name}</strong>
              </p>
            </div>
          )}
        </section>

        <section className="admin-section">
          <h2>Aventuras Generadas</h2>
          {adventures.length === 0 ? (
            <p className="empty-hint">No hay aventuras aún. Genera algunas para empezar.</p>
          ) : (
            <div className="adventures-list">
              {adventures.map((adv) => (
                <div key={adv.id} className="adventure-item">
                  <div className="adventure-info">
                    <h4>{adv.title}</h4>
                    <p className="adventure-meta">
                      Nivel {adv.suggested_level} • {adv.scene_count} escenas • {adv.duration}
                    </p>
                    {adv.synopsis && <p className="adventure-synopsis">{adv.synopsis}</p>}
                  </div>
                  <div className="adventure-actions">
                    <button
                      className="btn-secondary btn-small"
                      onClick={() => navigate(`/campaign/1/adventures`)}
                    >
                      Ver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="admin-section danger">
          <h2>Acciones Peligrosas</h2>
          <p className="section-hint">Estas acciones no se pueden deshacer.</p>
          <button className="btn-danger" onClick={handleClearAdventures}>
            🗑️ Borrar todas las aventuras
          </button>
        </section>
      </div>

      <style>{`
        .admin-dashboard {
          max-width: 1000px;
        }

        .admin-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .admin-header h1 {
          margin: 0;
          flex: 1;
        }

        .admin-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }

        .stat-label {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #a855f7;
          margin-bottom: 8px;
        }

        .stat-detail {
          font-size: 12px;
          color: #666;
        }

        .admin-actions {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .admin-section {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 20px;
        }

        .admin-section.danger {
          border-color: #a64d4d;
          background: rgba(166, 77, 77, 0.05);
        }

        .admin-section h2 {
          margin: 0 0 12px 0;
          font-size: 18px;
        }

        .section-hint {
          margin: 0 0 16px 0;
          font-size: 14px;
          color: #999;
        }

        .action-hint {
          margin-top: 8px;
          font-size: 12px;
          color: #666;
        }

        .generation-progress {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .progress-bar {
          width: 100%;
          height: 24px;
          background: #1a1a1a;
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid #333;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #a855f7, #a855f7);
          transition: width 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          color: white;
          font-weight: 600;
        }

        .progress-text {
          margin: 0;
          font-size: 14px;
          color: #ccc;
        }

        .progress-text strong {
          color: #a855f7;
        }

        .adventures-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .adventure-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 6px;
          gap: 16px;
        }

        .adventure-info {
          flex: 1;
        }

        .adventure-info h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          color: #fff;
        }

        .adventure-meta {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #999;
        }

        .adventure-synopsis {
          margin: 0;
          font-size: 13px;
          color: #ccc;
          line-height: 1.4;
        }

        .adventure-actions {
          display: flex;
          gap: 8px;
        }

        .btn-large {
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
        }

        .empty-hint {
          color: #666;
          font-size: 14px;
          margin: 0;
        }
      `}</style>
    </div>
  );
};
