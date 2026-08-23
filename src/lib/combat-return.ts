import { supabase } from './supabase';

export async function cerrarCombate(
  playthroughId: string,
  sceneId: string,
  resultado: 'victoria' | 'derrota',
  combatId: string,
): Promise<{ leads_to_scene_id: string }> {
  const optionOrder = resultado === 'victoria' ? 1 : 2;

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

  const { error: combatStatusError } = await supabase
    .from('combats')
    .update({ status: 'completed' })
    .eq('id', combatId)
    .select();

  if (combatStatusError) {
    throw new Error('No se pudo marcar el combate como terminado');
  }

  return { leads_to_scene_id: option.leads_to_scene_id };
}
