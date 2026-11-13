import { useState } from 'react';
import type { League } from '../../lib/competitive-leagues';
import { getRankingTier, calculateWinRate, getLeagueStandings, calculateLeagueStats } from '../../lib/competitive-leagues';

interface LeaguesPanelProps {
  leagues: League[];
  currentUserId?: string;
  onJoinLeague?: (leagueId: string) => void;
  onLeaveLeague?: (leagueId: string) => void;
}

export const LeaguesPanel = ({
  leagues,
  currentUserId,
  onJoinLeague,
  onLeaveLeague,
}: LeaguesPanelProps) => {
  const [selectedLeague, setSelectedLeague] = useState<League | null>(leagues[0] || null);
  const [view, setView] = useState<'standings' | 'stats' | 'matches'>('standings');

  if (leagues.length === 0) {
    return (
      <div className="leagues-panel empty">
        <p>📊 No leagues available</p>
      </div>
    );
  }

  const currentLeague = selectedLeague || leagues[0];
  const standings = getLeagueStandings(currentLeague);
  const stats = calculateLeagueStats(currentLeague);

  const handleJoin = () => {
    onJoinLeague?.(currentLeague.id);
  };

  const handleLeave = () => {
    onLeaveLeague?.(currentLeague.id);
  };

  const isUserInLeague = currentLeague.participants.some((p) => p.playerId === currentUserId);

  return (
    <div className="leagues-panel">
      <div className="panel-header">
        <h3>🏆 Competitive Leagues</h3>
      </div>

      <div className="leagues-tabs">
        {leagues.map((league) => (
          <button
            key={league.id}
            className={`league-tab ${selectedLeague?.id === league.id ? 'active' : ''}`}
            onClick={() => setSelectedLeague(league)}
          >
            <span className="type-icon">
              {league.type === 'ranked' && '⭐'}
              {league.type === 'casual' && '🎲'}
              {league.type === 'tournament' && '🏅'}
              {league.type === 'seasonal' && '📅'}
            </span>
            {league.name}
            <span className="participant-count">{league.participants.length}</span>
          </button>
        ))}
      </div>

      <div className="league-info">
        <div className="info-header">
          <div>
            <h2>{currentLeague.name}</h2>
            <p className="league-type">{currentLeague.type.toUpperCase()} LEAGUE</p>
          </div>
          <div className="league-status">
            <span className={`status ${currentLeague.isActive ? 'active' : 'inactive'}`}>
              {currentLeague.isActive ? '🟢 Active' : '⚪ Inactive'}
            </span>
          </div>
        </div>

        {!isUserInLeague ? (
          <button className="btn-join" onClick={handleJoin}>
            ➕ Join League
          </button>
        ) : (
          <button className="btn-leave" onClick={handleLeave}>
            ❌ Leave League
          </button>
        )}
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <label>Total Participants</label>
          <span className="value">{stats.totalParticipants}</span>
        </div>
        <div className="stat-card">
          <label>Total Matches</label>
          <span className="value">{stats.totalMatches}</span>
        </div>
        <div className="stat-card">
          <label>Average Rating</label>
          <span className="value">{stats.avgRating}</span>
        </div>
      </div>

      <div className="view-controls">
        <button
          className={`view-btn ${view === 'standings' ? 'active' : ''}`}
          onClick={() => setView('standings')}
        >
          📊 Standings
        </button>
        <button
          className={`view-btn ${view === 'stats' ? 'active' : ''}`}
          onClick={() => setView('stats')}
        >
          📈 Statistics
        </button>
        <button
          className={`view-btn ${view === 'matches' ? 'active' : ''}`}
          onClick={() => setView('matches')}
        >
          ⚔️ Matches
        </button>
      </div>

      {view === 'standings' && (
        <div className="standings-table">
          <div className="table-header">
            <div className="col-rank">Rank</div>
            <div className="col-player">Player</div>
            <div className="col-rating">Rating</div>
            <div className="col-record">Record</div>
            <div className="col-winrate">Win %</div>
          </div>

          {standings.map((participant, idx) => {
            const tier = getRankingTier(participant.rating);
            const winRate = calculateWinRate(participant);

            return (
              <div
                key={participant.id}
                className={`table-row ${participant.playerId === currentUserId ? 'current-user' : ''}`}
              >
                <div className="col-rank">
                  <span className="rank">#{idx + 1}</span>
                </div>
                <div className="col-player">
                  <span className="tier-icon">{tier.icon}</span>
                  <span className="player-name">{participant.playerName}</span>
                </div>
                <div className="col-rating">
                  <span className="rating" style={{ color: tier.color }}>
                    {participant.rating}
                  </span>
                </div>
                <div className="col-record">
                  <span className="record">
                    {participant.wins}W-{participant.losses}L{participant.draws > 0 ? `-${participant.draws}D` : ''}
                  </span>
                </div>
                <div className="col-winrate">
                  <span className="winrate">{winRate.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'stats' && (
        <div className="stats-details">
          <h3>Top Performers</h3>
          <div className="top-players">
            {stats.topRated.map((player, idx) => {
              const tier = getRankingTier(player.rating);
              return (
                <div key={player.id} className="player-stat">
                  <div className="player-rank">#{idx + 1}</div>
                  <div className="player-info">
                    <p className="name">{player.playerName}</p>
                    <p className="tier">{tier.name}</p>
                  </div>
                  <div className="player-rating">
                    <span style={{ color: tier.color }}>{player.rating}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'matches' && (
        <div className="matches-section">
          <p className="placeholder">No recent matches</p>
        </div>
      )}

      <style>{`
        .leagues-panel {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .leagues-panel.empty {
          align-items: center;
          justify-content: center;
          min-height: 300px;
          text-align: center;
          color: #666;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 18px;
          color: #fff;
        }

        .leagues-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
        }

        .league-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          color: #999;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .league-tab:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        .league-tab.active {
          border-color: #a855f7;
          background: rgba(168, 85, 247, 0.1);
          color: #a855f7;
        }

        .type-icon {
          font-size: 14px;
        }

        .participant-count {
          background: #a855f7;
          color: #fff;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
        }

        .league-info {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .info-header {
          flex: 1;
        }

        .info-header h2 {
          margin: 0 0 4px 0;
          font-size: 20px;
          color: #fff;
        }

        .league-type {
          margin: 0;
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .league-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .status.active {
          background: rgba(74, 222, 128, 0.1);
          color: #4ade80;
        }

        .status.inactive {
          background: rgba(153, 153, 153, 0.1);
          color: #999;
        }

        .btn-join,
        .btn-leave {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-join {
          background: #a855f7;
          color: #fff;
        }

        .btn-join:hover {
          background: #9333ea;
        }

        .btn-leave {
          background: #ef4444;
          color: #fff;
        }

        .btn-leave:hover {
          background: #dc2626;
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .stat-card {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
          text-align: center;
        }

        .stat-card label {
          display: block;
          font-size: 10px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .stat-card .value {
          font-size: 20px;
          color: #a855f7;
          font-weight: 700;
        }

        .view-controls {
          display: flex;
          gap: 8px;
        }

        .view-btn {
          flex: 1;
          padding: 8px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          color: #999;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
        }

        .view-btn:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        .view-btn.active {
          border-color: #a855f7;
          background: rgba(168, 85, 247, 0.1);
          color: #a855f7;
        }

        .standings-table {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: #333;
          border-radius: 6px;
          overflow: hidden;
        }

        .table-header,
        .table-row {
          display: grid;
          grid-template-columns: 50px 1fr 80px 100px 70px;
          gap: 12px;
          padding: 12px;
          align-items: center;
        }

        .table-header {
          background: #0d0d0d;
          font-size: 10px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
          border-bottom: 1px solid #333;
        }

        .table-row {
          background: #1a1a1a;
          font-size: 12px;
          color: #ccc;
        }

        .table-row.current-user {
          background: rgba(168, 85, 247, 0.1);
          border-left: 3px solid #a855f7;
        }

        .rank {
          font-weight: 600;
          color: #999;
        }

        .tier-icon {
          margin-right: 4px;
        }

        .player-name {
          color: #fff;
          font-weight: 600;
        }

        .rating {
          font-weight: 700;
        }

        .record {
          font-size: 11px;
          color: #999;
        }

        .winrate {
          font-weight: 600;
          color: #4ade80;
        }

        .top-players {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
        }

        .player-stat {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

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
        }

        .player-info {
          text-align: center;
        }

        .player-info .name {
          margin: 0;
          font-size: 12px;
          color: #fff;
          font-weight: 600;
        }

        .player-info .tier {
          margin: 0;
          font-size: 10px;
          color: #999;
        }

        .player-rating {
          font-size: 16px;
          font-weight: 700;
        }

        .placeholder {
          text-align: center;
          color: #666;
          font-size: 12px;
          padding: 20px;
        }

        @media (max-width: 768px) {
          .stats-overview {
            grid-template-columns: 1fr;
          }

          .table-header,
          .table-row {
            grid-template-columns: 40px 1fr 60px;
          }

          .col-record,
          .col-winrate {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
