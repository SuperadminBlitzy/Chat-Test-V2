import React from 'react'; // v18.2.0
import { StatusBadge } from '../common/StatusBadge';
import { AmlCheckStatusType } from '../../models/compliance';

/**
 * Props interface for the AmlCheckStatus component
 * 
 * Defines the structure for component inputs to display Anti-Money Laundering (AML) check status
 * in compliance with F-004: Digital Customer Onboarding functional requirements.
 */
interface AmlCheckStatusProps {
  /**
   * The current status of the AML check
   * 
   * This status drives the visual representation and indicates the compliance state
   * of the customer's AML screening process as part of digital onboarding.
   * 
   * @type {AmlCheckStatusType}
   */
  status: AmlCheckStatusType;
}

/**
 * AmlCheckStatus Component
 * 
 * A React functional component that displays the status of an Anti-Money Laundering (AML) check
 * as part of the digital customer onboarding process. This component provides visual feedback
 * on the compliance status of customers undergoing KYC/AML verification.
 * 
 * **Business Context:**
 * - Supports F-004: Digital Customer Onboarding functional requirements
 * - Addresses KYC/AML compliance checks (F-004-RQ-002)
 * - Provides visual representation of watchlist screening results
 * - Enables compliance with Bank Secrecy Act (BSA) requirements
 * - Supports real-time compliance monitoring and reporting
 * 
 * **Technical Implementation:**
 * - Uses StatusBadge component for consistent visual styling across the platform
 * - Maps AML-specific status values to appropriate visual variants
 * - Maintains accessibility standards with proper semantic markup
 * - Supports audit trail requirements through status visibility
 * 
 * **Compliance Features:**
 * - Displays results of watchlist screening against AML databases worldwide
 * - Provides clear visual indication of compliance status for regulatory reporting
 * - Supports risk-based onboarding with appropriate status categorization
 * - Enables quick identification of cases requiring manual review or escalation
 * 
 * **Status Mapping:**
 * - CLEARED: Customer has passed all AML checks (success variant)
 * - PENDING: Check is in progress or awaiting processing (warning variant)
 * - IN_REVIEW: Manual review required, typically for enhanced due diligence (warning variant)
 * - FAILED: Customer has failed AML screening (error variant)
 * - WATCHLIST_MATCH: Customer matched against AML watchlists (error variant)
 * - Other statuses: Default informational display (info variant)
 * 
 * @param props - Component properties containing the AML check status
 * @returns JSX.Element representing the styled AML check status badge
 * 
 * @example
 * ```tsx
 * // Display a cleared AML check status
 * <AmlCheckStatus status="CLEARED" />
 * 
 * // Display a pending AML check status
 * <AmlCheckStatus status="PENDING" />
 * 
 * // Display a watchlist match status
 * <AmlCheckStatus status="WATCHLIST_MATCH" />
 * ```
 */
const AmlCheckStatus: React.FC<AmlCheckStatusProps> = ({ status }) => {
  // Destructure the status prop from the component's props
  // This status represents the current state of the AML compliance check
  
  // Define a variable to store the appropriate variant for the StatusBadge component
  // The variant determines the color scheme and visual styling of the status display
  let variant: 'success' | 'warning' | 'error' | 'info' | 'pending';
  
  // Use a switch statement on the status prop to determine the appropriate color variant
  // This mapping aligns with regulatory compliance requirements and user experience standards
  switch (status) {
    // Set variant to 'success' for CLEARED status
    // Indicates the customer has successfully passed all AML checks and screenings
    case 'CLEARED':
      variant = 'success';
      break;
      
    // Set variant to 'warning' for PENDING status
    // Indicates the AML check is in progress or awaiting automated processing
    case 'PENDING':
      variant = 'warning';
      break;
      
    // Set variant to 'warning' for IN_REVIEW status
    // Indicates manual review is required, typically for enhanced due diligence
    case 'IN_REVIEW':
      variant = 'warning';
      break;
      
    // Set variant to 'error' for FAILED status
    // Indicates the customer has failed AML screening and cannot proceed with onboarding
    case 'FAILED':
      variant = 'error';
      break;
      
    // Set variant to 'error' for WATCHLIST_MATCH status
    // Indicates the customer has matched against AML watchlists and requires investigation
    case 'WATCHLIST_MATCH':
      variant = 'error';
      break;
      
    // Set variant to 'info' for any other status
    // Provides default informational display for edge cases or new status types
    default:
      variant = 'info';
      break;
  }
  
  // Render the StatusBadge component with the determined variant and status text
  // The StatusBadge provides consistent styling and accessibility features
  return (
    <StatusBadge status={variant}>
      {status}
    </StatusBadge>
  );
};

// Export the AmlCheckStatus component for use throughout the application
// This component serves as a critical element in the compliance control center
// and customer onboarding interfaces, providing clear visual feedback on AML status
export default AmlCheckStatus;

// Named export for compatibility with different import patterns
export { AmlCheckStatus };

// Export the props interface for type safety in consuming components
export type { AmlCheckStatusProps };