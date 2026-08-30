import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export const Dashboard = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!auth.user) return;
      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false });
      setCampaigns(data || []);
      setLoading(false);
    };
    load();
  }, [auth.user]);

  const handleLogout = async () => {
    await auth.logout();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Mis Campañas</h1>
        <div className="user-menu">
          <button onClick={() => navigate('/bestiary')} className="btn-secondary">
            Bestiario
          </button>
          <button onClick={() => navigate('/admin')} className="btn-secondary">
            ⚙️ Admin
          </button>
          <span>{auth.user?.email}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="campaigns-grid">
          <button
            onClick={() => navigate('/campaign/new')}
            className="btn-primary btn-large"
          >
            + Crear campaña
          </button>

          {loading ? (
            <p>Cargando campañas...</p>
          ) : campaigns.length === 0 ? (
            <p>No tienes campañas aún. ¡Creá una para empezar!</p>
          ) : (
            <div className="campaigns-list">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="campaign-card"
                  onClick={() => navigate(`/campaign/${campaign.id}`)}
                >
                  <h3>{campaign.name}</h3>
                  <p className="campaign-card-meta">
                    {campaign.system} · {campaign.playstyle}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
