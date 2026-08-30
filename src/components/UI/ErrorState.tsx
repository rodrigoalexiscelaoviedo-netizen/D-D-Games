interface ErrorStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  fullHeight?: boolean;
}

export const ErrorState = ({
  title = 'Error',
  message,
  action,
  fullHeight = false,
}: ErrorStateProps) => {
  const heightClass = fullHeight ? 'full-height' : '';

  return (
    <div className={`error-state ${heightClass}`}>
      <div className="error-icon">⚠️</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action && (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      )}
      <style>{`
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px 20px;
          text-align: center;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;

          &.full-height {
            min-height: 100vh;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%);
            border: none;
          }
        }

        .error-icon {
          font-size: 48px;
          line-height: 1;
        }

        .error-state h3 {
          margin: 0;
          font-size: 20px;
          color: #fca5a5;
        }

        .error-state p {
          margin: 0;
          color: #fca5a5;
          font-size: 14px;
          max-width: 400px;
        }

        .error-state .btn-primary {
          margin-top: 12px;
        }
      `}</style>
    </div>
  );
};
