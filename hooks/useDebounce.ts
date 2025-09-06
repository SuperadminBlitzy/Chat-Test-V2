import { useState, useEffect } from 'react'; // v18.2.0

/**
 * Custom React hook that debounces a value by delaying its update until after
 * the specified delay has passed without the value changing.
 * 
 * This hook is designed to optimize performance by preventing excessive re-renders
 * and API calls triggered by rapid user input changes. Common use cases include
 * search inputs, form validation, and any scenario where you want to wait for
 * user input to stabilize before triggering expensive operations.
 * 
 * @template T - The type of the value being debounced
 * @param {T} value - The value to be debounced
 * @param {number} delay - The delay in milliseconds to wait before updating the debounced value
 * @returns {T} The debounced value, which updates only after the specified delay has passed
 * 
 * @example
 * ```typescript
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 * 
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // Perform API call only after user stops typing for 300ms
 *     searchAPI(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  // Initialize a state variable 'debouncedValue' using useState,
  // setting its initial value to the value parameter
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  // Use the useEffect hook to create a side effect that runs whenever
  // the value or delay parameters change
  useEffect(() => {
    // Set up a timer using setTimeout
    // The timer's callback function will update the 'debouncedValue' state
    // with the current value after the delay has passed
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // The useEffect hook returns a cleanup function
    // This cleanup function clears the timeout using clearTimeout if the value
    // or delay changes before the timeout completes, or if the component unmounts.
    // This prevents the debounced value from updating prematurely.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Dependencies array ensures effect runs when value or delay changes

  // Return the debouncedValue state variable
  return debouncedValue;
}