import { supabase } from './supabase';
import { abilityMod } from './combat-engine';

// --- Después del combate: vida, experiencia y niveles (reglas de 5e) ---

/** XP acumulado necesario para cada nivel (índice 0 = nivel 1). */
const XP_FOR_LEVEL = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

export const levelForXp = (xp: number): number => {
  let level = 1;
  XP_FOR_LEVEL.forEach((needed, i) => {
    if (xp >= needed) level = i + 1;
  });
  return level;
};

export const xpForNextLevel = (level: number): number | null => XP_FOR_LEVEL[level] ?? null;

const proficiencyFor = (level: number) => 2 + Math.floor((level - 1) / 4);

/** Promedio del dado de golpe por clase (valor fijo de 5e al subir de nivel). */
const HIT_DIE_AVERAGE: Record<string, number> = {
  'Bárbaro': 7,
  'Guerrero': 6, 'Paladín': 6, 'Explorador': 6,
  'Bardo': 5, 'Clérigo': 5, 'Druida': 5, 'Monje': 5, 'Pícaro': 5, 'Brujo': 5, 'Artificiero': 5,
  'Hechicero': 4, 'Mago': 4,
};

export interface Aftermath {
  resultado: 'victory' | 'defeat';
  xpTotal: number;
  xpEach: number;
  levelUps: { name: string; level: number; hpGain: number }[];
  stabilized: string[];
  dead: string[];
  warning?: string;
}

/**
 * Aplica las consecuencias del combate a los personajes de la campaña:
 * guarda su vida, los caídos quedan con 1 PV, reparte XP si ganaron y sube de nivel.
 * No corta el flujo si algo falla: devuelve un aviso.
 */
async function applyAftermath(
  playthroughId: string,
  sceneId: string,
  combatId: string | null,
  resultado: 'victory' | 'defeat',
): Promise<Aftermath> {
  const result: Aftermath = { resultado, xpTotal: 0, xpEach: 0, levelUps: [], stabilized: [], dead: [] };

  try {
    const { data: pt } = await supabase.from('playthroughs').select('campaign_id').eq('id', playthroughId).single();
    if (!pt?.campaign_id) return result;

    const { data: chars } = await supabase
      .from('characters')
      .select('id, character_name, character_class, level, xp, hp_current, hp_max, con')
      .eq('campaign_id', pt.campaign_id);
    const party = chars ?? [];
    if (party.length === 0) return result;

    // Vida al terminar el combate (si se jugó en pantalla).
    const hpByCharacter: Record<string, number> = {};
    const deadCharacters = new Set<string>();
    if (combatId) {
      const { data: parts } = await supabase
        .from('combat_participants')
        .select('character_id, hp_current, status')
        .eq('combat_id', combatId)
        .eq('is_player', true);
      (parts ?? []).forEach((p) => {
        if (!p.character_id) return;
        hpByCharacter[p.character_id] = p.hp_current;
        if (p.status === 'dead') deadCharacters.add(p.character_id);
      });
    }

    // XP del encuentro: se reparte en partes iguales solo si ganaron.
    if (resultado === 'victory') {
      const { data: scene } = await supabase.from('scenes').select('encounter').eq('id', sceneId).single();
      const enc = scene?.encounter as { bestiary_name?: string; count?: number } | null;
      if (enc?.bestiary_name) {
        const { data: monster } = await supabase
          .from('bestiary')
          .select('xp_value')
          .eq('name', enc.bestiary_name)
          .limit(1)
          .maybeSingle();
        result.xpTotal = (monster?.xp_value ?? 0) * (enc.count ?? 1);
        result.xpEach = Math.floor(result.xpTotal / party.length);
      }
    }

    for (const c of party) {
      const level = Math.max(1, c.level ?? 1);
      let hpMax = c.hp_max ?? 10;
      let hp = hpByCharacter[c.id] ?? c.hp_current ?? hpMax;

      // Quien murió en el combate queda muerto. Quien cayó sin morir se estabiliza con 1 PV.
      if (deadCharacters.has(c.id)) {
        result.dead.push(c.character_name);
        const { error } = await supabase.from('characters').update({ hp_current: 0 }).eq('id', c.id);
        if (error) result.warning = 'No se pudo guardar el estado de un personaje.';
        continue;
      }
      if (hp <= 0) {
        hp = 1;
        result.stabilized.push(c.character_name);
      }

      const xp = (c.xp ?? 0) + result.xpEach;
      const newLevel = Math.max(level, levelForXp(xp));
      const patch: Record<string, number> = { hp_current: Math.min(hp, hpMax), xp };

      if (newLevel > level) {
        const perLevel = Math.max(1, (HIT_DIE_AVERAGE[c.character_class ?? ''] ?? 5) + abilityMod(c.con));
        const hpGain = perLevel * (newLevel - level);
        hpMax += hpGain;
        patch.level = newLevel;
        patch.hp_max = hpMax;
        patch.hp_current = Math.min(hp + hpGain, hpMax);
        patch.proficiency_bonus = proficiencyFor(newLevel);
        result.levelUps.push({ name: c.character_name, level: newLevel, hpGain });
      }

      const { error } = await supabase.from('characters').update(patch).eq('id', c.id);
      if (error) result.warning = 'No se pudo guardar la vida o la experiencia de algún personaje.';
    }
  } catch {
    result.warning = 'No se pudieron aplicar las recompensas del combate.';
  }

  return result;
}

export async function cerrarCombate(
  playthroughId: string,
  sceneId: string,
  resultado: 'victory' | 'defeat',
  combatId: string,
): Promise<{ leads_to_scene_id: string; aftermath: Aftermath }> {
  // Un combate de una escena anterior no puede mover la historia hacia atrás ni dar XP dos veces.
  const { data: ptCheck } = await supabase
    .from('playthroughs')
    .select('current_scene_id')
    .eq('id', playthroughId)
    .single();
  if (ptCheck && ptCheck.current_scene_id !== sceneId) {
    await supabase.from('combats').update({ status: 'cancelled' }).eq('id', combatId);
    throw new Error(
      'Este combate era de una escena anterior y la aventura ya avanzó. Se archivó sin cambiar la historia.',
    );
  }

  const optionOrder = resultado === 'victory' ? 1 : 2;

  const { data: option, error: optionError } = await supabase
    .from('scene_options')
    .select('*')
    .eq('scene_id', sceneId)
    .eq('option_order', optionOrder)
    .single();

  if (optionError || !option) {
    throw new Error(
      `No existe opción de ${resultado} (order ${optionOrder}) en esta escena. Aventura mal escrita.`,
    );
  }

  if (!option.leads_to_scene_id) {
    throw new Error(`Opción de ${resultado} no tiene destino (leads_to_scene_id).`);
  }

  const { data: logRows, error: logError } = await supabase
    .from('playthrough_log')
    .insert({
      playthrough_id: playthroughId,
      scene_id: sceneId,
      entry_type: 'combat',
      content: {
        resultado,
        combat_id: combatId,
        option_id: option.id,
        leads_to_scene_id: option.leads_to_scene_id,
      },
    })
    .select();

  if (logError || !logRows || logRows.length === 0) {
    throw new Error('No se pudo escribir la entrada del combate en el log');
  }

  // Primero las recompensas y después el cambio de escena: así quien vea la escena nueva
  // ya ve la vida y la experiencia actualizadas.
  const aftermath = await applyAftermath(playthroughId, sceneId, combatId, resultado);

  const { data: playthroughData } = await supabase
    .from('playthroughs')
    .select('flags')
    .eq('id', playthroughId)
    .single();

  const flags = playthroughData?.flags || {};
  const newFlags = option.sets_flag ? { ...flags, [option.sets_flag]: true } : flags;

  const { data: updateRows, error: updateError } = await supabase
    .from('playthroughs')
    .update({
      current_scene_id: option.leads_to_scene_id,
      flags: newFlags,
      updated_at: new Date().toISOString(),
    })
    .eq('id', playthroughId)
    .select();

  if (updateError || !updateRows || updateRows.length === 0) {
    throw new Error('No se pudo actualizar el playthrough después del combate');
  }

  const statusToSet = resultado === 'victory' ? 'finished' : 'defeat';
  const { error: combatStatusError } = await supabase
    .from('combats')
    .update({ status: statusToSet })
    .eq('id', combatId)
    .select();

  if (combatStatusError) {
    throw new Error('No se pudo marcar el combate como terminado');
  }

  return { leads_to_scene_id: option.leads_to_scene_id, aftermath };
}

export async function cancelarCombate(
  playthroughId: string,
  sceneId: string,
  combatId: string,
): Promise<void> {
  const { data: logRows, error: logError } = await supabase
    .from('playthrough_log')
    .insert({
      playthrough_id: playthroughId,
      scene_id: sceneId,
      entry_type: 'note',
      content: {
        text: 'Combate cancelado',
      },
    })
    .select();

  if (logError || !logRows || logRows.length === 0) {
    throw new Error('No se pudo registrar la cancelación del combate en el log');
  }

  const { data: combatUpdateRows, error: combatError } = await supabase
    .from('combats')
    .update({ status: 'cancelled' })
    .eq('id', combatId)
    .select();

  if (combatError || !combatUpdateRows || combatUpdateRows.length === 0) {
    throw new Error('No se pudo marcar el combate como cancelado');
  }
}

export async function resolverCombateSinCombate(
  playthroughId: string,
  sceneId: string,
  resultado: 'victory' | 'defeat',
): Promise<{ leads_to_scene_id: string; aftermath: Aftermath }> {
  const optionOrder = resultado === 'victory' ? 1 : 2;

  const { data: option, error: optionError } = await supabase
    .from('scene_options')
    .select('*')
    .eq('scene_id', sceneId)
    .eq('option_order', optionOrder)
    .single();

  if (optionError || !option) {
    throw new Error(
      `No existe opción de ${resultado} (order ${optionOrder}) en esta escena.`,
    );
  }

  if (!option.leads_to_scene_id) {
    throw new Error(`Opción de ${resultado} no tiene destino (leads_to_scene_id).`);
  }

  const { data: logRows, error: logError } = await supabase
    .from('playthrough_log')
    .insert({
      playthrough_id: playthroughId,
      scene_id: sceneId,
      entry_type: 'combat',
      content: {
        resultado,
        combat_id: null,
        option_id: option.id,
        leads_to_scene_id: option.leads_to_scene_id,
      },
    })
    .select();

  if (logError || !logRows || logRows.length === 0) {
    throw new Error('No se pudo registrar la resolución manual en el log');
  }

  const aftermath = await applyAftermath(playthroughId, sceneId, null, resultado);

  const { data: playthroughData } = await supabase
    .from('playthroughs')
    .select('flags')
    .eq('id', playthroughId)
    .single();

  const flags = playthroughData?.flags || {};
  const newFlags = option.sets_flag ? { ...flags, [option.sets_flag]: true } : flags;

  const { data: updateRows, error: updateError } = await supabase
    .from('playthroughs')
    .update({
      current_scene_id: option.leads_to_scene_id,
      flags: newFlags,
      updated_at: new Date().toISOString(),
    })
    .eq('id', playthroughId)
    .select();

  if (updateError || !updateRows || updateRows.length === 0) {
    throw new Error('No se pudo actualizar el playthrough después de la resolución');
  }

  return { leads_to_scene_id: option.leads_to_scene_id, aftermath };
}
