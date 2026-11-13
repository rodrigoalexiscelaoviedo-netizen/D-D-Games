// Character avatar builder and customization system

export type Species = 'human' | 'elf' | 'dwarf' | 'halfling' | 'dragonborn' | 'tiefling' | 'gnome' | 'half-orc';
export type Gender = 'male' | 'female' | 'non-binary';
export type SkinTone = 'pale' | 'fair' | 'medium' | 'olive' | 'tan' | 'brown' | 'dark';
export type HairColor = 'black' | 'brown' | 'blonde' | 'red' | 'grey' | 'white' | 'blue' | 'purple';
export type HairStyle = 'short' | 'medium' | 'long' | 'bald' | 'ponytail' | 'braids' | 'curly' | 'straight';
export type EyeColor = 'brown' | 'blue' | 'green' | 'grey' | 'hazel' | 'amber' | 'violet' | 'red';
export type FacialHair = 'none' | 'stubble' | 'beard' | 'goatee' | 'moustache' | 'sideburns';
export type Accessory = 'none' | 'glasses' | 'eyepatch' | 'scar' | 'tattoo' | 'jewelry' | 'hat' | 'circlet';

export interface AvatarCustomization {
  id: string;
  name: string;
  species: Species;
  gender: Gender;
  skinTone: SkinTone;
  hairColor: HairColor;
  hairStyle: HairStyle;
  eyeColor: EyeColor;
  facialHair: FacialHair;
  accessories: Accessory[];
  backgroundColor?: string;
}

// Species characteristics
export const SPECIES_TRAITS: Record<Species, { displayName: string; lifespan: string; height: string }> = {
  human: { displayName: 'Human', lifespan: '75-90 years', height: '5\'0"-6\'4"' },
  elf: { displayName: 'Elf', lifespan: '700+ years', height: '4\'8"-6\'0"' },
  dwarf: { displayName: 'Dwarf', lifespan: '300-400 years', height: '3\'8"-4\'8"' },
  halfling: { displayName: 'Halfling', lifespan: '150+ years', height: '2\'10"-3\'4"' },
  dragonborn: { displayName: 'Dragonborn', lifespan: '77+ years', height: '5\'6"-6\'6"' },
  tiefling: { displayName: 'Tiefling', lifespan: '120+ years', height: '4\'9"-6\'3"' },
  gnome: { displayName: 'Gnome', lifespan: '350-400 years', height: '3\'0"-3\'6"' },
  'half-orc': { displayName: 'Half-Orc', lifespan: '75-80 years', height: '5\'4"-6\'8"' },
};

// Color definitions
export const SKIN_TONES: Record<SkinTone, string> = {
  pale: '#fdbcb4',
  fair: '#f5c89a',
  medium: '#d4a574',
  olive: '#bfa084',
  tan: '#a68870',
  brown: '#8b6f47',
  dark: '#5a4a3a',
};

export const HAIR_COLORS: Record<HairColor, string> = {
  black: '#1a1a1a',
  brown: '#6b4423',
  blonde: '#d4a574',
  red: '#c41e3a',
  grey: '#a9a9a9',
  white: '#f5f5f5',
  blue: '#4a90e2',
  purple: '#a855f7',
};

export const EYE_COLORS: Record<EyeColor, string> = {
  brown: '#8b6914',
  blue: '#4a90e2',
  green: '#2ea44f',
  grey: '#999999',
  hazel: '#b8860b',
  amber: '#ffbf00',
  violet: '#a855f7',
  red: '#ef4444',
};

// Create base avatar
export function createBaseAvatar(name: string, species: Species = 'human'): AvatarCustomization {
  return {
    id: `avatar_${Date.now()}`,
    name,
    species,
    gender: 'male',
    skinTone: 'fair',
    hairColor: 'brown',
    hairStyle: 'medium',
    eyeColor: 'brown',
    facialHair: 'none',
    accessories: [],
    backgroundColor: '#1a1a1a',
  };
}

// Randomize avatar
export function randomizeAvatar(avatar: AvatarCustomization): AvatarCustomization {
  const species = (['human', 'elf', 'dwarf', 'halfling', 'dragonborn', 'tiefling', 'gnome', 'half-orc'] as Species[]).sort(
    () => Math.random() - 0.5
  )[0];
  const gender = (['male', 'female', 'non-binary'] as Gender[]).sort(() => Math.random() - 0.5)[0];
  const skinTones = Object.keys(SKIN_TONES) as SkinTone[];
  const hairColors = Object.keys(HAIR_COLORS) as HairColor[];
  const hairStyles = ['short', 'medium', 'long', 'bald', 'ponytail', 'braids'] as HairStyle[];
  const eyeColors = Object.keys(EYE_COLORS) as EyeColor[];
  const facialHairs = ['none', 'stubble', 'beard', 'goatee'] as FacialHair[];

  return {
    ...avatar,
    species,
    gender,
    skinTone: skinTones[Math.floor(Math.random() * skinTones.length)],
    hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
    hairStyle: hairStyles[Math.floor(Math.random() * hairStyles.length)],
    eyeColor: eyeColors[Math.floor(Math.random() * eyeColors.length)],
    facialHair: facialHairs[Math.floor(Math.random() * facialHairs.length)],
  };
}

// Add accessory
export function addAccessory(avatar: AvatarCustomization, accessory: Accessory): AvatarCustomization {
  if (avatar.accessories.includes(accessory)) return avatar;

  return {
    ...avatar,
    accessories: [...avatar.accessories, accessory],
  };
}

// Remove accessory
export function removeAccessory(avatar: AvatarCustomization, accessory: Accessory): AvatarCustomization {
  return {
    ...avatar,
    accessories: avatar.accessories.filter((a) => a !== accessory),
  };
}

// Generate avatar URL using DiceBear API
export function generateAvatarURL(avatar: AvatarCustomization, style: string = 'avataaars'): string {
  const seed = avatar.name.replace(/\s+/g, '-');
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&scale=80&mood=happy`;
}

// Export avatar as JSON
export function exportAvatarJSON(avatar: AvatarCustomization): string {
  return JSON.stringify(avatar, null, 2);
}

// Import avatar from JSON
export function importAvatarJSON(json: string): AvatarCustomization {
  return JSON.parse(json);
}

// Get avatar description
export function getAvatarDescription(avatar: AvatarCustomization): string {
  const speciesName = SPECIES_TRAITS[avatar.species].displayName;
  const parts = [
    `${speciesName} ${avatar.gender}`,
    `${avatar.skinTone} skin`,
    `${avatar.hairColor} ${avatar.hairStyle} hair`,
    `${avatar.eyeColor} eyes`,
  ];

  if (avatar.facialHair !== 'none') {
    parts.push(avatar.facialHair);
  }

  if (avatar.accessories.length > 0) {
    parts.push(`with ${avatar.accessories.join(', ')}`);
  }

  return parts.join(', ');
}
