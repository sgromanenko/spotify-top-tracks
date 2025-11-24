import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
      };
      secondary: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
      };
      background: {
        default: string;
        paper: string;
        elevated: string;
        glass: string;
      };
      text: {
        primary: string;
        secondary: string;
        disabled: string;
      };
      error: {
        main: string;
        light: string;
        dark: string;
      };
      success: {
        main: string;
        light: string;
        dark: string;
      };
      divider: string;
      border: string;
      accent: string;
    };
    typography: {
      fontFamily: string;
      fontSize: number;
      fontWeightLight: number;
      fontWeightRegular: number;
      fontWeightMedium: number;
      fontWeightBold: number;
      h1: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        letterSpacing?: string;
      };
      h2: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        letterSpacing?: string;
      };
      h3: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        letterSpacing?: string;
      };
      h4: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
      };
      body1: {
        fontSize: string;
        lineHeight: number;
      };
      body2: {
        fontSize: string;
        lineHeight: number;
      };
      button: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        textTransform: string;
        letterSpacing?: string;
      };
    };
    spacing: (factor: number) => string;
    space: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
      xxxl: string;
    };
    fonts: {
      body: string;
      heading: string;
    };
    fontSizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
      xxxl: string;
      display: string;
    };
    breakpoints: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    borderRadius: {
      small: string;
      medium: string;
      large: string;
      xl: string;
      pill: string;
      sm: string;
      md: string;
      lg: string;
      full: string;
    };
    shadows: {
      small: string;
      medium: string;
      large: string;
      glow: string;
      sm: string;
      md: string;
      lg: string;
    };
    transitions: {
      default: string;
      fast: string;
      slow: string;
      normal: string;
      spring: string;
    };
    glass: {
      light: string;
      dark: string;
      blur: string;
      border: string;
    };
    gradients: {
      primary: string;
      dark: string;
      card: string;
    };
  }
}
