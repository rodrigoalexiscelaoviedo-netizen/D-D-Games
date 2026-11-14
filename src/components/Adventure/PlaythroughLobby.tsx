import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import './playthrough-lobby.css';

interface LobbyCharacter {
  id: string;
  character_name: string;
  campaign_id: string;
  race?: string | null;
  character_class?: string | null;
  level?: number | null;
  portrait_url?: string | null;
}

interface Participant {
  id: string;
  playthrough_id: string;
  user_id: string;
  character_id?: string | null;
  role: 'dm' | 'player';
  confirmed: boolean;
  joined_at: string;
  character?: LobbyCharacter | null;
}

const Portrait = ({ name, src }: { name: string; src?: string | null }) =>
  src ? (
    <img className="pl-portrait" src={src} alt="" />
  ) : (
    <div className="pl-portrait pl-portrait-empty" aria-hidden="true">
      {name.charAt(0).toUpperCase() || '?'}
    </div>
  );

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const PlaythroughLobby = () => {
  const { campaignId, playthroughId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [playthrough, setPlaythrough] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [characters, setCharacters] = useState<LobbyCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void loadLobby();
  }, [playthroughId, campaignId]);

  const loadLobby = async () => {
    if (!playthroughId || !campaignId) return;
    setLoading(true);
    try {
      const { data: pt, error: ptErr } = await supabase
        .from('playthroughs')
        .select('*')
        .eq('id', playthroughId)
        .single();
      if (ptErr || !pt) throw new Error('Partida no encontrada');
      setPlaythrough(pt);

      const { data: chars } = await supabase
        .from('characters')
        .select('id, character_name, campaign_id, race, character_class, level, portrait_url')
        .eq('campaign_id', campaignId);
      const charList = (chars ?? []) as LobbyCharacter[];
      setCharacters(charList);
      const charById = new Map(charList.map((c) => [c.id, c]));

      const { data: parts, error: partsErr } = await supabase
        .from('playthrough_participants')
        .select('*')
        .eq('playthrough_id', playthroughId);
      if (partsErr) throw partsErr;

      setParticipants(
        (parts ?? []).map((p: any) => ({
          ...p,
          character: p.character_id ? charById.get(p.character_id) ?? null : null,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const currentUserParticipant = useMemo(
    () => participants.find((p) => p.user_id === user?.id) ?? null,
    [participants, user?.id]
  );
  // El rol lo decide la fila del participante en la partida, no quién la creó.
  const isDM = currentUserParticipant?.role === 'dm';

  // El director pasa la dirección a otro participante (sql/012: set_playthrough_dm).
  const handleMakeDm = async (targetUserId: string, name: string) => {
    if (!window.confirm(`¿Pasar la dirección de la partida a ${name}? Vos pasás a ser jugador.`)) return;
    setBusy(true);
    setError('');
    const { error: rpcError } = await supabase.rpc('set_playthrough_dm', {
      p_playthrough_id: playthroughId,
      p_new_dm: targetUserId,
    });
    setBusy(false);
    if (rpcError) {
      setError(
        rpcError.message.includes('director')
          ? 'Solo el director actual puede pasar la dirección.'
          : 'No se pudo pasar la dirección. Revisá que la función esté instalada (sql/012).'
      );
      return;
    }
    await loadLobby();
  };
  const dm = participants.find((p) => p.role === 'dm');
  const players = participants.filter((p) => p.role === 'player');
  const readyCount = players.filter((p) => p.confirmed).length;
  const allReady = players.every((p) => p.confirmed);

  const handleInvitePlayer = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) {
      setError('Ingresá un email válido');
      return;
    }

    setBusy(true);
    setError('');
    try {
      // Función de base de datos (sql/007): solo el director puede usarla y devuelve el id, no el email.
      const { data: invitedId, error: lookupErr } = await supabase.rpc('find_user_id_by_email', {
        p_playthrough_id: playthroughId,
        p_email: email,
      });
      if (lookupErr) {
        throw new Error(
          lookupErr.message.includes('Solo el director')
            ? 'Solo el director de la partida puede invitar jugadores.'
            : 'No pudimos buscar el usuario. Revisá que la función esté instalada (sql/007).'
        );
      }
      if (!invitedId) throw new Error('No hay ningún usuario registrado con ese email.');

      if (participants.some((p) => p.user_id === invitedId)) {
        throw new Error('Este jugador ya está invitado');
      }

      const { data: newPart, error: insertError } = await supabase
        .from('playthrough_participants')
        .insert({
          playthrough_id: playthroughId,
          user_id: invitedId,
          role: 'player',
          confirmed: false,
        })
        .select();

      if (insertError || !newPart || newPart.length === 0) {
        throw new Error('No se pudo agregar el jugador');
      }

      setParticipants((prev) => [...prev, { ...(newPart[0] as Participant), character: null }]);
      setInviteEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmCharacter = async (characterId: string) => {
    if (!currentUserParticipant || !characterId) {
      setError('Elegí un personaje');
      return;
    }

    setBusy(true);
    try {
      const { error: updateError } = await supabase
        .from('playthrough_participants')
        .update({ character_id: characterId, confirmed: true })
        .eq('id', currentUserParticipant.id)
        .select();
      if (updateError) throw updateError;

      const character = characters.find((c) => c.id === characterId) ?? null;
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === currentUserParticipant.id
            ? { ...p, character_id: characterId, confirmed: true, character }
            : p
        )
      );
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setBusy(false);
    }
  };

  const handleContinue = () => {
    if (isDM && !allReady) {
      setError('Todos los jugadores deben elegir personaje antes de empezar');
      return;
    }
    if (!isDM && !currentUserParticipant?.confirmed) {
      setError('Primero confirmá tu personaje');
      return;
    }
    navigate(`/campaign/${campaignId}/play/${playthroughId}`);
  };

  if (loading) return <div className="pl-state">Cargando lobby…</div>;

  if (!playthrough) {
    return (
      <div className="pl-state">
        <p className="pl-error">{error || 'Partida no encontrada'}</p>
        <button className="pl-btn pl-btn-ghost" onClick={() => navigate(`/campaign/${campaignId}`)}>
          Volver a la campaña
        </button>
      </div>
    );
  }

  const myCharacter = currentUserParticipant?.character ?? null;

  return (
    <div className="pl">
      <header className="pl-hero">
        <div className="pl-hero-inner">
          <button className="pl-back" onClick={() => navigate(`/campaign/${campaignId}`)}>
            ← Volver a la campaña
          </button>
          <p className="pl-eyebrow">{isDM ? 'Sos el director de juego' : 'Sos jugador'}</p>
          <h1>Lobby de partida</h1>
          <p className="pl-meta">
            {plural(players.length, 'jugador', 'jugadores')} · {readyCount} de {players.length} listos
          </p>
        </div>
      </header>

      <main className="pl-main">
        {error && (
          <div className="pl-notice" role="alert">
            {error}
          </div>
        )}

        <div className="pl-layout">
          <section className="pl-col">
            <h2 className="pl-section">Mesa</h2>

            <ul className="pl-seats">
              <li className="pl-seat is-ready">
                <Portrait name="M" />
                <div className="pl-seat-body">
                  <span className="pl-seat-role">Máster</span>
                  <span className="pl-seat-name">
                    {dm?.user_id === user?.id ? 'Vos' : 'Director de juego'}
                  </span>
                  <span className="pl-seat-char">Controla el mundo y las criaturas</span>
                </div>
                <span className="pl-badge pl-badge-ready">Listo</span>
              </li>

              {players.map((player) => {
                const name = player.character?.character_name ?? '';
                const isMe = player.user_id === user?.id;
                return (
                  <li key={player.id} className={`pl-seat ${player.confirmed ? 'is-ready' : ''}`}>
                    {player.confirmed && name ? (
                      <Portrait name={name} src={player.character?.portrait_url} />
                    ) : (
                      <Portrait name="?" />
                    )}
                    <div className="pl-seat-body">
                      <span className="pl-seat-role">{isMe ? 'Vos' : 'Jugador'}</span>
                      <span className="pl-seat-name">
                        {player.confirmed && name ? name : 'Sin personaje'}
                      </span>
                      {player.confirmed && player.character && (
                        <span className="pl-seat-char">
                          {[player.character.race, player.character.character_class]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      )}
                    </div>
                    <span className={`pl-badge ${player.confirmed ? 'pl-badge-ready' : 'pl-badge-wait'}`}>
                      {player.confirmed ? 'Listo' : 'Eligiendo…'}
                    </span>
                    {isDM && !isMe && (
                      <button
                        className="pl-btn pl-btn-ghost pl-give-dm"
                        disabled={busy}
                        onClick={() => handleMakeDm(player.user_id, player.character?.character_name ?? 'este jugador')}
                        title="Esta persona dirige la partida. Vos pasás a jugar un personaje."
                      >
                        Pasarle la dirección
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            {players.length === 0 && (
              <p className="pl-empty">Todavía no hay jugadores invitados.</p>
            )}

            {isDM && (
              <div className="pl-invite">
                <h3 className="pl-subtitle">Invitar jugador</h3>
                <p className="pl-hint">Ingresá el email con el que se registró.</p>
                <div className="pl-invite-row">
                  <input
                    type="email"
                    placeholder="jugador@email.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="pl-input"
                    disabled={busy}
                  />
                  <button className="pl-btn pl-btn-ghost" onClick={handleInvitePlayer} disabled={busy}>
                    Invitar
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="pl-col pl-action">
            {!isDM && currentUserParticipant && !currentUserParticipant.confirmed && (
              <div className="pl-card">
                <h2 className="pl-section">Elegí tu personaje</h2>
                {characters.length === 0 ? (
                  <div className="pl-empty-box">
                    <p>Todavía no hay personajes en esta campaña.</p>
                    <button
                      className="pl-btn pl-btn-ghost"
                      onClick={() => navigate(`/campaign/${campaignId}/characters`)}
                    >
                      Crear o elegir héroe
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="pl-picker" role="radiogroup" aria-label="Personajes">
                      {characters.map((c) => {
                        const selected = selectedCharacterId === c.id;
                        return (
                          <button
                            key={c.id}
                            role="radio"
                            aria-checked={selected}
                            className={`pl-choice ${selected ? 'is-selected' : ''}`}
                            onClick={() => setSelectedCharacterId(c.id)}
                          >
                            <Portrait name={c.character_name} src={c.portrait_url} />
                            <span className="pl-choice-name">{c.character_name}</span>
                            <span className="pl-choice-sub">
                              {[c.race, c.character_class].filter(Boolean).join(' · ') || 'Sin datos'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      className="pl-btn pl-btn-primary pl-btn-block"
                      onClick={() => handleConfirmCharacter(selectedCharacterId)}
                      disabled={!selectedCharacterId || busy}
                    >
                      Confirmar personaje
                    </button>
                  </>
                )}
              </div>
            )}

            {!isDM && currentUserParticipant?.confirmed && (
              <div className="pl-card">
                <h2 className="pl-section">Tu personaje</h2>
                <div className="pl-confirmed">
                  <Portrait name={myCharacter?.character_name ?? '?'} src={myCharacter?.portrait_url} />
                  <div>
                    <p className="pl-confirmed-name">{myCharacter?.character_name ?? 'Personaje'}</p>
                    <p className="pl-hint">
                      {[myCharacter?.race, myCharacter?.character_class].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
                <button className="pl-btn pl-btn-primary pl-btn-block" onClick={handleContinue}>
                  Entrar a la partida →
                </button>
              </div>
            )}

            {!isDM && !currentUserParticipant && (
              <div className="pl-card">
                <p className="pl-hint">No estás invitado a esta partida.</p>
              </div>
            )}

            {isDM && (
              <div className="pl-card">
                <h2 className="pl-section">Estado de la mesa</h2>
                <ul className="pl-status">
                  <li>
                    <span>Jugadores listos</span>
                    <strong>
                      {readyCount} / {players.length}
                    </strong>
                  </li>
                  <li>
                    <span>Personajes elegidos</span>
                    <strong>{players.filter((p) => p.character_id).length}</strong>
                  </li>
                </ul>
                <p className="pl-hint">
                  {players.length === 0
                    ? 'Todavía no hay jugadores. Podés empezar solo o invitar a alguien antes.'
                    : allReady
                      ? 'Todo listo. Podés empezar la sesión.'
                      : 'Esperando a que todos los jugadores elijan personaje.'}
                </p>
                <button
                  className="pl-btn pl-btn-primary pl-btn-block"
                  onClick={handleContinue}
                  disabled={!allReady}
                >
                  Entrar a la partida →
                </button>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};
