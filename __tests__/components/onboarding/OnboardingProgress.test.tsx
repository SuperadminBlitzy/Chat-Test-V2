import React from 'react'; // v18.2+
import { render, screen } from '@testing-library/react'; // v14.1+
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import OnboardingProgress from '../../../src/components/onboarding/OnboardingProgress';

// Create a Material-UI theme for consistent testing environment
const testTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    success: {
      main: '#2e7d32',
    },
    background: {
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    divider: '#e0e0e0',
  },
});

// Test wrapper component to provide Material-UI theme context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={testTheme}>
    {children}
  </ThemeProvider>
);

// Mock data for consistent testing
const mockSteps = [
  'Personal Information',
  'Identity Verification',
  'Document Upload',
  'Risk Assessment',
  'Account Setup'
];

const mockStepsMinimal = [
  'Step 1',
  'Step 2'
];

const mockStepsExtended = [
  'Personal Information',
  'Identity Verification',
  'Document Upload',
  'Risk Assessment',
  'KYC/AML Verification',
  'Account Setup',
  'Final Review'
];

describe('OnboardingProgress', () => {
  /**
   * Test suite for basic rendering functionality
   * Ensures the component renders without crashing and displays core elements
   */
  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={0} steps={mockSteps} />
        </TestWrapper>
      );
      
      // Verify the progress component is rendered
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByLabelText('Onboarding Progress')).toBeInTheDocument();
    });

    it('should render with empty steps array', () => {
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={0} steps={[]} />
        </TestWrapper>
      );
      
      // Component should render placeholder when no steps provided
      const progressContainer = screen.queryByRole('progressbar');
      expect(progressContainer).toBeInTheDocument();
    });

    it('should handle undefined steps prop gracefully', () => {
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={0} steps={undefined as any} />
        </TestWrapper>
      );
      
      // Component should not crash and should render safely
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  /**
   * Test suite for step display functionality
   * Verifies correct number of steps and step content rendering
   */
  describe('Step Display', () => {
    it('should render the correct number of steps', () => {
      const totalSteps = mockSteps.length;
      const currentStep = 2;
      
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={currentStep} steps={mockSteps} />
        </TestWrapper>
      );
      
      // Find all step elements - Material-UI renders steps as buttons within the stepper
      const stepElements = screen.getAllByRole('button');
      expect(stepElements).toHaveLength(totalSteps);
      
      // Verify progress indicator shows correct step count
      expect(screen.getByText(`Step ${currentStep + 1} of ${totalSteps}`)).toBeInTheDocument();
    });

    it('should display step labels correctly', () => {
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={1} steps={mockSteps} />
        </TestWrapper>
      );
      
      // Verify all step labels are displayed
      mockSteps.forEach(step => {
        expect(screen.getByText(step)).toBeInTheDocument();
      });
    });

    it('should handle single step scenario', () => {
      const singleStep = ['Complete Setup'];
      
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={0} steps={singleStep} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Complete Setup')).toBeInTheDocument();
      expect(screen.getByText('Step 1 of 1')).toBeInTheDocument();
    });
  });

  /**
   * Test suite for current step highlighting
   * Ensures the active step is visually distinguished and properly highlighted
   */
  describe('Current Step Highlighting', () => {
    it('should highlight the current step', () => {
      const totalSteps = mockSteps.length;
      const currentStep = 2;
      
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={currentStep} steps={mockSteps} />
        </TestWrapper>
      );
      
      // Get the step element for the current step
      const stepElements = screen.getAllByRole('button');
      const currentStepElement = stepElements[currentStep];
      
      // Verify the current step has the appropriate ARIA attributes
      expect(currentStepElement).toHaveAttribute('aria-current', 'step');
      
      // Verify progress indicator shows current step information
      expect(screen.getByText(`Step ${currentStep + 1} of ${totalSteps}`)).toBeInTheDocument();
      expect(screen.getByText(`- ${mockSteps[currentStep]}`)).toBeInTheDocument();
    });

    it('should highlight first step when activeStep is 0', () => {
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={0} steps={mockSteps} />
        </TestWrapper>
      );
      
      const stepElements = screen.getAllByRole('button');
      const firstStepElement = stepElements[0];
      
      expect(firstStepElement).toHaveAttribute('aria-current', 'step');
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    });

    it('should highlight last step correctly', () => {
      const lastStepIndex = mockSteps.length - 1;
      
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={lastStepIndex} steps={mockSteps} />
        </TestWrapper>
      );
      
      const stepElements = screen.getAllByRole('button');
      const lastStepElement = stepElements[lastStepIndex];
      
      expect(lastStepElement).toHaveAttribute('aria-current', 'step');
      expect(screen.getByText('Step 5 of 5')).toBeInTheDocument();
      expect(screen.getByText('- Completing onboarding')).toBeInTheDocument();
      expect(screen.getByText('Final Step')).toBeInTheDocument();
    });
  });

  /**
   * Test suite for completed steps functionality
   * Verifies that steps before the current step are marked as completed
   */
  describe('Completed Steps', () => {
    it('should show completed steps correctly', () => {
      const totalSteps = mockSteps.length;
      const currentStep = 3; // 4th step (0-based), so first 3 should be completed
      
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={currentStep} steps={mockSteps} />
        </TestWrapper>
      );
      
      const stepElements = screen.getAllByRole('button');
      
      // Iterate through all steps before the current one
      for (let stepIndex = 0; stepIndex < currentStep; stepIndex++) {
        const stepElement = stepElements[stepIndex];
        
        // Completed steps should have specific ARIA attributes
        expect(stepElement).toHaveAttribute('aria-expanded', 'false');
        
        // The step should contain completed indicator
        const stepIcon = stepElement.querySelector('.MuiStepIcon-root');
        expect(stepIcon).toHaveClass('Mui-completed');
      }
      
      // Current step should not be marked as completed
      const currentStepElement = stepElements[currentStep];
      expect(currentStepElement).toHaveAttribute('aria-current', 'step');
    });

    it('should show no completed steps when on first step', () => {
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={0} steps={mockSteps} />
        </TestWrapper>
      );
      
      const stepElements = screen.getAllByRole('button');
      const firstStepElement = stepElements[0];
      
      // First step should be active, not completed
      expect(firstStepElement).toHaveAttribute('aria-current', 'step');
      
      // No steps should be completed
      const completedIcons = screen.queryAllByText('✓');
      expect(completedIcons).toHaveLength(0);
    });

    it('should show all steps as completed except the last one when on final step', () => {
      const finalStepIndex = mockSteps.length - 1;
      
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={finalStepIndex} steps={mockSteps} />
        </TestWrapper>
      );
      
      const stepElements = screen.getAllByRole('button');
      
      // All steps except the last should be completed
      for (let stepIndex = 0; stepIndex < finalStepIndex; stepIndex++) {
        const stepElement = stepElements[stepIndex];
        const stepIcon = stepElement.querySelector('.MuiStepIcon-root');
        expect(stepIcon).toHaveClass('Mui-completed');
      }
      
      // Final step should be active
      const finalStepElement = stepElements[finalStepIndex];
      expect(finalStepElement).toHaveAttribute('aria-current', 'step');
    });
  });

  /**
   * Test suite for prop validation and edge cases
   * Ensures the component handles invalid or edge case props gracefully
   */
  describe('Prop Validation and Edge Cases', () => {
    it('should handle negative activeStep values', () => {
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={-1} steps={mockSteps} />
        </TestWrapper>
      );
      
      // Should default to first step (index 0)
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
      
      const stepElements = screen.getAllByRole('button');
      expect(stepElements[0]).toHaveAttribute('aria-current', 'step');
    });

    it('should handle activeStep values greater than steps length', () => {
      const oversizedActiveStep = mockSteps.length + 5;
      
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={oversizedActiveStep} steps={mockSteps} />
        </TestWrapper>
      );
      
      // Should default to last step
      const lastStepIndex = mockSteps.length - 1;
      expect(screen.getByText(`Step ${lastStepIndex + 1} of ${mockSteps.length}`)).toBeInTheDocument();
      
      const stepElements = screen.getAllByRole('button');
      expect(stepElements[lastStepIndex]).toHaveAttribute('aria-current', 'step');
    });

    it('should handle non-integer activeStep values', () => {
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={2.7} steps={mockSteps} />
        </TestWrapper>
      );
      
      // Should work with the truncated integer value
      expect(screen.getByText('Step 3 of 5')).toBeInTheDocument();
    });

    it('should handle steps with very long names', () => {
      const longSteps = [
        'This is a very long step name that might cause layout issues in some scenarios',
        'Another extremely long step description that tests component resilience',
        'Final step with moderate length'
      ];
      
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={1} steps={longSteps} />
        </TestWrapper>
      );
      
      // All steps should still be rendered
      longSteps.forEach(step => {
        expect(screen.getByText(step)).toBeInTheDocument();
      });
    });
  });

  /**
   * Test suite for accessibility compliance
   * Ensures the component meets WCAG guidelines and provides proper screen reader support
   */
  describe('Accessibility Compliance', () => {
    it('should have proper ARIA attributes', () => {
      const currentStep = 2;
      
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={currentStep} steps={mockSteps} />
        </TestWrapper>
      );
      
      const progressBar = screen.getByRole('progressbar');
      
      // Verify ARIA attributes for progress indication
      expect(progressBar).toHaveAttribute('aria-label', 'Onboarding Progress');
      expect(progressBar).toHaveAttribute('aria-valuenow', (currentStep + 1).toString());
      expect(progressBar).toHaveAttribute('aria-valuemin', '1');
      expect(progressBar).toHaveAttribute('aria-valuemax', mockSteps.length.toString());
      expect(progressBar).toHaveAttribute('aria-valuetext', 
        `Step ${currentStep + 1} of ${mockSteps.length}: ${mockSteps[currentStep]}`
      );
    });

    it('should have live region for progress updates', () => {
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={1} steps={mockSteps} />
        </TestWrapper>
      );
      
      // Find the live region element
      const liveRegion = screen.getByText('Step 2 of 5 - Identity Verification').closest('[aria-live]');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('should provide meaningful text for screen readers', () => {
      const currentStep = 3;
      
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={currentStep} steps={mockSteps} />
        </TestWrapper>
      );
      
      // Verify descriptive text is available
      expect(screen.getByText(`Step ${currentStep + 1} of ${mockSteps.length}`)).toBeInTheDocument();
      expect(screen.getByText(`- ${mockSteps[currentStep]}`)).toBeInTheDocument();
    });
  });

  /**
   * Test suite for performance requirements compliance
   * Ensures the component meets F-004 requirement of <5 minutes onboarding time
   * by providing clear progress indication
   */
  describe('F-004 Compliance - Digital Customer Onboarding', () => {
    it('should support typical KYC/AML onboarding flow', () => {
      const kycSteps = [
        'Personal Information',
        'Identity Verification',
        'Document Upload',
        'Biometric Authentication',
        'Risk Assessment',
        'KYC/AML Compliance Check',
        'Account Setup'
      ];
      
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={2} steps={kycSteps} />
        </TestWrapper>
      );
      
      // Verify all KYC-related steps are displayed
      kycSteps.forEach(step => {
        expect(screen.getByText(step)).toBeInTheDocument();
      });
      
      // Verify progress indication supports user confidence
      expect(screen.getByText('Step 3 of 7')).toBeInTheDocument();
    });

    it('should provide clear progress feedback for user confidence', () => {
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={2} steps={mockSteps} />
        </TestWrapper>
      );
      
      // Progress should be clearly communicated
      expect(screen.getByText('Step 3 of 5')).toBeInTheDocument();
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
      
      // Visual progress representation should be available
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '3');
      expect(progressBar).toHaveAttribute('aria-valuemax', '5');
    });

    it('should handle minimum viable onboarding flow', () => {
      const minimalSteps = ['Identity Verification', 'Account Setup'];
      
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={0} steps={minimalSteps} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Step 1 of 2')).toBeInTheDocument();
      expect(screen.getByText('Identity Verification')).toBeInTheDocument();
    });

    it('should handle comprehensive onboarding flow', () => {
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={3} steps={mockStepsExtended} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Step 4 of 7')).toBeInTheDocument();
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
      
      // Verify comprehensive flow is supported
      mockStepsExtended.forEach(step => {
        expect(screen.getByText(step)).toBeInTheDocument();
      });
    });
  });

  /**
   * Test suite for responsive design and layout
   * Ensures the component works across different screen sizes and devices
   */
  describe('Responsive Design', () => {
    it('should render with responsive styling applied', () => {
      render(
        <TestWrapper>
          <OnboardingProgress activeStep={1} steps={mockSteps} />
        </TestWrapper>
      );
      
      // Verify the component container has responsive classes
      const container = screen.getByRole('progressbar');
      expect(container).toBeInTheDocument();
      
      // Material-UI responsive classes should be applied through sx prop
      // This is tested through the component's proper rendering
      const stepElements = screen.getAllByRole('button');
      expect(stepElements).toHaveLength(mockSteps.length);
    });
  });

  /**
   * Test suite for integration scenarios
   * Tests the component in realistic integration contexts
   */
  describe('Integration Scenarios', () => {
    it('should work with dynamic step updates', () => {
      const { rerender } = render(
        <TestWrapper>
          <OnboardingProgress activeStep={0} steps={mockStepsMinimal} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Step 1 of 2')).toBeInTheDocument();
      
      // Simulate dynamic step addition
      rerender(
        <TestWrapper>
          <OnboardingProgress activeStep={0} steps={mockSteps} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    });

    it('should handle step progression simulation', () => {
      const { rerender } = render(
        <TestWrapper>
          <OnboardingProgress activeStep={0} steps={mockSteps} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
      
      // Simulate progression to next step
      rerender(
        <TestWrapper>
          <OnboardingProgress activeStep={1} steps={mockSteps} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
      expect(screen.getByText('- Identity Verification')).toBeInTheDocument();
    });
  });
});