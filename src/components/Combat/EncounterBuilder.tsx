import { useEffect, useState } from 'react';
import { searchCreatures } from '../../lib/open5e-fetcher';
import type { Creature } from '../../lib/open5e-fetcher';

export interface EncounterEnemy {
  creature_id: string;
  creature_name: string;
  count: number;
  current_hp: number;
  max_hp: number;
  ac: number;
  cr: number;
}

interface EncounterBuilderProps {
  onCreateEncounter: (enemies: EncounterEnemy[]) => void;
  loading?: boolean;
}

export const EncounterBuilder = ({ onCreateEncounter, loading }: EncounterBuilderProps) => {
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null);
  const [encounterEnemies, setEncounterEnemies] = useState<EncounterEnemy[]>([]);
  const [creatureCount, setCreatureCount] = useState(1);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      setCreatures([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    const results = await searchCreatures(searchQuery);
    setCreatures(results);
  };

  const addCreatureToEncounter = (creature: Creature) => {
    const existingIdx = encounterEnemies.findIndex((e) => e.creature_id === creature.id);

    if (existingIdx >= 0) {
      const updated = [...encounterEnemies];
      updated[existingIdx].count = creatureCount;
      setEncounterEnemies(updated);
    } else {
      setEncounterEnemies([
        ...encounterEnemies,
        {
          creature_id: creature.id!,
          creature_name: creature.name,
          count: creatureCount,
          current_hp: creature.hp,
          max_hp: creature.hp,
          ac: creature.ac,
          cr: creature.cr,
        },
      ]);
    }

    setSelectedCreature(null);
    setSearchQuery('');
    setCreatureCount(1);
  };

  const removeFromEncounter = (creatureId: string) => {
    setEncounterEnemies((prev) => prev.filter((e) => e.creature_id !== creatureId));
  };

  const updateCount = (creatureId: string, count: number) => {
    setEncounterEnemies((prev) =>
      prev.map((e) => (e.creature_id === creatureId ? { ...e, count: Math.max(1, count) } : e))
    );
  };

  const totalCR = encounterEnemies.reduce((sum, e) => sum + e.cr * e.count, 0);

  return (
    <div className="encounter-builder">
      <h3>Construir Encuentro</h3>

      <div className="creature-search">
        <input
          type="text"
          placeholder="Buscar criatura..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field"
        />

        {creatures.length > 0 && (
          <div className="creatures-dropdown">
            {creatures.map((creature) => (
              <div
                key={creature.id}
                className="creature-option"
                onClick={() => setSelectedCreature(creature)}
              >
                <div>
                  <strong>{creature.name}</strong>
                  <span className="creature-meta">CR {creature.cr} • {creature.type}</span>
                </div>
                <span className="creature-stats">HP: {creature.hp} AC: {creature.ac}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCreature && (
        <div className="selected-creature">
          <h4>{selectedCreature.name}</h4>
          <p className="creature-meta">
            CR {selectedCreature.cr} • HP {selectedCreature.hp} • AC {selectedCreature.ac}
          </p>
          <div className="count-input">
            <label>Cantidad:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={creatureCount}
              onChange={(e) => setCreatureCount(parseInt(e.target.value) || 1)}
              className="number-input"
            />
          </div>
          <div className="selected-actions">
            <button
              className="btn-primary"
              onClick={() => addCreatureToEncounter(selectedCreature)}
            >
              Agregar al encuentro
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setSelectedCreature(null);
                setSearchQuery('');
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {encounterEnemies.length > 0 && (
        <div className="encounter-summary">
          <h4>Enemigos en el encuentro ({encounterEnemies.length} tipos)</h4>
          <p className="total-cr">CR total: {totalCR.toFixed(2)}</p>

          <div className="enemies-list">
            {encounterEnemies.map((enemy) => (
              <div key={enemy.creature_id} className="enemy-item">
                <div className="enemy-info">
                  <strong>{enemy.creature_name}</strong>
                  <span className="enemy-meta">CR {enemy.cr}</span>
                </div>

                <div className="enemy-count">
                  <label>Cantidad:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={enemy.count}
                    onChange={(e) => updateCount(enemy.creature_id, parseInt(e.target.value) || 1)}
                    className="number-input-small"
                  />
                </div>

                <button
                  className="btn-danger btn-small"
                  onClick={() => removeFromEncounter(enemy.creature_id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            className="btn-primary btn-full"
            onClick={() => onCreateEncounter(encounterEnemies)}
            disabled={loading}
          >
            {loading ? 'Creando encuentro...' : 'Crear Encuentro'}
          </button>
        </div>
      )}

      <style>{`
        .encounter-builder {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .encounter-builder h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .creature-search {
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
        }

        .creature-search input {
          padding: 10px 14px;
          border: 1px solid #666;
          border-radius: 6px;
          background: #0d0d0d;
          color: #fff;
          font-size: 14px;
        }

        .creatures-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #0d0d0d;
          border: 1px solid #666;
          border-radius: 6px;
          max-height: 300px;
          overflow-y: auto;
          z-index: 10;
          margin-top: 4px;
        }

        .creature-option {
          padding: 10px 12px;
          border-bottom: 1px solid #333;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          transition: background 0.2s;
        }

        .creature-option:hover {
          background: #1a1a1a;
        }

        .creature-option:last-child {
          border-bottom: none;
        }

        .creature-option strong {
          display: block;
          color: #fff;
          font-size: 14px;
        }

        .creature-meta {
          display: block;
          font-size: 12px;
          color: #999;
          font-weight: normal;
          margin-top: 2px;
        }

        .creature-stats {
          font-size: 12px;
          color: #999;
          white-space: nowrap;
        }

        .selected-creature {
          background: #0d0d0d;
          border: 1px solid #666;
          border-radius: 6px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .selected-creature h4 {
          margin: 0;
          font-size: 16px;
          color: #fff;
        }

        .count-input {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .count-input label {
          font-size: 14px;
          color: #ccc;
        }

        .count-input input,
        .number-input-small {
          width: 60px;
          padding: 6px 8px;
          border: 1px solid #666;
          border-radius: 4px;
          background: #1a1a1a;
          color: #fff;
          font-size: 14px;
          text-align: center;
        }

        .selected-actions {
          display: flex;
          gap: 8px;
        }

        .selected-actions button {
          flex: 1;
        }

        .encounter-summary {
          background: #0d0d0d;
          border: 1px solid #666;
          border-radius: 6px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .encounter-summary h4 {
          margin: 0;
          font-size: 16px;
          color: #fff;
        }

        .total-cr {
          margin: 0;
          font-size: 14px;
          color: #a855f7;
          font-weight: 600;
        }

        .enemies-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .enemy-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 4px;
        }

        .enemy-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .enemy-info strong {
          font-size: 14px;
          color: #fff;
        }

        .enemy-meta {
          font-size: 12px;
          color: #999;
        }

        .enemy-count {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #ccc;
        }

        .btn-full {
          width: 100%;
        }

        .number-input {
          width: 80px;
          padding: 6px 8px;
          border: 1px solid #666;
          border-radius: 4px;
          background: #1a1a1a;
          color: #fff;
          font-size: 14px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};
