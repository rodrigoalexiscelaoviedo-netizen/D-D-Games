// Public campaign pages and sharing system

export interface PublicCampaignPage {
  id: string;
  campaignId: string;
  campaignName: string;
  description: string;
  slug: string; // URL-friendly identifier
  coverImage?: string;
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdDate: Date;
  updatedDate: Date;
  viewCount: number;
  followers: number;
  likes: number;
  averageRating: number;
  reviews: Review[];
  stats: {
    totalSessions: number;
    activePlayers: number;
    totalHours: number;
  };
}

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  createdDate: Date;
  likes: number;
  helpful: boolean;
}

export interface CampaignShowcase {
  featured: PublicCampaignPage[];
  trending: PublicCampaignPage[];
  newReleases: PublicCampaignPage[];
  highestRated: PublicCampaignPage[];
}

export interface ShareLink {
  id: string;
  campaignId: string;
  code: string;
  createdDate: Date;
  expiryDate?: Date;
  usageCount: number;
  maxUses?: number;
  isActive: boolean;
}

// Create public campaign page
export function createPublicCampaignPage(
  campaignId: string,
  campaignName: string,
  createdBy: string
): PublicCampaignPage {
  const slug = campaignName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');

  return {
    id: `public_${Date.now()}`,
    campaignId,
    campaignName,
    description: '',
    slug,
    tags: [],
    isPublic: false,
    createdBy,
    createdDate: new Date(),
    updatedDate: new Date(),
    viewCount: 0,
    followers: 0,
    likes: 0,
    averageRating: 0,
    reviews: [],
    stats: {
      totalSessions: 0,
      activePlayers: 0,
      totalHours: 0,
    },
  };
}

// Publish campaign
export function publishCampaign(page: PublicCampaignPage): PublicCampaignPage {
  return {
    ...page,
    isPublic: true,
    updatedDate: new Date(),
  };
}

// Unpublish campaign
export function unpublishCampaign(page: PublicCampaignPage): PublicCampaignPage {
  return {
    ...page,
    isPublic: false,
    updatedDate: new Date(),
  };
}

// Add review
export function addReview(
  page: PublicCampaignPage,
  review: Review
): PublicCampaignPage {
  const reviews = [...page.reviews, review];
  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return {
    ...page,
    reviews,
    averageRating: Math.round(avgRating * 10) / 10,
  };
}

// Record view
export function recordView(page: PublicCampaignPage): PublicCampaignPage {
  return {
    ...page,
    viewCount: page.viewCount + 1,
  };
}

// Add follower
export function addFollower(page: PublicCampaignPage): PublicCampaignPage {
  return {
    ...page,
    followers: page.followers + 1,
  };
}

// Remove follower
export function removeFollower(page: PublicCampaignPage): PublicCampaignPage {
  return {
    ...page,
    followers: Math.max(0, page.followers - 1),
  };
}

// Like campaign
export function likeCampaign(page: PublicCampaignPage): PublicCampaignPage {
  return {
    ...page,
    likes: page.likes + 1,
  };
}

// Unlike campaign
export function unlikeCampaign(page: PublicCampaignPage): PublicCampaignPage {
  return {
    ...page,
    likes: Math.max(0, page.likes - 1),
  };
}

// Create share link
export function createShareLink(
  campaignId: string,
  maxUses?: number
): ShareLink {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  return {
    id: `share_${Date.now()}`,
    campaignId,
    code,
    createdDate: new Date(),
    usageCount: 0,
    maxUses,
    isActive: true,
  };
}

// Validate share link
export function validateShareLink(link: ShareLink): boolean {
  if (!link.isActive) return false;
  if (link.expiryDate && link.expiryDate < new Date()) return false;
  if (link.maxUses && link.usageCount >= link.maxUses) return false;
  return true;
}

// Use share link
export function useShareLink(link: ShareLink): ShareLink {
  return {
    ...link,
    usageCount: link.usageCount + 1,
  };
}

// Search public campaigns
export function searchPublicCampaigns(
  campaigns: PublicCampaignPage[],
  query: string,
  filters?: {
    tag?: string;
    minRating?: number;
    sortBy?: 'newest' | 'trending' | 'topRated' | 'mostViewed';
  }
): PublicCampaignPage[] {
  let results = campaigns.filter((c) => c.isPublic);

  // Text search
  if (query.trim()) {
    const lower = query.toLowerCase();
    results = results.filter(
      (c) =>
        c.campaignName.toLowerCase().includes(lower) ||
        c.description.toLowerCase().includes(lower) ||
        c.tags.some((t) => t.toLowerCase().includes(lower))
    );
  }

  // Filter by tag
  if (filters?.tag) {
    results = results.filter((c) => c.tags.includes(filters.tag!));
  }

  // Filter by rating
  if (filters?.minRating) {
    results = results.filter((c) => c.averageRating >= filters.minRating!);
  }

  // Sort
  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case 'newest':
        results.sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
        break;
      case 'trending':
        results.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'topRated':
        results.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'mostViewed':
        results.sort((a, b) => b.viewCount - a.viewCount);
        break;
    }
  }

  return results;
}

// Generate showcase
export function generateShowcase(campaigns: PublicCampaignPage[]): CampaignShowcase {
  const public_ = campaigns.filter((c) => c.isPublic);

  return {
    featured: public_.slice(0, 3),
    trending: [...public_]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5),
    newReleases: [...public_]
      .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime())
      .slice(0, 5),
    highestRated: [...public_]
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5),
  };
}

// Export page as shareable JSON
export function exportCampaignPage(page: PublicCampaignPage): string {
  return JSON.stringify(page, null, 2);
}

// Get engagement metrics
export function getEngagementMetrics(page: PublicCampaignPage): {
  engagementScore: number;
  popularity: string;
  trend: 'rising' | 'stable' | 'declining';
} {
  const score = (page.viewCount + page.likes * 10 + page.followers * 5) / 100;

  let popularity: string;
  if (score > 1000) popularity = 'Legendary';
  else if (score > 500) popularity = 'Epic';
  else if (score > 200) popularity = 'Rare';
  else if (score > 50) popularity = 'Uncommon';
  else popularity = 'Common';

  // Simplified trend calculation
  const trend: 'rising' | 'stable' | 'declining' = score > 100 ? 'rising' : 'stable';

  return {
    engagementScore: Math.round(score),
    popularity,
    trend,
  };
}
