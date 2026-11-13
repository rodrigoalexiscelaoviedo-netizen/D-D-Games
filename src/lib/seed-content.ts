import { supabase } from './supabase';

// DiceBear avatar URL generator
const getDiceBearAvatar = (name: string, style: 'avataaars' | 'pixel-art' = 'avataaars') => {
  const seed = encodeURIComponent(name);
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&scale=80`;
};

// Unsplash image URL generator
const getUnsplashImage = (query: string) => {
  const search = encodeURIComponent(query);
  return `https://source.unsplash.com/featured/800x600?${search}`;
};

// NPC data (en español; role y danger_level se mantienen en inglés como claves de la interfaz)
export const NPC_SEED_DATA = [
  // Personajes de la taberna
  {
    name: 'Berta la Posadera',
    title: 'Posadera',
    location: 'El Jabalí Dormido',
    description: 'Una posadera curtida pero amable, con ojo para los problemas.',
    role: 'Ally',
  },
  {
    name: 'Thorne Hierromano',
    title: 'Herrero',
    location: 'Plaza del Pueblo',
    description: 'Un herrero enano malhumorado, famoso por sus armas de calidad.',
    role: 'Merchant',
  },
  {
    name: 'Sylvara Susurroestelar',
    title: 'Maga',
    location: 'Torre Arcana',
    description: 'Una misteriosa maga elfa que comercia con objetos encantados.',
    role: 'Ally',
  },
  {
    name: 'Marcos el Bardo',
    title: 'Entretenedor',
    location: 'El Jabalí Dormido',
    description: 'Un bardo encantador con cuentos y canciones de aventuras.',
    role: 'Neutral',
  },
  {
    name: 'Capitán Vex',
    title: 'Guardia del pueblo',
    location: 'Torre de la Guardia',
    description: 'Capitán severo de la guardia del pueblo: estricto, pero justo.',
    role: 'Ally',
  },
  {
    name: 'Viejo Grimm',
    title: 'Sabio ermitaño',
    location: 'Borde del Bosque',
    description: 'Un sabio retraído que conoce magia antigua.',
    role: 'Ally',
  },
  {
    name: 'Lady Celestina',
    title: 'Noble',
    location: 'Castillo',
    description: 'Una noble elegante con influencia política.',
    role: 'Neutral',
  },
  {
    name: 'Krayg Rompehuesos',
    title: 'Mercenario orco',
    location: 'La Taberna Carmesí',
    description: 'Un temible guerrero orco que se alquila al mejor postor.',
    role: 'Neutral',
  },
  {
    name: 'Mira Pasosombra',
    title: 'Pícara',
    location: 'Callejones traseros',
    description: 'Una pícara astuta con contactos en el mundo bajo.',
    role: 'Neutral',
  },
  {
    name: 'Hermano Aldo',
    title: 'Clérigo',
    location: 'Templo de la Luz',
    description: 'Un clérigo devoto que ofrece curación y guía.',
    role: 'Ally',
  },
  {
    name: 'Céfiro Vientoveloz',
    title: 'Explorador',
    location: 'Bosques del Norte',
    description: 'Un guardabosques agudo y rastreador de la naturaleza.',
    role: 'Ally',
  },
  {
    name: 'Duquesa Morgana',
    title: 'Hechicera oscura',
    location: 'Fortaleza de las Sombras',
    description: 'Una hechicera poderosa y misteriosa de las artes oscuras.',
    role: 'Enemy',
  },
  {
    name: 'Grendak el Alquimista',
    title: 'Alquimista y boticario',
    location: 'Tienda de pociones',
    description: 'Un alquimista gnomo que crea pociones y elixires.',
    role: 'Merchant',
  },
  {
    name: 'Rayeth Dracónido',
    title: 'Paladín',
    location: 'Ciudadela Sagrada',
    description: 'Un noble paladín dracónido jurado a la justicia.',
    role: 'Ally',
  },
  {
    name: 'El Forastero Enmascarado',
    title: 'Personaje misterioso',
    location: 'Desconocido',
    description: 'Una figura misteriosa de intenciones desconocidas.',
    role: 'Neutral',
  },
];

// Location data (en español; danger_level se mantiene en inglés como clave de la interfaz)
export const LOCATION_SEED_DATA = [
  {
    name: 'El Jabalí Dormido',
    type: 'Taberna',
    description: 'Una acogedora taberna con buena cerveza y clientes interesantes.',
    danger_level: 'Low',
    features: 'Barra, Habitaciones privadas, Chimenea, Músicos',
  },
  {
    name: 'Sendero del Bosque Oscuro',
    type: 'Bosque',
    description: 'Un sendero misterioso con árboles antiguos.',
    danger_level: 'High',
    features: 'Árboles retorcidos, Ruinas ocultas, Fauna peligrosa',
  },
  {
    name: 'Cuevas de los Goblins',
    type: 'Mazmorra',
    description: 'Cavernas subterráneas habitadas por goblins.',
    danger_level: 'Very High',
    features: 'Muchas cámaras, Bóveda del tesoro, Trono goblin',
  },
  {
    name: 'Torre Arcana',
    type: 'Torre',
    description: 'Una torre mágica llena de encantamientos.',
    danger_level: 'Medium',
    features: 'Biblioteca, Laboratorio, Círculo de teletransporte',
  },
  {
    name: 'Templo de la Luz',
    type: 'Templo',
    description: 'Un templo sagrado dedicado a la curación y la sabiduría.',
    danger_level: 'Low',
    features: 'Altar, Biblioteca sagrada, Sala de curación',
  },
  {
    name: 'Fortaleza de las Sombras',
    type: 'Fortaleza',
    description: 'Una fortaleza oscura de origen misterioso.',
    danger_level: 'Extreme',
    features: 'Torres, Mazmorra, Salas rituales, Bóveda del tesoro',
  },
  {
    name: 'Mercado del Pueblo',
    type: 'Pueblo',
    description: 'Un mercado bullicioso en el centro del pueblo.',
    danger_level: 'Low',
    features: 'Puestos de comerciantes, Fuente, Plaza',
  },
  {
    name: 'Campamento de bandidos',
    type: 'Campamento',
    description: 'Un campamento oculto de forajidos y salteadores.',
    danger_level: 'High',
    features: 'Tiendas, Fogata, Escondite del botín, Puestos de vigía',
  },
  {
    name: 'Ruinas élficas',
    type: 'Ruinas',
    description: 'Ruinas antiguas de una civilización élfica perdida.',
    danger_level: 'Medium',
    features: 'Pilares, Murales, Artefactos antiguos, Pasadizos secretos',
  },
  {
    name: 'Guarida del Dragón',
    type: 'Cueva',
    description: 'La guarida de un dragón poderoso.',
    danger_level: 'Extreme',
    features: 'Cueva enorme, Montón de oro, Trampas de calor, Trono del dragón',
  },
  {
    name: 'Cabaña de la Bruja',
    type: 'Casa',
    description: 'Una peculiar cabaña en el bosque.',
    danger_level: 'High',
    features: 'Estantes de pociones, Caldero, Libros de hechizos, Hierbas extrañas',
  },
  {
    name: 'Paso de Montaña',
    type: 'Terreno salvaje',
    description: 'Un paso de montaña traicionero entre picos.',
    danger_level: 'High',
    features: 'Senda estrecha, Acantilados, Riesgo de aludes, Sistema de cuevas',
  },
  {
    name: 'Ciudad Hundida',
    type: 'Bajo el agua',
    description: 'Una antigua ciudad sumergida bajo las olas.',
    danger_level: 'Very High',
    features: 'Edificios de piedra, Jardines de coral, Bolsas de aire, Tesoro',
  },
  {
    name: 'Mansión Embrujada',
    type: 'Casa',
    description: 'Una gran mansión plagada de espíritus.',
    danger_level: 'Medium',
    features: 'Gran salón, Biblioteca, Dormitorios, Sótano',
  },
  {
    name: 'Cripta de los Antiguos',
    type: 'Tumba',
    description: 'Un antiguo cementerio de reyes olvidados.',
    danger_level: 'Very High',
    features: 'Sarcófagos, Trampas, No muertos, Tesoros antiguos',
  },
  {
    name: 'Camino de los Mercaderes',
    type: 'Camino',
    description: 'Una gran ruta comercial entre ciudades.',
    danger_level: 'Medium',
    features: 'Paradas de caravanas, Posadas, Puentes, Encrucijadas',
  },
  {
    name: 'Guarida de la Bestia',
    type: 'Cueva',
    description: 'La guarida de una bestia terrible.',
    danger_level: 'Very High',
    features: 'Formaciones de roca, Manchas de sangre, Huesos, Montón de tesoro',
  },
  {
    name: 'Academia Mágica',
    type: 'Edificio',
    description: 'Una institución para formar jóvenes magos.',
    danger_level: 'Low',
    features: 'Aulas, Biblioteca, Dormitorios, Laboratorios',
  },
  {
    name: 'Ciudad Subterránea',
    type: 'Ciudad',
    description: 'Una vasta ciudad enana en lo profundo de la tierra.',
    danger_level: 'Low',
    features: 'Mercados, Forjas, Tabernas, Sala del trono',
  },
  {
    name: 'Pantano Maldito',
    type: 'Pantano',
    description: 'Un pantano turbio lleno de magia extraña.',
    danger_level: 'High',
    features: 'Agua turbia, Árboles retorcidos, Arenas movedizas, Ruinas',
  },
];
// Seed NPCs to Supabase
export async function seedNPCs() {
  try {
    const npcs = NPC_SEED_DATA.map((npc) => ({
      ...npc,
      avatar_url: getDiceBearAvatar(npc.name, 'avataaars'),
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('npcs').insert(npcs);
    if (error) throw error;

    console.log(`✅ Seeded ${npcs.length} NPCs`);
    return npcs;
  } catch (error) {
    console.error('Error seeding NPCs:', error);
    throw error;
  }
}

// Seed Locations to Supabase
export async function seedLocations() {
  try {
    const locations = LOCATION_SEED_DATA.map((location) => ({
      ...location,
      image_url: getUnsplashImage(`${location.type} ${location.name}`),
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('locations').insert(locations);
    if (error) throw error;

    console.log(`✅ Seeded ${locations.length} locations`);
    return locations;
  } catch (error) {
    console.error('Error seeding locations:', error);
    throw error;
  }
}

// Utility: Add avatar to creatures
export async function addAvatarToCreatures() {
  try {
    const { data: creatures, error: fetchError } = await supabase
      .from('creatures')
      .select('id, name')
      .limit(100);

    if (fetchError) throw fetchError;

    for (const creature of creatures || []) {
      const imageUrl = getUnsplashImage(creature.name);
      const { error } = await supabase
        .from('creatures')
        .update({ avatar_url: imageUrl })
        .eq('id', creature.id);

      if (error) console.error(`Error updating ${creature.name}:`, error);
    }

    console.log('✅ Added avatars to creatures');
  } catch (error) {
    console.error('Error adding avatars:', error);
    throw error;
  }
}

// Utility: DiceBear avatar generator
export const AvatarGenerator = {
  human: (name: string) => getDiceBearAvatar(name, 'avataaars'),
  pixel: (name: string) => getDiceBearAvatar(name, 'pixel-art'),
  getUrl: (name: string, style: 'avataaars' | 'pixel-art' = 'avataaars') =>
    getDiceBearAvatar(name, style),
};

// Utility: Image getters
export const ImageGenerator = {
  creature: (name: string) => getUnsplashImage(name),
  location: (name: string, type: string) => getUnsplashImage(`${type} ${name}`),
  npc: (name: string) => getDiceBearAvatar(name),
  character: (name: string) => getDiceBearAvatar(name),
};
