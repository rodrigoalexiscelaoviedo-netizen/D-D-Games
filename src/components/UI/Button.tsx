import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  title,
  className,
  type = 'button',
}: ButtonProps) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const fullWidthClass = fullWidth ? 'full-width' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={`button ${variantClass} ${sizeClass} ${fullWidthClass} ${className || ''}`}
    >
      {loading ? <span className="btn-loader">⋯</span> : children}

      <style>{`
        .button {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          white-space: nowrap;
          font-family: inherit;

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          &:focus {
            outline: 2px solid currentColor;
            outline-offset: 2px;
          }
        }

        .button.btn-primary {
          background: #a855f7;
          color: white;

          &:not(:disabled):hover {
            background: #9333ea;
            transform: translateY(-2px);
            box-shadow: 0 10px 15px rgba(168, 85, 247, 0.3);
          }

          &:not(:disabled):active {
            transform: translateY(0);
          }
        }

        .button.btn-secondary {
          background: #1a1a1a;
          color: #cccccc;
          border: 1px solid #333;

          &:not(:disabled):hover {
            background: #242424;
            border-color: #666;
            color: #fff;
          }
        }

        .button.btn-danger {
          background: #ef4444;
          color: white;

          &:not(:disabled):hover {
            background: #dc2626;
            transform: translateY(-2px);
            box-shadow: 0 10px 15px rgba(239, 68, 68, 0.3);
          }
        }

        .button.btn-ghost {
          background: transparent;
          color: #cccccc;
          border: 1px solid transparent;

          &:not(:disabled):hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: #666;
          }
        }

        .button.btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        .button.btn-md {
          padding: 10px 16px;
          font-size: 14px;
        }

        .button.btn-lg {
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 600;
        }

        .button.full-width {
          width: 100%;
        }

        .btn-loader {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </button>
  );
};
