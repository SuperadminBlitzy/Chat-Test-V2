import { renderHook, act } from '@testing-library/react'; // @testing-library/react 14.1+
import { z } from 'zod'; // zod 3.22+
import { useForm } from '../../hooks/useForm';

// Test schema for validating form data during tests
// Simulates a typical customer onboarding form with validation requirements
const testSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address')
});

// Initial values for test forms
// Represents empty form state as would be encountered in real applications
const initialValues = { name: '', email: '' };

// Type definition for test form values
type TestFormValues = z.infer<typeof testSchema>;

describe('useForm', () => {
  // Mock function to track onSubmit calls and validate submission behavior
  let mockOnSubmit: jest.Mock<void | Promise<void>, [TestFormValues]>;

  beforeEach(() => {
    // Reset mock function before each test to ensure clean state
    mockOnSubmit = jest.fn();
  });

  afterEach(() => {
    // Clear all mocks after each test to prevent test interference
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with correct initial values', () => {
      // Test that the hook properly initializes with provided initial values
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: mockOnSubmit
        })
      );

      // Verify that form values match the provided initial values
      expect(result.current.values).toEqual(initialValues);
      // Verify that no validation errors exist initially
      expect(result.current.errors).toEqual({});
      // Verify that no fields are marked as touched initially
      expect(result.current.touched).toEqual({});
      // Verify that form is not in submitting state initially
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should initialize with complex initial values', () => {
      // Test initialization with non-empty initial values
      const complexInitialValues = { name: 'John Doe', email: 'john@example.com' };
      
      const { result } = renderHook(() =>
        useForm({
          initialValues: complexInitialValues,
          validationSchema: testSchema,
          onSubmit: mockOnSubmit
        })
      );

      expect(result.current.values).toEqual(complexInitialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('Form Input Handling', () => {
    it('should update form values when handleChange is called', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: mockOnSubmit
        })
      );

      // Simulate input change event for name field
      const nameChangeEvent = {
        target: { name: 'name', value: 'John Doe' }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(nameChangeEvent);
      });

      // Verify that the name field value was updated correctly
      expect(result.current.values.name).toBe('John Doe');
      // Verify that other field values remain unchanged
      expect(result.current.values.email).toBe('');
    });

    it('should update multiple form fields independently', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: mockOnSubmit
        })
      );

      // Update name field
      const nameChangeEvent = {
        target: { name: 'name', value: 'Jane Smith' }
      } as React.ChangeEvent<HTMLInputElement>;

      // Update email field
      const emailChangeEvent = {
        target: { name: 'email', value: 'jane@example.com' }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(nameChangeEvent);
        result.current.handleChange(emailChangeEvent);
      });

      // Verify both fields were updated correctly
      expect(result.current.values.name).toBe('Jane Smith');
      expect(result.current.values.email).toBe('jane@example.com');
    });

    it('should handle textarea input changes', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: mockOnSubmit
        })
      );

      // Simulate textarea change event
      const textareaChangeEvent = {
        target: { name: 'name', value: 'Multi-line\ntext content' }
      } as React.ChangeEvent<HTMLTextAreaElement>;

      act(() => {
        result.current.handleChange(textareaChangeEvent);
      });

      expect(result.current.values.name).toBe('Multi-line\ntext content');
    });
  });

  describe('Field Touch Handling', () => {
    it('should mark field as touched when handleBlur is called', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: mockOnSubmit
        })
      );

      // Simulate blur event on name field
      const nameBlurEvent = {
        target: { name: 'name' }
      } as React.FocusEvent<HTMLInputElement>;

      act(() => {
        result.current.handleBlur(nameBlurEvent);
      });

      // Verify that the name field is marked as touched
      expect(result.current.touched.name).toBe(true);
      // Verify that other fields remain untouched
      expect(result.current.touched.email).toBeUndefined();
    });

    it('should mark multiple fields as touched independently', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: mockOnSubmit
        })
      );

      // Simulate blur events on both fields
      const nameBlurEvent = {
        target: { name: 'name' }
      } as React.FocusEvent<HTMLInputElement>;

      const emailBlurEvent = {
        target: { name: 'email' }
      } as React.FocusEvent<HTMLTextAreaElement>;

      act(() => {
        result.current.handleBlur(nameBlurEvent);
        result.current.handleBlur(emailBlurEvent);
      });

      // Verify both fields are marked as touched
      expect(result.current.touched.name).toBe(true);
      expect(result.current.touched.email).toBe(true);
    });

    it('should preserve touched state across multiple blur events', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: mockOnSubmit
        })
      );

      const nameBlurEvent = {
        target: { name: 'name' }
      } as React.FocusEvent<HTMLInputElement>;

      // Blur the same field multiple times
      act(() => {
        result.current.handleBlur(nameBlurEvent);
        result.current.handleBlur(nameBlurEvent);
      });

      // Verify touched state remains true
      expect(result.current.touched.name).toBe(true);
    });
  });

  describe('Form Validation and Submission', () => {
    it('should populate errors and not call onSubmit when form data is invalid', async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: mockOnSubmit
        })
      );

      // Create form submission event
      const submitEvent = {
        preventDefault: jest.fn()
      } as unknown as React.FormEvent<HTMLFormElement>;

      // Submit form with empty values (invalid according to schema)
      await act(async () => {
        await result.current.handleSubmit(submitEvent);
      });

      // Verify preventDefault was called to prevent default form submission
      expect(submitEvent.preventDefault).toHaveBeenCalled();
      
      // Verify validation errors are populated
      expect(result.current.errors.name).toBe('Name is required');
      expect(result.current.errors.email).toBe('Invalid email address');
      
      // Verify onSubmit callback was not called due to validation failure
      expect(mockOnSubmit).not.toHaveBeenCalled();
      
      // Verify form is not in submitting state after validation failure
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should call onSubmit and clear errors when form data is valid', async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: mockOnSubmit
        })
      );

      // Set valid form values
      const nameChangeEvent = {
        target: { name: 'name', value: 'John Doe' }
      } as React.ChangeEvent<HTMLInputElement>;

      const emailChangeEvent = {
        target: { name: 'email', value: 'john@example.com' }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(nameChangeEvent);
        result.current.handleChange(emailChangeEvent);
      });

      // Create form submission event
      const submitEvent = {
        preventDefault: jest.fn()
      } as unknown as React.FormEvent<HTMLFormElement>;

      // Submit form with valid values
      await act(async () => {
        await result.current.handleSubmit(submitEvent);
      });

      // Verify preventDefault was called
      expect(submitEvent.preventDefault).toHaveBeenCalled();
      
      // Verify no validation errors exist
      expect(result.current.errors).toEqual({});
      
      // Verify onSubmit was called with correct validated values
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com'
      });
      
      // Verify onSubmit was called exactly once
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      
      // Verify form is not in submitting state after successful submission
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should clear previous errors when submitting with valid data', async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: mockOnSubmit
        })
      );

      const submitEvent = {
        preventDefault: jest.fn()
      } as unknown as React.FormEvent<HTMLFormElement>;

      // First submission with invalid data to generate errors
      await act(async () => {
        await result.current.handleSubmit(submitEvent);
      });

      // Verify errors exist
      expect(result.current.errors.name).toBe('Name is required');
      expect(result.current.errors.email).toBe('Invalid email address');

      // Update form with valid values
      const nameChangeEvent = {
        target: { name: 'name', value: 'John Doe' }
      } as React.ChangeEvent<HTMLInputElement>;

      const emailChangeEvent = {
        target: { name: 'email', value: 'john@example.com' }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(nameChangeEvent);
        result.current.handleChange(emailChangeEvent);
      });

      // Second submission with valid data
      await act(async () => {
        await result.current.handleSubmit(submitEvent);
      });

      // Verify errors are cleared
      expect(result.current.errors).toEqual({});
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com'
      });
    });
  });

  describe('Submission State Management', () => {
    it('should correctly manage isSubmitting state during submission process', async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: mockOnSubmit
        })
      );

      // Set valid form values
      const nameChangeEvent = {
        target: { name: 'name', value: 'John Doe' }
      } as React.ChangeEvent<HTMLInputElement>;

      const emailChangeEvent = {
        target: { name: 'email', value: 'john@example.com' }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(nameChangeEvent);
        result.current.handleChange(emailChangeEvent);
      });

      // Verify initial submitting state
      expect(result.current.isSubmitting).toBe(false);

      const submitEvent = {
        preventDefault: jest.fn()
      } as unknown as React.FormEvent<HTMLFormElement>;

      // Submit form and verify state changes
      await act(async () => {
        const submitPromise = result.current.handleSubmit(submitEvent);
        
        // During submission, isSubmitting should be true
        expect(result.current.isSubmitting).toBe(true);
        
        await submitPromise;
      });

      // After submission completion, isSubmitting should be false
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle asynchronous onSubmit functions and maintain isSubmitting state', async () => {
      // Create async mock function that returns a promise
      const asyncOnSubmit = jest.fn().mockImplementation(() => 
        new Promise<void>((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: asyncOnSubmit
        })
      );

      // Set valid form values
      const nameChangeEvent = {
        target: { name: 'name', value: 'Jane Doe' }
      } as React.ChangeEvent<HTMLInputElement>;

      const emailChangeEvent = {
        target: { name: 'email', value: 'jane@example.com' }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(nameChangeEvent);
        result.current.handleChange(emailChangeEvent);
      });

      const submitEvent = {
        preventDefault: jest.fn()
      } as unknown as React.FormEvent<HTMLFormElement>;

      // Submit form with async onSubmit
      await act(async () => {
        const submitPromise = result.current.handleSubmit(submitEvent);
        
        // Verify isSubmitting is true during async operation
        expect(result.current.isSubmitting).toBe(true);
        
        await submitPromise;
      });

      // Verify async onSubmit was called
      expect(asyncOnSubmit).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'jane@example.com'
      });
      
      // Verify isSubmitting is false after async completion
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should reset isSubmitting state when validation fails', async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: mockOnSubmit
        })
      );

      const submitEvent = {
        preventDefault: jest.fn()
      } as unknown as React.FormEvent<HTMLFormElement>;

      // Submit form with invalid data
      await act(async () => {
        await result.current.handleSubmit(submitEvent);
      });

      // Verify isSubmitting is false after validation failure
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.errors.name).toBe('Name is required');
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle onSubmit function errors gracefully', async () => {
      // Create mock function that throws an error
      const errorOnSubmit = jest.fn().mockImplementation(() => {
        throw new Error('Submission failed');
      });

      // Spy on console.error to verify error logging
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: errorOnSubmit
        })
      );

      // Set valid form values
      const nameChangeEvent = {
        target: { name: 'name', value: 'John Doe' }
      } as React.ChangeEvent<HTMLInputElement>;

      const emailChangeEvent = {
        target: { name: 'email', value: 'john@example.com' }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(nameChangeEvent);
        result.current.handleChange(emailChangeEvent);
      });

      const submitEvent = {
        preventDefault: jest.fn()
      } as unknown as React.FormEvent<HTMLFormElement>;

      // Submit form and handle error
      await act(async () => {
        await result.current.handleSubmit(submitEvent);
      });

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith('Form submission error:', expect.any(Error));
      
      // Verify form is not in submitting state after error
      expect(result.current.isSubmitting).toBe(false);
      
      // Verify error onSubmit was called
      expect(errorOnSubmit).toHaveBeenCalled();

      // Restore console.error
      consoleSpy.mockRestore();
    });

    it('should handle async onSubmit rejection properly', async () => {
      // Create async mock that rejects
      const rejectingOnSubmit = jest.fn().mockRejectedValue(new Error('Async submission failed'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: rejectingOnSubmit
        })
      );

      // Set valid form values
      const nameChangeEvent = {
        target: { name: 'name', value: 'John Doe' }
      } as React.ChangeEvent<HTMLInputElement>;

      const emailChangeEvent = {
        target: { name: 'email', value: 'john@example.com' }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(nameChangeEvent);
        result.current.handleChange(emailChangeEvent);
      });

      const submitEvent = {
        preventDefault: jest.fn()
      } as unknown as React.FormEvent<HTMLFormElement>;

      // Submit form and handle async error
      await act(async () => {
        await result.current.handleSubmit(submitEvent);
      });

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith('Form submission error:', expect.any(Error));
      
      // Verify form is not in submitting state after error
      expect(result.current.isSubmitting).toBe(false);
      
      // Verify rejecting onSubmit was called
      expect(rejectingOnSubmit).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle multiple validation errors correctly', async () => {
      // Create schema with multiple validation rules
      const complexSchema = z.object({
        name: z.string()
          .min(2, 'Name must be at least 2 characters')
          .max(50, 'Name must be less than 50 characters'),
        email: z.string()
          .email('Invalid email address')
          .min(5, 'Email must be at least 5 characters')
      });

      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'A', email: 'bad' }, // Invalid values
          validationSchema: complexSchema,
          onSubmit: mockOnSubmit
        })
      );

      const submitEvent = {
        preventDefault: jest.fn()
      } as unknown as React.FormEvent<HTMLFormElement>;

      // Submit form with invalid data
      await act(async () => {
        await result.current.handleSubmit(submitEvent);
      });

      // Verify multiple validation errors are handled
      expect(result.current.errors.name).toBe('Name must be at least 2 characters');
      expect(result.current.errors.email).toBe('Invalid email address');
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete form interaction workflow', async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: mockOnSubmit
        })
      );

      // Step 1: User focuses and types in name field
      const nameChangeEvent = {
        target: { name: 'name', value: 'John Doe' }
      } as React.ChangeEvent<HTMLInputElement>;

      const nameBlurEvent = {
        target: { name: 'name' }
      } as React.FocusEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(nameChangeEvent);
        result.current.handleBlur(nameBlurEvent);
      });

      // Verify name field state
      expect(result.current.values.name).toBe('John Doe');
      expect(result.current.touched.name).toBe(true);

      // Step 2: User focuses and types in email field
      const emailChangeEvent = {
        target: { name: 'email', value: 'john@example.com' }
      } as React.ChangeEvent<HTMLInputElement>;

      const emailBlurEvent = {
        target: { name: 'email' }
      } as React.FocusEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(emailChangeEvent);
        result.current.handleBlur(emailBlurEvent);
      });

      // Verify email field state
      expect(result.current.values.email).toBe('john@example.com');
      expect(result.current.touched.email).toBe(true);

      // Step 3: User submits form
      const submitEvent = {
        preventDefault: jest.fn()
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.handleSubmit(submitEvent);
      });

      // Verify successful submission
      expect(result.current.errors).toEqual({});
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com'
      });
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should maintain form state consistency across re-renders', () => {
      const { result, rerender } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: mockOnSubmit
        })
      );

      // Make changes to form state
      const nameChangeEvent = {
        target: { name: 'name', value: 'Persistent Value' }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(nameChangeEvent);
      });

      const stateBeforeRerender = {
        values: result.current.values,
        errors: result.current.errors,
        touched: result.current.touched,
        isSubmitting: result.current.isSubmitting
      };

      // Force re-render
      rerender();

      // Verify state persistence across re-renders
      expect(result.current.values).toEqual(stateBeforeRerender.values);
      expect(result.current.errors).toEqual(stateBeforeRerender.errors);
      expect(result.current.touched).toEqual(stateBeforeRerender.touched);
      expect(result.current.isSubmitting).toEqual(stateBeforeRerender.isSubmitting);
    });
  });

  describe('Performance and Memory Management', () => {
    it('should maintain stable function references across renders', () => {
      const { result, rerender } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: mockOnSubmit
        })
      );

      const handlersBeforeRerender = {
        handleChange: result.current.handleChange,
        handleBlur: result.current.handleBlur,
        handleSubmit: result.current.handleSubmit
      };

      // Force re-render
      rerender();

      // Verify handler functions maintain stable references (due to useCallback)
      expect(result.current.handleChange).toBe(handlersBeforeRerender.handleChange);
      expect(result.current.handleBlur).toBe(handlersBeforeRerender.handleBlur);
      expect(result.current.handleSubmit).toBe(handlersBeforeRerender.handleSubmit);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty field names gracefully', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: mockOnSubmit
        })
      );

      // Simulate event with empty name
      const emptyNameEvent = {
        target: { name: '', value: 'some value' }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(emptyNameEvent);
      });

      // Verify form state remains unchanged
      expect(result.current.values).toEqual(initialValues);
    });

    it('should handle undefined field values gracefully', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          validationSchema: testSchema,
          onSubmit: mockOnSubmit
        })
      );

      // Simulate event with undefined value
      const undefinedValueEvent = {
        target: { name: 'name', value: undefined }
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(undefinedValueEvent);
      });

      // Verify form handles undefined values
      expect(result.current.values.name).toBeUndefined();
    });

    it('should prevent form submission when already submitting', async () => {
      // Create slow async onSubmit to test concurrent submission prevention
      const slowOnSubmit = jest.fn().mockImplementation(() => 
        new Promise<void>((resolve) => setTimeout(resolve, 200))
      );

      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'John', email: 'john@example.com' },
          validationSchema: testSchema,
          onSubmit: slowOnSubmit
        })
      );

      const submitEvent = {
        preventDefault: jest.fn()
      } as unknown as React.FormEvent<HTMLFormElement>;

      // Start first submission
      const firstSubmission = act(async () => {
        await result.current.handleSubmit(submitEvent);
      });

      // Verify form is in submitting state
      expect(result.current.isSubmitting).toBe(true);

      // Attempt second submission while first is in progress
      const secondSubmission = act(async () => {
        await result.current.handleSubmit(submitEvent);
      });

      // Wait for both submissions to complete
      await Promise.all([firstSubmission, secondSubmission]);

      // Verify onSubmit was called only once
      expect(slowOnSubmit).toHaveBeenCalledTimes(1);
      expect(result.current.isSubmitting).toBe(false);
    });
  });
});