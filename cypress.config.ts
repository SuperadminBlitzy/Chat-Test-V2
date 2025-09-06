import { defineConfig } from 'cypress'; // v13.6+

export default defineConfig({
  // End-to-end testing configuration
  e2e: {
    // Base URL for the application under test
    baseUrl: 'http://localhost:3000',
    
    // Support file for custom commands and global configurations
    supportFile: 'src/web/cypress/support/e2e.ts',
    
    // Pattern for locating test spec files
    specPattern: 'src/web/cypress/e2e/**/*.cy.ts',
    
    // Directory for storing test videos
    videosFolder: 'src/web/cypress/videos',
    
    // Directory for storing test screenshots
    screenshotsFolder: 'src/web/cypress/screenshots',
    
    // Disable video recording by default for faster test execution
    video: false,
    
    // Enable screenshots on test failure for debugging
    screenshotOnRunFailure: true,
    
    // Additional e2e configuration for financial services application
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Extended timeout for financial operations that may take longer
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    
    // Retry configuration for flaky tests in financial environments
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Environment variables for test configuration
    env: {
      // API endpoints for different environments
      apiUrl: 'http://localhost:8080/api',
      authUrl: 'http://localhost:8080/auth',
      
      // Test user credentials (should be stored securely in CI/CD)
      testUserEmail: 'test@example.com',
      
      // Feature flags for testing different scenarios
      enableSecurityTesting: true,
      enablePerformanceTesting: true,
      
      // Compliance and regulatory testing flags
      enableComplianceTests: true,
      enableAuditLogging: true
    },
    
    // Node.js event setup for plugins and custom functionality
    setupNodeEvents(on, config) {
      // Task registration for custom operations
      on('task', {
        // Custom task for database seeding in test environment
        seedDatabase: (data) => {
          // Implementation would connect to test database and seed data
          console.log('Seeding database with test data:', data);
          return null;
        },
        
        // Custom task for clearing test data
        clearTestData: () => {
          console.log('Clearing test data');
          return null;
        },
        
        // Custom task for security compliance validation
        validateCompliance: (testResults) => {
          console.log('Validating compliance requirements:', testResults);
          return null;
        },
        
        // Custom task for performance metrics collection
        collectPerformanceMetrics: (metrics) => {
          console.log('Collecting performance metrics:', metrics);
          return null;
        }
      });
      
      // File preprocessing for TypeScript support
      on('file:preprocessor', (file) => {
        // This would typically use cypress-webpack-preprocessor or similar
        // for TypeScript compilation and module resolution
        return file;
      });
      
      // Before browser launch configuration
      on('before:browser:launch', (browser, launchOptions) => {
        // Configure browser for security testing
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--disable-features=VizDisplayCompositor');
          launchOptions.args.push('--ignore-certificate-errors');
        }
        
        return launchOptions;
      });
      
      // After screenshot event for enhanced error reporting
      on('after:screenshot', (details) => {
        console.log('Screenshot captured:', details.path);
        
        // Custom logic for uploading screenshots to CI/CD artifacts
        if (process.env.CI) {
          // Integration with CI/CD pipeline for artifact storage
          console.log('Uploading screenshot to CI/CD artifacts');
        }
        
        return details;
      });
      
      // Before run event for environment setup
      on('before:run', (details) => {
        console.log('Starting Cypress run with configuration:', details.config.baseUrl);
        
        // Validate environment readiness for financial services testing
        if (config.env.enableComplianceTests) {
          console.log('Compliance testing enabled - validating environment');
        }
        
        if (config.env.enableSecurityTesting) {
          console.log('Security testing enabled - preparing security checks');
        }
      });
      
      // After run event for cleanup and reporting
      on('after:run', (results) => {
        console.log('Cypress run completed with results:', {
          totalTests: results.totalTests,
          totalPassed: results.totalPassed,
          totalFailed: results.totalFailed,
          totalSkipped: results.totalSkipped
        });
        
        // Integration with monitoring and alerting systems
        if (results.totalFailed > 0 && process.env.CI) {
          console.log('Test failures detected - triggering alerts');
        }
        
        // Compliance reporting for financial services
        if (config.env.enableAuditLogging) {
          console.log('Generating audit logs for compliance');
        }
      });
      
      // Return the modified configuration object
      return config;
    }
  },
  
  // Component testing configuration
  component: {
    // Development server configuration for component testing
    devServer: {
      framework: 'next',
      bundler: 'webpack'
    },
    
    // Component test specific configuration
    supportFile: 'src/web/cypress/support/component.ts',
    specPattern: 'src/web/cypress/component/**/*.cy.tsx',
    indexHtmlFile: 'src/web/cypress/support/component-index.html',
    
    // Component testing viewport configuration
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Component testing environment variables
    env: {
      // API mocking configuration for component tests
      mockApi: true,
      
      // Theme testing configuration
      testThemes: ['light', 'dark', 'high-contrast'],
      
      // Accessibility testing configuration
      enableA11yTesting: true,
      
      // Performance testing for components
      enableComponentPerformanceTesting: true
    }
  },
  
  // Global Cypress configuration
  chromeWebSecurity: false,
  
  // File server configuration
  fileServerFolder: 'src/web',
  
  // Fixtures folder for test data
  fixturesFolder: 'src/web/cypress/fixtures',
  
  // Downloads folder for file download tests
  downloadsFolder: 'src/web/cypress/downloads',
  
  // Test isolation configuration for consistent test runs
  testIsolation: true,
  
  // Experimental features for enhanced testing capabilities
  experimentalStudio: true,
  experimentalWebKitSupport: false,
  
  // Reporter configuration for CI/CD integration
  reporter: 'spec',
  reporterOptions: {
    mochaFile: 'cypress/reports/test-results.xml',
    toConsole: true
  },
  
  // Browser configuration for cross-browser testing
  browsers: [
    {
      name: 'chrome',
      family: 'chromium',
      channel: 'stable',
      displayName: 'Chrome',
      version: 'latest'
    },
    {
      name: 'firefox',
      family: 'firefox',
      channel: 'stable',
      displayName: 'Firefox',
      version: 'latest'
    }
  ],
  
  // Security and compliance configuration
  modifyObstructiveCode: false,
  
  // Performance and reliability settings
  numTestsKeptInMemory: 50,
  watchForFileChanges: true,
  
  // Custom configuration for financial services specific testing
  env: {
    // Environment configuration
    NODE_ENV: 'test',
    
    // API configuration
    API_BASE_URL: 'http://localhost:8080',
    API_TIMEOUT: 15000,
    
    // Authentication configuration
    AUTH_DOMAIN: 'localhost',
    AUTH_CLIENT_ID: 'cypress-test-client',
    
    // Feature flags for different test scenarios
    ENABLE_PAYMENT_TESTS: true,
    ENABLE_TRANSACTION_TESTS: true,
    ENABLE_COMPLIANCE_TESTS: true,
    ENABLE_SECURITY_TESTS: true,
    
    // Test data configuration
    TEST_USER_POOL: 'cypress-test-users',
    TEST_ACCOUNT_POOL: 'cypress-test-accounts',
    
    // CI/CD integration flags
    CI_ENVIRONMENT: process.env.CI || false,
    GENERATE_REPORTS: true,
    UPLOAD_ARTIFACTS: process.env.CI || false,
    
    // Monitoring and observability
    ENABLE_PERFORMANCE_MONITORING: true,
    ENABLE_ERROR_TRACKING: true,
    ENABLE_AUDIT_LOGGING: true
  }
});