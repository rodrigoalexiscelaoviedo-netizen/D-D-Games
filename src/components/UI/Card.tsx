import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card = ({ children, className = '', onClick, hoverable = false }: CardProps) => {
  const hoverClass = hoverable ? 'hoverable' : '';
  const clickClass = onClick ? 'clickable' : '';

  return (
    <div className={`card ${hoverClass} ${clickClass} ${className}`} onClick={onClick}>
      {children}
      <style>{`
        .card {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          transition: all 200ms;

          &.clickable {
            cursor: pointer;
          }

          &.hoverable:hover {
            border-color: #a855f7;
            background: #1a1a1a;
            box-shadow: 0 10px 15px rgba(168, 85, 247, 0.1);
            transform: translateY(-2px);
          }
        }
      `}</style>
    </div>
  );
};
