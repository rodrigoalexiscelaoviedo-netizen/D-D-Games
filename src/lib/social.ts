// Social features: following, friends, comments, messages

export interface UserProfile {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  level: number;
  joinDate: Date;
  followers: number;
  following: number;
  campaigns: number;
  achievements: number;
  isPublic: boolean;
}

export interface FollowRelationship {
  id: string;
  followerId: string;
  followingId: string;
  createdDate: Date;
}

export interface FriendshipRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdDate: Date;
  respondedDate?: Date;
}

export interface Friendship {
  id: string;
  userId1: string;
  userId2: string;
  createdDate: Date;
  isBestFriend: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  relatedId: string; // ID of campaign, post, etc.
  relationType: 'campaign' | 'post' | 'review' | 'quest';
  text: string;
  createdDate: Date;
  updatedDate?: Date;
  likes: number;
  replies: Comment[];
  isEdited: boolean;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  createdDate: Date;
  readDate?: Date;
  isRead: boolean;
}

export interface UserRelationshipStats {
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  pendingRequests: number;
  blockedUsers: number;
  commentsReceived: number;
  messagesReceived: number;
}

// Create user profile
export function createUserProfile(id: string, username: string): UserProfile {
  return {
    id,
    username,
    level: 1,
    joinDate: new Date(),
    followers: 0,
    following: 0,
    campaigns: 0,
    achievements: 0,
    isPublic: true,
  };
}

// Follow user
export function createFollowRelationship(
  followerId: string,
  followingId: string
): FollowRelationship {
  return {
    id: `follow_${Date.now()}`,
    followerId,
    followingId,
    createdDate: new Date(),
  };
}

// Unfollow user
export function removeFollowRelationship(
  relationships: FollowRelationship[],
  followerId: string,
  followingId: string
): FollowRelationship[] {
  return relationships.filter(
    (r) => !(r.followerId === followerId && r.followingId === followingId)
  );
}

// Check if user follows another
export function isFollowing(
  relationships: FollowRelationship[],
  followerId: string,
  followingId: string
): boolean {
  return relationships.some(
    (r) => r.followerId === followerId && r.followingId === followingId
  );
}

// Send friend request
export function sendFriendRequest(fromUserId: string, toUserId: string): FriendshipRequest {
  return {
    id: `freq_${Date.now()}`,
    fromUserId,
    toUserId,
    status: 'pending',
    createdDate: new Date(),
  };
}

// Accept friend request
export function acceptFriendRequest(request: FriendshipRequest): FriendshipRequest {
  return {
    ...request,
    status: 'accepted',
    respondedDate: new Date(),
  };
}

// Reject friend request
export function rejectFriendRequest(request: FriendshipRequest): FriendshipRequest {
  return {
    ...request,
    status: 'rejected',
    respondedDate: new Date(),
  };
}

// Create friendship
export function createFriendship(
  userId1: string,
  userId2: string,
  isBestFriend: boolean = false
): Friendship {
  const [id1, id2] = [userId1, userId2].sort();
  return {
    id: `friend_${id1}_${id2}`,
    userId1: id1,
    userId2: id2,
    createdDate: new Date(),
    isBestFriend,
  };
}

// Toggle best friend status
export function toggleBestFriend(friendship: Friendship): Friendship {
  return {
    ...friendship,
    isBestFriend: !friendship.isBestFriend,
  };
}

// Check if users are friends
export function areFriends(friendships: Friendship[], userId1: string, userId2: string): boolean {
  const [id1, id2] = [userId1, userId2].sort();
  return friendships.some((f) => f.userId1 === id1 && f.userId2 === id2);
}

// Remove friendship
export function removeFriendship(
  friendships: Friendship[],
  userId1: string,
  userId2: string
): Friendship[] {
  const [id1, id2] = [userId1, userId2].sort();
  return friendships.filter((f) => !(f.userId1 === id1 && f.userId2 === id2));
}

// Create comment
export function createComment(
  authorId: string,
  authorName: string,
  relatedId: string,
  relationType: Comment['relationType'],
  text: string
): Comment {
  return {
    id: `comment_${Date.now()}`,
    authorId,
    authorName,
    relatedId,
    relationType,
    text,
    createdDate: new Date(),
    likes: 0,
    replies: [],
    isEdited: false,
  };
}

// Edit comment
export function editComment(comment: Comment, newText: string): Comment {
  return {
    ...comment,
    text: newText,
    updatedDate: new Date(),
    isEdited: true,
  };
}

// Like comment
export function likeComment(comment: Comment): Comment {
  return {
    ...comment,
    likes: comment.likes + 1,
  };
}

// Unlike comment
export function unlikeComment(comment: Comment): Comment {
  return {
    ...comment,
    likes: Math.max(0, comment.likes - 1),
  };
}

// Reply to comment
export function replyToComment(
  parentComment: Comment,
  reply: Comment
): Comment {
  return {
    ...parentComment,
    replies: [...parentComment.replies, reply],
  };
}

// Create direct message
export function createDirectMessage(
  senderId: string,
  recipientId: string,
  text: string
): DirectMessage {
  return {
    id: `dm_${Date.now()}`,
    senderId,
    recipientId,
    text,
    createdDate: new Date(),
    isRead: false,
  };
}

// Mark message as read
export function markMessageAsRead(message: DirectMessage): DirectMessage {
  return {
    ...message,
    readDate: new Date(),
    isRead: true,
  };
}

// Get conversation between two users
export function getConversation(
  messages: DirectMessage[],
  userId1: string,
  userId2: string
): DirectMessage[] {
  return messages.filter(
    (m) =>
      (m.senderId === userId1 && m.recipientId === userId2) ||
      (m.senderId === userId2 && m.recipientId === userId1)
  ).sort((a, b) => a.createdDate.getTime() - b.createdDate.getTime());
}

// Get unread messages for user
export function getUnreadMessages(
  messages: DirectMessage[],
  userId: string
): DirectMessage[] {
  return messages.filter((m) => m.recipientId === userId && !m.isRead);
}

// Calculate user relationship stats
export function calculateRelationshipStats(
  follows: FollowRelationship[],
  friendships: Friendship[],
  userId: string,
  pendingRequests: FriendshipRequest[],
  comments: Comment[]
): UserRelationshipStats {
  const followers = follows.filter((f) => f.followingId === userId).length;
  const following = follows.filter((f) => f.followerId === userId).length;
  const friends = friendships.filter(
    (f) => f.userId1 === userId || f.userId2 === userId
  ).length;
  const pending = pendingRequests.filter(
    (r) => r.toUserId === userId && r.status === 'pending'
  ).length;
  const userComments = comments.filter((c) => c.authorId === userId).length;

  return {
    followersCount: followers,
    followingCount: following,
    friendsCount: friends,
    pendingRequests: pending,
    blockedUsers: 0,
    commentsReceived: userComments,
    messagesReceived: 0,
  };
}

// Get user's followers
export function getUserFollowers(
  follows: FollowRelationship[],
  userId: string
): string[] {
  return follows
    .filter((f) => f.followingId === userId)
    .map((f) => f.followerId);
}

// Get users this user is following
export function getUserFollowing(
  follows: FollowRelationship[],
  userId: string
): string[] {
  return follows
    .filter((f) => f.followerId === userId)
    .map((f) => f.followingId);
}

// Get user's friends
export function getUserFriends(friendships: Friendship[], userId: string): string[] {
  return friendships
    .filter((f) => f.userId1 === userId || f.userId2 === userId)
    .map((f) => (f.userId1 === userId ? f.userId2 : f.userId1));
}

// Get comments for an entity
export function getCommentsForEntity(
  comments: Comment[],
  relatedId: string
): Comment[] {
  return comments.filter((c) => c.relatedId === relatedId);
}

// Search users
export function searchUsers(
  users: UserProfile[],
  query: string,
  options?: {
    excludeIds?: string[];
    minLevel?: number;
  }
): UserProfile[] {
  const lower = query.toLowerCase();
  let results = users.filter(
    (u) => u.isPublic && u.username.toLowerCase().includes(lower)
  );

  if (options?.excludeIds) {
    results = results.filter((u) => !options.excludeIds!.includes(u.id));
  }

  if (options?.minLevel) {
    results = results.filter((u) => u.level >= options.minLevel!);
  }

  return results;
}

// Get recommended friends
export function getRecommendedFriends(
  allUsers: UserProfile[],
  userId: string,
  friendships: Friendship[],
  follows: FollowRelationship[],
  limit: number = 5
): UserProfile[] {
  const userFriends = getUserFriends(friendships, userId);
  const userFollowing = getUserFollowing(follows, userId);

  return allUsers
    .filter(
      (u) =>
        u.id !== userId &&
        !userFriends.includes(u.id) &&
        !userFollowing.includes(u.id) &&
        u.isPublic
    )
    .sort((a, b) => b.followers - a.followers)
    .slice(0, limit);
}

// Export social data as JSON
export function exportSocialData(
  follows: FollowRelationship[],
  friendships: Friendship[],
  comments: Comment[]
): string {
  return JSON.stringify(
    {
      follows,
      friendships,
      comments,
    },
    null,
    2
  );
}
