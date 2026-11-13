import { supabase } from './supabase';
import type { AdventureModule } from '../content/modules/types';
import { moduleOrigin } from '../content/modules';

export interface InstallResult {
  adventureId: string;
  alreadyInstalled: boolean;
  monstersAdded: string[];
}

export async function findInstalledAdventureId(mod: AdventureModule): Promise<string | null> {
  const { data, error } = await supabase
    .from('adventures')
    .select('id')
    .eq('origin', moduleOrigin(mod.slug))
    .limit(1);
  if (error) throw new Error(`No se pudo consultar aventuras: ${error.message}`);
  return data && data.length > 0 ? data[0].id : null;
}

/** Crea en el bestiario los monstruos del módulo que no existan (por nombre exacto). */
async function ensureMonsters(mod: AdventureModule, userId: string): Promise<string[]> {
  const added: string[] = [];
  for (const m of mod.monsters) {
    const { data: existing, error } = await supabase.from('bestiary').select('id').eq('name', m.name);
    if (error) throw new Error(`No se pudo consultar el bestiario: ${error.message}`);
    if (existing && existing.length > 0) continue;

    const { error: insertError } = await supabase.from('bestiary').insert({
      ...m,
      source: 'module',
      user_id: userId,
    });
    if (insertError) throw new Error(`No se pudo crear "${m.name}" en el bestiario: ${insertError.message}`);
    added.push(m.name);
  }
  return added;
}

export async function installModule(mod: AdventureModule, userId: string): Promise<InstallResult> {
  // Orden: aventura → escenas → opciones → monstruos. Si algo falla antes de
  // los monstruos, no queda nada suelto en el bestiario (se revierte la aventura).
  const installedId = await findInstalledAdventureId(mod);
  if (installedId) {
    const monstersAdded = await ensureMonsters(mod, userId);
    return { adventureId: installedId, alreadyInstalled: true, monstersAdded };
  }

  const { data: adv, error: advError } = await supabase
    .from('adventures')
    .insert({
      title: mod.title,
      synopsis: mod.synopsis,
      suggested_level: mod.level,
      author: 'D&D VTT · módulo original',
      origin: moduleOrigin(mod.slug),
      user_id: userId,
    })
    .select('id')
    .single();
  if (advError || !adv) throw new Error(`No se pudo crear la aventura: ${advError?.message ?? 'sin datos'}`);

  const rollback = async () => {
    const { data: created } = await supabase.from('scenes').select('id').eq('adventure_id', adv.id);
    const sceneIds = (created ?? []).map((s) => s.id);
    if (sceneIds.length > 0) await supabase.from('scene_options').delete().in('scene_id', sceneIds);
    await supabase.from('scenes').delete().eq('adventure_id', adv.id);
    await supabase.from('adventures').delete().eq('id', adv.id);
  };

  try {
    const { data: scenes, error: sceneError } = await supabase
      .from('scenes')
      .insert(
        mod.scenes.map((s) => ({
          adventure_id: adv.id,
          scene_order: s.order,
          scene_type: s.type,
          title: s.title,
          dm_text: s.dmText,
          player_text: s.readAloud,
          encounter: s.encounter
            ? { bestiary_name: s.encounter.monster, count: s.encounter.count, note: s.encounter.note }
            : null,
        })),
      )
      .select('id, scene_order');
    if (sceneError || !scenes) throw new Error(`No se pudieron crear las escenas: ${sceneError?.message ?? 'sin datos'}`);

    const idByOrder = new Map(scenes.map((s) => [s.scene_order as number, s.id as string]));
    const idByKey = new Map(mod.scenes.map((s) => [s.key, idByOrder.get(s.order)]));

    const options = mod.scenes.flatMap((s) =>
      s.options.map((o, i) => ({
        scene_id: idByKey.get(s.key),
        option_order: i + 1,
        player_label: o.label,
        dm_note: o.dmNote ?? null,
        leads_to_scene_id: o.to ? idByKey.get(o.to) ?? null : null,
        sets_flag: o.setsFlag ?? null,
        requires_flag: o.requiresFlag ?? null,
      })),
    );
    if (options.length > 0) {
      const { error: optError } = await supabase.from('scene_options').insert(options);
      if (optError) throw new Error(`No se pudieron crear las opciones: ${optError.message}`);
    }
  } catch (err) {
    await rollback();
    throw err;
  }

  // Solo después de crear todo bien, agregamos los monstruos que falten.
  const monstersAdded = await ensureMonsters(mod, userId);
  return { adventureId: adv.id, alreadyInstalled: false, monstersAdded };
}
