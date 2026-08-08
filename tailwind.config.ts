import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',
        success: '#059669',
        danger: '#dc2626',
        warning: '#f59e0b',
      },
      spacing: {
        'safe': '1rem',
        'card': '1.5rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
