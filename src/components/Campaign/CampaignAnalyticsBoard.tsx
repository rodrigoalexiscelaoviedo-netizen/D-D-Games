import { useState } from 'react';
import type { CampaignStats, SessionSummary } from '../../lib/campaign-analytics';
import {
  calculateCombatStats,
  calculatePlayerEngagement,
  getMostImpactfulSessions,
  calculateGrowthMetrics,
} from '../../lib/campaign-analytics';

interface CampaignAnalyticsBoardProps {
  stats: CampaignStats;
  sessions: SessionSummary[];
}

export const CampaignAnalyticsBoard = ({
  stats,
  sessions,
}: CampaignAnalyticsBoardProps) => {
  const [view, setView] = useState<'overview' | 'sessions' | 'players' | 'growth'>('overview');

  const combatStats = calculateCombatStats(stats);
  const playerEngagement = calculatePlayerEngagement(sessions);
  const impactfulSessions = getMostImpactfulSessions(sessions);
  const growthMetrics = calculateGrowthMetrics(sessions);

  const topPlayers = Array.from(playerEngagement.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="analytics-board">
      <div className="board-header">
        <h2>📊 Campaign Analytics: {stats.campaignName}</h2>
      </div>

      <div className="view-tabs">
        <button
          className={`tab ${view === 'overview' ? 'active' : ''}`}
          onClick={() => setView('overview')}
        >
          📈 Overview
        </button>
        <button
          className={`tab ${view === 'sessions' ? 'active' : ''}`}
          onClick={() => setView('sessions')}
        >
          📅 Sessions
        </button>
        <button
          className={`tab ${view === 'players' ? 'active' : ''}`}
          onClick={() => setView('players')}
        >
          👥 Players
        </button>
        <button
          className={`tab ${view === 'growth' ? 'active' : ''}`}
          onClick={() => setView('growth')}
        >
          🚀 Growth
        </button>
      </div>

      {view === 'overview' && (
        <div className="overview-section">
          <div className="stats-grid">
            <div className="stat-card">
              <label>Total Sessions</label>
              <span className="value">{stats.totalSessions}</span>
            </div>
            <div className="stat-card">
              <label>Total Combats</label>
              <span className="value">{stats.totalCombats}</span>
            </div>
            <div className="stat-card">
              <label>Avg Session Duration</label>
              <span className="value">{stats.averageSessionDuration} min</span>
            </div>
            <div className="stat-card">
              <label>Total Deaths</label>
              <span className="value">{stats.totalDeaths}</span>
            </div>
            <div className="stat-card">
              <label>Items Found</label>
              <span className="value">{stats.itemsFound}</span>
            </div>
            <div className="stat-card">
              <label>XP Distributed</label>
              <span className="value">{stats.xpDistributed}</span>
            </div>
          </div>

          <div className="combat-analysis">
            <h3>⚔️ Combat Analysis</h3>
            <div className="analysis-grid">
              <div className="analysis-item">
                <label>Combats per Session</label>
                <p>{combatStats.combatsPerSession}</p>
              </div>
              <div className="analysis-item">
                <label>Avg Combat Duration</label>
                <p>{combatStats.averageCombatDuration} min</p>
              </div>
              <div className="analysis-item">
                <label>Death Rate</label>
                <p>{combatStats.deathRate}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'sessions' && (
        <div className="sessions-section">
          <h3>🏆 Most Impactful Sessions</h3>
          <div className="sessions-list">
            {impactfulSessions.length === 0 ? (
              <p className="empty">No sessions yet</p>
            ) : (
              impactfulSessions.map((session, idx) => (
                <div key={session.sessionId} className="session-item">
                  <div className="session-rank">#{idx + 1}</div>
                  <div className="session-info">
                    <p className="date">{session.date.toLocaleDateString()}</p>
                    <p className="details">
                      {session.combatsOccurred} combats • {session.xpAwarded} XP • {session.playersPresent.length} players
                    </p>
                  </div>
                  <div className="session-duration">
                    ⏱ {session.duration}m
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {view === 'players' && (
        <div className="players-section">
          <h3>👥 Top Players by Attendance</h3>
          <div className="players-list">
            {topPlayers.length === 0 ? (
              <p className="empty">No player data yet</p>
            ) : (
              topPlayers.map((entry, idx) => (
                <div key={entry[0]} className="player-item">
                  <div className="player-rank">#{idx + 1}</div>
                  <div className="player-name">{entry[0]}</div>
                  <div className="player-sessions">
                    <span className="badge">{entry[1]} sessions</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {view === 'growth' && (
        <div className="growth-section">
          <h3>🚀 Campaign Growth</h3>
          <div className="growth-grid">
            <div className="growth-card">
              <label>Total Playtime</label>
              <p className="value">{growthMetrics.totalPlaytime} hours</p>
              <p className="subtitle">
                {Math.round(growthMetrics.totalPlaytime / 60)} hours total
              </p>
            </div>
            <div className="growth-card">
              <label>Sessions per Month</label>
              <p className="value">{growthMetrics.gamesPerMonth}</p>
              <p className="subtitle">Average frequency</p>
            </div>
            <div className="growth-card">
              <label>Avg Players per Session</label>
              <p className="value">{growthMetrics.avgPlayersPerSession}</p>
              <p className="subtitle">Party size</p>
            </div>
            <div className="growth-card">
              <label>Campaign Duration</label>
              <p className="value">
                {Math.round(
                  (new Date().getTime() - stats.createdDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                days
              </p>
              <p className="subtitle">Since creation</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .analytics-board {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .board-header h2 {
          margin: 0;
          font-size: 24px;
          color: #fff;
        }

        .view-tabs {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid #333;
          padding-bottom: 12px;
        }

        .tab {
          padding: 8px 12px;
          background: transparent;
          border: none;
          color: #999;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
        }

        .tab:hover {
          color: #a855f7;
        }

        .tab.active {
          color: #a855f7;
          border-bottom-color: #a855f7;
        }

        .overview-section,
        .sessions-section,
        .players-section,
        .growth-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .stat-card {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-card label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .stat-card .value {
          font-size: 24px;
          color: #a855f7;
          font-weight: 700;
        }

        .combat-analysis {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
        }

        .combat-analysis h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #a855f7;
          text-transform: uppercase;
          font-weight: 600;
        }

        .analysis-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .analysis-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .analysis-item label {
          font-size: 10px;
          color: #999;
          text-transform: uppercase;
        }

        .analysis-item p {
          margin: 0;
          font-size: 18px;
          color: #4ade80;
          font-weight: 700;
        }

        .sessions-list,
        .players-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 12px;
          max-height: 400px;
          overflow-y: auto;
        }

        .session-item,
        .player-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #1a1a2e;
          border-radius: 6px;
        }

        .session-rank,
        .player-rank {
          background: #a855f7;
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 12px;
          flex-shrink: 0;
        }

        .session-info {
          flex: 1;
        }

        .session-info .date {
          margin: 0;
          font-size: 12px;
          color: #fff;
          font-weight: 600;
        }

        .session-info .details {
          margin: 0;
          font-size: 11px;
          color: #999;
        }

        .session-duration {
          font-size: 11px;
          color: #ccc;
          white-space: nowrap;
        }

        .player-name {
          flex: 1;
          font-size: 12px;
          color: #fff;
          font-weight: 600;
        }

        .player-sessions {
          display: flex;
          gap: 6px;
        }

        .badge {
          background: #a855f7;
          color: #fff;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
        }

        .growth-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .growth-card {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .growth-card label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .growth-card .value {
          font-size: 28px;
          color: #4ade80;
          font-weight: 700;
        }

        .growth-card .subtitle {
          margin: 0;
          font-size: 11px;
          color: #999;
        }

        .empty {
          text-align: center;
          color: #666;
          font-size: 12px;
          padding: 20px;
        }

        @media (max-width: 768px) {
          .stats-grid,
          .analysis-grid,
          .growth-grid {
            grid-template-columns: 1fr;
          }

          .view-tabs {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};
