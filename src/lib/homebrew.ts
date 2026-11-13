// Homebrew rules and content management

export type ContentType = 'spell' | 'item' | 'class-feature' | 'race' | 'monster' | 'rule';

export interface HomebrewContent {
  id: string;
  type: ContentType;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  tags: string[];
  likes: number;
  downloads: number;
  rating: number;
  reviews: HomebrewReview[];
  sourceBook?: string;
}

export interface HomebrewSpell extends HomebrewContent {
  type: 'spell';
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string[];
  duration: string;
  damage: string;
  savingThrow?: string;
  concentrationRequired: boolean;
}

export interface HomebrewItem extends HomebrewContent {
  type: 'item';
  rarity: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary';
  itemType: string;
  weight: number;
  cost: string;
  requiresAttunement: boolean;
  magical: boolean;
}

export interface HomebrewMonster extends HomebrewContent {
  type: 'monster';
  challengeRating: number;
  hitPoints: number;
  armorClass: number;
  alignment: string;
  size: string;
  monsterType: string;
  speed: string;
}

export interface HomebrewReview {
  id: string;
  authorId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface HomebrewCollection {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  items: HomebrewContent[];
  isPublic: boolean;
  followers: number;
  createdAt: Date;
}

export function createHomebrewSpell(
  name: string,
  description: string,
  createdBy: string,
  level: number,
  school: string
): HomebrewSpell {
  return {
    id: `spell_${Date.now()}`,
    type: 'spell',
    name,
    description,
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublished: false,
    tags: [],
    likes: 0,
    downloads: 0,
    rating: 0,
    reviews: [],
    level,
    school,
    castingTime: '1 action',
    range: 'Self',
    components: ['V', 'S'],
    duration: 'Concentration, up to 1 minute',
    damage: '1d6',
    concentrationRequired: true,
  };
}

export function createHomebrewItem(
  name: string,
  description: string,
  createdBy: string,
  rarity: HomebrewItem['rarity']
): HomebrewItem {
  return {
    id: `item_${Date.now()}`,
    type: 'item',
    name,
    description,
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublished: false,
    tags: [],
    likes: 0,
    downloads: 0,
    rating: 0,
    reviews: [],
    rarity,
    itemType: 'Wondrous Item',
    weight: 0,
    cost: '0 gp',
    requiresAttunement: false,
    magical: true,
  };
}

export function createHomebrewMonster(
  name: string,
  description: string,
  createdBy: string,
  challengeRating: number
): HomebrewMonster {
  return {
    id: `monster_${Date.now()}`,
    type: 'monster',
    name,
    description,
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublished: false,
    tags: [],
    likes: 0,
    downloads: 0,
    rating: 0,
    reviews: [],
    challengeRating,
    hitPoints: 20 * challengeRating,
    armorClass: 10 + Math.floor(challengeRating / 2),
    alignment: 'Unaligned',
    size: 'Medium',
    monsterType: 'Humanoid',
    speed: '30 ft.',
  };
}

export function publishHomebrewContent(content: HomebrewContent): HomebrewContent {
  return {
    ...content,
    isPublished: true,
    updatedAt: new Date(),
  };
}

export function likeHomebrewContent(content: HomebrewContent): HomebrewContent {
  return {
    ...content,
    likes: content.likes + 1,
  };
}

export function addHomebrewReview(
  content: HomebrewContent,
  review: HomebrewReview
): HomebrewContent {
  const reviews = [...content.reviews, review];
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return {
    ...content,
    reviews,
    rating: Math.round(avgRating * 10) / 10,
  };
}

export function searchHomebrew(
  content: HomebrewContent[],
  query: string,
  filters?: {
    type?: ContentType;
    creator?: string;
    minRating?: number;
  }
): HomebrewContent[] {
  let results = content.filter((c) => c.isPublished);

  if (query.trim()) {
    const lower = query.toLowerCase();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.description.toLowerCase().includes(lower) ||
        c.tags.some((t) => t.toLowerCase().includes(lower))
    );
  }

  if (filters?.type) {
    results = results.filter((c) => c.type === filters.type);
  }

  if (filters?.creator) {
    results = results.filter((c) => c.createdBy === filters.creator);
  }

  if (filters?.minRating) {
    results = results.filter((c) => c.rating >= filters.minRating!);
  }

  return results.sort((a, b) => b.likes - a.likes);
}

export function getHomebrewStats(content: HomebrewContent[]) {
  return {
    totalItems: content.length,
    published: content.filter((c) => c.isPublished).length,
    totalLikes: content.reduce((sum, c) => sum + c.likes, 0),
    totalDownloads: content.reduce((sum, c) => sum + c.downloads, 0),
    averageRating:
      content.length > 0
        ? Math.round((content.reduce((sum, c) => sum + c.rating, 0) / content.length) * 10) / 10
        : 0,
  };
}

export function createHomebrewCollection(
  name: string,
  description: string,
  createdBy: string
): HomebrewCollection {
  return {
    id: `collection_${Date.now()}`,
    name,
    description,
    createdBy,
    items: [],
    isPublic: false,
    followers: 0,
    createdAt: new Date(),
  };
}

export function addToCollection(
  collection: HomebrewCollection,
  item: HomebrewContent
): HomebrewCollection {
  return {
    ...collection,
    items: [...collection.items, item],
  };
}

export function removeFromCollection(
  collection: HomebrewCollection,
  itemId: string
): HomebrewCollection {
  return {
    ...collection,
    items: collection.items.filter((i) => i.id !== itemId),
  };
}
