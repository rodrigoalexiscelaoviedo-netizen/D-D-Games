interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  fullHeight?: boolean;
}

export const EmptyState = ({
  icon = '🎲',
  title,
  description,
  action,
  fullHeight = false,
}: EmptyStateProps) => {
  const heightClass = fullHeight ? 'full-height' : '';

  return (
    <div className={`empty-state ${heightClass}`}>
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      )}
      <style>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px 20px;
          text-align: center;

          &.full-height {
            min-height: 100vh;
          }
        }

        .empty-icon {
          font-size: 56px;
          line-height: 1;
        }

        .empty-state h3 {
          margin: 0;
          font-size: 20px;
          color: #fff;
        }

        .empty-state p {
          margin: 0;
          color: #999;
          font-size: 14px;
          max-width: 400px;
        }

        .empty-state .btn-primary {
          margin-top: 12px;
        }
      `}</style>
    </div>
  );
};
