import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface Adventure {
  id: string;
  title: string;
  synopsis?: string;
  suggested_level?: number;
}

interface Playthrough {
  id: string;
  adventure_id: string;
  status: string;
  current_scene_id?: string;
  adventure_name?: string;
}

export const AdventureList = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [playthroughs, setPlaythroughs] = useState<Playthrough[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingPlaythrough, setCreatingPlaythrough] = useState(false);

  useEffect(() => {
    (async () => {
      if (!campaignId) return;

      setLoading(true);

      try {
        const { data: advs } = await supabase
          .from('adventures')
          .select('*')
          .limit(100);

        const { data: pts } = await supabase
          .from('playthroughs')
          .select('*')
          .eq('campaign_id', campaignId)
          .order('started_at', { ascending: false });

        setAdventures(advs || []);
        setPlaythroughs(pts || []);
      } catch (error) {
        console.error('Error loading adventures/playthroughs:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [campaignId]);

  const handleStartAdventure = async (adventureId: string) => {
    if (!campaignId) return;

    try {
      setCreatingPlaythrough(true);

      const { data: firstScene } = await supabase
        .from('scenes')
        .select('id')
        .eq('adventure_id', adventureId)
        .order('scene_order', { ascending: true })
        .limit(1)
        .single();

      if (!firstScene?.id) {
        throw new Error('Esta aventura no tiene escenas');
      }

      const { data: newPlaythrough, error: ptError } = await supabase
        .from('playthroughs')
        .insert({
          campaign_id: campaignId,
          adventure_id: adventureId,
          current_scene_id: firstScene.id,
          status: 'active',
          flags: {},
        })
        .select();

      if (ptError || !newPlaythrough || newPlaythrough.length === 0) {
        throw new Error('No se pudo crear la partida');
      }

      navigate(`/campaign/${campaignId}/play/${newPlaythrough[0].id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al iniciar aventura: ${message}`);
    } finally {
      setCreatingPlaythrough(false);
    }
  };

  const getAdventureName = (adventureId: string) => {
    return adventures.find((a) => a.id === adventureId)?.name || 'Aventura desconocida';
  };

  const activPlaythroughs = playthroughs.filter((p) => p.status === 'active');
  const completedPlaythroughs = playthroughs.filter((p) => p.status === 'completed');

  return (
    <div className="adventure-list page-pad">
      <button className="btn-secondary" onClick={() => navigate(`/campaign/${campaignId}`)}>
        ← Campaña
      </button>

      <h1>Aventuras</h1>

      {loading ? (
        <p>Cargando aventuras...</p>
      ) : (
        <>
          <section className="adventures-section">
            <h2>Aventuras disponibles</h2>
            {adventures.length === 0 ? (
              <p className="empty-state">No hay aventuras cargadas aún.</p>
            ) : (
              <div className="adventures-grid">
                {adventures.map((adv) => (
                  <div key={adv.id} className="adventure-card">
                    <h3>{adv.title}</h3>
                    {adv.suggested_level && (
                      <p className="adventure-level">Nivel sugerido: {adv.suggested_level}</p>
                    )}
                    {adv.synopsis && <p className="adventure-description">{adv.synopsis}</p>}
                    <button
                      className="btn-primary"
                      onClick={() => handleStartAdventure(adv.id)}
                      disabled={creatingPlaythrough}
                    >
                      Empezar partida
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="playthroughs-section">
            <h2>Partidas en progreso</h2>
            {activPlaythroughs.length === 0 ? (
              <p className="empty-state">No hay partidas activas.</p>
            ) : (
              <div className="playthroughs-list">
                {activPlaythroughs.map((pt) => (
                  <div key={pt.id} className="playthrough-item">
                    <div className="playthrough-info">
                      <h4>{getAdventureName(pt.adventure_id)}</h4>
                      <p className="playthrough-status">Activa · En progreso</p>
                    </div>
                    <button
                      className="btn-primary"
                      onClick={() => navigate(`/campaign/${campaignId}/play/${pt.id}`)}
                    >
                      Continuar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="completed-section">
            <h2>Partidas completadas</h2>
            {completedPlaythroughs.length === 0 ? (
              <p className="empty-state">Sin historial aún.</p>
            ) : (
              <div className="completed-list">
                {completedPlaythroughs.map((pt) => (
                  <div key={pt.id} className="completed-item">
                    <p>{getAdventureName(pt.adventure_id)}</p>
                    <p className="completed-status">✓ Completada</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
