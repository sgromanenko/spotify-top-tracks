/**
 * Design System - Shadow Tokens
 * 
 * Box shadow tokens for elevation and depth
 */

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  '2xl': '0 30px 60px -15px rgba(0, 0, 0, 0.3)',

  // Spotify-specific shadows
  card: '0 2px 4px 0 rgba(0, 0, 0, 0.5)',
  player: '0 -2px 10px rgba(0, 0, 0, 0.3)',
  glow: '0 0 20px rgba(30, 215, 96, 0.3)',
} as const;

export type ShadowToken = typeof shadows;
