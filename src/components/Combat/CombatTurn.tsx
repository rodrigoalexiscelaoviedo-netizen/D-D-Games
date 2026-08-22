import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { rollD20, calculateDamage, isCritical } from '../../lib/combat-helpers';
import { COMBAT_ACTIONS, CLASS_COMBAT_TIPS } from '../../lib/combat-data';

export const CombatTurn = () => {
  const { campaignId, combatId } = useParams();
  const navigate = useNavigate();
  const [combat, setCombat] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState<any>(null);
  const [round, setRound] = useState(1);
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: combatData } = await supabase
        .from('combats')
        .select('*')
        .eq('id', combatId)
        .single();

      const { data: partData } = await supabase
        .from('combat_participants')
        .select('*')
        .eq('combat_id', combatId)
        .order('initiative', { ascending: false });

      setCombat(combatData);
      setParticipants(partData || []);
      setLoading(false);

      if (partData && partData.length > 0) {
        setCurrentParticipant(partData[0]);
        setRound(1);
      }
    })();
  }, [combatId]);

  const roll = async (actionType: string, target: any) => {
    const roll20 = rollD20();
    const isCrit = isCritical(roll20);
    const hit = roll20 >= target.armor_class;
    const damage = hit ? calculateDamage(8, isCrit) : 0;

    const message = `${currentParticipant.name} tiró d20: ${roll20}. ${
      isCrit ? '¡CRÍTICO! ' : ''
    }${hit ? `Golpe (${damage} daño)` : 'Falla'}`;
    setLog([...log, message]);

    if (hit && damage > 0) {
      const newHp = Math.max(0, target.hp_current - damage);
      await supabase
        .from('combat_participants')
        .update({ hp_current: newHp })
        .eq('id', target.id);

      setParticipants(
        participants.map((p) => (p.id === target.id ? { ...p, hp_current: newHp } : p))
      );
    }

    nextTurn();
  };

  const nextTurn = async () => {
    const currentIndex = participants.findIndex((p) => p.id === currentParticipant.id);
    const nextIndex = (currentIndex + 1) % participants.length;
    const next = participants[nextIndex];

    if (nextIndex === 0) {
      setRound((r) => r + 1);
    }

    setCurrentParticipant(next);
  };

  const endCombat = async () => {
    await supabase.from('combats').update({ status: 'finished' }).eq('id', combatId);
    navigate(`/campaign/${campaignId}`);
  };

  if (loading) return <div className="page-pad">Cargando combate...</div>;

  const enemies = participants.filter((p) => !p.is_player);
  const allEnemiesDead = enemies.every((e) => e.hp_current <= 0);
  const tip = CLASS_COMBAT_TIPS[currentParticipant?.character_class] || '';

  return (
    <div className="combat-view">
      <header className="combat-header">
        <div>
          <h1>Ronda {round}</h1>
          <p>Turno de: <strong>{currentParticipant?.name}</strong></p>
        </div>
        <button onClick={endCombat} className="btn-secondary">
          Terminar Combate
        </button>
      </header>

      <div className="combat-state">
        <div className="state-column">
          <h3>Aliados</h3>
          {participants
            .filter((p) => p.is_player)
            .map((p) => (
              <div key={p.id} className="participant-card">
                <span>{p.name}</span>
                <div className="hp-bar">
                  <div
                    className="hp-fill"
                    style={{
                      width: `${(p.hp_current / p.hp_max) * 100}%`,
                      backgroundColor: p.hp_current > p.hp_max * 0.5 ? '#22c55e' : '#ef4444',
                    }}
                  />
                </div>
                <span className="hp-text">
                  {p.hp_current}/{p.hp_max}
                </span>
              </div>
            ))}
        </div>

        <div className="state-column">
          <h3>Enemigos</h3>
          {enemies.map((e) => (
            <div key={e.id} className="participant-card enemy">
              <span>{e.name}</span>
              <div className="hp-bar">
                <div
                  className="hp-fill"
                  style={{
                    width: `${(e.hp_current / e.hp_max) * 100}%`,
                    backgroundColor: e.hp_current > 0 ? '#ef4444' : '#6b7280',
                  }}
                />
              </div>
              <span className="hp-text">
                {e.hp_current <= 0 ? '💀 Caído' : `${e.hp_current}/${e.hp_max}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {!allEnemiesDead && currentParticipant?.is_player && (
        <div className="combat-actions">
          <h3>¿Qué hace {currentParticipant.name}?</h3>
          {tip && <p className="combat-tip">💡 {tip}</p>}
          <div className="action-buttons">
            {COMBAT_ACTIONS.map((action) => (
              <button
                key={action.id}
                className="action-btn"
                onClick={() => {
                  const target = enemies.find((e) => e.hp_current > 0);
                  if (target) roll(action.id, target);
                }}
              >
                <span className="action-emoji">{action.label.split(' ')[0]}</span>
                <span className="action-label">{action.label}</span>
                <span className="action-desc">{action.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="combat-log">
        <h3>Historial</h3>
        <div className="log-entries">
          {log.map((entry, i) => (
            <div key={i} className="log-entry">
              {entry}
            </div>
          ))}
        </div>
      </div>

      {allEnemiesDead && (
        <div className="combat-result">
          <h2>¡Combate ganado!</h2>
          <p>Todos los enemigos fueron derrotados.</p>
          <button onClick={endCombat} className="btn-primary">
            Volver a campaña
          </button>
        </div>
      )}
    </div>
  );
};
