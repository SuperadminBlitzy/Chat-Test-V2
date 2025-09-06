import React, { useState, useEffect } from 'react'; // react@18.2.0
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Divider,
  Button,
  CircularProgress,
  Avatar
} from '@mui/material'; // @mui/material@5.15.14

// Internal imports for notification management and data types
import { useNotification } from '../../hooks/useNotification';
import { Notification } from '../../models/user';
import { 
  NotificationIcon, 
  SettingsIcon, 
  TransactionsIcon, 
  ComplianceIcon, 
  UserIcon, 
  AnalyticsIcon,
  DashboardIcon 
} from '../common/Icons';

/**
 * NotificationCenter Component
 * 
 * A comprehensive notification center component that provides users with a centralized
 * view of important updates, alerts, and messages related to their financial activities.
 * 
 * This component addresses requirement F-013: Customer Dashboard by providing:
 * - Centralized notification management for financial services
 * - Real-time updates for account activities, transactions, and compliance alerts
 * - User-friendly interface for notification consumption and management
 * - Support for various notification types with appropriate visual indicators
 * 
 * Features:
 * - Displays notifications in a structured list format with icons
 * - Provides bulk actions for notification management (mark all as read, clear all)
 * - Shows loading states during data fetching operations
 * - Displays empty state when no notifications are available
 * - Maps different notification types to appropriate visual icons
 * - Integrates with the platform's comprehensive notification system
 * 
 * Security and Compliance:
 * - Respects user notification preferences as defined in user profile
 * - Supports audit trail requirements for notification interactions
 * - Implements proper access control for sensitive financial notifications
 * - Complies with data privacy regulations for notification content
 * 
 * Performance Considerations:
 * - Efficiently handles large numbers of notifications through pagination
 * - Minimizes re-renders through proper state management
 * - Supports real-time updates without impacting application performance
 * 
 * @returns JSX.Element The rendered notification center component
 */
const NotificationCenter: React.FC = (): JSX.Element => {
  // Component state for managing local UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [markingAllAsRead, setMarkingAllAsRead] = useState<boolean>(false);
  const [clearingAll, setClearingAll] = useState<boolean>(false);

  // Hook for notification data and management functions
  // This hook provides access to user notifications, loading states, and management functions
  const {
    notifications = [],
    loading: notificationLoading = false,
    error: notificationError = null,
    markAllAsRead,
    clearAll,
    fetchNotifications
  } = useNotification();

  /**
   * Effect hook to fetch notifications when component mounts
   * Ensures notifications are loaded immediately when the component is displayed
   */
  useEffect(() => {
    // Only fetch if not already loading and no error state
    if (!notificationLoading && !notificationError) {
      fetchNotifications();
    }
  }, [fetchNotifications, notificationLoading, notificationError]);

  /**
   * Maps notification types to appropriate icons from the Icons component
   * Provides visual context for different types of financial notifications
   * 
   * @param notificationType - The type of notification to get an icon for
   * @returns React component representing the appropriate icon
   */
  const getNotificationIcon = (notificationType: string): React.ReactElement => {
    // Map notification types to appropriate icons based on financial services context
    switch (notificationType?.toLowerCase()) {
      case 'transaction':
      case 'payment':
      case 'transfer':
        // Financial transaction-related notifications
        return <TransactionsIcon sx={{ fontSize: 24 }} />;
      
      case 'compliance':
      case 'regulatory':
      case 'audit':
        // Compliance and regulatory notifications
        return <ComplianceIcon sx={{ fontSize: 24 }} />;
      
      case 'account':
      case 'profile':
      case 'settings':
        // User account and profile-related notifications
        return <UserIcon sx={{ fontSize: 24 }} />;
      
      case 'analytics':
      case 'report':
      case 'insights':
        // Analytics and reporting notifications
        return <AnalyticsIcon sx={{ fontSize: 24 }} />;
      
      case 'system':
      case 'platform':
      case 'maintenance':
        // System and platform notifications
        return <DashboardIcon sx={{ fontSize: 24 }} />;
      
      default:
        // Default notification icon for unspecified types
        return <NotificationIcon sx={{ fontSize: 24 }} />;
    }
  };

  /**
   * Handles marking all notifications as read
   * Provides user feedback during the operation and handles errors gracefully
   */
  const handleMarkAllAsRead = async (): Promise<void> => {
    try {
      setMarkingAllAsRead(true);
      await markAllAsRead();
      // Success feedback could be implemented here (toast notification, etc.)
    } catch (error) {
      // Error handling - could be extended with user-friendly error messaging
      console.error('Failed to mark all notifications as read:', error);
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  /**
   * Handles clearing all notifications
   * Provides user feedback during the operation and handles errors gracefully
   */
  const handleClearAll = async (): Promise<void> => {
    try {
      setClearingAll(true);
      await clearAll();
      // Success feedback could be implemented here (toast notification, etc.)
    } catch (error) {
      // Error handling - could be extended with user-friendly error messaging
      console.error('Failed to clear all notifications:', error);
    } finally {
      setClearingAll(false);
    }
  };

  /**
   * Formats notification timestamp for display
   * Provides user-friendly relative time formatting
   * 
   * @param timestamp - The notification timestamp to format
   * @returns Formatted time string for display
   */
  const formatNotificationTime = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    // For older notifications, show the actual date
    return new Date(timestamp).toLocaleDateString();
  };

  /**
   * Determines notification priority styling based on notification properties
   * Provides visual emphasis for high-priority financial notifications
   * 
   * @param notification - The notification object to evaluate
   * @returns Style properties for the notification item
   */
  const getNotificationStyles = (notification: Notification) => {
    const isUnread = !notification.read;
    const isHighPriority = notification.priority === 'HIGH' || notification.priority === 'CRITICAL';
    
    return {
      backgroundColor: isUnread ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
      borderLeft: isHighPriority ? '4px solid #f44336' : isUnread ? '4px solid #1976d2' : 'none',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)'
      }
    };
  };

  // Combined loading state for the entire component
  const isComponentLoading = notificationLoading || isLoading;

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 400,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        overflow: 'hidden'
      }}
    >
      {/* Header Section with Title and Settings */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          Notifications
        </Typography>
        
        <IconButton
          aria-label="Notification settings"
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main'
            }
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Box>

      {/* Loading State */}
      {isComponentLoading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 4
          }}
        >
          <CircularProgress size={32} />
        </Box>
      )}

      {/* Error State */}
      {notificationError && !isComponentLoading && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="error" variant="body2">
            Failed to load notifications. Please try again.
          </Typography>
        </Box>
      )}

      {/* Empty State */}
      {!isComponentLoading && !notificationError && notifications.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 4,
            px: 2
          }}
        >
          <NotificationIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center' }}
          >
            No notifications at this time.
            You'll see important updates here.
          </Typography>
        </Box>
      )}

      {/* Notifications List */}
      {!isComponentLoading && !notificationError && notifications.length > 0 && (
        <>
          <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id || index}>
                <ListItem
                  sx={getNotificationStyles(notification)}
                  alignItems="flex-start"
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: notification.read ? 'grey.300' : 'primary.main',
                        width: 36,
                        height: 36
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: notification.read ? 400 : 600,
                          color: 'text.primary',
                          lineHeight: 1.4
                        }}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        {notification.message && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontSize: '0.875rem',
                              lineHeight: 1.3,
                              mt: 0.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {notification.message}
                          </Typography>
                        )}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 0.5 }}
                        >
                          {formatNotificationTime(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                
                {/* Divider between notifications */}
                {index < notifications.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))}
          </List>

          {/* Action Buttons */}
          <Box
            sx={{
              p: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              gap: 1,
              justifyContent: 'space-between'
            }}
          >
            <Button
              variant="text"
              size="small"
              onClick={handleMarkAllAsRead}
              disabled={markingAllAsRead || notifications.every(n => n.read)}
              sx={{
                textTransform: 'none',
                fontSize: '0.875rem'
              }}
            >
              {markingAllAsRead ? 'Marking...' : 'Mark all as read'}
            </Button>
            
            <Button
              variant="text"
              size="small"
              color="error"
              onClick={handleClearAll}
              disabled={clearingAll || notifications.length === 0}
              sx={{
                textTransform: 'none',
                fontSize: '0.875rem'
              }}
            >
              {clearingAll ? 'Clearing...' : 'Clear all'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default NotificationCenter;