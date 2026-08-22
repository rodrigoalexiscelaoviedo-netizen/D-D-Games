export interface Character {
  id?: string;
  campaign_id: string;
  character_name: string;
  player_name?: string;
  player_user_id?: string | null;
  portrait_url?: string;
  race?: string;
  class?: string;
  subclass?: string;
  background?: string;
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  proficiency_bonus?: number;
  armor_class?: number;
  initiative_bonus?: number;
  speed?: number;
  level?: number;
  xp?: number;
  hp_current?: number;
  hp_max?: number;
  spell_slots?: Record<string, number>;
  skill_proficiencies?: string[];
  resistances?: string[];
  immunities?: string[];
  vulnerabilities?: string[];
  languages?: string[];
  tools_proficiency?: string[];
  senses?: string[];
  personality_traits?: Record<string, string>;
  inventory?: InventoryItem[];
  spells?: SpellEntry[];
  conditions?: string[];
  inspiration?: boolean;
  notes?: string;
  milestone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryItem {
  name: string;
  qty?: number;
  notes?: string;
}

export interface SpellEntry {
  name: string;
  level?: number;
  prepared?: boolean;
}
