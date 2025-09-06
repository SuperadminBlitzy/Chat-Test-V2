import { useState, useMemo } from 'react'; // React v18.2+

/**
 * Constant representing ellipsis (...) in pagination controls
 * Used to indicate that there are more pages between the visible page numbers
 */
export const DOTS = '...';

/**
 * Interface defining the parameters for the usePagination hook
 */
interface UsePaginationProps {
  /** Total number of items to paginate */
  totalCount: number;
  /** Number of items per page */
  pageSize: number;
  /** Number of sibling pages to show around the current page (default: 1) */
  siblingCount?: number;
  /** Current active page number (1-based) */
  currentPage: number;
}

/**
 * Type definition for pagination range items
 * Can be either a page number or the DOTS constant
 */
type PaginationRange = (number | typeof DOTS)[];

/**
 * Helper function to generate a range of numbers
 * @param start - Starting number (inclusive)
 * @param end - Ending number (inclusive)
 * @returns Array of numbers from start to end
 */
const range = (start: number, end: number): number[] => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

/**
 * Custom React hook for managing pagination logic
 * 
 * This hook provides sophisticated pagination logic that handles various scenarios
 * including showing ellipsis when there are too many pages to display at once.
 * It's designed to work with enterprise-grade data tables and lists that need
 * to handle large datasets efficiently.
 * 
 * Key features:
 * - Intelligent page range calculation with ellipsis support
 * - Configurable sibling count for flexible pagination display
 * - Optimized performance through useMemo for expensive calculations
 * - Type-safe implementation with comprehensive TypeScript support
 * - Handles edge cases like small datasets and boundary conditions
 * 
 * @param props - Configuration object for pagination
 * @returns Array representing the pagination range to be rendered
 * 
 * @example
 * ```typescript
 * const paginationRange = usePagination({
 *   totalCount: 500,
 *   pageSize: 10,
 *   siblingCount: 1,
 *   currentPage: 7
 * });
 * // Returns: [1, DOTS, 6, 7, 8, DOTS, 50]
 * ```
 */
export const usePagination = ({
  totalCount,
  pageSize,
  siblingCount = 1,
  currentPage
}: UsePaginationProps): PaginationRange => {
  const paginationRange = useMemo(() => {
    // Calculate total number of pages by dividing totalCount by pageSize and rounding up
    const totalPages = Math.ceil(totalCount / pageSize);

    // Calculate the minimum number of page buttons to show
    // This includes: first page, last page, current page, siblings, and potential dots
    const totalPageNumbers = siblingCount + 5; // +5 for first, last, current, and 2 potential dots

    /*
     * CASE 1: Simple case - total pages is less than or equal to the page numbers we want to show
     * In this case, we display all pages without any ellipsis
     */
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    /*
     * Calculate left and right sibling indices
     * These represent the pages immediately adjacent to the current page
     */
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    /*
     * Determine whether to show dots on the left and right sides
     * We show left dots if there's a gap between the first page and left sibling
     * We show right dots if there's a gap between the right sibling and last page
     * 
     * We add 2 to account for the page number itself and one potential dot
     */
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    /*
     * CASE 2: No left dots to show, but right dots should be shown
     * Pattern: [1, 2, 3, 4, 5, ..., totalPages]
     */
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);

      return [...leftRange, DOTS, totalPages];
    }

    /*
     * CASE 3: No right dots to show, but left dots should be shown
     * Pattern: [1, ..., 46, 47, 48, 49, 50]
     */
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);

      return [firstPageIndex, DOTS, ...rightRange];
    }

    /*
     * CASE 4: Both left and right dots should be shown
     * Pattern: [1, ..., 11, 12, 13, ..., 50]
     */
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);

      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    // Fallback - should never reach here with proper input validation
    return [];
  }, [totalCount, pageSize, siblingCount, currentPage]);

  return paginationRange;
};

/**
 * Default export for the pagination hook
 * Provides the main functionality for pagination logic
 */
export default usePagination;