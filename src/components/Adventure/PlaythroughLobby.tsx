import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface Participant {
  id: string;
  playthrough_id: string;
  user_id: string;
  character_id?: string;
  role: 'dm' | 'player';
  confirmed: boolean;
  joined_at: string;
  character?: {
    id: string;
    name: string;
  };
  user_email?: string;
}

interface Character {
  id: string;
  character_name: string;
  campaign_id: string;
}

export const PlaythroughLobby = () => {
  const { campaignId, playthroughId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [playthrough, setPlaythrough] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserParticipant, setCurrentUserParticipant] = useState<Participant | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    loadLobby();
  }, [playthroughId, campaignId]);

  const loadLobby = async () => {
    if (!playthroughId || !campaignId) return;
    setLoading(true);

    try {
      // Load playthrough
      const { data: pt } = await supabase
        .from('playthroughs')
        .select('*')
        .eq('id', playthroughId)
        .single();

      if (!pt) throw new Error('Partida no encontrada');
      setPlaythrough(pt);

      // Load participants
      const { data: parts } = await supabase
        .from('playthrough_participants')
        .select('*')
        .eq('playthrough_id', playthroughId);

      if (parts) {
        const enriched = await Promise.all(
          parts.map(async (p) => {
            let char = null;
            if (p.character_id) {
              const { data: c } = await supabase
                .from('characters')
                .select('id, character_name')
                .eq('id', p.character_id)
                .single();
              char = c;
            }
            return { ...p, character: char };
          })
        );
        setParticipants(enriched);

        const current = enriched.find((p) => p.user_id === user?.id);
        setCurrentUserParticipant(current || null);
      }

      // Load characters for this campaign
      const { data: chars } = await supabase
        .from('characters')
        .select('id, character_name, campaign_id')
        .eq('campaign_id', campaignId);

      setCharacters(chars || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const isDM = playthrough?.user_id === user?.id;

  const handleInvitePlayer = async () => {
    if (!inviteEmail.trim()) {
      setError('Ingresa un email válido');
      return;
    }

    try {
      // Get user by email (simple: find by email in auth)
      const { data: userData } = await supabase.auth.admin.listUsers();
      const invitedUser = userData.users.find((u) => u.email === inviteEmail);

      if (!invitedUser) {
        setError('Usuario no encontrado');
        return;
      }

      // Check if already invited
      const existing = participants.find((p) => p.user_id === invitedUser.id);
      if (existing) {
        setError('Este jugador ya está invitado');
        return;
      }

      // Add participant
      const { data: newPart, error: insertError } = await supabase
        .from('playthrough_participants')
        .insert({
          playthrough_id: playthroughId,
          user_id: invitedUser.id,
          role: 'player',
          confirmed: false,
        })
        .select();

      if (insertError || !newPart || newPart.length === 0) {
        throw new Error('No se pudo agregar el jugador');
      }

      setParticipants([...participants, { ...newPart[0], character: null }]);
      setInviteEmail('');
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error: ${message}`);
    }
  };

  const handleConfirmCharacter = async (characterId: string) => {
    if (!currentUserParticipant || !characterId) {
      setError('Selecciona un personaje');
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('playthrough_participants')
        .update({
          character_id: characterId,
          confirmed: true,
        })
        .eq('id', currentUserParticipant.id)
        .select();

      if (updateError) throw updateError;

      const updated = { ...currentUserParticipant, character_id: characterId, confirmed: true };
      setCurrentUserParticipant(updated);
      setParticipants(
        participants.map((p) => (p.id === currentUserParticipant.id ? updated : p))
      );
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error: ${message}`);
    }
  };

  const handleContinue = async () => {
    // Check all players confirmed
    const players = participants.filter((p) => p.role === 'player');
    const allConfirmed = players.every((p) => p.confirmed);

    if (!allConfirmed) {
      setError('Todos los jugadores deben confirmar personaje');
      return;
    }

    navigate(`/campaign/${campaignId}/play/${playthroughId}`);
  };

  if (loading) return <div className="page-pad">Cargando lobby...</div>;

  const players = participants.filter((p) => p.role === 'player');
  const dm = participants.find((p) => p.role === 'dm');

  return (
    <div className="playthrough-lobby page-pad">
      <button className="btn-secondary" onClick={() => navigate(`/campaign/${campaignId}`)}>
        ← Atrás
      </button>

      <h1>Lobby de partida</h1>

      {error && <div className="error-message">{error}</div>}

      <section className="lobby-dm">
        <h2>Máster</h2>
        <div className="dm-card">
          <p className="dm-name">{dm?.user_email || 'DM'}</p>
          <p className="dm-role">Controlador de la partida</p>
        </div>
      </section>

      <section className="lobby-players">
        <h2>Jugadores ({players.length})</h2>

        {players.length === 0 ? (
          <p className="empty-state">No hay jugadores invitados aún.</p>
        ) : (
          <div className="players-list">
            {players.map((player) => (
              <div key={player.id} className="player-item">
                <span className="player-email">{player.user_email || 'Jugador'}</span>
                {player.confirmed ? (
                  <span className="player-status-confirmed">✓ {player.character?.character_name}</span>
                ) : (
                  <span className="player-status-waiting">Esperando...</span>
                )}
              </div>
            ))}
          </div>
        )}

        {isDM && (
          <div className="invite-form">
            <input
              type="email"
              placeholder="Email del jugador a invitar"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="form-input"
            />
            <button className="btn-primary" onClick={handleInvitePlayer}>
              Invitar
            </button>
          </div>
        )}
      </section>

      {!isDM && currentUserParticipant && (
        <section className="lobby-character-select">
          <h2>Selecciona tu personaje</h2>
          {currentUserParticipant.confirmed ? (
            <div className="character-confirmed">
              <p>✓ Personaje confirmado: {currentUserParticipant.character?.character_name}</p>
            </div>
          ) : (
            <div>
              <select
                value={selectedCharacterId}
                onChange={(e) => setSelectedCharacterId(e.target.value)}
                className="form-select"
              >
                <option value="">-- Elige un personaje --</option>
                {characters.map((char) => (
                  <option key={char.id} value={char.id}>
                    {char.character_name}
                  </option>
                ))}
              </select>
              <button
                className="btn-primary"
                onClick={() => handleConfirmCharacter(selectedCharacterId)}
              >
                Confirmar personaje
              </button>
            </div>
          )}
        </section>
      )}

      {isDM && (
        <section className="lobby-actions">
          <button
            className="btn-primary btn-large"
            onClick={handleContinue}
            disabled={!players.every((p) => p.confirmed)}
          >
            Continuar a la partida
          </button>
        </section>
      )}
    </div>
  );
};
