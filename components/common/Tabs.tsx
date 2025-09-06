import React, { useState } from 'react'; // ^18.0.0
import styled from '@emotion/styled'; // 11.11.0

/**
 * Interface defining the structure of a single tab item
 * Used across financial dashboards for consistent tab implementation
 */
export interface TabItem {
  /** Unique identifier for the tab */
  id: string;
  /** Display label for the tab */
  label: string;
  /** Content to be rendered when tab is active */
  content: React.ReactNode;
  /** Whether the tab is disabled and cannot be clicked */
  disabled?: boolean;
}

/**
 * Props interface for the Tabs component
 */
interface TabsProps {
  /** Array of tab items to render */
  tabs: TabItem[];
  /** ID of the tab to be active by default */
  defaultTab?: string;
  /** Callback function called when tab changes */
  onTabChange?: (tabId: string) => void;
}

/**
 * Styled container for the tab list
 * Provides consistent styling across financial dashboards
 */
const TabList = styled.div`
  display: flex;
  border-bottom: 2px solid #e1e5e9;
  background-color: #ffffff;
  overflow-x: auto;
  position: relative;
  
  /* Scrollbar styling for overflow tabs */
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f3f4;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c7cd;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8b0b8;
  }
`;

/**
 * Styled button for individual tabs
 * Implements enterprise-grade styling with accessibility features
 */
const TabButton = styled.button<{ isActive: boolean; disabled?: boolean }>`
  position: relative;
  padding: 12px 24px;
  border: none;
  background-color: transparent;
  font-size: 14px;
  font-weight: ${props => props.isActive ? '600' : '500'};
  color: ${props => {
    if (props.disabled) return '#9ca3af';
    return props.isActive ? '#1f2937' : '#6b7280';
  }};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  white-space: nowrap;
  transition: all 0.2s ease-in-out;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Active tab indicator */
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 3px;
    background-color: ${props => props.isActive ? '#3b82f6' : 'transparent'};
    border-radius: 2px 2px 0 0;
    transition: background-color 0.2s ease-in-out;
  }
  
  /* Hover effects for non-disabled tabs */
  &:hover:not(:disabled) {
    color: ${props => props.isActive ? '#1f2937' : '#374151'};
    background-color: ${props => props.isActive ? 'transparent' : '#f9fafb'};
  }
  
  /* Focus styles for accessibility */
  &:focus {
    outline: none;
    box-shadow: inset 0 0 0 2px #3b82f6;
  }
  
  /* Active state background */
  ${props => props.isActive && `
    background-color: #ffffff;
  `}
  
  /* Disabled state */
  ${props => props.disabled && `
    opacity: 0.5;
    &:hover {
      background-color: transparent;
      color: #9ca3af;
    }
  `}
`;

/**
 * Styled container for tab content
 * Provides consistent padding and styling for tab panels
 */
const TabPanel = styled.div`
  padding: 24px;
  background-color: #ffffff;
  min-height: 200px;
  border-radius: 0 0 8px 8px;
  
  /* Ensure content doesn't overflow */
  overflow-x: auto;
  
  /* Animation for content changes */
  animation: fadeIn 0.2s ease-in-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

/**
 * Main container for the entire tabs component
 */
const TabsContainer = styled.div`
  width: 100%;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
`;

/**
 * Reusable Tabs component for creating tabbed interfaces
 * Used across financial dashboards including Customer Dashboard (F-013),
 * Advisor Workbench (F-014), Compliance Control Center (F-015),
 * and Risk Management Console (F-016)
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onTabChange
}) => {
  // Initialize the active tab state using the defaultTab prop or first tab's ID
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (defaultTab && tabs.find(tab => tab.id === defaultTab)) {
      return defaultTab;
    }
    return tabs.length > 0 ? tabs[0].id : '';
  });

  /**
   * Handles the click event on a tab
   * Updates the active tab state and calls the onTabChange callback
   * @param tabId - The ID of the clicked tab
   */
  const handleTabClick = (tabId: string): void => {
    // Find the tab to check if it's disabled
    const clickedTab = tabs.find(tab => tab.id === tabId);
    
    // Prevent action if tab is disabled
    if (clickedTab?.disabled) {
      return;
    }

    // Set the active tab state to the clicked tab's ID
    setActiveTab(tabId);
    
    // If an onTabChange callback is provided, call it with the new tab ID
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  // Find the content of the active tab from the tabs prop
  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  // Early return if no tabs are provided
  if (!tabs || tabs.length === 0) {
    return null;
  }

  return (
    <TabsContainer>
      {/* Render the TabList styled component */}
      <TabList role="tablist" aria-label="Content tabs">
        {/* Map through the tabs prop array to render each tab button */}
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={tab.disabled ? -1 : 0}
            isActive={activeTab === tab.id}
            disabled={tab.disabled}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => {
              // Handle keyboard navigation
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTabClick(tab.id);
              }
            }}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabList>

      {/* Render the TabPanel styled component */}
      <TabPanel
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {/* Render the content of the active tab inside the TabPanel */}
        {activeTabContent}
      </TabPanel>
    </TabsContainer>
  );
};

// Default export of the Tabs component
export default Tabs;