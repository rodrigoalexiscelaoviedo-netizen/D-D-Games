// Héroes listos para jugar: se eligen de una galería y se añaden a la campaña
// con un clic. Estadísticas de nivel 1 (SRD 5.1), con modificadores ya aplicados
// a la raza. Retratos en /public/heroes (ver CREDITOS.md).

export interface PremadeHero {
  id: string;
  name: string;
  race: string;
  class: string;
  background: string;
  blurb: string;
  portrait: string;
  str: number; dex: number; con: number; int: number; wis: number; cha: number;
  armor_class: number;
  hp: number;
  speed: number;
}

export const PREMADE_HEROES: PremadeHero[] = [
  {
    id: 'lyra', name: 'Lyra Vance', race: 'Humano', class: 'Guerrero', background: 'Soldado',
    blurb: 'Veterana de la guardia de la frontera. Tranquila bajo presión, siempre al frente.',
    portrait: '/heroes/lyra.jpg',
    str: 16, dex: 13, con: 15, int: 10, wis: 12, cha: 9,
    armor_class: 16, hp: 12, speed: 30,
  },
  {
    id: 'elowen', name: 'Elowen Sylvaris', race: 'Elfo', class: 'Mago', background: 'Erudito',
    blurb: 'Estudió en una torre de biblioteca. Curiosa, llena de hechizos y de preguntas.',
    portrait: '/heroes/elowen.jpg',
    str: 8, dex: 14, con: 12, int: 16, wis: 12, cha: 10,
    armor_class: 12, hp: 7, speed: 30,
  },
  {
    id: 'brannoc', name: 'Brannoc Ironhelm', race: 'Enano', class: 'Clérigo', background: 'Acólito',
    blurb: 'Sacerdote de la forja. Cura a sus compañeros y no olvida a quien le debe algo.',
    portrait: '/heroes/brannoc.jpg',
    str: 14, dex: 10, con: 14, int: 8, wis: 16, cha: 10,
    armor_class: 18, hp: 11, speed: 25,
  },
  {
    id: 'pip', name: 'Pip Tallowell', race: 'Mediano', class: 'Pícaro', background: 'Criminal',
    blurb: 'Pequeño, rápido y con buenas manos. Sabe entrar y salir sin que nadie lo note.',
    portrait: '/heroes/pip.jpg',
    str: 8, dex: 17, con: 12, int: 12, wis: 10, cha: 14,
    armor_class: 15, hp: 9, speed: 25,
  },
  {
    id: 'grumm', name: 'Grumm Ashbrand', race: 'Semiorco', class: 'Bárbaro', background: 'Forastero',
    blurb: 'Crecido en las montañas. Ruge antes de atacar y protege a los débiles.',
    portrait: '/heroes/grumm.jpg',
    str: 17, dex: 13, con: 16, int: 8, wis: 10, cha: 8,
    armor_class: 14, hp: 15, speed: 30,
  },
  {
    id: 'aldric', name: 'Aldric Dawnward', race: 'Humano', class: 'Paladín', background: 'Noble',
    blurb: 'Juró proteger al inocente. Su armadura brilla más cuando el peligro es mayor.',
    portrait: '/heroes/aldric.jpg',
    str: 16, dex: 8, con: 14, int: 8, wis: 10, cha: 14,
    armor_class: 18, hp: 12, speed: 30,
  },
  {
    id: 'sylva', name: 'Sylva Greenmantle', race: 'Elfo', class: 'Explorador', background: 'Guía',
    blurb: 'Rastrea en silencio y conoce cada sendero del bosque. Su arco nunca falla mucho.',
    portrait: '/heroes/sylva.jpg',
    str: 10, dex: 16, con: 12, int: 10, wis: 14, cha: 8,
    armor_class: 14, hp: 11, speed: 30,
  },
  {
    id: 'tilo', name: 'Tilo Brightwhistle', race: 'Gnomo', class: 'Bardo', background: 'Artista',
    blurb: 'Canta para unir a la gente y convence a cualquiera con una buena historia.',
    portrait: '/heroes/tilo.jpg',
    str: 8, dex: 14, con: 12, int: 12, wis: 10, cha: 16,
    armor_class: 13, hp: 9, speed: 25,
  },
];
