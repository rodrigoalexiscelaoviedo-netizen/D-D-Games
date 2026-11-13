import { useState } from 'react';
import type { PublicCampaignPage } from '../../lib/public-campaigns';
import {
  recordView,
  addFollower,
  removeFollower,
  likeCampaign,
  unlikeCampaign,
  getEngagementMetrics,
} from '../../lib/public-campaigns';

interface PublicCampaignPageProps {
  page: PublicCampaignPage;
  isFollowing?: boolean;
  isLiked?: boolean;
  onFollow?: (follow: boolean) => void;
  onLike?: (like: boolean) => void;
}

export const PublicCampaignPageComponent = ({
  page: initialPage,
  isFollowing = false,
  isLiked = false,
  onFollow,
  onLike,
}: PublicCampaignPageProps) => {
  const [page, setPage] = useState(initialPage);
  const [following, setFollowing] = useState(isFollowing);
  const [liked, setLiked] = useState(isLiked);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'reviews' | 'stats'>('overview');

  const engagement = getEngagementMetrics(page);

  const handleFollow = () => {
    if (following) {
      setPage(removeFollower(page));
      setFollowing(false);
    } else {
      setPage(addFollower(page));
      setFollowing(true);
    }
    onFollow?.(!following);
  };

  const handleLike = () => {
    if (liked) {
      setPage(unlikeCampaign(page));
      setLiked(false);
    } else {
      setPage(likeCampaign(page));
      setLiked(true);
    }
    onLike?.(!liked);
  };

  const handleView = () => {
    setPage(recordView(page));
  };

  return (
    <div className="public-campaign-page" onMouseEnter={handleView}>
      {/* Header */}
      <div className="page-header">
        {page.coverImage && (
          <img src={page.coverImage} alt={page.campaignName} className="cover-image" />
        )}
        <div className="header-overlay">
          <h1>{page.campaignName}</h1>
          <p className="creator">by {page.createdBy}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="engagement-metrics">
          <div className="metric">
            <span className="icon">👁</span>
            <span className="value">{page.viewCount.toLocaleString()}</span>
            <span className="label">Views</span>
          </div>
          <div className="metric">
            <span className="icon">❤️</span>
            <span className="value">{page.likes.toLocaleString()}</span>
            <span className="label">Likes</span>
          </div>
          <div className="metric">
            <span className="icon">👥</span>
            <span className="value">{page.followers.toLocaleString()}</span>
            <span className="label">Followers</span>
          </div>
          <div className="metric">
            <span className="icon">⭐</span>
            <span className="value">{page.averageRating.toFixed(1)}</span>
            <span className="label">Rating</span>
          </div>
        </div>

        <div className="action-buttons">
          <button
            className={`btn-follow ${following ? 'following' : ''}`}
            onClick={handleFollow}
          >
            {following ? '✓ Following' : '+ Follow'}
          </button>
          <button
            className={`btn-like ${liked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            {liked ? '❤️ Liked' : '🤍 Like'}
          </button>
          <button className="btn-share">📤 Share</button>
        </div>
      </div>

      {/* Engagement Score Badge */}
      <div className="engagement-badge">
        <div className="score">{engagement.engagementScore}</div>
        <div className="info">
          <p className="popularity">{engagement.popularity}</p>
          <p className="trend">{engagement.trend === 'rising' ? '📈 Rising' : '➡️ Stable'}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button
          className={`tab ${selectedTab === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedTab('overview')}
        >
          📖 Overview
        </button>
        <button
          className={`tab ${selectedTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setSelectedTab('reviews')}
        >
          💬 Reviews ({page.reviews.length})
        </button>
        <button
          className={`tab ${selectedTab === 'stats' ? 'active' : ''}`}
          onClick={() => setSelectedTab('stats')}
        >
          📊 Stats
        </button>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="tab-content">
          <div className="section">
            <h2>Description</h2>
            <p className="description">
              {page.description || 'No description provided yet'}
            </p>
          </div>

          <div className="section">
            <h2>Tags</h2>
            <div className="tags">
              {page.tags.length === 0 ? (
                <p className="empty">No tags</p>
              ) : (
                page.tags.map((tag) => (
                  <span key={tag} className="tag">
                    #{tag}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="campaign-stats-grid">
            <div className="stat-card">
              <label>Total Sessions</label>
              <p className="value">{page.stats.totalSessions}</p>
            </div>
            <div className="stat-card">
              <label>Active Players</label>
              <p className="value">{page.stats.activePlayers}</p>
            </div>
            <div className="stat-card">
              <label>Total Hours</label>
              <p className="value">{page.stats.totalHours}</p>
            </div>
            <div className="stat-card">
              <label>Published</label>
              <p className="value">{page.createdDate.toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {selectedTab === 'reviews' && (
        <div className="tab-content">
          <div className="reviews-list">
            {page.reviews.length === 0 ? (
              <p className="empty">No reviews yet</p>
            ) : (
              page.reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <p className="reviewer-name">{review.authorName}</p>
                      <p className="review-date">{review.createdDate.toLocaleDateString()}</p>
                    </div>
                    <div className="review-rating">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < review.rating ? 'star filled' : 'star'}>
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                  <h4>{review.title}</h4>
                  <p className="review-text">{review.comment}</p>
                  <div className="review-footer">
                    <button className="btn-helpful">
                      👍 Helpful ({review.likes})
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {selectedTab === 'stats' && (
        <div className="tab-content">
          <div className="stats-grid">
            <div className="stat-box">
              <label>Views Over Time</label>
              <div className="sparkline">
                <div className="bar" style={{ height: '30%' }} />
                <div className="bar" style={{ height: '50%' }} />
                <div className="bar" style={{ height: '70%' }} />
                <div className="bar" style={{ height: '90%' }} />
                <div className="bar" style={{ height: '100%' }} />
              </div>
            </div>

            <div className="stat-box">
              <label>Engagement Score</label>
              <div className="engagement-chart">
                <div className="score-circle" style={{ color: '#a855f7' }}>
                  {engagement.engagementScore}
                </div>
              </div>
            </div>

            <div className="stat-box">
              <label>Average Rating</label>
              <div className="rating-display">
                <span className="big-rating">{page.averageRating.toFixed(1)}</span>
                <div className="stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={i < Math.floor(page.averageRating) ? 'star filled' : 'star'}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="stat-box">
              <label>Player Activity</label>
              <p className="activity-label">Active: {page.stats.activePlayers}</p>
              <p className="activity-label">Participated: {page.stats.totalSessions} sessions</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .public-campaign-page {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .page-header {
          position: relative;
          height: 250px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          display: flex;
          align-items: flex-end;
        }

        .cover-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.7;
        }

        .header-overlay {
          position: relative;
          z-index: 2;
          padding: 24px;
          background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
          width: 100%;
        }

        .page-header h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          color: #fff;
        }

        .creator {
          margin: 0;
          font-size: 12px;
          color: #999;
        }

        .action-bar {
          padding: 20px 24px;
          border-bottom: 1px solid #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .engagement-metrics {
          display: flex;
          gap: 24px;
        }

        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .metric .icon {
          font-size: 20px;
        }

        .metric .value {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
        }

        .metric .label {
          font-size: 10px;
          color: #999;
          text-transform: uppercase;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
        }

        .action-buttons button {
          padding: 8px 16px;
          border: 1px solid #333;
          background: #1a1a1a;
          color: #fff;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-buttons button:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        .btn-follow.following,
        .btn-like.liked {
          background: #a855f7;
          border-color: #a855f7;
          color: #fff;
        }

        .engagement-badge {
          padding: 20px 24px;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%);
          border-bottom: 1px solid #333;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .engagement-badge .score {
          font-size: 32px;
          font-weight: 700;
          color: #a855f7;
          min-width: 60px;
        }

        .engagement-badge .info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .engagement-badge .popularity {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }

        .engagement-badge .trend {
          margin: 0;
          font-size: 12px;
          color: #999;
        }

        .tab-nav {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid #333;
          padding: 0 24px;
        }

        .tab {
          padding: 12px 16px;
          background: transparent;
          border: none;
          color: #999;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab:hover {
          color: #a855f7;
        }

        .tab.active {
          color: #a855f7;
          border-bottom-color: #a855f7;
        }

        .tab-content {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section h2 {
          margin: 0;
          font-size: 16px;
          color: #fff;
          font-weight: 600;
        }

        .description {
          margin: 0;
          color: #ccc;
          line-height: 1.6;
          font-size: 14px;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tag {
          padding: 6px 12px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 4px;
          font-size: 12px;
          color: #a855f7;
        }

        .campaign-stats-grid,
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .stat-card,
        .stat-box {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-card label,
        .stat-box label {
          font-size: 10px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .stat-card .value,
        .stat-box .value {
          font-size: 20px;
          color: #a855f7;
          font-weight: 700;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .review-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .reviewer-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .reviewer-name {
          margin: 0;
          font-size: 12px;
          color: #fff;
          font-weight: 600;
        }

        .review-date {
          margin: 0;
          font-size: 10px;
          color: #999;
        }

        .review-rating {
          display: flex;
          gap: 2px;
        }

        .star {
          font-size: 12px;
          opacity: 0.3;
        }

        .star.filled {
          opacity: 1;
        }

        .review-card h4 {
          margin: 0;
          font-size: 14px;
          color: #fff;
        }

        .review-text {
          margin: 0;
          font-size: 12px;
          color: #ccc;
          line-height: 1.5;
        }

        .review-footer {
          display: flex;
          gap: 12px;
        }

        .btn-helpful {
          padding: 6px 12px;
          background: #0d0d0d;
          border: 1px solid #333;
          color: #999;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-helpful:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        .sparkline {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 80px;
        }

        .bar {
          flex: 1;
          background: linear-gradient(180deg, #a855f7 0%, #7c3aed 100%);
          border-radius: 2px;
        }

        .engagement-chart {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100px;
        }

        .score-circle {
          font-size: 48px;
          font-weight: 700;
        }

        .rating-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .big-rating {
          font-size: 32px;
          font-weight: 700;
          color: #a855f7;
        }

        .stars {
          display: flex;
          gap: 4px;
        }

        .activity-label {
          margin: 4px 0;
          font-size: 12px;
          color: #ccc;
        }

        .empty {
          text-align: center;
          color: #666;
          font-size: 12px;
          padding: 20px;
        }

        @media (max-width: 768px) {
          .page-header {
            height: 150px;
          }

          .action-bar {
            flex-direction: column;
            align-items: flex-start;
          }

          .engagement-metrics {
            width: 100%;
            justify-content: space-around;
          }

          .campaign-stats-grid,
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};
