import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { rollD20, calculateDamage, isCritical, isFail, isHit } from '../../lib/combat-helpers';
import { COMBAT_ACTIONS, CLASS_COMBAT_TIPS, COMBAT_SOUNDS, COMBAT_THEMES, RARITY_COLORS } from '../../lib/combat-data';
import { Guidebook } from '../Layout/Guidebook';

export const CombatTurn = () => {
  const { campaignId, combatId } = useParams();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<any[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState<any>(null);
  const [round, setRound] = useState(1);
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('medieval');
  const [showLoot, setShowLoot] = useState(false);
  const [lootItems, setLootItems] = useState<any[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: partData } = await supabase
        .from('combat_participants')
        .select('*')
        .eq('combat_id', combatId)
        .order('initiative_roll', { ascending: false });

      const withInitiative = (partData || []).map((p) => ({
        ...p,
        initiative_roll: p.initiative_roll || Math.floor(Math.random() * 20) + 1 + Math.floor((p.dexterity - 10) / 2),
      })).sort((a, b) => b.initiative_roll - a.initiative_roll);

      setParticipants(withInitiative);
      setLoading(false);

      if (withInitiative.length > 0) {
        setCurrentParticipant(withInitiative[0]);
        setRound(1);

        if (!withInitiative[0].is_player) {
          setTimeout(() => {
            enemyTurn();
          }, 2000);
        }
      }
    })();
  }, [combatId]);

  const playSound = (soundKey: keyof typeof COMBAT_SOUNDS) => {
    const audio = new Audio(COMBAT_SOUNDS[soundKey]);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const roll = async () => {
    playSound('roll_dice');
    const enemies_list = participants.filter((e) => !e.is_player && e.hp_current > 0);
    if (enemies_list.length === 0) return;
    const target = enemies_list[Math.floor(Math.random() * enemies_list.length)];
    const roll20 = rollD20();
    const isCrit = isCritical(roll20);
    const isMiss = isFail(roll20);
    const hit = !isMiss && isHit(roll20, target.armor_class);
    const damage = hit ? calculateDamage(8, isCrit) : 0;

    let message = '';
    if (isMiss) {
      message = `⚠️ ${currentParticipant.name} tiró d20: 1. ¡FALLA CRÍTICA!`;
      playSound('miss');
    } else if (isCrit) {
      message = `🎯 ${currentParticipant.name} tiró d20: 20. ¡CRÍTICO! Golpea ${target.name} por ${damage} daño.`;
      playSound('critical');
    } else if (hit) {
      message = `✅ ${currentParticipant.name} tiró d20: ${roll20}. Golpea ${target.name} por ${damage} daño.`;
      playSound('hit');
    } else {
      message = `❌ ${currentParticipant.name} tiró d20: ${roll20}. Falla contra ${target.name}.`;
      playSound('miss');
    }

    setLog([...log, message]);

    if (hit && damage > 0) {
      const newHp = Math.max(0, target.hp_current - damage);
      await supabase
        .from('combat_participants')
        .update({ hp_current: newHp, status: newHp <= 0 ? 'unconscious' : 'ready' })
        .eq('id', target.id);

      setParticipants(
        participants.map((p) => (p.id === target.id ? { ...p, hp_current: newHp } : p))
      );

      if (newHp <= 0) {
        generateLoot();
      }
    }

    nextTurn();
  };

  const enemyTurn = async () => {
    const current = participants.find(p => p.id === currentParticipant?.id);
    if (!current?.is_player) {
      const players = participants.filter((p) => p.is_player && p.hp_current > 0);
      if (players.length > 0) {
        const target = players[Math.floor(Math.random() * players.length)];
        const roll20 = rollD20();
        const hit = isHit(roll20, target.armor_class);
        const damage = hit ? calculateDamage(6, isCritical(roll20)) : 0;

        playSound(isCritical(roll20) ? 'critical' : hit ? 'hit' : 'miss');

        const message = isCritical(roll20)
          ? `🎯 ${current.name} tiró 20: ¡CRÍTICO! ${target.name} recibe ${damage} daño`
          : hit
          ? `⚔️ ${current.name} tiró ${roll20}: Golpea a ${target.name} por ${damage} daño`
          : `❌ ${current.name} tiró ${roll20}: Falla contra ${target.name}`;

        setLog((prev) => [...prev, message]);

        if (hit && damage > 0) {
          const newHp = Math.max(0, target.hp_current - damage);
          await supabase
            .from('combat_participants')
            .update({ hp_current: newHp, status: newHp <= 0 ? 'unconscious' : 'ready' })
            .eq('id', target.id);

          setParticipants((prev) =>
            prev.map((p) => (p.id === target.id ? { ...p, hp_current: newHp } : p))
          );
        }
      }
    }
    nextTurn();
  };

  const generateLoot = () => {
    const commonLoot = [
      { name: 'Monedas de oro', quantity: 5 + Math.floor(Math.random() * 15), rarity: 'common' },
      { name: 'Poción de curación', quantity: 1, rarity: 'uncommon' },
    ];
    setLootItems(commonLoot);
    setShowLoot(true);
    playSound('level_up');
  };

  const nextTurn = async () => {
    const currentIndex = participants.findIndex((p) => p.id === currentParticipant.id);
    const nextIndex = (currentIndex + 1) % participants.length;
    const next = participants[nextIndex];

    if (nextIndex === 0) {
      setRound((r) => r + 1);
    }

    setCurrentParticipant(next);
    setSelectedAction(null);

    if (next && !next.is_player) {
      setTimeout(() => {
        enemyTurn();
      }, 2000);
    }
  };

  const endCombat = async () => {
    const xpEarned = participants
      .filter((p) => !p.is_player)
      .reduce((sum) => sum + 100, 0);

    await supabase.from('sessions').insert({
      campaign_id: campaignId,
      name: `Combat Round ${round}`,
      date_played: new Date().toISOString().split('T')[0],
      xp_awarded: xpEarned,
      duration_minutes: round * 5,
    });

    const playerIds = participants.filter((p) => p.is_player).map((p) => p.character_id);
    for (const id of playerIds) {
      if (id) {
        await supabase.rpc('add_xp', { char_id: id, xp_amount: xpEarned });
      }
    }

    await supabase.from('combats').update({ status: 'finished' }).eq('id', combatId);
    navigate(`/campaign/${campaignId}`);
  };

  if (loading) return <div className="page-pad">Cargando combate...</div>;

  const enemies = participants.filter((p) => !p.is_player);
  const allEnemiesDead = enemies.every((e) => e.hp_current <= 0);
  const tip = CLASS_COMBAT_TIPS[currentParticipant?.character_class] || '';

  return (
    <div className="combat-container" data-theme={selectedTheme}>
      <header className="combat-header">
        <div className="header-info">
          <h1>Ronda {round}</h1>
          <p>Turno: <strong>{currentParticipant?.name}</strong></p>
        </div>
        <div className="header-actions">
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="theme-selector"
          >
            {COMBAT_THEMES.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button onClick={endCombat} className="btn-secondary">
            Terminar
          </button>
        </div>
      </header>

      <div className="combat-state">
        <div className="state-column">
          <h3>👥 Aliados</h3>
          {participants
            .filter((p) => p.is_player)
            .map((p) => (
              <div key={p.id} className={`participant-card ${p.id === currentParticipant?.id ? 'active' : ''}`}>
                <span className="participant-name">{p.name}</span>
                <div className="hp-bar">
                  <div
                    className="hp-fill"
                    style={{
                      width: `${(p.hp_current / p.hp_max) * 100}%`,
                      backgroundColor: p.hp_current > p.hp_max * 0.5 ? '#22c55e' : p.hp_current > 0 ? '#f59e0b' : '#6b7280',
                    }}
                  />
                </div>
                <span className="hp-text">{p.hp_current}/{p.hp_max} PV</span>
              </div>
            ))}
        </div>

        <div className="state-column">
          <h3>⚔️ Enemigos</h3>
          {enemies.map((e) => (
            <div key={e.id} className={`participant-card enemy ${e.id === currentParticipant?.id ? 'active' : ''}`}>
              <span className="participant-name">{e.name}</span>
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
                {e.hp_current <= 0 ? '💀 Caído' : `${e.hp_current}/${e.hp_max} PV`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {!allEnemiesDead && currentParticipant?.is_player && (
        <div className="combat-actions">
          <h3>¿Qué hace {currentParticipant.name}?</h3>
          {tip && <p className="combat-tip">💡 <strong>Recomendación:</strong> {tip}</p>}
          <div className="action-grid">
            {COMBAT_ACTIONS.map((action) => (
              <button
                key={action.id}
                className={`action-btn ${selectedAction === action.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedAction(action.id);
                  if (action.id === 'attack') roll();
                  else if (action.id === 'help') {
                    setLog((prev) => [...prev, `👥 ${currentParticipant.name} ayuda a un aliado`]);
                    nextTurn();
                  } else if (action.id === 'defend') {
                    setLog((prev) => [...prev, `🛡️ ${currentParticipant.name} se defiende (+2 CA)`]);
                    nextTurn();
                  } else if (action.id === 'spell') {
                    setLog((prev) => [...prev, `✨ ${currentParticipant.name} lanza un hechizo`]);
                    nextTurn();
                  } else if (action.id === 'flee') {
                    setLog((prev) => [...prev, `🏃 ${currentParticipant.name} intenta escapar`]);
                    nextTurn();
                  }
                }}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label.split(' ')[1]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="combat-log">
        <h3>📋 Historial</h3>
        <div className="log-entries">
          {log.slice(-5).map((entry, i) => (
            <div key={i} className="log-entry">{entry}</div>
          ))}
        </div>
      </div>

      {showLoot && (
        <div className="loot-modal">
          <h2>🎁 ¡Loot Encontrado!</h2>
          <div className="loot-items">
            {lootItems.map((item, i) => (
              <div key={i} className="loot-item" style={{ borderLeftColor: RARITY_COLORS[item.rarity] }}>
                <span>{item.name}</span>
                <span className="rarity">{item.rarity}</span>
                <span className="qty">x{item.quantity}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setShowLoot(false)} className="btn-primary">
            Guardar Loot
          </button>
        </div>
      )}

      {allEnemiesDead && (
        <div className="combat-result victory">
          <h2>⚔️ ¡COMBATE GANADO! ⚔️</h2>
          <p>Todos los enemigos fueron derrotados.</p>
          <div className="result-buttons">
            <button onClick={() => setShowLoot(true)} className="btn-secondary">
              💾 Ver Loot
            </button>
            <button onClick={endCombat} className="btn-primary">
              ✓ Guardar y Volver
            </button>
          </div>
        </div>
      )}

      <Guidebook context="combat" step={1} />
    </div>
  );
};
