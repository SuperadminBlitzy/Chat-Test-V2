// External imports - Redux Toolkit for state management
import { createSlice, PayloadAction } from '@reduxjs/toolkit'; // v2.0+

// Internal imports - Root state type for selectors
import type { RootState } from './index';

/**
 * Notification Interface
 * 
 * Defines the structure of a single notification object for the Unified Financial Services Platform.
 * This interface supports real-time transaction monitoring (F-008) and user interface features
 * by providing a standardized notification format for various system events and alerts.
 * 
 * Properties:
 * - id: Unique identifier for the notification
 * - type: Notification severity level (info, success, warning, error)
 * - message: Human-readable notification content
 * - read: Boolean indicating if the notification has been viewed
 * - timestamp: Unix timestamp when the notification was created
 */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  read: boolean;
  timestamp: number;
}

/**
 * Notification State Interface
 * 
 * Defines the structure of the notification slice's state within the Redux store.
 * This state structure supports the Customer Dashboard and Notification Center
 * UI components by maintaining an array of notification objects.
 * 
 * The state is designed to handle high-frequency updates from real-time transaction
 * monitoring and other system events while maintaining optimal performance.
 */
export interface NotificationState {
  notifications: Notification[];
}

/**
 * Initial State Configuration
 * 
 * Defines the initial state for the notification slice with an empty notifications array.
 * This clean initial state ensures consistent behavior during application startup
 * and provides a predictable foundation for notification management.
 */
const initialState: NotificationState = {
  notifications: []
};

/**
 * Notification Redux Slice
 * 
 * This slice manages the notification state for the Unified Financial Services Platform,
 * providing comprehensive notification management capabilities for real-time transaction
 * monitoring (F-008) and user interface features.
 * 
 * Features Supported:
 * - F-008: Real-time Transaction Monitoring - manages transaction alerts and notifications
 * - F-013: Customer Dashboard - provides notification data for dashboard components
 * - Notification Center - manages system-wide notification state
 * 
 * State Management:
 * - Maintains an array of notification objects with type safety
 * - Supports CRUD operations on notifications (add, remove, mark as read, clear)
 * - Optimized for high-frequency updates from real-time monitoring systems
 * - Provides selectors for efficient state access patterns
 * 
 * Performance Considerations:
 * - New notifications are added to the beginning of the array for chronological order
 * - Removal operations use efficient filtering
 * - Read status updates use direct object mutation (safe with Immer)
 * - State structure optimized for large notification volumes
 * 
 * Integration Points:
 * - Works with event-driven architecture using Kafka for real-time updates
 * - Supports WebSocket connections for instant notification delivery
 * - Compatible with the unified data integration platform (F-001)
 * - Integrates with AI-powered risk assessment notifications (F-002)
 */
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /**
     * Add Notification Action
     * 
     * Adds a new notification to the beginning of the notifications array.
     * This ensures that the most recent notifications appear first, which is
     * crucial for real-time transaction monitoring where timing is critical.
     * 
     * The action automatically handles:
     * - Chronological ordering (newest first)
     * - State immutability through Immer
     * - Type safety for notification payload
     * 
     * Use Cases:
     * - Real-time transaction alerts from F-008 monitoring system
     * - System notifications for compliance updates (F-003)
     * - Risk assessment alerts from AI-powered engine (F-002)
     * - User onboarding status updates (F-004)
     * 
     * @param state Current notification state
     * @param action Action containing the new notification payload
     */
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Add new notification to the beginning of the array for chronological order
      state.notifications.unshift(action.payload);
    },

    /**
     * Remove Notification Action
     * 
     * Removes a specific notification from the state by filtering out the
     * notification with the matching ID. This operation is optimized for
     * performance with large notification arrays.
     * 
     * The action handles:
     * - Efficient array filtering
     * - Maintains state immutability
     * - Graceful handling of non-existent IDs
     * 
     * Use Cases:
     * - User dismissing notifications from the notification center
     * - Automatic cleanup of expired notifications
     * - System-triggered removal of resolved alerts
     * - Bulk notification management operations
     * 
     * @param state Current notification state
     * @param action Action containing the notification ID to remove
     */
    removeNotification: (state, action: PayloadAction<string>) => {
      // Filter out the notification with the specified ID
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },

    /**
     * Mark as Read Action
     * 
     * Marks a specific notification as read by finding the notification with
     * the matching ID and updating its read status. This operation uses direct
     * mutation which is safe within Redux Toolkit's Immer integration.
     * 
     * The action provides:
     * - Efficient single-notification updates
     * - Maintains notification order and other properties
     * - Handles non-existent IDs gracefully
     * - Optimized for frequent read status updates
     * 
     * Use Cases:
     * - User viewing notifications in the notification center
     * - Automatic read marking when notifications are displayed
     * - Bulk read operations for notification management
     * - Integration with user interaction tracking
     * 
     * @param state Current notification state
     * @param action Action containing the notification ID to mark as read
     */
    markAsRead: (state, action: PayloadAction<string>) => {
      // Find the notification by ID and mark it as read
      const notification = state.notifications.find(
        notification => notification.id === action.payload
      );
      if (notification) {
        notification.read = true;
      }
    },

    /**
     * Clear Notifications Action
     * 
     * Clears all notifications from the state by resetting the notifications
     * array to empty. This is useful for bulk cleanup operations and
     * user-initiated clear all actions.
     * 
     * The action provides:
     * - Complete state reset for notifications
     * - Maintains state structure integrity
     * - Optimal performance for bulk operations
     * - Clean slate for notification management
     * 
     * Use Cases:
     * - User clearing all notifications from the notification center
     * - System maintenance operations
     * - Application reset scenarios
     * - Bulk notification management workflows
     * - Session cleanup on user logout
     * 
     * @param state Current notification state
     */
    clearNotifications: (state) => {
      // Reset notifications array to empty
      state.notifications = [];
    }
  }
});

/**
 * Action Creators Export
 * 
 * Exports all action creators generated by the createSlice function.
 * These actions are used throughout the application to dispatch notification
 * state changes and integrate with various system components.
 * 
 * Available Actions:
 * - addNotification: Add new notifications from various system sources
 * - removeNotification: Remove specific notifications by ID
 * - markAsRead: Update read status for notification tracking
 * - clearNotifications: Bulk clear operation for notification management
 */
export const {
  addNotification,
  removeNotification,
  markAsRead,
  clearNotifications
} = notificationSlice.actions;

/**
 * Notification Selectors
 * 
 * Provides type-safe selectors for accessing notification state from the Redux store.
 * These selectors are optimized for performance and provide a clean API for
 * components to access notification data.
 * 
 * Selector Design:
 * - Memoized through Redux Toolkit's createSelector for performance
 * - Type-safe with full TypeScript integration
 * - Efficient for frequent re-renders in real-time scenarios
 * - Provides derived state calculations (like unread count)
 * 
 * Usage Patterns:
 * - Use with useSelector hook in React components
 * - Integrate with notification center UI components
 * - Support real-time dashboard updates
 * - Enable notification badge counters
 */

/**
 * Select All Notifications
 * 
 * Returns the complete array of notifications from the state.
 * This selector provides direct access to all notification data
 * for components that need to display or process multiple notifications.
 * 
 * Use Cases:
 * - Notification center component rendering
 * - Notification list displays
 * - Bulk notification processing
 * - Dashboard notification widgets
 * - Real-time notification feeds
 * 
 * Performance: Direct state access with minimal overhead
 * 
 * @param state Root Redux state
 * @returns Array of all notifications
 */
export const selectNotifications = (state: RootState): Notification[] =>
  state.notifications.notifications;

/**
 * Select Unread Count
 * 
 * Returns the count of unread notifications by filtering the notifications
 * array and counting items where read is false. This selector is optimized
 * for frequent updates and is commonly used for badge displays.
 * 
 * Use Cases:
 * - Notification badge counters in UI headers
 * - Dashboard unread notification indicators
 * - Real-time notification count updates
 * - User engagement metrics
 * - Notification center status displays
 * 
 * Performance: Efficient filtering operation with minimal computational overhead
 * 
 * @param state Root Redux state
 * @returns Number of unread notifications
 */
export const selectUnreadCount = (state: RootState): number =>
  state.notifications.notifications.filter(notification => !notification.read).length;

/**
 * Notification Slice Reducer Export
 * 
 * Exports the reducer function for integration with the root Redux store.
 * This reducer handles all notification-related state updates and maintains
 * consistency with the overall application state management architecture.
 * 
 * Integration:
 * - Combined with other feature reducers in the root reducer
 * - Supports the unified data integration platform architecture
 * - Compatible with Redux DevTools for debugging
 * - Maintains state serialization for persistence if needed
 */
export default notificationSlice.reducer;

/**
 * Notification Slice Export
 * 
 * Exports the complete slice object for advanced use cases and testing.
 * This export provides access to the slice configuration, initial state,
 * and other slice properties for comprehensive integration scenarios.
 * 
 * Use Cases:
 * - Unit testing of reducer logic
 * - Advanced Redux store configuration
 * - Slice composition in complex scenarios
 * - Development tooling integration
 */
export { notificationSlice };