import { memo, useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export const Toast = memo(({ message, type, duration = 4000, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }[type];

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded shadow-lg flex items-center gap-3 animate-pulse z-50`}>
      <span className="font-bold text-lg">{icon}</span>
      <p>{message}</p>
    </div>
  );
});

Toast.displayName = 'Toast';
