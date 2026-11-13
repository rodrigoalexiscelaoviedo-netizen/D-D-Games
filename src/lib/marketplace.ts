// Marketplace and item trading system

export type ItemRarity = 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary' | 'Artifact';
export type ItemCategory = 'weapon' | 'armor' | 'potion' | 'scroll' | 'wondrous' | 'tool' | 'mount' | 'spell';

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  price: number; // in gold pieces
  sellPrice: number; // what vendor will pay
  quantity?: number;
  weight?: number;
  requiresAttunement?: boolean;
  seller?: string;
  image?: string;
  enchantment?: string;
}

export interface MarketplaceListing {
  id: string;
  item: MarketplaceItem;
  seller: {
    id: string;
    name: string;
    rating: number; // 1-5 stars
  };
  listedDate: Date;
  expiryDate?: Date;
  quantity: number;
}

export interface Transaction {
  id: string;
  buyer: string;
  seller: string;
  item: MarketplaceItem;
  quantity: number;
  totalPrice: number;
  date: Date;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface Vendor {
  id: string;
  name: string;
  inventory: MarketplaceItem[];
  rating: number;
  totalSales: number;
  location: string;
  specialties: ItemCategory[];
}

// Base item prices for D&D 5e
export const BASE_PRICES: Record<string, number> = {
  'shortsword': 10,
  'longsword': 15,
  'greataxe': 30,
  'longbow': 50,
  'dagger': 2,
  'leather armor': 5,
  'chain mail': 75,
  'plate armor': 1500,
  'ring of protection': 500,
  'cloak of invisibility': 3000,
  'potion of healing': 50,
  'scroll of protection': 25,
  'identify scroll': 100,
};

// Rarity price multipliers
export const RARITY_MULTIPLIERS: Record<ItemRarity, number> = {
  'Common': 1,
  'Uncommon': 5,
  'Rare': 25,
  'Very Rare': 100,
  'Legendary': 500,
  'Artifact': 10000,
};

// Create marketplace item
export function createMarketplaceItem(
  name: string,
  category: ItemCategory,
  rarity: ItemRarity = 'Common',
  basePrice: number = 10
): MarketplaceItem {
  const price = Math.floor(basePrice * RARITY_MULTIPLIERS[rarity]);

  return {
    id: `item_${Date.now()}`,
    name,
    description: `A ${rarity.toLowerCase()} ${category}`,
    category,
    rarity,
    price,
    sellPrice: Math.floor(price * 0.6), // Vendor buys at 60% of price
    quantity: 1,
    weight: 1,
  };
}

// Calculate enchantment price modifier
export function getEnchantmentMultiplier(enchantment: string): number {
  const multipliers: Record<string, number> = {
    '+1': 1.5,
    '+2': 3,
    '+3': 5,
    'flaming': 2,
    'frost': 2,
    'cursed': 0.25,
    'sentient': 4,
  };

  return multipliers[enchantment] || 1;
}

// Create vendor
export function createVendor(name: string, location: string, specialties: ItemCategory[] = []): Vendor {
  return {
    id: `vendor_${Date.now()}`,
    name,
    inventory: [],
    rating: 5,
    totalSales: 0,
    location,
    specialties,
  };
}

// Add item to vendor inventory
export function addToVendorInventory(vendor: Vendor, item: MarketplaceItem, quantity: number = 1): Vendor {
  const existingItem = vendor.inventory.find((i) => i.id === item.id);

  if (existingItem && existingItem.quantity) {
    existingItem.quantity += quantity;
  } else {
    vendor.inventory.push({ ...item, quantity });
  }

  return vendor;
}

// Remove item from vendor inventory
export function removeFromVendorInventory(vendor: Vendor, itemId: string, quantity: number = 1): Vendor {
  const item = vendor.inventory.find((i) => i.id === itemId);

  if (!item) return vendor;

  if (item.quantity && item.quantity > quantity) {
    item.quantity -= quantity;
  } else {
    vendor.inventory = vendor.inventory.filter((i) => i.id !== itemId);
  }

  return vendor;
}

// Create transaction
export function createTransaction(
  buyer: string,
  seller: string,
  item: MarketplaceItem,
  quantity: number
): Transaction {
  return {
    id: `tx_${Date.now()}`,
    buyer,
    seller,
    item,
    quantity,
    totalPrice: item.price * quantity,
    date: new Date(),
    status: 'completed',
  };
}

// Apply discount
export function applyDiscount(price: number, discountPercent: number): number {
  return Math.floor(price * (1 - discountPercent / 100));
}

// Apply tax
export function applyTax(price: number, taxPercent: number = 10): number {
  return Math.floor(price * (1 + taxPercent / 100));
}

// Get item value for resale
export function getResaleValue(item: MarketplaceItem, condition: 'mint' | 'good' | 'fair' | 'poor' = 'good'): number {
  const conditionMultipliers: Record<string, number> = {
    'mint': 0.9,
    'good': 0.6,
    'fair': 0.4,
    'poor': 0.2,
  };

  return Math.floor(item.price * conditionMultipliers[condition]);
}

// Search marketplace
export function searchMarketplace(
  listings: MarketplaceListing[],
  query: string
): MarketplaceListing[] {
  return listings.filter((listing) =>
    listing.item.name.toLowerCase().includes(query.toLowerCase()) ||
    listing.item.description.toLowerCase().includes(query.toLowerCase())
  );
}

// Filter by rarity
export function filterByRarity(listings: MarketplaceListing[], rarity: ItemRarity): MarketplaceListing[] {
  return listings.filter((listing) => listing.item.rarity === rarity);
}

// Filter by price range
export function filterByPriceRange(listings: MarketplaceListing[], minPrice: number, maxPrice: number): MarketplaceListing[] {
  return listings.filter((listing) => listing.item.price >= minPrice && listing.item.price <= maxPrice);
}

// Sort listings
export function sortListings(listings: MarketplaceListing[], sortBy: 'price_asc' | 'price_desc' | 'new' | 'rating'): MarketplaceListing[] {
  const sorted = [...listings];

  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => a.item.price - b.item.price);
    case 'price_desc':
      return sorted.sort((a, b) => b.item.price - a.item.price);
    case 'new':
      return sorted.sort((a, b) => b.listedDate.getTime() - a.listedDate.getTime());
    case 'rating':
      return sorted.sort((a, b) => b.seller.rating - a.seller.rating);
    default:
      return sorted;
  }
}
