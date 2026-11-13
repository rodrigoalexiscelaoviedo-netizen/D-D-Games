import { useState } from 'react';
import type { UserAchievement } from '../../lib/achievements';
import {
  getAchievementProgress,
  getAchievementStats,
  getRarityColor,
  ACHIEVEMENTS,
} from '../../lib/achievements';

interface AchievementsPanelProps {
  userAchievements: UserAchievement[];
  filter?: 'all' | 'unlocked' | 'locked';
}

export const AchievementsPanel = ({
  userAchievements,
  filter = 'all',
}: AchievementsPanelProps) => {
  const [selectedFilter, setSelectedFilter] = useState(filter);
  const stats = getAchievementStats(userAchievements);

  const achievements = userAchievements
    .map((ua) => {
      const achievement = ACHIEVEMENTS[ua.achievementId];
      if (!achievement) return null;
      return { ua, ap: getAchievementProgress(ua, achievement) };
    })
    .filter((item) => item !== null) as Array<{
    ua: UserAchievement;
    ap: ReturnType<typeof getAchievementProgress>;
  }>;

  const filteredAchievements = achievements.filter((item) => {
    if (selectedFilter === 'unlocked') return item.ap.isUnlocked;
    if (selectedFilter === 'locked') return !item.ap.isUnlocked;
    return true;
  });

  return (
    <div className="achievements-panel">
      <div className="panel-header">
        <h2>🏆 Achievements</h2>
        <p className="subtitle">
          {stats.unlocked}/{stats.total} Unlocked
        </p>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <label>Progress</label>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${stats.percentComplete}%` }}
            />
          </div>
          <span className="percent">{stats.percentComplete}%</span>
        </div>
        <div className="stat-item">
          <label>Rewards Earned</label>
          <div className="rewards">
            {stats.totalXP > 0 && <span className="reward xp">+{stats.totalXP} XP</span>}
            {stats.totalGold > 0 && <span className="reward gold">+{stats.totalGold} Gold</span>}
          </div>
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={`tab ${selectedFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('all')}
        >
          All ({achievements.length})
        </button>
        <button
          className={`tab ${selectedFilter === 'unlocked' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('unlocked')}
        >
          Unlocked ({achievements.filter((a) => a.ap.isUnlocked).length})
        </button>
        <button
          className={`tab ${selectedFilter === 'locked' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('locked')}
        >
          Locked ({achievements.filter((a) => !a.ap.isUnlocked).length})
        </button>
      </div>

      <div className="achievements-grid">
        {filteredAchievements.length === 0 ? (
          <p className="empty">No achievements to display</p>
        ) : (
          filteredAchievements.map((item) => {
            const { ap } = item;
            const rarityColor = getRarityColor(ap.achievement.rarity);

            return (
              <div
                key={ap.achievement.id}
                className={`achievement-card ${ap.isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon" style={{ color: rarityColor }}>
                  {ap.achievement.icon}
                </div>

                <div className="achievement-info">
                  <h4>{ap.achievement.name}</h4>
                  <p className="description">{ap.achievement.description}</p>

                  {!ap.isUnlocked && (
                    <div className="progress-container">
                      <div className="progress-bar-small">
                        <div
                          className="progress-fill-small"
                          style={{ width: `${ap.percentComplete}%` }}
                        />
                      </div>
                      <span className="progress-text">
                        {ap.progress}/{ap.achievement.requirement}
                      </span>
                    </div>
                  )}

                  {ap.isUnlocked && ap.unlockedAt && (
                    <p className="unlocked-date">
                      Unlocked: {ap.unlockedAt.toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="achievement-rarity">
                  <span
                    className="rarity-badge"
                    style={{ backgroundColor: rarityColor + '20', color: rarityColor }}
                  >
                    {ap.achievement.rarity.toUpperCase()}
                  </span>
                  {ap.achievement.reward && (
                    <div className="reward-info">
                      {ap.achievement.reward.xp && (
                        <span className="reward-xp">+{ap.achievement.reward.xp} XP</span>
                      )}
                      {ap.achievement.reward.gold && (
                        <span className="reward-gold">+{ap.achievement.reward.gold} GP</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .achievements-panel {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .panel-header {
          margin-bottom: 12px;
        }

        .panel-header h2 {
          margin: 0 0 4px 0;
          font-size: 24px;
          color: #fff;
        }

        .subtitle {
          margin: 0;
          font-size: 13px;
          color: #999;
        }

        .stats-bar {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-item label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #1a1a1a;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #a855f7, #fbbf24);
          transition: width 0.3s ease;
        }

        .percent {
          font-size: 12px;
          color: #a855f7;
          font-weight: 600;
        }

        .rewards {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .reward {
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 600;
        }

        .reward.xp {
          background: rgba(74, 222, 128, 0.1);
          color: #4ade80;
        }

        .reward.gold {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
        }

        .tab {
          padding: 8px 12px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          color: #999;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        .tab.active {
          background: #a855f7;
          border-color: #a855f7;
          color: #fff;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .achievement-card {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.3s;
        }

        .achievement-card:hover {
          border-color: #a855f7;
          transform: translateY(-2px);
        }

        .achievement-card.locked {
          opacity: 0.6;
        }

        .achievement-icon {
          font-size: 32px;
          text-align: center;
        }

        .achievement-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .achievement-info h4 {
          margin: 0;
          font-size: 14px;
          color: #fff;
        }

        .description {
          margin: 0;
          font-size: 12px;
          color: #999;
          line-height: 1.4;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .progress-bar-small {
          flex: 1;
          height: 4px;
          background: #1a1a1a;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill-small {
          height: 100%;
          background: #a855f7;
        }

        .progress-text {
          font-size: 10px;
          color: #999;
          min-width: 40px;
          text-align: right;
        }

        .unlocked-date {
          margin: 0;
          font-size: 11px;
          color: #4ade80;
          font-weight: 600;
        }

        .achievement-rarity {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid #333;
        }

        .rarity-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .reward-info {
          display: flex;
          gap: 6px;
        }

        .reward-xp,
        .reward-gold {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 9px;
          font-weight: 600;
        }

        .reward-xp {
          background: rgba(74, 222, 128, 0.1);
          color: #4ade80;
        }

        .reward-gold {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
        }

        .empty {
          grid-column: 1 / -1;
          text-align: center;
          color: #666;
          font-size: 12px;
          padding: 40px 20px;
        }

        @media (max-width: 768px) {
          .stats-bar {
            grid-template-columns: 1fr;
          }

          .achievements-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
