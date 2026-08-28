export const LoadingSkeleton = ({ width = '100%', height = '20px' }: { width?: string; height?: string }) => (
  <div
    style={{
      width,
      height,
      backgroundColor: 'var(--bg-surface-2)',
      borderRadius: '4px',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}
  />
);

export const CardSkeleton = () => (
  <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface-2)', borderRadius: '8px', gap: '1rem', display: 'flex', flexDirection: 'column' }}>
    <LoadingSkeleton height='24px' width='80%' />
    <LoadingSkeleton height='16px' width='60%' />
    <LoadingSkeleton height='16px' width='90%' />
  </div>
);

const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
document.head.appendChild(style);
