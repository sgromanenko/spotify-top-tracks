const theme = {
  colors: {
    primary: {
      main: '#1DB954', // Spotify green
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
      default: '#121212',
      paper: '#181818',
      elevated: '#282828',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
      disabled: '#727272',
    },
    error: {
      main: '#FF5252',
      light: '#FF7676',
      dark: '#C41E3A',
    },
    success: {
      main: '#1DB954',
      light: '#1ED760',
      dark: '#1AA34A',
    },
    divider: 'rgba(255, 255, 255, 0.1)',
  },
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
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
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
    },
  },
  spacing: (factor: number) => `${0.25 * factor}rem`,
  breakpoints: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
    pill: '9999px',
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.12)',
    large: '0 8px 16px rgba(0, 0, 0, 0.2)',
  },
  transitions: {
    default: '0.3s ease',
    fast: '0.15s ease',
    slow: '0.5s ease',
  },
};

export type Theme = typeof theme;
export default theme;
