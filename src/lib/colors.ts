/**
 * Hi-Bridge Color System
 * 
 * This file defines the color tokens used throughout the application.
 * It provides semantic color naming and ensures consistent usage across
 * both light and dark themes while maintaining accessibility standards.
 */

// Base color palette with opacity variants
export const colorPalette = {
  // Primary brand colors
  primary: {
    50: '#E6F0F7',
    100: '#CCE0EF',
    200: '#99C2DF',
    300: '#66A3CF',
    400: '#3385BF',
    500: '#004977', // Main primary color
    600: '#003A5F',
    700: '#002C47',
    800: '#001D2F',
    900: '#000F17',
  },
  
  // Secondary brand colors
  secondary: {
    50: '#FCE8E8',
    100: '#F9D1D1',
    200: '#F3A3A3',
    300: '#ED7575',
    400: '#E74747',
    500: '#A12B2B', // Main secondary color
    600: '#812222',
    700: '#611A1A',
    800: '#401111',
    900: '#200909',
  },
  
  // Accent brand colors
  accent: {
    50: '#E6F7F8',
    100: '#CCF0F2',
    200: '#99E0E5',
    300: '#66D1D8',
    400: '#33C1CB',
    500: '#00A4B4', // Main accent color
    600: '#008390',
    700: '#00626C',
    800: '#004248',
    900: '#002124',
  },
  
  // Grayscale
  gray: {
    50: '#F8F9FC',
    100: '#F1F2F6',
    200: '#E2E4ED',
    300: '#D1D3DC',
    400: '#9494A6',
    500: '#64647B',
    600: '#4A4A5F',
    700: '#2A2E3C',
    800: '#1A1D27',
    900: '#0F1117',
  },
  
  // Semantic colors
  success: {
    light: '#34D399',
    DEFAULT: '#10B981',
    dark: '#059669',
  },
  warning: {
    light: '#FBBF24',
    DEFAULT: '#F59E0B',
    dark: '#D97706',
  },
  error: {
    light: '#F87171',
    DEFAULT: '#EF4444',
    dark: '#DC2626',
  },
  info: {
    light: '#60A5FA',
    DEFAULT: '#3B82F6',
    dark: '#2563EB',
  },
};

// Semantic color tokens for light mode
export const lightTheme = {
  // Text colors
  text: {
    primary: colorPalette.gray[900],
    secondary: colorPalette.gray[500],
    muted: colorPalette.gray[400],
    disabled: colorPalette.gray[300],
    inverse: colorPalette.gray[50],
    link: colorPalette.primary[500],
    linkHover: colorPalette.primary[600],
  },
  
  // Background colors
  background: {
    app: colorPalette.gray[50],
    card: '#FFFFFF',
    cardHover: colorPalette.gray[100],
    elevated: '#FFFFFF',
    subtle: colorPalette.gray[50],
  },
  
  // Border colors
  border: {
    default: colorPalette.gray[200],
    strong: colorPalette.gray[300],
    focus: colorPalette.primary[400],
  },
  
  // Interactive element colors
  interactive: {
    primary: {
      bg: colorPalette.primary[500],
      text: '#FFFFFF',
      hover: colorPalette.primary[600],
      active: colorPalette.primary[700],
      disabled: colorPalette.primary[200],
    },
    secondary: {
      bg: colorPalette.secondary[500],
      text: '#FFFFFF',
      hover: colorPalette.secondary[600],
      active: colorPalette.secondary[700],
      disabled: colorPalette.secondary[200],
    },
    accent: {
      bg: colorPalette.accent[500],
      text: '#FFFFFF',
      hover: colorPalette.accent[600],
      active: colorPalette.accent[700],
      disabled: colorPalette.accent[200],
    },
  },
  
  // Status colors
  status: {
    success: {
      bg: colorPalette.success.DEFAULT,
      bgSubtle: `rgba(16, 185, 129, 0.1)`,
      text: '#FFFFFF',
      border: colorPalette.success.dark,
      icon: colorPalette.success.DEFAULT,
    },
    warning: {
      bg: colorPalette.warning.DEFAULT,
      bgSubtle: `rgba(245, 158, 11, 0.1)`,
      text: '#FFFFFF',
      border: colorPalette.warning.dark,
      icon: colorPalette.warning.DEFAULT,
    },
    error: {
      bg: colorPalette.error.DEFAULT,
      bgSubtle: `rgba(239, 68, 68, 0.1)`,
      text: '#FFFFFF',
      border: colorPalette.error.dark,
      icon: colorPalette.error.DEFAULT,
    },
    info: {
      bg: colorPalette.info.DEFAULT,
      bgSubtle: `rgba(59, 130, 246, 0.1)`,
      text: '#FFFFFF',
      border: colorPalette.info.dark,
      icon: colorPalette.info.DEFAULT,
    },
  },
};

// Semantic color tokens for dark mode
export const darkTheme = {
  // Text colors
  text: {
    primary: colorPalette.gray[50],
    secondary: colorPalette.gray[300],
    muted: colorPalette.gray[400],
    disabled: colorPalette.gray[600],
    inverse: colorPalette.gray[900],
    link: colorPalette.primary[300],
    linkHover: colorPalette.primary[200],
  },
  
  // Background colors
  background: {
    app: colorPalette.gray[900],
    card: colorPalette.gray[800],
    cardHover: colorPalette.gray[700],
    elevated: colorPalette.gray[700],
    subtle: colorPalette.gray[800],
  },
  
  // Border colors
  border: {
    default: colorPalette.gray[700],
    strong: colorPalette.gray[600],
    focus: colorPalette.primary[400],
  },
  
  // Interactive element colors
  interactive: {
    primary: {
      bg: colorPalette.primary[500],
      text: '#FFFFFF',
      hover: colorPalette.primary[400],
      active: colorPalette.primary[300],
      disabled: colorPalette.primary[800],
    },
    secondary: {
      bg: colorPalette.secondary[500],
      text: '#FFFFFF',
      hover: colorPalette.secondary[400],
      active: colorPalette.secondary[300],
      disabled: colorPalette.secondary[800],
    },
    accent: {
      bg: colorPalette.accent[500],
      text: '#FFFFFF',
      hover: colorPalette.accent[400],
      active: colorPalette.accent[300],
      disabled: colorPalette.accent[800],
    },
  },
  
  // Status colors
  status: {
    success: {
      bg: colorPalette.success.DEFAULT,
      bgSubtle: `rgba(16, 185, 129, 0.2)`,
      text: '#FFFFFF',
      border: colorPalette.success.light,
      icon: colorPalette.success.light,
    },
    warning: {
      bg: colorPalette.warning.DEFAULT,
      bgSubtle: `rgba(245, 158, 11, 0.2)`,
      text: '#FFFFFF',
      border: colorPalette.warning.light,
      icon: colorPalette.warning.light,
    },
    error: {
      bg: colorPalette.error.DEFAULT,
      bgSubtle: `rgba(239, 68, 68, 0.2)`,
      text: '#FFFFFF',
      border: colorPalette.error.light,
      icon: colorPalette.error.light,
    },
    info: {
      bg: colorPalette.info.DEFAULT,
      bgSubtle: `rgba(59, 130, 246, 0.2)`,
      text: '#FFFFFF',
      border: colorPalette.info.light,
      icon: colorPalette.info.light,
    },
  },
};

// High contrast theme for accessibility
export const highContrastTheme = {
  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    muted: '#FFFFFF',
    disabled: '#999999',
    inverse: '#000000',
    link: '#FFFF00',
    linkHover: '#FFFFFF',
  },
  
  // Background colors
  background: {
    app: '#000000',
    card: '#121212',
    cardHover: '#1E1E1E',
    elevated: '#1E1E1E',
    subtle: '#121212',
  },
  
  // Border colors
  border: {
    default: '#FFFFFF',
    strong: '#FFFFFF',
    focus: '#FFFF00',
  },
  
  // Interactive element colors
  interactive: {
    primary: {
      bg: '#0066CC',
      text: '#FFFFFF',
      hover: '#0080FF',
      active: '#0059B3',
      disabled: '#333333',
    },
    secondary: {
      bg: '#CC0000',
      text: '#FFFFFF',
      hover: '#FF0000',
      active: '#990000',
      disabled: '#333333',
    },
    accent: {
      bg: '#00CC66',
      text: '#FFFFFF',
      hover: '#00FF80',
      active: '#00994D',
      disabled: '#333333',
    },
  },
  
  // Status colors
  status: {
    success: {
      bg: '#00CC00',
      bgSubtle: '#003300',
      text: '#FFFFFF',
      border: '#00FF00',
      icon: '#00FF00',
    },
    warning: {
      bg: '#FFCC00',
      bgSubtle: '#332900',
      text: '#000000',
      border: '#FFFF00',
      icon: '#FFFF00',
    },
    error: {
      bg: '#CC0000',
      bgSubtle: '#330000',
      text: '#FFFFFF',
      border: '#FF0000',
      icon: '#FF0000',
    },
    info: {
      bg: '#0066CC',
      bgSubtle: '#001A33',
      text: '#FFFFFF',
      border: '#0080FF',
      icon: '#0080FF',
    },
  },
};

// Function to get the current theme based on user preference
export function getThemeColors(theme: 'light' | 'dark' | 'high-contrast') {
  switch (theme) {
    case 'dark':
      return darkTheme;
    case 'high-contrast':
      return highContrastTheme;
    default:
      return lightTheme;
  }
}

// Contrast ratio calculation for accessibility testing
export function getContrastRatio(foreground: string, background: string): number {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  };

  // Calculate relative luminance
  const getLuminance = (rgb: number[]) => {
    const [r, g, b] = rgb.map(c => {
      const channel = c / 255;
      return channel <= 0.03928
        ? channel / 12.92
        : Math.pow((channel + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const rgb1 = hexToRgb(foreground);
  const rgb2 = hexToRgb(background);
  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  
  // Calculate contrast ratio
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return parseFloat(ratio.toFixed(2));
}

// Check if a color combination meets WCAG 2.1 standards
export function meetsAccessibilityStandards(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}