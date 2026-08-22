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

  return (
    <div className="campaign-home">
      <header className="campaign-home-header">
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          ← Mis campañas
        </button>
        <h1>{campaign.name}</h1>
      </header>
      <div className="campaign-home-body">
        <p className="campaign-meta">
          Sistema: {campaign.system} · Estilo: {campaign.playstyle} · Tono: {campaign.tone}
        </p>
        <div className="campaign-empty">
          <p>Tu campaña está lista. Los personajes vienen en la próxima fase.</p>
        </div>
      </div>
    </div>
  );
};
