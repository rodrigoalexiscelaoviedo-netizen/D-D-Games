interface LoadingStateProps {
  message?: string;
  fullHeight?: boolean;
}

export const LoadingState = ({ message = 'Cargando...', fullHeight = false }: LoadingStateProps) => {
  const heightClass = fullHeight ? 'full-height' : '';

  return (
    <div className={`loading-state ${heightClass}`}>
      <div className="spinner"></div>
      <p>{message}</p>
      <style>{`
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 40px 20px;

          &.full-height {
            min-height: 100vh;
          }
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #333;
          border-top-color: #a855f7;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading-state p {
          margin: 0;
          color: #999;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};
