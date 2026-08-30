import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface Campaign {
  id: string;
  name: string;
  system: string;
  playstyle: string;
  tone: string;
  user_id: string;
}

export const CampaignHome = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCampaign();
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error: queryError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (queryError) throw queryError;
      if (!data) throw new Error('Campaign not found');
      setCampaign(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading campaign';
      setError(message);
      console.error('Campaign load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `¿Borrar campaña "${campaign?.name}"? Esta acción no se puede deshacer.`
    );
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting campaign';
      setError(message);
      console.error('Delete error:', err);
      setDeleting(false);
    }
  };

  const isOwner = campaign?.user_id === user?.id;

  if (loading) {
    return (
      <div className="campaign-home loading">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando campaña...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="campaign-home error">
        <header className="campaign-header">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            ← Volver
          </button>
        </header>
        <div className="error-state">
          <h2>⚠️ Error</h2>
          <p>{error || 'No se encontró la campaña'}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-home">
      <header className="campaign-header">
        <div className="header-nav">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            ← Mis campañas
          </button>
        </div>
        <div className="header-content">
          <h1>{campaign.name}</h1>
          <p className="campaign-metadata">
            {campaign.system} • {campaign.playstyle} • {campaign.tone}
          </p>
        </div>
      </header>

      <main className="campaign-main">
        <section className="action-section primary">
          <h2>Juego</h2>
          <div className="action-grid">
            <button
              onClick={() => navigate(`/campaign/${campaignId}/adventures`)}
              className="action-btn primary"
              title="Browse and start adventures"
            >
              <span className="btn-icon">🎬</span>
              <span className="btn-label">Aventuras</span>
              <span className="btn-desc">Explorar y comenzar aventuras</span>
            </button>

            <button
              onClick={() => navigate(`/campaign/${campaignId}/characters`)}
              className="action-btn"
              title="Manage party characters"
            >
              <span className="btn-icon">👥</span>
              <span className="btn-label">Personajes</span>
              <span className="btn-desc">Gestionar el grupo</span>
            </button>

            <button
              onClick={() => navigate('/bestiary')}
              className="action-btn"
              title="Browse creatures"
            >
              <span className="btn-icon">📚</span>
              <span className="btn-label">Bestiario</span>
              <span className="btn-desc">500+ criaturas</span>
            </button>

            <button
              onClick={() => navigate(`/campaign/${campaignId}/wiki`)}
              className="action-btn"
              title="Campaign wiki and notes"
            >
              <span className="btn-icon">📖</span>
              <span className="btn-label">Wiki</span>
              <span className="btn-desc">Notas y lore</span>
            </button>
          </div>
        </section>

        {isOwner && (
          <section className="action-section dm-tools">
            <h2>🎲 Herramientas del DJ</h2>
            <div className="action-grid">
              <button
                onClick={() => navigate(`/campaign/${campaignId}/dm-tools`)}
                className="action-btn primary"
                title="DM tools and prep"
              >
                <span className="btn-icon">🛠️</span>
                <span className="btn-label">DM Tools</span>
                <span className="btn-desc">NPCs, Dungeons, Prep</span>
              </button>

              <button
                onClick={() => navigate(`/campaign/${campaignId}/admin/adventures`)}
                className="action-btn"
                title="Manage adventures"
              >
                <span className="btn-icon">⚙️</span>
                <span className="btn-label">Editar aventuras</span>
                <span className="btn-desc">Crear y editar contenido</span>
              </button>
            </div>
          </section>
        )}

        {isOwner && (
          <section className="action-section danger">
            <h2>Peligro</h2>
            <p className="danger-text">Estas acciones no se pueden deshacer.</p>
            <button
              onClick={handleDelete}
              className="btn-danger"
              disabled={deleting}
              title="Delete this campaign"
            >
              {deleting ? 'Borrando...' : '🗑️ Borrar campaña'}
            </button>
          </section>
        )}
      </main>

      <style>{`
        .campaign-home {
          min-height: 100vh;
          background: #0d0d0d;
          display: flex;
          flex-direction: column;
        }

        .campaign-home.loading,
        .campaign-home.error {
          justify-content: center;
          align-items: center;
          padding: 32px;
        }

        .loading-state,
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #333;
          border-top-color: #a855f7;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-state h2 {
          margin: 0;
          color: #ef4444;
        }

        .error-state p {
          margin: 0;
          color: #999;
        }

        .campaign-header {
          background: #1a1a1a;
          border-bottom: 1px solid #333;
          padding: 24px 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .header-nav {
          display: flex;
          gap: 8px;
        }

        .header-content h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          color: #fff;
        }

        .campaign-metadata {
          margin: 0;
          font-size: 14px;
          color: #999;
        }

        .campaign-main {
          flex: 1;
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .action-section {
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .action-section h2 {
          margin: 0;
          font-size: 20px;
          color: #fff;
          font-weight: 600;
        }

        .action-section.danger h2 {
          color: #ef4444;
        }

        .danger-text {
          margin: 0 0 12px 0;
          color: #999;
          font-size: 14px;
        }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 12px;
        }

        .action-btn {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 20px 16px;
          cursor: pointer;
          transition: all 200ms;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
          align-items: flex-start;
        }

        .action-btn:hover {
          border-color: #666;
          background: #242424;
          transform: translateY(-2px);
        }

        .action-btn.primary {
          border-color: #a855f7;
          background: rgba(168, 85, 247, 0.05);
        }

        .action-btn.primary:hover {
          border-color: #a855f7;
          background: rgba(168, 85, 247, 0.1);
          box-shadow: 0 10px 15px rgba(168, 85, 247, 0.1);
        }

        .action-btn.primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .btn-icon {
          font-size: 24px;
        }

        .btn-label {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }

        .btn-desc {
          font-size: 13px;
          color: #999;
        }

        @media (max-width: 768px) {
          .campaign-header {
            padding: 16px;
          }

          .campaign-main {
            padding: 16px;
          }

          .action-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
