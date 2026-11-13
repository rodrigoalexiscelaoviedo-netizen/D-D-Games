// Character inventory management system

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  weight?: number;
  rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary';
  equipped?: boolean;
  notes?: string;
}

export interface Inventory {
  id: string;
  character_id: string;
  items: InventoryItem[];
  gold: number;
  silver: number;
  copper: number;
  max_weight?: number; // pounds
}

// Calculate total inventory weight
export function calculateTotalWeight(items: InventoryItem[]): number {
  return items.reduce((total, item) => total + (item.weight || 0) * item.quantity, 0);
}

// Check if inventory is at capacity
export function isAtCapacity(items: InventoryItem[], maxWeight: number): boolean {
  return calculateTotalWeight(items) >= maxWeight;
}

// Add item to inventory
export function addItem(
  inventory: Inventory,
  item: InventoryItem
): { success: boolean; error?: string } {
  const existingItem = inventory.items.find((i) => i.name.toLowerCase() === item.name.toLowerCase());

  if (existingItem) {
    existingItem.quantity += item.quantity;
  } else {
    inventory.items.push(item);
  }

  return { success: true };
}

// Remove item from inventory
export function removeItem(inventory: Inventory, itemId: string, quantity: number): { success: boolean; error?: string } {
  const item = inventory.items.find((i) => i.id === itemId);

  if (!item) {
    return { success: false, error: 'Item not found' };
  }

  if (item.quantity < quantity) {
    return { success: false, error: 'Not enough items' };
  }

  item.quantity -= quantity;

  if (item.quantity === 0) {
    inventory.items = inventory.items.filter((i) => i.id !== itemId);
  }

  return { success: true };
}

// Add gold/currency
export function addCurrency(inventory: Inventory, gold: number = 0, silver: number = 0, copper: number = 0) {
  inventory.gold += gold;
  inventory.silver += silver;
  inventory.copper += copper;

  // Consolidate currency
  const totalCopper = inventory.copper;
  inventory.copper = totalCopper % 10;
  inventory.silver += Math.floor(totalCopper / 10);

  const totalSilver = inventory.silver;
  inventory.silver = totalSilver % 10;
  inventory.gold += Math.floor(totalSilver / 10);
}

// Get total currency value in copper
export function getTotalCurrencyInCopper(inventory: Inventory): number {
  return inventory.gold * 100 + inventory.silver * 10 + inventory.copper;
}

// Get total currency value in gold
export function getTotalCurrencyInGold(inventory: Inventory): number {
  return getTotalCurrencyInCopper(inventory) / 100;
}

// Equip item
export function equipItem(inventory: Inventory, itemId: string): { success: boolean; error?: string } {
  const item = inventory.items.find((i) => i.id === itemId);

  if (!item) {
    return { success: false, error: 'Item not found' };
  }

  // Unequip all items of same type
  // TODO: Implement item type checking
  inventory.items.forEach((i) => {
    i.equipped = false;
  });

  item.equipped = true;
  return { success: true };
}

// Get equipped items
export function getEquippedItems(inventory: Inventory): InventoryItem[] {
  return inventory.items.filter((i) => i.equipped);
}

// Get inventory value
export function getInventoryValue(items: InventoryItem[], priceMap: Record<string, number>): number {
  return items.reduce((total, item) => {
    const price = priceMap[item.name.toLowerCase()] || 0;
    return total + price * item.quantity;
  }, 0);
}
