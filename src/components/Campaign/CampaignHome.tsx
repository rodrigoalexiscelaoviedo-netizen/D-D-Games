import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { SYSTEM_LABEL, PLAYSTYLE_LABEL, TONE_LABEL } from '../../lib/labels';
import { MODULES } from '../../content/modules';
import './campaign-home.css';

interface Campaign {
  id: string;
  name: string;
  system: string;
  playstyle: string;
  tone: string;
  user_id: string;
}

const PLAY_ITEMS = [
  { key: 'adventures', icon: '🗺️', label: 'Aventuras', desc: 'Empezar o retomar una partida', tone: 'primary' },
  { key: 'characters', icon: '🛡️', label: 'Personajes', desc: 'Tu grupo, fichas y héroes listos', tone: '' },
  { key: 'bestiary', icon: '🐉', label: 'Bestiario', desc: 'Criaturas del SRD con su ficha', tone: '' },
  { key: 'wiki', icon: '📜', label: 'Notas', desc: 'Lore, personajes y pistas', tone: '' },
] as const;

export const CampaignHome = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void loadCampaign();
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error: queryError } = await supabase.from('campaigns').select('*').eq('id', campaignId).single();
      if (queryError) throw queryError;
      if (!data) throw new Error('No se encontró la campaña');
      setCampaign(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la campaña');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Borrar la campaña "${campaign?.name}"? No se puede deshacer.`)) return;
    try {
      setDeleting(true);
      const { error: delErr } = await supabase.from('campaigns').delete().eq('id', campaignId);
      if (delErr) throw delErr;
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo borrar la campaña');
      setDeleting(false);
    }
  };

  const isOwner = campaign?.user_id === user?.id;
  const go = (key: string) => {
    const routes: Record<string, string> = {
      adventures: `/campaign/${campaignId}/adventures`,
      characters: `/campaign/${campaignId}/characters`,
      bestiary: '/bestiary',
      wiki: `/campaign/${campaignId}/wiki`,
    };
    navigate(routes[key]);
  };

  if (loading) return <div className="ch-state">Cargando campaña…</div>;

  if (error || !campaign) {
    return (
      <div className="ch-state">
        <p className="ch-error">{error || 'No se encontró la campaña'}</p>
        <button className="ch-btn ch-btn-primary" onClick={() => navigate('/dashboard')}>Volver a mis campañas</button>
      </div>
    );
  }

  const cover = MODULES[0]?.cover;

  return (
    <div className="ch">
      <header className="ch-hero" style={{ backgroundImage: cover ? `url(${cover})` : undefined }}>
        <div className="ch-hero-inner">
          <button className="ch-back" onClick={() => navigate('/dashboard')}>← Mis campañas</button>
          <p className="ch-eyebrow">{SYSTEM_LABEL[campaign.system] ?? campaign.system}</p>
          <h1>{campaign.name}</h1>
          <p className="ch-meta">
            {PLAYSTYLE_LABEL[campaign.playstyle] ?? campaign.playstyle} · {TONE_LABEL[campaign.tone] ?? campaign.tone}
          </p>
        </div>
      </header>

      <main className="ch-main">
        <section>
          <h2 className="ch-section">Mesa</h2>
          <div className="ch-grid">
            {PLAY_ITEMS.map((it) => (
              <button key={it.key} className={`ch-card ${it.tone}`} onClick={() => go(it.key)}>
                <span className="ch-icon" aria-hidden="true">{it.icon}</span>
                <span className="ch-card-label">{it.label}</span>
                <span className="ch-card-desc">{it.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {isOwner && (
          <section>
            <h2 className="ch-section">Herramientas del director</h2>
            <div className="ch-grid">
              <button className="ch-card" onClick={() => navigate(`/campaign/${campaignId}/dm-tools`)}>
                <span className="ch-icon" aria-hidden="true">🧭</span>
                <span className="ch-card-label">Preparar sesión</span>
                <span className="ch-card-desc">PNJ, mazmorras y notas de escena</span>
              </button>
              <button className="ch-card" onClick={() => navigate(`/campaign/${campaignId}/modules`)}>
                <span className="ch-icon" aria-hidden="true">📚</span>
                <span className="ch-card-label">Biblioteca de módulos</span>
                <span className="ch-card-desc">Aventuras listas para instalar</span>
              </button>
              <button className="ch-card" onClick={() => navigate(`/campaign/${campaignId}/admin/adventures`)}>
                <span className="ch-icon" aria-hidden="true">✏️</span>
                <span className="ch-card-label">Editar aventuras</span>
                <span className="ch-card-desc">Crear y cambiar escenas</span>
              </button>
            </div>
          </section>
        )}

        {isOwner && (
          <section className="ch-danger">
            <div>
              <h2 className="ch-section">Zona de peligro</h2>
              <p className="ch-danger-text">Borrar la campaña elimina sus personajes y partidas. No se puede deshacer.</p>
            </div>
            <button className="ch-btn ch-btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Borrando…' : 'Borrar campaña'}
            </button>
          </section>
        )}
      </main>
    </div>
  );
};
