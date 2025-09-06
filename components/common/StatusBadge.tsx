import React from 'react'; // v18.2.0
import clsx from 'clsx'; // v2.1.0

/**
 * Props interface for the StatusBadge component
 * Defines the structure for component inputs including status type, content, and styling
 */
interface StatusBadgeProps {
  /**
   * The status to display. Determines the color scheme of the badge.
   * - 'success': Green color scheme for positive/completed states
   * - 'warning': Yellow color scheme for caution/attention states  
   * - 'error': Red color scheme for error/failed states
   * - 'info': Blue color scheme for informational states
   * - 'pending': Gray color scheme for waiting/processing states
   */
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  
  /**
   * The content to be displayed inside the badge.
   * Can be text, numbers, or other React elements
   */
  children: React.ReactNode;
  
  /**
   * Optional additional CSS classes for custom styling.
   * Allows for component customization while maintaining base functionality
   */
  className?: string;
}

/**
 * StatusBadge Component
 * 
 * A reusable UI component that displays status information with appropriate color coding
 * and styling. Used across various dashboards (Customer, Advisor, Compliance, Risk) to 
 * provide clear visual cues for different states such as transaction status, compliance 
 * checks, user onboarding progress, and system health indicators.
 * 
 * Features:
 * - Consistent visual language across all UI components
 * - Accessible color contrasts for readability
 * - Flexible content support (text, icons, numbers)
 * - Extensible styling via className prop
 * - Type-safe status definitions
 * 
 * @param props - Component properties including status, children, and optional className
 * @returns JSX.Element representing the styled status badge
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children, className }) => {
  // Define mapping of status types to corresponding CSS classes for background, text, and border colors
  // Each status type has been carefully designed to meet accessibility standards and provide
  // clear visual distinction for users across different UI contexts
  const statusClasses = {
    success: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200', 
    error: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    pending: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
  };

  // Construct the final className string by combining:
  // 1. Base badge styling for consistent appearance
  // 2. Status-specific color classes based on the status prop
  // 3. Any additional custom classes passed via className prop
  const badgeClassName = clsx(
    // Base badge styles - provides consistent foundation for all status badges
    'inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium border transition-colors duration-200 ease-in-out',
    // Status-specific classes - applies appropriate color scheme based on status
    statusClasses[status],
    // Optional additional classes - allows for component customization
    className
  );

  // Render a span element with the constructed className and children content
  // The span element is semantic and provides proper accessibility context
  return (
    <span
      className={badgeClassName}
      role="status"
      aria-label={`Status: ${status}`}
      data-testid={`status-badge-${status}`}
    >
      {children}
    </span>
  );
};

// Export the StatusBadge component for use throughout the application
// This component serves as a fundamental building block for status visualization
// across Customer Dashboard, Advisor Workbench, Compliance Control Center, and Risk Management Console
export { StatusBadge };
export type { StatusBadgeProps };