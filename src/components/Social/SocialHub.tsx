import { useState } from 'react';
import type { UserProfile } from '../../lib/social';
import { searchUsers, getRecommendedFriends } from '../../lib/social';

interface SocialHubProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  friends: string[];
  following: string[];
  followers: string[];
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onAddFriend?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
}

export const SocialHub = ({
  currentUser,
  allUsers,
  friends,
  following,
  followers,
  onFollow,
  onUnfollow,
  onAddFriend,
  onViewProfile,
}: SocialHubProps) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'following' | 'followers' | 'discover'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchUsers(allUsers, query, { excludeIds: [currentUser.id] });
      setFilteredUsers(results);
    } else {
      setFilteredUsers([]);
    }
  };

  const friendUsers = allUsers.filter((u) => friends.includes(u.id));
  const followingUsers = allUsers.filter((u) => following.includes(u.id));
  const followersUsers = allUsers.filter((u) => followers.includes(u.id));
  const recommendedUsers = getRecommendedFriends(allUsers, currentUser.id, [], [], 6);

  const getUserStatus = (userId: string) => {
    if (friends.includes(userId)) return 'friend';
    if (following.includes(userId)) return 'following';
    if (followers.includes(userId)) return 'follower';
    return 'none';
  };

  return (
    <div className="social-hub">
      {/* Header Stats */}
      <div className="hub-header">
        <h1>👥 Social Hub</h1>
        <div className="stats-row">
          <div className="stat">
            <span className="value">{friends.length}</span>
            <span className="label">Friends</span>
          </div>
          <div className="stat">
            <span className="value">{following.length}</span>
            <span className="label">Following</span>
          </div>
          <div className="stat">
            <span className="value">{followers.length}</span>
            <span className="label">Followers</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search players by username..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>

      {/* Search Results */}
      {searchQuery && filteredUsers.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          <div className="users-grid">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                status={getUserStatus(user.id)}
                onFollow={onFollow}
                onUnfollow={onUnfollow}
                onAddFriend={onAddFriend}
                onViewProfile={onViewProfile}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          👯 Friends ({friends.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          👁 Following ({following.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'followers' ? 'active' : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          🎯 Followers ({followers.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          ✨ Discover
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="users-section">
            {friendUsers.length === 0 ? (
              <div className="empty-state">
                <p className="emoji">👥</p>
                <p>No friends yet</p>
                <p className="subtitle">Add friends to see them here</p>
              </div>
            ) : (
              <div className="users-grid">
                {friendUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    status="friend"
                    onFollow={onFollow}
                    onUnfollow={onUnfollow}
                    onAddFriend={onAddFriend}
                    onViewProfile={onViewProfile}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Following Tab */}
        {activeTab === 'following' && (
          <div className="users-section">
            {followingUsers.length === 0 ? (
              <div className="empty-state">
                <p className="emoji">👁</p>
                <p>Not following anyone</p>
                <p className="subtitle">Follow players to stay updated</p>
              </div>
            ) : (
              <div className="users-grid">
                {followingUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    status="following"
                    onFollow={onFollow}
                    onUnfollow={onUnfollow}
                    onAddFriend={onAddFriend}
                    onViewProfile={onViewProfile}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Followers Tab */}
        {activeTab === 'followers' && (
          <div className="users-section">
            {followersUsers.length === 0 ? (
              <div className="empty-state">
                <p className="emoji">🎯</p>
                <p>No followers yet</p>
                <p className="subtitle">Your profile is waiting to be discovered</p>
              </div>
            ) : (
              <div className="users-grid">
                {followersUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    status="follower"
                    onFollow={onFollow}
                    onUnfollow={onUnfollow}
                    onAddFriend={onAddFriend}
                    onViewProfile={onViewProfile}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div className="users-section">
            <h3>Recommended Players</h3>
            <p className="section-subtitle">
              Players you might want to follow
            </p>
            <div className="users-grid">
              {recommendedUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  status={getUserStatus(user.id)}
                  isRecommended
                  onFollow={onFollow}
                  onUnfollow={onUnfollow}
                  onAddFriend={onAddFriend}
                  onViewProfile={onViewProfile}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .social-hub {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .hub-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .hub-header h1 {
          margin: 0;
          font-size: 28px;
          color: #fff;
        }

        .stats-row {
          display: flex;
          gap: 32px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .stat .value {
          font-size: 24px;
          font-weight: 700;
          color: #a855f7;
        }

        .stat .label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
        }

        .search-section {
          position: relative;
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

        .search-results {
          padding: 20px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .search-results h3 {
          margin: 0;
          font-size: 14px;
          color: #fff;
        }

        .tab-navigation {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid #333;
          padding-bottom: 12px;
        }

        .tab-btn {
          padding: 8px 16px;
          background: transparent;
          border: none;
          color: #999;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          color: #a855f7;
        }

        .tab-btn.active {
          color: #a855f7;
          border-bottom-color: #a855f7;
        }

        .tab-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .users-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .users-section h3 {
          margin: 0;
          font-size: 16px;
          color: #fff;
        }

        .section-subtitle {
          margin: 0;
          font-size: 12px;
          color: #999;
        }

        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .empty-state .emoji {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .empty-state p {
          margin: 0;
          font-size: 14px;
        }

        .empty-state .subtitle {
          font-size: 12px;
          color: #555;
          margin-top: 8px;
        }

        @media (max-width: 768px) {
          .hub-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .stats-row {
            width: 100%;
            justify-content: space-around;
          }

          .tab-navigation {
            flex-wrap: wrap;
          }

          .users-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

// User Card Component
interface UserCardProps {
  user: UserProfile;
  status: 'none' | 'friend' | 'following' | 'follower';
  isRecommended?: boolean;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onAddFriend?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
}

const UserCard = ({
  user,
  status,
  isRecommended,
  onFollow,
  onUnfollow,
  onAddFriend,
  onViewProfile,
}: UserCardProps) => {
  return (
    <div className="user-card">
      {isRecommended && <div className="recommended-badge">✨ Recommended</div>}
      <div className="user-avatar">{user.avatar || '👤'}</div>

      <div className="user-info">
        <h4>{user.username}</h4>
        <p className="level">Level {user.level}</p>
      </div>

      <div className="user-stats">
        <div className="stat-mini">
          <span className="icon">🏆</span>
          <span>{user.achievements}</span>
        </div>
        <div className="stat-mini">
          <span className="icon">🎮</span>
          <span>{user.campaigns}</span>
        </div>
      </div>

      {user.bio && <p className="user-bio">{user.bio}</p>}

      <div className="user-actions">
        {status === 'friend' ? (
          <button className="action-btn friend">✓ Friend</button>
        ) : (
          <button
            className="action-btn add-friend"
            onClick={() => onAddFriend?.(user.id)}
          >
            + Add Friend
          </button>
        )}

        {status === 'following' ? (
          <button
            className="action-btn unfollow"
            onClick={() => onUnfollow?.(user.id)}
          >
            ✓ Following
          </button>
        ) : (
          <button
            className="action-btn follow"
            onClick={() => onFollow?.(user.id)}
          >
            👁 Follow
          </button>
        )}

        <button
          className="action-btn view"
          onClick={() => onViewProfile?.(user.id)}
        >
          View Profile
        </button>
      </div>

      <style>{`
        .user-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.3s;
          position: relative;
        }

        .user-card:hover {
          border-color: #a855f7;
          transform: translateY(-4px);
        }

        .recommended-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
        }

        .user-avatar {
          width: 60px;
          height: 60px;
          background: #0d0d0d;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin: 0 auto;
        }

        .user-info {
          text-align: center;
        }

        .user-info h4 {
          margin: 0;
          font-size: 14px;
          color: #fff;
        }

        .level {
          margin: 0;
          font-size: 11px;
          color: #a855f7;
          font-weight: 600;
        }

        .user-stats {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .stat-mini {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #999;
        }

        .stat-mini .icon {
          font-size: 12px;
        }

        .user-bio {
          margin: 0;
          font-size: 11px;
          color: #999;
          text-align: center;
          line-height: 1.4;
        }

        .user-actions {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .action-btn {
          padding: 6px 8px;
          background: #0d0d0d;
          border: 1px solid #333;
          color: #999;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        .action-btn.friend,
        .action-btn.unfollow {
          background: #a855f7;
          border-color: #a855f7;
          color: #fff;
        }

        .action-btn.friend:hover,
        .action-btn.unfollow:hover {
          background: #9333ea;
        }
      `}</style>
    </div>
  );
};
