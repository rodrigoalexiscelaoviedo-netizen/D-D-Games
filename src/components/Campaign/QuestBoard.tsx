import { useState } from 'react';
import { generateQuestHook, QUEST_TEMPLATES } from '../../lib/quest-generator';
import type { Quest } from '../../lib/quest-generator';

export const QuestBoard = ({ level = 1 }: { level?: number }) => {
  const [quests, setQuests] = useState<Quest[]>(QUEST_TEMPLATES);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [generating, setGenerating] = useState(false);
  const [theme, setTheme] = useState('aventura');

  const handleGenerateQuest = async () => {
    try {
      setGenerating(true);
      const newQuest = await generateQuestHook(theme, level, 'Pueblo Principal');
      setQuests([newQuest, ...quests]);
      setSelectedQuest(newQuest);
    } catch (error) {
      console.error('Error generating quest:', error);
      alert('Error al generar quest. Verifica tu API key de Gemini.');
    } finally {
      setGenerating(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '#4ade80';
      case 'Medium':
        return '#fbbf24';
      case 'Hard':
        return '#f97316';
      case 'Deadly':
        return '#ef4444';
      default:
        return '#999';
    }
  };

  return (
    <div className="quest-board">
      <h2>📋 Quest Board</h2>

      <div className="quest-controls">
        <div className="theme-selector">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="theme-input"
            disabled={generating}
          >
            <option value="aventura">Aventura</option>
            <option value="misterio">Misterio</option>
            <option value="rescate">Rescate</option>
            <option value="exploración">Exploración</option>
            <option value="combate">Combate</option>
            <option value="intrriga">Intriga</option>
          </select>
        </div>
        <button
          onClick={handleGenerateQuest}
          disabled={generating}
          className="btn-primary"
        >
          {generating ? '⏳ Generando...' : '✨ Generar Quest'}
        </button>
      </div>

      <div className="quest-layout">
        <div className="quest-list">
          <div className="quests-grid">
            {quests.map((quest, idx) => (
              <button
                key={idx}
                className={`quest-card ${selectedQuest?.title === quest.title ? 'active' : ''}`}
                onClick={() => setSelectedQuest(quest)}
              >
                <div className="quest-card-header">
                  <h4>{quest.title}</h4>
                  <span
                    className="difficulty-badge"
                    style={{
                      backgroundColor: getDifficultyColor(quest.difficulty) + '30',
                      color: getDifficultyColor(quest.difficulty),
                    }}
                  >
                    {quest.difficulty}
                  </span>
                </div>
                <p className="quest-giver">📍 {quest.giver}</p>
              </button>
            ))}
          </div>
        </div>

        {selectedQuest && (
          <div className="quest-details">
            <div className="quest-header">
              <h3>{selectedQuest.title}</h3>
              <span
                className="difficulty-large"
                style={{
                  backgroundColor: getDifficultyColor(selectedQuest.difficulty) + '30',
                  color: getDifficultyColor(selectedQuest.difficulty),
                }}
              >
                Dificultad: {selectedQuest.difficulty}
              </span>
            </div>

            <div className="quest-info">
              <div className="info-section">
                <label>📍 Dada por</label>
                <p>{selectedQuest.giver}</p>
              </div>

              <div className="info-section">
                <label>💰 Recompensa</label>
                <p>{selectedQuest.reward}</p>
              </div>

              <div className="info-section">
                <label>📖 Descripción</label>
                <p>{selectedQuest.description}</p>
              </div>

              <div className="info-section">
                <label>✓ Objetivos</label>
                <ul className="objectives-list">
                  {selectedQuest.objectives.map((obj, idx) => (
                    <li key={idx}>
                      <input type="checkbox" id={`obj-${idx}`} />
                      <label htmlFor={`obj-${idx}`}>{obj}</label>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="info-section">
                <label>🎭 Story Hooks</label>
                <div className="hooks-list">
                  {selectedQuest.hooks.map((hook, idx) => (
                    <div key={idx} className="hook-item">
                      <span className="hook-number">{idx + 1}</span>
                      <p>{hook}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                Aceptar Quest
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .quest-board {
          padding: 24px;
        }

        .quest-board h2 {
          margin: 0 0 24px 0;
          font-size: 24px;
          color: #fff;
        }

        .quest-controls {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .theme-selector {
          flex: 1;
          min-width: 200px;
        }

        .theme-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #333;
          border-radius: 6px;
          background: #1a1a1a;
          color: #ccc;
          font-size: 14px;
        }

        .theme-input:focus {
          outline: none;
          border-color: #a855f7;
        }

        .quest-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .quest-list {
          display: flex;
          flex-direction: column;
        }

        .quests-grid {
          display: grid;
          gap: 12px;
        }

        .quest-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 200ms;
          text-align: left;
        }

        .quest-card:hover {
          border-color: #a855f7;
          background: #242424;
          transform: translateX(4px);
        }

        .quest-card.active {
          border-color: #a855f7;
          background: rgba(168, 85, 247, 0.1);
        }

        .quest-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;
        }

        .quest-card h4 {
          margin: 0;
          font-size: 16px;
          color: #fff;
        }

        .difficulty-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .quest-giver {
          margin: 0;
          font-size: 13px;
          color: #999;
        }

        .quest-details {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
          max-height: 600px;
        }

        .quest-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .quest-header h3 {
          margin: 0;
          font-size: 24px;
          color: #fff;
          flex: 1;
        }

        .difficulty-large {
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .quest-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .info-section label {
          display: block;
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .info-section p {
          margin: 0;
          color: #ccc;
          font-size: 14px;
          line-height: 1.6;
        }

        .objectives-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .objectives-list li {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .objectives-list input[type='checkbox'] {
          cursor: pointer;
          width: 18px;
          height: 18px;
          accent-color: #a855f7;
        }

        .objectives-list label {
          margin: 0;
          text-transform: none;
          font-weight: normal;
          font-size: 14px;
          color: #ccc;
          cursor: pointer;
          flex: 1;
        }

        .hooks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hook-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: #0d0d0d;
          border-radius: 6px;
          border-left: 3px solid #a855f7;
        }

        .hook-number {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: #a855f7;
          border-radius: 50%;
          color: white;
          font-size: 12px;
          font-weight: 600;
        }

        .hook-item p {
          margin: 0;
          font-size: 13px;
          color: #ccc;
        }

        @media (max-width: 1024px) {
          .quest-layout {
            grid-template-columns: 1fr;
          }

          .quest-details {
            max-height: none;
          }
        }

        @media (max-width: 768px) {
          .quest-board {
            padding: 16px;
          }

          .quest-controls {
            flex-direction: column;
          }

          .theme-selector {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};
