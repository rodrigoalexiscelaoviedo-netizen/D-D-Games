import { useState } from 'react';
import { processLevelUp, getProficiencyBonus } from '../../lib/progression';

interface LevelUpPanelProps {
  currentLevel: number;
  currentHP: number;
  maxHP: number;
  constitution: number;
  onLevelUp?: (newLevel: number, newMaxHP: number) => void;
  onClose?: () => void;
}

export const LevelUpPanel = ({
  currentLevel,
  currentHP,
  maxHP,
  constitution,
  onLevelUp,
  onClose,
}: LevelUpPanelProps) => {
  const [confirmed, setConfirmed] = useState(false);

  const levelUp = processLevelUp(currentLevel, constitution);
  const newProficiency = getProficiencyBonus(levelUp.new_level);
  const oldProficiency = getProficiencyBonus(currentLevel);
  const proficiencyIncrease = newProficiency > oldProficiency;

  const handleConfirm = () => {
    onLevelUp?.(levelUp.new_level, maxHP + levelUp.hp_gained);
    setConfirmed(true);
  };

  return (
    <div className="level-up-panel">
      <div className="panel-overlay">
        <div className="panel-content">
          <div className="celebration">
            <h1>🎉</h1>
            <h2>Level Up!</h2>
            <p className="level-text">
              {currentLevel} → <span className="new-level">{levelUp.new_level}</span>
            </p>
          </div>

          <div className="stat-changes">
            <div className="stat-row">
              <label>Hit Points</label>
              <div className="stat-change">
                <span className="old">
                  {currentHP}/{maxHP}
                </span>
                <span className="arrow">→</span>
                <span className="new">
                  {currentHP}/{maxHP + levelUp.hp_gained}
                </span>
              </div>
              <span className="gain">+{levelUp.hp_gained} HP</span>
            </div>

            {proficiencyIncrease && (
              <div className="stat-row">
                <label>Proficiency Bonus</label>
                <div className="stat-change">
                  <span className="old">+{oldProficiency}</span>
                  <span className="arrow">→</span>
                  <span className="new">+{newProficiency}</span>
                </div>
              </div>
            )}

            {levelUp.ability_score_increase && (
              <div className="stat-row special">
                <label>✨ Ability Score Improvement</label>
                <p className="note">You can increase two ability scores by 1, or one by 2</p>
              </div>
            )}
          </div>

          {levelUp.new_features && levelUp.new_features.length > 0 && (
            <div className="new-features">
              <h3>New Features</h3>
              <ul>
                {levelUp.new_features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="panel-actions">
            <button className="btn-primary" onClick={handleConfirm}>
              Accept Level Up
            </button>
            {onClose && (
              <button className="btn-secondary" onClick={onClose}>
                Close
              </button>
            )}
          </div>

          {confirmed && (
            <div className="success-message">✓ Level up applied!</div>
          )}
        </div>
      </div>

      <style>{`
        .level-up-panel {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .panel-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .panel-content {
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          border: 2px solid #a855f7;
          border-radius: 16px;
          padding: 32px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 0 40px rgba(168, 85, 247, 0.3),
            0 0 80px rgba(168, 85, 247, 0.1);
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(40px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .celebration {
          text-align: center;
          margin-bottom: 32px;
        }

        .celebration h1 {
          font-size: 64px;
          margin: 0 0 16px 0;
          animation: bounce 0.6s ease-in-out;
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .celebration h2 {
          font-size: 32px;
          margin: 0 0 8px 0;
          color: #a855f7;
          text-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
        }

        .level-text {
          font-size: 18px;
          color: #ccc;
          margin: 0;
        }

        .new-level {
          font-weight: 700;
          color: #a855f7;
          font-size: 24px;
        }

        .stat-changes {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid #333;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .stat-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-row label {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .stat-change {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
        }

        .old {
          color: #999;
        }

        .arrow {
          color: #a855f7;
          font-weight: 700;
        }

        .new {
          color: #4ade80;
          font-weight: 700;
        }

        .gain {
          font-size: 12px;
          color: #4ade80;
          font-weight: 600;
        }

        .stat-row.special {
          background: rgba(168, 85, 247, 0.1);
          padding: 12px;
          border-radius: 6px;
          border-left: 3px solid #a855f7;
        }

        .stat-row.special label {
          color: #a855f7;
        }

        .note {
          font-size: 12px;
          color: #ccc;
          margin: 0;
        }

        .new-features {
          background: rgba(74, 222, 128, 0.05);
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .new-features h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #4ade80;
          text-transform: uppercase;
          font-weight: 700;
        }

        .new-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .new-features li {
          font-size: 13px;
          color: #ccc;
          padding-left: 20px;
          position: relative;
        }

        .new-features li:before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #4ade80;
          font-weight: 700;
        }

        .panel-actions {
          display: flex;
          gap: 12px;
          flex-direction: column;
        }

        .btn-primary,
        .btn-secondary {
          padding: 12px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
          color: #fff;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(168, 85, 247, 0.3);
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid #333;
          color: #999;
        }

        .btn-secondary:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        .success-message {
          text-align: center;
          color: #4ade80;
          font-weight: 600;
          font-size: 14px;
          margin-top: 12px;
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
