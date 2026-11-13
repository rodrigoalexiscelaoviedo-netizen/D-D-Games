// Modelo de los módulos de aventura instalables.
// El texto narrativo, las opciones y los encuentros se instalan en Supabase
// (adventures / scenes / scene_options / bestiary). Las ayudas visuales
// (ilustración, mapa, handouts, notas de DM) viven en el código y se cruzan
// con la escena instalada por `adventures.origin = "module:<slug>"` + scene_order.

import type { Scene } from '../../lib/adventure-types';

export type Ambient = 'dungeon' | 'tavern' | 'forest';

export type FloorKind = 'stone' | 'wood' | 'grass' | 'dirt' | 'water' | 'cave' | 'tile';

export type FeatureKind =
  | 'pillar' | 'barrel' | 'crate' | 'table' | 'door' | 'tree' | 'rock'
  | 'altar' | 'stairs' | 'fire' | 'bed' | 'chest' | 'statue' | 'rubble'
  | 'bell' | 'wagon' | 'tent' | 'bookshelf' | 'well' | 'bush' | 'bar'
  | 'telescope' | 'coffin' | 'web';

export interface MapArea {
  id: string;
  label?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  floor?: FloorKind;
  /** Oculta a los jugadores hasta que el DM la revela. */
  hidden?: boolean;
}

export interface MapFeature {
  kind: FeatureKind;
  x: number;
  y: number;
  w?: number;
  h?: number;
}

export interface DmMarker {
  kind: 'enemy' | 'trap' | 'treasure' | 'secret' | 'npc';
  x: number;
  y: number;
  label: string;
}

export interface BattleMapDef {
  name: string;
  cols: number;
  rows: number;
  /** Fondo fuera de las áreas (roca, bosque, agua…). */
  outside: FloorKind | 'void';
  areas: MapArea[];
  features: MapFeature[];
  dmMarkers?: DmMarker[];
}

export interface Handout {
  id: string;
  title: string;
  kind: 'letter' | 'note' | 'poster' | 'drawing';
  text: string;
  signature?: string;
}

export interface SkillCheck {
  skill: string;
  dc: number;
  success: string;
  failure: string;
}

export interface ModuleNpc {
  name: string;
  role: string;
  voice: string;
}

export interface ModuleOption {
  label: string;
  dmNote?: string;
  /** key de la escena destino; null = sin destino. */
  to: string | null;
  setsFlag?: string;
  requiresFlag?: string;
}

export interface ModuleScene {
  key: string;
  order: number;
  type: Scene['scene_type'];
  title: string;
  /** Texto para leer en voz alta / lo que ven los jugadores. */
  readAloud: string;
  /** Lo que sabe el DM. */
  dmText: string;
  encounter?: { monster: string; count: number; note?: string };
  /**
   * Combate: exactamente 2 opciones — [0] victoria, [1] derrota
   * (así lo espera combat-return.ts con option_order 1 y 2).
   * Escena final: [].
   */
  options: ModuleOption[];
  ambient?: Ambient;
  image?: string;
  map?: BattleMapDef;
  handouts?: Handout[];
  checks?: SkillCheck[];
  npcs?: ModuleNpc[];
  treasure?: string[];
  dmTips?: string[];
  ending?: 'victory' | 'defeat' | 'neutral';
}

export interface ModuleMonster {
  name: string;
  hp: number;
  armor_class: number;
  dexterity: number;
  /** Tamaño del dado de daño (6 = d6), como usa combat-engine. */
  damage_dice: number;
  attack_bonus: number;
  xp_value: number;
  challenge_rating: number;
  description: string;
  portrait_seed: string;
}

export interface AdventureModule {
  slug: string;
  title: string;
  subtitle: string;
  level: number;
  players: string;
  duration: string;
  synopsis: string;
  cover?: string;
  /** Color de acento para la portada si no hay imagen. */
  accent: string;
  monsters: ModuleMonster[];
  scenes: ModuleScene[];
}
