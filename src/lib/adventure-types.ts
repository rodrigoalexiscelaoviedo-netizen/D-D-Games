export interface Adventure {
  id: string;
  title: string;
  suggested_level?: number;
  synopsis?: string;
  author?: string;
  origin?: string;
  created_at?: string;
}

export interface Scene {
  id: string;
  adventure_id: string;
  scene_order: number;
  scene_type: 'narracion' | 'decision' | 'tirada' | 'combate' | 'descanso';
  title?: string;
  dm_text: string;
  player_text?: string;
  encounter?: {
    bestiary_name: string;
    count: number;
    note?: string;
  };
  created_at?: string;
}

export interface SceneOption {
  id: string;
  scene_id: string;
  option_order: number;
  player_label: string;
  dm_note?: string;
  leads_to_scene_id?: string;
  sets_flag?: string;
  requires_flag?: string;
  created_at?: string;
}

export interface Playthrough {
  id: string;
  campaign_id: string;
  adventure_id: string;
  current_scene_id?: string;
  status: 'active' | 'completed' | 'abandoned';
  flags: Record<string, boolean>;
  started_at: string;
  updated_at: string;
}

export interface PlaythroughLogEntry {
  id: string;
  playthrough_id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

export interface PlayerSceneData {
  title?: string;
  player_text?: string;
  scene_type: 'narracion' | 'decision' | 'tirada' | 'combate' | 'descanso';
}

export interface PlayerOptionData {
  id: string;
  player_label: string;
}

export function toPlayerScene(scene: Scene): PlayerSceneData {
  return {
    title: scene.title,
    player_text: scene.player_text,
    scene_type: scene.scene_type,
  };
}

export function toPlayerOption(option: SceneOption): PlayerOptionData {
  return {
    id: option.id,
    player_label: option.player_label,
  };
}
