import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        panel: '0 18px 48px rgba(15, 23, 42, 0.12)',
      },
      colors: {
        canvas: '#f3f5f7',
        ink: '#111827',
        muted: '#6b7280',
      },
    },
  },
  plugins: [],
};

export default config;
