/// <reference types="cypress" />

// cypress v13.6+ - End-to-end tests for Unified Financial Services Platform Dashboard
// Tests core dashboard functionalities including widgets, data display, and user interactions
// Addresses F-013 Customer Dashboard requirements from Technical Specifications/2.1.4

import { login } from '../../support/commands';

describe('Dashboard', () => {
  // Set up test environment before each test case
  beforeEach(() => {
    // Clear any existing application state to ensure clean test environment
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Mock critical API endpoints for consistent testing
    // F-001 Unified Data Integration Platform - Real-time data synchronization
    cy.interceptAPI('GET', '/api/dashboard/statistics', {
      fixture: 'dashboard/statistics.json'
    });

    // F-005 Predictive Analytics Dashboard - Analytics data
    cy.interceptAPI('GET', '/api/dashboard/analytics', {
      fixture: 'dashboard/analytics.json'
    });

    // F-008 Real-time Transaction Monitoring - Transaction data
    cy.interceptAPI('GET', '/api/transactions/recent', {
      fixture: 'dashboard/recentTransactions.json'
    });

    // F-002 AI-Powered Risk Assessment - Risk metrics
    cy.interceptAPI('GET', '/api/risk/dashboard-metrics', {
      fixture: 'dashboard/riskMetrics.json'
    });

    // Authenticate user using the custom login command with fixture data
    // This loads user credentials from cypress/fixtures/validUser.json
    cy.login('validUser');

    // Navigate to the main dashboard page after successful authentication
    cy.visit('/dashboard');

    // Wait for dashboard to fully load with all required components
    cy.dataCy('dashboard-container').should('be.visible');
    cy.dataCy('loading-spinner').should('not.exist');

    // Verify successful authentication state
    cy.dataCy('user-profile-menu').should('be.visible');
    cy.dataCy('security-indicator').should('have.class', 'secure-session');
  });

  it('should display the dashboard header and sidebar', () => {
    // Test F-013 Customer Dashboard core layout components
    // Verify the main navigation structure is properly rendered

    // Check dashboard header visibility and content
    cy.dataCy('dashboard-header')
      .should('be.visible')
      .within(() => {
        // Verify logo and branding elements
        cy.dataCy('platform-logo').should('be.visible');
        cy.dataCy('company-name').should('contain.text', 'Unified Financial Services');

        // Verify user navigation elements
        cy.dataCy('user-profile-menu').should('be.visible');
        cy.dataCy('notifications-icon').should('be.visible');
        cy.dataCy('settings-icon').should('be.visible');

        // Verify security indicators
        cy.dataCy('security-status').should('contain.text', 'Secure');
        cy.dataCy('session-timer').should('be.visible');
      });

    // Check dashboard sidebar visibility and navigation items
    cy.dataCy('dashboard-sidebar')
      .should('be.visible')
      .within(() => {
        // Verify primary navigation menu items
        cy.dataCy('nav-overview').should('be.visible').and('contain.text', 'Overview');
        cy.dataCy('nav-accounts').should('be.visible').and('contain.text', 'Accounts');
        cy.dataCy('nav-transactions').should('be.visible').and('contain.text', 'Transactions');
        cy.dataCy('nav-investments').should('be.visible').and('contain.text', 'Investments');
        cy.dataCy('nav-reports').should('be.visible').and('contain.text', 'Reports');

        // Verify F-015 Compliance Control Center access
        cy.dataCy('nav-compliance').should('be.visible').and('contain.text', 'Compliance');

        // Verify F-016 Risk Management Console access
        cy.dataCy('nav-risk-management').should('be.visible').and('contain.text', 'Risk Management');

        // Verify current page highlighting
        cy.dataCy('nav-overview').should('have.class', 'active');
      });

    // Verify sidebar collapse/expand functionality
    cy.dataCy('sidebar-toggle').click();
    cy.dataCy('dashboard-sidebar').should('have.class', 'collapsed');
    
    cy.dataCy('sidebar-toggle').click();
    cy.dataCy('dashboard-sidebar').should('not.have.class', 'collapsed');

    // Test responsive design behavior
    cy.viewport('tablet');
    cy.dataCy('dashboard-sidebar').should('have.class', 'mobile-hidden');
    cy.dataCy('mobile-menu-toggle').should('be.visible');
  });

  it('should display statistics cards with correct data', () => {
    // Test F-001 Unified Data Integration Platform real-time data display
    // Test F-005 Predictive Analytics Dashboard statistics presentation

    // Wait for statistics data to load
    cy.wait('@api-get-api-dashboard-statistics');

    // Verify statistics cards container is visible
    cy.dataCy('statistics-cards-container')
      .should('be.visible')
      .within(() => {
        // Verify minimum number of statistics cards
        cy.get('[data-cy^="stat-card-"]').should('have.length.at.least', 4);

        // Test each statistics card for required elements
        cy.get('[data-cy^="stat-card-"]').each(($card, index) => {
          cy.wrap($card)
            .should('be.visible')
            .within(() => {
              // Verify card structure
              cy.dataCy('card-icon').should('be.visible');
              cy.dataCy('card-title').should('be.visible').and('not.be.empty');
              cy.dataCy('card-value').should('be.visible').and('not.be.empty');
              cy.dataCy('card-change').should('be.visible');

              // Verify data formatting
              cy.dataCy('card-value').invoke('text').should('match', /[\d,.$%]+/);
              
              // Verify trend indicators
              cy.dataCy('trend-indicator').should('exist');
              cy.dataCy('trend-percentage').should('be.visible');
            });
        });

        // Test specific critical statistics cards
        cy.dataCy('stat-card-total-balance')
          .should('be.visible')
          .within(() => {
            cy.dataCy('card-title').should('contain.text', 'Total Balance');
            cy.dataCy('card-value').should('match', /\$[\d,]+\.\d{2}/);
            cy.dataCy('card-icon').should('have.class', 'balance-icon');
          });

        cy.dataCy('stat-card-monthly-transactions')
          .should('be.visible')
          .within(() => {
            cy.dataCy('card-title').should('contain.text', 'Monthly Transactions');
            cy.dataCy('card-value').should('match', /[\d,]+/);
            cy.dataCy('trend-indicator').should('have.class', 'trend-up');
          });

        // F-002 AI-Powered Risk Assessment - Risk score display
        cy.dataCy('stat-card-risk-score')
          .should('be.visible')
          .within(() => {
            cy.dataCy('card-title').should('contain.text', 'Risk Score');
            cy.dataCy('card-value').should('match', /\d{1,3}/);
            cy.dataCy('risk-level-indicator').should('be.visible');
          });

        // F-003 Regulatory Compliance - Compliance status
        cy.dataCy('stat-card-compliance-status')
          .should('be.visible')
          .within(() => {
            cy.dataCy('card-title').should('contain.text', 'Compliance Status');
            cy.dataCy('compliance-badge').should('have.class', 'compliant');
            cy.dataCy('compliance-score').should('be.visible');
          });
      });

    // Test statistics cards interactivity
    cy.dataCy('stat-card-total-balance').click();
    cy.dataCy('balance-details-modal').should('be.visible');
    cy.dataCy('modal-close-button').click();
    cy.dataCy('balance-details-modal').should('not.exist');

    // Test data refresh functionality
    cy.dataCy('refresh-statistics').click();
    cy.dataCy('statistics-loading').should('be.visible');
    cy.dataCy('statistics-loading').should('not.exist');
    cy.dataCy('last-updated-timestamp').should('contain.text', new Date().toDateString());
  });

  it('should display the quick actions card', () => {
    // Test F-013 Customer Dashboard quick access functionality
    // Verify quick actions for improved user experience

    // Verify quick actions card presence and visibility
    cy.dataCy('quick-actions-card')
      .should('be.visible')
      .within(() => {
        // Verify card header
        cy.dataCy('card-header').should('contain.text', 'Quick Actions');
        cy.dataCy('card-icon').should('have.class', 'quick-actions-icon');

        // Verify primary quick action buttons
        cy.dataCy('action-transfer-funds')
          .should('be.visible')
          .and('contain.text', 'Transfer Funds')
          .and('be.enabled');

        cy.dataCy('action-pay-bills')
          .should('be.visible')
          .and('contain.text', 'Pay Bills')
          .and('be.enabled');

        cy.dataCy('action-deposit-check')
          .should('be.visible')
          .and('contain.text', 'Deposit Check')
          .and('be.enabled');

        cy.dataCy('action-investment-trade')
          .should('be.visible')
          .and('contain.text', 'Investment Trade')
          .and('be.enabled');

        // F-004 Digital Customer Onboarding - Account management
        cy.dataCy('action-manage-profile')
          .should('be.visible')
          .and('contain.text', 'Manage Profile')
          .and('be.enabled');

        // F-003 Regulatory Compliance - Quick compliance access
        cy.dataCy('action-compliance-center')
          .should('be.visible')
          .and('contain.text', 'Compliance Center')
          .and('be.enabled');

        // Verify action icons are properly loaded
        cy.get('[data-cy^="action-"]').each(($action) => {
          cy.wrap($action).within(() => {
            cy.dataCy('action-icon').should('be.visible');
            cy.dataCy('action-label').should('be.visible');
          });
        });
      });

    // Test quick actions functionality
    cy.dataCy('action-transfer-funds').click();
    cy.url().should('include', '/transfer');
    cy.go('back');

    cy.dataCy('action-pay-bills').click();
    cy.url().should('include', '/bills');
    cy.go('back');

    // Test responsive behavior of quick actions
    cy.viewport('mobile');
    cy.dataCy('quick-actions-card').within(() => {
      cy.get('[data-cy^="action-"]').should('have.class', 'mobile-stacked');
    });

    // Test quick actions permissions based on user role
    cy.dataCy('action-compliance-center').should('be.visible');
    cy.dataCy('action-investment-trade').should('not.have.class', 'disabled');

    // Verify accessibility features
    cy.dataCy('quick-actions-card').within(() => {
      cy.get('[data-cy^="action-"]').each(($action) => {
        cy.wrap($action)
          .should('have.attr', 'role', 'button')
          .and('have.attr', 'tabindex', '0');
      });
    });
  });

  it('should display the transaction trends chart', () => {
    // Test F-005 Predictive Analytics Dashboard chart visualization
    // Test F-008 Real-time Transaction Monitoring visual representation

    // Wait for analytics data to load
    cy.wait('@api-get-api-dashboard-analytics');

    // Verify transaction trends chart component
    cy.dataCy('transaction-trends-chart')
      .should('be.visible')
      .within(() => {
        // Verify chart header
        cy.dataCy('chart-header').should('contain.text', 'Transaction Trends');
        cy.dataCy('chart-period-selector').should('be.visible');

        // Verify chart canvas is rendered
        cy.dataCy('chart-canvas').should('be.visible');
        cy.dataCy('chart-canvas').should('have.attr', 'width');
        cy.dataCy('chart-canvas').should('have.attr', 'height');

        // Verify chart legend
        cy.dataCy('chart-legend').should('be.visible').within(() => {
          cy.dataCy('legend-income').should('contain.text', 'Income');
          cy.dataCy('legend-expenses').should('contain.text', 'Expenses');
          cy.dataCy('legend-investments').should('contain.text', 'Investments');
        });

        // Verify chart controls
        cy.dataCy('chart-zoom-controls').should('be.visible');
        cy.dataCy('chart-export-button').should('be.visible');
      });

    // Test chart period selector functionality
    cy.dataCy('chart-period-selector').select('30d');
    cy.dataCy('chart-loading').should('be.visible');
    cy.dataCy('chart-loading').should('not.exist');

    cy.dataCy('chart-period-selector').select('90d');
    cy.dataCy('chart-canvas').should('be.visible');

    cy.dataCy('chart-period-selector').select('1y');
    cy.dataCy('chart-canvas').should('be.visible');

    // Test chart interactivity
    cy.dataCy('chart-canvas').trigger('mouseover', { x: 100, y: 100 });
    cy.dataCy('chart-tooltip').should('be.visible');
    cy.dataCy('chart-tooltip').should('contain.text', '$');

    // Test chart zoom functionality
    cy.dataCy('zoom-in-button').click();
    cy.dataCy('chart-zoom-level').should('contain.text', '110%');

    cy.dataCy('zoom-out-button').click();
    cy.dataCy('chart-zoom-level').should('contain.text', '100%');

    // Test chart export functionality
    cy.dataCy('chart-export-button').click();
    cy.dataCy('export-options-menu').should('be.visible');
    cy.dataCy('export-png').should('be.visible');
    cy.dataCy('export-pdf').should('be.visible');
    cy.dataCy('export-csv').should('be.visible');

    // Close export menu
    cy.dataCy('chart-canvas').click();
    cy.dataCy('export-options-menu').should('not.exist');

    // Verify chart responsiveness
    cy.viewport('tablet');
    cy.dataCy('transaction-trends-chart').should('have.class', 'responsive-chart');
    cy.dataCy('chart-canvas').should('have.css', 'max-width', '100%');

    // Test chart accessibility
    cy.dataCy('chart-canvas')
      .should('have.attr', 'role', 'img')
      .and('have.attr', 'aria-label')
      .and('have.attr', 'tabindex', '0');

    // Verify chart data updates
    cy.dataCy('refresh-chart-data').click();
    cy.dataCy('chart-last-updated').should('contain.text', 'Just now');
  });

  it('should display the recent transactions list', () => {
    // Test F-008 Real-time Transaction Monitoring list display
    // Test F-001 Unified Data Integration Platform transaction data

    // Wait for recent transactions data to load
    cy.wait('@api-get-api-transactions-recent');

    // Verify recent transactions list component
    cy.dataCy('recent-transactions-list')
      .should('be.visible')
      .within(() => {
        // Verify list header
        cy.dataCy('transactions-header').should('contain.text', 'Recent Transactions');
        cy.dataCy('view-all-transactions').should('be.visible');

        // Verify transaction items are present
        cy.get('[data-cy^="transaction-item-"]').should('have.length.at.least', 1);

        // Test each transaction item structure
        cy.get('[data-cy^="transaction-item-"]').each(($transaction) => {
          cy.wrap($transaction)
            .should('be.visible')
            .within(() => {
              // Verify transaction essential information
              cy.dataCy('transaction-description').should('be.visible').and('not.be.empty');
              cy.dataCy('transaction-amount').should('be.visible').and('match', /[\$\-\+]?[\d,]+\.\d{2}/);
              cy.dataCy('transaction-date').should('be.visible');
              cy.dataCy('transaction-status').should('be.visible');

              // Verify transaction type indicator
              cy.dataCy('transaction-type-icon').should('be.visible');
              
              // Verify account information
              cy.dataCy('transaction-account').should('be.visible');

              // F-006 Fraud Detection System - Security indicators
              cy.dataCy('security-status').should('be.visible');
            });
        });

        // Test specific transaction types
        cy.dataCy('transaction-item-0').within(() => {
          cy.dataCy('transaction-description').should('not.be.empty');
          cy.dataCy('transaction-amount').invoke('text').should('match', /^\$?[\d,]+\.\d{2}$/);
          cy.dataCy('transaction-status').should('contain.text', /^(Completed|Pending|Processing)$/);
        });
      });

    // Test transaction list interactivity
    cy.dataCy('transaction-item-0').click();
    cy.dataCy('transaction-details-modal').should('be.visible');
    
    // Verify transaction details modal content
    cy.dataCy('transaction-details-modal').within(() => {
      cy.dataCy('modal-title').should('contain.text', 'Transaction Details');
      cy.dataCy('transaction-id').should('be.visible');
      cy.dataCy('transaction-timestamp').should('be.visible');
      cy.dataCy('transaction-merchant').should('be.visible');
      cy.dataCy('transaction-category').should('be.visible');
      
      // F-002 AI-Powered Risk Assessment - Transaction risk score
      cy.dataCy('risk-assessment').should('be.visible');
      cy.dataCy('fraud-score').should('be.visible');
      
      // Close modal
      cy.dataCy('modal-close-button').click();
    });

    cy.dataCy('transaction-details-modal').should('not.exist');

    // Test transaction filtering functionality
    cy.dataCy('transaction-filter-button').click();
    cy.dataCy('filter-dropdown').should('be.visible');
    
    // Filter by transaction type
    cy.dataCy('filter-type-debit').click();
    cy.get('[data-cy^="transaction-item-"]').each(($transaction) => {
      cy.wrap($transaction).within(() => {
        cy.dataCy('transaction-amount').should('contain.text', '-');
      });
    });

    // Clear filters
    cy.dataCy('clear-filters').click();
    cy.get('[data-cy^="transaction-item-"]').should('have.length.at.least', 1);

    // Test "View All Transactions" functionality
    cy.dataCy('view-all-transactions').click();
    cy.url().should('include', '/transactions');
    cy.go('back');

    // Test transaction list refresh
    cy.dataCy('refresh-transactions').click();
    cy.dataCy('transactions-loading').should('be.visible');
    cy.dataCy('transactions-loading').should('not.exist');

    // Verify accessibility features
    cy.get('[data-cy^="transaction-item-"]').each(($transaction) => {
      cy.wrap($transaction)
        .should('have.attr', 'role', 'listitem')
        .and('have.attr', 'tabindex', '0');
    });

    // Test responsive behavior
    cy.viewport('mobile');
    cy.dataCy('recent-transactions-list').within(() => {
      cy.get('[data-cy^="transaction-item-"]').should('have.class', 'mobile-layout');
    });

    // Verify transaction security indicators
    cy.get('[data-cy^="transaction-item-"]').first().within(() => {
      cy.dataCy('security-status').should('have.class', 'secure');
      cy.dataCy('encryption-indicator').should('be.visible');
    });
  });

  // Additional test for overall dashboard performance and error handling
  it('should handle error states gracefully', () => {
    // Test API failure scenarios
    cy.interceptAPI('GET', '/api/dashboard/statistics', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    });

    // Reload page to trigger error state
    cy.reload();

    // Verify error handling
    cy.dataCy('dashboard-error-state').should('be.visible');
    cy.dataCy('error-message').should('contain.text', 'Unable to load dashboard data');
    cy.dataCy('retry-button').should('be.visible');

    // Test retry functionality
    cy.interceptAPI('GET', '/api/dashboard/statistics', {
      fixture: 'dashboard/statistics.json'
    });

    cy.dataCy('retry-button').click();
    cy.dataCy('dashboard-error-state').should('not.exist');
    cy.dataCy('statistics-cards-container').should('be.visible');
  });

  // Test for F-003 Regulatory Compliance audit logging
  it('should log user interactions for compliance audit', () => {
    // Verify audit logging is active
    cy.window().its('localStorage').invoke('getItem', 'auditSession').should('exist');

    // Perform trackable actions
    cy.dataCy('stat-card-total-balance').click();
    cy.dataCy('modal-close-button').click();
    
    cy.dataCy('action-transfer-funds').click();
    cy.go('back');

    // Verify audit logs are being created
    cy.window().then((win) => {
      const auditLogs = JSON.parse(win.localStorage.getItem('auditLogs') || '[]');
      expect(auditLogs).to.have.length.greaterThan(0);
      expect(auditLogs[0]).to.have.property('action');
      expect(auditLogs[0]).to.have.property('timestamp');
      expect(auditLogs[0]).to.have.property('userId');
    });
  });
});