import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        binance: {
          yellow: '#f0b90b',
          dark: '#0b0e11',
          card: '#1e2329',
          border: '#2b3139',
          textMuted: '#848e9c',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(240,185,11,0.18), 0 8px 24px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
