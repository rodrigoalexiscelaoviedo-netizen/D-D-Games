import { useState } from 'react';
import type { PublicCampaignPage } from '../../lib/public-campaigns';
import { searchPublicCampaigns, generateShowcase } from '../../lib/public-campaigns';

interface CampaignExplorerProps {
  campaigns: PublicCampaignPage[];
  onSelectCampaign?: (campaign: PublicCampaignPage) => void;
}

export const CampaignExplorer = ({
  campaigns,
  onSelectCampaign,
}: CampaignExplorerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<'newest' | 'trending' | 'topRated' | 'mostViewed'>('trending');
  const [view, setView] = useState<'grid' | 'showcase'>('showcase');

  const showcase = generateShowcase(campaigns);

  const searchResults = searchPublicCampaigns(campaigns, searchQuery, {
    tag: selectedTag || undefined,
    minRating: minRating > 0 ? minRating : undefined,
    sortBy,
  });

  // Get all unique tags
  const allTags = Array.from(
    new Set(campaigns.flatMap((c) => c.tags))
  ).sort();

  const displayCampaigns = searchQuery || selectedTag || minRating > 0 ? searchResults : campaigns;

  return (
    <div className="campaign-explorer">
      {/* Header */}
      <div className="explorer-header">
        <h1>📚 Campaign Explorer</h1>
        <p>Discover epic campaigns from the community</p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search campaigns, tags, creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Tags</label>
          <div className="tag-filters">
            <button
              className={`tag-btn ${selectedTag === null ? 'active' : ''}`}
              onClick={() => setSelectedTag(null)}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`tag-btn ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => setSelectedTag(tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Minimum Rating</label>
          <div className="rating-filter">
            {[0, 1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                className={`rating-btn ${minRating === rating ? 'active' : ''}`}
                onClick={() => setMinRating(rating)}
              >
                {rating === 0 ? 'Any' : `${rating}★+`}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="sort-select"
          >
            <option value="newest">Newest</option>
            <option value="trending">Trending</option>
            <option value="topRated">Top Rated</option>
            <option value="mostViewed">Most Viewed</option>
          </select>
        </div>

        <div className="filter-group">
          <label>View</label>
          <div className="view-toggle">
            <button
              className={`view-btn ${view === 'showcase' ? 'active' : ''}`}
              onClick={() => setView('showcase')}
            >
              Showcase
            </button>
            <button
              className={`view-btn ${view === 'grid' ? 'active' : ''}`}
              onClick={() => setView('grid')}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Showcase View */}
      {view === 'showcase' && !searchQuery && selectedTag === null && minRating === 0 && (
        <div className="showcase-view">
          {/* Featured Section */}
          <section className="showcase-section">
            <h2>✨ Featured Campaigns</h2>
            <div className="featured-grid">
              {showcase.featured.map((campaign) => (
                <div
                  key={campaign.id}
                  className="featured-card"
                  onClick={() => onSelectCampaign?.(campaign)}
                >
                  {campaign.coverImage && (
                    <img src={campaign.coverImage} alt={campaign.campaignName} />
                  )}
                  <div className="card-overlay">
                    <h3>{campaign.campaignName}</h3>
                    <p className="creator">{campaign.createdBy}</p>
                    <div className="campaign-meta">
                      <span className="rating">⭐ {campaign.averageRating}</span>
                      <span className="views">👁 {campaign.viewCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Trending Section */}
          <section className="showcase-section">
            <h2>🔥 Trending Now</h2>
            <div className="campaign-list">
              {showcase.trending.slice(0, 5).map((campaign, idx) => (
                <div
                  key={campaign.id}
                  className="campaign-row"
                  onClick={() => onSelectCampaign?.(campaign)}
                >
                  <span className="rank">#{idx + 1}</span>
                  <div className="campaign-info">
                    <p className="name">{campaign.campaignName}</p>
                    <p className="creator">{campaign.createdBy}</p>
                  </div>
                  <div className="campaign-stats">
                    <span className="stat">👁 {campaign.viewCount}</span>
                    <span className="stat">❤️ {campaign.likes}</span>
                    <span className="stat">⭐ {campaign.averageRating}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* New Releases Section */}
          <section className="showcase-section">
            <h2>📅 New Releases</h2>
            <div className="campaign-list">
              {showcase.newReleases.slice(0, 5).map((campaign) => (
                <div
                  key={campaign.id}
                  className="campaign-row"
                  onClick={() => onSelectCampaign?.(campaign)}
                >
                  <span className="date">{campaign.createdDate.toLocaleDateString()}</span>
                  <div className="campaign-info">
                    <p className="name">{campaign.campaignName}</p>
                    <p className="creator">{campaign.createdBy}</p>
                  </div>
                  <span className="tag">{campaign.tags[0] || 'General'}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Top Rated Section */}
          <section className="showcase-section">
            <h2>⭐ Top Rated</h2>
            <div className="campaign-list">
              {showcase.highestRated.slice(0, 5).map((campaign) => (
                <div
                  key={campaign.id}
                  className="campaign-row"
                  onClick={() => onSelectCampaign?.(campaign)}
                >
                  <div className="rating-display">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < Math.floor(campaign.averageRating) ? 'star filled' : 'star'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <div className="campaign-info">
                    <p className="name">{campaign.campaignName}</p>
                    <p className="creator">{campaign.createdBy}</p>
                  </div>
                  <span className="review-count">{campaign.reviews.length} reviews</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Grid View */}
      {view === 'grid' || searchQuery || selectedTag || minRating > 0 ? (
        <div className="grid-view">
          {displayCampaigns.length === 0 ? (
            <div className="no-results">
              <p>🔍 No campaigns found</p>
              <p className="subtitle">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="campaign-grid">
              {displayCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="grid-card"
                  onClick={() => onSelectCampaign?.(campaign)}
                >
                  {campaign.coverImage && (
                    <img src={campaign.coverImage} alt={campaign.campaignName} />
                  )}
                  <div className="card-content">
                    <h3>{campaign.campaignName}</h3>
                    <p className="creator">{campaign.createdBy}</p>

                    <div className="card-tags">
                      {campaign.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="tag-mini">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="card-stats">
                      <div className="stat-item">
                        <span className="icon">⭐</span>
                        <span className="text">{campaign.averageRating}</span>
                      </div>
                      <div className="stat-item">
                        <span className="icon">👥</span>
                        <span className="text">{campaign.followers}</span>
                      </div>
                      <div className="stat-item">
                        <span className="icon">👁</span>
                        <span className="text">{campaign.viewCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <style>{`
        .campaign-explorer {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 24px;
        }

        .explorer-header {
          margin-bottom: 12px;
        }

        .explorer-header h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          color: #fff;
        }

        .explorer-header p {
          margin: 0;
          color: #999;
          font-size: 14px;
        }

        .search-section {
          display: flex;
          gap: 12px;
        }

        .search-box {
          position: relative;
          flex: 1;
        }

        .search-input {
          width: 100%;
          padding: 12px 40px 12px 16px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
        }

        .search-input::placeholder {
          color: #666;
        }

        .search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
        }

        .filters-section {
          display: flex;
          gap: 24px;
          padding-bottom: 12px;
          border-bottom: 1px solid #333;
          overflow-x: auto;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: max-content;
        }

        .filter-group label {
          font-size: 10px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        .tag-filters {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .tag-btn,
        .rating-btn,
        .view-btn {
          padding: 6px 12px;
          background: #1a1a1a;
          border: 1px solid #333;
          color: #999;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .tag-btn:hover,
        .rating-btn:hover,
        .view-btn:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        .tag-btn.active,
        .rating-btn.active,
        .view-btn.active {
          background: #a855f7;
          border-color: #a855f7;
          color: #fff;
        }

        .rating-filter {
          display: flex;
          gap: 6px;
        }

        .sort-select {
          padding: 6px 12px;
          background: #1a1a1a;
          border: 1px solid #333;
          color: #999;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        }

        .view-toggle {
          display: flex;
          gap: 4px;
        }

        .showcase-view {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .showcase-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .showcase-section h2 {
          margin: 0;
          font-size: 18px;
          color: #fff;
          font-weight: 600;
        }

        .featured-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
        }

        .featured-card {
          position: relative;
          height: 300px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 1px solid #333;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
        }

        .featured-card:hover {
          border-color: #a855f7;
          transform: translateY(-4px);
        }

        .featured-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.6;
        }

        .featured-card .card-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.9) 100%);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .featured-card h3 {
          margin: 0;
          font-size: 16px;
          color: #fff;
        }

        .featured-card .creator {
          margin: 0;
          font-size: 12px;
          color: #999;
        }

        .campaign-meta {
          display: flex;
          gap: 12px;
          font-size: 11px;
          color: #ccc;
        }

        .campaign-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .campaign-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .campaign-row:hover {
          border-color: #a855f7;
          background: #252525;
        }

        .rank {
          font-weight: 700;
          color: #a855f7;
          min-width: 30px;
        }

        .date {
          font-size: 11px;
          color: #999;
          min-width: 80px;
        }

        .campaign-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .campaign-info .name {
          margin: 0;
          font-size: 14px;
          color: #fff;
          font-weight: 600;
        }

        .campaign-info .creator {
          margin: 0;
          font-size: 11px;
          color: #999;
        }

        .campaign-stats {
          display: flex;
          gap: 12px;
        }

        .stat {
          font-size: 11px;
          color: #ccc;
          white-space: nowrap;
        }

        .tag {
          padding: 2px 8px;
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 3px;
          font-size: 10px;
          color: #a855f7;
        }

        .rating-display {
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

        .review-count {
          font-size: 11px;
          color: #999;
          white-space: nowrap;
        }

        .grid-view {
          display: flex;
          flex-direction: column;
        }

        .campaign-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }

        .grid-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
        }

        .grid-card:hover {
          border-color: #a855f7;
          transform: translateY(-4px);
        }

        .grid-card img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          opacity: 0.7;
        }

        .card-content {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .grid-card h3 {
          margin: 0;
          font-size: 14px;
          color: #fff;
        }

        .grid-card .creator {
          margin: 0;
          font-size: 11px;
          color: #999;
        }

        .card-tags {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .tag-mini {
          padding: 2px 6px;
          background: #0d0d0d;
          border-radius: 2px;
          font-size: 9px;
          color: #a855f7;
        }

        .card-stats {
          display: flex;
          gap: 12px;
          justify-content: space-around;
          padding-top: 8px;
          border-top: 1px solid #333;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .stat-item .icon {
          font-size: 12px;
        }

        .stat-item .text {
          font-size: 10px;
          color: #999;
        }

        .no-results {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .no-results p {
          margin: 0;
          font-size: 14px;
        }

        .no-results .subtitle {
          font-size: 12px;
          color: #555;
        }

        @media (max-width: 768px) {
          .filters-section {
            flex-direction: column;
          }

          .featured-grid {
            grid-template-columns: 1fr;
          }

          .campaign-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }

          .campaign-row {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};
