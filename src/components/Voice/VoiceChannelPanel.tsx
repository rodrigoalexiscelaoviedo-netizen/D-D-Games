import { useState } from 'react';
import type { VoiceChannel, AudioEffect, VoiceSettings } from '../../lib/voice-chat';
import { DEFAULT_VOICE_SETTINGS, AUDIO_QUALITY_SETTINGS } from '../../lib/voice-chat';

interface VoiceChannelPanelProps {
  channel: VoiceChannel;
  currentUserId: string;
  settings?: VoiceSettings;
  onToggleMute?: (participantId: string) => void;
  onSetVolume?: (participantId: string, volume: number) => void;
  onApplyEffect?: (participantId: string, effect: AudioEffect) => void;
  onLeaveChannel?: () => void;
}

export const VoiceChannelPanel = ({
  channel,
  currentUserId,
  settings = DEFAULT_VOICE_SETTINGS,
  onToggleMute,
  onSetVolume,
  onApplyEffect,
  onLeaveChannel,
}: VoiceChannelPanelProps) => {
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null);
  const currentQualitySettings = AUDIO_QUALITY_SETTINGS[settings.audioQuality];

  return (
    <div className="voice-channel-panel">
      <div className="channel-header">
        <div className="channel-info">
          <div className="status-indicator" style={{ background: channel.isActive ? '#4ade80' : '#ef4444' }}></div>
          <div>
            <h3>🎙️ {channel.name}</h3>
            <p className="participant-count">{channel.participants.length} online</p>
          </div>
        </div>
        <div className="quality-badge">
          <span className="bitrate">{currentQualitySettings.bitrate}kbps</span>
          <span className="sample-rate">{currentQualitySettings.sampleRate}Hz</span>
        </div>
      </div>

      <div className="participants-list">
        <div className="list-header">
          <h4>Participants</h4>
          <span className="count">{channel.participants.length}</span>
        </div>

        {channel.participants.length === 0 ? (
          <p className="empty">No participants in this channel</p>
        ) : (
          <div className="participants">
            {channel.participants.map((participant) => {
              const isCurrent = participant.id === currentUserId;
              const isExpanded = expandedParticipant === participant.id;

              return (
                <div key={participant.id} className={`participant-card ${isCurrent ? 'current' : ''}`}>
                  <div className="participant-header">
                    <div className="participant-info">
                      <div className="avatar">
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h5>{participant.name} {isCurrent && '(You)'}</h5>
                        <p className="status">
                          {participant.isMuted ? '🔇 Muted' : '🔊 Active'}
                          {participant.audioEffect && participant.audioEffect !== 'none' && (
                            <span className="effect"> • {participant.audioEffect}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      className="expand-btn"
                      onClick={() =>
                        setExpandedParticipant(isExpanded ? null : participant.id)
                      }
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="participant-controls">
                      <div className="control-group">
                        <label>Volume</label>
                        <div className="volume-control">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={participant.volume}
                            onChange={(e) =>
                              onSetVolume?.(participant.id, parseInt(e.target.value))
                            }
                            className="volume-slider"
                          />
                          <span className="volume-value">{participant.volume}%</span>
                        </div>
                      </div>

                      {!isCurrent && (
                        <div className="control-group">
                          <label>Effects</label>
                          <div className="effects-grid">
                            {(['none', 'echo', 'reverb', 'robot', 'whisper'] as AudioEffect[]).map(
                              (effect) => (
                                <button
                                  key={effect}
                                  className={`effect-btn ${
                                    participant.audioEffect === effect ? 'active' : ''
                                  }`}
                                  onClick={() => onApplyEffect?.(participant.id, effect)}
                                >
                                  {effect === 'none' ? 'Normal' : effect.charAt(0).toUpperCase() + effect.slice(1)}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {!isCurrent && (
                        <button
                          className="btn-mute"
                          onClick={() => onToggleMute?.(participant.id)}
                        >
                          {participant.isMuted ? '🔊 Unmute' : '🔇 Mute'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="channel-settings">
        <h4>Settings</h4>
        <div className="settings-grid">
          <div className="setting-item">
            <label>Quality</label>
            <span className="value">{settings.audioQuality.toUpperCase()}</span>
          </div>
          <div className="setting-item">
            <label>Noise Reduction</label>
            <span className="value">{settings.noiseReduction ? '✓' : '✗'}</span>
          </div>
          <div className="setting-item">
            <label>Echo Cancellation</label>
            <span className="value">{settings.echoCancellation ? '✓' : '✗'}</span>
          </div>
          <div className="setting-item">
            <label>Auto Gain</label>
            <span className="value">{settings.autoGainControl ? '✓' : '✗'}</span>
          </div>
        </div>
      </div>

      {onLeaveChannel && (
        <button className="btn-leave" onClick={onLeaveChannel}>
          📞 Leave Channel
        </button>
      )}

      <style>{`
        .voice-channel-panel {
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

        .channel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .channel-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .channel-info h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          color: #fff;
        }

        .participant-count {
          margin: 0;
          font-size: 11px;
          color: #999;
        }

        .quality-badge {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 4px;
          padding: 6px 8px;
          display: flex;
          gap: 8px;
          font-size: 10px;
          color: #a855f7;
          font-weight: 600;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .list-header h4 {
          margin: 0;
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .list-header .count {
          background: #a855f7;
          color: #fff;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
        }

        .participants {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .participant-card {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          overflow: hidden;
        }

        .participant-card.current {
          border-color: #a855f7;
          background: rgba(168, 85, 247, 0.05);
        }

        .participant-header {
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .participant-header:hover {
          background: #1a1a2e;
        }

        .participant-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .avatar {
          width: 36px;
          height: 36px;
          background: #a855f7;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 600;
          font-size: 14px;
        }

        .participant-info h5 {
          margin: 0 0 2px 0;
          font-size: 14px;
          color: #fff;
        }

        .status {
          margin: 0;
          font-size: 11px;
          color: #999;
        }

        .effect {
          color: #a855f7;
          font-weight: 600;
        }

        .expand-btn {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          font-size: 14px;
          transition: color 0.2s;
        }

        .expand-btn:hover {
          color: #a855f7;
        }

        .participant-controls {
          background: #1a1a2e;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-top: 1px solid #333;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .control-group label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .volume-control {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .volume-slider {
          flex: 1;
          height: 4px;
          appearance: none;
          background: #0d0d0d;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }

        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: #a855f7;
          border-radius: 50%;
          cursor: pointer;
        }

        .volume-value {
          font-size: 11px;
          color: #a855f7;
          min-width: 35px;
          text-align: right;
          font-weight: 600;
        }

        .effects-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
        }

        .effect-btn {
          padding: 6px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 4px;
          color: #999;
          font-size: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .effect-btn:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        .effect-btn.active {
          background: #a855f7;
          border-color: #a855f7;
          color: #fff;
        }

        .btn-mute {
          padding: 8px 12px;
          background: #ef4444;
          color: #fff;
          border: none;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-mute:hover {
          background: #dc2626;
        }

        .channel-settings {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
        }

        .channel-settings h4 {
          margin: 0 0 12px 0;
          font-size: 12px;
          color: #a855f7;
          text-transform: uppercase;
          font-weight: 600;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .setting-item label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .setting-item .value {
          font-size: 12px;
          color: #4ade80;
          font-weight: 600;
        }

        .btn-leave {
          padding: 10px 16px;
          background: #ef4444;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-leave:hover {
          background: #dc2626;
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
