// Foundry VTT export and compatibility layer

export type FoundryEntityType = 'Actor' | 'Item' | 'Scene' | 'JournalEntry' | 'RollTable';

export interface FoundryActor {
  name: string;
  type: 'character' | 'npc' | 'creature';
  data: {
    abilities: Record<string, { value: number; proficient?: number }>;
    attributes: {
      hp: { value: number; max: number };
      ac: { value: number };
      speed: { value: number };
    };
    details: {
      class?: string;
      level?: number;
      race?: string;
      alignment?: string;
    };
    traits?: Record<string, string>;
  };
  items: FoundryItem[];
}

export interface FoundryItem {
  name: string;
  type: 'weapon' | 'equipment' | 'loot' | 'spell' | 'feat' | 'class';
  data: {
    description?: { value: string };
    quantity?: number;
    rarity?: string;
    weight?: number;
    properties?: string[];
    damage?: { parts: Array<[string, string]> };
    range?: { value: number; long?: number };
  };
}

export interface FoundryScene {
  name: string;
  navName?: string;
  background?: string;
  width: number;
  height: number;
  grid: {
    type: number;
    size: number;
    distance: number;
    units: string;
  };
  tokens: FoundryToken[];
}

export interface FoundryToken {
  name: string;
  actorId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale?: number;
  vision?: boolean;
  dimSight?: number;
  brightSight?: number;
}

export interface FoundryModule {
  name: string;
  title: string;
  version: string;
  description: string;
  author: string;
  url?: string;
  manifest?: string;
  download?: string;
  packs: FoundryPack[];
}

export interface FoundryPack {
  name: string;
  label: string;
  path: string;
  entity: FoundryEntityType;
}

export interface FoundryJournalEntry {
  name: string;
  content: string;
  sort?: number;
  folder?: string;
  permission?: Record<string, number>;
}

// Convert character to Foundry Actor
export function convertCharacterToFoundryActor(character: any): FoundryActor {
  return {
    name: character.name,
    type: character.class ? 'character' : 'npc',
    data: {
      abilities: {
        str: { value: character.strength || 10, proficient: 0 },
        dex: { value: character.dexterity || 10, proficient: 0 },
        con: { value: character.constitution || 10, proficient: 0 },
        int: { value: character.intelligence || 10, proficient: 0 },
        wis: { value: character.wisdom || 10, proficient: 0 },
        cha: { value: character.charisma || 10, proficient: 0 },
      },
      attributes: {
        hp: { value: character.hp_current || 10, max: character.hp_max || 10 },
        ac: { value: character.ac || 10 },
        speed: { value: 30 },
      },
      details: {
        class: character.class,
        level: character.level,
        race: character.race,
        alignment: character.alignment,
      },
    },
    items: [],
  };
}

// Convert item to Foundry Item
export function convertItemToFoundryItem(item: any): FoundryItem {
  return {
    name: item.name,
    type: item.type?.toLowerCase() || 'loot',
    data: {
      description: { value: item.description || '' },
      quantity: item.quantity || 1,
      rarity: item.rarity,
      weight: item.weight,
      properties: item.properties || [],
    },
  };
}

// Convert spell to Foundry Spell
export function convertSpellToFoundryItem(spell: any): FoundryItem {
  return {
    name: spell.name,
    type: 'spell',
    data: {
      description: { value: spell.description },
      properties: [spell.school, `Level ${spell.level}`],
      range: { value: parseInt(spell.range) || 0 },
    },
  };
}

// Create Foundry scene
export function createFoundryScene(
  name: string,
  width: number = 800,
  height: number = 600,
  gridSize: number = 70
): FoundryScene {
  return {
    name,
    navName: name,
    width,
    height,
    grid: {
      type: 1, // Square grid
      size: gridSize,
      distance: 5,
      units: 'ft',
    },
    tokens: [],
  };
}

// Add token to scene
export function addTokenToScene(scene: FoundryScene, token: FoundryToken): FoundryScene {
  return {
    ...scene,
    tokens: [...scene.tokens, token],
  };
}

// Export to JSON format
export function exportToJSON(data: any): string {
  return JSON.stringify(data, null, 2);
}

// Create module manifest
export function createModuleManifest(
  name: string,
  title: string,
  version: string,
  author: string
): FoundryModule {
  return {
    name,
    title,
    version,
    description: `Exported from D&D VTT`,
    author,
    packs: [
      {
        name: `${name}-actors`,
        label: `${title} - Characters`,
        path: `packs/actors.db`,
        entity: 'Actor',
      },
      {
        name: `${name}-items`,
        label: `${title} - Items`,
        path: `packs/items.db`,
        entity: 'Item',
      },
      {
        name: `${name}-scenes`,
        label: `${title} - Scenes`,
        path: `packs/scenes.db`,
        entity: 'Scene',
      },
    ],
  };
}

// Batch export adventure
export function exportAdventureToFoundry(adventure: any): {
  manifest: FoundryModule;
  actors: FoundryActor[];
  scenes: FoundryScene[];
  journal: FoundryJournalEntry[];
} {
  return {
    manifest: createModuleManifest(
      adventure.id,
      adventure.name,
      '1.0.0',
      adventure.created_by
    ),
    actors: (adventure.characters || []).map(convertCharacterToFoundryActor),
    scenes: (adventure.scenes || []).map((scene: any) =>
      createFoundryScene(scene.name)
    ),
    journal: (adventure.scenes || []).map((scene: any) => ({
      name: scene.name,
      content: scene.description || '',
    })),
  };
}

// Validate Foundry compatibility
export function validateFoundryCompatibility(version: string): boolean {
  const supportedVersions = ['10.x', '11.x', '12.x'];
  return supportedVersions.some((v) => version.startsWith(v));
}

// Generate export statistics
export function getExportStats(data: any): {
  actors: number;
  items: number;
  scenes: number;
  journal: number;
  totalSize: number;
} {
  const json = JSON.stringify(data);
  return {
    actors: data.actors?.length || 0,
    items: data.actors?.flatMap((a: any) => a.items || []).length || 0,
    scenes: data.scenes?.length || 0,
    journal: data.journal?.length || 0,
    totalSize: new Blob([json]).size,
  };
}
