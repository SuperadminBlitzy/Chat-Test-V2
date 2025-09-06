import { clsx, type ClassValue } from 'clsx' // v2.1.0
import { twMerge } from 'tailwind-merge' // v2.2.1

/**
 * A comprehensive utility function that intelligently merges Tailwind CSS classes
 * with conditional class name support. This function is essential for building
 * maintainable and conflict-free UI components in enterprise React applications.
 * 
 * The function combines the power of two industry-standard libraries:
 * - clsx: Handles conditional class names and various input formats
 * - tailwind-merge: Resolves conflicting Tailwind CSS utility classes
 * 
 * This approach ensures that:
 * 1. Conditional classes are properly handled (falsy values are ignored)
 * 2. Conflicting Tailwind classes are resolved (e.g., 'px-2 px-4' becomes 'px-4')
 * 3. Custom CSS classes are preserved alongside Tailwind utilities
 * 4. Performance is optimized through intelligent class deduplication
 * 
 * @param inputs - Variable number of class value inputs that can be:
 *   - strings: 'btn primary'
 *   - objects: { 'btn': true, 'primary': isActive }
 *   - arrays: ['btn', { 'primary': isActive }]
 *   - mixed combinations of the above
 *   - undefined/null values (automatically filtered out)
 * 
 * @returns A clean, deduplicated string of merged class names optimized for
 *          Tailwind CSS with all conflicts resolved and conditional classes applied
 * 
 * @example
 * // Basic usage
 * cn('btn', 'primary') // 'btn primary'
 * 
 * // Conditional classes
 * cn('btn', { 'primary': true, 'disabled': false }) // 'btn primary'
 * 
 * // Tailwind conflict resolution
 * cn('px-2', 'px-4') // 'px-4' (later class wins)
 * 
 * // Complex component styling
 * cn(
 *   'base-button-styles',
 *   variant === 'primary' && 'bg-blue-500 text-white',
 *   variant === 'secondary' && 'bg-gray-200 text-gray-800',
 *   size === 'large' && 'px-6 py-3 text-lg',
 *   disabled && 'opacity-50 cursor-not-allowed',
 *   className // Additional classes from props
 * )
 * 
 * @since 1.0.0
 * @author Frontend Engineering Team
 * @category Styling Utilities
 */
export function cn(...inputs: ClassValue[]): string {
  // Step 1: Use clsx to handle conditional class names and normalize all inputs
  // This processes various input formats (strings, objects, arrays, conditionals)
  // and filters out any falsy values, returning a space-separated string
  const conditionalClasses = clsx(inputs)
  
  // Step 2: Apply tailwind-merge to resolve any conflicting Tailwind CSS classes
  // This ensures that when multiple classes affect the same CSS property,
  // the last one takes precedence (following Tailwind's utility-first approach)
  // Example: 'text-red-500 text-blue-500' becomes 'text-blue-500'
  const mergedClasses = twMerge(conditionalClasses)
  
  // Step 3: Return the final optimized class string
  // The result is a clean, conflict-free string ready for DOM application
  return mergedClasses
}

// Export the function as the default export for convenience
// This allows for both named and default import patterns:
// import { cn } from './utils' or import cn from './utils'
export default cn

/**
 * Type re-export for convenience when working with the cn function
 * This allows consumers to import the ClassValue type directly from this module
 * instead of having to import it separately from clsx
 * 
 * @example
 * import { cn, type ClassValue } from '@/lib/utils'
 * 
 * function createDynamicClasses(baseClass: ClassValue, conditionalClass: ClassValue) {
 *   return cn(baseClass, conditionalClass)
 * }
 */
export type { ClassValue }

/**
 * Configuration constants for the utility function
 * These can be used for debugging or extending functionality in the future
 */
export const CN_CONFIG = {
  /**
   * Library versions used for dependency tracking and compatibility
   */
  CLSX_VERSION: '2.1.0',
  TAILWIND_MERGE_VERSION: '2.2.1',
  
  /**
   * Performance metrics tracking (can be enabled in development)
   */
  ENABLE_PERFORMANCE_TRACKING: process.env.NODE_ENV === 'development',
} as const

/**
 * Enhanced version of cn with performance monitoring for development environments
 * This wrapper provides additional debugging capabilities when needed
 * 
 * @internal This function is for internal development use only
 */
export function cnWithMetrics(...inputs: ClassValue[]): string {
  if (!CN_CONFIG.ENABLE_PERFORMANCE_TRACKING) {
    return cn(...inputs)
  }
  
  const startTime = performance.now()
  const result = cn(...inputs)
  const endTime = performance.now()
  
  // Log performance metrics in development
  if (endTime - startTime > 1) { // Only log if processing takes more than 1ms
    console.debug(`cn() processing time: ${(endTime - startTime).toFixed(3)}ms`, {
      inputs: inputs.length,
      outputLength: result.length,
      result: result.substring(0, 100) + (result.length > 100 ? '...' : '')
    })
  }
  
  return result
}