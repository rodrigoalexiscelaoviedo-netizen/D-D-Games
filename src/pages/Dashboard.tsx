import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { SYSTEM_LABEL, PLAYSTYLE_LABEL, TONE_LABEL } from '../lib/labels';
import { MODULES } from '../content/modules';
import './dashboard.css';

const HERO_IMAGE = `${MODULES[0]?.cover ?? ''}`;

export const Dashboard = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [playing, setPlaying] = useState<Array<{ playthroughId: string; campaignId: string; campaignName: string; role: string }>>([]);

  useEffect(() => {
    void loadCampaigns();
    void loadPlaying();
  }, [auth.user]);

  // Partidas donde la persona participa (como jugador o como director), con el nombre de la campaña.
  const loadPlaying = async () => {
    if (!auth.user) return;
    const { data: parts } = await supabase
      .from('playthrough_participants')
      .select('playthrough_id, role')
      .eq('user_id', auth.user.id);
    if (!parts || parts.length === 0) {
      setPlaying([]);
      return;
    }
    const { data: pts } = await supabase
      .from('playthroughs')
      .select('id, campaign_id')
      .in('id', parts.map((p) => p.playthrough_id));
    const { data: camps } = await supabase
      .from('campaigns')
      .select('id, name')
      .in('id', (pts ?? []).map((p) => p.campaign_id));
    const nameOf = new Map((camps ?? []).map((c) => [c.id, c.name]));
    const roleOf = new Map(parts.map((p) => [p.playthrough_id, p.role]));
    setPlaying(
      (pts ?? []).map((p) => ({
        playthroughId: p.id,
        campaignId: p.campaign_id,
        campaignName: nameOf.get(p.campaign_id) ?? 'Campaña',
        role: roleOf.get(p.id) ?? 'player',
      }))
    );
  };

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
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las campañas');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await auth.logout();
    navigate('/');
  };

  const firstName = auth.user?.email?.split('@')[0] ?? '';

  return (
    <div className="home">
      <header className="home-top">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">◆</span>
          <span className="brand-name">D&amp;D VTT</span>
        </div>
        <nav className="home-nav" aria-label="Accesos">
          <button className="nav-link" onClick={() => navigate('/manual')}>Manual</button>
          <button className="nav-link" onClick={() => navigate('/bestiary')}>Bestiario</button>
          <button className="nav-link" onClick={() => navigate('/admin')}>Administración</button>
          <span className="nav-sep" aria-hidden="true" />
          <span className="nav-user" title={auth.user?.email ?? ''}>{firstName}</span>
          <button className="nav-logout" onClick={handleLogout}>Salir</button>
        </nav>
      </header>

      <section className="hero" style={{ backgroundImage: HERO_IMAGE ? `url(${HERO_IMAGE})` : undefined }}>
        <div className="hero-copy">
          <p className="eyebrow">Mesa de juego</p>
          <h1>{campaigns.length > 0 || playing.length > 0 ? 'Tu mesa de juego' : 'Armá tu primera aventura'}</h1>
          <p className="lede">
            {campaigns.length > 0
              ? 'Retomá una campaña, preparate una sesión o sumá héroes listos para jugar.'
              : 'Creá una campaña, elegí héroes precargados e instalá una aventura lista para jugar.'}
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/campaign/new')}>+ Nueva campaña</button>
            <button className="btn-ghost" onClick={() => navigate('/bestiary')}>Explorar bestiario</button>
          </div>
        </div>
      </section>

      <main className="home-main">
        {error && (
          <div className="notice-error" role="alert">
            <span>{error}</span>
            <button className="btn-ghost" onClick={loadCampaigns}>Reintentar</button>
          </div>
        )}

        {playing.length > 0 && (
          <>
            <div className="section-head">
              <h2>Partidas en las que jugás</h2>
              <span className="count">{playing.length}</span>
            </div>
            <ul className="campaign-grid play-grid">
              {playing.map((g) => (
                <li key={g.playthroughId}>
                  <button className="campaign-card" onClick={() => navigate(`/campaign/${g.campaignId}/play/${g.playthroughId}/lobby`)}>
                    <div className="campaign-body">
                      <p className="campaign-system">{g.role === 'dm' ? 'Dirigís la partida' : 'Jugás'}</p>
                      <h3>{g.campaignName}</h3>
                      <span className="campaign-open">Entrar a la partida →</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="section-head">
          <h2>Campañas</h2>
          <span className="count">{campaigns.length}</span>
        </div>

        {loading ? (
          <p className="state">Cargando campañas…</p>
        ) : campaigns.length === 0 && playing.length > 0 ? (
          <p className="state">Todavía no creaste ninguna campaña. Las partidas en las que jugás están arriba.</p>
        ) : campaigns.length === 0 ? (
          <div className="empty">
            <p className="empty-title">Todavía no tenés campañas</p>
            <p>Una campaña reúne personajes, aventuras y la partida en curso.</p>
            <button className="btn-primary" onClick={() => navigate('/campaign/new')}>Crear primera campaña</button>
          </div>
        ) : (
          <ul className="campaign-grid">
            {campaigns.map((c, i) => {
              const cover = MODULES[i % MODULES.length]?.cover;
              return (
                <li key={c.id}>
                  <button className="campaign-card" onClick={() => navigate(`/campaign/${c.id}`)}>
                    <div className="campaign-cover" style={{ backgroundImage: cover ? `url(${cover})` : undefined }} />
                    <div className="campaign-body">
                      <p className="campaign-system">{SYSTEM_LABEL[c.system] ?? c.system}</p>
                      <h3>{c.name}</h3>
                      <p className="campaign-meta">
                        {PLAYSTYLE_LABEL[c.playstyle] ?? c.playstyle} · {TONE_LABEL[c.tone] ?? c.tone}
                      </p>
                      <span className="campaign-open">Abrir campaña →</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
};
