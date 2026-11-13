import { useState } from 'react';
import type { Notification, NotificationType, NotificationPriority } from '../../lib/notifications';
import {
  getUnreadNotifications,
  getNotificationStats,
  groupNotificationsByType,
  filterNotifications,
} from '../../lib/notifications';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (notificationId: string) => void;
  onDismiss?: (notificationId: string) => void;
  onAction?: (notification: Notification) => void;
}

export const NotificationCenter = ({
  notifications,
  onMarkAsRead,
  onDismiss,
  onAction,
}: NotificationCenterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'type'>('unread');
  const [selectedType, setSelectedType] = useState<NotificationType | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const stats = getNotificationStats(notifications);
  const unreadNotifs = getUnreadNotifications(notifications);
  const grouped = groupNotificationsByType(notifications);

  let displayNotifications = notifications;
  if (filter === 'unread') {
    displayNotifications = unreadNotifs;
  } else if (filter === 'type' && selectedType) {
    displayNotifications = filterNotifications(notifications, { type: selectedType });
  }

  const prioritizedNotifs = displayNotifications.sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    const priorityDiff =
      (priorityOrder[a.priority as NotificationPriority] || 2) -
      (priorityOrder[b.priority as NotificationPriority] || 2);
    if (priorityDiff !== 0) return priorityDiff;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  const handleMarkAsRead = (id: string) => {
    onMarkAsRead?.(id);
  };

  const handleDismiss = (id: string) => {
    onDismiss?.(id);
  };

  return (
    <div className="notification-center">
      {/* Bell Icon with Badge */}
      <div
        className="notification-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="bell-icon">🔔</span>
        {stats.unreadCount > 0 && (
          <span className="badge">{stats.unreadCount > 99 ? '99+' : stats.unreadCount}</span>
        )}
      </div>

      {/* Notification Panel */}
      {isOpen && (
        <div className="notification-panel">
          {/* Header */}
          <div className="panel-header">
            <h2>Notifications</h2>
            <div className="header-info">
              <span className="unread-count">
                {stats.unreadCount} unread
              </span>
            </div>
          </div>

          {/* Statistics Bar */}
          <div className="stats-bar">
            <div className="stat-item">
              <span className="value">{stats.totalNotifications}</span>
              <span className="label">Total</span>
            </div>
            <div className="stat-item">
              <span className="value">{stats.recentCount}</span>
              <span className="label">24h</span>
            </div>
            <div className="stat-item priority-urgent">
              <span className="value">{stats.byPriority.urgent}</span>
              <span className="label">Urgent</span>
            </div>
            <div className="stat-item priority-high">
              <span className="value">{stats.byPriority.high}</span>
              <span className="label">High</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => {
                setFilter('unread');
                setSelectedType(null);
              }}
            >
              Unread ({stats.unreadCount})
            </button>
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => {
                setFilter('all');
                setSelectedType(null);
              }}
            >
              All
            </button>
            <div className="type-filter">
              <select
                value={selectedType || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setFilter('type');
                    setSelectedType(e.target.value as NotificationType);
                  } else {
                    setFilter('all');
                    setSelectedType(null);
                  }
                }}
                className="type-select"
              >
                <option value="">By Type</option>
                {Array.from(grouped.keys()).map((type) => (
                  <option key={type} value={type}>
                    {type.replace('-', ' ')} ({grouped.get(type)?.length || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notifications List */}
          <div className="notifications-list">
            {prioritizedNotifs.length === 0 ? (
              <div className="empty-state">
                <p className="emoji">📭</p>
                <p>No notifications</p>
              </div>
            ) : (
              prioritizedNotifs.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${notif.read ? 'read' : 'unread'} priority-${notif.priority}`}
                  onClick={() => setExpandedId(expandedId === notif.id ? null : notif.id)}
                >
                  {/* Unread Indicator */}
                  {!notif.read && <div className="unread-dot" />}

                  {/* Icon */}
                  <div className="notif-icon" style={{ color: notif.color }}>
                    {notif.icon}
                  </div>

                  {/* Content */}
                  <div className="notif-content">
                    <p className="notif-title">{notif.title}</p>
                    <p className="notif-description">{notif.description}</p>
                    <p className="notif-time">
                      {getRelativeTime(notif.timestamp)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="notif-actions">
                    {!notif.read && (
                      <button
                        className="action-btn mark-read"
                        title="Mark as read"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notif.id);
                        }}
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="action-btn dismiss"
                      title="Dismiss"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(notif.id);
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {expandedId === notif.id && (
                    <div className="expanded-content">
                      <p className="full-description">{notif.description}</p>
                      {notif.actionUrl && notif.actionLabel && (
                        <button
                          className="action-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction?.(notif);
                          }}
                        >
                          {notif.actionLabel} →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="panel-footer">
            <button className="mark-all-read">Mark all as read</button>
            <button className="clear-all">Clear all</button>
          </div>
        </div>
      )}

      <style>{`
        .notification-center {
          position: relative;
        }

        .notification-trigger {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .notification-trigger:hover {
          background: #1a1a1a;
        }

        .bell-icon {
          font-size: 20px;
        }

        .badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #f87171;
          color: #fff;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(248, 113, 113, 0.3);
        }

        .notification-panel {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          width: 420px;
          max-height: 600px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          padding: 16px;
          border-bottom: 1px solid #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .panel-header h2 {
          margin: 0;
          font-size: 16px;
          color: #fff;
        }

        .header-info {
          font-size: 11px;
          color: #999;
        }

        .stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          padding: 12px;
          border-bottom: 1px solid #333;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px;
          background: #0d0d0d;
          border-radius: 4px;
        }

        .stat-item .value {
          font-size: 16px;
          font-weight: 700;
          color: #a855f7;
        }

        .stat-item .label {
          font-size: 9px;
          color: #999;
          text-transform: uppercase;
        }

        .stat-item.priority-urgent .value {
          color: #f87171;
        }

        .stat-item.priority-high .value {
          color: #fb923c;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-bottom: 1px solid #333;
        }

        .filter-btn {
          padding: 6px 12px;
          background: #0d0d0d;
          border: 1px solid #333;
          color: #999;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        .filter-btn.active {
          background: #a855f7;
          border-color: #a855f7;
          color: #fff;
        }

        .type-filter {
          flex: 1;
        }

        .type-select {
          width: 100%;
          padding: 6px;
          background: #0d0d0d;
          border: 1px solid #333;
          color: #999;
          border-radius: 4px;
          font-size: 11px;
        }

        .notifications-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .notification-item {
          padding: 12px;
          border-bottom: 1px solid #2a2a2a;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .notification-item:hover {
          background: #252525;
        }

        .notification-item.unread {
          background: rgba(168, 85, 247, 0.05);
        }

        .notification-item.priority-urgent {
          border-left: 3px solid #f87171;
        }

        .notification-item.priority-high {
          border-left: 3px solid #fb923c;
        }

        .notification-item.priority-normal {
          border-left: 3px solid #60a5fa;
        }

        .unread-dot {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background: #a855f7;
          border-radius: 50%;
        }

        .notif-icon {
          font-size: 20px;
          flex-shrink: 0;
          margin-left: 8px;
        }

        .notif-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .notif-title {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
        }

        .notif-description {
          margin: 0;
          font-size: 11px;
          color: #999;
          line-height: 1.4;
        }

        .notif-time {
          margin: 0;
          font-size: 9px;
          color: #666;
        }

        .notif-actions {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
        }

        .action-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0d0d0d;
          border: 1px solid #333;
          color: #999;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        .action-btn.mark-read:hover {
          border-color: #4ade80;
          color: #4ade80;
        }

        .expanded-content {
          grid-column: 1 / -1;
          padding-top: 8px;
          margin-top: 8px;
          border-top: 1px solid #2a2a2a;
        }

        .full-description {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #ccc;
          line-height: 1.5;
        }

        .action-link {
          padding: 6px 12px;
          background: #a855f7;
          border: none;
          color: #fff;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-link:hover {
          background: #9333ea;
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: #666;
        }

        .empty-state .emoji {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .empty-state p {
          margin: 0;
          font-size: 12px;
        }

        .panel-footer {
          padding: 12px;
          border-top: 1px solid #333;
          display: flex;
          gap: 8px;
        }

        .panel-footer button {
          flex: 1;
          padding: 8px;
          background: #0d0d0d;
          border: 1px solid #333;
          color: #999;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .panel-footer button:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        @media (max-width: 480px) {
          .notification-panel {
            width: 100vw;
            max-width: 420px;
            right: auto;
            left: 50%;
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

// Helper function to format time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}
