import { useState } from 'react';
import type { CombatReplay, ReplayTimeline } from '../../lib/replay-system';
import { calculateReplayAnalytics, generateReplaySummary } from '../../lib/replay-system';

interface ReplayViewerProps {
  replay: CombatReplay;
  onClose?: () => void;
}

export const ReplayViewer = ({
  replay,
  onClose,
}: ReplayViewerProps) => {
  const [timeline, setTimeline] = useState<ReplayTimeline>({
    currentFrame: 0,
    isPlaying: false,
    speed: 1,
    duration: replay.duration,
  });

  const analytics = calculateReplayAnalytics(replay);
  const summary = generateReplaySummary(replay);

  const currentFrame = replay.frames[timeline.currentFrame];
  const progressPercent = (timeline.currentFrame / Math.max(1, replay.frames.length - 1)) * 100;

  const handlePlayPause = () => {
    setTimeline((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  };

  const handleFrameChange = (frameIndex: number) => {
    setTimeline((prev) => ({
      ...prev,
      currentFrame: Math.max(0, Math.min(frameIndex, replay.frames.length - 1)),
      isPlaying: false,
    }));
  };

  const handleSpeedChange = (speed: number) => {
    setTimeline((prev) => ({
      ...prev,
      speed,
    }));
  };

  const handleNextFrame = () => {
    handleFrameChange(timeline.currentFrame + 1);
  };

  const handlePreviousFrame = () => {
    handleFrameChange(timeline.currentFrame - 1);
  };

  const getFrameTypeColor = (type: string) => {
    switch (type) {
      case 'roll':
        return '#4ade80';
      case 'damage':
        return '#ef4444';
      case 'action':
        return '#0ea5e9';
      case 'state':
        return '#a855f7';
      case 'chat':
        return '#fbbf24';
      default:
        return '#999';
    }
  };

  return (
    <div className="replay-viewer">
      <div className="viewer-header">
        <h2>📹 Combat Replay: {replay.combatName}</h2>
        {onClose && (
          <button className="btn-close-viewer" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <div className="viewer-content">
        <div className="frame-viewer">
          <div className="frame-display">
            {currentFrame ? (
              <>
                <div className="frame-header">
                  <span
                    className="frame-type"
                    style={{ backgroundColor: getFrameTypeColor(currentFrame.type) }}
                  >
                    {currentFrame.type.toUpperCase()}
                  </span>
                  <span className="frame-time">
                    {Math.floor(currentFrame.timestamp / 60)}m{' '}
                    {Math.floor(currentFrame.timestamp % 60)}s
                  </span>
                </div>
                <div className="frame-content">
                  {currentFrame.actor && (
                    <p className="frame-actor">
                      <strong>{currentFrame.actor}</strong>
                    </p>
                  )}
                  {currentFrame.description && (
                    <p className="frame-description">{currentFrame.description}</p>
                  )}
                  {Object.keys(currentFrame.data).length > 0 && (
                    <pre className="frame-data">
                      {JSON.stringify(currentFrame.data, null, 2)}
                    </pre>
                  )}
                </div>
              </>
            ) : (
              <p className="frame-empty">No frame selected</p>
            )}
          </div>

          <div className="timeline-controls">
            <button className="btn-control" onClick={handlePreviousFrame}>
              ⏮ Prev
            </button>
            <button className="btn-control" onClick={handlePlayPause}>
              {timeline.isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button className="btn-control" onClick={handleNextFrame}>
              Next ⏭
            </button>

            <div className="speed-control">
              <label>Speed:</label>
              {[0.5, 1, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  className={`speed-btn ${timeline.speed === speed ? 'active' : ''}`}
                  onClick={() => handleSpeedChange(speed)}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="progress-bar">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
              <input
                type="range"
                min="0"
                max={replay.frames.length - 1}
                value={timeline.currentFrame}
                onChange={(e) => handleFrameChange(parseInt(e.target.value))}
                className="progress-slider"
              />
            </div>
            <span className="frame-counter">
              {timeline.currentFrame + 1} / {replay.frames.length}
            </span>
          </div>
        </div>

        <div className="viewer-sidebar">
          <div className="analytics-section">
            <h3>📊 Analytics</h3>
            <div className="analytics-grid">
              <div className="stat">
                <label>Total Actions</label>
                <span>{analytics.totalActions}</span>
              </div>
              <div className="stat">
                <label>Total Damage</label>
                <span>{analytics.totalDamage}</span>
              </div>
              <div className="stat">
                <label>Avg/Round</label>
                <span>{analytics.averageDamagePerRound}</span>
              </div>
              <div className="stat">
                <label>Critical Hits</label>
                <span>{analytics.criticalHits}</span>
              </div>
              <div className="stat">
                <label>Spells Cast</label>
                <span>{analytics.spellsCast}</span>
              </div>
              <div className="stat">
                <label>Items Used</label>
                <span>{analytics.itemsUsed}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>ℹ️ Summary</h3>
            <pre className="summary-text">{summary}</pre>
          </div>

          <div className="engagement-section">
            <div className="engagement-stat">
              <span className="label">👁 Views</span>
              <span className="value">{replay.views}</span>
            </div>
            <div className="engagement-stat">
              <span className="label">❤ Likes</span>
              <span className="value">{replay.likes}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .replay-viewer {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: 800px;
        }

        .viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #333;
          background: #0d0d0d;
        }

        .viewer-header h2 {
          margin: 0;
          font-size: 16px;
          color: #fff;
        }

        .btn-close-viewer {
          background: none;
          border: none;
          color: #999;
          font-size: 20px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .btn-close-viewer:hover {
          color: #a855f7;
        }

        .viewer-content {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 16px;
          padding: 16px;
          flex: 1;
          overflow-y: auto;
        }

        .frame-viewer {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .frame-display {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .frame-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .frame-type {
          padding: 4px 8px;
          border-radius: 4px;
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .frame-time {
          font-size: 12px;
          color: #999;
        }

        .frame-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .frame-actor {
          margin: 0;
          font-size: 14px;
          color: #a855f7;
        }

        .frame-description {
          margin: 0;
          font-size: 13px;
          color: #ccc;
          line-height: 1.5;
        }

        .frame-data {
          margin: 0;
          padding: 8px;
          background: #1a1a1a;
          border-radius: 4px;
          color: #4ade80;
          font-size: 10px;
          font-family: 'Courier New', monospace;
          max-height: 150px;
          overflow-y: auto;
        }

        .frame-empty {
          margin: 0;
          text-align: center;
          color: #666;
          font-size: 12px;
        }

        .timeline-controls {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .btn-control {
          padding: 8px 12px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 4px;
          color: #ccc;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-control:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        .speed-control {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: auto;
        }

        .speed-control label {
          font-size: 11px;
          color: #999;
          font-weight: 600;
        }

        .speed-btn {
          padding: 4px 8px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 3px;
          color: #999;
          font-size: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .speed-btn:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        .speed-btn.active {
          background: #a855f7;
          border-color: #a855f7;
          color: #fff;
        }

        .progress-bar {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .progress-track {
          flex: 1;
          position: relative;
          height: 6px;
          background: #0d0d0d;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #a855f7;
          transition: width 0.1s;
        }

        .progress-slider {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          appearance: none;
          background: transparent;
          cursor: pointer;
          z-index: 10;
        }

        .progress-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: #fff;
          border-radius: 50%;
          cursor: pointer;
        }

        .frame-counter {
          font-size: 11px;
          color: #999;
          white-space: nowrap;
        }

        .viewer-sidebar {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
        }

        .analytics-section,
        .info-section,
        .engagement-section {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
        }

        .analytics-section h3,
        .info-section h3 {
          margin: 0 0 12px 0;
          font-size: 12px;
          color: #a855f7;
          text-transform: uppercase;
          font-weight: 600;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat label {
          font-size: 10px;
          color: #999;
        }

        .stat span {
          font-size: 14px;
          color: #a855f7;
          font-weight: 700;
        }

        .summary-text {
          margin: 0;
          padding: 8px;
          background: #1a1a1a;
          border-radius: 4px;
          color: #ccc;
          font-size: 10px;
          font-family: 'Courier New', monospace;
          max-height: 200px;
          overflow-y: auto;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .engagement-section {
          display: flex;
          justify-content: space-around;
        }

        .engagement-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .engagement-stat .label {
          font-size: 10px;
          color: #999;
        }

        .engagement-stat .value {
          font-size: 16px;
          color: #a855f7;
          font-weight: 700;
        }

        @media (max-width: 1024px) {
          .viewer-content {
            grid-template-columns: 1fr;
          }

          .viewer-sidebar {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
        }

        @media (max-width: 768px) {
          .timeline-controls {
            flex-direction: column;
          }

          .speed-control {
            width: 100%;
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
};
