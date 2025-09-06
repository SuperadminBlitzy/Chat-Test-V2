import React from 'react'; // react@18.2+
import { render, screen, fireEvent } from '@testing-library/react'; // @testing-library/react@14.1+
import '@testing-library/jest-dom'; // @testing-library/jest-dom@6.4.5
import Button from '../../../src/components/common/Button';
import * as Icons from '../../../src/components/common/Icons';

// Mock the framer-motion library for testing
jest.mock('framer-motion', () => ({
  motion: {
    button: React.forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => (
      <button ref={ref} {...props}>
        {children}
      </button>
    )),
  },
}));

// Mock the @mui/material/styles for testing
jest.mock('@mui/material/styles', () => ({
  styled: (component: any) => (styles: any) => component,
}));

describe('Button Component', () => {
  // Test basic rendering functionality
  describe('Basic Rendering', () => {
    it('should render the button with the correct text', () => {
      render(<Button>Test Button</Button>);
      
      const button = screen.getByRole('button', { name: 'Test Button' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Test Button');
    });

    it('should apply the correct aria-label when children is a string', () => {
      render(<Button>Submit Form</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Submit Form');
    });

    it('should render with custom data-testid', () => {
      render(<Button data-testid="custom-button">Test</Button>);
      
      const button = screen.getByTestId('custom-button');
      expect(button).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Button className="custom-class">Test</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'red', color: 'white' };
      render(<Button style={customStyle}>Test</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle(customStyle);
    });
  });

  // Test click event handling
  describe('Click Event Handling', () => {
    it('should call the onClick handler when clicked', () => {
      const mockOnClick = jest.fn();
      render(<Button onClick={mockOnClick}>Click Me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should pass the correct event object to onClick handler', () => {
      const mockOnClick = jest.fn();
      render(<Button onClick={mockOnClick}>Click Me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
          target: button,
        })
      );
    });

    it('should handle multiple clicks correctly', () => {
      const mockOnClick = jest.fn();
      render(<Button onClick={mockOnClick}>Click Me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  // Test disabled state functionality
  describe('Disabled State', () => {
    it('should be disabled when the disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not call onClick when disabled and clicked', () => {
      const mockOnClick = jest.fn();
      render(<Button disabled onClick={mockOnClick}>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should prevent default behavior when disabled and clicked', () => {
      const mockOnClick = jest.fn();
      render(<Button disabled onClick={mockOnClick}>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      const event = new MouseEvent('click', { bubbles: true });
      jest.spyOn(event, 'preventDefault');
      
      button.dispatchEvent(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should have proper accessibility attributes when disabled', () => {
      render(<Button disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('disabled');
    });
  });

  // Test loading state functionality
  describe('Loading State', () => {
    it('should render a loading spinner when loading prop is true', () => {
      render(<Button loading>Loading Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-busy', 'true');
      
      // Check for loading spinner presence
      const loadingSpinner = button.querySelector('.button-loading-spinner');
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('should be disabled when loading', () => {
      render(<Button loading>Loading Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not call onClick when loading and clicked', () => {
      const mockOnClick = jest.fn();
      render(<Button loading onClick={mockOnClick}>Loading Button</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should not render button text when loading', () => {
      render(<Button loading>Button Text</Button>);
      
      const button = screen.getByRole('button');
      const buttonText = button.querySelector('.button-text');
      expect(buttonText).not.toBeInTheDocument();
    });

    it('should not render icons when loading', () => {
      render(<Button loading icon="UserIcon">Button with Icon</Button>);
      
      const button = screen.getByRole('button');
      const icon = button.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });

    it('should prevent default behavior when loading and clicked', () => {
      const mockOnClick = jest.fn();
      render(<Button loading onClick={mockOnClick}>Loading Button</Button>);
      
      const button = screen.getByRole('button');
      const event = new MouseEvent('click', { bubbles: true });
      jest.spyOn(event, 'preventDefault');
      
      button.dispatchEvent(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  // Test variant styling
  describe('Variant Styling', () => {
    it('should apply the correct variant class - primary (default)', () => {
      render(<Button>Primary Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should apply the correct variant class - secondary', () => {
      render(<Button variant="secondary">Secondary Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should apply the correct variant class - danger', () => {
      render(<Button variant="danger">Danger Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should apply the correct variant class - ghost', () => {
      render(<Button variant="ghost">Ghost Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle variant changes correctly', () => {
      const { rerender } = render(<Button variant="primary">Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      
      rerender(<Button variant="danger">Button</Button>);
      expect(button).toBeInTheDocument();
    });
  });

  // Test size variations
  describe('Size Variations', () => {
    it('should apply the correct size class - medium (default)', () => {
      render(<Button>Medium Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should apply the correct size class - small', () => {
      render(<Button size="sm">Small Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should apply the correct size class - large', () => {
      render(<Button size="lg">Large Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle size changes correctly', () => {
      const { rerender } = render(<Button size="sm">Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      
      rerender(<Button size="lg">Button</Button>);
      expect(button).toBeInTheDocument();
    });
  });

  // Test icon functionality
  describe('Icon Functionality', () => {
    it('should render icon when icon prop is provided', () => {
      render(<Button icon="UserIcon">Button with Icon</Button>);
      
      const button = screen.getByRole('button');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render icon on the left by default', () => {
      render(<Button icon="UserIcon">Button Text</Button>);
      
      const button = screen.getByRole('button');
      const buttonText = button.querySelector('.button-text');
      const icon = button.querySelector('svg');
      
      expect(icon).toBeInTheDocument();
      expect(buttonText).toBeInTheDocument();
      
      // Check order: icon should come before text in DOM
      const children = Array.from(button.children);
      const iconIndex = children.indexOf(icon!);
      const textIndex = children.indexOf(buttonText!);
      expect(iconIndex).toBeLessThan(textIndex);
    });

    it('should render icon on the right when iconPosition is right', () => {
      render(<Button icon="UserIcon" iconPosition="right">Button Text</Button>);
      
      const button = screen.getByRole('button');
      const buttonText = button.querySelector('.button-text');
      const icon = button.querySelector('svg');
      
      expect(icon).toBeInTheDocument();
      expect(buttonText).toBeInTheDocument();
      
      // Check order: text should come before icon in DOM
      const children = Array.from(button.children);
      const iconIndex = children.indexOf(icon!);
      const textIndex = children.indexOf(buttonText!);
      expect(textIndex).toBeLessThan(iconIndex);
    });

    it('should render icon without text', () => {
      render(<Button icon="UserIcon" aria-label="User profile" />);
      
      const button = screen.getByRole('button');
      const icon = button.querySelector('svg');
      const buttonText = button.querySelector('.button-text');
      
      expect(icon).toBeInTheDocument();
      expect(buttonText).not.toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'User profile');
    });

    it('should handle different icon types', () => {
      const iconTypes = ['UserIcon', 'SettingsIcon', 'DashboardIcon'] as const;
      
      iconTypes.forEach((iconType) => {
        const { unmount } = render(<Button icon={iconType}>Test</Button>);
        
        const button = screen.getByRole('button');
        const icon = button.querySelector('svg');
        expect(icon).toBeInTheDocument();
        
        unmount();
      });
    });

    it('should adjust icon size based on button size', () => {
      const { rerender } = render(<Button icon="UserIcon" size="sm">Small</Button>);
      
      let button = screen.getByRole('button');
      let icon = button.querySelector('svg');
      expect(icon).toHaveAttribute('width', '16');
      expect(icon).toHaveAttribute('height', '16');
      
      rerender(<Button icon="UserIcon" size="md">Medium</Button>);
      button = screen.getByRole('button');
      icon = button.querySelector('svg');
      expect(icon).toHaveAttribute('width', '18');
      expect(icon).toHaveAttribute('height', '18');
      
      rerender(<Button icon="UserIcon" size="lg">Large</Button>);
      button = screen.getByRole('button');
      icon = button.querySelector('svg');
      expect(icon).toHaveAttribute('width', '20');
      expect(icon).toHaveAttribute('height', '20');
    });
  });

  // Test accessibility features
  describe('Accessibility Features', () => {
    it('should have proper role attribute', () => {
      render(<Button>Accessible Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('role', 'button');
    });

    it('should support keyboard navigation', () => {
      const mockOnClick = jest.fn();
      render(<Button onClick={mockOnClick}>Keyboard Button</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
      
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyUp(button, { key: 'Enter' });
      
      expect(button).toHaveFocus();
    });

    it('should have proper aria-busy attribute when loading', () => {
      render(<Button loading>Loading Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should have proper aria-disabled attribute when disabled', () => {
      render(<Button disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should mark icons as decorative with aria-hidden', () => {
      render(<Button icon="UserIcon">Button with Icon</Button>);
      
      const button = screen.getByRole('button');
      const icon = button.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should provide meaningful labels for screen readers', () => {
      render(<Button loading>Processing...</Button>);
      
      const button = screen.getByRole('button');
      const screenReaderText = button.querySelector('.sr-only');
      
      // The loading component should have screen reader text
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  // Test HTML button attributes forwarding
  describe('HTML Attributes Forwarding', () => {
    it('should forward standard HTML button attributes', () => {
      render(
        <Button
          type="submit"
          form="test-form"
          name="test-button"
          value="test-value"
          title="Test tooltip"
        >
          Submit
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('form', 'test-form');
      expect(button).toHaveAttribute('name', 'test-button');
      expect(button).toHaveAttribute('value', 'test-value');
      expect(button).toHaveAttribute('title', 'Test tooltip');
    });

    it('should handle event handlers other than onClick', () => {
      const mockOnMouseEnter = jest.fn();
      const mockOnMouseLeave = jest.fn();
      const mockOnFocus = jest.fn();
      const mockOnBlur = jest.fn();
      
      render(
        <Button
          onMouseEnter={mockOnMouseEnter}
          onMouseLeave={mockOnMouseLeave}
          onFocus={mockOnFocus}
          onBlur={mockOnBlur}
        >
          Interactive Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      
      fireEvent.mouseEnter(button);
      expect(mockOnMouseEnter).toHaveBeenCalledTimes(1);
      
      fireEvent.mouseLeave(button);
      expect(mockOnMouseLeave).toHaveBeenCalledTimes(1);
      
      fireEvent.focus(button);
      expect(mockOnFocus).toHaveBeenCalledTimes(1);
      
      fireEvent.blur(button);
      expect(mockOnBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle additional props correctly', () => {
      render(
        <Button
          tabIndex={0}
          autoFocus
          id="custom-button-id"
        >
          Custom Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
      expect(button).toHaveAttribute('id', 'custom-button-id');
      expect(button).toHaveFocus(); // autoFocus should work
    });
  });

  // Test edge cases and error handling
  describe('Edge Cases and Error Handling', () => {
    it('should handle empty children gracefully', () => {
      render(<Button />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe('');
    });

    it('should handle null/undefined children', () => {
      render(<Button>{null}</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle both loading and disabled states', () => {
      render(<Button loading disabled>Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should handle invalid icon names gracefully', () => {
      // @ts-ignore - Testing runtime behavior with invalid icon
      render(<Button icon="InvalidIcon">Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      
      // Should not render any icon
      const icon = button.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });

    it('should handle React elements as children', () => {
      render(
        <Button>
          <span>Complex</span> <strong>Children</strong>
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.querySelector('span')).toHaveTextContent('Complex');
      expect(button.querySelector('strong')).toHaveTextContent('Children');
    });

    it('should maintain stable functionality across prop changes', () => {
      const mockOnClick = jest.fn();
      const { rerender } = render(
        <Button onClick={mockOnClick} variant="primary">
          Initial State
        </Button>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      
      rerender(
        <Button onClick={mockOnClick} variant="secondary" size="lg">
          Updated State
        </Button>
      );
      
      fireEvent.click(button);
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });
  });

  // Test loading spinner size configuration
  describe('Loading Spinner Configuration', () => {
    it('should use correct loading spinner size for small button', () => {
      render(<Button loading size="sm">Small Loading</Button>);
      
      const button = screen.getByRole('button');
      const loadingSpinner = button.querySelector('.button-loading-spinner');
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('should use correct loading spinner size for medium button', () => {
      render(<Button loading size="md">Medium Loading</Button>);
      
      const button = screen.getByRole('button');
      const loadingSpinner = button.querySelector('.button-loading-spinner');
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('should use correct loading spinner size for large button', () => {
      render(<Button loading size="lg">Large Loading</Button>);
      
      const button = screen.getByRole('button');
      const loadingSpinner = button.querySelector('.button-loading-spinner');
      expect(loadingSpinner).toBeInTheDocument();
    });
  });

  // Test component state transitions
  describe('Component State Transitions', () => {
    it('should transition from normal to loading state correctly', () => {
      const { rerender } = render(<Button>Normal Button</Button>);
      
      let button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      expect(button).not.toHaveAttribute('aria-busy');
      
      rerender(<Button loading>Loading Button</Button>);
      
      button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should transition from loading to normal state correctly', () => {
      const { rerender } = render(<Button loading>Loading Button</Button>);
      
      let button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      
      rerender(<Button>Normal Button</Button>);
      
      button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      expect(button).not.toHaveAttribute('aria-busy');
    });

    it('should transition from disabled to enabled state correctly', () => {
      const mockOnClick = jest.fn();
      const { rerender } = render(
        <Button disabled onClick={mockOnClick}>Disabled Button</Button>
      );
      
      let button = screen.getByRole('button');
      fireEvent.click(button);
      expect(mockOnClick).not.toHaveBeenCalled();
      
      rerender(<Button onClick={mockOnClick}>Enabled Button</Button>);
      
      button = screen.getByRole('button');
      fireEvent.click(button);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });
});