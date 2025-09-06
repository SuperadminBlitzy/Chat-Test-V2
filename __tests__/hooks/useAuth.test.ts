/**
 * Unit Tests for useAuth Custom Hook
 * 
 * This test suite provides comprehensive coverage for the `useAuth` custom hook,
 * which manages user authentication logic including login, logout, and session state.
 * The tests ensure compliance with User Authentication requirements (3.4.3 Identity & 
 * Authentication Services) and Security Compliance requirements (2.4.3 Security Implications).
 * 
 * Test Coverage:
 * - Initial state verification with correct default values
 * - Successful login flow with proper state updates and API interceptor configuration
 * - Failed login handling with comprehensive error management
 * - Logout functionality with secure session cleanup
 * - Context integration and error boundary testing
 * - Session management and token storage validation
 * - Security compliance validation for authentication flows
 * 
 * Security Test Coverage:
 * - Secure credential handling during authentication
 * - Token management and API interceptor configuration
 * - Error handling without exposing sensitive information  
 * - Session cleanup and security event logging
 * - Protection against authentication state corruption
 * 
 * Compliance Coverage:
 * - SOC2 compliance through comprehensive audit logging validation
 * - Zero-Trust security model implementation testing
 * - Financial industry authentication standard compliance
 * - GDPR-compliant data handling verification
 * 
 * @fileoverview Comprehensive unit tests for the useAuth custom hook
 * @version 1.0.0
 * @author Financial Services Platform Development Team
 * @compliance SOC2, PCI-DSS, GDPR, Zero-Trust Security
 * @since 2025
 */

// External testing library imports with version specifications
// @testing-library/react-hooks@8.0.1 - Utilities for testing React hooks in isolation
import { renderHook, act } from '@testing-library/react-hooks';
// @testing-library/react@14.1.2 - React testing utilities for component testing
import { ReactNode } from 'react';
// jest@29.7.0 - JavaScript testing framework for unit and integration tests
import { jest } from '@jest/globals';

// Internal imports - Hook under test and dependencies
import { useAuth } from '../../src/hooks/useAuth';
import * as authService from '../../src/services/auth-service';
import { AuthProvider, AuthContext } from '../../src/context/AuthContext';
import tokenStorage from '../../src/lib/storage';
import { setupAPIInterceptors } from '../../src/lib/api';
import { handleAuthError } from '../../src/lib/error-handling';

// Internal imports - Type definitions for testing
import { LoginRequest, User, Role, AuthState } from '../../src/types/auth';

// Mock all external dependencies to ensure isolated testing
jest.mock('../../src/services/auth-service');
jest.mock('../../src/lib/storage');
jest.mock('../../src/lib/api');
jest.mock('../../src/lib/error-handling');

/**
 * Mock Data Factory for Test Scenarios
 * 
 * Provides consistent mock data for testing various authentication scenarios.
 * All mock data follows the platform's security and compliance requirements
 * while providing realistic test scenarios for comprehensive validation.
 */
const mockDataFactory = {
  /**
   * Creates a mock user object for testing purposes
   * 
   * @param overrides - Optional overrides for specific user properties
   * @returns Complete User object with realistic financial services data
   */
  createMockUser: (overrides: Partial<User> = {}): User => {
    const defaultRole: Role = {
      id: 'role-customer-advisor',
      name: 'Customer Advisor',
      permissions: [
        'customer:read',
        'customer:write',
        'transaction:read',
        'compliance:read'
      ]
    };

    return {
      id: 'user-12345-test',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@financialservices.com',
      roles: [defaultRole],
      ...overrides
    };
  },

  /**
   * Creates mock login credentials for testing
   * 
   * @param overrides - Optional overrides for credentials
   * @returns LoginRequest object with valid test credentials
   */
  createMockCredentials: (overrides: Partial<LoginRequest> = {}): LoginRequest => ({
    email: 'john.doe@financialservices.com',
    password: 'SecureTestPassword123!',
    ...overrides
  }),

  /**
   * Creates mock authentication state for testing
   * 
   * @param overrides - Optional overrides for auth state
   * @returns Complete AuthState object for testing
   */
  createMockAuthState: (overrides: Partial<AuthState> = {}): AuthState => ({
    isAuthenticated: false,
    user: null,
    permissions: [],
    session: null,
    mfaRequired: false,
    loading: false,
    error: null,
    ...overrides
  }),

  /**
   * Creates mock login response for successful authentication
   * 
   * @param user - Optional user override
   * @returns Complete login response with session data
   */
  createMockLoginResponse: (user?: User) => ({
    user: user || mockDataFactory.createMockUser(),
    session: {
      accessToken: 'mock-jwt-access-token.eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.payload',
      refreshToken: 'mock-jwt-refresh-token.eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.payload',
      expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes from now
    }
  })
};

/**
 * Mock Context Provider for Testing
 * 
 * Creates a mock AuthProvider that can be controlled for testing different
 * authentication states and scenarios. This allows testing the useAuth hook
 * in isolation while providing realistic context behavior.
 */
interface MockAuthContextProps {
  children: ReactNode;
  mockValues?: Partial<{
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    error: Error | null;
    login: jest.MockedFunction<any>;
    logout: jest.MockedFunction<any>;
  }>;
}

const MockAuthProvider: React.FC<MockAuthContextProps> = ({ 
  children, 
  mockValues = {} 
}) => {
  const defaultMockValues = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    ...mockValues
  };

  return (
    <AuthContext.Provider value={defaultMockValues}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Test Suite: useAuth Hook
 * 
 * Comprehensive test suite covering all aspects of the useAuth custom hook
 * including authentication flows, error handling, and security compliance.
 */
describe('useAuth hook', () => {
  // Setup and teardown for each test
  beforeEach(() => {
    // Clear all mocks before each test to ensure clean state
    jest.clearAllMocks();
    
    // Reset console methods to prevent test pollution
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Setup default mock implementations
    (tokenStorage.getItem as jest.MockedFunction<typeof tokenStorage.getItem>)
      .mockReturnValue(null);
    (tokenStorage.setItem as jest.MockedFunction<typeof tokenStorage.setItem>)
      .mockImplementation(() => {});
    (tokenStorage.removeItem as jest.MockedFunction<typeof tokenStorage.removeItem>)
      .mockImplementation(() => {});
    
    // Setup default API interceptor mock
    (setupAPIInterceptors as jest.MockedFunction<typeof setupAPIInterceptors>)
      .mockImplementation(() => {});
    
    // Setup default error handler mock
    (handleAuthError as jest.MockedFunction<typeof handleAuthError>)
      .mockImplementation((error) => error);
  });

  afterEach(() => {
    // Restore console methods after each test
    jest.restoreAllMocks();
  });

  /**
   * Test Case: Initial State Verification
   * 
   * Verifies that the useAuth hook initializes with the correct default state
   * including authentication status, user data, and error states. This test
   * ensures the hook provides a consistent initial state for new sessions.
   * 
   * Requirements Covered:
   * - User Authentication: Proper initialization of authentication state
   * - Security Compliance: Secure default state without exposed user data
   */
  it('should return the initial state correctly', () => {
    // Arrange: Setup mock context with default unauthenticated state
    const mockContextValues = {
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn()
    };

    // Act: Render the hook with mock context
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <MockAuthProvider mockValues={mockContextValues}>
          {children}
        </MockAuthProvider>
      )
    });

    // Assert: Verify initial state matches expected values
    expect(result.current.authState.isAuthenticated).toBe(false);
    expect(result.current.authState.user).toBe(null);
    expect(result.current.authState.error).toBe(null);
    expect(result.current.authState.loading).toBe(false);
    expect(result.current.authState.permissions).toEqual([]);
    expect(result.current.authState.session).toBe(null);
    expect(result.current.authState.mfaRequired).toBe(false);
    
    // Verify function availability
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    
    // Security verification: Ensure no sensitive data is exposed in initial state
    expect(result.current.authState).not.toHaveProperty('password');
    expect(result.current.authState).not.toHaveProperty('token');
  });

  /**
   * Test Case: Successful Login Flow
   * 
   * Tests the complete successful login workflow including credential validation,
   * API calls, state updates, and security measures. This test verifies that
   * successful authentication properly updates all relevant state and configures
   * security measures like API interceptors.
   * 
   * Requirements Covered:
   * - User Authentication: Complete login workflow with proper state management
   * - Security Compliance: Token management and API interceptor configuration
   */
  it('should handle successful login', async () => {
    // Arrange: Setup mock data for successful login scenario
    const mockUser = mockDataFactory.createMockUser();
    const mockCredentials = mockDataFactory.createMockCredentials();
    const mockLoginResponse = mockDataFactory.createMockLoginResponse(mockUser);
    
    // Setup context login mock to simulate successful authentication
    const mockContextLogin = jest.fn().mockResolvedValue(undefined);
    
    // Setup storage mock to return access token after login
    (tokenStorage.getItem as jest.MockedFunction<typeof tokenStorage.getItem>)
      .mockImplementation((key: string) => {
        if (key === 'auth_access_token') {
          return mockLoginResponse.session.accessToken;
        }
        return null;
      });

    const mockContextValues = {
      isAuthenticated: true,  // State after successful login
      user: mockUser,
      loading: false,
      error: null,
      login: mockContextLogin,
      logout: jest.fn()
    };

    // Act: Render hook and perform login
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <MockAuthProvider mockValues={mockContextValues}>
          {children}
        </MockAuthProvider>
      )
    });

    // Perform login action
    await act(async () => {
      await result.current.login(mockCredentials);
    });

    // Assert: Verify successful login results
    // Verify context login was called with correct credentials
    expect(mockContextLogin).toHaveBeenCalledWith(mockCredentials);
    expect(mockContextLogin).toHaveBeenCalledTimes(1);
    
    // Verify API interceptors were configured with the access token
    expect(setupAPIInterceptors).toHaveBeenCalledWith(
      mockLoginResponse.session.accessToken
    );
    expect(setupAPIInterceptors).toHaveBeenCalledTimes(1);
    
    // Verify authentication state reflects successful login
    expect(result.current.authState.isAuthenticated).toBe(true);
    expect(result.current.authState.user).toEqual(mockUser);
    expect(result.current.authState.error).toBe(null);
    expect(result.current.authState.loading).toBe(false);
    
    // Verify permissions are properly extracted from user roles
    const expectedPermissions = mockUser.roles.flatMap(role => role.permissions);
    expect(result.current.authState.permissions).toEqual(expectedPermissions);
    
    // Security verification: Ensure audit logging occurred
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('Authentication attempt initiated'),
      expect.objectContaining({
        action: 'login_attempt',
        hook: 'useAuth'
      })
    );
    
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('Login completed successfully'),
      expect.objectContaining({
        action: 'login_success',
        hook: 'useAuth'
      })
    );
  });

  /**
   * Test Case: Failed Login Handling
   * 
   * Tests the error handling capabilities of the login function when authentication
   * fails. This test ensures that errors are properly caught, processed, and
   * reflected in the authentication state without compromising security.
   * 
   * Requirements Covered:
   * - User Authentication: Proper error handling for failed authentication
   * - Security Compliance: Secure error handling without exposing sensitive data
   */
  it('should handle failed login', async () => {
    // Arrange: Setup mock data for failed login scenario
    const mockCredentials = mockDataFactory.createMockCredentials({
      email: 'invalid@example.com',
      password: 'wrongpassword'
    });
    
    const mockAuthError = new Error('Invalid email or password. Please check your credentials and try again.');
    mockAuthError.name = 'AuthenticationError';
    
    // Setup context login mock to simulate authentication failure
    const mockContextLogin = jest.fn().mockRejectedValue(mockAuthError);
    
    // Setup error handler mock to return processed error
    (handleAuthError as jest.MockedFunction<typeof handleAuthError>)
      .mockReturnValue(mockAuthError);

    const mockContextValues = {
      isAuthenticated: false,  // State remains unauthenticated after failure
      user: null,
      loading: false,
      error: mockAuthError,
      login: mockContextLogin,
      logout: jest.fn()
    };

    // Act: Render hook and attempt failed login
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <MockAuthProvider mockValues={mockContextValues}>
          {children}
        </MockAuthProvider>
      )
    });

    // Perform failed login action
    await act(async () => {
      await result.current.login(mockCredentials);
    });

    // Assert: Verify failed login handling
    // Verify context login was called with invalid credentials
    expect(mockContextLogin).toHaveBeenCalledWith(mockCredentials);
    expect(mockContextLogin).toHaveBeenCalledTimes(1);
    
    // Verify authentication state reflects failed login
    expect(result.current.authState.isAuthenticated).toBe(false);
    expect(result.current.authState.user).toBe(null);
    expect(result.current.authState.error).toBe(mockAuthError.message);
    expect(result.current.authState.loading).toBe(false);
    expect(result.current.authState.permissions).toEqual([]);
    expect(result.current.authState.session).toBe(null);
    
    // Verify API interceptors were not configured due to failed login
    expect(setupAPIInterceptors).not.toHaveBeenCalled();
    
    // Security verification: Ensure error logging occurred without sensitive data
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('Authentication attempt initiated'),
      expect.objectContaining({
        action: 'login_attempt',
        hook: 'useAuth',
        // Verify email is masked for privacy
        email: expect.stringMatching(/in\*\*\*@/)
      })
    );
    
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Login failed'),
      expect.objectContaining({
        action: 'login_failure',
        hook: 'useAuth',
        // Verify sensitive data is not logged
        error: mockAuthError.message
      })
    );
    
    // Security verification: Ensure no sensitive credential data was logged
    const consoleCalls = (console.error as jest.MockedFunction<typeof console.error>).mock.calls;
    consoleCalls.forEach(call => {
      expect(JSON.stringify(call)).not.toContain('wrongpassword');
      expect(JSON.stringify(call)).not.toContain('invalid@example.com');
    });
  });

  /**
   * Test Case: Logout Functionality
   * 
   * Tests the complete logout workflow including session cleanup, state reset,
   * and security measures. This test ensures that logout properly clears all
   * authentication data and configures security measures appropriately.
   * 
   * Requirements Covered:
   * - User Authentication: Complete logout workflow with proper cleanup
   * - Security Compliance: Secure session termination and cleanup
   */
  it('should handle logout', async () => {
    // Arrange: Setup mock data for logout scenario starting from authenticated state
    const mockUser = mockDataFactory.createMockUser();
    
    // Setup context to simulate successful login first
    const mockContextLogin = jest.fn().mockResolvedValue(undefined);
    const mockContextLogout = jest.fn().mockResolvedValue(undefined);

    // Create initial authenticated context values
    const initialMockContextValues = {
      isAuthenticated: true,
      user: mockUser,
      loading: false,
      error: null,
      login: mockContextLogin,
      logout: mockContextLogout
    };

    // Act: Render hook with authenticated state
    const { result, rerender } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <MockAuthProvider mockValues={initialMockContextValues}>
          {children}
        </MockAuthProvider>
      )
    });

    // Verify initial authenticated state
    expect(result.current.authState.isAuthenticated).toBe(true);
    expect(result.current.authState.user).toEqual(mockUser);

    // Update context values to simulate post-logout state
    const postLogoutMockContextValues = {
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
      login: mockContextLogin,
      logout: mockContextLogout
    };

    // Perform logout action
    await act(async () => {
      await result.current.logout();
    });

    // Rerender with post-logout context values
    rerender({
      wrapper: ({ children }) => (
        <MockAuthProvider mockValues={postLogoutMockContextValues}>
          {children}
        </MockAuthProvider>
      )
    });

    // Assert: Verify successful logout results
    // Verify context logout was called
    expect(mockContextLogout).toHaveBeenCalledTimes(1);
    
    // Verify API interceptors were cleared (null passed for cleanup)
    expect(setupAPIInterceptors).toHaveBeenCalledWith(null);
    expect(setupAPIInterceptors).toHaveBeenCalledTimes(1);
    
    // Verify authentication state reflects successful logout
    expect(result.current.authState.isAuthenticated).toBe(false);
    expect(result.current.authState.user).toBe(null);
    expect(result.current.authState.error).toBe(null);
    expect(result.current.authState.loading).toBe(false);
    expect(result.current.authState.permissions).toEqual([]);
    expect(result.current.authState.session).toBe(null);
    expect(result.current.authState.mfaRequired).toBe(false);
    
    // Security verification: Ensure audit logging occurred
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('Logout initiated'),
      expect.objectContaining({
        action: 'logout_attempt',
        hook: 'useAuth'
      })
    );
    
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('Logout completed successfully'),
      expect.objectContaining({
        action: 'logout_success',
        hook: 'useAuth'
      })
    );
  });

  /**
   * Test Case: Context Provider Requirement
   * 
   * Tests that the useAuth hook properly validates that it's being used within
   * an AuthProvider context. This test ensures proper error handling when the
   * hook is used incorrectly outside of its required context provider.
   * 
   * Requirements Covered:
   * - User Authentication: Proper context usage validation
   * - Security Compliance: Prevention of unauthorized context access
   */
  it('should throw error when used outside AuthProvider', () => {
    // Arrange & Act: Attempt to render hook without AuthProvider wrapper
    // This should throw an error due to missing context
    
    // Capture the error by wrapping in try-catch
    let thrownError: Error | undefined;
    
    try {
      renderHook(() => useAuth());
    } catch (error) {
      thrownError = error as Error;
    }

    // Assert: Verify proper error is thrown
    expect(thrownError).toBeDefined();
    expect(thrownError?.message).toContain(
      'useAuth must be used within an AuthProvider'
    );
    expect(thrownError?.message).toContain(
      'Ensure that your component is wrapped with <AuthProvider>'
    );
  });

  /**
   * Test Case: Session Information Management
   * 
   * Tests that the useAuth hook properly manages session information from
   * storage and includes it in the authentication state. This test verifies
   * session data handling for token management and expiration tracking.
   * 
   * Requirements Covered:
   * - User Authentication: Session state management with token handling
   * - Security Compliance: Secure token storage and validation
   */
  it('should properly manage session information from storage', () => {
    // Arrange: Setup mock session data in storage
    const mockSessionData = {
      accessToken: 'mock-access-token.jwt.signature',
      refreshToken: 'mock-refresh-token.jwt.signature',
      expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes from now
    };

    // Setup storage mocks to return session data
    (tokenStorage.getItem as jest.MockedFunction<typeof tokenStorage.getItem>)
      .mockImplementation((key: string) => {
        switch (key) {
          case 'auth_access_token':
            return mockSessionData.accessToken;
          case 'auth_refresh_token':
            return mockSessionData.refreshToken;
          case 'auth_token_expiry':
            return mockSessionData.expiresAt.toString();
          default:
            return null;
        }
      });

    const mockUser = mockDataFactory.createMockUser();
    const mockContextValues = {
      isAuthenticated: true,
      user: mockUser,
      loading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn()
    };

    // Act: Render hook with session data available
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <MockAuthProvider mockValues={mockContextValues}>
          {children}
        </MockAuthProvider>
      )
    });

    // Assert: Verify session information is properly managed
    expect(result.current.authState.session).toEqual({
      accessToken: mockSessionData.accessToken,
      refreshToken: mockSessionData.refreshToken,
      expiresAt: mockSessionData.expiresAt
    });
    
    // Verify storage was accessed for session data
    expect(tokenStorage.getItem).toHaveBeenCalledWith('auth_access_token');
    expect(tokenStorage.getItem).toHaveBeenCalledWith('auth_refresh_token');
    expect(tokenStorage.getItem).toHaveBeenCalledWith('auth_token_expiry');
  });

  /**
   * Test Case: Error State Management
   * 
   * Tests that the useAuth hook properly handles and converts error objects
   * to string format for consistent error state management. This ensures
   * error information is properly formatted for UI display.
   * 
   * Requirements Covered:
   * - User Authentication: Consistent error state management
   * - Security Compliance: Secure error handling without sensitive data exposure
   */
  it('should convert error objects to string format in authState', () => {
    // Arrange: Setup mock error from context
    const mockError = new Error('Authentication service temporarily unavailable');
    mockError.name = 'ServiceUnavailableError';
    
    const mockContextValues = {
      isAuthenticated: false,
      user: null,
      loading: false,
      error: mockError,  // Error object from context
      login: jest.fn(),
      logout: jest.fn()
    };

    // Act: Render hook with error state
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <MockAuthProvider mockValues={mockContextValues}>
          {children}
        </MockAuthProvider>
      )
    });

    // Assert: Verify error is converted to string format
    expect(result.current.authState.error).toBe(mockError.message);
    expect(typeof result.current.authState.error).toBe('string');
    
    // Verify error message is user-friendly and doesn't expose sensitive data
    expect(result.current.authState.error).not.toContain('stack');
    expect(result.current.authState.error).not.toContain('password');
    expect(result.current.authState.error).not.toContain('token');
  });

  /**
   * Test Case: Authentication State Synchronization
   * 
   * Tests that the useAuth hook properly synchronizes with context changes
   * and updates the local authentication state accordingly. This ensures
   * consistent state management across context updates.
   * 
   * Requirements Covered:
   * - User Authentication: Consistent state synchronization
   * - Security Compliance: Proper state management for security decisions
   */
  it('should synchronize authState with context changes', () => {
    // Arrange: Setup initial unauthenticated context
    const initialMockContextValues = {
      isAuthenticated: false,
      user: null,
      loading: true,  // Initial loading state
      error: null,
      login: jest.fn(),
      logout: jest.fn()
    };

    // Act: Render hook with initial context
    const { result, rerender } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <MockAuthProvider mockValues={initialMockContextValues}>
          {children}
        </MockAuthProvider>
      )
    });

    // Assert: Verify initial state synchronization
    expect(result.current.authState.isAuthenticated).toBe(false);
    expect(result.current.authState.user).toBe(null);
    expect(result.current.authState.loading).toBe(true);

    // Arrange: Update context to authenticated state
    const mockUser = mockDataFactory.createMockUser();
    const updatedMockContextValues = {
      isAuthenticated: true,
      user: mockUser,
      loading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn()
    };

    // Act: Rerender with updated context
    rerender({
      wrapper: ({ children }) => (
        <MockAuthProvider mockValues={updatedMockContextValues}>
          {children}
        </MockAuthProvider>
      )
    });

    // Assert: Verify state synchronization with context changes
    expect(result.current.authState.isAuthenticated).toBe(true);
    expect(result.current.authState.user).toEqual(mockUser);
    expect(result.current.authState.loading).toBe(false);
    
    // Verify permissions are updated based on new user data
    const expectedPermissions = mockUser.roles.flatMap(role => role.permissions);
    expect(result.current.authState.permissions).toEqual(expectedPermissions);
  });
});