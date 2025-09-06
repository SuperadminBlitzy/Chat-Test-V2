import React, { forwardRef } from 'react';
import styled, { css } from '@emotion/styled';

/**
 * Props interface for the Input component
 * Designed to support various input types, validation states, and accessibility features
 * for the financial services platform
 */
interface InputProps {
  /** Unique identifier for the input field */
  id?: string;
  /** Name attribute for form submission and identification */
  name?: string;
  /** Input type supporting common form field types */
  type?: 'text' | 'password' | 'email' | 'number';
  /** Current value of the input field */
  value?: string;
  /** Callback function triggered when input value changes */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Placeholder text displayed when input is empty */
  placeholder?: string;
  /** Whether the input field is disabled */
  disabled?: boolean;
  /** Whether the input field is in an error state */
  error?: boolean;
  /** Error message to display when input is in error state */
  errorMessage?: string;
  /** Name/identifier of the icon to display */
  iconName?: string;
  /** Position of the icon within the input field */
  iconPosition?: 'left' | 'right';
  /** Additional CSS classes for custom styling */
  className?: string;
  /** Accessibility label for screen readers */
  ariaLabel?: string;
  /** Callback function triggered when input loses focus */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /** Callback function triggered when input gains focus */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /** Whether the input field is required */
  required?: boolean;
  /** Auto-complete attribute for browser form filling */
  autoComplete?: string;
  /** Maximum length of input value */
  maxLength?: number;
  /** Minimum length of input value */
  minLength?: number;
  /** Pattern for input validation (regex) */
  pattern?: string;
}

/**
 * Styled container for the input field and its associated elements
 * Provides consistent spacing and layout for the financial services UI
 */
const InputContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 0;
`;

/**
 * Styled wrapper for the input field itself
 * Handles icon positioning and error states
 */
const InputWrapper = styled.div<{ hasIcon: boolean; iconPosition?: 'left' | 'right'; error?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  
  ${({ hasIcon, iconPosition }) =>
    hasIcon &&
    css`
      ${iconPosition === 'left' ? 'padding-left: 2.5rem;' : 'padding-right: 2.5rem;'}
    `}
`;

/**
 * Styled input field following financial services design system
 * Implements enterprise-grade styling with proper focus, error, and disabled states
 */
const StyledInput = styled.input<{ error?: boolean; hasIcon?: boolean; iconPosition?: 'left' | 'right' }>`
  width: 100%;
  height: 2.75rem;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.25rem;
  color: #1a202c;
  background-color: #ffffff;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Icon positioning adjustments */
  ${({ hasIcon, iconPosition }) =>
    hasIcon && iconPosition === 'left' &&
    css`
      padding-left: 2.5rem;
    `}
  
  ${({ hasIcon, iconPosition }) =>
    hasIcon && iconPosition === 'right' &&
    css`
      padding-right: 2.5rem;
    `}
  
  /* Focus state - essential for accessibility and user experience */
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background-color: #ffffff;
  }
  
  /* Error state styling for validation feedback */
  ${({ error }) =>
    error &&
    css`
      border-color: #ef4444;
      background-color: #fef2f2;
      
      &:focus {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      }
    `}
  
  /* Disabled state with reduced opacity and interaction */
  &:disabled {
    background-color: #f7fafc;
    border-color: #e2e8f0;
    color: #a0aec0;
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  /* Hover state for better user feedback */
  &:hover:not(:disabled) {
    border-color: #cbd5e0;
  }
  
  /* Placeholder styling for consistent appearance */
  &::placeholder {
    color: #a0aec0;
    font-weight: 400;
  }
  
  /* Remove number input spinners for cleaner appearance */
  &[type="number"]::-webkit-outer-spin-button,
  &[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

/**
 * Styled icon container for proper positioning within the input field
 */
const IconContainer = styled.div<{ position: 'left' | 'right'; error?: boolean }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ position }) => (position === 'left' ? 'left: 0.75rem;' : 'right: 0.75rem;')}
  pointer-events: none;
  z-index: 1;
  color: ${({ error }) => (error ? '#ef4444' : '#6b7280')};
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
`;

/**
 * Styled error message component for validation feedback
 * Follows accessibility guidelines for error messaging
 */
const ErrorMessage = styled.span`
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 400;
  color: #ef4444;
  line-height: 1rem;
  display: block;
`;

/**
 * Simple icon component for demonstration
 * In production, this would be replaced with a proper icon library
 */
const Icon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  // This is a simplified icon implementation
  // In a real application, you would use an icon library like Heroicons, Feather, or Lucide
  const iconMap: Record<string, string> = {
    user: '👤',
    email: '📧',
    lock: '🔒',
    phone: '📞',
    search: '🔍',
    dollar: '$',
    error: '⚠️',
    success: '✅',
  };

  return (
    <span className={className} role="img" aria-hidden="true">
      {iconMap[name] || '●'}
    </span>
  );
};

/**
 * Reusable Input component for forms throughout the financial services application
 * 
 * This component provides a consistent, accessible, and highly customizable input field
 * that supports various types, validation states, icons, and follows enterprise design standards.
 * 
 * Features:
 * - Multiple input types (text, password, email, number)
 * - Icon support with left/right positioning
 * - Error states with validation messaging
 * - Full accessibility support with ARIA attributes
 * - Consistent styling following financial services design system
 * - TypeScript support for type safety
 * - Enterprise-grade performance and maintainability
 * 
 * @param props - InputProps interface containing all component configuration
 * @returns Styled input component with validation and accessibility features
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      name,
      type = 'text',
      value,
      onChange,
      placeholder,
      disabled = false,
      error = false,
      errorMessage,
      iconName,
      iconPosition = 'left',
      className,
      ariaLabel,
      onBlur,
      onFocus,
      required = false,
      autoComplete,
      maxLength,
      minLength,
      pattern,
      ...restProps
    },
    ref
  ) => {
    // Generate unique error message ID for accessibility
    const errorId = id ? `${id}-error` : undefined;
    const hasIcon = Boolean(iconName);

    return (
      <InputContainer className={className}>
        <InputWrapper hasIcon={hasIcon} iconPosition={iconPosition} error={error}>
          {/* Render icon on the left side if specified */}
          {hasIcon && iconPosition === 'left' && (
            <IconContainer position="left" error={error}>
              <Icon name={iconName!} />
            </IconContainer>
          )}
          
          <StyledInput
            ref={ref}
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            error={error}
            hasIcon={hasIcon}
            iconPosition={iconPosition}
            aria-label={ariaLabel}
            aria-invalid={error}
            aria-describedby={error && errorMessage && errorId ? errorId : undefined}
            {...restProps}
          />
          
          {/* Render icon on the right side if specified */}
          {hasIcon && iconPosition === 'right' && (
            <IconContainer position="right" error={error}>
              <Icon name={iconName!} />
            </IconContainer>
          )}
        </InputWrapper>
        
        {/* Display error message when in error state */}
        {error && errorMessage && (
          <ErrorMessage id={errorId} role="alert" aria-live="polite">
            {errorMessage}
          </ErrorMessage>
        )}
      </InputContainer>
    );
  }
);

// Set display name for better debugging and React DevTools experience
Input.displayName = 'Input';

// Default export for the Input component
export default Input;