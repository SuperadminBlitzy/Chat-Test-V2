/**
 * ThemeContext Module
 * 
 * Provides theme management functionality for the Unified Financial Services Platform.
 * This context manages the application's light/dark mode theme, persists user preferences
 * to local storage, and applies theme changes to the document root element for global styling.
 * 
 * Part of the Design System Architecture as outlined in the technical specifications,
 * providing centralized theme management to all components throughout the application.
 * 
 * Features:
 * - Light/Dark mode toggling
 * - Local storage persistence of theme preferences
 * - System preference detection as fallback
 * - Global theme application via document attributes
 * - Type-safe context implementation with proper error handling
 */

import { createContext, useContext, useState, useEffect, useCallback, PropsWithChildren } from 'react'; // v18.2.0
import storage from '../lib/storage';

/**
 * Type definition for the available themes in the application
 * Supports light and dark modes as per the Dark Mode Implementation requirements
 */
export type Theme = 'light' | 'dark';

/**
 * Type definition for the theme context value
 * Provides access to the current theme and the toggle function
 */
export type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

/**
 * Storage key for persisting theme preference in local storage
 */
const THEME_STORAGE_KEY = 'theme-preference';

/**
 * Data attribute name applied to the document root element
 * Used for global CSS theme styling
 */
const THEME_DATA_ATTRIBUTE = 'data-theme';

/**
 * React Context for theme management
 * Initialized as undefined to enforce proper provider usage
 */
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Detects the user's preferred color scheme from the system
 * Falls back to 'light' if unable to detect or if matchMedia is not supported
 * 
 * @returns {Theme} The detected system theme preference
 */
const getSystemThemePreference = (): Theme => {
  // Check if we're in a browser environment and matchMedia is supported
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }

  try {
    // Query the system for dark mode preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    return mediaQuery.matches ? 'dark' : 'light';
  } catch (error) {
    // Log error and fallback to light theme if matchMedia fails
    console.warn('Unable to detect system theme preference:', error);
    return 'light';
  }
};

/**
 * Retrieves the initial theme preference from local storage or system preference
 * Provides a robust fallback chain: storage -> system -> default light
 * 
 * @returns {Theme} The initial theme to use
 */
const getInitialTheme = (): Theme => {
  // First, try to get the theme from local storage
  const storedTheme = storage.getItem(THEME_STORAGE_KEY);
  
  // Validate that the stored theme is a valid Theme type
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  // If no valid stored theme, use system preference
  return getSystemThemePreference();
};

/**
 * ThemeProvider Component
 * 
 * Provides theme context to its children components. Manages theme state,
 * handles theme changes, persists preferences to local storage, and applies
 * theme changes to the document root element for global styling.
 * 
 * This component should wrap the entire application or major sections that
 * need theme support.
 * 
 * @param {PropsWithChildren<{}>} props - Component props with children
 * @returns {JSX.Element} The ThemeProvider component
 */
export const ThemeProvider = ({ children }: PropsWithChildren<{}>): JSX.Element => {
  // Initialize theme state with value from storage or system preference
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  /**
   * Toggles between light and dark themes
   * Memoized to prevent unnecessary re-renders of consuming components
   */
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  /**
   * Effect to handle theme changes
   * Updates the document root element and persists to local storage
   */
  useEffect(() => {
    // Apply theme to document root element for global CSS styling
    if (typeof document !== 'undefined') {
      try {
        document.documentElement.setAttribute(THEME_DATA_ATTRIBUTE, theme);
      } catch (error) {
        console.error('Failed to apply theme to document element:', error);
      }
    }

    // Persist theme preference to local storage
    try {
      storage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Failed to persist theme preference to storage:', error);
    }
  }, [theme]);

  /**
   * Effect to listen for system theme changes when no explicit preference is stored
   * This ensures the app responds to system-wide theme changes
   */
  useEffect(() => {
    // Only listen for system changes if we're using system preference
    const storedTheme = storage.getItem(THEME_STORAGE_KEY);
    if (storedTheme) {
      // User has an explicit preference, don't override it
      return;
    }

    // Check if matchMedia is supported
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Handler for system theme changes
      const handleSystemThemeChange = (event: MediaQueryListEvent) => {
        const newTheme = event.matches ? 'dark' : 'light';
        setTheme(newTheme);
      };

      // Add event listener for system theme changes
      mediaQuery.addEventListener('change', handleSystemThemeChange);

      // Cleanup function to remove event listener
      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    } catch (error) {
      console.warn('Failed to set up system theme change listener:', error);
    }
  }, []);

  // Create context value object
  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme Hook
 * 
 * Custom hook that provides easy access to the theme context.
 * Ensures that the hook is used within a ThemeProvider and provides
 * helpful error messaging if used incorrectly.
 * 
 * This hook should be used by components that need to access the current
 * theme or the theme toggle function.
 * 
 * @returns {ThemeContextType} The theme context value containing theme and toggleTheme
 * @throws {Error} If used outside of a ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  // Get the context value using useContext hook
  const context = useContext(ThemeContext);

  // Check if the hook is being used within a ThemeProvider
  if (context === undefined) {
    throw new Error(
      'useTheme must be used within a ThemeProvider. ' +
      'Please wrap your component tree with <ThemeProvider> to use theme functionality.'
    );
  }

  return context;
};