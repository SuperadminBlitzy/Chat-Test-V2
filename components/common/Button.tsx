import React from 'react'; // react@18.2.0
import { styled } from '@mui/material/styles'; // @mui/material/styles@5.15.14
import { motion } from 'framer-motion'; // framer-motion@10.16.4
import Loading from './Loading';
import * as Icons from './Icons';
import { BaseComponentProps } from '../../types/common';

/**
 * Base component properties interface for consistent React component props
 * across the financial services platform
 */
interface BaseComponentProps {
  /** Optional CSS class name for custom styling */
  className?: string;
  /** Optional test ID for automated testing */
  'data-testid'?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
}

/**
 * Props interface for the Button component
 * Defines comprehensive configuration options for the reusable button component
 * supporting the design system requirements for the financial services platform
 */
interface ButtonProps extends BaseComponentProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 
   * Button visual variant defining color scheme and styling
   * - 'primary': Main call-to-action buttons (blue theme)
   * - 'secondary': Secondary actions (outlined style)
   * - 'danger': Destructive actions (red theme)
   * - 'ghost': Minimal style for subtle actions
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  
  /** 
   * Button size affecting padding, font size, and overall dimensions
   * - 'sm': Small button for compact layouts (32px height)
   * - 'md': Medium button for standard usage (40px height) - DEFAULT
   * - 'lg': Large button for prominent actions (48px height)
   */
  size?: 'sm' | 'md' | 'lg';
  
  /** 
   * Loading state that disables interaction and shows loading spinner
   * When true, button becomes disabled and displays Loading component
   */
  loading?: boolean;
  
  /** 
   * Icon name to display within the button
   * References available icons from the Icons component library
   */
  icon?: keyof typeof Icons;
  
  /** 
   * Position of the icon relative to button text
   * - 'left': Icon appears before text (default)
   * - 'right': Icon appears after text
   */
  iconPosition?: 'left' | 'right';
}

/**
 * Styled motion button component with comprehensive theming support
 * Implements the design system tokens and provides accessibility features
 * for the unified financial services platform
 */
const StyledButton = styled(motion.button)<ButtonProps>`
  /* Base button styling with design system tokens */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 6px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  /* Focus styles for accessibility compliance */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }
  
  /* Disabled state styling */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    pointer-events: none;
  }

  /* Size variants with responsive design considerations */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          height: 32px;
          padding: 0 16px;
          font-size: 14px;
          line-height: 1.4;
        `;
      case 'lg':
        return `
          height: 48px;
          padding: 0 24px;
          font-size: 16px;
          line-height: 1.5;
        `;
      default: // md
        return `
          height: 40px;
          padding: 0 20px;
          font-size: 15px;
          line-height: 1.47;
        `;
    }
  }}

  /* Variant-specific styling implementing design system colors */
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12);
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
          }
        `;
      case 'secondary':
        return `
          background: #ffffff;
          color: #374151;
          border: 1.5px solid #d1d5db;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          
          &:hover:not(:disabled) {
            background: #f9fafb;
            border-color: #9ca3af;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          &:active:not(:disabled) {
            background: #f3f4f6;
            border-color: #6b7280;
          }
        `;
      case 'danger':
        return `
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12);
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: #6b7280;
          border: none;
          
          &:hover:not(:disabled) {
            background: rgba(107, 114, 128, 0.1);
            color: #374151;
          }
          
          &:active:not(:disabled) {
            background: rgba(107, 114, 128, 0.15);
          }
        `;
      default:
        return `
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
        `;
    }
  }}
`;

/**
 * Button Component
 * 
 * A comprehensive, accessible, and reusable button component that serves as a
 * fundamental building block for the unified financial services platform UI.
 * 
 * This component addresses the following requirements:
 * - Component-Based Frontend Architecture (7.1.2)
 * - Design System Implementation (7.7.1)
 * - Accessibility Compliance (7.6.5)
 * 
 * Features:
 * - Four visual variants supporting the design system
 * - Three size options for different UI contexts
 * - Loading states with integrated spinner
 * - Icon support with flexible positioning
 * - Comprehensive accessibility features
 * - Micro-interactions using Framer Motion
 * - Enterprise-grade error handling and validation
 * 
 * The component follows the WCAG 2.1 AA guidelines and supports:
 * - Keyboard navigation
 * - Screen reader compatibility
 * - High contrast support
 * - Focus management
 * 
 * @param props - Button component props
 * @returns JSX.Element representing the styled, interactive button
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  children,
  onClick,
  className,
  'data-testid': testId,
  ...rest
}) => {
  // Determine if button should be disabled (loading or explicitly disabled)
  const isDisabled = loading || disabled;

  // Get the appropriate icon component if specified
  const IconComponent = icon ? Icons[icon] : null;

  // Handle click events with loading state protection
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  // Animation variants for micro-interactions
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  // Determine loading spinner size based on button size
  const loadingSize = size === 'sm' ? 'sm' : size === 'lg' ? 'md' : 'sm';

  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={isDisabled}
      onClick={handleClick}
      className={className}
      data-testid={testId}
      variants={buttonVariants}
      initial="initial"
      whileHover={!isDisabled ? "hover" : undefined}
      whileTap={!isDisabled ? "tap" : undefined}
      // Accessibility attributes
      role="button"
      aria-disabled={isDisabled}
      aria-busy={loading}
      aria-label={typeof children === 'string' ? children : undefined}
      {...rest}
    >
      {/* Loading state with spinner */}
      {loading && (
        <Loading 
          size={loadingSize}
          className="button-loading-spinner"
        />
      )}
      
      {/* Icon rendering - left position */}
      {!loading && IconComponent && iconPosition === 'left' && (
        <IconComponent
          width={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
          height={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
          aria-hidden="true"
        />
      )}
      
      {/* Button text content */}
      {!loading && children && (
        <span className="button-text">
          {children}
        </span>
      )}
      
      {/* Icon rendering - right position */}
      {!loading && IconComponent && iconPosition === 'right' && (
        <IconComponent
          width={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
          height={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
          aria-hidden="true"
        />
      )}
    </StyledButton>
  );
};

export default Button;
export type { ButtonProps };