// Design System Tokens - Single Source of Truth for UI

export const colors = {
  // Neutrals
  black: '#000000',
  white: '#ffffff',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Dark mode palette
  dark: {
    bg_primary: '#0d0d0d',      // Main background
    bg_secondary: '#1a1a1a',    // Card background
    bg_tertiary: '#242424',     // Hover/alt background
    border: '#333333',          // Border color
    text_primary: '#ffffff',    // Main text
    text_secondary: '#cccccc',  // Secondary text
    text_tertiary: '#999999',   // Tertiary text
    text_muted: '#666666',      // Muted text
  },

  // Brand colors
  brand: {
    primary: '#a855f7',         // Purple
    primary_dark: '#9333ea',    // Darker purple
    primary_light: '#c084fc',   // Lighter purple
    secondary: '#ec4899',       // Pink
    success: '#4ade80',         // Green
    warning: '#fbbf24',         // Amber
    error: '#ef4444',           // Red
    info: '#0ea5e9',            // Blue
  },

  // Semantic colors
  status: {
    success: '#4ade80',
    error: '#ef4444',
    warning: '#fbbf24',
    info: '#0ea5e9',
    pending: '#a855f7',
  },

  // Component-specific
  button: {
    primary_bg: '#a855f7',
    primary_text: '#ffffff',
    primary_hover: '#9333ea',
    secondary_bg: '#1a1a1a',
    secondary_text: '#cccccc',
    secondary_hover: '#242424',
    danger_bg: '#ef4444',
    danger_hover: '#dc2626',
  },

  input: {
    bg: '#0d0d0d',
    border: '#666666',
    border_focus: '#a855f7',
    text: '#ffffff',
    placeholder: '#999999',
  },

  card: {
    bg: '#0d0d0d',
    border: '#333333',
    hover_border: '#a855f7',
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px',
};

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
};

export const typography = {
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '32px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const breakpoints = {
  mobile: '375px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
  ultraWide: '1920px',
};

// Utility functions
export const mediaQuery = {
  mobile: `@media (max-width: 767px)`,
  tablet: `@media (min-width: 768px) and (max-width: 1023px)`,
  desktop: `@media (min-width: 1024px)`,
  wide: `@media (min-width: 1440px)`,
};

export const buttonStyles = `
  padding: ${spacing.md} ${spacing.lg};
  border: none;
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${transitions.base};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus {
    outline: 2px solid ${colors.brand.primary};
    outline-offset: 2px;
  }
`;

export const inputStyles = `
  padding: ${spacing.md} ${spacing.lg};
  border: 1px solid ${colors.input.border};
  border-radius: ${borderRadius.md};
  background: ${colors.input.bg};
  color: ${colors.input.text};
  font-size: ${typography.fontSize.base};
  transition: all ${transitions.base};

  &::placeholder {
    color: ${colors.input.placeholder};
  }

  &:focus {
    outline: none;
    border-color: ${colors.input.border_focus};
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
  }
`;

export const cardStyles = `
  background: ${colors.card.bg};
  border: 1px solid ${colors.card.border};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.lg};
  transition: all ${transitions.base};

  &:hover {
    border-color: ${colors.card.hover_border};
    box-shadow: ${shadows.md};
  }
`;

export const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background: ${colors.dark.bg_primary};
    color: ${colors.dark.text_primary};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    font-size: ${typography.fontSize.base};
    line-height: ${typography.lineHeight.normal};
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${typography.fontWeight.bold};
    line-height: ${typography.lineHeight.tight};
  }

  h1 { font-size: ${typography.fontSize['4xl']}; }
  h2 { font-size: ${typography.fontSize['3xl']}; }
  h3 { font-size: ${typography.fontSize['2xl']}; }
  h4 { font-size: ${typography.fontSize.xl}; }
  h5 { font-size: ${typography.fontSize.lg}; }
  h6 { font-size: ${typography.fontSize.base}; }

  button {
    ${buttonStyles}
  }

  input, textarea, select {
    ${inputStyles}
  }

  .card {
    ${cardStyles}
  }
`;
