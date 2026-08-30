import { supabase } from './supabase';

export interface Open5eMonster {
  index: string;
  name: string;
  size: string;
  type: string;
  armor_class: number;
  hit_points: number;
  speed: Record<string, string>;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiencies?: any[];
  damage_vulnerabilities?: string;
  damage_resistances?: string;
  damage_immunities?: string;
  condition_immunities?: string;
  languages?: string;
  challenge: number;
  special_abilities?: Array<{ name: string; desc: string }>;
  actions?: Array<{ name: string; desc: string }>;
  reactions?: Array<{ name: string; desc: string }>;
}

export interface Creature {
  id?: string;
  name: string;
  type: string;
  cr: number;
  hp: number;
  ac: number;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  size: string;
  speed?: string;
  abilities?: string;
  actions?: string;
  reactions?: string;
  languages?: string;
  damage_resistances?: string;
  damage_immunities?: string;
  source: 'open5e' | 'custom';
  open5e_index?: string;
}

export async function fetchOpen5eMonsters(limit = 100, offset = 0): Promise<Open5eMonster[]> {
  try {
    const response = await fetch(
      `https://api.open5e.com/monsters/?limit=${limit}&offset=${offset}`
    );
    if (!response.ok) throw new Error('Failed to fetch from Open5e');
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching Open5e monsters:', error);
    return [];
  }
}

export function mapOpen5eToCreature(monster: Open5eMonster): Creature {
  const speedStr = Object.entries(monster.speed || {})
    .map(([key, val]) => `${key}: ${val}`)
    .join(', ');

  const abilitiesStr = monster.special_abilities
    ?.map((a) => `**${a.name}**: ${a.desc}`)
    .join('\n\n');

  const actionsStr = monster.actions
    ?.map((a) => `**${a.name}**: ${a.desc}`)
    .join('\n\n');

  const reactionsStr = monster.reactions
    ?.map((a) => `**${a.name}**: ${a.desc}`)
    .join('\n\n');

  return {
    name: monster.name,
    type: monster.type,
    cr: monster.challenge,
    hp: monster.hit_points,
    ac: monster.armor_class,
    str: monster.strength,
    dex: monster.dexterity,
    con: monster.constitution,
    int: monster.intelligence,
    wis: monster.wisdom,
    cha: monster.charisma,
    size: monster.size,
    speed: speedStr || undefined,
    abilities: abilitiesStr || undefined,
    actions: actionsStr || undefined,
    reactions: reactionsStr || undefined,
    languages: monster.languages || undefined,
    damage_resistances: monster.damage_resistances || undefined,
    damage_immunities: monster.damage_immunities || undefined,
    source: 'open5e',
    open5e_index: monster.index,
  };
}

export async function importOpen5eMonstersToSupabase(
  limit = 500,
  onProgress?: (current: number, total: number) => void
): Promise<{ success: number; failed: number; errors: string[] }> {
  const errors: string[] = [];
  let success = 0;
  let failed = 0;
  let offset = 0;
  const batchSize = 100;

  try {
    while (offset < limit) {
      const monsters = await fetchOpen5eMonsters(batchSize, offset);
      if (monsters.length === 0) break;

      for (const monster of monsters) {
        try {
          const creature = mapOpen5eToCreature(monster);
          const { error } = await supabase.from('creatures').insert(creature);

          if (error) {
            // Ignore duplicate key errors
            if (!error.message.includes('duplicate')) {
              errors.push(`${monster.name}: ${error.message}`);
              failed++;
            } else {
              success++;
            }
          } else {
            success++;
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Unknown error';
          errors.push(`${monster.name}: ${msg}`);
          failed++;
        }
      }

      offset += batchSize;
      onProgress?.(offset, limit);
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Fatal error: ${msg}`);
  }

  return { success, failed, errors };
}

export async function searchCreatures(query: string, source?: 'open5e' | 'custom') {
  try {
    let q = supabase.from('creatures').select('*');

    if (query) {
      q = q.ilike('name', `%${query}%`);
    }

    if (source) {
      q = q.eq('source', source);
    }

    const { data, error } = await q.limit(50);

    if (error) throw error;
    return data as Creature[];
  } catch (error) {
    console.error('Error searching creatures:', error);
    return [];
  }
}

export async function getCreaturesByCR(cr: number): Promise<Creature[]> {
  try {
    const { data, error } = await supabase
      .from('creatures')
      .select('*')
      .eq('cr', cr)
      .limit(20);

    if (error) throw error;
    return data as Creature[];
  } catch (error) {
    console.error('Error fetching creatures by CR:', error);
    return [];
  }
}
