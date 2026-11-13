import { useState } from 'react';
import type { VideoPlayer as VideoPlayerType, VideoLink, VideoQuality } from '../../lib/video-integration';
import { getYouTubeEmbedUrl, getTwitchEmbedUrl } from '../../lib/video-integration';

interface VideoPlayerProps {
  player: VideoPlayerType;
  onPlayerChange?: (player: VideoPlayerType) => void;
  onAddVideo?: (video: VideoLink) => void;
  readOnly?: boolean;
}

export const VideoPlayer = ({
  player,
  onPlayerChange,
  onAddVideo,
  readOnly = false,
}: VideoPlayerProps) => {
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');

  const handleAddVideo = () => {
    if (!newVideoUrl.trim() || !newVideoTitle.trim()) return;

    const videoLink: VideoLink = {
      id: `video_${Date.now()}`,
      title: newVideoTitle,
      source: newVideoUrl.includes('youtube') ? 'youtube' : newVideoUrl.includes('twitch') ? 'twitch' : 'url',
      url: newVideoUrl,
      addedBy: 'Current User',
      addedDate: new Date(),
    };

    onAddVideo?.(videoLink);
    setNewVideoUrl('');
    setNewVideoTitle('');
  };

  const getEmbedUrl = () => {
    if (!player.currentVideo) return null;

    if (player.currentVideo.source === 'youtube') {
      return getYouTubeEmbedUrl(player.currentVideo.url);
    } else if (player.currentVideo.source === 'twitch') {
      return getTwitchEmbedUrl(player.currentVideo.url);
    }

    return player.currentVideo.url;
  };

  const embedUrl = getEmbedUrl();

  return (
    <div className="video-player">
      <div className="player-container">
        {player.currentVideo ? (
          <div className="video-embed">
            {player.currentVideo.source === 'youtube' ? (
              <iframe
                width="100%"
                height="100%"
                src={embedUrl || ''}
                title={player.currentVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : player.currentVideo.source === 'twitch' ? (
              <iframe
                src={embedUrl || ''}
                height="100%"
                width="100%"
                title={player.currentVideo.title}
                frameBorder="0"
                allowFullScreen
              ></iframe>
            ) : (
              <video
                width="100%"
                height="100%"
                controls
                src={embedUrl || ''}
                style={{ background: '#000' }}
              />
            )}
          </div>
        ) : (
          <div className="player-empty">
            <p>📹 No video selected</p>
            <p className="hint">Add a video to the playlist to get started</p>
          </div>
        )}

        <div className="player-info">
          <h3>{player.currentVideo?.title || 'No Video'}</h3>
          <p className="source">{player.currentVideo?.source.toUpperCase() || 'N/A'}</p>
        </div>
      </div>

      <div className="player-controls">
        <div className="controls-section">
          <label>Quality</label>
          <select
            value={player.quality}
            onChange={(e) => {
              onPlayerChange?.({
                ...player,
                quality: e.target.value as VideoQuality,
              });
            }}
            className="quality-select"
          >
            <option value="480p">480p</option>
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
            <option value="2160p">2160p</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div className="controls-section">
          <label>Volume</label>
          <div className="volume-control">
            <input
              type="range"
              min="0"
              max="100"
              value={player.volume}
              onChange={(e) => {
                onPlayerChange?.({
                  ...player,
                  volume: parseInt(e.target.value),
                });
              }}
              className="volume-slider"
            />
            <span>{player.volume}%</span>
          </div>
        </div>

        <div className="controls-section toggles">
          <label>
            <input
              type="checkbox"
              checked={player.autoplay}
              onChange={() => {
                onPlayerChange?.({
                  ...player,
                  autoplay: !player.autoplay,
                });
              }}
            />
            Autoplay
          </label>
          <label>
            <input
              type="checkbox"
              checked={player.loop}
              onChange={() => {
                onPlayerChange?.({
                  ...player,
                  loop: !player.loop,
                });
              }}
            />
            Loop
          </label>
        </div>
      </div>

      {!readOnly && (
        <div className="add-video-section">
          <h4>Add Video</h4>
          <div className="input-group">
            <input
              type="text"
              placeholder="Video title"
              value={newVideoTitle}
              onChange={(e) => setNewVideoTitle(e.target.value)}
              className="input-field"
            />
            <input
              type="url"
              placeholder="YouTube, Twitch, or video URL"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              className="input-field"
            />
            <button className="btn-add" onClick={handleAddVideo}>
              + Add to Playlist
            </button>
          </div>
        </div>
      )}

      <div className="playlist-section">
        <h4>📺 Playlist ({player.playlist.length})</h4>

        {player.playlist.length === 0 ? (
          <p className="empty">Playlist is empty</p>
        ) : (
          <div className="playlist">
            {player.playlist.map((video, idx) => (
              <div
                key={video.id}
                className={`playlist-item ${player.currentVideo?.id === video.id ? 'active' : ''}`}
              >
                <div className="item-info">
                  <span className="index">{idx + 1}</span>
                  <div className="title-section">
                    <h5>{video.title}</h5>
                    <p>{video.source.toUpperCase()}</p>
                  </div>
                </div>
                <div className="item-actions">
                  {!readOnly && (
                    <button className="btn-play" onClick={() => onPlayerChange?.({ ...player, currentVideo: video })}>
                      ▶
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .video-player {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 800px;
          overflow-y: auto;
        }

        .player-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .video-embed {
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #000;
          border-radius: 6px;
          overflow: hidden;
        }

        .video-embed iframe,
        .video-embed video {
          width: 100%;
          height: 100%;
        }

        .player-empty {
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        .player-empty p {
          margin: 0;
        }

        .player-empty p:first-child {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .hint {
          font-size: 12px;
        }

        .player-info {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
        }

        .player-info h3 {
          margin: 0 0 4px 0;
          font-size: 14px;
          color: #fff;
        }

        .source {
          margin: 0;
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
        }

        .player-controls {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
        }

        .controls-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .controls-section label {
          font-size: 10px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .quality-select {
          padding: 6px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 4px;
          color: #ccc;
          font-size: 11px;
          cursor: pointer;
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
          background: #333;
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
        }

        .volume-control span {
          font-size: 10px;
          color: #999;
          min-width: 30px;
          text-align: right;
        }

        .toggles {
          grid-column: 1 / -1;
          display: flex;
          gap: 16px;
        }

        .toggles label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #ccc;
          text-transform: none;
          cursor: pointer;
          font-weight: normal;
        }

        .toggles input {
          cursor: pointer;
        }

        .add-video-section {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
        }

        .add-video-section h4 {
          margin: 0 0 12px 0;
          font-size: 12px;
          color: #a855f7;
          text-transform: uppercase;
          font-weight: 600;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-field {
          padding: 8px 12px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 4px;
          color: #ccc;
          font-size: 12px;
        }

        .input-field:focus {
          outline: none;
          border-color: #a855f7;
        }

        .btn-add {
          padding: 8px 12px;
          background: #a855f7;
          color: #fff;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          font-size: 11px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-add:hover {
          background: #9333ea;
        }

        .playlist-section {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 12px;
        }

        .playlist-section h4 {
          margin: 0 0 12px 0;
          font-size: 12px;
          color: #a855f7;
          text-transform: uppercase;
          font-weight: 600;
        }

        .playlist {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 200px;
          overflow-y: auto;
        }

        .playlist-item {
          background: #1a1a2e;
          border: 1px solid #333;
          border-radius: 4px;
          padding: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .playlist-item:hover {
          border-color: #a855f7;
          background: #242450;
        }

        .playlist-item.active {
          border-color: #a855f7;
          background: rgba(168, 85, 247, 0.1);
        }

        .item-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .index {
          background: #a855f7;
          color: #fff;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .title-section {
          flex: 1;
        }

        .title-section h5 {
          margin: 0 0 2px 0;
          font-size: 12px;
          color: #ccc;
        }

        .title-section p {
          margin: 0;
          font-size: 10px;
          color: #999;
        }

        .item-actions {
          display: flex;
          gap: 4px;
        }

        .btn-play {
          width: 28px;
          height: 28px;
          background: #a855f7;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.2s;
        }

        .btn-play:hover {
          background: #9333ea;
        }

        .empty {
          text-align: center;
          color: #666;
          font-size: 12px;
          padding: 16px;
        }
      `}</style>
    </div>
  );
};
