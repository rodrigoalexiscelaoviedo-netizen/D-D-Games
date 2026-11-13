// Loot and treasure management system

export type LootType = "coins" | "gems" | "magic-item" | "art-object" | "mundane";

export interface LootItem {
  id: string;
  name: string;
  type: LootType;
  rarity: "common" | "uncommon" | "rare" | "very-rare" | "legendary" | "artifact";
  value: number;
  weight: number;
  description: string;
  source: string;
  foundDate: Date;
  isMagical: boolean;
  requiresAttunement: boolean;
  curse?: string;
  history?: string;
}

export interface TreasureCache {
  id: string;
  campaignId: string;
  name: string;
  description: string;
  location: string;
  difficulty: "easy" | "medium" | "hard" | "deadly";
  items: LootItem[];
  goldAmount: number;
  createdAt: Date;
  isDiscovered: boolean;
}

export interface LootDistribution {
  recipientId: string;
  recipientName: string;
  items: LootItem[];
  goldAmount: number;
  totalValue: number;
}

export function createLootItem(
  name: string,
  type: LootType,
  value: number,
  source: string,
  rarity?: string
): LootItem {
  return {
    id: `loot_${Date.now()}`,
    name,
    type,
    rarity: (rarity as any) || "common",
    value,
    weight: type === "coins" ? value / 50 : 1,
    description: "",
    source,
    foundDate: new Date(),
    isMagical: type === "magic-item",
    requiresAttunement: type === "magic-item",
  };
}

export function createTreasureCache(
  campaignId: string,
  name: string,
  location: string,
  difficulty: TreasureCache["difficulty"]
): TreasureCache {
  return {
    id: `cache_${Date.now()}`,
    campaignId,
    name,
    description: "",
    location,
    difficulty,
    items: [],
    goldAmount: 0,
    createdAt: new Date(),
    isDiscovered: false,
  };
}

export function addItemToCache(
  cache: TreasureCache,
  item: LootItem
): TreasureCache {
  return {
    ...cache,
    items: [...cache.items, item],
  };
}

export function addGoldToCache(
  cache: TreasureCache,
  amount: number
): TreasureCache {
  return {
    ...cache,
    goldAmount: cache.goldAmount + amount,
  };
}

export function discoverCache(cache: TreasureCache): TreasureCache {
  return {
    ...cache,
    isDiscovered: true,
  };
}

export function getTotalCacheValue(cache: TreasureCache): number {
  const itemValue = cache.items.reduce((sum, item) => sum + item.value, 0);
  return itemValue + cache.goldAmount;
}

export function distributeLoot(
  items: LootItem[],
  gold: number,
  partyMembers: Array<{ userId: string; characterName: string }>
): LootDistribution[] {
  const distributions: LootDistribution[] = partyMembers.map((member) => ({
    recipientId: member.userId,
    recipientName: member.characterName,
    items: [],
    goldAmount: 0,
    totalValue: 0,
  }));

  const goldPerMember = Math.floor(gold / partyMembers.length);
  const remainingGold = gold % partyMembers.length;

  let itemIndex = 0;
  items.forEach((item) => {
    if (itemIndex < distributions.length) {
      distributions[itemIndex].items.push(item);
      distributions[itemIndex].totalValue += item.value;
      itemIndex = (itemIndex + 1) % distributions.length;
    }
  });

  distributions.forEach((dist, idx) => {
    dist.goldAmount = goldPerMember + (idx < remainingGold ? 1 : 0);
    dist.totalValue += dist.goldAmount;
  });

  return distributions;
}

export function generateTreasureByDifficulty(
  difficulty: TreasureCache["difficulty"]
): LootItem[] {
  const loot: LootItem[] = [];

  const rarityByDifficulty = {
    easy: ["common", "common", "uncommon"],
    medium: ["uncommon", "uncommon", "rare"],
    hard: ["rare", "rare", "very-rare"],
    deadly: ["very-rare", "legendary"],
  };

  const rarities = rarityByDifficulty[difficulty];
  rarities.forEach((rarity) => {
    loot.push(
      createLootItem(
        `Random ${rarity} item`,
        "magic-item",
        Math.floor(Math.random() * 1000) + 100,
        "Random Generation",
        rarity
      )
    );
  });

  return loot;
}

export function searchLoot(
  items: LootItem[],
  query: string
): LootItem[] {
  const lower = query.toLowerCase();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(lower) ||
      item.description.toLowerCase().includes(lower) ||
      item.type.includes(lower)
  );
}

export function sortLootByValue(items: LootItem[]): LootItem[] {
  return [...items].sort((a, b) => b.value - a.value);
}

export function sortLootByRarity(items: LootItem[]): LootItem[] {
  const rarityOrder = {
    artifact: 0,
    legendary: 1,
    "very-rare": 2,
    rare: 3,
    uncommon: 4,
    common: 5,
  };

  return [...items].sort(
    (a, b) =>
      (rarityOrder[a.rarity as keyof typeof rarityOrder] || 6) -
      (rarityOrder[b.rarity as keyof typeof rarityOrder] || 6)
  );
}

export function calculateLootWeight(items: LootItem[]): number {
  return items.reduce((sum, item) => sum + item.weight, 0);
}
