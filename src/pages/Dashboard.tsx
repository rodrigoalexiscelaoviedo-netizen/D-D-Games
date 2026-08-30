import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export const Dashboard = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, [auth.user]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError('');
      if (!auth.user) return;

      const { data, error: queryError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;
      setCampaigns(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading campaigns';
      setError(message);
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Mis Campañas</h1>
          <p className="header-subtitle">D&D Virtual Tabletop</p>
        </div>
        <nav className="user-menu">
          <button onClick={() => navigate('/bestiary')} className="btn-secondary" title="Browse creatures">
            📚 Bestiario
          </button>
          <button onClick={() => navigate('/admin')} className="btn-secondary" title="Manage content">
            ⚙️ Admin
          </button>
          <div className="user-info">
            <span className="user-email">{auth.user?.email}</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </nav>
      </header>

      <main className="dashboard-main">
        {error && (
          <div className="error-banner">
            <p>⚠️ {error}</p>
            <button onClick={loadCampaigns} className="btn-secondary btn-small">
              Retry
            </button>
          </div>
        )}

        <section className="campaigns-section">
          <div className="section-header">
            <h2>Campañas</h2>
            <button
              onClick={() => navigate('/campaign/new')}
              className="btn-primary"
              title="Start a new campaign"
            >
              + Nueva campaña
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando campañas...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>No se pudieron cargar las campañas</p>
              <button onClick={loadCampaigns} className="btn-primary">
                Reintentar
              </button>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎲</div>
              <h3>No tienes campañas aún</h3>
              <p>Creá tu primera campaña para empezar a jugar</p>
              <button
                onClick={() => navigate('/campaign/new')}
                className="btn-primary"
              >
                Crear primera campaña
              </button>
            </div>
          ) : (
            <div className="campaigns-grid">
              {campaigns.map((campaign) => (
                <button
                  key={campaign.id}
                  className="campaign-card"
                  onClick={() => navigate(`/campaign/${campaign.id}`)}
                >
                  <div className="campaign-header">
                    <h3>{campaign.name}</h3>
                    <span className="campaign-system">{campaign.system}</span>
                  </div>
                  <p className="campaign-meta">
                    {campaign.playstyle} · {campaign.tone}
                  </p>
                  <div className="campaign-footer">
                    <span className="campaign-hint">Haz clic para abrir →</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      <style>{`
        .dashboard {
          min-height: 100vh;
          background: #0d0d0d;
          display: flex;
          flex-direction: column;
        }

        .dashboard-header {
          background: #1a1a1a;
          border-bottom: 1px solid #333;
          padding: 24px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .header-content h1 {
          margin: 0 0 4px 0;
          font-size: 32px;
          font-weight: 700;
          color: #fff;
        }

        .header-subtitle {
          margin: 0;
          font-size: 14px;
          color: #999;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          border-left: 1px solid #333;
          padding-left: 12px;
        }

        .user-email {
          font-size: 14px;
          color: #999;
          word-break: break-all;
        }

        .btn-logout {
          background: #ef4444;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background 200ms;
        }

        .btn-logout:hover {
          background: #dc2626;
        }

        .dashboard-main {
          flex: 1;
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .error-banner p {
          margin: 0;
          color: #fca5a5;
          font-size: 14px;
        }

        .campaigns-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .section-header h2 {
          margin: 0;
          font-size: 24px;
          color: #fff;
        }

        .loading-state,
        .error-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          gap: 16px;
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

        .loading-state p,
        .error-state p {
          color: #999;
          font-size: 16px;
        }

        .empty-icon {
          font-size: 64px;
        }

        .empty-state h3 {
          margin: 0;
          font-size: 20px;
          color: #fff;
        }

        .empty-state p {
          margin: 0;
          color: #999;
          font-size: 16px;
        }

        .campaigns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .campaign-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 200ms;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .campaign-card:hover {
          border-color: #a855f7;
          background: #242424;
          transform: translateY(-2px);
          box-shadow: 0 10px 15px rgba(168, 85, 247, 0.2);
        }

        .campaign-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .campaign-card h3 {
          margin: 0;
          font-size: 18px;
          color: #fff;
          flex: 1;
        }

        .campaign-system {
          background: rgba(168, 85, 247, 0.2);
          color: #a855f7;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .campaign-meta {
          margin: 0;
          font-size: 14px;
          color: #999;
        }

        .campaign-footer {
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid #333;
        }

        .campaign-hint {
          font-size: 12px;
          color: #666;
          display: inline-block;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 16px;
          }

          .user-menu {
            width: 100%;
            flex-wrap: wrap;
          }

          .dashboard-main {
            padding: 16px;
          }

          .campaigns-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
