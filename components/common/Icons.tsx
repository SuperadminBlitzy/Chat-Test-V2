import React from 'react'; // react@18.2+

/**
 * Icons component library for the Financial Services Platform
 * 
 * This module provides a centralized collection of SVG icons used throughout
 * the web application. Each icon is implemented as a React functional component
 * that accepts standard SVG properties for maximum flexibility and customization.
 * 
 * All icons are designed to support the following features:
 * - Customer Dashboard (F-013)
 * - Advisor Workbench (F-014) 
 * - Compliance Control Center (F-015)
 * - Risk Management Console (F-016)
 */

/**
 * Analytics Icon Component
 * 
 * Renders an analytics/chart icon for data visualization and reporting features.
 * Commonly used in dashboards, reports, and analytics sections.
 * 
 * @param props - Standard SVG element properties for customization
 * @returns JSX.Element representing the analytics SVG icon
 */
export const AnalyticsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Analytics"
      {...props}
    >
      <path d="M3 13h2v8H3v-8zm4-6h2v14H7V7zm4-4h2v18h-2V3zm4 8h2v10h-2V11zm4-3h2v13h-2V8z" />
      <path d="M2 22h20v-2H2v2z" />
    </svg>
  );
};

/**
 * Compliance Icon Component
 * 
 * Renders a compliance/shield icon representing regulatory compliance,
 * security, and risk management features.
 * 
 * @param props - Standard SVG element properties for customization
 * @returns JSX.Element representing the compliance SVG icon
 */
export const ComplianceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Compliance"
      {...props}
    >
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
      <path 
        d="M10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
        fill="white"
      />
    </svg>
  );
};

/**
 * Dashboard Icon Component
 * 
 * Renders a dashboard/grid icon representing main dashboard views,
 * overview screens, and navigation to key application areas.
 * 
 * @param props - Standard SVG element properties for customization
 * @returns JSX.Element representing the dashboard SVG icon
 */
export const DashboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Dashboard"
      {...props}
    >
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </svg>
  );
};

/**
 * Notification Icon Component
 * 
 * Renders a notification/bell icon for alerts, messages, and
 * system notifications throughout the application.
 * 
 * @param props - Standard SVG element properties for customization
 * @returns JSX.Element representing the notification SVG icon
 */
export const NotificationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Notification"
      {...props}
    >
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  );
};

/**
 * Settings Icon Component
 * 
 * Renders a settings/gear icon for configuration, preferences,
 * and administrative functions.
 * 
 * @param props - Standard SVG element properties for customization
 * @returns JSX.Element representing the settings SVG icon
 */
export const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Settings"
      {...props}
    >
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  );
};

/**
 * Transactions Icon Component
 * 
 * Renders a transactions/exchange icon for financial transactions,
 * money transfers, and payment processing features.
 * 
 * @param props - Standard SVG element properties for customization
 * @returns JSX.Element representing the transactions SVG icon
 */
export const TransactionsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Transactions"
      {...props}
    >
      <path d="M7 4V2c0-.55-.45-1-1-1s-1 .45-1 1v2c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2V2c0-.55-.45-1-1-1s-1 .45-1 1v2H7z" />
      <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-1.5 6L9 12.5l1.5-1.5L12 12.5 13.5 11 15 12.5 13.5 14l-1.5-1.5L10.5 14z" />
      <path d="M16 8V6h-2v2h2zM10 8V6H8v2h2z" />
    </svg>
  );
};

/**
 * User Icon Component
 * 
 * Renders a user/person icon for user profiles, account management,
 * and customer-related features.
 * 
 * @param props - Standard SVG element properties for customization
 * @returns JSX.Element representing the user SVG icon
 */
export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="User"
      {...props}
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
};