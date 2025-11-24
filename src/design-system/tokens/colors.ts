/**
 * Design System - Color Tokens
 * 
 * Centralized color palette for the application
 */

export const colors = {
  // Primary brand colors
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#1ed760', // Spotify green
    600: '#1db954',
    700: '#1a9e4a',
    800: '#178440',
    900: '#146a36',
  },

  // Neutral colors for UI
  neutral: {
    0: '#FFFFFF',
    50: '#F5F5F5',
    100: '#E5E5E5',
    200: '#D4D4D4',
    300: '#A3A3A3',
    400: '#737373',
    500: '#525252',
    600: '#404040',
    700: '#262626',
    800: '#171717',
    900: '#0A0A0A',
    1000: '#000000',
  },

  // Semantic colors
  success: {
    light: '#4ADE80',
    main: '#22C55E',
    dark: '#16A34A',
  },

  error: {
    light: '#F87171',
    main: '#EF4444',
    dark: '#DC2626',
  },

  warning: {
    light: '#FCD34D',
    main: '#F59E0B',
    dark: '#D97706',
  },

  info: {
    light: '#60A5FA',
    main: '#3B82F6',
    dark: '#2563EB',
  },

  // Background colors
  background: {
    default: '#121212',
    paper: '#181818',
    elevated: '#282828',
    glass: 'rgba(0, 0, 0, 0.7)',
  },

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    disabled: '#535353',
    inverse: '#000000',
  },
} as const;

export type ColorToken = typeof colors;
