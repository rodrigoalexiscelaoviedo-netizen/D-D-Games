import { memo } from 'react';

interface AnimationProps {
  type: 'attack' | 'heal' | 'damage' | 'miss';
  value?: number;
  x?: number;
  y?: number;
}

export const CombatAnimation = memo(({ type, value, x = 0, y = 0 }: AnimationProps) => {
  const getColor = () => {
    switch (type) {
      case 'attack': return '#c9a24b';
      case 'damage': return '#d95c5c';
      case 'heal': return '#4caf50';
      case 'miss': return '#888';
      default: return '#fff';
    }
  };

  const getText = () => {
    switch (type) {
      case 'attack': return '⚔️ Hit!';
      case 'damage': return `-${value}`;
      case 'heal': return `+${value}`;
      case 'miss': return 'Miss!';
      default: return '';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: getColor(),
        animation: 'float-up 1s ease-out forwards',
        pointerEvents: 'none',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
      }}
    >
      {getText()}
    </div>
  );
});

CombatAnimation.displayName = 'CombatAnimation';

const style = document.createElement('style');
style.textContent = `
  @keyframes float-up {
    0% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-60px);
    }
  }

  @keyframes pulse-hit {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  .combat-unit {
    animation: pulse-hit 0.3s ease-out;
  }
`;
document.head.appendChild(style);
