import { DefaultTheme } from 'styled-components';

// Helper to create a spacing function
const createSpacing = (base: number) => (factor: number) => `${base * factor * 0.25}rem`;

const baseTheme = {
  typography: {
    fontFamily:
      "'Circular Std', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '3rem',
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 700,
      lineHeight: 1.75,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  fonts: {
    body: "'Circular Std', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    heading:
      "'Circular Std', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  fontSizes: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    md: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    xxl: '1.5rem', // 24px
    xxxl: '2rem', // 32px
    display: '4rem', // 64px
  },
  space: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    xxl: '3rem', // 48px
    xxxl: '5rem', // 80px
  },
  spacing: createSpacing(1),
  breakpoints: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1400px',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    xl: '24px',
    pill: '9999px',
    sm: '0.125rem', // 2px
    md: '0.25rem', // 4px
    lg: '0.5rem', // 8px
    full: '9999px',
  },
  shadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.08)',
    medium: '0 8px 24px rgba(0, 0, 0, 0.12)',
    large: '0 16px 48px rgba(0, 0, 0, 0.18)',
    glow: '0 0 20px rgba(29, 185, 84, 0.4)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
  },
  transitions: {
    default: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    normal: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  glass: {
    light: 'rgba(255, 255, 255, 0.7)',
    dark: 'rgba(18, 18, 18, 0.7)',
    blur: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #1DB954 0%, #1ED760 100%)',
    dark: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, #121212 100%)',
    card: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
  }
};

export const lightTheme: DefaultTheme = {
  ...baseTheme,
  colors: {
    primary: {
      main: '#1DB954',
      light: '#1ED760',
      dark: '#1AA34A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#535353',
      light: '#7D7D7D',
      dark: '#282828',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
      elevated: '#FFFFFF',
      glass: 'rgba(255, 255, 255, 0.8)',
    },
    text: {
      primary: '#121212',
      secondary: '#535353',
      disabled: '#B3B3B3',
    },
    error: {
      main: '#E91429',
      light: '#FF4D4D',
      dark: '#C41E3A',
    },
    success: {
      main: '#1DB954',
      light: '#1ED760',
      dark: '#1AA34A',
    },
    border: '#EAEAEA',
    divider: 'rgba(0, 0, 0, 0.05)',
    accent: '#FF6B00',
  },
};

export const darkTheme: DefaultTheme = {
  ...baseTheme,
  colors: {
    primary: {
      main: '#1DB954',
      light: '#1ED760',
      dark: '#1AA34A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#B3B3B3',
      light: '#FFFFFF',
      dark: '#181818',
      contrastText: '#121212',
    },
    background: {
      default: '#121212',
      paper: '#181818',
      elevated: '#282828',
      glass: 'rgba(18, 18, 18, 0.8)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
      disabled: '#535353',
    },
    error: {
      main: '#E91429',
      light: '#FF4D4D',
      dark: '#C41E3A',
    },
    success: {
      main: '#1DB954',
      light: '#1ED760',
      dark: '#1AA34A',
    },
    border: '#282828',
    divider: 'rgba(255, 255, 255, 0.1)',
    accent: '#FF6B00',
  },
};

export default { light: lightTheme, dark: darkTheme };

