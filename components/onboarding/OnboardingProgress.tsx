import React from 'react'; // v18.2+
import { Stepper, Step, StepLabel, Box } from '@mui/material'; // v5.15+

/**
 * Props interface for the OnboardingProgress component
 * 
 * @interface OnboardingProgressProps
 * @property {number} activeStep - The current active step index (0-based)
 * @property {string[]} steps - Array of step labels to display in the stepper
 */
interface OnboardingProgressProps {
  activeStep: number;
  steps: string[];
}

/**
 * OnboardingProgress Component
 * 
 * A visual component that displays the user's progress through the multi-step 
 * digital customer onboarding process. This component is a key part of the 
 * F-004: Digital Customer Onboarding feature, providing clear visual feedback
 * on the user's progress through KYC/AML and account setup processes.
 * 
 * The component implements a Material-UI stepper to show:
 * - Current stage (highlighted/active)
 * - Completed stages (marked as completed)
 * - Upcoming stages (inactive/pending)
 * 
 * This supports the business requirement of reducing onboarding time to <5 minutes
 * by providing clear progress indication and reducing user confusion.
 * 
 * @param {OnboardingProgressProps} props - Component props
 * @returns {JSX.Element} A stepper component visually representing onboarding progress
 */
const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ 
  activeStep, 
  steps 
}) => {
  // Validate props to ensure component reliability
  const validatedActiveStep = Math.max(0, Math.min(activeStep, steps.length - 1));
  const validatedSteps = Array.isArray(steps) ? steps : [];

  // Early return for empty steps array to prevent rendering issues
  if (validatedSteps.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          padding: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60px',
        }}
      >
        {/* Placeholder for when no steps are provided */}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        padding: { xs: 1, sm: 2, md: 3 }, // Responsive padding
        backgroundColor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        marginBottom: 2,
      }}
      role="progressbar"
      aria-label="Onboarding Progress"
      aria-valuenow={validatedActiveStep + 1}
      aria-valuemin={1}
      aria-valuemax={validatedSteps.length}
      aria-valuetext={`Step ${validatedActiveStep + 1} of ${validatedSteps.length}: ${validatedSteps[validatedActiveStep]}`}
    >
      <Stepper 
        activeStep={validatedActiveStep}
        alternativeLabel // Display labels below step icons for better mobile experience
        sx={{
          '& .MuiStepLabel-root': {
            cursor: 'default', // Prevent cursor change since steps aren't clickable
          },
          '& .MuiStepLabel-label': {
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }, // Responsive font sizes
            fontWeight: 500,
            color: 'text.primary',
            '&.Mui-active': {
              color: 'primary.main',
              fontWeight: 600,
            },
            '&.Mui-completed': {
              color: 'success.main',
              fontWeight: 500,
            },
          },
          '& .MuiStepIcon-root': {
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }, // Responsive icon sizes
            '&.Mui-active': {
              color: 'primary.main',
            },
            '&.Mui-completed': {
              color: 'success.main',
            },
          },
          '& .MuiStepConnector-line': {
            borderColor: 'divider',
            borderWidth: 2,
          },
          '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
            borderColor: 'success.main',
          },
          '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
            borderColor: 'primary.main',
          },
        }}
      >
        {validatedSteps.map((step, index) => (
          <Step 
            key={`onboarding-step-${index}`}
            completed={index < validatedActiveStep}
            active={index === validatedActiveStep}
          >
            <StepLabel
              optional={
                // Add optional text for the last step to indicate completion
                index === validatedSteps.length - 1 && index === validatedActiveStep
                  ? 'Final Step'
                  : undefined
              }
              sx={{
                '& .MuiStepLabel-labelContainer': {
                  maxWidth: { xs: '80px', sm: '120px', md: '150px' }, // Prevent label overflow
                },
              }}
            >
              {step}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Progress indicator text for screen readers and additional context */}
      <Box
        sx={{
          marginTop: 2,
          textAlign: 'center',
          color: 'text.secondary',
          fontSize: '0.875rem',
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        Step {validatedActiveStep + 1} of {validatedSteps.length}
        {validatedActiveStep < validatedSteps.length - 1 && (
          <span> - {validatedSteps[validatedActiveStep]}</span>
        )}
        {validatedActiveStep === validatedSteps.length - 1 && (
          <span> - Completing onboarding</span>
        )}
      </Box>
    </Box>
  );
};

export default OnboardingProgress;