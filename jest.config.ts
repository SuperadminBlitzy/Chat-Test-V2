import { createJestConfig } from 'next/jest'; // ^13.4.0
import { Config } from '@jest/types'; // ^29.6.3

// Create the base Next.js Jest configuration
const createJestConfigFunction = createJestConfig({
  // Path to your Next.js app directory
  dir: './',
});

// Custom Jest configuration for the financial services web application
const customJestConfig: Config.InitialOptions = {
  // Test environment configuration for React components
  testEnvironment: 'jsdom',
  
  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Module name mapping for path resolution and assets
  moduleNameMapping: {
    // Handle module aliases defined in tsconfig.json
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/store/(.*)$': '<rootDir>/src/store/$1',
    '^@/constants/(.*)$': '<rootDir>/src/constants/$1',
    
    // Handle CSS and asset imports
    '\\.(css|less|sass|scss|styl)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp)$': '<rootDir>/__mocks__/fileMock.js',
  },
  
  // File extensions to consider for module resolution
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Test file patterns and locations
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}',
    '<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}',
  ],
  
  // Files to ignore during testing
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
  ],
  
  // Transform configuration for TypeScript and JavaScript files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  
  // Files to ignore for transformation
  transformIgnorePatterns: [
    '/node_modules/(?!(.*\\.mjs$|@testing-library|uuid|nanoid|jose|@panva|preact|oidc-token-hash))',
  ],
  
  // Coverage configuration for code quality monitoring
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.config.{js,jsx,ts,tsx}',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
    '!src/pages/api/**/*',
    '!src/types/**/*',
    '!src/constants/**/*',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
  ],
  
  // Coverage reporting configuration
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
    'json-summary',
    'cobertura', // For CI/CD integration
  ],
  
  // Coverage thresholds for quality gates (enterprise standards)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Critical financial components require higher coverage
    './src/components/financial/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/services/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  
  // Global test configuration
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
  },
  
  // Test environment options for jsdom
  testEnvironmentOptions: {
    html: '<html lang="en"><body></body></html>',
    url: 'http://localhost:3000',
    userAgent: 'node.js',
  },
  
  // Maximum number of worker processes for parallel test execution
  maxWorkers: '50%',
  
  // Test timeout configuration (financial services may need longer timeouts)
  testTimeout: 10000,
  
  // Clear mocks between tests for test isolation
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  
  // Verbose output for detailed test results
  verbose: true,
  
  // Error handling and debugging configuration
  errorOnDeprecated: true,
  detectLeaks: false, // Set to true in CI for memory leak detection
  detectOpenHandles: false, // Set to true in CI for resource leak detection
  
  // Watch mode configuration for development
  watchman: true,
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/coverage/',
  ],
  
  // Module directories for dependency resolution
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  
  // Setup modules to run before the test framework is installed
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  
  // Snapshot serializers for consistent snapshot testing
  snapshotSerializers: ['enzyme-to-json/serializer'],
  
  // Custom resolver for handling complex module resolution
  resolver: undefined, // Can be configured for complex module resolution scenarios
  
  // Cache configuration for performance optimization
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  
  // Project-specific configuration for multi-project setups
  displayName: {
    name: 'WEB_FRONTEND',
    color: 'blue',
  },
  
  // Report configuration for CI/CD integration
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/test-results',
        outputName: 'jest-junit.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: 'false',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
    [
      'jest-html-reporters',
      {
        publicPath: '<rootDir>/coverage/html-report',
        filename: 'report.html',
        expand: true,
      },
    ],
  ],
  
  // Force exit after test completion (useful for CI environments)
  forceExit: false,
  
  // Notify configuration for watch mode
  notify: false,
  notifyMode: 'failure-change',
  
  // Bail configuration for failing fast in CI
  bail: 0, // Set to 1 or true in CI to fail fast
  
  // Silent mode configuration
  silent: false,
  
  // Custom test result processor for advanced reporting
  testResultsProcessor: undefined,
  
  // Collect coverage from these files even if they're not tested
  forceCoverageMatch: [
    '**/src/utils/critical-*.{js,ts}',
    '**/src/services/financial-*.{js,ts}',
  ],
};

// Export the configuration by merging Next.js config with custom config
export default createJestConfigFunction(customJestConfig);