// External imports - React v18.2.0 for context management and hooks
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'; // v18.2.0

// Internal imports - Toast management hook for notification display
import useToast from '../hooks/useToast';
// Internal imports - Toast component for rendering toast notifications
import Toast from '../components/common/Toast';
// Internal imports - Notification interface from Redux store
import { Notification } from '../store/notification-slice';

/**
 * Children Prop Interface
 * 
 * Defines the interface for components that accept children props.
 * This interface supports the component composition pattern used throughout
 * the Unified Financial Services Platform for flexible UI architecture.
 */
interface ChildrenProp {
  /** React children elements to be rendered within the provider */
  children: ReactNode;
}

/**
 * Notification Context Type Interface
 * 
 * Defines the complete interface for the notification context, providing
 * comprehensive notification management capabilities for the User Interface
 * and Experience Features (F-013). This context serves as the central hub
 * for all notification-related operations throughout the financial platform.
 * 
 * **Features Supported:**
 * - F-013: Customer Dashboard - Centralized notification management
 * - F-008: Real-time Transaction Monitoring - Transaction alert notifications
 * - F-002: AI-Powered Risk Assessment - Risk-based notification alerts
 * - F-003: Regulatory Compliance Automation - Compliance status notifications
 * - F-004: Digital Customer Onboarding - Onboarding progress notifications
 * 
 * **Context Architecture:**
 * - Integrates with Redux store for persistent notification state
 * - Provides toast notification functionality for temporary alerts
 * - Supports both persistent and temporary notification patterns
 * - Enables real-time notification updates across the application
 * - Maintains notification history for audit and compliance purposes
 */
interface NotificationContextType {
  /** Array of all active notifications in the system */
  notifications: Notification[];
  
  /** Function to add a new notification to the system */
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  
  /** Function to remove a specific notification by ID */
  removeNotification: (notificationId: string) => void;
  
  /** Function to mark a specific notification as read */
  markAsRead: (notificationId: string) => void;
  
  /** Function to clear all existing notifications */
  clearNotifications: () => void;
  
  /** Function to display a toast notification with automatic dismissal */
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
  
  /** Count of unread notifications for badge displays */
  unreadCount: number;
}

/**
 * Notification Context Creation
 * 
 * Creates the React context for notification management with undefined as initial value.
 * This context serves as the foundation for the notification system throughout the
 * Unified Financial Services Platform, enabling components to access and manage
 * notifications consistently across the entire application.
 * 
 * **Context Benefits:**
 * - Centralized notification state management
 * - Consistent notification behavior across all components
 * - Integration with both Redux store and local component state
 * - Support for real-time notification updates
 * - Seamless integration with toast notification system
 * - Optimized performance through context memoization
 * 
 * **Integration Points:**
 * - Works with notification Redux slice for persistent storage
 * - Integrates with useToast hook for temporary notifications
 * - Supports WebSocket connections for real-time updates
 * - Compatible with event-driven architecture patterns
 * - Enables notification audit trails for compliance requirements
 */
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * NotificationProvider Component
 * 
 * A comprehensive provider component that manages notification state and provides
 * notification functionality to all child components. This component serves as the
 * central hub for notification management in the Unified Financial Services Platform.
 * 
 * **Component Features:**
 * - State management for active notifications using React useState
 * - Integration with useToast hook for toast notification functionality
 * - Memoized notification handler functions for optimal performance
 * - Real-time notification rendering with proper lifecycle management
 * - Support for both persistent notifications and temporary toasts
 * - Automatic cleanup and memory management for notification objects
 * 
 * **Business Requirements Addressed:**
 * - F-013: Customer Dashboard - Provides notification infrastructure
 * - User Interface and Experience Features - Enhances user feedback mechanisms
 * - Real-time Transaction Monitoring - Enables instant transaction alerts
 * - Compliance Automation - Supports regulatory notification requirements
 * - Risk Assessment Integration - Displays AI-generated risk alerts
 * 
 * **Technical Architecture:**
 * - Uses React's Context API for state distribution
 * - Implements optimized re-rendering patterns with useCallback
 * - Integrates with Redux store through useToast hook
 * - Supports high-frequency notification updates for financial services
 * - Maintains notification chronological ordering for audit purposes
 * - Provides comprehensive error handling and state validation
 * 
 * **Performance Optimizations:**
 * - Memoized context value prevents unnecessary re-renders
 * - Efficient notification array management with proper indexing
 * - Optimized notification removal using array filtering
 * - Lazy evaluation of unread count calculation
 * - Minimal DOM updates through conditional rendering
 * 
 * **Usage Example:**
 * ```tsx
 * function App() {
 *   return (
 *     <NotificationProvider>
 *       <CustomerDashboard />
 *       <TransactionMonitor />
 *       <ComplianceCenter />
 *     </NotificationProvider>
 *   );
 * }
 * ```
 * 
 * @param props Component props containing children to wrap with notification context
 * @returns JSX.Element The provider component with notification context and rendered notifications
 */
export const NotificationProvider: React.FC<ChildrenProp> = ({ children }) => {
  // Initialize state for managing active notifications
  // This state maintains all persistent notifications that require user interaction
  // or remain visible until explicitly dismissed by the user or system
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initialize toast functionality using the useToast hook
  // This provides integration with the Redux store for toast notifications
  // and enables temporary notification display with automatic dismissal
  const { toast } = useToast();

  /**
   * Add Notification Function
   * 
   * Creates and adds a new notification to the notifications state array.
   * This function handles the complete lifecycle of notification creation,
   * including ID generation, timestamp assignment, and state management.
   * 
   * **Functionality:**
   * - Generates unique notification ID using timestamp and random string
   * - Assigns current timestamp for chronological ordering
   * - Sets initial read status to false for new notifications
   * - Adds notification to the beginning of array for proper ordering
   * - Maintains notification state consistency and integrity
   * 
   * **Use Cases:**
   * - Transaction completion notifications from monitoring system
   * - Risk assessment alerts from AI-powered engine
   * - Compliance status updates from automation system
   * - Customer onboarding progress notifications
   * - System maintenance and security alerts
   * 
   * **Integration Points:**
   * - Compatible with real-time WebSocket notification streams
   * - Supports event-driven architecture notification patterns
   * - Integrates with audit logging for compliance requirements
   * - Works with notification persistence layer if implemented
   * 
   * @param notificationData Partial notification object without ID and timestamp
   */
  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
    // Generate unique notification identifier using timestamp and random string
    // This ensures each notification has a unique ID for proper state management
    // and tracking throughout the application lifecycle
    const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create complete notification object with all required properties
    const newNotification: Notification = {
      id: notificationId,
      type: notificationData.type,
      message: notificationData.message,
      read: false, // New notifications are always unread initially
      timestamp: Date.now() // Current timestamp for chronological ordering
    };

    // Add notification to the beginning of the array for chronological order
    // This ensures the most recent notifications appear first in the UI
    setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
  }, []); // Empty dependency array for stable callback reference

  /**
   * Remove Notification Function
   * 
   * Removes a specific notification from the state by filtering out the
   * notification with the matching ID. This function provides efficient
   * notification cleanup and maintains optimal performance with large
   * notification arrays.
   * 
   * **Functionality:**
   * - Filters notifications array to exclude the specified notification
   * - Maintains array integrity and chronological ordering
   * - Handles non-existent notification IDs gracefully
   * - Provides immediate visual feedback through state update
   * - Supports bulk notification removal patterns
   * 
   * **Use Cases:**
   * - User dismissing notifications from notification center
   * - Automatic cleanup of expired or resolved notifications
   * - System-triggered removal of outdated alerts
   * - Bulk notification management operations
   * - Memory optimization through notification lifecycle management
   * 
   * **Performance Considerations:**
   * - Efficient array filtering operation
   * - Minimal computational overhead for large notification sets
   * - Optimized for frequent notification removal scenarios
   * - Maintains React rendering performance through proper state updates
   * 
   * @param notificationId Unique identifier of the notification to remove
   */
  const removeNotification = useCallback((notificationId: string) => {
    // Filter out the notification with the specified ID
    // This operation maintains array integrity while removing the target notification
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== notificationId)
    );
  }, []); // Empty dependency array for stable callback reference

  /**
   * Mark As Read Function
   * 
   * Updates the read status of a specific notification to true, indicating
   * that the user has viewed or acknowledged the notification. This function
   * supports notification tracking and user engagement analytics.
   * 
   * **Functionality:**
   * - Locates notification by ID within the notifications array
   * - Updates read status while preserving all other notification properties
   * - Maintains notification array ordering and structure
   * - Provides immediate UI feedback for read status changes
   * - Supports bulk read operations through repeated invocation
   * 
   * **Use Cases:**
   * - User viewing notifications in notification center
   * - Automatic read marking when notifications are displayed
   * - Notification engagement tracking for analytics
   * - Bulk read operations for notification management
   * - Integration with user interaction monitoring systems
   * 
   * **State Management:**
   * - Uses functional state update for optimal performance
   * - Immutable array operations maintain React rendering consistency
   * - Efficient object property updates within array context
   * - Proper state synchronization for real-time UI updates
   * 
   * @param notificationId Unique identifier of the notification to mark as read
   */
  const markAsRead = useCallback((notificationId: string) => {
    // Update the notifications array by mapping over it and updating the target notification
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []); // Empty dependency array for stable callback reference

  /**
   * Clear Notifications Function
   * 
   * Removes all notifications from the state, providing a complete reset
   * of the notification system. This function supports bulk notification
   * management and user-initiated cleanup operations.
   * 
   * **Functionality:**
   * - Resets notifications array to empty state
   * - Maintains state consistency and integrity
   * - Provides immediate UI feedback through complete state update
   * - Supports application reset and cleanup scenarios
   * - Enables bulk notification management workflows
   * 
   * **Use Cases:**
   * - User clearing all notifications from notification center
   * - System maintenance and cleanup operations
   * - Application session reset scenarios
   * - Bulk notification management by administrators
   * - Memory optimization during application lifecycle
   * 
   * **Performance Benefits:**
   * - Single state update operation for maximum efficiency
   * - Minimal computational overhead for bulk operations
   * - Optimal React rendering performance through state reset
   * - Immediate memory cleanup for notification objects
   * 
   */
  const clearNotifications = useCallback(() => {
    // Reset notifications array to empty state
    setNotifications([]);
  }, []); // Empty dependency array for stable callback reference

  /**
   * Show Toast Function
   * 
   * Displays a temporary toast notification using the integrated useToast hook.
   * This function provides a convenient interface for showing brief, auto-dismissing
   * notifications that don't require persistent storage or user interaction.
   * 
   * **Functionality:**
   * - Integrates with Redux store through useToast hook
   * - Supports all notification types (success, error, info, warning)
   * - Provides optional duration parameter for custom timing
   * - Handles automatic dismissal and cleanup
   * - Maintains consistent toast behavior across the application
   * 
   * **Use Cases:**
   * - Transaction completion confirmations
   * - Error messages for failed operations
   * - System status updates and alerts
   * - User action feedback and confirmations
   * - Temporary informational messages
   * 
   * **Integration Benefits:**
   * - Seamless integration with existing toast notification system
   * - Consistent visual styling and behavior patterns
   * - Automatic cleanup and memory management
   * - Support for high-frequency notification scenarios
   * - Compatible with real-time monitoring and alert systems
   * 
   * @param message Human-readable notification content for display
   * @param type Notification type determining visual styling and priority
   * @param duration Optional duration in milliseconds for auto-dismissal
   */
  const showToast = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' | 'warning',
    duration?: number
  ) => {
    // Use the toast function from useToast hook with proper parameters
    toast(message, { type, duration });
  }, [toast]); // Dependency array includes toast function for proper memoization

  /**
   * Calculate Unread Count
   * 
   * Computes the number of unread notifications by filtering the notifications
   * array and counting items where read status is false. This calculation
   * provides real-time unread count for badge displays and user interfaces.
   * 
   * **Performance Optimization:**
   * - Calculated during render cycle for optimal performance
   * - Efficient filtering operation with minimal overhead
   * - Memoized through component re-render cycle
   * - Supports real-time badge updates in navigation components
   */
  const unreadCount = notifications.filter(notification => !notification.read).length;

  /**
   * Context Value Memoization
   * 
   * Creates a memoized context value object containing all notification-related
   * state and functions. This optimization prevents unnecessary re-renders of
   * consuming components when the provider re-renders for unrelated reasons.
   * 
   * **Memoization Benefits:**
   * - Prevents unnecessary re-renders of consuming components
   * - Optimizes performance for high-frequency notification updates
   * - Maintains stable object reference for React optimization
   * - Supports efficient context propagation in large component trees
   * 
   * **Context Value Structure:**
   * - Contains all notification state and management functions
   * - Provides consistent API for all consuming components
   * - Supports both persistent and temporary notification patterns
   * - Enables comprehensive notification management workflows
   */
  const contextValue = React.useMemo(
    () => ({
      notifications,
      addNotification,
      removeNotification,
      markAsRead,
      clearNotifications,
      showToast,
      unreadCount
    }),
    [
      notifications,
      addNotification,
      removeNotification,
      markAsRead,
      clearNotifications,
      showToast,
      unreadCount
    ]
  );

  /**
   * Render NotificationProvider
   * 
   * Renders the complete notification provider including:
   * - NotificationContext.Provider with memoized context value
   * - Child components wrapped with notification context access
   * - Active notifications rendered with proper component lifecycle
   * - Toast notifications managed through integrated toast system
   * 
   * **Rendering Strategy:**
   * - Provides context value to all child components
   * - Renders active notifications with proper key management
   * - Maintains optimal rendering performance through memoization
   * - Supports both persistent notifications and temporary toasts
   * - Enables real-time notification updates throughout the component tree
   * 
   * **Component Architecture:**
   * - Context provider wraps all child components
   * - Notification components receive proper props and handlers
   * - Toast system integration provides temporary notification support
   * - Proper cleanup and lifecycle management for all notification types
   */
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Render active notifications */}
      {notifications.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxWidth: '400px',
            pointerEvents: 'none'
          }}
        >
          {notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                background: notification.type === 'success' ? '#10B981' :
                           notification.type === 'error' ? '#EF4444' :
                           notification.type === 'warning' ? '#F59E0B' : '#3B82F6',
                color: 'white',
                padding: '16px 20px',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minWidth: '300px',
                maxWidth: '100%',
                pointerEvents: 'auto',
                opacity: notification.read ? 0.7 : 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              role="alert"
              aria-live="polite"
              aria-atomic="true"
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  lineHeight: '1.4',
                  marginRight: '12px',
                  flex: 1,
                  wordBreak: 'break-word'
                }}
              >
                {notification.message}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s ease',
                  minWidth: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label={`Dismiss ${notification.type} notification`}
                title="Close notification"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Toast notifications are handled by the ToastProvider from the Toast component */}
      <Toast />
    </NotificationContext.Provider>
  );
};

/**
 * useNotification Custom Hook
 * 
 * A custom React hook that provides convenient access to the NotificationContext.
 * This hook ensures type safety, proper error handling, and consistent usage
 * patterns throughout the Unified Financial Services Platform.
 * 
 * **Hook Features:**
 * - Type-safe access to notification context
 * - Automatic validation of context availability
 * - Clear error messaging for development debugging
 * - Consistent API for all consuming components
 * - Integration with TypeScript for enhanced development experience
 * 
 * **Error Handling:**
 * - Throws descriptive error if used outside NotificationProvider
 * - Provides clear guidance for proper hook usage
 * - Supports development-time debugging and troubleshooting
 * - Ensures proper component hierarchy and context availability
 * 
 * **Usage Patterns:**
 * ```tsx
 * function CustomerDashboard() {
 *   const {
 *     notifications,
 *     addNotification,
 *     showToast,
 *     unreadCount
 *   } = useNotification();
 * 
 *   const handleTransactionComplete = () => {
 *     showToast('Transaction completed successfully', 'success');
 *     addNotification({
 *       type: 'success',
 *       message: 'Your transaction has been processed'
 *     });
 *   };
 * 
 *   return (
 *     <div>
 *       <h1>Dashboard {unreadCount > 0 && `(${unreadCount})`}</h1>
 *       {notifications.map(notification => (
 *         <NotificationItem key={notification.id} notification={notification} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 * 
 * **Integration Benefits:**
 * - Seamless integration with all notification management functions
 * - Access to both persistent and temporary notification systems
 * - Real-time notification updates and state synchronization
 * - Support for complex notification workflows and user interactions
 * - Compatible with event-driven architecture and real-time monitoring
 * 
 * **Performance Considerations:**
 * - Minimal overhead through direct context access
 * - Efficient re-rendering through context memoization
 * - Optimized for high-frequency notification updates
 * - Supports large-scale financial applications with real-time requirements
 * 
 * @returns NotificationContextType Complete notification context with all functions and state
 * @throws Error if used outside of NotificationProvider
 */
export const useNotification = (): NotificationContextType => {
  // Access the notification context using React's useContext hook
  const context = useContext(NotificationContext);

  // Validate that the hook is being used within a NotificationProvider
  // This check ensures proper component hierarchy and prevents runtime errors
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider. ' +
      'Please wrap your component tree with <NotificationProvider> to enable notification functionality.'
    );
  }

  // Return the complete notification context for consuming components
  return context;
};

// Export the NotificationProvider as default for convenient importing
// This aligns with the JSON specification requirement for the main component export
export default NotificationProvider;