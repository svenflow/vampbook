/**
 * VampBook Color Palette - Jazz-inspired dark theme
 */

// Primary colors
const gold = '#fbbf24';      // Warm gold - accents, highlights
const navy = '#1a1a2e';      // Deep navy - backgrounds
const slate = '#2d2d44';     // Muted slate - cards, surfaces
const azure = '#60a5fa';     // Cool azure - links, secondary actions
const emerald = '#4ade80';   // Emerald - success, pass indicators
const coral = '#f87171';     // Coral - errors, remove actions
const silver = '#9ca3af';    // Silver - muted text, borders
const ivory = '#f3f4f6';     // Ivory - primary text

export default {
  light: {
    // Using dark theme for both - jazz vibes
    text: ivory,
    textMuted: silver,
    background: navy,
    surface: slate,
    tint: gold,
    accent: azure,
    success: emerald,
    error: coral,
    border: '#3d3d5c',
    tabIconDefault: silver,
    tabIconSelected: gold,
  },
  dark: {
    text: ivory,
    textMuted: silver,
    background: navy,
    surface: slate,
    tint: gold,
    accent: azure,
    success: emerald,
    error: coral,
    border: '#3d3d5c',
    tabIconDefault: silver,
    tabIconSelected: gold,
  },
};

// Typography scale
export const Typography = {
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: ivory,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: silver,
  },
  body: {
    fontSize: 16,
    color: ivory,
  },
  caption: {
    fontSize: 14,
    color: silver,
  },
  small: {
    fontSize: 12,
    color: silver,
  },
};

// Spacing scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
