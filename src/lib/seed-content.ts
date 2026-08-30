import { supabase } from './supabase';

// DiceBear avatar URL generator
const getDiceBearAvatar = (name: string, style: 'avataaars' | 'pixel-art' = 'avataaars') => {
  const seed = encodeURIComponent(name);
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&scale=80`;
};

// Unsplash image URL generator
const getUnsplashImage = (query: string) => {
  const search = encodeURIComponent(query);
  return `https://source.unsplash.com/featured/800x600?${search}`;
};

// NPC data
export const NPC_SEED_DATA = [
  // Tavern NPCs
  {
    name: 'Berta la Posadera',
    title: 'Tavern Keeper',
    location: 'El Jabalí Dormido',
    description: 'A weathered but kind tavern keeper with an eye for trouble.',
    role: 'Ally',
  },
  {
    name: 'Thorne Ironhand',
    title: 'Blacksmith',
    location: 'Village Square',
    description: 'A gruff dwarf blacksmith known for quality weapons.',
    role: 'Merchant',
  },
  {
    name: 'Sylvara Starwhisper',
    title: 'Wizard',
    location: 'Arcane Tower',
    description: 'A mysterious elf wizard dealing in enchanted goods.',
    role: 'Ally',
  },
  {
    name: 'Marcus the Bard',
    title: 'Entertainer',
    location: 'El Jabalí Dormido',
    description: 'A charming bard with tales and songs of adventure.',
    role: 'Neutral',
  },
  {
    name: 'Captain Vex',
    title: 'Town Guard',
    location: 'Guard Tower',
    description: 'Stern captain of the town guard, strict but fair.',
    role: 'Ally',
  },
  {
    name: 'Old Grimm',
    title: 'Hermit Sage',
    location: 'Forest Edge',
    description: 'A reclusive sage with knowledge of ancient magic.',
    role: 'Ally',
  },
  {
    name: 'Lady Celestine',
    title: 'Noble',
    location: 'Castle',
    description: 'An elegant noble with political influence.',
    role: 'Neutral',
  },
  {
    name: 'Krayg Bonecrusher',
    title: 'Orc Mercenary',
    location: 'The Crimson Tavern',
    description: 'A fearsome orc warrior for hire.',
    role: 'Neutral',
  },
  {
    name: 'Mira Shadowstep',
    title: 'Rogue/Thief',
    location: 'Back Alleys',
    description: 'A cunning rogue with connections to the underground.',
    role: 'Neutral',
  },
  {
    name: 'Brother Aldus',
    title: 'Cleric',
    location: 'Temple of Light',
    description: 'A devoted cleric offering healing and guidance.',
    role: 'Ally',
  },
  {
    name: 'Zephyr Swiftwind',
    title: 'Scout/Ranger',
    location: 'Northern Woods',
    description: 'A keen ranger and tracker of the wilderness.',
    role: 'Ally',
  },
  {
    name: 'Duchess Morgane',
    title: 'Dark Sorceress',
    location: 'Shadow Keep',
    description: 'A powerful and mysterious sorceress of dark arts.',
    role: 'Enemy',
  },
  {
    name: 'Grendak the Alchemist',
    title: 'Alchemist/Apothecary',
    location: 'Potion Shop',
    description: 'A gnome alchemist creating potions and elixirs.',
    role: 'Merchant',
  },
  {
    name: 'Rayeth Dragonborn',
    title: 'Paladin',
    location: 'Holy Citadel',
    description: 'A noble dragonborn paladin sworn to justice.',
    role: 'Ally',
  },
  {
    name: 'The Masked Stranger',
    title: 'Mystery NPC',
    location: 'Unknown',
    description: 'A mysterious figure of unknown intentions.',
    role: 'Neutral',
  },
];

// Location data
export const LOCATION_SEED_DATA = [
  {
    name: 'El Jabalí Dormido',
    type: 'Tavern',
    description: 'A cozy tavern with good ale and interesting patrons.',
    danger_level: 'Low',
    features: 'Bar, Private Rooms, Fireplace, Musicians',
  },
  {
    name: 'Dark Forest Path',
    type: 'Forest',
    description: 'A mysterious forest trail with ancient trees.',
    danger_level: 'High',
    features: 'Twisted Trees, Hidden Ruins, Dangerous Wildlife',
  },
  {
    name: 'Goblin Caves',
    type: 'Dungeon',
    description: 'Underground caverns inhabited by goblins.',
    danger_level: 'Very High',
    features: 'Multiple Chambers, Treasure Vault, Goblin Throne',
  },
  {
    name: 'Arcane Tower',
    type: 'Tower',
    description: 'A magical tower full of enchantments.',
    danger_level: 'Medium',
    features: 'Library, Laboratory, Teleportation Circle',
  },
  {
    name: 'Temple of Light',
    type: 'Temple',
    description: 'A sacred temple dedicated to healing and wisdom.',
    danger_level: 'Low',
    features: 'Altar, Holy Library, Healing Chamber',
  },
  {
    name: 'Shadow Keep',
    type: 'Fortress',
    description: 'A dark fortress of mysterious origins.',
    danger_level: 'Extreme',
    features: 'Towers, Dungeon, Ritual Chambers, Treasure Vault',
  },
  {
    name: 'Village Market',
    type: 'Town',
    description: 'A bustling marketplace in the town center.',
    danger_level: 'Low',
    features: 'Merchant Stalls, Fountain, Town Square',
  },
  {
    name: 'Bandit Camp',
    type: 'Camp',
    description: 'A hidden camp of outlaws and brigands.',
    danger_level: 'High',
    features: 'Tents, Campfire, Treasure Stash, Watch Posts',
  },
  {
    name: 'Elven Ruins',
    type: 'Ruins',
    description: 'Ancient ruins of a lost elven civilization.',
    danger_level: 'Medium',
    features: 'Pillars, Murals, Ancient Artifacts, Secret Passages',
  },
  {
    name: 'Dragon Lair',
    type: 'Cave',
    description: 'The lair of a mighty dragon.',
    danger_level: 'Extreme',
    features: 'Massive Cave, Gold Hoard, Heat Traps, Dragon Throne',
  },
  {
    name: 'Witch\'s Cottage',
    type: 'Building',
    description: 'A peculiar cottage in the woods.',
    danger_level: 'High',
    features: 'Potion Shelves, Cauldron, Spell Books, Strange Herbs',
  },
  {
    name: 'Mountain Pass',
    type: 'Wilderness',
    description: 'A treacherous mountain pass between peaks.',
    danger_level: 'High',
    features: 'Narrow Path, Cliffs, Avalanche Risk, Cave Systems',
  },
  {
    name: 'Sunken City',
    type: 'Underwater',
    description: 'An ancient city submerged beneath the waves.',
    danger_level: 'Very High',
    features: 'Stone Buildings, Coral Gardens, Air Pockets, Treasure',
  },
  {
    name: 'Haunted Manor',
    type: 'Building',
    description: 'A grand manor plagued by spirits.',
    danger_level: 'Medium',
    features: 'Grand Hall, Library, Bedrooms, Basement',
  },
  {
    name: 'Crypt of the Ancients',
    type: 'Tomb',
    description: 'An ancient burial ground of forgotten kings.',
    danger_level: 'Very High',
    features: 'Sarcophagi, Traps, Undead, Ancient Treasures',
  },
  {
    name: 'Merchant Road',
    type: 'Road',
    description: 'A major trading route between cities.',
    danger_level: 'Medium',
    features: 'Caravan Stops, Inns, Bridges, Crossroads',
  },
  {
    name: 'Beast\'s Den',
    type: 'Cave',
    description: 'The lair of a terrible beast.',
    danger_level: 'Very High',
    features: 'Rock Formations, Blood Stains, Bones, Treasure Pile',
  },
  {
    name: 'Magic Academy',
    type: 'Building',
    description: 'An institution for training young wizards.',
    danger_level: 'Low',
    features: 'Classrooms, Library, Dormitories, Laboratories',
  },
  {
    name: 'Underground City',
    type: 'City',
    description: 'A vast dwarven city deep beneath the earth.',
    danger_level: 'Low',
    features: 'Markets, Forges, Taverns, Throne Hall',
  },
  {
    name: 'Cursed Swamp',
    type: 'Swamp',
    description: 'A murky swamp filled with strange magic.',
    danger_level: 'High',
    features: 'Murky Water, Twisted Trees, Quicksand, Ruins',
  },
];

// Seed NPCs to Supabase
export async function seedNPCs() {
  try {
    const npcs = NPC_SEED_DATA.map((npc) => ({
      ...npc,
      avatar_url: getDiceBearAvatar(npc.name, 'avataaars'),
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('npcs').insert(npcs);
    if (error) throw error;

    console.log(`✅ Seeded ${npcs.length} NPCs`);
    return npcs;
  } catch (error) {
    console.error('Error seeding NPCs:', error);
    throw error;
  }
}

// Seed Locations to Supabase
export async function seedLocations() {
  try {
    const locations = LOCATION_SEED_DATA.map((location) => ({
      ...location,
      image_url: getUnsplashImage(`${location.type} ${location.name}`),
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('locations').insert(locations);
    if (error) throw error;

    console.log(`✅ Seeded ${locations.length} locations`);
    return locations;
  } catch (error) {
    console.error('Error seeding locations:', error);
    throw error;
  }
}

// Utility: Add avatar to creatures
export async function addAvatarToCreatures() {
  try {
    const { data: creatures, error: fetchError } = await supabase
      .from('creatures')
      .select('id, name')
      .limit(100);

    if (fetchError) throw fetchError;

    for (const creature of creatures || []) {
      const imageUrl = getUnsplashImage(creature.name);
      const { error } = await supabase
        .from('creatures')
        .update({ avatar_url: imageUrl })
        .eq('id', creature.id);

      if (error) console.error(`Error updating ${creature.name}:`, error);
    }

    console.log('✅ Added avatars to creatures');
  } catch (error) {
    console.error('Error adding avatars:', error);
    throw error;
  }
}

// Utility: DiceBear avatar generator
export const AvatarGenerator = {
  human: (name: string) => getDiceBearAvatar(name, 'avataaars'),
  pixel: (name: string) => getDiceBearAvatar(name, 'pixel-art'),
  getUrl: (name: string, style: 'avataaars' | 'pixel-art' = 'avataaars') =>
    getDiceBearAvatar(name, style),
};

// Utility: Image getters
export const ImageGenerator = {
  creature: (name: string) => getUnsplashImage(name),
  location: (name: string, type: string) => getUnsplashImage(`${type} ${name}`),
  npc: (name: string) => getDiceBearAvatar(name),
  character: (name: string) => getDiceBearAvatar(name),
};
