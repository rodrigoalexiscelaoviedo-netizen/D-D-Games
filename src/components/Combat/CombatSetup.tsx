import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { rollInitiative, abilityMod } from '../../lib/combat-engine';
import { EncounterBuilder } from './EncounterBuilder';
import type { EncounterEnemy } from './EncounterBuilder';

export const CombatSetup = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [lineup, setLineup] = useState<any[]>([]);
  const [custom, setCustom] = useState({ name: '', hp: 10, armor_class: 12, damage_dice: 6, attack_bonus: 3 });
  const [showCustom, setShowCustom] = useState(false);
  const [useBuilder, setUseBuilder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { data: chars } = await supabase
        .from('characters')
        .select('*')
        .eq('campaign_id', campaignId);
      setCharacters(chars || []);
      setSelectedChars((chars || []).map((c) => c.id));
    })();
  }, [campaignId]);

  const addFromCustom = () => {
    if (!custom.name.trim()) return;
    const count = lineup.filter((l) => l.name.startsWith(custom.name)).length;
    setLineup([
      ...lineup,
      {
        ...custom,
        name: count === 0 ? custom.name : `${custom.name} ${count + 1}`,
        dexterity: 10,
      },
    ]);
    setCustom({ name: '', hp: 10, armor_class: 12, damage_dice: 6, attack_bonus: 3 });
    setShowCustom(false);
  };

  const handleCreateEncounter = (enemies: EncounterEnemy[]) => {
    const newEnemies = enemies.flatMap((enemy) =>
      Array.from({ length: enemy.count }, (_, idx) => ({
        name: enemy.count > 1 ? `${enemy.creature_name} ${idx + 1}` : enemy.creature_name,
        hp: enemy.max_hp,
        armor_class: enemy.ac,
        dexterity: 10,
        damage_dice: 6,
        attack_bonus: 3,
      }))
    );
    setLineup([...lineup, ...newEnemies]);
    setUseBuilder(false);
  };

  const start = async () => {
    setError('');
    if (selectedChars.length === 0 || lineup.length === 0) {
      setError('Necesitás al menos un personaje y un enemigo');
      return;
    }
    setLoading(true);
    try {
      const { data: combat, error: cErr } = await supabase
        .from('combats')
        .insert({ campaign_id: campaignId, status: 'active', round: 1, turn_index: 0, log: '[]' })
        .select()
        .single();
      if (cErr || !combat) throw cErr || new Error('No se creó el combate');

      const rows = [
        ...selectedChars.map((id) => {
          const c = characters.find((x) => x.id === id);
          const init = rollInitiative(c?.dex ?? 10);
          return {
            combat_id: combat.id,
            character_id: id,
            name: c?.character_name ?? 'Personaje',
            is_player: true,
            hp_current: c?.hp_current ?? c?.hp_max ?? 10,
            hp_max: c?.hp_max ?? 10,
            armor_class: c?.armor_class ?? 10,
            dexterity: c?.dex ?? 10,
            initiative_roll: init.total,
            status: 'ready',
            damage_dice: 8,
            attack_bonus: abilityMod(c?.str ?? 10) + (c?.proficiency_bonus ?? 2),
            temp_ac_bonus: 0,
            has_fled: false,
            ability_used: false,
          };
        }),
        ...lineup.map((e) => {
          const init = rollInitiative(e.dexterity ?? 10);
          return {
            combat_id: combat.id,
            character_id: null,
            name: e.name,
            is_player: false,
            hp_current: e.hp,
            hp_max: e.hp,
            armor_class: e.armor_class,
            dexterity: e.dexterity ?? 10,
            initiative_roll: init.total,
            status: 'ready',
            damage_dice: e.damage_dice ?? 6,
            attack_bonus: e.attack_bonus ?? 3,
            temp_ac_bonus: 0,
            has_fled: false,
            ability_used: false,
          };
        }),
      ];

      rows.sort((a, b) => b.initiative_roll - a.initiative_roll);
      const withOrder = rows.map((r, i) => ({ ...r, turn_order: i }));

      const { error: pErr } = await supabase.from('combat_participants').insert(withOrder);
      if (pErr) throw pErr;

      navigate(`/campaign/${campaignId}/combat/${combat.id}`);
    } catch (err: any) {
      setError(err?.message || 'No se pudo iniciar el combate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-page">
      <header className="setup-head">
        <button className="btn-secondary" onClick={() => navigate(`/campaign/${campaignId}`)}>
          ← Campaña
        </button>
        <h1>Preparar combate</h1>
      </header>

      {step === 1 && (
        <section className="setup-card">
          <h2>¿Quiénes pelean?</h2>
          <p className="hint">Tocá para incluir o sacar del combate.</p>
          <div className="pick-grid">
            {characters.map((c) => {
              const on = selectedChars.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`pick-card ${on ? 'on' : ''}`}
                  onClick={() =>
                    setSelectedChars(
                      on ? selectedChars.filter((x) => x !== c.id) : [...selectedChars, c.id]
                    )
                  }
                >
                  <strong>{c.character_name}</strong>
                  <span>{[c.race, c.character_class].filter(Boolean).join(' · ') || 'Sin clase'}</span>
                  <span className="pick-stats">PV {c.hp_max ?? 10} · CA {c.armor_class ?? 10}</span>
                </button>
              );
            })}
          </div>
          {characters.length === 0 && <p className="hint">No hay personajes en esta campaña todavía.</p>}
          <button className="btn-primary block" onClick={() => setStep(2)}>
            Siguiente: enemigos →
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="setup-card">
          <h2>¿Contra qué pelean?</h2>

          {!useBuilder && !showCustom && (
            <div className="setup-choice">
              <button className="btn-secondary block" onClick={() => setShowCustom(true)}>
                ⚔️ Crear enemigo personalizado
              </button>
              <button className="btn-secondary block" onClick={() => setUseBuilder(true)}>
                📚 Usar bestiario (Open5e)
              </button>
            </div>
          )}

          {useBuilder && (
            <div>
              <EncounterBuilder
                onCreateEncounter={handleCreateEncounter}
                loading={loading}
              />
              <button
                className="btn-secondary block"
                onClick={() => setUseBuilder(false)}
                style={{ marginTop: '12px' }}
              >
                ← Volver
              </button>
            </div>
          )}

          {!useBuilder && showCustom && (
            <div className="custom-enemy">
              <input
                className="input-field"
                placeholder="Nombre"
                value={custom.name}
                onChange={(e) => setCustom({ ...custom, name: e.target.value })}
              />
              <div className="mini-grid">
                <label>
                  PV
                  <input
                    type="number"
                    className="input-field"
                    value={custom.hp}
                    onChange={(e) => setCustom({ ...custom, hp: Number(e.target.value) })}
                  />
                </label>
                <label>
                  CA
                  <input
                    type="number"
                    className="input-field"
                    value={custom.armor_class}
                    onChange={(e) => setCustom({ ...custom, armor_class: Number(e.target.value) })}
                  />
                </label>
                <label>
                  Daño (d)
                  <input
                    type="number"
                    className="input-field"
                    value={custom.damage_dice}
                    onChange={(e) => setCustom({ ...custom, damage_dice: Number(e.target.value) })}
                  />
                </label>
                <label>
                  Bonif. ataque
                  <input
                    type="number"
                    className="input-field"
                    value={custom.attack_bonus}
                    onChange={(e) => setCustom({ ...custom, attack_bonus: Number(e.target.value) })}
                  />
                </label>
              </div>
              <button className="btn-primary" onClick={addFromCustom}>
                Agregar
              </button>
            </div>
          )}

          {lineup.length > 0 && (
            <div className="lineup">
              <h3>En esta batalla</h3>
              {lineup.map((e, i) => (
                <div key={i} className="lineup-row">
                  <span>{e.name}</span>
                  <span className="pick-stats">PV {e.hp} · CA {e.armor_class}</span>
                  <button
                    className="btn-danger-outline"
                    onClick={() => setLineup(lineup.filter((_, idx) => idx !== i))}
                  >
                    Sacar
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <p className="error-text">{error}</p>}
          <div className="setup-buttons">
            <button className="btn-secondary" onClick={() => setStep(1)}>
              ← Atrás
            </button>
            <button className="btn-primary" onClick={start} disabled={loading}>
              {loading ? 'Tirando iniciativa...' : '¡Empezar!'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
