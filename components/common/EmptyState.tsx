import React from 'react'; // react@18.2.0
import styled from 'styled-components'; // styled-components@5.3.11
import { Button } from './Button';
import { AnalyticsIcon, ComplianceIcon, DashboardIcon, NotificationIcon, SettingsIcon, TransactionsIcon, UserIcon } from './Icons';

/**
 * Styled container for the empty state component
 * Provides centered layout with appropriate spacing and typography
 */
const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  color: #616161;
`;

/**
 * Styled container for the empty state icon
 * Provides appropriate spacing and visual hierarchy
 */
const EmptyStateIcon = styled.div`
  margin-bottom: 24px;
  color: #bdbdbd;
`;

/**
 * Styled title element for the empty state
 * Implements design system typography for clear visual hierarchy
 */
const EmptyStateTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #212121;
`;

/**
 * Styled message element for the empty state
 * Provides readable text with appropriate constraints
 */
const EmptyStateMessage = styled.p`
  margin-bottom: 24px;
  max-width: 400px;
`;

/**
 * Props interface for the EmptyState component
 * Defines all configurable properties for the empty state display
 */
interface EmptyStateProps {
  /**
   * The main title displayed in the empty state
   * Should be concise and descriptive of the empty condition
   */
  title: string;
  
  /**
   * The descriptive message explaining the empty state
   * Should provide helpful context and guidance to the user
   */
  message: string;
  
  /**
   * Optional text for the call-to-action button
   * When provided, displays an action button in the empty state
   */
  actionText?: string;
  
  /**
   * Optional callback function for the action button
   * Required when actionText is provided
   */
  onActionClick?: () => void;
  
  /**
   * Optional icon name to display in the empty state
   * Must match one of the available icon components
   */
  iconName?: 'analytics' | 'compliance' | 'dashboard' | 'notification' | 'settings' | 'transactions' | 'user';
}

/**
 * Icon mapping object for dynamic icon rendering
 * Maps icon names to their corresponding React components
 */
const iconComponents = {
  analytics: AnalyticsIcon,
  compliance: ComplianceIcon,
  dashboard: DashboardIcon,
  notification: NotificationIcon,
  settings: SettingsIcon,
  transactions: TransactionsIcon,
  user: UserIcon,
} as const;

/**
 * EmptyState Component
 * 
 * A reusable React component to display a message when there is no data to show.
 * It typically includes an icon, a title, a descriptive message, and an optional 
 * call-to-action button.
 * 
 * This component contributes to the User Experience success criteria by providing
 * clear feedback to users when no data is available, preventing confusion and
 * improving the overall user experience across the unified financial services platform.
 * 
 * Features:
 * - Responsive design with centered layout
 * - Optional icon display for visual context
 * - Clear typography hierarchy with title and message
 * - Optional call-to-action button for user guidance
 * - Consistent styling aligned with design system
 * - Accessibility features for screen readers
 * 
 * Use Cases:
 * - Empty data tables or lists
 * - No search results found
 * - Initial state of dashboards before data loads
 * - Error states where data cannot be displayed
 * - Onboarding flows to guide new users
 * 
 * @param props - The EmptyState component props
 * @returns JSX.Element - The rendered EmptyState component
 */
const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  message, 
  actionText, 
  onActionClick, 
  iconName 
}) => {
  // Get the appropriate icon component based on the iconName prop
  const IconComponent = iconName ? iconComponents[iconName] : null;

  return (
    <EmptyStateContainer
      role="region"
      aria-label="Empty state"
      aria-describedby="empty-state-title empty-state-message"
    >
      {/* Conditionally render the icon if iconName is provided */}
      {IconComponent && (
        <EmptyStateIcon>
          <IconComponent
            width={48}
            height={48}
            aria-hidden="true"
          />
        </EmptyStateIcon>
      )}
      
      {/* Render the title with appropriate semantic markup */}
      <EmptyStateTitle id="empty-state-title">
        {title}
      </EmptyStateTitle>
      
      {/* Render the descriptive message */}
      <EmptyStateMessage id="empty-state-message">
        {message}
      </EmptyStateMessage>
      
      {/* Conditionally render the action button if both actionText and onActionClick are provided */}
      {actionText && onActionClick && (
        <Button
          variant="primary"
          size="md"
          onClick={onActionClick}
          aria-label={`${actionText} - ${title}`}
        >
          {actionText}
        </Button>
      )}
    </EmptyStateContainer>
  );
};

export default EmptyState;