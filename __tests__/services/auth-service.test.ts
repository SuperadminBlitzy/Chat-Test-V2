/**
 * Authentication Service Test Suite
 * 
 * Comprehensive test suite for the authentication service functionality including
 * login, logout, registration, and session management. This test suite ensures
 * the authentication service correctly handles all scenarios as required by:
 * 
 * F-004: Digital Customer Onboarding - User Authentication requirements
 * Security Compliance - Token handling and error management testing
 * 
 * The tests use Jest framework with extensive mocking to isolate the authentication
 * logic and verify correct behavior under various conditions including success
 * scenarios, error cases, network failures, and security edge cases.
 * 
 * Coverage includes:
 * - User login with email/password authentication
 * - User logout with session invalidation
 * - User registration with KYC/AML data collection
 * - Token refresh for seamless session management
 * - Password reset workflows
 * - Error handling and user-friendly messaging
 * - Security token validation and storage
 * - Network error resilience
 * 
 * @fileoverview Comprehensive authentication service test suite
 * @version 1.0.0
 * @author Financial Services Platform Test Team
 * @compliance SOC2, PCI-DSS testing requirements
 */

// External imports with version specification
import axios from 'axios'; // axios@1.6+ - HTTP client library for mocking API responses
import { AxiosError } from 'axios'; // AxiosError type for error testing scenarios

// Internal imports - authentication functions and dependencies
import { 
  login, 
  logout, 
  register, 
  refreshToken,
  forgotPassword,
  resetPassword
} from '../../src/services/auth-service';

// API and utility imports for mocking
import api from '../../src/lib/api';
import { storage } from '../../src/lib/storage';

// Type imports for test data creation
import { 
  LoginRequest, 
  LoginResponse, 
  TokenRefreshRequest, 
  TokenRefreshResponse, 
  User,
  Session
} from '../../src/types/auth';

// Jest mocking setup for external dependencies
jest.mock('axios');
jest.mock('../../src/lib/api');
jest.mock('../../src/lib/storage');

// Type assertions for mocked modules
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedApi = api as jest.Mocked<typeof api>;
const mockedStorage = storage as jest.Mocked<typeof storage>;

/**
 * Mock Data Factory
 * 
 * Provides consistent test data creation for authentication scenarios.
 * All mock data follows the platform's data structure requirements and
 * includes realistic values for comprehensive testing.
 */
const createMockUser = (): User => ({
  id: 'user-123e4567-e89b-12d3-a456-426614174000',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  roles: [
    {
      id: 'role-123',
      name: 'customer',
      permissions: ['customer:read', 'transaction:read']
    }
  ]
});

const createMockSession = (): Session => ({
  accessToken: 'mock-jwt-access-token-abcd1234',
  refreshToken: 'mock-jwt-refresh-token-efgh5678',
  expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes from now
});

const createMockLoginCredentials = (): LoginRequest => ({
  email: 'john.doe@example.com',
  password: 'SecurePassword123!'
});

const createMockLoginResponse = (): LoginResponse => ({
  user: createMockUser(),
  session: createMockSession()
});

const createMockRegistrationData = () => ({
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  password: 'SecurePassword123!',
  confirmPassword: 'SecurePassword123!',
  phone: '+1-555-123-4567',
  dateOfBirth: '1990-05-15',
  country: 'US',
  consent: {
    termsOfService: true,
    privacyPolicy: true,
    marketingConsent: false
  }
});

const createMockTokenRefreshRequest = (): TokenRefreshRequest => ({
  refreshToken: 'mock-jwt-refresh-token-efgh5678'
});

const createMockTokenRefreshResponse = (): TokenRefreshResponse => ({
  session: {
    ...createMockSession(),
    accessToken: 'new-mock-jwt-access-token-ijkl9012',
    refreshToken: 'new-mock-jwt-refresh-token-mnop3456'
  }
});

/**
 * Authentication Service Test Suite
 * 
 * Groups all tests related to the authentication service functionality.
 * Sets up common mocking behavior and cleanup for consistent test execution.
 */
describe('Auth Service', () => {
  // Setup and teardown for each test
  beforeEach(() => {
    // Clear all mocks before each test to ensure test isolation
    jest.clearAllMocks();
    
    // Reset console methods to avoid test noise
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    
    // Setup default storage mock behavior
    mockedStorage.getItem.mockReturnValue(null);
    mockedStorage.setItem.mockImplementation(() => {});
    mockedStorage.removeItem.mockImplementation(() => {});
    mockedStorage.getSessionItem.mockReturnValue(null);
    mockedStorage.setSessionItem.mockImplementation(() => {});
    mockedStorage.removeSessionItem.mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore all mocks after each test
    jest.restoreAllMocks();
  });

  /**
   * Login Functionality Tests
   * 
   * Tests the login function covering successful authentication, validation errors,
   * network failures, and various server error responses. Ensures proper token
   * handling and user-friendly error messaging.
   */
  describe('login', () => {
    const mockCredentials = createMockLoginCredentials();
    const mockLoginResponse = createMockLoginResponse();

    test('should successfully authenticate user with valid credentials', async () => {
      // Arrange: Setup successful API response
      mockedApi.auth.login.mockResolvedValue(mockLoginResponse);

      // Act: Call login function with valid credentials
      const result = await login(mockCredentials);

      // Assert: Verify successful authentication
      expect(mockedApi.auth.login).toHaveBeenCalledWith({
        email: mockCredentials.email.toLowerCase().trim(),
        password: mockCredentials.password
      });
      expect(mockedApi.auth.login).toHaveBeenCalledTimes(1);
      
      // Verify returned user data is correct
      expect(result.user).toEqual(mockLoginResponse.user);
      expect(result.session).toEqual(mockLoginResponse.session);
      expect(result.user.email).toBe(mockCredentials.email);
      expect(result.user.firstName).toBe('John');
      expect(result.user.lastName).toBe('Doe');
      
      // Verify session tokens are present
      expect(result.session.accessToken).toBeTruthy();
      expect(result.session.refreshToken).toBeTruthy();
      expect(result.session.expiresAt).toBeGreaterThan(Date.now());
    });

    test('should handle login failure with invalid credentials', async () => {
      // Arrange: Setup API error response for invalid credentials
      const authError = new AxiosError('Invalid credentials');
      authError.response = {
        status: 401,
        statusText: 'Unauthorized',
        data: { 
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        },
        headers: {},
        config: {} as any
      };
      authError.isAxiosError = true;
      
      mockedApi.auth.login.mockRejectedValue(authError);

      // Act & Assert: Verify error is thrown with proper message
      await expect(login(mockCredentials)).rejects.toThrow();
      
      try {
        await login(mockCredentials);
      } catch (error: any) {
        expect(error.message).toContain('Authentication login failed');
        expect(error.status).toBe(401);
        expect(error.code).toBe('INVALID_CREDENTIALS');
        expect(error.userMessage).toContain('Invalid email or password');
      }
      
      expect(mockedApi.auth.login).toHaveBeenCalledTimes(1);
    });

    test('should validate email format before making API call', async () => {
      // Arrange: Create credentials with invalid email format
      const invalidCredentials = {
        ...mockCredentials,
        email: 'invalid-email-format'
      };

      // Act & Assert: Verify validation error is thrown
      await expect(login(invalidCredentials)).rejects.toThrow('Invalid email format provided');
      
      // Verify API was not called due to validation failure
      expect(mockedApi.auth.login).not.toHaveBeenCalled();
    });

    test('should require both email and password', async () => {
      // Test missing email
      await expect(login({ email: '', password: 'password' })).rejects.toThrow('Email and password are required');
      
      // Test missing password  
      await expect(login({ email: 'test@example.com', password: '' })).rejects.toThrow('Email and password are required');
      
      // Verify API was not called for invalid inputs
      expect(mockedApi.auth.login).not.toHaveBeenCalled();
    });

    test('should handle network errors gracefully', async () => {
      // Arrange: Setup network error
      const networkError = new Error('Network Error');
      mockedApi.auth.login.mockRejectedValue(networkError);

      // Act & Assert: Verify network error handling
      await expect(login(mockCredentials)).rejects.toThrow();
      
      try {
        await login(mockCredentials);
      } catch (error: any) {
        expect(error.code).toBe('NETWORK_ERROR');
        expect(error.userMessage).toContain('Network error occurred');
      }
    });

    test('should handle server errors (5xx) appropriately', async () => {
      // Arrange: Setup server error response
      const serverError = new AxiosError('Internal Server Error');
      serverError.response = {
        status: 500,
        statusText: 'Internal Server Error',
        data: { message: 'Server temporarily unavailable' },
        headers: {},
        config: {} as any
      };
      serverError.isAxiosError = true;
      
      mockedApi.auth.login.mockRejectedValue(serverError);

      // Act & Assert: Verify server error handling
      try {
        await login(mockCredentials);
      } catch (error: any) {
        expect(error.status).toBe(500);
        expect(error.userMessage).toContain('Server error occurred');
      }
    });

    test('should validate response structure for security', async () => {
      // Arrange: Setup invalid response (missing required fields)
      const invalidResponse = { user: null, session: null };
      mockedApi.auth.login.mockResolvedValue(invalidResponse as any);

      // Act & Assert: Verify response validation
      await expect(login(mockCredentials)).rejects.toThrow('Invalid authentication response received from server');
    });

    test('should validate session tokens are present', async () => {
      // Arrange: Setup response with missing tokens
      const responseWithoutTokens = {
        user: createMockUser(),
        session: {
          accessToken: '',
          refreshToken: '',
          expiresAt: Date.now() + 1800000
        }
      };
      mockedApi.auth.login.mockResolvedValue(responseWithoutTokens);

      // Act & Assert: Verify token validation
      await expect(login(mockCredentials)).rejects.toThrow('Authentication tokens missing from server response');
    });
  });

  /**
   * Logout Functionality Tests
   * 
   * Tests the logout function including successful logout, server errors,
   * and graceful handling of logout failures with client-side cleanup.
   */
  describe('logout', () => {
    test('should successfully log out user and invalidate session', async () => {
      // Arrange: Setup successful logout response
      mockedApi.auth.logout.mockResolvedValue({ success: true });

      // Act: Call logout function
      await logout();

      // Assert: Verify logout API was called
      expect(mockedApi.auth.logout).toHaveBeenCalledTimes(1);
      expect(mockedApi.auth.logout).toHaveBeenCalledWith();
    });

    test('should handle logout server errors gracefully', async () => {
      // Arrange: Setup server error that shouldn't prevent client cleanup
      const logoutError = new AxiosError('Server Error');
      logoutError.response = {
        status: 400,
        statusText: 'Bad Request',
        data: { message: 'Invalid session' },
        headers: {},
        config: {} as any
      };
      logoutError.isAxiosError = true;
      
      mockedApi.auth.logout.mockRejectedValue(logoutError);

      // Act: Logout should complete despite server error
      await expect(logout()).resolves.not.toThrow();

      // Assert: Verify logout was attempted
      expect(mockedApi.auth.logout).toHaveBeenCalledTimes(1);
    });

    test('should throw error only for critical server failures (5xx)', async () => {
      // Arrange: Setup critical server error
      const criticalError = new AxiosError('Critical Server Error');
      criticalError.response = {
        status: 500,
        statusText: 'Internal Server Error',
        data: { message: 'Critical system failure' },
        headers: {},
        config: {} as any
      };
      criticalError.isAxiosError = true;
      
      mockedApi.auth.logout.mockRejectedValue(criticalError);

      // Act & Assert: Should throw for critical errors
      await expect(logout()).rejects.toThrow();
      
      try {
        await logout();
      } catch (error: any) {
        expect(error.status).toBe(500);
        expect(error.userMessage).toContain('Server error occurred');
      }
    });

    test('should handle network errors gracefully', async () => {
      // Arrange: Setup network error
      const networkError = new Error('Network failure');
      mockedApi.auth.logout.mockRejectedValue(networkError);

      // Act: Should complete despite network error
      await expect(logout()).resolves.not.toThrow();
      expect(mockedApi.auth.logout).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * Registration Functionality Tests
   * 
   * Tests the user registration function including successful registration,
   * validation errors, consent requirements, and KYC/AML compliance checks.
   */
  describe('register', () => {
    const mockRegistrationData = createMockRegistrationData();
    const mockUser = createMockUser();

    test('should successfully register new user with valid data', async () => {
      // Arrange: Setup successful registration response
      mockedApi.auth.register.mockResolvedValue(mockUser);

      // Act: Call register function with valid data
      const result = await register(mockRegistrationData);

      // Assert: Verify registration API was called with correct data
      expect(mockedApi.auth.register).toHaveBeenCalledWith({
        firstName: mockRegistrationData.firstName.trim(),
        lastName: mockRegistrationData.lastName.trim(),
        email: mockRegistrationData.email.toLowerCase().trim(),
        password: mockRegistrationData.password,
        phone: mockRegistrationData.phone?.trim(),
        dateOfBirth: mockRegistrationData.dateOfBirth,
        country: mockRegistrationData.country?.trim(),
        consent: {
          termsOfService: mockRegistrationData.consent.termsOfService,
          privacyPolicy: mockRegistrationData.consent.privacyPolicy,
          marketingConsent: mockRegistrationData.consent.marketingConsent,
          consentTimestamp: expect.any(String)
        }
      });
      
      // Verify returned user data
      expect(result).toEqual(mockUser);
      expect(result.id).toBeTruthy();
      expect(result.email).toBeTruthy();
      expect(mockedApi.auth.register).toHaveBeenCalledTimes(1);
    });

    test('should validate required fields are provided', async () => {
      // Test missing first name
      const missingFirstName = { ...mockRegistrationData, firstName: '' };
      await expect(register(missingFirstName)).rejects.toThrow('All required fields must be provided');

      // Test missing last name
      const missingLastName = { ...mockRegistrationData, lastName: '' };
      await expect(register(missingLastName)).rejects.toThrow('All required fields must be provided');

      // Test missing email
      const missingEmail = { ...mockRegistrationData, email: '' };
      await expect(register(missingEmail)).rejects.toThrow('All required fields must be provided');

      // Test missing password
      const missingPassword = { ...mockRegistrationData, password: '' };
      await expect(register(missingPassword)).rejects.toThrow('All required fields must be provided');

      // Verify API was not called for invalid inputs
      expect(mockedApi.auth.register).not.toHaveBeenCalled();
    });

    test('should validate password confirmation matches', async () => {
      // Arrange: Create data with mismatched passwords
      const mismatchedPasswords = {
        ...mockRegistrationData,
        confirmPassword: 'DifferentPassword123!'
      };

      // Act & Assert: Verify password mismatch error
      await expect(register(mismatchedPasswords)).rejects.toThrow('Password confirmation does not match');
      
      expect(mockedApi.auth.register).not.toHaveBeenCalled();
    });

    test('should validate email format', async () => {
      // Arrange: Create data with invalid email
      const invalidEmail = {
        ...mockRegistrationData,
        email: 'invalid-email-format'
      };

      // Act & Assert: Verify email validation error
      await expect(register(invalidEmail)).rejects.toThrow('Please provide a valid email address');
      
      expect(mockedApi.auth.register).not.toHaveBeenCalled();
    });

    test('should validate password strength requirements', async () => {
      const testCases = [
        { password: 'weak', description: 'too short' },
        { password: 'nouppercase123!', description: 'no uppercase' },
        { password: 'NOLOWERCASE123!', description: 'no lowercase' },
        { password: 'NoNumbers!', description: 'no numbers' },
        { password: 'NoSpecialChars123', description: 'no special characters' },
      ];

      for (const testCase of testCases) {
        const weakPasswordData = {
          ...mockRegistrationData,
          password: testCase.password,
          confirmPassword: testCase.password
        };

        await expect(register(weakPasswordData)).rejects.toThrow('Password must be at least 12 characters long');
      }
      
      expect(mockedApi.auth.register).not.toHaveBeenCalled();
    });

    test('should require GDPR consent for terms and privacy policy', async () => {
      // Test missing terms of service consent
      const missingTermsConsent = {
        ...mockRegistrationData,
        consent: {
          ...mockRegistrationData.consent,
          termsOfService: false
        }
      };
      await expect(register(missingTermsConsent)).rejects.toThrow('Acceptance of Terms of Service and Privacy Policy is required');

      // Test missing privacy policy consent
      const missingPrivacyConsent = {
        ...mockRegistrationData,
        consent: {
          ...mockRegistrationData.consent,
          privacyPolicy: false
        }
      };
      await expect(register(missingPrivacyConsent)).rejects.toThrow('Acceptance of Terms of Service and Privacy Policy is required');
      
      expect(mockedApi.auth.register).not.toHaveBeenCalled();
    });

    test('should validate minimum age requirement (18 years)', async () => {
      // Arrange: Create data with underage date of birth
      const underageData = {
        ...mockRegistrationData,
        dateOfBirth: '2010-01-01' // Person would be ~15 years old
      };

      // Act & Assert: Verify age validation
      await expect(register(underageData)).rejects.toThrow('You must be at least 18 years old');
      
      expect(mockedApi.auth.register).not.toHaveBeenCalled();
    });

    test('should handle registration conflicts (existing email)', async () => {
      // Arrange: Setup conflict error response
      const conflictError = new AxiosError('Email already exists');
      conflictError.response = {
        status: 409,
        statusText: 'Conflict',
        data: { 
          message: 'User with this email already exists',
          code: 'EMAIL_ALREADY_EXISTS'
        },
        headers: {},
        config: {} as any
      };
      conflictError.isAxiosError = true;
      
      mockedApi.auth.register.mockRejectedValue(conflictError);

      // Act & Assert: Verify conflict error handling
      try {
        await register(mockRegistrationData);
      } catch (error: any) {
        expect(error.status).toBe(409);
        expect(error.userMessage).toContain('An account with this email already exists');
      }
    });

    test('should validate response structure', async () => {
      // Arrange: Setup invalid response structure
      const invalidResponse = { id: null, email: null };
      mockedApi.auth.register.mockResolvedValue(invalidResponse as any);

      // Act & Assert: Verify response validation
      await expect(register(mockRegistrationData)).rejects.toThrow('Invalid registration response received from server');
    });
  });

  /**
   * Token Refresh Functionality Tests
   * 
   * Tests the token refresh function including successful token refresh,
   * invalid token handling, and security validation of refreshed tokens.
   */
  describe('refreshToken', () => {
    const mockTokenRequest = createMockTokenRefreshRequest();
    const mockTokenResponse = createMockTokenRefreshResponse();

    test('should successfully refresh authentication token', async () => {
      // Arrange: Setup successful token refresh response
      mockedApi.auth.refreshToken.mockResolvedValue(mockTokenResponse);

      // Act: Call refreshToken function
      const result = await refreshToken(mockTokenRequest);

      // Assert: Verify token refresh API was called
      expect(mockedApi.auth.refreshToken).toHaveBeenCalledTimes(1);
      expect(mockedApi.auth.refreshToken).toHaveBeenCalledWith();
      
      // Verify returned session data
      expect(result.session).toEqual(mockTokenResponse.session);
      expect(result.session.accessToken).toBeTruthy();
      expect(result.session.refreshToken).toBeTruthy();
      expect(result.session.expiresAt).toBeGreaterThan(Date.now());
    });

    test('should validate refresh token is provided', async () => {
      // Arrange: Empty refresh token
      const emptyTokenRequest = { refreshToken: '' };

      // Act & Assert: Verify validation error
      await expect(refreshToken(emptyTokenRequest)).rejects.toThrow('Refresh token is required');
      
      expect(mockedApi.auth.refreshToken).not.toHaveBeenCalled();
    });

    test('should validate JWT token format', async () => {
      // Arrange: Invalid token format (JWT should have 3 parts separated by dots)
      const invalidTokenRequest = { refreshToken: 'invalid-token-format' };

      // Act & Assert: Verify format validation
      await expect(refreshToken(invalidTokenRequest)).rejects.toThrow('Invalid refresh token format');
      
      expect(mockedApi.auth.refreshToken).not.toHaveBeenCalled();
    });

    test('should validate response structure and tokens', async () => {
      // Arrange: Setup invalid response structure
      const invalidResponse = { session: null };
      mockedApi.auth.refreshToken.mockResolvedValue(invalidResponse as any);

      // Act & Assert: Verify response validation
      await expect(refreshToken(mockTokenRequest)).rejects.toThrow('Invalid token refresh response received from server');
    });

    test('should validate new tokens are present in response', async () => {
      // Arrange: Setup response with missing tokens
      const responseWithoutTokens = {
        session: {
          accessToken: '',
          refreshToken: '',
          expiresAt: Date.now() + 1800000
        }
      };
      mockedApi.auth.refreshToken.mockResolvedValue(responseWithoutTokens);

      // Act & Assert: Verify token validation
      await expect(refreshToken(mockTokenRequest)).rejects.toThrow('New authentication tokens missing from refresh response');
    });

    test('should validate token expiration time', async () => {
      // Arrange: Setup response with expired tokens
      const expiredTokenResponse = {
        session: {
          accessToken: 'expired-token',
          refreshToken: 'expired-refresh-token',
          expiresAt: Date.now() - 1000 // Expired 1 second ago
        }
      };
      mockedApi.auth.refreshToken.mockResolvedValue(expiredTokenResponse);

      // Act & Assert: Verify expiration validation
      await expect(refreshToken(mockTokenRequest)).rejects.toThrow('Received expired tokens from refresh operation');
    });

    test('should handle invalid refresh token errors', async () => {
      // Arrange: Setup invalid token error
      const invalidTokenError = new AxiosError('Invalid refresh token');
      invalidTokenError.response = {
        status: 401,
        statusText: 'Unauthorized',
        data: { 
          message: 'Refresh token is invalid or expired',
          code: 'INVALID_REFRESH_TOKEN'
        },
        headers: {},
        config: {} as any
      };
      invalidTokenError.isAxiosError = true;
      
      mockedApi.auth.refreshToken.mockRejectedValue(invalidTokenError);

      // Act & Assert: Verify invalid token error handling
      try {
        await refreshToken(mockTokenRequest);
      } catch (error: any) {
        expect(error.status).toBe(401);
        expect(error.code).toBe('INVALID_REFRESH_TOKEN');
        expect(error.userMessage).toContain('Authentication required');
      }
    });
  });

  /**
   * Forgot Password Functionality Tests
   * 
   * Tests the forgot password function including successful password reset initiation,
   * email validation, and security measures against abuse.
   */
  describe('forgotPassword', () => {
    const testEmail = 'user@example.com';

    test('should successfully initiate password reset', async () => {
      // Arrange: Setup successful password reset response
      mockedApi.auth.requestPasswordReset.mockResolvedValue({ success: true });

      // Act: Call forgotPassword function
      await forgotPassword(testEmail);

      // Assert: Verify password reset API was called
      expect(mockedApi.auth.requestPasswordReset).toHaveBeenCalledTimes(1);
      expect(mockedApi.auth.requestPasswordReset).toHaveBeenCalledWith(testEmail.toLowerCase().trim());
    });

    test('should validate email is provided', async () => {
      // Act & Assert: Verify email requirement
      await expect(forgotPassword('')).rejects.toThrow('Email address is required for password reset');
      
      expect(mockedApi.auth.requestPasswordReset).not.toHaveBeenCalled();
    });

    test('should validate email format', async () => {
      // Arrange: Invalid email format
      const invalidEmail = 'invalid-email-format';

      // Act & Assert: Verify email format validation
      await expect(forgotPassword(invalidEmail)).rejects.toThrow('Please provide a valid email address for password reset');
      
      expect(mockedApi.auth.requestPasswordReset).not.toHaveBeenCalled();
    });

    test('should handle rate limiting errors', async () => {
      // Arrange: Setup rate limiting error
      const rateLimitError = new AxiosError('Too Many Requests');
      rateLimitError.response = {
        status: 429,
        statusText: 'Too Many Requests',
        data: { message: 'Too many password reset attempts' },
        headers: {},
        config: {} as any
      };
      rateLimitError.isAxiosError = true;
      
      mockedApi.auth.requestPasswordReset.mockRejectedValue(rateLimitError);

      // Act & Assert: Verify rate limiting error handling
      try {
        await forgotPassword(testEmail);
      } catch (error: any) {
        expect(error.status).toBe(429);
        expect(error.userMessage).toContain('Too many attempts');
      }
    });
  });

  /**
   * Reset Password Functionality Tests
   * 
   * Tests the reset password function including successful password reset,
   * token validation, and password strength requirements.
   */
  describe('resetPassword', () => {
    const mockResetData = {
      token: 'valid-reset-token-abcd1234567890',
      password: 'NewSecurePassword123!'
    };

    test('should successfully reset password with valid token', async () => {
      // Arrange: Setup successful password reset response
      mockedApi.auth.resetPassword.mockResolvedValue({ success: true });

      // Act: Call resetPassword function
      await resetPassword(mockResetData);

      // Assert: Verify password reset API was called
      expect(mockedApi.auth.resetPassword).toHaveBeenCalledTimes(1);
      expect(mockedApi.auth.resetPassword).toHaveBeenCalledWith({
        token: mockResetData.token,
        newPassword: mockResetData.password
      });
    });

    test('should validate token and password are provided', async () => {
      // Test missing token
      await expect(resetPassword({ token: '', password: 'password' })).rejects.toThrow('Reset token and new password are required');
      
      // Test missing password
      await expect(resetPassword({ token: 'token', password: '' })).rejects.toThrow('Reset token and new password are required');
      
      expect(mockedApi.auth.resetPassword).not.toHaveBeenCalled();
    });

    test('should validate token format', async () => {
      // Arrange: Short invalid token
      const shortTokenData = { ...mockResetData, token: 'short' };

      // Act & Assert: Verify token format validation
      await expect(resetPassword(shortTokenData)).rejects.toThrow('Invalid reset token format provided');
      
      expect(mockedApi.auth.resetPassword).not.toHaveBeenCalled();
    });

    test('should validate password strength', async () => {
      // Arrange: Weak password data
      const weakPasswordData = { ...mockResetData, password: 'weak' };

      // Act & Assert: Verify password strength validation
      await expect(resetPassword(weakPasswordData)).rejects.toThrow('New password must be at least 12 characters long');
      
      expect(mockedApi.auth.resetPassword).not.toHaveBeenCalled();
    });

    test('should handle expired or invalid tokens', async () => {
      // Arrange: Setup invalid token error
      const invalidTokenError = new AxiosError('Invalid reset token');
      invalidTokenError.response = {
        status: 404,
        statusText: 'Not Found',
        data: { 
          message: 'Reset token is invalid or expired',
          code: 'INVALID_RESET_TOKEN'
        },
        headers: {},
        config: {} as any
      };
      invalidTokenError.isAxiosError = true;
      
      mockedApi.auth.resetPassword.mockRejectedValue(invalidTokenError);

      // Act & Assert: Verify invalid token error handling
      try {
        await resetPassword(mockResetData);
      } catch (error: any) {
        expect(error.status).toBe(404);
        expect(error.userMessage).toContain('Invalid or expired reset token');
      }
    });
  });

  /**
   * General Error Handling Tests
   * 
   * Tests common error handling scenarios across all authentication functions
   * including network errors, server failures, and unexpected errors.
   */
  describe('Error Handling', () => {
    test('should handle network timeout errors', async () => {
      // Arrange: Setup timeout error
      const timeoutError = new AxiosError('timeout of 30000ms exceeded');
      timeoutError.code = 'ECONNABORTED';
      timeoutError.isAxiosError = true;
      
      mockedApi.auth.login.mockRejectedValue(timeoutError);

      // Act & Assert: Verify timeout error handling
      try {
        await login(createMockLoginCredentials());
      } catch (error: any) {
        expect(error.code).toBe('ECONNABORTED');
        expect(error.userMessage).toContain('Network error occurred');
      }
    });

    test('should handle generic server errors', async () => {
      // Arrange: Setup generic server error
      const serverError = new AxiosError('Service Unavailable');
      serverError.response = {
        status: 503,
        statusText: 'Service Unavailable',
        data: { message: 'Service temporarily unavailable' },
        headers: {},
        config: {} as any
      };
      serverError.isAxiosError = true;
      
      mockedApi.auth.login.mockRejectedValue(serverError);

      // Act & Assert: Verify server error handling
      try {
        await login(createMockLoginCredentials());
      } catch (error: any) {
        expect(error.status).toBe(503);
        expect(error.userMessage).toContain('Service temporarily unavailable');
      }
    });

    test('should provide user-friendly messages for various HTTP status codes', async () => {
      const statusTestCases = [
        { status: 400, expectedMessage: 'Invalid request' },
        { status: 403, expectedMessage: 'Access denied' },
        { status: 404, expectedMessage: 'Service not found' },
        { status: 409, expectedMessage: 'Conflict detected' },
        { status: 500, expectedMessage: 'Server error occurred' },
        { status: 502, expectedMessage: 'Service temporarily unavailable' },
        { status: 504, expectedMessage: 'Service temporarily unavailable' }
      ];

      for (const testCase of statusTestCases) {
        const httpError = new AxiosError(`HTTP Error ${testCase.status}`);
        httpError.response = {
          status: testCase.status,
          statusText: `HTTP ${testCase.status}`,
          data: { message: `Error ${testCase.status}` },
          headers: {},
          config: {} as any
        };
        httpError.isAxiosError = true;
        
        mockedApi.auth.login.mockRejectedValue(httpError);

        try {
          await login(createMockLoginCredentials());
        } catch (error: any) {
          expect(error.status).toBe(testCase.status);
          expect(error.userMessage).toContain(testCase.expectedMessage);
        }
      }
    });
  });
});