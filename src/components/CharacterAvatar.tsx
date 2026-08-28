import { memo, useMemo } from 'react';

interface AvatarProps {
  characterName: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const CharacterAvatar = memo(({ characterName, size = 'medium', className }: AvatarProps) => {
  const avatarColor = useMemo(() => {
    // Generar color consistente basado en el nombre
    let hash = 0;
    for (let i = 0; i < characterName.length; i++) {
      hash = characterName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${Math.abs(hash % 360)}, 70%, 60%)`;
    return color;
  }, [characterName]);

  const initials = characterName
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  const sizeMap = {
    small: { size: 32, fontSize: 12 },
    medium: { size: 48, fontSize: 16 },
    large: { size: 64, fontSize: 20 },
  };

  const { size: dimension, fontSize } = sizeMap[size];

  return (
    <div
      className={className}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        borderRadius: '50%',
        backgroundColor: avatarColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: `${fontSize}px`,
        border: '2px solid var(--gold)',
        flexShrink: 0,
      }}
      title={characterName}
    >
      {initials}
    </div>
  );
});

CharacterAvatar.displayName = 'CharacterAvatar';
