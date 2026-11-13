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

  // Additional Weapons (Expanded)
  {
    name: 'Rapier',
    type: 'Weapon',
    rarity: 'Common',
    description: 'A slender blade perfect for precise strikes.',
    cost: '25 gp',
    weight: 2,
    properties: ['Finesse', 'Melee'],
  },
  {
    name: 'Warhammer',
    type: 'Weapon',
    rarity: 'Common',
    description: 'A two-handed hammer for powerful strikes.',
    cost: '15 gp',
    weight: 6,
    properties: ['Versatile', 'Melee'],
  },
  {
    name: 'Mace',
    type: 'Weapon',
    rarity: 'Common',
    description: 'A one-handed blunt weapon.',
    cost: '5 gp',
    weight: 4,
    properties: ['Melee'],
  },
  {
    name: 'Spear',
    type: 'Weapon',
    rarity: 'Common',
    description: 'A versatile polearm weapon.',
    cost: '1 gp',
    weight: 3,
    properties: ['Thrown', 'Versatile', 'Melee'],
  },
  {
    name: 'Greatsword',
    type: 'Weapon',
    rarity: 'Common',
    description: 'A massive two-handed sword.',
    cost: '50 gp',
    weight: 6,
    properties: ['Heavy', 'Two-Handed', 'Melee'],
  },
  {
    name: 'Crossbow',
    type: 'Weapon',
    rarity: 'Common',
    description: 'A crossbow for shooting bolts.',
    cost: '25 gp',
    weight: 9,
    properties: ['Ammunition', 'Heavy', 'Ranged', 'Two-Handed'],
  },

  // Additional Armor
  {
    name: 'Scale Mail',
    type: 'Armor',
    rarity: 'Common',
    description: 'Medium armor with overlapping metal scales.',
    cost: '50 gp',
    weight: 45,
    properties: ['Medium', 'AC 14'],
  },
  {
    name: 'Studded Leather',
    type: 'Armor',
    rarity: 'Common',
    description: 'Light armor reinforced with studs.',
    cost: '45 gp',
    weight: 13,
    properties: ['Light', 'AC 12'],
  },
  {
    name: 'Full Plate',
    type: 'Armor',
    rarity: 'Uncommon',
    description: 'Heavy magical plate armor.',
    cost: '2000 gp',
    weight: 65,
    properties: ['Heavy', 'AC 18+'],
  },
  {
    name: 'Mithral Armor',
    type: 'Armor',
    rarity: 'Rare',
    description: 'Enchanted armor made of mithral.',
    cost: '3000 gp',
    weight: 20,
    properties: ['Magic', 'AC 16'],
  },

  // Additional Potions
  {
    name: 'Potion of Superior Healing',
    type: 'Potion',
    rarity: 'Rare',
    description: 'Drink this potion to restore 8d4+8 hit points.',
    cost: '500 gp',
  },
  {
    name: 'Potion of Speed',
    type: 'Potion',
    rarity: 'Uncommon',
    description: 'Gain the ability to move twice as fast for 1 hour.',
    cost: '150 gp',
  },
  {
    name: 'Potion of Invisible',
    type: 'Potion',
    rarity: 'Rare',
    description: 'Become invisible for 1 hour.',
    cost: '300 gp',
  },
  {
    name: 'Potion of Giant Strength',
    type: 'Potion',
    rarity: 'Uncommon',
    description: 'Gain the strength of a giant for 1 hour.',
    cost: '200 gp',
  },
  {
    name: 'Potion of Poison',
    type: 'Potion',
    rarity: 'Uncommon',
    description: 'A deadly poison in a vial.',
    cost: '100 gp',
  },
  {
    name: 'Potion of Cold Resistance',
    type: 'Potion',
    rarity: 'Uncommon',
    description: 'Gain resistance to cold damage.',
    cost: '100 gp',
  },

  // Additional Rings
  {
    name: 'Ring of Wisdom',
    type: 'Ring',
    rarity: 'Uncommon',
    description: 'Gain +2 to Wisdom saving throws.',
    requires_attunement: false,
  },
  {
    name: 'Ring of Fire Resistance',
    type: 'Ring',
    rarity: 'Uncommon',
    description: 'Gain resistance to fire damage.',
    requires_attunement: true,
  },
  {
    name: 'Ring of Mind Shielding',
    type: 'Ring',
    rarity: 'Uncommon',
    description: 'Cannot be compelled to tell the truth.',
    requires_attunement: true,
  },

  // Additional Wondrous Items
  {
    name: 'Bag of Holding',
    type: 'Wondrous',
    rarity: 'Uncommon',
    description: 'A magical bag that holds more than it appears.',
    requires_attunement: false,
  },
  {
    name: 'Boots of Speed',
    type: 'Wondrous',
    rarity: 'Uncommon',
    description: 'These boots allow you to move at incredible speeds.',
    requires_attunement: true,
  },
  {
    name: 'Cloak of Charisma',
    type: 'Wondrous',
    rarity: 'Uncommon',
    description: 'While wearing this cloak, your Charisma score increases.',
    requires_attunement: true,
  },
  {
    name: 'Gloves of Thievery',
    type: 'Wondrous',
    rarity: 'Uncommon',
    description: 'These gloves give you advantage on Sleight of Hand checks.',
    requires_attunement: false,
  },
  {
    name: 'Hat of Disguise',
    type: 'Wondrous',
    rarity: 'Uncommon',
    description: 'This hat lets you disguise your appearance.',
    requires_attunement: true,
  },
  {
    name: 'Immovable Rod',
    type: 'Wondrous',
    rarity: 'Uncommon',
    description: 'A rod that can be made to stick in place.',
    requires_attunement: false,
  },
  {
    name: 'Scroll of Protection',
    type: 'Scroll',
    rarity: 'Uncommon',
    description: 'Gain +2 to AC for 8 hours.',
    cost: '100 gp',
  },
  {
    name: 'Scroll of Restoration',
    type: 'Scroll',
    rarity: 'Rare',
    description: 'Cure disease or remove curse.',
    cost: '500 gp',
  },

  // Magical Weapons (Expanded)
  {
    name: '+1 Longsword',
    type: 'Weapon',
    rarity: 'Uncommon',
    description: 'A longsword with a +1 bonus to attack and damage rolls.',
    requires_attunement: false,
  },
  {
    name: '+2 Greatsword',
    type: 'Weapon',
    rarity: 'Rare',
    description: 'A greatsword with a +2 bonus to attack and damage rolls.',
    requires_attunement: false,
  },
  {
    name: 'Vorpal Sword',
    type: 'Weapon',
    rarity: 'Legendary',
    description: 'A sword so sharp it can sever heads.',
    requires_attunement: true,
    properties: ['Magic', 'Legendary'],
  },
  {
    name: 'Holy Avenger',
    type: 'Weapon',
    rarity: 'Legendary',
    description: 'A righteous sword that glows with holy light.',
    requires_attunement: true,
    properties: ['Magic', 'Divine'],
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
