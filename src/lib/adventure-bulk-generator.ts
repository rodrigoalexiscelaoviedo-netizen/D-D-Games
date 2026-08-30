import { supabase } from './supabase';
import { generateAdventureWithGemini } from './adventure-generator';

export interface AdventureTemplate {
  title: string;
  synopsis: string;
  level: number;
  numScenes: number;
  duration: string;
}

const ADVENTURE_TEMPLATES: AdventureTemplate[] = [
  {
    title: 'El sótano de la posada',
    synopsis: 'Berta, posadera de El Jabalí Dormido, tiene un problema: alguien está robándose sus mejores bebidas. Los goblins son culpables, pero este es solo el comienzo.',
    level: 1,
    numScenes: 6,
    duration: '45-60 minutos',
  },
  {
    title: 'El bosque del norte',
    synopsis: 'Un mercader busca algo que su padre perdió hace años. Goblins que escaparon son la clave. Ruinas antiguas guardan secretos oscuros.',
    level: 2,
    numScenes: 6,
    duration: '60-90 minutos',
  },
  {
    title: 'La mina abandonada',
    synopsis: 'Una aldea necesita rescatar mineros atrapados. Las cavernas son peligrosas y algo acecha en la oscuridad.',
    level: 2,
    numScenes: 5,
    duration: '45-60 minutos',
  },
  {
    title: 'El templo perdido',
    synopsis: 'Ruinas antiguas ocultan un artefacto misterioso. Puzles mágicos y guardianes esperan.',
    level: 3,
    numScenes: 7,
    duration: '90-120 minutos',
  },
  {
    title: 'La aldea embrujada',
    synopsis: 'Un pueblo desaparece misteriosamente. Investigación revela una maldición antigua.',
    level: 3,
    numScenes: 6,
    duration: '60-90 minutos',
  },
  {
    title: 'Bandidos en el camino',
    synopsis: 'Un viaje peligroso por una ruta conocida por bandidos. Posibilidad de diplomacia o combate.',
    level: 1,
    numScenes: 4,
    duration: '30-45 minutos',
  },
  {
    title: 'El carnaval misterioso',
    synopsis: 'Un carnaval llega a la ciudad con entretenimiento extraño. Secretos oscuros se revelan.',
    level: 2,
    numScenes: 5,
    duration: '45-60 minutos',
  },
  {
    title: 'La torre del mago',
    synopsis: 'Una torre abandonada contiene tesoros y peligros arcanos. El mago ha desaparecido.',
    level: 3,
    numScenes: 6,
    duration: '60-75 minutos',
  },
  {
    title: 'Rescate en el castillo',
    synopsis: 'Un noble importante es tomado prisionero. Infiltración o ataque frontal en la fortaleza.',
    level: 4,
    numScenes: 7,
    duration: '90-120 minutos',
  },
  {
    title: 'Los Dragones del Valle',
    synopsis: 'Un valle controlado por dragones ofrece oportunidades y peligros extremos.',
    level: 5,
    numScenes: 8,
    duration: '120-150 minutos',
  },
];

export async function generateBulkAdventures(
  onProgress?: (current: number, total: number, name: string) => void
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < ADVENTURE_TEMPLATES.length; i++) {
    const template = ADVENTURE_TEMPLATES[i];
    onProgress?.(i + 1, ADVENTURE_TEMPLATES.length, template.title);

    try {
      console.log(`Generating: ${template.title}...`);

      // Generate adventure with Gemini
      const generated = await generateAdventureWithGemini(
        template.title,
        template.synopsis,
        template.level,
        template.numScenes
      );

      if (!generated?.scenes || generated.scenes.length === 0) {
        throw new Error('No scenes generated');
      }

      // Insert adventure
      const { data: adventure, error: advError } = await supabase
        .from('adventures')
        .insert({
          title: template.title,
          synopsis: template.synopsis,
          suggested_level: template.level,
          duration: template.duration,
          scene_count: generated.scenes.length,
          created_at: new Date().toISOString(),
        })
        .select();

      if (advError || !adventure || adventure.length === 0) {
        throw new Error(`Adventure insert failed: ${advError?.message}`);
      }

      const adventureId = adventure[0].id;

      // Insert scenes
      const sceneRows = generated.scenes.map((scene, idx) => ({
        adventure_id: adventureId,
        scene_order: idx + 1,
        title: scene.title,
        dm_text: scene.dm_text,
        player_text: scene.player_text,
        encounter_text: scene.encounter ? JSON.stringify(scene.encounter) : null,
      }));

      const { error: sceneError } = await supabase.from('scenes').insert(sceneRows);

      if (sceneError) {
        throw new Error(`Scenes insert failed: ${sceneError.message}`);
      }

      success++;
      console.log(`✓ ${template.title} (${generated.scenes.length} scenes)`);
    } catch (error) {
      failed++;
      const msg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`${template.title}: ${msg}`);
      console.error(`✗ ${template.title}: ${msg}`);
    }
  }

  return { success, failed, errors };
}

export async function getGeneratedAdventures() {
  try {
    const { data, error } = await supabase
      .from('adventures')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching adventures:', error);
    return [];
  }
}
