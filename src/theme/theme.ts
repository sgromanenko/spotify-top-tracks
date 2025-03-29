import { DefaultTheme } from 'styled-components';

// Helper to create a spacing function
const createSpacing = (base: number) => (factor: number) => `${base * factor * 0.25}rem`;

const baseTheme = {
  typography: {
    fontFamily:
      "'Circular Std', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 700,
      lineHeight: 1.75,
      textTransform: 'none'
    }
  },
  fonts: {
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    heading:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  },
  fontSizes: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    md: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    xxl: '1.5rem' // 24px
  },
  space: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    xxl: '3rem' // 48px
  },
  spacing: createSpacing(1),
  breakpoints: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px'
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
    pill: '9999px',
    sm: '0.125rem', // 2px
    md: '0.25rem', // 4px
    lg: '0.5rem', // 8px
    full: '9999px'
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.12)',
    large: '0 8px 16px rgba(0, 0, 0, 0.2)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)'
  },
  transitions: {
    default: '0.3s ease',
    fast: 'all 0.1s ease-in-out',
    normal: 'all 0.2s ease-in-out',
    slow: 'all 0.3s ease-in-out'
  }
};

export const lightTheme: DefaultTheme = {
  ...baseTheme,
  colors: {
    primary: {
      main: '#1DB954',
      light: '#1ED760',
      dark: '#1AA34A',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#535353',
      light: '#7D7D7D',
      dark: '#282828',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
      elevated: '#FFFFFF'
    },
    text: {
      primary: '#212529',
      secondary: '#495057',
      disabled: '#ADB5BD'
    },
    error: {
      main: '#DC3545',
      light: '#E35D6A',
      dark: '#C41E3A'
    },
    success: {
      main: '#28A745',
      light: '#48C664',
      dark: '#1E7E34'
    },
    border: '#DEE2E6',
    divider: 'rgba(0, 0, 0, 0.1)',
    accent: '#FF9500'
  }
};

export const darkTheme: DefaultTheme = {
  ...baseTheme,
  colors: {
    primary: {
      main: '#1DB954',
      light: '#1ED760',
      dark: '#1AA34A',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#535353',
      light: '#7D7D7D',
      dark: '#282828',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#121212',
      paper: '#181818',
      elevated: '#282828'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
      disabled: '#727272'
    },
    error: {
      main: '#FF5252',
      light: '#FF7676',
      dark: '#C41E3A'
    },
    success: {
      main: '#1DB954',
      light: '#1ED760',
      dark: '#1AA34A'
    },
    border: '#333333',
    divider: 'rgba(255, 255, 255, 0.1)',
    accent: '#FF9500'
  }
};

export default { light: lightTheme, dark: darkTheme };
