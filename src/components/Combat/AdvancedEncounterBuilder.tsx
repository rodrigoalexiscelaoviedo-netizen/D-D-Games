import { useState } from 'react';
import {
  calculateEncounterDifficulty,
  getDifficultyColor,
  suggestCRForParty,
} from '../../lib/encounter-builder';
import type { EncounterEnemy, PartyMember } from '../../lib/encounter-builder';

interface AdvancedEncounterBuilderProps {
  party: PartyMember[];
  onBuildEncounter?: (enemies: EncounterEnemy[]) => void;
  onClose?: () => void;
}

export const AdvancedEncounterBuilder = ({
  party,
  onBuildEncounter,
  onClose,
}: AdvancedEncounterBuilderProps) => {
  const [enemies, setEnemies] = useState<EncounterEnemy[]>([]);
  const [newEnemyName, setNewEnemyName] = useState('');
  const [newEnemyCR, setNewEnemyCR] = useState(1);
  const [newEnemyQuantity, setNewEnemyQuantity] = useState(1);
  const [targetDifficulty, setTargetDifficulty] = useState<'easy' | 'medium' | 'hard' | 'deadly'>('medium');

  const difficulty = calculateEncounterDifficulty(enemies, party);
  const suggestedCR = suggestCRForParty(party);

  const addEnemy = () => {
    if (newEnemyName.trim()) {
      setEnemies([
        ...enemies,
        {
          name: newEnemyName,
          cr: newEnemyCR,
          hp: 10 + newEnemyCR * 10,
          ac: 10 + Math.floor(newEnemyCR / 2),
          quantity: newEnemyQuantity,
        },
      ]);
      setNewEnemyName('');
      setNewEnemyCR(1);
      setNewEnemyQuantity(1);
    }
  };

  const removeEnemy = (index: number) => {
    setEnemies(enemies.filter((_, i) => i !== index));
  };

  const updateEnemyQuantity = (index: number, quantity: number) => {
    const updated = [...enemies];
    updated[index].quantity = Math.max(1, quantity);
    setEnemies(updated);
  };

  const handleBuild = () => {
    if (enemies.length > 0) {
      onBuildEncounter?.(enemies);
      onClose?.();
    }
  };

  const diffColor = getDifficultyColor(difficulty.difficulty);

  return (
    <div className="advanced-encounter-builder">
      <div className="builder-header">
        <h2>⚔️ Advanced Encounter Builder</h2>
        <p>Party Level Average: ~{Math.round(party.reduce((s, m) => s + m.level, 0) / party.length)}</p>
      </div>

      <div className="builder-content">
        <div className="add-enemy-section">
          <h3>Add Enemies</h3>
          <div className="input-grid">
            <input
              type="text"
              placeholder="Enemy name"
              value={newEnemyName}
              onChange={(e) => setNewEnemyName(e.target.value)}
              className="input-field"
            />
            <select
              value={newEnemyCR}
              onChange={(e) => setNewEnemyCR(parseFloat(e.target.value))}
              className="input-field"
            >
              <option value="0.125">CR 1/8</option>
              <option value="0.25">CR 1/4</option>
              <option value="0.5">CR 1/2</option>
              <option value="1">CR 1</option>
              <option value="2">CR 2</option>
              <option value="3">CR 3</option>
              <option value="5">CR 5</option>
              <option value="8">CR 8</option>
              <option value="10">CR 10</option>
            </select>
            <input
              type="number"
              placeholder="Quantity"
              min="1"
              value={newEnemyQuantity}
              onChange={(e) => setNewEnemyQuantity(parseInt(e.target.value) || 1)}
              className="input-field"
            />
            <button className="btn-primary" onClick={addEnemy}>
              + Add
            </button>
          </div>
          <p className="suggestion">
            Suggested CR for party: <strong>{suggestedCR}</strong>
          </p>
        </div>

        <div className="enemies-list">
          <h3>Enemies ({enemies.length})</h3>
          {enemies.length === 0 ? (
            <p className="empty">No enemies added yet</p>
          ) : (
            <div className="enemies-grid">
              {enemies.map((enemy, idx) => (
                <div key={idx} className="enemy-card">
                  <div className="enemy-header">
                    <h4>{enemy.name}</h4>
                    <span className="cr">CR {enemy.cr}</span>
                  </div>
                  <div className="enemy-stats">
                    <div>HP: {enemy.hp}</div>
                    <div>AC: {enemy.ac}</div>
                  </div>
                  <div className="enemy-quantity">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={enemy.quantity}
                      onChange={(e) => updateEnemyQuantity(idx, parseInt(e.target.value))}
                      className="qty-input"
                    />
                  </div>
                  <button
                    className="btn-danger btn-small"
                    onClick={() => removeEnemy(idx)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="difficulty-calculator">
          <h3>Difficulty Calculation</h3>

          <div className="target-selector">
            <label>Target Difficulty</label>
            <div className="difficulty-buttons">
              {(['easy', 'medium', 'hard', 'deadly'] as const).map((diff) => (
                <button
                  key={diff}
                  className={`difficulty-btn ${targetDifficulty === diff ? 'active' : ''}`}
                  onClick={() => setTargetDifficulty(diff)}
                  style={targetDifficulty === diff ? { backgroundColor: getDifficultyColor(diff.charAt(0).toUpperCase() + diff.slice(1)) } : {}}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="difficulty-info">
            <div className="difficulty-badge" style={{ borderColor: diffColor }}>
              <h4 style={{ color: diffColor }}>{difficulty.difficulty}</h4>
              <div className="difficulty-meter">
                <div
                  className="meter-fill"
                  style={{
                    width: `${Math.min(difficulty.difficultyRating * 100, 100)}%`,
                    backgroundColor: diffColor,
                  }}
                ></div>
              </div>
              <p>{Math.round(difficulty.difficultyRating * 100)}% Difficulty</p>
            </div>

            <div className="xp-breakdown">
              <div className="xp-item">
                <label>Total XP (Raw)</label>
                <span>{difficulty.totalXP}</span>
              </div>
              <div className="xp-item">
                <label>Total XP (Adjusted)</label>
                <span className="highlight">{difficulty.adjustedXP}</span>
              </div>
              <div className="xp-item">
                <label>Per Character</label>
                <span>{Math.floor(difficulty.adjustedXP / party.length)}</span>
              </div>
            </div>
          </div>
        </div>

        {enemies.length > 0 && (
          <div className="builder-actions">
            <button className="btn-primary btn-large" onClick={handleBuild}>
              Build Encounter
            </button>
            {onClose && (
              <button className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        .advanced-encounter-builder {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 24px;
          max-height: 800px;
          overflow-y: auto;
        }

        .builder-header {
          margin-bottom: 24px;
        }

        .builder-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          color: #fff;
        }

        .builder-header p {
          margin: 0;
          font-size: 12px;
          color: #999;
        }

        .builder-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .add-enemy-section h3,
        .enemies-list h3,
        .difficulty-calculator h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: #fff;
        }

        .input-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 100px;
          gap: 8px;
        }

        .input-field,
        .qty-input {
          padding: 8px 12px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          color: #ccc;
          font-size: 12px;
        }

        .input-field:focus,
        .qty-input:focus {
          outline: none;
          border-color: #a855f7;
        }

        .btn-primary {
          padding: 8px 16px;
          background: #a855f7;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
        }

        .btn-primary:hover {
          background: #9333ea;
        }

        .suggestion {
          margin: 12px 0 0 0;
          font-size: 12px;
          color: #999;
        }

        .enemies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .enemy-card {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .enemy-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .enemy-header h4 {
          margin: 0;
          font-size: 14px;
          color: #fff;
        }

        .cr {
          background: #a855f7;
          color: #fff;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 600;
        }

        .enemy-stats {
          font-size: 12px;
          color: #ccc;
          display: flex;
          gap: 12px;
        }

        .enemy-quantity {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .enemy-quantity label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .qty-input {
          width: 100%;
        }

        .btn-small {
          width: 100%;
          padding: 6px;
          font-size: 11px;
        }

        .btn-danger {
          background: #ef4444;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .target-selector {
          margin-bottom: 16px;
        }

        .target-selector label {
          display: block;
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .difficulty-buttons {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .difficulty-btn {
          padding: 8px;
          border: 2px solid #333;
          background: #0d0d0d;
          color: #999;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
          transition: all 0.2s;
        }

        .difficulty-btn:hover {
          border-color: #a855f7;
        }

        .difficulty-btn.active {
          border-color: currentColor;
          color: #fff;
        }

        .difficulty-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .difficulty-badge {
          background: rgba(168, 85, 247, 0.05);
          border: 2px solid;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }

        .difficulty-badge h4 {
          margin: 0 0 12px 0;
          font-size: 20px;
        }

        .difficulty-meter {
          width: 100%;
          height: 8px;
          background: #0d0d0d;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .meter-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .difficulty-badge p {
          margin: 0;
          font-size: 12px;
          color: #ccc;
        }

        .xp-breakdown {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .xp-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          background: #0d0d0d;
          border-radius: 4px;
        }

        .xp-item label {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .xp-item span {
          color: #a855f7;
          font-weight: 600;
        }

        .xp-item span.highlight {
          color: #4ade80;
        }

        .builder-actions {
          display: flex;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid #333;
        }

        .btn-large {
          flex: 1;
          padding: 12px;
          font-size: 14px;
        }

        .btn-secondary {
          flex: 1;
          padding: 12px;
          background: transparent;
          border: 1px solid #333;
          color: #999;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }

        .btn-secondary:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        .empty {
          text-align: center;
          color: #666;
          font-size: 12px;
          padding: 20px;
        }
      `}</style>
    </div>
  );
};
