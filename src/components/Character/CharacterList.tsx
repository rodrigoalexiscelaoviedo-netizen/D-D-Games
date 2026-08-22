import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { fmtMod } from '../../lib/dnd';
import { AVATAR_STYLES, getAvatarUrl } from '../../lib/avatar-styles';

export const CharacterList = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [chars, setChars] = useState<any[]>([]);
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: campData } = await supabase.from('campaigns')
        .select('*').eq('id', campaignId).single();
      setCampaign(campData);

      const { data: charData } = await supabase.from('characters')
        .select('*').eq('campaign_id', campaignId).order('created_at', { ascending: true });
      setChars(charData || []);
      setLoading(false);
    };
    load();
  }, [campaignId]);

  const doDelete = async (id: string) => {
    await supabase.from('characters').delete().eq('id', id);
    setConfirmDelete(null);
    setChars(chars.filter(c => c.id !== id));
  };

  const getAvatarForAppearance = (appearanceId?: string): string | null => {
    if (!appearanceId) return null;
    const style = AVATAR_STYLES.find(s => s.id === appearanceId);
    return style ? getAvatarUrl(style.seed) : null;
  };

  if (loading) return <div className="page-pad">Cargando personajes...</div>;

  return (
    <div className="list-page">
      <header className="list-header">
        <button className="btn-secondary" onClick={() => navigate(`/campaign/${campaignId}`)}>
          ← {campaign?.name || 'Campaña'}
        </button>
        <h1>Personajes</h1>
        <button className="btn-primary" onClick={() => navigate(`/campaign/${campaignId}/characters/new`)}>
          + Nuevo personaje
        </button>
      </header>

      {chars.length === 0 ? (
        <div className="campaign-empty">
          <p>Todavía no hay personajes. Creá el primero.</p>
        </div>
      ) : (
        <div className="char-grid">
          {chars.map((c) => {
            const avatarUrl = getAvatarForAppearance(c.appearance);
            return (
              <div key={c.id} className="char-card">
                {avatarUrl && (
                  <div className="char-card-visual">
                    <img
                      src={avatarUrl}
                      alt={c.character_name}
                      className="char-avatar-img"
                    />
                  </div>
                )}
                <div className="char-card-main" onClick={() => navigate(`/campaign/${campaignId}/characters/${c.id}/edit`)}>
                  <h3>{c.character_name}</h3>
                  <p className="meta">{[c.race, c.character_class].filter(Boolean).join(' · ') || 'Sin clase'} · Nivel {c.level ?? 1}</p>
                  <p className="meta">CA {c.armor_class ?? '—'} · PV {c.hp_current ?? '—'}/{c.hp_max ?? '—'}</p>
                  <p className="stat-line">
                    FUE {fmtMod(c.str)} · DES {fmtMod(c.dex)} · CON {fmtMod(c.con)} · INT {fmtMod(c.int)} · SAB {fmtMod(c.wis)} · CAR {fmtMod(c.cha)}
                  </p>
                </div>
                <div className="char-card-actions">
                  <button className="btn-secondary" onClick={() => navigate(`/campaign/${campaignId}/characters/${c.id}/edit`)}>
                    Editar
                  </button>
                  {confirmDelete === c.id ? (
                    <>
                      <button className="btn-danger" onClick={() => doDelete(c.id)}>Confirmar</button>
                      <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>No</button>
                    </>
                  ) : (
                    <button className="btn-danger-outline" onClick={() => setConfirmDelete(c.id)}>Borrar</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
