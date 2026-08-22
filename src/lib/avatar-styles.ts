export const AVATAR_STYLES = [
  { id: 'style-1', name: 'Guerrero', seed: 'warrior' },
  { id: 'style-2', name: 'Mago', seed: 'mage' },
  { id: 'style-3', name: 'Clérigo', seed: 'cleric' },
  { id: 'style-4', name: 'Pícaro', seed: 'rogue' },
  { id: 'style-5', name: 'Brujo', seed: 'warlock' },
  { id: 'style-6', name: 'Bárbaro', seed: 'barbarian' },
  { id: 'style-7', name: 'Paladín', seed: 'paladin' },
  { id: 'style-8', name: 'Artificiero', seed: 'artificer' },
  { id: 'style-9', name: 'Bardo', seed: 'bard' },
  { id: 'style-10', name: 'Explorador', seed: 'ranger' },
  { id: 'style-11', name: 'Monje', seed: 'monk' },
  { id: 'style-12', name: 'Hechicero', seed: 'sorcerer' },
];

export const getAvatarUrl = (seed: string): string => {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&scale=80`;
};
