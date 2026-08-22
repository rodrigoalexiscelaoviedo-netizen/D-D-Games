import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Character } from '../../lib/types';
import { fmtMod } from '../../lib/dnd';

export const CharacterList = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadCharacters();
  }, [campaignId]);

  const loadCharacters = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('characters')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      setCharacters(data || []);
    } catch (err) {
      console.error('Error loading characters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (characterId: string) => {
    if (!window.confirm('¿Borrar este personaje? No se puede deshacer.'))
      return;
    setDeleting(characterId);
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', characterId);
      if (error) throw error;
      setCharacters((prev) => prev.filter((c) => c.id !== characterId));
    } catch (err) {
      console.error('Error deleting character:', err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="campaign-home">
      <div className="campaign-home-header">
        <h1>Personajes</h1>
        <button
          className="btn-primary"
          onClick={() =>
            navigate(`/campaign/${campaignId}/characters/new`)
          }
        >
          + Crear personaje
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner">Cargando...</div>
        </div>
      ) : characters.length === 0 ? (
        <div className="campaign-empty">
          <p>No hay personajes en esta campaña todavía.</p>
          <button
            className="btn-primary btn-large"
            onClick={() =>
              navigate(`/campaign/${campaignId}/characters/new`)
            }
          >
            ¡Crear el primer personaje!
          </button>
        </div>
      ) : (
        <div className="character-grid">
          {characters.map((char) => (
            <div key={char.id} className="character-card">
              <div className="char-header">
                <h3>{char.character_name}</h3>
                {char.player_user_id && <span className="char-mine">Mi PC</span>}
              </div>
              <div className="char-meta">
                {[char.race, char.character_class]
                  .filter(Boolean)
                  .join(' · ') || 'Sin clase/raza'}
              </div>
              {char.level && <div className="char-level">Nv. {char.level}</div>}
              {char.str !== undefined && (
                <div className="char-abilities">
                  FUE {fmtMod(char.str)} · DES {fmtMod(char.dex)} · CON{' '}
                  {fmtMod(char.con)}
                </div>
              )}
              {char.hp_max && (
                <div className="char-hp">
                  PV: {char.hp_current ?? '—'}/{char.hp_max}
                </div>
              )}
              <div className="char-actions">
                <button
                  className="btn-secondary"
                  onClick={() =>
                    navigate(
                      `/campaign/${campaignId}/characters/${char.id}/edit`
                    )
                  }
                >
                  Editar
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(char.id!)}
                  disabled={deleting === char.id}
                >
                  {deleting === char.id ? 'Borrando...' : 'Borrar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
