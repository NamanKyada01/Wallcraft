// ============================================================
// colors.ts — SINGLE SOURCE OF TRUTH for all app colors
// Every color in the app must reference this file.
// Used via NativeWind CSS custom properties in global.css.
// ============================================================

const colors = {
  // ---- Backgrounds ----
  bg: {
    primary: '#0A0A0F',
    secondary: '#141420',
    tertiary: '#1E1E2E',
    card: '#1A1A2E',
    elevated: '#22223A',
    input: '#1E1E2E',
    overlay: 'rgba(0, 0, 0, 0.6)',
    glass: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },

  // ---- Text ----
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0B8',
    tertiary: '#6B6B80',
    inverse: '#0A0A0F',
    link: '#7C6EF6',
  },

  // ---- Brand / Accent ----
  accent: {
    primary: '#7C6EF6',
    secondary: '#A78BFA',
    tertiary: '#5B4FD4',
    gradient: ['#7C6EF6', '#A78BFA'],
    gradientWarm: ['#F97316', '#EC4899'],
    gradientCool: ['#06B6D4', '#7C6EF6'],
  },

  // ---- Semantic / Status ----
  status: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    open: '#3B82F6',
    inProgress: '#F59E0B',
    resolved: '#22C55E',
    closed: '#6B7280',
  },

  // ---- Borders ----
  border: {
    light: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.15)',
    focus: '#7C6EF6',
    error: '#EF4444',
  },

  // ---- Shadows ----
  shadow: {
    sm: 'rgba(0, 0, 0, 0.3)',
    md: 'rgba(0, 0, 0, 0.5)',
    lg: 'rgba(0, 0, 0, 0.7)',
    accent: 'rgba(124, 110, 246, 0.3)',
  },

  // ---- Category palette (for category cards) ----
  category: {
    nature: '#22C55E',
    abstract: '#A855F7',
    minimal: '#6366F1',
    dark: '#374151',
    space: '#1E40AF',
    anime: '#EC4899',
    city: '#F97316',
    animals: '#14B8A6',
    art: '#E11D48',
    technology: '#06B6D4',
    texture: '#92400E',
    gradient: 'linear-gradient(135deg, #7C6EF6, #EC4899)',
  },

  // ---- Opacity helpers ----
  opacity: {
    disabled: 0.4,
    hover: 0.8,
    pressed: 0.6,
  },
} as const;

export type ColorKeys = typeof colors;
export default colors;
