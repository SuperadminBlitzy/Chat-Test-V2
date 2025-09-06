/**
 * Design Tokens and Theme System for Financial Services Application
 * 
 * This file defines the complete design token system and theme configurations
 * for the web application, ensuring consistent styling, accessibility compliance,
 * and dark mode support across all UI components.
 * 
 * Features:
 * - Comprehensive design token system
 * - WCAG AA compliant color palettes
 * - Dark mode support with proper contrast ratios
 * - Responsive breakpoint system
 * - Typography scale optimized for financial data
 * - Consistent spacing and layout tokens
 * 
 * @version 1.0.0
 * @author Financial Services UI Team
 */

/**
 * Core design tokens that serve as the foundation for all theme variations.
 * These tokens define the base visual language of the application including
 * color palettes, typography scales, spacing units, and other design elements.
 */
export const designTokens = {
  /**
   * Color system with semantic color scales
   * Each color has multiple shades (50-900) for flexible usage
   * Colors are optimized for financial applications with professional appearance
   */
  colors: {
    // Primary brand colors - Professional blue palette
    primary: {
      50: '#e3f2fd',   // Lightest tint for backgrounds
      100: '#bbdefb',  // Light tint for hover states
      200: '#90caf9',  // Medium-light for borders
      300: '#64b5f6',  // Medium for secondary elements
      400: '#42a5f5',  // Medium-dark for interactive elements
      500: '#2196f3',  // Base primary color - main brand color
      600: '#1e88e5',  // Darker for active states
      700: '#1976d2',  // Dark for emphasis
      800: '#1565c0',  // Darker for high contrast
      900: '#0d47a1'   // Darkest for maximum contrast
    },
    
    // Secondary colors - Professional purple palette
    secondary: {
      50: '#f3e5f5',   // Lightest tint
      100: '#e1bee7',  // Light tint
      200: '#ce93d8',  // Medium-light
      300: '#ba68c8',  // Medium
      400: '#ab47bc',  // Medium-dark
      500: '#9c27b0',  // Base secondary color
      600: '#8e24aa',  // Darker
      700: '#7b1fa2',  // Dark for emphasis
      800: '#6a1b9a',  // Darker for contrast
      900: '#4a148c'   // Darkest
    },
    
    // Success colors - Green palette for positive states
    success: {
      50: '#e8f5e8',   // Light background for success messages
      100: '#c8e6c9',  // Light tint
      200: '#a5d6a7',  // Medium-light
      300: '#81c784',  // Medium
      400: '#66bb6a',  // Medium-dark
      500: '#4caf50',  // Base success color
      600: '#43a047',  // Darker
      700: '#388e3c',  // Dark for emphasis
      800: '#2e7d32',  // Darker
      900: '#1b5e20'   // Darkest
    },
    
    // Warning colors - Orange palette for cautionary states
    warning: {
      50: '#fff3e0',   // Light background for warnings
      100: '#ffe0b2',  // Light tint
      200: '#ffcc80',  // Medium-light
      300: '#ffb74d',  // Medium
      400: '#ffa726',  // Medium-dark
      500: '#ff9800',  // Base warning color
      600: '#fb8c00',  // Darker
      700: '#f57c00',  // Dark for emphasis
      800: '#ef6c00',  // Darker
      900: '#e65100'   // Darkest
    },
    
    // Error colors - Red palette for error states
    error: {
      50: '#ffebee',   // Light background for errors
      100: '#ffcdd2',  // Light tint
      200: '#ef9a9a',  // Medium-light
      300: '#e57373',  // Medium
      400: '#ef5350',  // Medium-dark
      500: '#f44336',  // Base error color
      600: '#e53935',  // Darker
      700: '#d32f2f',  // Dark for emphasis
      800: '#c62828',  // Darker
      900: '#b71c1c'   // Darkest
    },
    
    // Neutral grayscale palette for text, borders, and backgrounds
    neutral: {
      50: '#fafafa',   // Lightest gray - subtle backgrounds
      100: '#f5f5f5',  // Very light gray - card backgrounds
      200: '#eeeeee',  // Light gray - dividers
      300: '#e0e0e0',  // Medium-light gray - borders
      400: '#bdbdbd',  // Medium gray - disabled states
      500: '#9e9e9e',  // Base gray - placeholder text
      600: '#757575',  // Medium-dark gray - secondary text
      700: '#616161',  // Dark gray - body text
      800: '#424242',  // Darker gray - headings
      900: '#212121'   // Darkest gray - high contrast text
    }
  },
  
  /**
   * Typography system with carefully selected font families and scales
   * Optimized for financial data display and readability
   */
  typography: {
    // Font family definitions
    fontFamily: {
      // Primary font stack for body text and UI elements
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      // Monospace font for financial data, codes, and technical content
      monospace: '"JetBrains Mono", "Fira Code", "SF Mono", Monaco, "Cascadia Code", monospace'
    },
    
    // Type scale for consistent text sizing
    fontSize: {
      xs: '0.75rem',    // 12px - Small captions, labels
      sm: '0.875rem',   // 14px - Secondary text, form labels
      base: '1rem',     // 16px - Base body text
      lg: '1.125rem',   // 18px - Large body text
      xl: '1.25rem',    // 20px - Small headings
      '2xl': '1.5rem',  // 24px - Medium headings
      '3xl': '1.875rem', // 30px - Large headings
      '4xl': '2.25rem'  // 36px - Display headings
    },
    
    // Font weight scale for text hierarchy
    fontWeight: {
      normal: 400,    // Regular text
      medium: 500,    // Medium emphasis
      semibold: 600,  // Strong emphasis
      bold: 700       // Headings and high emphasis
    },
    
    // Line height scale for optimal readability
    lineHeight: {
      tight: 1.25,    // Compact spacing for headings
      normal: 1.5,    // Standard spacing for body text
      relaxed: 1.75   // Loose spacing for large text blocks
    }
  },
  
  /**
   * Spacing scale for consistent layout and component spacing
   * Based on 0.25rem (4px) increments for pixel-perfect alignment
   */
  spacing: {
    0: '0',          // No spacing
    1: '0.25rem',    // 4px - Minimal spacing
    2: '0.5rem',     // 8px - Small spacing
    3: '0.75rem',    // 12px - Medium-small spacing
    4: '1rem',       // 16px - Base unit spacing
    5: '1.25rem',    // 20px - Medium spacing
    6: '1.5rem',     // 24px - Large spacing
    8: '2rem',       // 32px - Extra large spacing
    10: '2.5rem',    // 40px - Section spacing
    12: '3rem',      // 48px - Large section spacing
    16: '4rem',      // 64px - Page section spacing
    20: '5rem',      // 80px - Large page spacing
    24: '6rem'       // 96px - Maximum spacing
  },
  
  /**
   * Border radius scale for consistent rounded corners
   * Optimized for modern UI with subtle rounded elements
   */
  borderRadius: {
    none: '0',        // Sharp corners
    sm: '0.125rem',   // 2px - Subtle rounding
    base: '0.25rem',  // 4px - Standard rounding
    md: '0.375rem',   // 6px - Medium rounding
    lg: '0.5rem',     // 8px - Large rounding
    xl: '0.75rem',    // 12px - Extra large rounding
    '2xl': '1rem',    // 16px - Very large rounding
    full: '9999px'    // Fully rounded (pills, circles)
  },
  
  /**
   * Shadow system for depth and elevation
   * Provides subtle depth without overwhelming the interface
   */
  shadows: {
    // Small shadow for subtle elevation
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    // Base shadow for cards and panels
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    // Medium shadow for elevated elements
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    // Large shadow for prominent elements
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    // Extra large shadow for modals and overlays
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  
  /**
   * Responsive breakpoint system
   * Matches Material Design breakpoints for consistent responsive behavior
   */
  breakpoints: {
    xs: '0px',      // Extra small devices (phones)
    sm: '600px',    // Small devices (large phones, small tablets)
    md: '960px',    // Medium devices (tablets)
    lg: '1280px',   // Large devices (laptops)
    xl: '1920px'    // Extra large devices (desktops)
  }
} as const;

/**
 * Light theme configuration extending the base design tokens
 * Optimized for daytime use with high contrast and professional appearance
 * Ensures WCAG AA compliance for accessibility
 */
export const lightTheme = {
  ...designTokens,
  
  /**
   * Light theme specific color overrides
   * Maintains semantic meaning while optimizing for light backgrounds
   */
  colors: {
    ...designTokens.colors,
    
    // Theme-specific semantic colors
    background: {
      primary: '#ffffff',        // Pure white for main content areas
      secondary: '#fafafa',      // Subtle gray for secondary backgrounds
      tertiary: '#f5f5f5',      // Light gray for cards and panels
      paper: '#ffffff',          // White for elevated surfaces
      overlay: 'rgba(0, 0, 0, 0.5)' // Semi-transparent overlay
    },
    
    // Text colors optimized for light backgrounds
    text: {
      primary: '#212121',        // High contrast for primary text
      secondary: '#616161',      // Medium contrast for secondary text
      disabled: '#9e9e9e',       // Low contrast for disabled text
      hint: '#757575',           // Subtle text for hints and placeholders
      inverse: '#ffffff'         // White text for dark backgrounds
    },
    
    // Border and divider colors
    border: {
      primary: '#e0e0e0',        // Subtle borders
      secondary: '#eeeeee',      // Light borders
      focus: '#2196f3',          // Focus indicator color
      error: '#f44336'           // Error state borders
    },
    
    // Interactive element colors
    action: {
      hover: 'rgba(0, 0, 0, 0.04)',     // Hover state background
      selected: 'rgba(33, 150, 243, 0.12)', // Selected state background
      disabled: 'rgba(0, 0, 0, 0.26)',  // Disabled state color
      focus: 'rgba(33, 150, 243, 0.12)' // Focus state background
    }
  }
} as const;

/**
 * Dark theme configuration for low-light environments
 * Provides comfortable viewing experience while maintaining accessibility
 * Uses carefully selected colors that reduce eye strain
 */
export const darkTheme = {
  ...designTokens,
  
  /**
   * Dark theme specific color overrides
   * Optimized for low-light conditions with appropriate contrast ratios
   */
  colors: {
    ...designTokens.colors,
    
    // Dark theme background colors
    background: {
      primary: '#121212',        // Dark gray primary background
      secondary: '#1e1e1e',      // Slightly lighter for secondary areas
      tertiary: '#2d2d2d',       // Medium dark for elevated surfaces
      paper: '#1e1e1e',          // Elevated surface color
      overlay: 'rgba(0, 0, 0, 0.7)' // Darker overlay for modals
    },
    
    // Text colors optimized for dark backgrounds
    text: {
      primary: '#ffffff',        // High contrast white text
      secondary: '#b3b3b3',      // Medium contrast light gray
      disabled: '#666666',       // Lower contrast for disabled states
      hint: '#888888',           // Subtle text for hints
      inverse: '#212121'         // Dark text for light backgrounds
    },
    
    // Dark theme border colors
    border: {
      primary: '#404040',        // Subtle borders on dark background
      secondary: '#333333',      // Lighter borders
      focus: '#64b5f6',          // Lighter blue for focus (better contrast)
      error: '#ef5350'           // Lighter red for errors
    },
    
    // Dark theme interactive colors
    action: {
      hover: 'rgba(255, 255, 255, 0.08)',   // Light hover on dark
      selected: 'rgba(100, 181, 246, 0.16)', // Selected state
      disabled: 'rgba(255, 255, 255, 0.3)',  // Disabled state
      focus: 'rgba(100, 181, 246, 0.16)'     // Focus state
    },
    
    // Adjusted brand colors for better dark theme contrast
    primary: {
      ...designTokens.colors.primary,
      500: '#64b5f6',  // Lighter primary for better contrast on dark
      700: '#42a5f5'   // Adjusted for dark theme usage
    },
    
    secondary: {
      ...designTokens.colors.secondary,
      500: '#ba68c8',  // Lighter secondary for dark theme
      700: '#ab47bc'   // Adjusted for dark theme usage
    }
  },
  
  /**
   * Dark theme shadow adjustments
   * Subtle shadows that work well on dark backgrounds
   */
  shadows: {
    // Lighter shadows for dark theme
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
  }
} as const;

/**
 * Type definitions for theme objects
 * Provides TypeScript support for theme properties
 */
export type DesignTokens = typeof designTokens;
export type LightTheme = typeof lightTheme;
export type DarkTheme = typeof darkTheme;
export type Theme = LightTheme | DarkTheme;

/**
 * Utility type for accessing nested theme properties
 * Enables type-safe access to deeply nested theme values
 */
export type TokenPath<T> = T extends object 
  ? { [K in keyof T]: K extends string 
      ? T[K] extends object 
        ? `${K}.${TokenPath<T[K]>}` 
        : K 
      : never 
    }[keyof T] 
  : never;

/**
 * Theme context type for React context usage
 * Includes theme object and theme switching functionality
 */
export interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

/**
 * Default theme export (light theme)
 * Used as the default theme when no theme preference is specified
 */
export default lightTheme;

/**
 * Theme utility functions for common theme operations
 */
export const themeUtils = {
  /**
   * Get a nested theme value by path
   * @param theme - Theme object
   * @param path - Dot-separated path to the value
   * @returns The theme value or undefined
   */
  getTokenValue: <T extends Theme>(theme: T, path: string): any => {
    return path.split('.').reduce((obj, key) => obj?.[key], theme as any);
  },
  
  /**
   * Check if a theme is dark mode
   * @param theme - Theme object to check
   * @returns True if theme is dark mode
   */
  isDarkTheme: (theme: Theme): boolean => {
    return theme.colors.background.primary === '#121212';
  },
  
  /**
   * Get contrasting text color for a background
   * @param backgroundColor - Background color hex value
   * @returns Appropriate text color (light or dark)
   */
  getContrastText: (backgroundColor: string): string => {
    // Simple contrast calculation - in production, use a proper contrast ratio calculator
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#212121' : '#ffffff';
  }
} as const;