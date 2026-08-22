import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export const CombatSetup = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [enemies, setEnemies] = useState<Array<{ name: string; hp: number; ac: number }>>([]);
  const [newEnemy, setNewEnemy] = useState({ name: '', hp: 15, ac: 12 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('characters')
        .select('*')
        .eq('campaign_id', campaignId);
      setCharacters(data || []);
    })();
  }, [campaignId]);

  const toggleCharacter = (id: string) => {
    setSelectedCharacters((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );
  };

  const addEnemy = () => {
    if (!newEnemy.name.trim()) return;
    setEnemies([...enemies, newEnemy]);
    setNewEnemy({ name: '', hp: 15, ac: 12 });
  };

  const startCombat = async () => {
    if (selectedCharacters.length === 0 || enemies.length === 0) {
      alert('Elegí al menos un personaje y un enemigo');
      return;
    }
    setLoading(true);
    try {
      const { data: combat } = await supabase
        .from('combats')
        .insert({
          campaign_id: campaignId,
          status: 'active',
        })
        .select()
        .single();

      if (!combat) throw new Error('No se creó combate');

      const participants = [
        ...selectedCharacters.map((charId) => {
          const char = characters.find((c) => c.id === charId);
          return {
            combat_id: combat.id,
            character_id: charId,
            name: char?.character_name,
            is_player: true,
            hp_current: char?.hp_max || 10,
            hp_max: char?.hp_max || 10,
            armor_class: char?.armor_class || 10,
            dexterity: char?.dex || 10,
          };
        }),
        ...enemies.map((enemy) => ({
          combat_id: combat.id,
          character_id: null,
          name: enemy.name,
          is_player: false,
          hp_current: enemy.hp,
          hp_max: enemy.hp,
          armor_class: enemy.ac,
          dexterity: 10,
        })),
      ];

      await supabase.from('combat_participants').insert(participants);

      navigate(`/campaign/${campaignId}/combat/${combat.id}`);
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="combat-setup">
      <header className="setup-header">
        <button onClick={() => navigate(`/campaign/${campaignId}`)} className="btn-secondary">
          ← Atrás
        </button>
        <h1>Preparar Combate</h1>
      </header>

      {step === 1 && (
        <div className="setup-section">
          <h2>Paso 1: Elegí tus personajes</h2>
          <div className="char-checkboxes">
            {characters.map((c) => (
              <label key={c.id} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={selectedCharacters.includes(c.id)}
                  onChange={() => toggleCharacter(c.id)}
                />
                {c.character_name} ({c.character_class || 'N/A'})
              </label>
            ))}
          </div>
          <button onClick={() => setStep(2)} className="btn-primary">
            Siguiente →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="setup-section">
          <h2>Paso 2: Agregá enemigos</h2>
          <p className="hint">Crea enemigos para esta batalla</p>
          <div className="enemy-form">
            <input
              type="text"
              placeholder="Nombre del enemigo"
              value={newEnemy.name}
              onChange={(e) => setNewEnemy({ ...newEnemy, name: e.target.value })}
              className="input-field"
            />
            <label>
              PV:
              <input
                type="number"
                value={newEnemy.hp}
                onChange={(e) => setNewEnemy({ ...newEnemy, hp: Number(e.target.value) })}
                className="input-field"
                style={{ width: '80px' }}
              />
            </label>
            <label>
              CA:
              <input
                type="number"
                value={newEnemy.ac}
                onChange={(e) => setNewEnemy({ ...newEnemy, ac: Number(e.target.value) })}
                className="input-field"
                style={{ width: '80px' }}
              />
            </label>
            <button type="button" onClick={addEnemy} className="btn-secondary">
              + Agregar
            </button>
          </div>

          <div className="enemies-list">
            {enemies.map((e, i) => (
              <div key={i} className="enemy-item">
                <span>{e.name}</span>
                <span>{e.hp} PV</span>
                <span>CA {e.ac}</span>
                <button
                  type="button"
                  onClick={() => setEnemies(enemies.filter((_, idx) => idx !== i))}
                  className="btn-danger-outline"
                >
                  X
                </button>
              </div>
            ))}
          </div>

          <div className="setup-buttons">
            <button onClick={() => setStep(1)} className="btn-secondary">
              ← Atrás
            </button>
            <button
              onClick={startCombat}
              disabled={loading || selectedCharacters.length === 0 || enemies.length === 0}
              className="btn-primary"
            >
              {loading ? 'Iniciando...' : '¡Empezar Combate!'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
