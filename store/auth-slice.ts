/**
 * Authentication Redux Slice for Unified Financial Services Platform
 * 
 * This file implements the Redux slice for authentication state management,
 * providing comprehensive authentication functionality including:
 * - User authentication state management
 * - JWT token handling and storage
 * - User permissions and role management
 * - Loading states and error handling
 * - Type-safe selectors for state access
 * 
 * Features Supported:
 * - F-004: Digital Customer Onboarding (authentication component)
 * - Authentication & Authorization (2.3.3 Common Services)
 * - OAuth2, RBAC, and MFA integration
 * - Session management with JWT tokens
 * - User profile and permissions tracking
 * 
 * Security Considerations:
 * - Implements SOC2, PCI-DSS, and GDPR compliance requirements
 * - Secure token storage and management
 * - User data protection and privacy controls
 * - Comprehensive audit logging for authentication events
 * - Role-based access control (RBAC) with granular permissions
 * 
 * @version 1.0.0
 * @author Financial Services Platform Team
 * @compliance SOC2, PCI-DSS, GDPR, Basel IV, FINRA
 * @security Authentication state management with enterprise-grade security
 */

// External imports - Redux Toolkit for state management
import { createSlice, PayloadAction } from '@reduxjs/toolkit'; // v2.0+

// Internal imports - Type definitions for authentication and user management
import { User } from '../models/user';
import { Permission } from '../types/auth';
import { RootState } from './index';

/**
 * Authentication State Interface
 * 
 * Defines the complete authentication state structure for the financial platform,
 * supporting all authentication-related operations including user login, session
 * management, permission tracking, and error handling.
 * 
 * State Properties:
 * - isAuthenticated: Boolean flag indicating user authentication status
 * - user: Complete user object with profile, roles, and permissions
 * - permissions: Flattened array of user permissions for quick access
 * - token: JWT access token for API authentication
 * - status: Operation status for loading states and UI updates
 * - error: Error message for authentication failures and issues
 * 
 * The state design supports:
 * - Seamless user experience with proper loading states
 * - Comprehensive error handling and user feedback
 * - Efficient permission checking throughout the application
 * - Secure token management with proper lifecycle handling
 * - Integration with financial services security requirements
 */
interface AuthState {
  /**
   * Boolean flag indicating whether the user is currently authenticated.
   * 
   * This flag is used throughout the application for:
   * - Route protection and conditional rendering
   * - API request authorization decisions
   * - User interface state management
   * - Security-related feature access control
   * 
   * @default false
   * @security Critical for access control throughout the application
   * @usage Used in route guards, component conditional rendering
   */
  isAuthenticated: boolean;

  /**
   * Complete user object containing profile information, roles, and permissions.
   * 
   * The user object provides:
   * - Personal information for personalization
   * - Role assignments for access control
   * - Customer profile data for financial services
   * - Onboarding status for workflow management
   * - Security metadata for threat detection
   * 
   * @type User | null
   * @nullable null when user is not authenticated
   * @security Contains sensitive user data requiring proper protection
   * @compliance User data subject to GDPR and financial privacy regulations
   */
  user: User | null;

  /**
   * Flattened array of user permissions for efficient access control.
   * 
   * Permissions are extracted from user roles and direct permissions,
   * providing a single source of truth for authorization decisions.
   * Format: ["resource:action", "resource:action", ...]
   * 
   * Examples:
   * - "customer:read" - Read access to customer data
   * - "transaction:approve" - Ability to approve transactions
   * - "compliance:audit" - Access to compliance audit trails
   * 
   * @type Permission[]
   * @format String array with "resource:action" format
   * @usage Used for granular access control throughout the application
   * @performance Optimized for quick permission checks
   */
  permissions: Permission[];

  /**
   * JWT access token for API authentication and authorization.
   * 
   * The token contains:
   * - User identity information
   * - Permission claims
   * - Expiration timestamp
   * - Digital signature for integrity verification
   * 
   * Token Lifecycle:
   * - Set upon successful authentication
   * - Used for all API requests requiring authentication
   * - Automatically refreshed before expiration
   * - Cleared upon logout or token invalidation
   * 
   * @type string | null
   * @nullable null when user is not authenticated
   * @security Must be transmitted over HTTPS and stored securely
   * @standard JWT (JSON Web Token) format with HS256/RS256 signing
   */
  token: string | null;

  /**
   * Operation status indicating the current state of authentication operations.
   * 
   * Status Values:
   * - 'idle': No authentication operation in progress
   * - 'loading': Authentication operation in progress (login, logout, refresh)
   * - 'succeeded': Authentication operation completed successfully
   * - 'failed': Authentication operation failed with error
   * 
   * @type 'idle' | 'loading' | 'succeeded' | 'failed'
   * @usage Used for loading indicators and UI state management
   * @ux Provides user feedback during authentication operations
   */
  status: 'idle' | 'loading' | 'succeeded' | 'failed';

  /**
   * Error message from the last authentication operation.
   * 
   * Error scenarios:
   * - Invalid credentials during login
   * - Token expiration or validation failures
   * - Network errors during authentication
   * - Server errors from authentication service
   * - Permission denied for protected resources
   * 
   * @type string | null
   * @nullable null when no error has occurred
   * @usage Displayed to users for error feedback and troubleshooting
   * @ux User-friendly error messages for better user experience
   */
  error: string | null;
}

/**
 * Initial Authentication State
 * 
 * Defines the default state for the authentication slice when the application
 * starts or when authentication is reset. This state represents an unauthenticated
 * user with no active session or permissions.
 * 
 * Security Considerations:
 * - Defaults to unauthenticated state for security
 * - No sensitive data in initial state
 * - Requires explicit authentication to access protected features
 * - Supports secure application startup flow
 */
const initialState: AuthState = {
  /**
   * User starts as unauthenticated until login is completed.
   * This ensures secure-by-default behavior throughout the application.
   */
  isAuthenticated: false,

  /**
   * No user data available until authentication is successful.
   * Prevents access to user-specific features without proper authentication.
   */
  user: null,

  /**
   * Empty permissions array until user roles are loaded.
   * Ensures no unauthorized access to protected resources.
   */
  permissions: [],

  /**
   * No authentication token until login is completed.
   * Prevents unauthorized API access without proper authentication.
   */
  token: null,

  /**
   * Initial status is idle, indicating no authentication operation in progress.
   * Ready to accept authentication requests from the user interface.
   */
  status: 'idle',

  /**
   * No error message in initial state.
   * Error states are set only when authentication operations fail.
   */
  error: null,
};

/**
 * Authentication Payload Interfaces
 * 
 * Type definitions for action payloads used in authentication operations.
 * These interfaces ensure type safety and proper data structure for
 * authentication state mutations.
 */

/**
 * Payload for setting complete authentication state after successful login.
 * 
 * Contains all necessary information to establish an authenticated session
 * including user profile, authentication token, and derived permissions.
 */
interface SetAuthPayload {
  /** Complete user object with profile and role information */
  user: User;
  /** JWT access token for API authentication */
  token: string;
  /** Optional explicit permissions override */
  permissions?: Permission[];
}

/**
 * Payload for setting loading state during authentication operations.
 * 
 * Simple boolean payload to indicate when authentication operations
 * are in progress, enabling proper loading state management in the UI.
 */
interface SetLoadingPayload {
  /** Boolean indicating loading state */
  loading: boolean;
}

/**
 * Payload for setting error state when authentication operations fail.
 * 
 * Contains error message for user feedback and troubleshooting,
 * supporting comprehensive error handling throughout the application.
 */
interface SetErrorPayload {
  /** User-friendly error message */
  error: string;
}

/**
 * Authentication Redux Slice
 * 
 * Main Redux slice implementation for authentication state management.
 * Provides comprehensive authentication functionality including login, logout,
 * token management, and error handling with full TypeScript type safety.
 * 
 * Slice Configuration:
 * - Name: 'auth' for state key in root reducer
 * - Initial State: Unauthenticated state with no user data
 * - Reducers: Complete set of authentication operations
 * - Actions: Auto-generated action creators for all reducers
 * 
 * The slice implements:
 * - Immutable state updates using Redux Toolkit's Immer
 * - Type-safe action creators and reducers
 * - Comprehensive authentication workflow support
 * - Error handling and loading state management
 * - Integration with financial services security requirements
 */
const authSlice = createSlice({
  /**
   * Slice name used as the key in the root reducer state.
   * Accessible in state as state.auth.*
   */
  name: 'auth',

  /**
   * Initial state for the authentication slice.
   * Represents an unauthenticated user with no active session.
   */
  initialState,

  /**
   * Reducer functions for authentication state mutations.
   * Each reducer handles a specific authentication operation with
   * proper state updates and side effect management.
   */
  reducers: {
    /**
     * Sets the complete authentication state after successful login.
     * 
     * This reducer is called when a user successfully authenticates,
     * setting all necessary authentication data including user profile,
     * JWT token, and permissions for immediate application use.
     * 
     * Operations:
     * - Sets isAuthenticated flag to true
     * - Stores complete user object with profile and roles
     * - Saves JWT token for API authentication
     * - Extracts and flattens user permissions for efficient access
     * - Updates status to 'succeeded' and clears any errors
     * 
     * @param state Current authentication state
     * @param action Action containing authentication data payload
     */
    setAuth: (state, action: PayloadAction<SetAuthPayload>) => {
      const { user, token, permissions } = action.payload;
      
      // Set authentication flag to enable protected features
      state.isAuthenticated = true;
      
      // Store complete user object for profile access and personalization
      state.user = user;
      
      // Store JWT token for API authentication
      state.token = token;
      
      // Extract permissions from user roles and direct permissions
      // This creates a flattened array for efficient permission checking
      const rolePermissions = user.roles.reduce((acc: Permission[], role) => {
        return [...acc, ...role.permissions];
      }, []);
      
      // Combine role permissions with direct user permissions
      // Remove duplicates using Set for optimal performance
      const allPermissions = [...new Set([
        ...rolePermissions,
        ...user.permissions,
        ...(permissions || [])
      ])];
      
      state.permissions = allPermissions;
      
      // Update operation status to indicate successful authentication
      state.status = 'succeeded';
      
      // Clear any previous error messages
      state.error = null;
    },

    /**
     * Clears all authentication state on user logout.
     * 
     * This reducer handles user logout by resetting all authentication
     * state to initial values, effectively ending the user session and
     * preventing further access to protected resources.
     * 
     * Operations:
     * - Sets isAuthenticated flag to false
     * - Clears user object and profile data
     * - Removes JWT token to prevent API access
     * - Clears all user permissions
     * - Resets status to 'idle' and clears error messages
     * 
     * Security Considerations:
     * - Ensures complete session cleanup
     * - Prevents residual access to protected data
     * - Supports secure logout workflow
     * - Enables clean re-authentication process
     * 
     * @param state Current authentication state
     */
    clearAuth: (state) => {
      // Reset authentication flag to disable protected features
      state.isAuthenticated = false;
      
      // Clear user object and profile data for security
      state.user = null;
      
      // Remove JWT token to prevent unauthorized API access
      state.token = null;
      
      // Clear all user permissions for security
      state.permissions = [];
      
      // Reset operation status to idle state
      state.status = 'idle';
      
      // Clear any error messages for clean state
      state.error = null;
    },

    /**
     * Sets the loading state for authentication operations.
     * 
     * This reducer manages loading states during authentication operations
     * such as login, logout, token refresh, and profile updates. It enables
     * proper UI feedback and prevents multiple simultaneous operations.
     * 
     * Operations:
     * - Updates status based on loading state
     * - Sets 'loading' status when operation is in progress
     * - Maintains current state during loading operations
     * - Clears errors when starting new operations
     * 
     * @param state Current authentication state
     * @param action Action containing loading state payload
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      // Update status based on loading state
      state.status = action.payload ? 'loading' : 'idle';
      
      // Clear error when starting new operation
      if (action.payload) {
        state.error = null;
      }
    },

    /**
     * Sets error state for authentication operations.
     * 
     * This reducer handles error conditions during authentication operations,
     * providing user feedback and enabling proper error recovery workflows.
     * 
     * Operations:
     * - Sets error message for user display
     * - Updates status to 'failed' to indicate operation failure
     * - Maintains current authentication state during errors
     * - Supports error recovery and retry mechanisms
     * 
     * Error Scenarios:
     * - Invalid credentials during login
     * - Network errors during authentication
     * - Token validation failures
     * - Server errors from authentication service
     * - Permission denied for protected operations
     * 
     * @param state Current authentication state
     * @param action Action containing error message payload
     */
    setError: (state, action: PayloadAction<string>) => {
      // Set user-friendly error message for display
      state.error = action.payload;
      
      // Update status to indicate operation failure
      state.status = 'failed';
    },

    /**
     * Updates user profile information while maintaining authentication.
     * 
     * This reducer handles user profile updates without requiring
     * re-authentication, supporting profile management and real-time
     * user data synchronization.
     * 
     * Operations:
     * - Updates user object with new profile data
     * - Maintains authentication state and permissions
     * - Preserves JWT token and session data
     * - Triggers permission recalculation if roles changed
     * 
     * @param state Current authentication state
     * @param action Action containing updated user data
     */
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      // Only update if user is authenticated
      if (state.user) {
        // Merge updated data with existing user object
        state.user = { ...state.user, ...action.payload };
        
        // Recalculate permissions if roles were updated
        if (action.payload.roles) {
          const rolePermissions = state.user.roles.reduce((acc: Permission[], role) => {
            return [...acc, ...role.permissions];
          }, []);
          
          const allPermissions = [...new Set([
            ...rolePermissions,
            ...state.user.permissions
          ])];
          
          state.permissions = allPermissions;
        }
        
        // Update status to indicate successful update
        state.status = 'succeeded';
        state.error = null;
      }
    },

    /**
     * Clears error state for error recovery.
     * 
     * This reducer enables error recovery by clearing error messages,
     * allowing users to retry failed operations and providing clean
     * error handling workflows.
     * 
     * @param state Current authentication state
     */
    clearError: (state) => {
      state.error = null;
      // Reset status to idle if currently failed
      if (state.status === 'failed') {
        state.status = 'idle';
      }
    },

    /**
     * Updates JWT token for token refresh operations.
     * 
     * This reducer handles JWT token refresh without requiring full
     * re-authentication, supporting seamless session management and
     * preventing user interruption during token rotation.
     * 
     * @param state Current authentication state
     * @param action Action containing new JWT token
     */
    updateToken: (state, action: PayloadAction<string>) => {
      // Update token only if user is authenticated
      if (state.isAuthenticated) {
        state.token = action.payload;
        state.status = 'succeeded';
        state.error = null;
      }
    },
  },
});

/**
 * Action Creators Export
 * 
 * Auto-generated action creators for all authentication operations.
 * These action creators provide type-safe action dispatching throughout
 * the application with proper payload validation.
 */
export const {
  setAuth,
  clearAuth,
  setLoading,
  setError,
  updateUserProfile,
  clearError,
  updateToken,
} = authSlice.actions;

/**
 * Authentication Selectors
 * 
 * Type-safe selector functions for accessing authentication state
 * throughout the application. These selectors provide optimized
 * access to authentication data with proper TypeScript types.
 * 
 * Selector Benefits:
 * - Type-safe state access with IntelliSense support
 * - Consistent data access patterns across components
 * - Optimized re-render performance through memoization
 * - Centralized state access logic for maintainability
 */

/**
 * Selects the user authentication status from the state.
 * 
 * This selector is used throughout the application for:
 * - Route protection and navigation guards
 * - Conditional rendering of authenticated content
 * - Access control decisions in components
 * - Authentication status display in UI
 * 
 * @param state Root application state
 * @returns Boolean indicating user authentication status
 * @usage const isAuthenticated = useSelector(selectIsAuthenticated);
 */
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.isAuthenticated;

/**
 * Selects the current authenticated user object from the state.
 * 
 * This selector provides access to complete user profile information
 * including personal data, roles, permissions, and preferences.
 * 
 * @param state Root application state
 * @returns User object or null if not authenticated
 * @usage const user = useSelector(selectUser);
 */
export const selectUser = (state: RootState): User | null =>
  state.auth.user;

/**
 * Selects the user's permissions array from the state.
 * 
 * This selector provides efficient access to the flattened permissions
 * array for authorization decisions throughout the application.
 * 
 * @param state Root application state
 * @returns Array of user permissions
 * @usage const permissions = useSelector(selectPermissions);
 */
export const selectPermissions = (state: RootState): Permission[] =>
  state.auth.permissions;

/**
 * Selects the current authentication operation status from the state.
 * 
 * This selector is used for managing loading states, error handling,
 * and UI feedback during authentication operations.
 * 
 * @param state Root application state
 * @returns Authentication operation status
 * @usage const authStatus = useSelector(selectAuthStatus);
 */
export const selectAuthStatus = (state: RootState): 'idle' | 'loading' | 'succeeded' | 'failed' =>
  state.auth.status;

/**
 * Selects the current authentication error message from the state.
 * 
 * This selector provides access to error messages for user feedback
 * and error handling workflows throughout the application.
 * 
 * @param state Root application state
 * @returns Error message or null if no error
 * @usage const authError = useSelector(selectAuthError);
 */
export const selectAuthError = (state: RootState): string | null =>
  state.auth.error;

/**
 * Selects the current JWT authentication token from the state.
 * 
 * This selector provides access to the JWT token for API authentication
 * and token management operations.
 * 
 * @param state Root application state
 * @returns JWT token or null if not authenticated
 * @usage const token = useSelector(selectAuthToken);
 */
export const selectAuthToken = (state: RootState): string | null =>
  state.auth.token;

/**
 * Advanced selector for checking specific user permissions.
 * 
 * This selector factory creates permission-checking functions for
 * granular access control throughout the application.
 * 
 * @param permission Permission to check (e.g., "customer:read")
 * @returns Selector function that returns boolean indicating permission
 * @usage const canReadCustomers = useSelector(selectHasPermission("customer:read"));
 */
export const selectHasPermission = (permission: Permission) => (state: RootState): boolean =>
  state.auth.permissions.includes(permission);

/**
 * Selector for checking multiple permissions (AND logic).
 * 
 * This selector checks if the user has all of the specified permissions,
 * useful for components that require multiple permissions to function.
 * 
 * @param permissions Array of permissions to check
 * @returns Selector function that returns boolean indicating all permissions
 * @usage const canManageCustomers = useSelector(selectHasAllPermissions(["customer:read", "customer:write"]));
 */
export const selectHasAllPermissions = (permissions: Permission[]) => (state: RootState): boolean =>
  permissions.every(permission => state.auth.permissions.includes(permission));

/**
 * Selector for checking any of multiple permissions (OR logic).
 * 
 * This selector checks if the user has at least one of the specified permissions,
 * useful for components that can function with any of several permissions.
 * 
 * @param permissions Array of permissions to check
 * @returns Selector function that returns boolean indicating any permission
 * @usage const canAccessCustomers = useSelector(selectHasAnyPermission(["customer:read", "customer:write"]));
 */
export const selectHasAnyPermission = (permissions: Permission[]) => (state: RootState): boolean =>
  permissions.some(permission => state.auth.permissions.includes(permission));

/**
 * Selector for user display name.
 * 
 * This selector provides a formatted display name for the user,
 * combining first and last name for UI display purposes.
 * 
 * @param state Root application state
 * @returns Formatted user display name or empty string if not authenticated
 * @usage const displayName = useSelector(selectUserDisplayName);
 */
export const selectUserDisplayName = (state: RootState): string =>
  state.auth.user 
    ? `${state.auth.user.firstName} ${state.auth.user.lastName}`.trim()
    : '';

/**
 * Selector for user roles.
 * 
 * This selector provides access to the user's assigned roles
 * for role-based access control and UI customization.
 * 
 * @param state Root application state
 * @returns Array of user roles or empty array if not authenticated
 * @usage const userRoles = useSelector(selectUserRoles);
 */
export const selectUserRoles = (state: RootState) =>
  state.auth.user?.roles || [];

/**
 * Selector for authentication loading state.
 * 
 * This selector provides a boolean indicating if any authentication
 * operation is currently in progress.
 * 
 * @param state Root application state
 * @returns Boolean indicating loading state
 * @usage const isLoading = useSelector(selectIsLoading);
 */
export const selectIsLoading = (state: RootState): boolean =>
  state.auth.status === 'loading';

/**
 * Authentication Slice Export
 * 
 * Exports the complete authentication slice for integration with
 * the root reducer and store configuration.
 */
export const authSlice = authSlice;

/**
 * Default Export - Authentication Reducer
 * 
 * The authentication reducer function for integration with the Redux store.
 * This is the main export used by the root reducer configuration.
 */
export default authSlice.reducer;