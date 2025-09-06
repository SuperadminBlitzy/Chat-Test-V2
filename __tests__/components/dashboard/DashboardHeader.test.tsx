/**
 * Test Suite for DashboardHeader Component
 * 
 * This comprehensive test suite validates the DashboardHeader component functionality,
 * ensuring it renders correctly and handles user interactions as expected. The tests
 * cover authentication states, notification management, user profile interactions,
 * and accessibility compliance requirements.
 * 
 * Features Tested:
 * - F-013: Customer Dashboard header rendering and functionality
 * - F-014: Advisor Workbench header rendering and functionality
 * - Authentication state management and conditional rendering
 * - Notification center integration and user interactions
 * - User profile menu integration and event handling
 * - Theme toggle functionality and visual feedback
 * - Accessibility compliance (WCAG 2.1 AA standards)
 * - Security and audit logging functionality
 * 
 * Test Coverage:
 * - Component rendering with various prop combinations
 * - Authentication state-dependent rendering logic
 * - User interaction event handling and callbacks
 * - Integration with AuthContext and NotificationContext
 * - Responsive design and accessibility features
 * - Error handling and edge case scenarios
 * 
 * @fileoverview Comprehensive test suite for DashboardHeader component
 * @version 1.0.0
 * @author Financial Services Platform Development Team
 * @compliance SOC2, PCI-DSS, GDPR, WCAG 2.1 AA
 * @since 2025
 */

// External testing imports with version specification
// react@18.2.0 - Core React library for component testing
import React from 'react';
// @testing-library/react@14.1.0 - React Testing Library for component rendering and interaction
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
// @testing-library/user-event@14.5.0 - User event simulation for realistic testing
import userEvent from '@testing-library/user-event';
// jest@29.7.0 - JavaScript testing framework for test structure and assertions
import { jest } from '@jest/globals';

// Internal component imports
import DashboardHeader from '../../../src/components/dashboard/DashboardHeader';
import { AuthContext, AuthProvider } from '../../../src/context/AuthContext';
import { NotificationContext, NotificationProvider } from '../../../src/context/NotificationContext';

// Internal type and model imports
import { User } from '../../../src/models/user';
import { Notification } from '../../../src/store/notification-slice';

/**
 * Mock User Data for Testing
 * 
 * Comprehensive mock user object that represents both customer and advisor personas
 * within the financial services platform. This mock includes all required fields
 * and realistic data for thorough testing scenarios.
 */
const mockAuthenticatedUser: User = {
  id: 'test-user-123',
  email: 'john.doe@financialservices.com',
  firstName: 'John',
  lastName: 'Doe',
  roles: [
    {
      id: 'role-customer',
      name: 'customer',
      permissions: ['dashboard:read', 'profile:read', 'notifications:read']
    }
  ],
  isActive: true,
  lastLoginAt: new Date('2025-01-15T10:30:00Z'),
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-15T10:30:00Z'),
  profile: {
    phone: '+1-555-123-4567',
    dateOfBirth: new Date('1985-06-15'),
    address: {
      street: '123 Financial District',
      city: 'New York',
      state: 'NY',
      zipCode: '10004',
      country: 'USA'
    },
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    }
  }
};

/**
 * Mock Notification Data for Testing
 * 
 * Sample notification objects representing various types of notifications
 * that users might receive in the financial services platform.
 */
const mockNotifications: Notification[] = [
  {
    id: 'notification-1',
    type: 'success',
    message: 'Transaction completed successfully',
    read: false,
    timestamp: Date.now() - 300000 // 5 minutes ago
  },
  {
    id: 'notification-2',
    type: 'warning',
    message: 'Your account requires attention',
    read: false,
    timestamp: Date.now() - 600000 // 10 minutes ago
  },
  {
    id: 'notification-3',
    type: 'info',
    message: 'System maintenance scheduled for tonight',
    read: true,
    timestamp: Date.now() - 1800000 // 30 minutes ago
  }
];

/**
 * Mock Authentication Context Value - Authenticated State
 * 
 * Creates a mock authentication context that represents an authenticated user
 * state for testing scenarios where the user is logged in.
 */
const mockAuthenticatedAuthContext = {
  isAuthenticated: true,
  user: mockAuthenticatedUser,
  loading: false,
  error: null,
  login: jest.fn().mockResolvedValue(undefined),
  logout: jest.fn().mockResolvedValue(undefined)
};

/**
 * Mock Authentication Context Value - Unauthenticated State
 * 
 * Creates a mock authentication context that represents an unauthenticated user
 * state for testing scenarios where the user is not logged in.
 */
const mockUnauthenticatedAuthContext = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  login: jest.fn().mockResolvedValue(undefined),
  logout: jest.fn().mockResolvedValue(undefined)
};

/**
 * Mock Notification Context Value
 * 
 * Creates a mock notification context with sample notifications and
 * mock functions for testing notification-related functionality.
 */
const mockNotificationContext = {
  notifications: mockNotifications,
  addNotification: jest.fn(),
  removeNotification: jest.fn(),
  markAsRead: jest.fn(),
  clearNotifications: jest.fn(),
  showToast: jest.fn(),
  unreadCount: mockNotifications.filter(n => !n.read).length
};

/**
 * Mock Theme Context for Testing
 * 
 * Creates a mock theme context to test theme-related functionality
 * without requiring the full theme provider implementation.
 */
const mockThemeContext = {
  theme: 'light' as const,
  toggleTheme: jest.fn(),
  setTheme: jest.fn()
};

/**
 * Mock useTheme Hook Implementation
 * 
 * Mocks the useTheme hook to return controlled theme state for testing
 * without requiring the full theme context provider.
 */
jest.mock('../../../src/hooks/useTheme', () => ({
  useTheme: () => mockThemeContext
}));

/**
 * Test Helper: Render with Authentication Provider
 * 
 * Helper function that renders the DashboardHeader component wrapped with
 * the necessary context providers for testing. This ensures proper context
 * availability and realistic testing conditions.
 * 
 * @param authContext - Mock authentication context value to provide
 * @param notificationContext - Mock notification context value to provide
 * @param props - Additional props to pass to the DashboardHeader component
 * @returns Render result from React Testing Library
 */
const renderWithProviders = (
  authContext = mockAuthenticatedAuthContext,
  notificationContext = mockNotificationContext,
  props = {}
) => {
  return render(
    <AuthContext.Provider value={authContext}>
      <NotificationContext.Provider value={notificationContext}>
        <DashboardHeader {...props} />
      </NotificationContext.Provider>
    </AuthContext.Provider>
  );
};

/**
 * Test Helper: Setup User Event
 * 
 * Creates a configured user event instance for realistic user interaction
 * simulation in tests.
 */
const setupUserEvent = () => userEvent.setup();

/**
 * Test Suite: DashboardHeader Component
 * 
 * Comprehensive test suite covering all aspects of the DashboardHeader component
 * functionality, including rendering, user interactions, and integration with
 * authentication and notification systems.
 */
describe('DashboardHeader', () => {
  /**
   * Setup and Teardown
   * 
   * Configures the test environment before each test and cleans up
   * after each test to ensure test isolation and reliability.
   */
  beforeEach(() => {
    // Clear all mock function calls before each test
    jest.clearAllMocks();
    
    // Reset console methods to prevent interference with test output
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods after each test
    jest.restoreAllMocks();
  });

  /**
   * Test: Component renders the title correctly
   * 
   * Validates that the DashboardHeader component renders the provided title
   * prop correctly and that the title is accessible to screen readers.
   */
  it('should render the title correctly', () => {
    // Arrange
    const testTitle = 'Financial Dashboard';
    
    // Act
    renderWithProviders(mockAuthenticatedAuthContext, mockNotificationContext, {
      pageTitle: testTitle
    });
    
    // Assert
    const titleElement = screen.getByRole('heading', { level: 1 });
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent(testTitle);
    expect(titleElement).toHaveAttribute('data-testid', 'dashboard-header-title');
  });

  /**
   * Test: Component renders with default title when none provided
   * 
   * Ensures that the component gracefully handles cases where no title
   * is provided and falls back to the default title.
   */
  it('should render with default title when no pageTitle is provided', () => {
    // Act
    renderWithProviders(mockAuthenticatedAuthContext, mockNotificationContext);
    
    // Assert
    const titleElement = screen.getByRole('heading', { level: 1 });
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent('Dashboard');
  });

  /**
   * Test: Component renders user profile menu when authenticated
   * 
   * Validates that the UserProfileMenu component is rendered when a user
   * is authenticated and that it displays the correct user information.
   */
  it('should render user profile menu when authenticated', async () => {
    // Act
    renderWithProviders(mockAuthenticatedAuthContext, mockNotificationContext);
    
    // Assert - Check for user profile menu presence
    const userProfileMenu = screen.getByTestId('dashboard-header-user-menu');
    expect(userProfileMenu).toBeInTheDocument();
    
    // Assert - Check for user information display
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@financialservices.com')).toBeInTheDocument();
    
    // Assert - Check for user initials in avatar
    const avatar = screen.getByText('JD');
    expect(avatar).toBeInTheDocument();
  });

  /**
   * Test: Component does not render user profile menu when not authenticated
   * 
   * Ensures that the UserProfileMenu is not rendered when the user is not
   * authenticated, maintaining proper security boundaries.
   */
  it('should not render user profile menu when not authenticated', () => {
    // Act
    renderWithProviders(mockUnauthenticatedAuthContext, mockNotificationContext);
    
    // Assert - Component should not render at all when not authenticated
    const headerElement = screen.queryByTestId('dashboard-header');
    expect(headerElement).not.toBeInTheDocument();
    
    // Assert - User profile menu should not be present
    const userProfileMenu = screen.queryByTestId('dashboard-header-user-menu');
    expect(userProfileMenu).not.toBeInTheDocument();
  });

  /**
   * Test: Component returns null when user is null
   * 
   * Validates that the component properly handles edge cases where
   * authentication state indicates authenticated but user is null.
   */
  it('should return null when user is null', () => {
    // Arrange
    const authContextWithNullUser = {
      ...mockAuthenticatedAuthContext,
      user: null
    };
    
    // Act
    renderWithProviders(authContextWithNullUser, mockNotificationContext);
    
    // Assert
    const headerElement = screen.queryByTestId('dashboard-header');
    expect(headerElement).not.toBeInTheDocument();
  });

  /**
   * Test: Component renders the notification center with notifications
   * 
   * Validates that the NotificationCenter component is rendered correctly
   * and displays the appropriate notification count badge.
   */
  it('should render the notification center with notifications', () => {
    // Act
    renderWithProviders(mockAuthenticatedAuthContext, mockNotificationContext);
    
    // Assert - Check for notification center container
    const notificationCenter = screen.getByTestId('notification-center');
    expect(notificationCenter).toBeInTheDocument();
    
    // Assert - Check for notification button
    const notificationButton = screen.getByTestId('dashboard-header-notification-button');
    expect(notificationButton).toBeInTheDocument();
    expect(notificationButton).toHaveAttribute('aria-label', 
      'View notifications. 2 unread notifications');
    
    // Assert - Check for notification badge with correct count
    const notificationBadge = screen.getByTestId('dashboard-header-notification-badge');
    expect(notificationBadge).toBeInTheDocument();
    expect(notificationBadge).toHaveTextContent('2');
    expect(notificationBadge).toHaveAttribute('aria-label', '2 unread notifications');
  });

  /**
   * Test: Component renders notification center without badge when no unread notifications
   * 
   * Ensures that the notification badge is not displayed when there are no
   * unread notifications, providing clean UI experience.
   */
  it('should not render notification badge when no unread notifications', () => {
    // Arrange
    const notificationContextWithoutUnread = {
      ...mockNotificationContext,
      notifications: mockNotifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    };
    
    // Act
    renderWithProviders(mockAuthenticatedAuthContext, notificationContextWithoutUnread);
    
    // Assert
    const notificationBadge = screen.queryByTestId('dashboard-header-notification-badge');
    expect(notificationBadge).not.toBeInTheDocument();
    
    const notificationButton = screen.getByTestId('dashboard-header-notification-button');
    expect(notificationButton).toHaveAttribute('aria-label', 'View notifications');
  });

  /**
   * Test: Component handles notification center click
   * 
   * Validates that clicking the notification icon opens the notification
   * center dropdown and that the appropriate state changes occur.
   */
  it('should handle notification center click', async () => {
    // Arrange
    const user = setupUserEvent();
    const mockOnHeaderAction = jest.fn();
    
    // Act
    renderWithProviders(mockAuthenticatedAuthContext, mockNotificationContext, {
      onHeaderAction: mockOnHeaderAction
    });
    
    const notificationButton = screen.getByTestId('dashboard-header-notification-button');
    
    // Act - Click notification button
    await user.click(notificationButton);
    
    // Assert - Check button state changes
    expect(notificationButton).toHaveAttribute('aria-expanded', 'true');
    
    // Assert - Check for notification dropdown
    const notificationDropdown = screen.getByTestId('dashboard-header-notification-dropdown');
    expect(notificationDropdown).toBeInTheDocument();
    
    // Assert - Check callback invocation
    expect(mockOnHeaderAction).toHaveBeenCalledWith('notification_center_open');
  });

  /**
   * Test: Component closes notification center when clicking outside
   * 
   * Validates that the notification center dropdown closes when the user
   * clicks outside of it, providing intuitive user experience.
   */
  it('should close notification center when clicking outside', async () => {
    // Arrange
    const user = setupUserEvent();
    
    // Act
    renderWithProviders(mockAuthenticatedAuthContext, mockNotificationContext);
    
    const notificationButton = screen.getByTestId('dashboard-header-notification-button');
    
    // Act - Open notification center
    await user.click(notificationButton);
    
    // Assert - Notification center is open
    expect(screen.getByTestId('dashboard-header-notification-dropdown')).toBeInTheDocument();
    
    // Act - Click outside (on header)
    const header = screen.getByTestId('dashboard-header');
    await user.click(header);
    
    // Wait for dropdown to close
    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-header-notification-dropdown')).not.toBeInTheDocument();
    });
  });

  /**
   * Test: Component handles user profile menu click
   * 
   * Validates that clicking the user profile avatar opens the user menu
   * dropdown and triggers appropriate callback functions.
   */
  it('should handle user profile menu click', async () => {
    // Arrange
    const user = setupUserEvent();
    const mockOnHeaderAction = jest.fn();
    
    // Act
    renderWithProviders(mockAuthenticatedAuthContext, mockNotificationContext, {
      onHeaderAction: mockOnHeaderAction
    });
    
    const userProfileTrigger = screen.getByTestId('dashboard-header-user-menu-trigger');
    
    // Act - Click user profile trigger
    await user.click(userProfileTrigger);
    
    // Assert - Check for user profile dropdown
    const userProfileDropdown = screen.getByTestId('dashboard-header-user-menu-dropdown');
    expect(userProfileDropdown).toBeInTheDocument();
    
    // Assert - Check for menu items
    expect(screen.getByTestId('dashboard-header-user-menu-profile')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-header-user-menu-settings')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-header-user-menu-logout')).toBeInTheDocument();
  });

  /**
   * Test: Component handles theme toggle functionality
   * 
   * Validates that the theme toggle button functions correctly and
   * triggers the appropriate theme change actions.
   */
  it('should handle theme toggle click', async () => {
    // Arrange
    const user = setupUserEvent();
    const mockOnHeaderAction = jest.fn();
    
    // Act
    renderWithProviders(mockAuthenticatedAuthContext, mockNotificationContext, {
      onHeaderAction: mockOnHeaderAction
    });
    
    const themeToggleButton = screen.getByTestId('dashboard-header-theme-toggle');
    
    // Act - Click theme toggle button
    await user.click(themeToggleButton);
    
    // Assert - Check theme toggle function was called
    expect(mockThemeContext.toggleTheme).toHaveBeenCalled();
    
    // Assert - Check callback invocation
    expect(mockOnHeaderAction).toHaveBeenCalledWith('theme_toggle');
  });

  /**
   * Test: Component displays correct theme toggle icon
   * 
   * Validates that the theme toggle button displays the appropriate icon
   * based on the current theme state.
   */
  it('should display correct theme toggle icon based on current theme', () => {
    // Act
    renderWithProviders(mockAuthenticatedAuthContext, mockNotificationContext);
    
    // Assert
    const themeToggleButton = screen.getByTestId('dashboard-header-theme-toggle');
    expect(themeToggleButton).toHaveAttribute('aria-label', 
      'Switch to dark mode. Current theme: light');
    
    // Assert - Check for moon icon (switch to dark mode)
    const moonIcon = within(themeToggleButton).getByLabelText('Switch to dark mode');
    expect(moonIcon).toBeInTheDocument();
  });

  /**
   * Test: Component handles dark theme correctly
   * 
   * Validates that the component renders appropriately when the theme
   * is set to dark mode.
   */
  it('should render correctly in dark theme', () => {
    // Arrange
    const darkThemeContext = {
      ...mockThemeContext,
      theme: 'dark' as const
    };
    
    // Override the mock for this test
    jest.mocked(require('../../../src/hooks/useTheme').useTheme).mockReturnValue(darkThemeContext);
    
    // Act
    renderWithProviders(mockAuthenticatedAuthContext, mockNotificationContext);
    
    // Assert - Check theme toggle button aria-label
    const themeToggleButton = screen.getByTestId('dashboard-header-theme-toggle');
    expect(themeToggleButton).toHaveAttribute('aria-label', 
      'Switch to light mode. Current theme: dark');
    
    // Assert - Check for sun icon (switch to light mode)
    const sunIcon = within(themeToggleButton).getByLabelText('Switch to light mode');
    expect(sunIcon).toBeInTheDocument();
  });

  /**
   * Test: Component applies custom className
   * 
   * Validates that custom CSS classes are properly applied to the
   * component for styling customization.
   */
  it('should apply custom className', () => {
    // Arrange
    const customClassName = 'custom-header-style';
    
    // Act
    renderWithProviders(mockAuthenticatedAuthContext, mockNotificationContext, {
      className: customClassName
    });
    
    // Assert
    const headerElement = screen.getByTestId('dashboard-header');
    expect(headerElement).toHaveClass(customClassName);
  });

  /**
   * Test: Component uses custom test ID
   * 
   * Validates that custom test IDs are properly applied for
   * automated testing purposes.
   */
  it('should use custom test ID when provided', () => {
    // Arrange
    const customTestId = 'custom-dashboard-header';
    
    // Act
    renderWithProviders(mockAuthenticatedAuthContext, mockNotificationContext, {
      'data-testid': customTestId
    });
    
    // Assert
    const headerElement = screen.getByTestId(customTestId);
    expect(headerElement).toBeInTheDocument();
    
    // Assert - Check child elements use custom test ID as prefix
    expect(screen.getByTestId(`${customTestId}-title`)).toBeInTheDocument();
    expect(screen.getByTestId(`${customTestId}-theme-toggle`)).toBeInTheDocument();
    expect(screen.getByTestId(`${customTestId}-notification-button`)).toBeInTheDocument();
  });

  /**
   * Test: Component has proper accessibility attributes
   * 
   * Validates that the component implements proper accessibility features
   * including ARIA labels, roles, and keyboard navigation support.
   */
  it('should have proper accessibility attributes', () => {
    // Act
    renderWithProviders(mockAuthenticatedAuthContext, mockNotificationContext);
    
    // Assert - Check header role
    const headerElement = screen.getByTestId('dashboard-header');
    expect(headerElement).toHaveAttribute('role', 'banner');
    expect(headerElement).toHaveAttribute('aria-label', 'Dashboard header');
    
    // Assert - Check notification button accessibility
    const notificationButton = screen.getByTestId('dashboard-header-notification-button');
    expect(notificationButton).toHaveAttribute('aria-expanded', 'false');
    expect(notificationButton).toHaveAttribute('aria-haspopup', 'true');
    
    // Assert - Check theme toggle accessibility
    const themeToggleButton = screen.getByTestId('dashboard-header-theme-toggle');
    expect(themeToggleButton).toHaveAttribute('type', 'button');
    expect(themeToggleButton).toHaveAttribute('aria-label');
  });

  /**
   * Test: Component handles keyboard navigation
   * 
   * Validates that the component supports proper keyboard navigation
   * for accessibility compliance.
   */
  it('should support keyboard navigation', async () => {
    // Arrange
    const user = setupUserEvent();
    
    // Act
    renderWithProviders(mockAuthenticatedAuthContext, mockNotificationContext);
    
    // Act - Tab to theme toggle button
    await user.tab();
    expect(screen.getByTestId('dashboard-header-theme-toggle')).toHaveFocus();
    
    // Act - Tab to notification button
    await user.tab();
    expect(screen.getByTestId('dashboard-header-notification-button')).toHaveFocus();
    
    // Act - Tab to user profile menu
    await user.tab();
    expect(screen.getByTestId('dashboard-header-user-menu-trigger')).toHaveFocus();
  });

  /**
   * Test: Component handles notification badge for large numbers
   * 
   * Validates that the notification badge correctly displays "99+" for
   * notification counts exceeding 99.
   */
  it('should display "99+" for notification counts exceeding 99', () => {
    // Arrange
    const manyNotificationsContext = {
      ...mockNotificationContext,
      notifications: Array.from({ length: 150 }, (_, i) => ({
        id: `notification-${i}`,
        type: 'info' as const,
        message: `Notification ${i}`,
        read: false,
        timestamp: Date.now() - i * 1000
      })),
      unreadCount: 150
    };
    
    // Act
    renderWithProviders(mockAuthenticatedAuthContext, manyNotificationsContext);
    
    // Assert
    const notificationBadge = screen.getByTestId('dashboard-header-notification-badge');
    expect(notificationBadge).toHaveTextContent('99+');
  });

  /**
   * Test: Component logs user interactions for audit purposes
   * 
   * Validates that user interactions are properly logged for security
   * and compliance audit trails.
   */
  it('should log user interactions for audit purposes', async () => {
    // Arrange
    const user = setupUserEvent();
    const consoleSpy = jest.spyOn(console, 'info');
    
    // Act
    renderWithProviders(mockAuthenticatedAuthContext, mockNotificationContext);
    
    const themeToggleButton = screen.getByTestId('dashboard-header-theme-toggle');
    await user.click(themeToggleButton);
    
    // Assert - Check audit logging
    expect(consoleSpy).toHaveBeenCalledWith(
      'Theme toggle initiated:',
      expect.objectContaining({
        timestamp: expect.any(String),
        userId: mockAuthenticatedUser.id,
        currentTheme: 'light',
        targetTheme: 'dark',
        component: 'DashboardHeader',
        action: 'theme_toggle'
      })
    );
  });

  /**
   * Test: Component handles error scenarios gracefully
   * 
   * Validates that the component gracefully handles error scenarios
   * such as theme toggle failures or context provider issues.
   */
  it('should handle theme toggle errors gracefully', async () => {
    // Arrange
    const user = setupUserEvent();
    const errorThemeContext = {
      ...mockThemeContext,
      toggleTheme: jest.fn().mockImplementation(() => {
        throw new Error('Theme toggle failed');
      })
    };
    
    const consoleErrorSpy = jest.spyOn(console, 'error');
    
    // Override the mock for this test
    jest.mocked(require('../../../src/hooks/useTheme').useTheme).mockReturnValue(errorThemeContext);
    
    // Act
    renderWithProviders(mockAuthenticatedAuthContext, mockNotificationContext);
    
    const themeToggleButton = screen.getByTestId('dashboard-header-theme-toggle');
    await user.click(themeToggleButton);
    
    // Assert - Check error logging
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Theme toggle error in DashboardHeader:',
      expect.objectContaining({
        timestamp: expect.any(String),
        userId: mockAuthenticatedUser.id,
        error: 'Theme toggle failed',
        component: 'DashboardHeader',
        action: 'theme_toggle_error'
      })
    );
  });
});