import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export const CampaignHome = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      if (!error) setCampaign(data);
      setLoading(false);
    };
    load();
  }, [campaignId]);

  if (loading) return <div className="page-pad">Cargando campaña...</div>;
  if (!campaign) return <div className="page-pad">No se encontró la campaña.</div>;

  const handleDelete = async () => {
    if (!window.confirm('¿Borrar esta campaña? No se puede deshacer.')) return;
    await supabase.from('campaigns').delete().eq('id', campaignId);
    navigate('/dashboard');
  };

  return (
    <div className="campaign-home">
      <header className="campaign-home-header">
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          ← Mis campañas
        </button>
        <h1>{campaign.name}</h1>
      </header>

      <div className="campaign-home-actions">
        <div className="actions-primary">
          <button
            onClick={() => navigate(`/campaign/${campaignId}/adventures`)}
            className="btn-primary btn-large"
          >
            Aventuras
          </button>
        </div>
        <div className="actions-secondary">
          <button
            onClick={() => navigate(`/campaign/${campaignId}/characters`)}
            className="btn-secondary"
          >
            Personajes
          </button>
          <button
            onClick={() => navigate('/bestiary')}
            className="btn-secondary"
          >
            Bestiario
          </button>
          <button
            onClick={() => navigate(`/campaign/${campaignId}/wiki`)}
            className="btn-secondary"
          >
            📖 Wiki
          </button>
        </div>
        <div className="actions-tertiary">
          <button
            onClick={() => navigate(`/campaign/${campaignId}/combat/new`)}
            className="btn-secondary"
          >
            ⚔️ Combate rápido
          </button>
          <button onClick={handleDelete} className="btn-danger btn-small">
            Borrar
          </button>
        </div>
      </div>
      <div className="campaign-home-body">
        <p className="campaign-meta">
          Sistema: {campaign.system} · Estilo: {campaign.playstyle} · Tono: {campaign.tone}
        </p>
      </div>
    </div>
  );
};
