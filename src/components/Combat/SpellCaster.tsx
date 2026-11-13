import { useState } from 'react';
import type { Spell } from '../../lib/spell-data';

interface SpellCasterProps {
  spells: Spell[];
  playerLevel: number;
  onCastSpell?: (spell: Spell, targetPosition?: { x: number; y: number }) => void;
  readonly?: boolean;
}

export const SpellCaster = ({
  spells,
  playerLevel,
  onCastSpell,
  readonly = false,
}: SpellCasterProps) => {
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [isTargeting, setIsTargeting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'cantrips' | 'prepared'>('all');

  const availableSpells = spells.filter((spell) => {
    if (filter === 'cantrips') return spell.level === 0;
    if (filter === 'prepared') return true;
    return true;
  });

  const getSchoolColor = (school: string) => {
    switch (school?.toLowerCase()) {
      case 'abjuration':
        return '#0ea5e9';
      case 'conjuration':
        return '#06b6d4';
      case 'divination':
        return '#8b5cf6';
      case 'enchantment':
        return '#d946ef';
      case 'evocation':
        return '#f97316';
      case 'illusion':
        return '#ec4899';
      case 'necromancy':
        return '#6b21a8';
      case 'transmutation':
        return '#16a34a';
      default:
        return '#a855f7';
    }
  };

  const canCastSpell = (spell: Spell) => {
    return spell.level === 0 || spell.level <= Math.ceil(playerLevel / 2);
  };

  return (
    <div className="spell-caster">
      <div className="caster-header">
        <h3>🪄 Spells</h3>
      </div>

      <div className="spell-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({spells.length})
        </button>
        <button
          className={`filter-btn ${filter === 'cantrips' ? 'active' : ''}`}
          onClick={() => setFilter('cantrips')}
        >
          Cantrips ({spells.filter((s) => s.level === 0).length})
        </button>
      </div>

      <div className="spell-layout">
        <div className="spell-list">
          {availableSpells.length === 0 ? (
            <p className="empty">No spells available</p>
          ) : (
            availableSpells.map((spell) => {
              const canCast = canCastSpell(spell);
              return (
                <button
                  key={spell.id}
                  className={`spell-item ${selectedSpell?.id === spell.id ? 'active' : ''} ${!canCast ? 'unavailable' : ''}`}
                  onClick={() => setSelectedSpell(spell)}
                  disabled={!canCast || readonly}
                >
                  <div className="spell-info">
                    <h4>{spell.name}</h4>
                    <div className="spell-meta">
                      <span className="level">
                        {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}
                      </span>
                      <span
                        className="school"
                        style={{ color: getSchoolColor(spell.school) }}
                      >
                        {spell.school}
                      </span>
                    </div>
                  </div>
                  {spell.concentration && <span className="concentration">⚡</span>}
                </button>
              );
            })
          )}
        </div>

        {selectedSpell && (
          <div className="spell-details">
            <div className="details-header">
              <h3>{selectedSpell.name}</h3>
              <span
                className="school-badge"
                style={{
                  backgroundColor: getSchoolColor(selectedSpell.school) + '30',
                  color: getSchoolColor(selectedSpell.school),
                }}
              >
                {selectedSpell.school}
              </span>
            </div>

            <div className="spell-info-grid">
              <div className="info-item">
                <label>Level</label>
                <p>{selectedSpell.level === 0 ? 'Cantrip' : selectedSpell.level}</p>
              </div>

              <div className="info-item">
                <label>Casting Time</label>
                <p>{selectedSpell.casting_time}</p>
              </div>

              <div className="info-item">
                <label>Range</label>
                <p>{selectedSpell.range}</p>
              </div>

              <div className="info-item">
                <label>Duration</label>
                <p>{selectedSpell.duration}</p>
              </div>

              {selectedSpell.components && (
                <div className="info-item full">
                  <label>Components</label>
                  <p>{selectedSpell.components}</p>
                </div>
              )}

              {selectedSpell.concentration && (
                <div className="concentration-notice">
                  ⚡ Requires Concentration
                </div>
              )}

              {selectedSpell.ritual && (
                <div className="ritual-notice">
                  📜 Can be cast as a Ritual
                </div>
              )}
            </div>

            <div className="spell-description">
              <label>Description</label>
              <p>{selectedSpell.description}</p>
            </div>

            {selectedSpell.damage_type && (
              <div className="damage-info">
                <label>Damage Type</label>
                <span className="damage-type">{selectedSpell.damage_type}</span>
              </div>
            )}

            {!readonly && (
              <div className="spell-actions">
                <button
                  className="btn-primary"
                  onClick={() => {
                    setIsTargeting(!isTargeting);
                    onCastSpell?.(selectedSpell);
                  }}
                >
                  {isTargeting ? '🎯 Targeting...' : '✨ Cast Spell'}
                </button>
                <p className="casting-note">Click on the tactical map to target</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .spell-caster {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 700px;
          overflow-y: auto;
        }

        .caster-header h3 {
          margin: 0;
          font-size: 18px;
          color: #fff;
        }

        .spell-filters {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          padding: 6px 12px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 4px;
          color: #999;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover,
        .filter-btn.active {
          border-color: #a855f7;
          color: #a855f7;
        }

        .spell-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          flex: 1;
          overflow-y: auto;
        }

        .spell-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
        }

        .spell-item {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          position: relative;
        }

        .spell-item:hover:not(.unavailable) {
          border-color: #a855f7;
          background: #1a1a2e;
          transform: translateX(4px);
        }

        .spell-item.active {
          border-color: #a855f7;
          background: rgba(168, 85, 247, 0.1);
        }

        .spell-item.unavailable {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spell-info h4 {
          margin: 0 0 6px 0;
          font-size: 14px;
          color: #fff;
        }

        .spell-meta {
          display: flex;
          gap: 8px;
          font-size: 11px;
        }

        .spell-meta .level {
          color: #999;
        }

        .school {
          font-weight: 600;
        }

        .concentration {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 14px;
        }

        .spell-details {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .details-header h3 {
          margin: 0;
          font-size: 18px;
          color: #fff;
          flex: 1;
        }

        .school-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .spell-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-item.full {
          grid-column: 1 / -1;
        }

        .info-item label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .info-item p {
          margin: 0;
          font-size: 13px;
          color: #ccc;
        }

        .concentration-notice,
        .ritual-notice {
          background: rgba(168, 85, 247, 0.1);
          border-left: 3px solid #a855f7;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          color: #a855f7;
        }

        .ritual-notice {
          border-left-color: #8b5cf6;
          color: #8b5cf6;
          background: rgba(139, 92, 246, 0.1);
        }

        .spell-description {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .spell-description label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .spell-description p {
          margin: 0;
          font-size: 13px;
          color: #ccc;
          line-height: 1.5;
        }

        .damage-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .damage-info label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .damage-type {
          background: #ef4444;
          color: #fff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .spell-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
        }

        .spell-actions button {
          width: 100%;
          padding: 10px;
          background: #a855f7;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .spell-actions button:hover {
          background: #9333ea;
        }

        .casting-note {
          margin: 0;
          font-size: 11px;
          color: #999;
          text-align: center;
        }

        .empty {
          text-align: center;
          color: #666;
          font-size: 12px;
          padding: 20px;
        }

        @media (max-width: 1200px) {
          .spell-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
