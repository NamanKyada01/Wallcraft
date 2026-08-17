/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0A0F',
          secondary: '#141420',
          card: '#1A1A2E',
          elevated: '#22223A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A0A0B8',
          tertiary: '#6B6B80',
        },
        accent: {
          primary: '#7C6EF6',
          secondary: '#A78BFA',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
    },
  },
  plugins: [],
};
