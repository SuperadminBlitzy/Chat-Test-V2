import React from 'react'; // react@18.2.0

/**
 * Props interface for the Loading component
 * Defines the structure for customizing the loading spinner appearance
 */
interface LoadingProps {
  /**
   * The size of the loading spinner
   * - 'sm': Small spinner (16x16px) for compact areas
   * - 'md': Medium spinner (24x24px) for general use - DEFAULT
   * - 'lg': Large spinner (32x32px) for prominent loading states
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Additional CSS classes to apply to the spinner container
   * Allows for custom styling while maintaining base functionality
   */
  className?: string;
}

/**
 * Loading Component
 * 
 * A reusable, accessible loading indicator component that provides visual feedback
 * during asynchronous operations such as data fetching, form submissions, and
 * API calls. This component contributes to the User Experience KPIs by ensuring
 * users receive immediate feedback during loading states, improving perceived
 * performance and user satisfaction in the financial services platform.
 * 
 * Features:
 * - SVG-based smooth spinning animation
 * - Fully accessible with proper ARIA attributes
 * - Responsive sizing options for different contexts
 * - Tailwind CSS styling for consistency with design system
 * - Enterprise-grade code quality with comprehensive documentation
 * 
 * @param props - The component props
 * @returns JSX.Element representing the animated loading spinner
 */
const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  /**
   * Determine spinner dimensions and stroke width based on size prop
   * These values are optimized for visual balance across different sizes
   */
  const sizeClasses = {
    sm: 'w-4 h-4', // 16x16px - Compact areas, inline loading
    md: 'w-6 h-6', // 24x24px - Standard loading states
    lg: 'w-8 h-8'  // 32x32px - Prominent loading indicators
  };

  /**
   * SVG stroke width adjusted proportionally to spinner size
   * Ensures consistent visual weight across all size variants
   */
  const strokeWidths = {
    sm: '3',
    md: '3',
    lg: '2.5'
  };

  /**
   * Get the appropriate CSS classes for the selected size
   */
  const spinnerSizeClass = sizeClasses[size];
  const strokeWidth = strokeWidths[size];

  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label="Loading content, please wait"
    >
      <svg
        className={`${spinnerSizeClass} animate-spin text-blue-600`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        role="img"
        aria-hidden="true"
      >
        {/* 
          Accessible title for screen readers 
          Provides context about the loading state
        */}
        <title>Loading spinner</title>
        
        {/* 
          Background circle - light gray track 
          Provides visual context for the spinning indicator
        */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="opacity-25"
        />
        
        {/* 
          Animated arc - blue indicator that rotates
          Creates the spinning effect through CSS animation
          The partial stroke creates the moving progress indicator
        */}
        <path
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          className="opacity-75"
        />
      </svg>
      
      {/* 
        Screen reader only text for accessibility
        Provides meaningful context for assistive technologies
      */}
      <span className="sr-only">
        Loading content, please wait...
      </span>
    </div>
  );
};

export default Loading;