/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    './global.css',
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-tertiary': 'var(--color-bg-tertiary)',
        'bg-card': 'var(--color-bg-card)',
        'bg-elevated': 'var(--color-bg-elevated)',
        'bg-input': 'var(--color-bg-input)',
        'bg-glass': 'var(--color-bg-glass)',

        // Text
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        'text-inverse': 'var(--color-text-inverse)',
        'text-link': 'var(--color-text-link)',

        // Accent
        'accent-primary': 'var(--color-accent-primary)',
        'accent-secondary': 'var(--color-accent-secondary)',
        'accent-tertiary': 'var(--color-accent-tertiary)',

        // Status
        'status-success': 'var(--color-status-success)',
        'status-warning': 'var(--color-status-warning)',
        'status-error': 'var(--color-status-error)',
        'status-info': 'var(--color-status-info)',

        // Border
        'border-light': 'var(--color-border-light)',
        'border-medium': 'var(--color-border-medium)',
        'border-focus': 'var(--color-border-focus)',

        // Shadows
        'shadow-sm': 'var(--color-shadow-sm)',
        'shadow-md': 'var(--color-shadow-md)',
        'shadow-lg': 'var(--color-shadow-lg)',

        // Category
        'cat-nature': '#22C55E',
        'cat-abstract': '#A855F7',
        'cat-minimal': '#6366F1',
        'cat-dark': '#374151',
        'cat-space': '#1E40AF',
        'cat-anime': '#EC4899',
        'cat-city': '#F97316',
        'cat-animals': '#14B8A6',
        'cat-art': '#E11D48',
        'cat-technology': '#06B6D4',
        'cat-texture': '#92400E',
      },
      fontFamily: {
        sans: ['Inter', 'System', 'sans-serif'],
        medium: ['Inter-Medium', 'System', 'sans-serif'],
        bold: ['Inter-Bold', 'System', 'sans-serif'],
        light: ['Inter-Light', 'System', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '24px',
        '3xl': '32px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
