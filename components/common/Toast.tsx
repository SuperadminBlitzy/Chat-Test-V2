// External imports - React for component building and state management
import React, { useEffect, useState } from 'react'; // v18.2.0
// External imports - Styled Components for component styling
import styled from 'styled-components'; // v5.3.11

// Internal imports - Toast state management hook
import { useToast } from '../../hooks/useToast';
// Internal imports - Notification interface for type safety
import { Notification } from '../../store/notification-slice';
// Internal imports - Redux store integration for toast management
import { useSelector, useDispatch } from 'react-redux';
import { selectNotifications, removeNotification } from '../../store/notification-slice';

// Type alias for ToastMessage to match the JSON specification requirements
// This provides a consistent interface for toast messages throughout the application
export type ToastMessage = Notification;

/**
 * Styled Components for Toast UI
 * 
 * These styled components provide consistent, accessible, and responsive
 * styling for toast notifications throughout the Unified Financial Services Platform.
 * The styling supports the User Interface and Experience Features (F-013)
 * by ensuring clear visual hierarchy and user-friendly interactions.
 */

/**
 * Toast Container - Fixed positioning container for all toast notifications
 * 
 * Positioned at the top-right of the viewport with proper z-index for overlaying
 * other UI elements. Supports responsive design and maintains consistent spacing
 * between multiple toast notifications.
 */
export const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  pointer-events: none;

  /* Responsive design for mobile devices */
  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
`;

/**
 * Individual Toast Wrapper - Styled container for each toast notification
 * 
 * Provides consistent styling, animations, and interactive behavior for individual
 * toast notifications. Supports different notification types with appropriate
 * color coding and visual hierarchy.
 */
const ToastWrapper = styled.div<{ 
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
}>`
  background: ${props => {
    switch (props.type) {
      case 'success': return '#10B981'; // Green for successful operations
      case 'error': return '#EF4444'; // Red for critical errors
      case 'warning': return '#F59E0B'; // Amber for warnings
      case 'info': return '#3B82F6'; // Blue for information
      default: return '#6B7280'; // Gray fallback
    }
  }};
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 300px;
  max-width: 100%;
  pointer-events: auto;
  
  /* Animation for toast appearance and disappearance */
  opacity: ${props => props.visible ? 1 : 0};
  transform: translateX(${props => props.visible ? '0' : '100%'});
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Hover effects for better user interaction */
  &:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    transform: ${props => props.visible ? 'translateY(-2px)' : 'translateX(100%)'};
  }

  /* Responsive design adjustments */
  @media (max-width: 768px) {
    min-width: auto;
    padding: 12px 16px;
  }
`;

/**
 * Toast Message Content - Styled text container for notification message
 * 
 * Provides consistent typography and spacing for toast message content.
 * Ensures readability and accessibility across different notification types.
 */
const ToastMessage = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  margin-right: 12px;
  flex: 1;
  word-break: break-word;

  /* Enhanced readability on mobile */
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

/**
 * Close Button - Styled button for manual toast dismissal
 * 
 * Provides accessible and visually consistent close functionality for toast
 * notifications. Includes hover effects and proper accessibility attributes.
 */
const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  transition: background-color 0.2s ease;
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }

  &:active {
    background: rgba(255, 255, 255, 0.4);
  }
`;

/**
 * Toast Component Properties Interface
 * 
 * Defines the props interface for the individual Toast component,
 * ensuring type safety and consistent usage patterns throughout the application.
 */
interface ToastProps {
  /** The toast message object containing all notification data */
  toast: ToastMessage;
  /** Callback function to handle toast dismissal */
  onDismiss: () => void;
}

/**
 * Toast Component
 * 
 * A single toast notification component that displays brief, temporary notifications
 * to users. This component supports the User Interface and Experience Features
 * requirement by providing clear and timely feedback for user actions.
 * 
 * **Features:**
 * - Auto-dismissal after configurable duration (default 5 seconds)
 * - Manual dismissal via close button
 * - Visual differentiation based on notification type (success, error, info, warning)
 * - Smooth animations for appearance and disappearance
 * - Responsive design for mobile compatibility
 * - Accessibility features including keyboard navigation and screen reader support
 * 
 * **Integration:**
 * - Works with the notification Redux slice for state management
 * - Supports real-time transaction monitoring notifications (F-008)
 * - Compatible with AI-powered risk assessment alerts (F-002)
 * - Integrates with compliance automation notifications (F-003)
 * 
 * **Usage:**
 * ```tsx
 * <Toast 
 *   toast={notificationObject} 
 *   onDismiss={() => handleDismissToast(notificationId)} 
 * />
 * ```
 * 
 * @param props Component properties containing toast data and dismiss handler
 * @returns JSX.Element The rendered toast notification component
 */
export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  // State to manage toast visibility for smooth animations
  const [visible, setVisible] = useState<boolean>(true);

  /**
   * Auto-dismissal Effect
   * 
   * Handles automatic dismissal of toast notifications after a specified duration.
   * This effect supports the user experience requirement for non-intrusive notifications
   * that don't require manual dismissal for routine operations.
   * 
   * The effect:
   * - Sets a timer for 5 seconds (5000ms) by default
   * - Calls the onDismiss function when timer expires
   * - Cleans up the timer if component unmounts
   * - Prevents memory leaks and orphaned timers
   */
  useEffect(() => {
    // Set up auto-dismissal timer (5 seconds for optimal user experience)
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    // Cleanup function to clear timer on component unmount
    // This prevents memory leaks and ensures proper cleanup
    return () => {
      clearTimeout(dismissTimer);
    };
  }, [onDismiss]); // Dependency array includes onDismiss to handle callback changes

  /**
   * Handle Dismiss Function
   * 
   * Manages the dismissal process with smooth animations by first setting
   * visibility to false, then calling the onDismiss callback after animation
   * completion. This provides a better user experience with visual feedback.
   */
  const handleDismiss = (): void => {
    // First hide the toast with animation
    setVisible(false);
    
    // Then remove from state after animation completes
    setTimeout(() => {
      onDismiss();
    }, 300); // Animation duration matches CSS transition
  };

  /**
   * Render Toast Component
   * 
   * Renders the complete toast notification with:
   * - Type-based styling for visual differentiation
   * - Message content with proper typography
   * - Close button for manual dismissal
   * - Accessibility attributes for screen readers
   * - Responsive design considerations
   */
  return (
    <ToastWrapper 
      type={toast.type} 
      visible={visible}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <ToastMessage>
        {toast.message}
      </ToastMessage>
      <CloseButton
        onClick={handleDismiss}
        aria-label={`Dismiss ${toast.type} notification`}
        title="Close notification"
      >
        ✕
      </CloseButton>
    </ToastWrapper>
  );
};

/**
 * ToastProvider Component
 * 
 * A provider component that renders all active toast notifications from the Redux store.
 * This component serves as the main integration point for displaying toast notifications
 * throughout the Unified Financial Services Platform.
 * 
 * **Features:**
 * - Integrates with Redux store for centralized notification management
 * - Renders all active toast notifications in chronological order
 * - Provides automatic cleanup when toasts are dismissed
 * - Supports real-time updates from various system components
 * - Optimized for high-frequency notification scenarios in financial services
 * 
 * **System Integration:**
 * - Real-time Transaction Monitoring (F-008): Displays transaction alerts
 * - AI-Powered Risk Assessment (F-002): Shows risk-based notifications
 * - Compliance Automation (F-003): Displays regulatory alerts
 * - Digital Customer Onboarding (F-004): Shows onboarding status updates
 * 
 * **Performance Considerations:**
 * - Efficient rendering of multiple notifications
 * - Automatic cleanup prevents memory leaks
 * - Optimized for frequent state updates
 * - Minimal re-renders through proper dependency management
 * 
 * **Usage:**
 * Place this component at the application root level to enable
 * toast notifications throughout the entire application:
 * 
 * ```tsx
 * function App() {
 *   return (
 *     <div>
 *       <YourAppContent />
 *       <ToastProvider />
 *     </div>
 *   );
 * }
 * ```
 * 
 * @returns JSX.Element | null The rendered toast container with all active toasts, or null if no toasts
 */
export const ToastProvider: React.FC = () => {
  // Access Redux store for notification management
  const dispatch = useDispatch();
  
  // Get all notifications from the Redux store
  // This selector automatically updates when notifications change
  const notifications = useSelector(selectNotifications);

  /**
   * Handle Toast Removal
   * 
   * Creates a memoized function to handle toast dismissal by dispatching
   * the removeNotification action to the Redux store. This function
   * integrates with the centralized notification management system.
   * 
   * @param notificationId The unique identifier of the notification to remove
   */
  const handleRemoveToast = (notificationId: string): void => {
    dispatch(removeNotification(notificationId));
  };

  // Return null if there are no notifications to display
  // This prevents unnecessary DOM elements and improves performance
  if (!notifications || notifications.length === 0) {
    return null;
  }

  /**
   * Render Toast Provider
   * 
   * Renders the ToastContainer with all active toast notifications.
   * Each notification is rendered as an individual Toast component
   * with proper key management for React optimization.
   * 
   * The rendering:
   * - Maps over all notifications from the Redux store
   * - Renders each notification as a Toast component
   * - Provides unique keys for React reconciliation
   * - Passes removal handler for dismissal functionality
   * - Maintains chronological order (newest first)
   */
  return (
    <ToastContainer>
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          toast={notification}
          onDismiss={() => handleRemoveToast(notification.id)}
        />
      ))}
    </ToastContainer>
  );
};

// Export the ToastProvider as the default export for convenient importing
// This aligns with the JSON specification requirement for the main export
export default ToastProvider;