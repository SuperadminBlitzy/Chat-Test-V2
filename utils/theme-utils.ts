/**
 * Theme Utility Functions for Financial Services Web Application
 * 
 * This utility module provides comprehensive theme management functionality
 * for the web application, enabling seamless switching between light and dark modes
 * with proper design token application and user preference persistence.
 * 
 * Features:
 * - Dynamic theme application with CSS custom properties
 * - Local storage theme preference management
 * - System preference detection and fallback
 * - WCAG AA compliant color application
 * - Server-side rendering compatibility
 * 
 * @version 1.0.0
 * @author Financial Services UI Team
 */

import { designTokens } from '../styles/theme'; // v1.0.0

// Local type definition for Theme as string union since it's not available in common.ts
// This represents the theme selection rather than the full theme object
type Theme = 'light' | 'dark';

/**
 * Applies the selected theme (light or dark) to the application by setting CSS variables
 * on the root element. This function dynamically updates the application's visual appearance
 * by mapping design tokens to CSS custom properties.
 * 
 * The function retrieves the appropriate theme configuration from designTokens and
 * systematically applies all color tokens as CSS custom properties, enabling
 * real-time theme switching without page refresh.
 * 
 * @param theme - The theme to apply ('light' or 'dark')
 * @returns void - This function does not return a value
 * 
 * @example
 * ```typescript
 * // Apply dark theme to the application
 * applyTheme('dark');
 * 
 * // Apply light theme to the application
 * applyTheme('light');
 * ```
 */
export function applyTheme(theme: Theme): void {
  // Prevent execution in server-side rendering environments
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // Get the document root element for CSS custom property application
  const root = document.documentElement;
  
  // Select the appropriate theme configuration based on the theme parameter
  // Import the theme objects dynamically to avoid bundling unused themes
  let themeConfig;
  
  if (theme === 'dark') {
    // Import dark theme configuration
    import('../styles/theme').then(({ darkTheme }) => {
      themeConfig = darkTheme;
      applyThemeConfig(themeConfig, theme, root);
    });
  } else {
    // Import light theme configuration (default)
    import('../styles/theme').then(({ lightTheme }) => {
      themeConfig = lightTheme;
      applyThemeConfig(themeConfig, theme, root);
    });
  }
}

/**
 * Internal helper function to apply theme configuration to the document root
 * This function is separated to avoid code duplication between theme applications
 * 
 * @param themeConfig - The theme configuration object
 * @param theme - The theme name for data attribute
 * @param root - The document root element
 */
function applyThemeConfig(themeConfig: any, theme: Theme, root: HTMLElement): void {
  // Apply background colors as CSS custom properties
  if (themeConfig.colors.background) {
    Object.entries(themeConfig.colors.background).forEach(([key, value]) => {
      root.style.setProperty(`--background-${key}`, value as string);
    });
  }

  // Apply text colors as CSS custom properties
  if (themeConfig.colors.text) {
    Object.entries(themeConfig.colors.text).forEach(([key, value]) => {
      root.style.setProperty(`--text-${key}`, value as string);
    });
  }

  // Apply border colors as CSS custom properties
  if (themeConfig.colors.border) {
    Object.entries(themeConfig.colors.border).forEach(([key, value]) => {
      root.style.setProperty(`--border-${key}`, value as string);
    });
  }

  // Apply action colors as CSS custom properties
  if (themeConfig.colors.action) {
    Object.entries(themeConfig.colors.action).forEach(([key, value]) => {
      root.style.setProperty(`--action-${key}`, value as string);
    });
  }

  // Apply primary brand colors with all shades
  if (themeConfig.colors.primary) {
    Object.entries(themeConfig.colors.primary).forEach(([shade, value]) => {
      root.style.setProperty(`--primary-${shade}`, value as string);
    });
    // Set main primary color for backward compatibility
    root.style.setProperty('--primary-color', themeConfig.colors.primary[500] as string);
  }

  // Apply secondary brand colors with all shades
  if (themeConfig.colors.secondary) {
    Object.entries(themeConfig.colors.secondary).forEach(([shade, value]) => {
      root.style.setProperty(`--secondary-${shade}`, value as string);
    });
    // Set main secondary color for backward compatibility
    root.style.setProperty('--secondary-color', themeConfig.colors.secondary[500] as string);
  }

  // Apply success colors with all shades
  if (themeConfig.colors.success) {
    Object.entries(themeConfig.colors.success).forEach(([shade, value]) => {
      root.style.setProperty(`--success-${shade}`, value as string);
    });
    // Set main success color for backward compatibility
    root.style.setProperty('--success-color', themeConfig.colors.success[500] as string);
  }

  // Apply warning colors with all shades
  if (themeConfig.colors.warning) {
    Object.entries(themeConfig.colors.warning).forEach(([shade, value]) => {
      root.style.setProperty(`--warning-${shade}`, value as string);
    });
    // Set main warning color for backward compatibility
    root.style.setProperty('--warning-color', themeConfig.colors.warning[500] as string);
  }

  // Apply error colors with all shades
  if (themeConfig.colors.error) {
    Object.entries(themeConfig.colors.error).forEach(([shade, value]) => {
      root.style.setProperty(`--error-${shade}`, value as string);
    });
    // Set main error color for backward compatibility
    root.style.setProperty('--error-color', themeConfig.colors.error[500] as string);
  }

  // Apply neutral colors with all shades
  if (themeConfig.colors.neutral) {
    Object.entries(themeConfig.colors.neutral).forEach(([shade, value]) => {
      root.style.setProperty(`--neutral-${shade}`, value as string);
    });
  }

  // Apply shadows as CSS custom properties
  if (themeConfig.shadows) {
    Object.entries(themeConfig.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value as string);
    });
  }

  // Set data-theme attribute on the root element for CSS theme-specific selectors
  // This enables theme-aware styling in CSS using attribute selectors
  root.setAttribute('data-theme', theme);

  // Dispatch a custom event to notify components of theme change
  // This allows React components to respond to theme changes if needed
  const themeChangeEvent = new CustomEvent('themeChange', {
    detail: { theme, themeConfig }
  });
  window.dispatchEvent(themeChangeEvent);
}

/**
 * Determines the initial theme for the application on page load.
 * 
 * This function implements a priority-based theme detection system:
 * 1. First checks for a saved theme preference in localStorage
 * 2. Falls back to system preference via prefers-color-scheme media query
 * 3. Defaults to 'light' theme if no preference is detected
 * 
 * The function includes server-side rendering compatibility checks to prevent
 * errors during build-time rendering or hydration processes.
 * 
 * @returns Theme - The initial theme ('light' or 'dark')
 * 
 * @example
 * ```typescript
 * // Get the initial theme on application startup
 * const initialTheme = getInitialTheme();
 * console.log(`Initial theme: ${initialTheme}`); // 'light' or 'dark'
 * 
 * // Apply the initial theme
 * applyTheme(initialTheme);
 * ```
 */
export function getInitialTheme(): Theme {
  // Server-side rendering compatibility check
  // Return default theme if window is not available (SSR environment)
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    // Attempt to retrieve saved theme preference from localStorage
    // This preserves user's explicit theme choice across sessions
    const savedTheme = localStorage.getItem('theme');
    
    // Validate that the saved theme is one of the expected values
    // This prevents invalid theme values from causing application errors
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  } catch (error) {
    // Handle localStorage access errors (e.g., in private browsing mode)
    // Log the error for debugging but continue with fallback logic
    console.warn('Unable to access localStorage for theme preference:', error);
  }

  // Fallback to system preference if no saved theme is found
  // Use CSS media query to detect user's system color scheme preference
  try {
    // Check if the browser supports prefers-color-scheme media query
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (error) {
    // Handle potential matchMedia errors in older browsers
    console.warn('Unable to detect system color scheme preference:', error);
  }

  // Final fallback to light theme
  // This ensures the function always returns a valid theme value
  return 'light';
}

/**
 * Saves the user's theme preference to local storage for persistence across sessions.
 * 
 * This function ensures that user theme preferences are maintained when they
 * return to the application. It includes error handling for environments where
 * localStorage is not available (e.g., private browsing mode, certain security settings).
 * 
 * The function also includes server-side rendering compatibility to prevent
 * errors during build processes or hydration.
 * 
 * @param theme - The theme to save ('light' or 'dark')
 * @returns void - This function does not return a value
 * 
 * @example
 * ```typescript
 * // Save user's preference for dark theme
 * setThemePreference('dark');
 * 
 * // Save user's preference for light theme
 * setThemePreference('light');
 * 
 * // The preference will be retrieved on next visit via getInitialTheme()
 * ```
 */
export function setThemePreference(theme: Theme): void {
  // Server-side rendering compatibility check
  // Prevent execution if window is not available
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Save theme preference to localStorage with consistent key
    // This key is also used by getInitialTheme() for retrieval
    localStorage.setItem('theme', theme);
    
    // Optional: Log successful theme preference save for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Theme preference saved: ${theme}`);
    }
  } catch (error) {
    // Handle localStorage access errors gracefully
    // This can occur in private browsing mode or when storage is disabled
    console.warn('Unable to save theme preference to localStorage:', error);
    
    // Optional: Attempt to use sessionStorage as fallback
    try {
      sessionStorage.setItem('theme', theme);
      console.warn('Theme preference saved to sessionStorage as fallback');
    } catch (sessionError) {
      console.warn('Unable to save theme preference to sessionStorage:', sessionError);
      // Could implement additional fallback strategies here (e.g., cookies)
    }
  }
}

/**
 * Utility function to toggle between light and dark themes
 * This is a convenience function that combines getInitialTheme, setThemePreference, and applyTheme
 * 
 * @returns Theme - The new theme after toggling
 */
export function toggleTheme(): Theme {
  // Get current theme from localStorage or system preference
  const currentTheme = getInitialTheme();
  
  // Determine the opposite theme
  const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
  
  // Apply and save the new theme
  applyTheme(newTheme);
  setThemePreference(newTheme);
  
  return newTheme;
}

/**
 * Utility function to check if the current theme is dark mode
 * This can be useful for conditional rendering or logic based on theme
 * 
 * @returns boolean - True if current theme is dark, false otherwise
 */
export function isDarkMode(): boolean {
  return getInitialTheme() === 'dark';
}

/**
 * Utility function to get all available theme names
 * This can be useful for theme selection UI components
 * 
 * @returns Theme[] - Array of available theme names
 */
export function getAvailableThemes(): Theme[] {
  return ['light', 'dark'];
}

/**
 * Advanced utility function to listen for system theme changes
 * This enables automatic theme switching when user changes system preference
 * 
 * @param callback - Function to call when system theme changes
 * @returns Function - Cleanup function to remove the listener
 */
export function watchSystemTheme(callback: (theme: Theme) => void): () => void {
  // Server-side rendering compatibility
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {}; // Return no-op cleanup function
  }

  // Create media query for dark mode preference
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Define the change handler
  const handleChange = (event: MediaQueryListEvent) => {
    const newTheme: Theme = event.matches ? 'dark' : 'light';
    callback(newTheme);
  };

  // Add event listener
  mediaQuery.addEventListener('change', handleChange);

  // Return cleanup function
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}