import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface Quest {
  title: string;
  description: string;
  giver: string;
  reward: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Deadly';
  objectives: string[];
  hooks: string[];
}

export async function generateQuestHook(
  theme: string,
  level: number,
  location: string
): Promise<Quest> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Generate a D&D quest hook in Spanish. Return ONLY valid JSON with this structure:
{
  "title": "Quest title",
  "description": "2-3 paragraph description of the quest",
  "giver": "NPC name who gives the quest",
  "reward": "Gold and/or experience",
  "difficulty": "Easy|Medium|Hard|Deadly",
  "objectives": ["objective 1", "objective 2", "objective 3"],
  "hooks": ["Story hook 1", "Story hook 2", "Story hook 3"]
}

Theme: ${theme}
Level: ${level}
Location: ${location}

Requirements:
- All text in Spanish
- 3-4 objectives
- 3 compelling story hooks
- Difficulty appropriate to party level ${level}
- Location: ${location}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let jsonStr = text;
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '');
    }

    const quest = JSON.parse(jsonStr.trim()) as Quest;
    return quest;
  } catch (error) {
    console.error('Error generating quest:', error);
    throw new Error('Failed to generate quest. Check API key.');
  }
}

export async function generateMultipleQuests(
  count: number,
  level: number,
  theme: string
): Promise<Quest[]> {
  const locations = [
    'Taverna local',
    'Castillo del señor',
    'Dungeon subterráneo',
    'Bosque antiguo',
    'Ciudad amurallada',
    'Torre mágica',
    'Ruinas olvidadas',
    'Cueva del dragón',
  ];

  const quests: Quest[] = [];
  for (let i = 0; i < count; i++) {
    try {
      const location = locations[Math.floor(Math.random() * locations.length)];
      const quest = await generateQuestHook(theme, level, location);
      quests.push(quest);
      console.log(`✓ Generated quest ${i + 1}/${count}: ${quest.title}`);
    } catch (error) {
      console.error(`Failed to generate quest ${i + 1}:`, error);
    }
  }

  return quests;
}

// Pre-made quest hooks for quick use
export const QUEST_TEMPLATES: Quest[] = [
  {
    title: 'El Tesoro Perdido',
    description: 'Un viejo mapa aparece en vuestras manos. Un mercader misterioso dice que llevan a un tesoro enterrado hace siglos. ¿Lo buscarán?',
    giver: 'Mercader Misterioso',
    reward: '500 gp + items mágicos',
    difficulty: 'Medium',
    objectives: [
      'Obtener el mapa completo',
      'Viajar al lugar marcado',
      'Resolver los puzles de la cripta',
      'Regresar con el tesoro',
    ],
    hooks: [
      'El mapa está maldito y cambia cada luna nueva',
      'Otros aventureros buscan el mismo tesoro',
      'El mercader mentía sobre el verdadero contenido',
    ],
  },
  {
    title: 'La Aldea Desaparecida',
    description: 'Una aldea entera ha desaparecido sin dejar rastro. Los supervivientes mencionan sombras extrañas y gritos en la noche.',
    giver: 'Guardia Real',
    reward: '300 gp + recompensa oficial',
    difficulty: 'Hard',
    objectives: [
      'Investigar la aldea',
      'Encontrar a los supervivientes',
      'Descubrir qué causó la desaparición',
      'Prevenir que suceda de nuevo',
    ],
    hooks: [
      'Los aldeanos no quieren ser rescatados',
      'Una criatura antigua despierta bajo el pueblo',
      'Los supervivientes nunca envejecen',
    ],
  },
  {
    title: 'Encargo del Gremio',
    description: 'El gremio de aventureros necesita trabajos completados. Varios trabajos pequeños pero lucrativos esperan en el tablón.',
    giver: 'Maestra del Gremio',
    reward: '100-500 gp según dificultad',
    difficulty: 'Easy',
    objectives: [
      'Completar el trabajo asignado',
      'Traer prueba de finalización',
      'Recibir pago',
    ],
    hooks: [
      'El trabajo es más peligroso de lo que parece',
      'Otros aventureros también aceptaron el mismo trabajo',
      'El pago oculta información importante',
    ],
  },
];
