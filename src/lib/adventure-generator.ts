import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Scene, SceneOption } from './adventure-types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

interface GeneratedAdventure {
  scenes: Scene[];
  sceneOptions: SceneOption[];
}

export async function generateAdventureWithGemini(
  title: string,
  synopsis: string,
  level: number,
  numScenes: number
): Promise<GeneratedAdventure> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a D&D adventure designer. Generate a complete D&D adventure in JSON format.

Adventure Brief:
- Title: ${title}
- Synopsis: ${synopsis}
- Suggested Level: ${level}
- Number of Scenes: ${numScenes}

Return ONLY a valid JSON object (no markdown, no code block) with this exact structure:
{
  "scenes": [
    {
      "scene_order": 1,
      "scene_type": "narracion|decision|tirada|combate|descanso",
      "title": "Scene Title",
      "dm_text": "DM narration (Spanish, 2-3 paragraphs)",
      "player_text": "Player description visible to them",
      "encounter": null  // or { "bestiary_name": "monster name", "count": number, "note": "optional" }
    }
  ],
  "options": [
    {
      "scene_id_index": 0,  // Index into scenes array
      "option_order": 1,
      "player_label": "What player can do/say",
      "dm_note": "Optional DM guidance",
      "leads_to_scene_index": 1,  // Index into scenes array or null for end
      "sets_flag": null  // or "flag_name"
    }
  ]
}

Requirements:
- All text in Spanish
- Mix scene types: start with narracion, include decision points, 1-2 combate scenes
- Each scene should be 2-4 paragraphs of engaging narrative
- Include ${numScenes} scenes total
- Provide 2-3 decision options per scene
- Make it suitable for level ${level} players
- End with a meaningful conclusion scene
- scene_type must be one of: narracion, decision, tirada, combate, descanso`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON from response
    let jsonStr = responseText;

    // Remove markdown code block if present
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(jsonStr.trim());

    // Transform to app format
    const scenes: Scene[] = parsed.scenes.map((s: any, idx: number) => ({
      id: `gen-scene-${idx}`,
      adventure_id: 'temp',
      scene_order: s.scene_order || idx + 1,
      scene_type: s.scene_type as any,
      title: s.title,
      dm_text: s.dm_text,
      player_text: s.player_text || s.dm_text,
      encounter: s.encounter,
      created_at: new Date().toISOString(),
    }));

    const sceneOptions: SceneOption[] = (parsed.options || []).map((o: any) => {
      const targetSceneId = o.leads_to_scene_index !== null
        ? `gen-scene-${o.leads_to_scene_index}`
        : null;

      return {
        id: `gen-option-${Math.random()}`,
        scene_id: `gen-scene-${o.scene_id_index}`,
        option_order: o.option_order || 1,
        player_label: o.player_label,
        dm_note: o.dm_note,
        leads_to_scene_id: targetSceneId,
        sets_flag: o.sets_flag,
        requires_flag: undefined,
        created_at: new Date().toISOString(),
      };
    });

    return { scenes, sceneOptions };
  } catch (error) {
    console.error('Error generating adventure:', error);
    throw new Error('Failed to generate adventure. Check API key and try again.');
  }
}
