export const validate = {
  email: (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  notEmpty: (value: string): boolean => {
    return value.trim().length > 0;
  },

  minLength: (value: string, min: number): boolean => {
    return value.trim().length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.trim().length <= max;
  },

  isUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  isNumber: (value: string): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(Number(value));
  },
};

export const getErrorMessage = (errors: Record<string, boolean>): string | null => {
  const keys = Object.keys(errors);
  if (keys.length === 0) return null;
  return `Por favor verifica: ${keys.join(', ')}`;
};
