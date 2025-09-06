import React, { useMemo } from 'react'; // react@18.2.0
import { usePagination, DOTS } from '../../hooks/usePagination';
import Button from './Button';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { cn } from '../../lib/utils';

/**
 * Props interface for the Pagination component
 * 
 * Defines the configuration options for the reusable pagination component
 * that supports the Customer Dashboard (F-013), Advisor Workbench (F-014),
 * Compliance Control Center (F-015), and Risk Management Console (F-016)
 * as specified in the User Interface and Experience Features requirements.
 */
interface PaginationProps {
  /** 
   * Callback function triggered when page changes
   * Receives the new page number as parameter (1-based indexing)
   */
  onPageChange: (page: number) => void;
  
  /** 
   * Total number of items to paginate across all pages
   * Used to calculate the total number of pages available
   */
  totalCount: number;
  
  /** 
   * Number of sibling pages to show around the current page
   * Default value is 1, showing one page before and after current page
   * Controls the density of page numbers displayed in the pagination control
   */
  siblingCount?: number;
  
  /** 
   * Current active page number (1-based indexing)
   * Determines which page button appears as selected/active
   */
  currentPage: number;
  
  /** 
   * Number of items displayed per page
   * Used in conjunction with totalCount to determine total pages
   */
  pageSize: number;
  
  /** 
   * Optional CSS class name for custom styling
   * Merged with default styles using the cn utility function
   */
  className?: string;
}

/**
 * Pagination Component
 * 
 * A comprehensive, accessible, and reusable pagination component that serves as a
 * fundamental UI element for the unified financial services platform. This component
 * addresses the User Interface and Experience Features requirement (F-013 to F-016)
 * by providing consistent navigation patterns across all dashboard interfaces.
 * 
 * Key Features:
 * - Intelligent page range calculation with ellipsis support
 * - Configurable sibling count for flexible pagination display
 * - Accessible keyboard navigation and screen reader support
 * - Enterprise-grade error handling and edge case management
 * - Consistent visual design following the platform design system
 * - Performance optimized through React.useMemo for expensive calculations
 * - Type-safe implementation with comprehensive TypeScript support
 * 
 * The component follows WCAG 2.1 AA accessibility guidelines and supports:
 * - Keyboard navigation with Tab and Enter keys
 * - Screen reader compatibility with proper ARIA labels
 * - High contrast support for visually impaired users
 * - Focus management for optimal user experience
 * 
 * Technical Implementation:
 * - Uses the custom usePagination hook for sophisticated pagination logic
 * - Leverages the Button component for consistent styling and behavior
 * - Implements chevron icons for intuitive previous/next navigation
 * - Utilizes the cn utility for robust class name management
 * - Optimized performance through strategic use of React.useMemo
 * 
 * Use Cases:
 * - Customer Dashboard: Navigate through customer records and transactions
 * - Advisor Workbench: Browse client portfolios and financial data
 * - Compliance Control Center: Page through audit logs and compliance reports
 * - Risk Management Console: Navigate risk assessments and monitoring data
 * 
 * @param props - Pagination component configuration
 * @returns JSX.Element representing the pagination control, or null if pagination is unnecessary
 * 
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={currentPage}
 *   totalCount={totalRecords}
 *   pageSize={25}
 *   onPageChange={handlePageChange}
 *   siblingCount={1}
 *   className="my-custom-pagination"
 * />
 * ```
 */
const Pagination: React.FC<PaginationProps> = ({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  className
}) => {
  // Step 2: Use the usePagination custom hook to get the pagination range
  // This hook provides intelligent page range calculation with ellipsis support
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize
  });

  // Step 3: If there is only one page or less, return null
  // No pagination needed when all data fits on a single page
  // Also handles edge cases where totalCount is 0 or pagination calculation fails
  if (!paginationRange || currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  // Step 5: Determine the last page number for navigation boundary checks
  // Extract the last item from paginationRange, handling both number and DOTS
  const lastPage = paginationRange[paginationRange.length - 1];
  const lastPageNumber = typeof lastPage === 'number' ? lastPage : Math.ceil(totalCount / pageSize);

  // Step 4: Define onNext and onPrevious functions to handle page changes
  // These functions provide safe navigation with boundary checking
  const onNext = () => {
    if (currentPage < lastPageNumber) {
      onPageChange(currentPage + 1);
    }
  };

  const onPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // Memoized calculation for determining if navigation buttons should be disabled
  // Optimizes performance by avoiding recalculation on every render
  const navigationState = useMemo(() => ({
    isPreviousDisabled: currentPage <= 1,
    isNextDisabled: currentPage >= lastPageNumber
  }), [currentPage, lastPageNumber]);

  // Step 6: Render the pagination container with proper accessibility attributes
  return (
    <nav
      className={cn(
        // Base container styling with flexbox layout
        'flex items-center justify-center space-x-1',
        // Enterprise-grade spacing and responsive design
        'px-4 py-3 sm:px-6',
        // Accessibility and focus management
        'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
        // Custom className support
        className
      )}
      role="navigation"
      aria-label="Pagination Navigation"
      data-testid="pagination-container"
    >
      {/* Step 7: Render the 'previous' button, disabling it if on the first page */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrevious}
        disabled={navigationState.isPreviousDisabled}
        className={cn(
          // Base button styling for previous navigation
          'flex items-center justify-center w-9 h-9 rounded-md',
          // Hover and focus states
          'hover:bg-gray-100 focus:bg-gray-100',
          // Disabled state styling
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Go to previous page"
        data-testid="pagination-previous"
      >
        <ChevronLeftIcon 
          width={16} 
          height={16} 
          aria-hidden="true"
        />
      </Button>

      {/* Step 8: Map through the paginationRange array to render page buttons */}
      {paginationRange.map((pageNumber, index) => {
        // Step 9: If an item in the range is a DOTS indicator, render an ellipsis
        if (pageNumber === DOTS) {
          return (
            <span
              key={`dots-${index}`}
              className={cn(
                // Ellipsis styling that matches button dimensions
                'flex items-center justify-center w-9 h-9',
                // Typography styling consistent with page buttons
                'text-sm font-medium text-gray-500',
                // Accessibility considerations
                'select-none'
              )}
              aria-label="More pages"
              data-testid={`pagination-dots-${index}`}
            >
              &#8230; {/* HTML entity for horizontal ellipsis */}
            </span>
          );
        }

        // Step 10: If an item is a page number, render a page button
        // Highlight the button if it's the current page
        const isCurrentPage = pageNumber === currentPage;
        
        return (
          <Button
            key={pageNumber}
            variant={isCurrentPage ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onPageChange(pageNumber as number)}
            className={cn(
              // Base button styling for page numbers
              'flex items-center justify-center w-9 h-9 rounded-md',
              // Current page styling with enhanced visual emphasis
              isCurrentPage && [
                'bg-blue-600 text-white shadow-sm',
                'hover:bg-blue-700 focus:bg-blue-700'
              ],
              // Non-current page styling with subtle hover effects
              !isCurrentPage && [
                'text-gray-700 hover:bg-gray-100 focus:bg-gray-100'
              ]
            )}
            aria-label={isCurrentPage 
              ? `Current page, page ${pageNumber}` 
              : `Go to page ${pageNumber}`
            }
            aria-current={isCurrentPage ? 'page' : undefined}
            data-testid={`pagination-page-${pageNumber}`}
          >
            <span className="text-sm font-medium">
              {pageNumber}
            </span>
          </Button>
        );
      })}

      {/* Step 11: Render the 'next' button, disabling it if on the last page */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        disabled={navigationState.isNextDisabled}
        className={cn(
          // Base button styling for next navigation
          'flex items-center justify-center w-9 h-9 rounded-md',
          // Hover and focus states
          'hover:bg-gray-100 focus:bg-gray-100',
          // Disabled state styling
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Go to next page"
        data-testid="pagination-next"
      >
        <ChevronRightIcon 
          width={16} 
          height={16} 
          aria-hidden="true"
        />
      </Button>
    </nav>
  );
};

export default Pagination;