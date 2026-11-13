// Real-time notification system

export type NotificationType =
  | 'session-started'
  | 'session-ended'
  | 'combat-started'
  | 'combat-ended'
  | 'achievement-unlocked'
  | 'level-up'
  | 'loot-found'
  | 'player-joined'
  | 'player-left'
  | 'message'
  | 'system'
  | 'invite'
  | 'friend-request'
  | 'milestone';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  description: string;
  icon: string;
  color: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  relatedId?: string; // ID of related entity (campaign, combat, etc.)
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  userId: string;
  sessionStarted: boolean;
  sessionEnded: boolean;
  combatStarted: boolean;
  combatEnded: boolean;
  achievementUnlocked: boolean;
  levelUp: boolean;
  lootFound: boolean;
  playerJoined: boolean;
  playerLeft: boolean;
  messages: boolean;
  systemNotifications: boolean;
  invites: boolean;
  friendRequests: boolean;
  milestones: boolean;
  soundEnabled: boolean;
  desktopEnabled: boolean;
  emailEnabled: boolean;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadCount: number;
  readCount: number;
  recentCount: number; // Last 24 hours
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

// Create notification
export function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  description: string,
  options?: {
    priority?: NotificationPriority;
    icon?: string;
    color?: string;
    actionUrl?: string;
    actionLabel?: string;
    relatedId?: string;
    metadata?: Record<string, any>;
  }
): Notification {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    priority: options?.priority || 'normal',
    title,
    description,
    icon: options?.icon || getDefaultIcon(type),
    color: options?.color || getDefaultColor(type),
    timestamp: new Date(),
    read: false,
    actionUrl: options?.actionUrl,
    actionLabel: options?.actionLabel,
    relatedId: options?.relatedId,
    metadata: options?.metadata,
  };
}

// Get default icon by type
export function getDefaultIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    'session-started': '🎮',
    'session-ended': '🛑',
    'combat-started': '⚔️',
    'combat-ended': '✅',
    'achievement-unlocked': '🏆',
    'level-up': '📈',
    'loot-found': '💰',
    'player-joined': '👋',
    'player-left': '👣',
    'message': '💬',
    'system': '⚙️',
    'invite': '📧',
    'friend-request': '👥',
    'milestone': '🎉',
  };
  return icons[type] || '📬';
}

// Get default color by type
export function getDefaultColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    'session-started': '#4ade80',
    'session-ended': '#f87171',
    'combat-started': '#fb923c',
    'combat-ended': '#60a5fa',
    'achievement-unlocked': '#fbbf24',
    'level-up': '#a855f7',
    'loot-found': '#ec4899',
    'player-joined': '#4ade80',
    'player-left': '#999',
    'message': '#60a5fa',
    'system': '#999',
    'invite': '#a855f7',
    'friend-request': '#ec4899',
    'milestone': '#fbbf24',
  };
  return colors[type] || '#999';
}

// Mark as read
export function markAsRead(notification: Notification): Notification {
  return {
    ...notification,
    read: true,
  };
}

// Mark as unread
export function markAsUnread(notification: Notification): Notification {
  return {
    ...notification,
    read: false,
  };
}

// Dismiss notification (archive)
export function dismissNotification(notification: Notification): Notification {
  return markAsRead(notification);
}

// Create default preferences
export function createDefaultPreferences(userId: string): NotificationPreferences {
  return {
    userId,
    sessionStarted: true,
    sessionEnded: true,
    combatStarted: true,
    combatEnded: true,
    achievementUnlocked: true,
    levelUp: true,
    lootFound: true,
    playerJoined: true,
    playerLeft: false,
    messages: true,
    systemNotifications: true,
    invites: true,
    friendRequests: true,
    milestones: true,
    soundEnabled: true,
    desktopEnabled: true,
    emailEnabled: false,
  };
}

// Update preferences
export function updatePreferences(
  prefs: NotificationPreferences,
  updates: Partial<NotificationPreferences>
): NotificationPreferences {
  return {
    ...prefs,
    ...updates,
  };
}

// Filter notifications
export function filterNotifications(
  notifications: Notification[],
  filter?: {
    read?: boolean;
    type?: NotificationType;
    priority?: NotificationPriority;
    daysAgo?: number;
  }
): Notification[] {
  let results = [...notifications];

  if (filter?.read !== undefined) {
    results = results.filter((n) => n.read === filter.read);
  }

  if (filter?.type) {
    results = results.filter((n) => n.type === filter.type);
  }

  if (filter?.priority) {
    results = results.filter((n) => n.priority === filter.priority);
  }

  if (filter?.daysAgo !== undefined) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - filter.daysAgo);
    results = results.filter((n) => n.timestamp >= cutoff);
  }

  return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Get unread notifications
export function getUnreadNotifications(notifications: Notification[]): Notification[] {
  return notifications.filter((n) => !n.read).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Get notification stats
export function getNotificationStats(notifications: Notification[]): NotificationStats {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const byType: Record<NotificationType, number> = {
    'session-started': 0,
    'session-ended': 0,
    'combat-started': 0,
    'combat-ended': 0,
    'achievement-unlocked': 0,
    'level-up': 0,
    'loot-found': 0,
    'player-joined': 0,
    'player-left': 0,
    'message': 0,
    'system': 0,
    'invite': 0,
    'friend-request': 0,
    'milestone': 0,
  };

  const byPriority: Record<NotificationPriority, number> = {
    'low': 0,
    'normal': 0,
    'high': 0,
    'urgent': 0,
  };

  let recentCount = 0;
  let unreadCount = 0;

  for (const notif of notifications) {
    byType[notif.type]++;
    byPriority[notif.priority]++;

    if (notif.timestamp >= oneDayAgo) {
      recentCount++;
    }

    if (!notif.read) {
      unreadCount++;
    }
  }

  return {
    totalNotifications: notifications.length,
    unreadCount,
    readCount: notifications.length - unreadCount,
    recentCount,
    byType,
    byPriority,
  };
}

// Batch create notifications
export function batchCreateNotifications(
  userIds: string[],
  type: NotificationType,
  title: string,
  description: string,
  options?: {
    priority?: NotificationPriority;
    icon?: string;
    color?: string;
    actionUrl?: string;
    actionLabel?: string;
    relatedId?: string;
    metadata?: Record<string, any>;
  }
): Notification[] {
  return userIds.map((userId) =>
    createNotification(userId, type, title, description, options)
  );
}

// Prioritize notifications
export function prioritizeNotifications(notifications: Notification[]): Notification[] {
  const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
  return [...notifications].sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
}

// Clear old notifications
export function clearOldNotifications(
  notifications: Notification[],
  daysOld: number = 30
): Notification[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);
  return notifications.filter((n) => n.timestamp >= cutoff);
}

// Export notifications as JSON
export function exportNotifications(notifications: Notification[]): string {
  return JSON.stringify(notifications, null, 2);
}

// Group notifications by type
export function groupNotificationsByType(
  notifications: Notification[]
): Map<NotificationType, Notification[]> {
  const grouped = new Map<NotificationType, Notification[]>();

  for (const notif of notifications) {
    if (!grouped.has(notif.type)) {
      grouped.set(notif.type, []);
    }
    grouped.get(notif.type)!.push(notif);
  }

  return grouped;
}

// Get summary by priority
export function getNotificationSummary(
  notifications: Notification[]
): Record<NotificationPriority, Notification[]> {
  return {
    urgent: notifications.filter((n) => n.priority === 'urgent'),
    high: notifications.filter((n) => n.priority === 'high'),
    normal: notifications.filter((n) => n.priority === 'normal'),
    low: notifications.filter((n) => n.priority === 'low'),
  };
}
