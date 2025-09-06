/**
 * useTheme Hook Module
 * 
 * A custom React hook that provides access to the theme context, allowing components 
 * to easily consume theme-related state and functions like toggling between dark and light modes.
 * 
 * This hook is a core part of the dark mode implementation as specified in section 7.7.6,
 * providing a simple and type-safe way for components to access and toggle the theme state 
 * managed by the ThemeContext.
 * 
 * Features:
 * - Type-safe access to theme context
 * - Proper error handling when used outside ThemeProvider
 * - Clean separation of concerns from context definition
 * - Production-ready error messages for developers
 * 
 * Usage:
 * ```typescript
 * const { theme, toggleTheme } = useTheme();
 * ```
 * 
 * @throws {Error} When used outside of a ThemeProvider
 */

import { useContext } from 'react'; // v18.2+
import { ThemeContext, ThemeContextType } from '../context/ThemeContext';

/**
 * Custom React hook that provides access to the theme context.
 * 
 * This hook serves as the primary interface for components to interact with the theme system.
 * It returns the current theme state and the function to toggle it, while ensuring that 
 * the hook is used within a component tree wrapped by ThemeProvider.
 * 
 * The hook implements robust error handling to guide developers when they attempt to use
 * it outside of the proper context provider, which is essential for maintaining the 
 * integrity of the theme system across the application.
 * 
 * As part of the Dark Mode Implementation (7.7.6), this hook enables:
 * - Access to current theme state (light/dark mode)
 * - Theme toggling functionality
 * - Type-safe theme operations
 * - Consistent theme behavior across components
 * 
 * @returns {ThemeContextType} The context value containing:
 *   - theme: Current theme state ('light' | 'dark')
 *   - toggleTheme: Function to toggle between light and dark modes
 * 
 * @throws {Error} If the hook is used outside of a ThemeProvider context.
 *   This error includes helpful guidance for developers on how to properly
 *   set up the theme context in their component tree.
 * 
 * @example
 * ```typescript
 * // Correct usage within a ThemeProvider
 * function MyComponent() {
 *   const { theme, toggleTheme } = useTheme();
 *   
 *   return (
 *     <div className={`container ${theme}`}>
 *       <button onClick={toggleTheme}>
 *         Switch to {theme === 'light' ? 'dark' : 'light'} mode
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Error case - used outside ThemeProvider
 * function BrokenComponent() {
 *   const { theme } = useTheme(); // This will throw an error
 *   return <div>{theme}</div>;
 * }
 * ```
 */
export const useTheme = (): ThemeContextType => {
  // Step 1: Call the useContext hook with ThemeContext to get the current context value
  const context = useContext(ThemeContext);

  // Step 2: Check if the context value is undefined
  // This indicates that the hook is not being used within a ThemeProvider
  if (context === undefined) {
    // Step 3: Throw a descriptive error to guide the developer
    throw new Error(
      'useTheme must be used within a ThemeProvider. ' +
      'Ensure that your component is wrapped with <ThemeProvider> to access theme functionality. ' +
      'The ThemeProvider should be placed at a higher level in your component tree to provide ' +
      'theme context to all child components that need to access theme state or toggle functionality.'
    );
  }

  // Step 4: Return the context value if it's defined
  // The context value includes theme state and toggleTheme function
  return context;
};