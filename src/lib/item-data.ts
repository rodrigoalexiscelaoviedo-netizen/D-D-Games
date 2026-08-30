// D&D 5e Items Database - SRD items

export interface Item {
  id?: string;
  name: string;
  type: 'Weapon' | 'Armor' | 'Accessory' | 'Consumable' | 'Wondrous' | 'Scroll' | 'Potion' | 'Ring';
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary' | 'Artifact';
  description: string;
  cost?: string;
  weight?: number;
  properties?: string[];
  requires_attunement?: boolean;
}

export const ITEM_SEED_DATA: Item[] = [
  // Weapons
  {
    name: 'Longsword',
    type: 'Weapon',
    rarity: 'Common',
    description: 'A versatile melee weapon with a long blade.',
    cost: '15 gp',
    weight: 3,
    properties: ['Versatile', 'Melee'],
  },
  {
    name: 'Shortsword',
    type: 'Weapon',
    rarity: 'Common',
    description: 'A short, sharp blade perfect for close combat.',
    cost: '10 gp',
    weight: 2,
    properties: ['Finesse', 'Light', 'Melee'],
  },
  {
    name: 'Greataxe',
    type: 'Weapon',
    rarity: 'Common',
    description: 'A massive two-handed axe that deals heavy damage.',
    cost: '30 gp',
    weight: 7,
    properties: ['Heavy', 'Two-Handed', 'Melee'],
  },
  {
    name: 'Longbow',
    type: 'Weapon',
    rarity: 'Common',
    description: 'A bow for shooting arrows at distance.',
    cost: '50 gp',
    weight: 2,
    properties: ['Ammunition', 'Heavy', 'Ranged', 'Two-Handed'],
  },
  {
    name: 'Dagger',
    type: 'Weapon',
    rarity: 'Common',
    description: 'A small, sharp blade useful for stabbing or throwing.',
    cost: '2 gp',
    weight: 1,
    properties: ['Finesse', 'Light', 'Thrown'],
  },

  // Armor
  {
    name: 'Plate Armor',
    type: 'Armor',
    rarity: 'Common',
    description: 'Heavy armor made of metal plates.',
    cost: '1500 gp',
    weight: 65,
    properties: ['Heavy', 'AC 18'],
  },
  {
    name: 'Chain Mail',
    type: 'Armor',
    rarity: 'Common',
    description: 'Medium armor made of interlocking metal rings.',
    cost: '75 gp',
    weight: 55,
    properties: ['Medium', 'AC 16'],
  },
  {
    name: 'Leather Armor',
    type: 'Armor',
    rarity: 'Common',
    description: 'Light armor made of hardened leather.',
    cost: '10 gp',
    weight: 10,
    properties: ['Light', 'AC 11'],
  },

  // Wondrous Items
  {
    name: 'Ring of Protection',
    type: 'Ring',
    rarity: 'Uncommon',
    description: 'While wearing this ring, you gain a +1 bonus to AC.',
    requires_attunement: false,
  },
  {
    name: 'Cloak of Invisibility',
    type: 'Wondrous',
    rarity: 'Legendary',
    description: 'While wearing this cloak, you can become invisible.',
    requires_attunement: true,
  },
  {
    name: 'Belt of Giant Strength',
    type: 'Wondrous',
    rarity: 'Very Rare',
    description: 'While wearing this belt, your Strength score changes.',
    requires_attunement: true,
  },
  {
    name: 'Amulet of Health',
    type: 'Accessory',
    rarity: 'Rare',
    description: 'This amulet grants you a Constitution score of 19.',
    requires_attunement: true,
  },

  // Consumables
  {
    name: 'Potion of Healing',
    type: 'Potion',
    rarity: 'Common',
    description: 'Drink this potion to restore 4d4+4 hit points.',
    cost: '50 gp',
  },
  {
    name: 'Potion of Greater Healing',
    type: 'Potion',
    rarity: 'Uncommon',
    description: 'Drink this potion to restore 4d4+8 hit points.',
    cost: '100 gp',
  },
  {
    name: 'Potion of Fire Resistance',
    type: 'Potion',
    rarity: 'Uncommon',
    description: 'Drink this potion to gain fire resistance for 1 hour.',
    cost: '100 gp',
  },
  {
    name: 'Scroll of Fireball',
    type: 'Scroll',
    rarity: 'Uncommon',
    description: 'A spell scroll containing the Fireball spell.',
    cost: '200 gp',
  },

  // Magical Weapons
  {
    name: 'Flaming Longsword',
    type: 'Weapon',
    rarity: 'Rare',
    description: 'This longsword is wreathed in flame and deals an extra 2d6 fire damage.',
    requires_attunement: true,
    properties: ['Magic', 'Fire Damage'],
  },
  {
    name: 'Frost Brand Sword',
    type: 'Weapon',
    rarity: 'Very Rare',
    description: 'This sword deals 1d6 cold damage and can turn water to ice.',
    requires_attunement: true,
    properties: ['Magic', 'Cold Damage'],
  },
  {
    name: 'Sword of Sharpness',
    type: 'Weapon',
    rarity: 'Very Rare',
    description: 'This sword never dulls and can cut through almost anything.',
    requires_attunement: true,
    properties: ['Magic', 'Legendary'],
  },
];

export async function seedItems(supabase: any) {
  try {
    const items = ITEM_SEED_DATA.map((item) => ({
      ...item,
      properties: JSON.stringify(item.properties || []),
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('items').insert(items);
    if (error) throw error;

    console.log(`✅ Seeded ${items.length} items`);
    return items;
  } catch (error) {
    console.error('Error seeding items:', error);
    throw error;
  }
}
