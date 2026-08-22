export const COMBAT_ACTIONS = [
  { id: 'attack', label: '⚔️ Atacar', description: 'Tira d20 vs. CA del enemigo' },
  { id: 'spell', label: '✨ Hechizo', description: 'Lanza un hechizo' },
  { id: 'defend', label: '🛡️ Defenderse', description: '+2 CA hasta tu próximo turno' },
  { id: 'flee', label: '🏃 Huir', description: 'Intenta escapar' },
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
  'Guerrero': '💪 Tu fuerza es atacar. Tira con ventaja si tienes posición.',
  'Mago': '✨ Usa hechizos para control. Mantente atrás del combate.',
  'Clérigo': '⛪ Heals cuando alguien cae bajo 50% HP. Ataca con desventaja si estás sin escudo.',
  'Pícaro': '🗡️ Tu fuerza es el sigilo y criticalidad. Tira con ventaja si no eres visto.',
  'Brujo': '👹 Tus hechizos son poderosos pero limitados. Usa tus slots con cuidado.',
  'Bárbaro': '💢 Entra en cólera. Tira con ventaja mientras estés furioso.',
  'Paladín': '⚡ Tu aura protege. Puedes tomar daño por aliados.',
  'Artificiero': '⚙️ Usa tus aparatos. Tira d20 con ventaja si preparaste la batalla.',
  'Bardo': '🎭 Tus palabras importan. Puedes dar ventaja a aliados.',
  'Explorador': '🏹 Tu presa es tu ventaja. Tira con ventaja contra enemigos que cazas.',
  'Monje': '🥋 Tu cuerpo es tu arma. Puedes atacar dos veces si tienes movimiento.',
  'Hechicero': '🔥 Tus hechizos innatos no consumen slots. Úsalos sin miedo.',
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
