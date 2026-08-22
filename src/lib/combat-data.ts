export const COMBAT_ACTIONS = [
  { id: 'attack', label: '⚔️ Atacar', description: 'Tira d20 vs. CA del enemigo', icon: '⚔️' },
  { id: 'spell', label: '✨ Hechizo', description: 'Lanza un hechizo', icon: '✨' },
  { id: 'defend', label: '🛡️ Defenderse', description: '+2 CA hasta tu próximo turno', icon: '🛡️' },
  { id: 'flee', label: '🏃 Huir', description: 'Intenta escapar', icon: '🏃' },
  { id: 'help', label: '👥 Ayudar', description: 'Un aliado tira con ventaja', icon: '👥' },
];

export const DAMAGE_TYPES = ['Arma cuerpo a cuerpo', 'Arco', 'Magia', 'Veneno'];

export const WEAPON_DAMAGE: Record<string, { dice: string; modifier: number }> = {
  'Espada larga': { dice: 'd8', modifier: 0 },
  'Hacha': { dice: 'd8', modifier: 0 },
  'Daga': { dice: 'd4', modifier: 0 },
  'Arco largo': { dice: 'd8', modifier: 0 },
  'Proyectil mágico': { dice: 'd4', modifier: 2 },
};

export const CLASS_COMBAT_TIPS: Record<string, string> = {
  'Guerrero': '💪 Tu fuerza es atacar. Si estás bajo 50% HP, defiéndete.',
  'Mago': '✨ Hechizos de control. Mantente atrás. Si atacan, sube CA.',
  'Clérigo': '⛪ Heals cuando alguien cae bajo 50% HP. Ataca si es seguro.',
  'Pícaro': '🗡️ Críticos son tu fuerza. Tira con ventaja si tienes posición.',
  'Brujo': '👹 Hechizos poderosos pero limitados. Ataca si se agotan.',
  'Bárbaro': '💢 Entra en cólera. Tira con ventaja. Absorbe daño.',
  'Paladín': '⚡ Tu aura protege. Puedes tomar daño por aliados cercanos.',
  'Artificiero': '⚙️ Tus aparatos son fuertes. Úsalos cada turno.',
  'Bardo': '🎭 Inspira aliados. Tira Persuasión antes de atacar.',
  'Explorador': '🏹 Ataca desde atrás. Crítico si el enemigo no te ve.',
  'Monje': '🥋 Muévete rápido. Ataca dos veces si puedes.',
  'Hechicero': '🔥 Hechizos innatos sin límite. Úsalos sin miedo.',
};

export const CLASS_DAMAGE: Record<string, { base: number; scaling: string }> = {
  'Guerrero': { base: 8, scaling: 'FUE' },
  'Mago': { base: 4, scaling: 'INT' },
  'Clérigo': { base: 6, scaling: 'SAB' },
  'Pícaro': { base: 6, scaling: 'DES' },
  'Brujo': { base: 6, scaling: 'CAR' },
  'Bárbaro': { base: 12, scaling: 'FUE' },
  'Paladín': { base: 8, scaling: 'FUE' },
  'Artificiero': { base: 4, scaling: 'INT' },
  'Bardo': { base: 4, scaling: 'CAR' },
  'Explorador': { base: 8, scaling: 'DES' },
  'Monje': { base: 6, scaling: 'DES' },
  'Hechicero': { base: 6, scaling: 'CAR' },
};

export const ENEMY_AI_BEHAVIOR = {
  'low_hp': 'Si HP < 25%, intenta huir o defenderse',
  'allies_down': 'Si quedan menos enemigos, ataca al más débil',
  'outnumbered': 'Si están en desventaja numérica, huye o pide tregua',
  'facing_mage': 'Si hay mago suelto, prioriza atacarlo',
};

export const RARITY_COLORS: Record<string, string> = {
  'common': '#6b7280',
  'uncommon': '#22c55e',
  'rare': '#3b82f6',
  'very_rare': '#a855f7',
  'legendary': '#f59e0b',
};

export const LOOT_TABLES = {
  'goblin': [
    { name: 'Monedas de oro', quantity: 5, rarity: 'common' },
    { name: 'Daga oxidada', quantity: 1, rarity: 'common' },
    { name: 'Poción menor de curación', quantity: 1, rarity: 'uncommon' },
  ],
  'dragon': [
    { name: 'Lingote de oro', quantity: 10, rarity: 'rare' },
    { name: 'Gema de rubí', quantity: 1, rarity: 'rare' },
    { name: 'Armadura de dragón (pieza)', quantity: 1, rarity: 'very_rare' },
  ],
};

export const COMBAT_SOUNDS = {
  'roll_dice': 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  'hit': 'https://assets.mixkit.co/active_storage/sfx/2806/2806-preview.mp3',
  'critical': 'https://assets.mixkit.co/active_storage/sfx/2814/2814-preview.mp3',
  'miss': 'https://assets.mixkit.co/active_storage/sfx/2873/2873-preview.mp3',
  'heal': 'https://assets.mixkit.co/active_storage/sfx/2809/2809-preview.mp3',
  'level_up': 'https://assets.mixkit.co/active_storage/sfx/2854/2854-preview.mp3',
};

export const COMBAT_THEMES = [
  { id: 'medieval', name: '⚔️ Medieval', bg: 'linear-gradient(135deg, #1a0f0a 0%, #3a2a1f 100%)' },
  { id: 'dark_forest', name: '🌲 Bosque Oscuro', bg: 'linear-gradient(135deg, #0a1f0a 0%, #1a3a1a 100%)' },
  { id: 'dungeon', name: '🏰 Mazmorra', bg: 'linear-gradient(135deg, #2a1010 0%, #1a0a0a 100%)' },
  { id: 'tavern', name: '🍺 Taberna', bg: 'linear-gradient(135deg, #3a2a0f 0%, #4a3a1f 100%)' },
  { id: 'magical', name: '✨ Mágico', bg: 'linear-gradient(135deg, #1a0a3a 0%, #3a1a5a 100%)' },
];

export const CLASS_ABILITIES = {
  'Guerrero': [
    { name: 'Second Wind', cost: '1 bonus action', effect: 'Cura 1d10 + nivel' },
    { name: 'Action Surge', cost: '1 action', effect: 'Ataca nuevamente este turno' },
  ],
  'Mago': [
    { name: 'Spell Recovery', cost: '1 long rest', effect: 'Recupera un hechizo gastado' },
  ],
  'Clérigo': [
    { name: 'Channel Divinity', cost: '1 action', effect: 'Todos aliados cerca cura 2d6' },
  ],
};
