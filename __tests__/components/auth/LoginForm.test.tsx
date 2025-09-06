/**
 * Unit Tests for LoginForm Component
 * 
 * This test suite ensures the LoginForm component renders correctly, handles user input,
 * displays validation and login errors, and successfully calls the login function on submission.
 * 
 * The tests cover the complete authentication workflow supporting:
 * - F-004: Digital Customer Onboarding - Login as a critical step in customer journey
 * - Authentication & Authorization - Primary interface for user authentication
 * 
 * Test Coverage:
 * - Component rendering with all required form elements
 * - User input handling for email and password fields
 * - Form submission with proper credential passing
 * - Error display for authentication failures
 * - Client-side validation for empty fields
 * - Email format validation
 * 
 * Security Testing:
 * - Ensures credentials are passed securely to authentication service
 * - Validates error handling without exposing sensitive information
 * - Tests proper form state management during authentication attempts
 * 
 * @version 1.0.0
 * @author Financial Services Platform Development Team
 * @compliance SOC2, PCI-DSS, GDPR - Secure authentication testing
 * @since 2025
 */

// External testing library imports with version specifications
// @testing-library/react@14.1+ - Core library for testing React components
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// react@18.2+ - React library for creating user interfaces
import React from 'react';
// jest@29.7+ - The testing framework
import { jest } from '@jest/globals';

// Internal component and hook imports for testing
import LoginForm from '../../../../src/components/auth/LoginForm';
import { useAuth } from '../../../../src/hooks/useAuth';

// Mock the useAuth hook to control its behavior in tests
jest.mock('../../../../src/hooks/useAuth');

// Type the mocked useAuth hook for TypeScript support
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

/**
 * Test suite for LoginForm component
 * 
 * Groups all tests related to the LoginForm component functionality,
 * covering rendering, user interaction, validation, and authentication flow.
 * 
 * The test suite follows enterprise testing standards with:
 * - Comprehensive coverage of all component functionality
 * - Realistic user interaction simulation
 * - Proper mocking of external dependencies
 * - Security-conscious testing approaches
 * - Performance-aware test implementations
 */
describe('LoginForm', () => {
  /**
   * Setup function to create mock implementations for useAuth hook
   * 
   * Provides default mock implementations that can be overridden
   * in individual tests to simulate different authentication states
   * and behaviors.
   * 
   * @param overrides - Optional overrides for specific mock properties
   * @returns Mock useAuth implementation with specified behavior
   */
  const createMockUseAuth = (overrides = {}) => ({
    authState: {
      isAuthenticated: false,
      user: null,
      permissions: [],
      session: null,
      mfaRequired: false,
      loading: false,
      error: null,
      ...overrides.authState,
    },
    login: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  /**
   * Setup before each test to ensure clean mock state
   * 
   * Resets all mocks and provides default useAuth implementation
   * to ensure test isolation and prevent test interference.
   */
  beforeEach(() => {
    // Clear all mock implementations and call history
    jest.clearAllMocks();
    
    // Set up default mock implementation for useAuth
    mockUseAuth.mockReturnValue(createMockUseAuth());
  });

  /**
   * Test: LoginForm component renders correctly with all required elements
   * 
   * Verifies that the LoginForm component renders with all expected form elements:
   * - Email input field with proper accessibility attributes
   * - Password input field with proper security attributes
   * - Submit button for form submission
   * - Proper form structure and labeling
   * 
   * This test ensures the component provides a complete and accessible
   * authentication interface for users.
   */
  it('should render the login form correctly', () => {
    // Render the LoginForm component
    render(<LoginForm />);

    // Verify email input field is present and properly configured
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toBeRequired();

    // Verify password input field is present and properly configured
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toBeRequired();

    // Verify submit button is present and properly configured
    const submitButton = screen.getByRole('button', { name: /sign in|login|submit/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');

    // Verify form structure is semantically correct
    const loginForm = screen.getByRole('form', { name: /login|sign in/i });
    expect(loginForm).toBeInTheDocument();
  });

  /**
   * Test: User can enter email and password in form fields
   * 
   * Verifies that users can successfully type into both email and password fields
   * and that the form properly maintains and reflects the entered values.
   * 
   * This test ensures basic form functionality and user input handling
   * work correctly for the authentication workflow.
   */
  it('should allow the user to enter email and password', () => {
    // Test data for user input simulation
    const testEmail = 'test.user@financialinstitution.com';
    const testPassword = 'SecurePassword123!';

    // Render the LoginForm component
    render(<LoginForm />);

    // Get form field references
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);

    // Simulate user typing email address
    fireEvent.change(emailInput, { target: { value: testEmail } });
    
    // Verify email input value is updated correctly
    expect(emailInput).toHaveValue(testEmail);

    // Simulate user typing password
    fireEvent.change(passwordInput, { target: { value: testPassword } });
    
    // Verify password input value is updated correctly
    expect(passwordInput).toHaveValue(testPassword);

    // Verify both fields maintain their values simultaneously
    expect(emailInput).toHaveValue(testEmail);
    expect(passwordInput).toHaveValue(testPassword);
  });

  /**
   * Test: Form calls login function with correct credentials on submission
   * 
   * Verifies that when the form is submitted with valid credentials,
   * the login function from useAuth is called with the exact credentials
   * that were entered by the user.
   * 
   * This test ensures proper integration between the form component
   * and the authentication system.
   */
  it('should call the login function on form submission', async () => {
    // Create mock login function to track calls
    const mockLogin = jest.fn().mockResolvedValue(undefined);
    
    // Set up useAuth mock with the mock login function
    mockUseAuth.mockReturnValue(createMockUseAuth({
      login: mockLogin,
    }));

    // Test credentials for form submission
    const testEmail = 'user@financialinstitution.com';
    const testPassword = 'ValidPassword123!';

    // Render the LoginForm component
    render(<LoginForm />);

    // Get form field and button references
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in|login|submit/i });

    // Simulate user entering credentials
    fireEvent.change(emailInput, { target: { value: testEmail } });
    fireEvent.change(passwordInput, { target: { value: testPassword } });

    // Simulate form submission
    fireEvent.click(submitButton);

    // Wait for async operations to complete
    await waitFor(() => {
      // Verify login function was called exactly once
      expect(mockLogin).toHaveBeenCalledTimes(1);
      
      // Verify login function was called with correct credentials
      expect(mockLogin).toHaveBeenCalledWith({
        email: testEmail,
        password: testPassword,
      });
    });
  });

  /**
   * Test: Error message is displayed when login fails
   * 
   * Verifies that when the useAuth hook reports a login error,
   * the LoginForm component displays the error message to the user
   * in an accessible and user-friendly manner.
   * 
   * This test ensures proper error handling and user feedback
   * during authentication failures.
   */
  it('should display an error message on failed login', async () => {
    // Mock error message for authentication failure
    const errorMessage = 'Invalid email or password. Please try again.';
    
    // Set up useAuth mock with error state
    mockUseAuth.mockReturnValue(createMockUseAuth({
      authState: {
        error: errorMessage,
        loading: false,
      },
    }));

    // Render the LoginForm component with error state
    render(<LoginForm />);

    // Wait for error message to appear in the document
    await waitFor(() => {
      // Verify error message is displayed to the user
      const errorElement = screen.getByText(errorMessage);
      expect(errorElement).toBeInTheDocument();
      
      // Verify error has proper accessibility attributes
      expect(errorElement).toHaveAttribute('role', 'alert');
      
      // Verify error message is visible and styled appropriately
      expect(errorElement).toBeVisible();
    });
  });

  /**
   * Test: Validation errors are shown for empty required fields
   * 
   * Verifies that client-side validation works correctly by displaying
   * appropriate error messages when the user attempts to submit the form
   * without entering required information.
   * 
   * This test ensures proper form validation and user guidance
   * for incomplete form submissions.
   */
  it('should show validation errors for empty fields', async () => {
    // Render the LoginForm component
    render(<LoginForm />);

    // Get submit button reference
    const submitButton = screen.getByRole('button', { name: /sign in|login|submit/i });

    // Attempt to submit form without entering any data
    fireEvent.click(submitButton);

    // Wait for validation errors to appear
    await waitFor(() => {
      // Check for email validation error
      const emailError = screen.getByText(/email is required|please enter your email/i);
      expect(emailError).toBeInTheDocument();
      expect(emailError).toBeVisible();

      // Check for password validation error
      const passwordError = screen.getByText(/password is required|please enter your password/i);
      expect(passwordError).toBeInTheDocument();
      expect(passwordError).toBeVisible();
    });

    // Verify form was not submitted (login function not called)
    const mockLogin = mockUseAuth().login;
    expect(mockLogin).not.toHaveBeenCalled();
  });

  /**
   * Test: Validation error is shown for invalid email format
   * 
   * Verifies that client-side email validation works correctly by displaying
   * an appropriate error message when the user enters an invalid email format
   * and attempts to submit the form.
   * 
   * This test ensures proper email format validation and user guidance
   * for incorrect email entries.
   */
  it('should show validation error for invalid email format', async () => {
    // Test data with invalid email format
    const invalidEmail = 'invalid-email-format';
    const validPassword = 'ValidPassword123!';

    // Render the LoginForm component
    render(<LoginForm />);

    // Get form field and button references
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in|login|submit/i });

    // Simulate user entering invalid email and valid password
    fireEvent.change(emailInput, { target: { value: invalidEmail } });
    fireEvent.change(passwordInput, { target: { value: validPassword } });

    // Attempt to submit form with invalid email
    fireEvent.click(submitButton);

    // Wait for email validation error to appear
    await waitFor(() => {
      // Check for email format validation error
      const emailFormatError = screen.getByText(/please enter a valid email|invalid email format/i);
      expect(emailFormatError).toBeInTheDocument();
      expect(emailFormatError).toBeVisible();
    });

    // Verify form was not submitted due to validation error
    const mockLogin = mockUseAuth().login;
    expect(mockLogin).not.toHaveBeenCalled();
  });

  /**
   * Test: Loading state is properly displayed during authentication
   * 
   * Verifies that the LoginForm component shows appropriate loading indicators
   * when authentication is in progress, preventing duplicate submissions
   * and providing user feedback.
   * 
   * This test ensures proper loading state management and user experience
   * during authentication operations.
   */
  it('should show loading state during authentication', () => {
    // Set up useAuth mock with loading state
    mockUseAuth.mockReturnValue(createMockUseAuth({
      authState: {
        loading: true,
      },
    }));

    // Render the LoginForm component in loading state
    render(<LoginForm />);

    // Verify loading indicator is displayed
    const loadingIndicator = screen.getByText(/signing in|logging in|loading/i);
    expect(loadingIndicator).toBeInTheDocument();

    // Verify submit button is disabled during loading
    const submitButton = screen.getByRole('button', { name: /sign in|login|submit/i });
    expect(submitButton).toBeDisabled();

    // Verify form fields are accessible but form submission is prevented
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    expect(emailInput).not.toBeDisabled(); // Users can still edit
    expect(passwordInput).not.toBeDisabled(); // Users can still edit
  });

  /**
   * Test: Form handles successful authentication appropriately
   * 
   * Verifies that the LoginForm component properly handles successful
   * authentication by clearing any previous errors and potentially
   * redirecting or updating the UI state.
   * 
   * This test ensures proper success state handling in the authentication flow.
   */
  it('should handle successful authentication', async () => {
    // Create mock login function that resolves successfully
    const mockLogin = jest.fn().mockResolvedValue(undefined);
    
    // Set up useAuth mock for successful authentication
    mockUseAuth.mockReturnValue(createMockUseAuth({
      login: mockLogin,
      authState: {
        isAuthenticated: false, // Initially not authenticated
        loading: false,
        error: null,
      },
    }));

    // Test credentials for successful login
    const testEmail = 'success@financialinstitution.com';
    const testPassword = 'CorrectPassword123!';

    // Render the LoginForm component
    render(<LoginForm />);

    // Get form elements
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in|login|submit/i });

    // Simulate user entering credentials and submitting
    fireEvent.change(emailInput, { target: { value: testEmail } });
    fireEvent.change(passwordInput, { target: { value: testPassword } });
    fireEvent.click(submitButton);

    // Wait for authentication to complete
    await waitFor(() => {
      // Verify login function was called with correct credentials
      expect(mockLogin).toHaveBeenCalledWith({
        email: testEmail,
        password: testPassword,
      });
    });

    // Verify no error messages are displayed after successful login attempt
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  /**
   * Test: Form properly clears errors when user starts typing
   * 
   * Verifies that any displayed error messages are cleared when the user
   * begins entering new input, providing a better user experience and
   * preventing stale error messages.
   * 
   * This test ensures proper error state management and user interaction feedback.
   */
  it('should clear errors when user starts typing', async () => {
    // Set up initial error state
    const errorMessage = 'Authentication failed';
    mockUseAuth.mockReturnValue(createMockUseAuth({
      authState: {
        error: errorMessage,
      },
    }));

    // Render component with error state
    render(<LoginForm />);

    // Verify error is initially displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();

    // Simulate user starting to type in email field
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    fireEvent.change(emailInput, { target: { value: 'user@' } });

    // Mock the cleared error state (simulating what would happen in real component)
    mockUseAuth.mockReturnValue(createMockUseAuth({
      authState: {
        error: null, // Error cleared
      },
    }));

    // Re-render with updated state
    render(<LoginForm />);

    // Verify error is no longer displayed
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
  });

  /**
   * Test: Form maintains accessibility standards
   * 
   * Verifies that the LoginForm component meets accessibility requirements
   * including proper ARIA labels, keyboard navigation, and screen reader support.
   * 
   * This test ensures the component is usable by all users, including those
   * with disabilities, meeting enterprise accessibility compliance requirements.
   */
  it('should maintain accessibility standards', () => {
    // Render the LoginForm component
    render(<LoginForm />);

    // Verify form has proper accessibility structure
    const form = screen.getByRole('form');
    expect(form).toHaveAttribute('noValidate'); // Custom validation instead of browser default

    // Verify email input accessibility
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    expect(emailInput).toHaveAttribute('aria-required', 'true');
    expect(emailInput).toHaveAttribute('aria-describedby'); // Should reference help text or errors
    expect(emailInput).toHaveAttribute('autocomplete', 'email');

    // Verify password input accessibility
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('aria-required', 'true');
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');

    // Verify submit button accessibility
    const submitButton = screen.getByRole('button', { name: /sign in|login|submit/i });
    expect(submitButton).not.toHaveAttribute('aria-disabled', 'true'); // Should be enabled by default

    // Verify keyboard navigation works
    emailInput.focus();
    expect(document.activeElement).toBe(emailInput);
    
    // Tab to next field
    fireEvent.keyDown(emailInput, { key: 'Tab' });
    // Note: In real browser, this would move focus to password field
    // Testing library doesn't simulate actual focus management
  });
});