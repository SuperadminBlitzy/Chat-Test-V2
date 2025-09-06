// External imports - testing framework and mocking utilities
import axios from 'axios'; // axios@1.6+
import MockAdapter from 'axios-mock-adapter'; // axios-mock-adapter@1.22.0

// Internal imports - services, types, and API client to be tested
import { getCustomers, getCustomerById, createCustomer, updateCustomer } from '../../src/services/customer-service';
import api from '../../src/lib/api';
import { Customer } from '../../src/models/customer';
import { ApiResponse } from '../../src/types/common';

/**
 * Comprehensive Unit Tests for Customer Service Module
 * 
 * This test suite validates the customer service layer functionality as part of the
 * F-004: Digital Customer Onboarding and F-001: Unified Data Integration Platform
 * requirements. It ensures that all customer-related API interactions are handled
 * correctly under various conditions including success and error scenarios.
 * 
 * Test Coverage:
 * - Customer retrieval operations (getCustomers, getCustomerById)
 * - Customer management operations (createCustomer, updateCustomer)
 * - Error handling and validation scenarios
 * - API response format validation
 * - Network error handling
 * - Authentication and authorization scenarios
 * 
 * Quality Standards:
 * - Comprehensive test coverage for all service functions
 * - Realistic mock data representing actual customer profiles
 * - Error scenario testing for robust error handling validation
 * - Type safety validation for all API responses
 * - Performance and reliability testing considerations
 * 
 * Compliance Alignment:
 * - Supports F-004: Digital Customer Onboarding validation workflows
 * - Validates F-001: Unified Data Integration Platform API consistency
 * - Ensures proper error handling for financial services compliance
 * - Validates data integrity and security requirements
 * 
 * @version 1.0.0
 * @author Financial Services Platform Test Team
 * @since 2025
 */

// Mock adapter instance for intercepting HTTP requests during testing
let mockAdapter: MockAdapter;

// Mock customer data for testing scenarios - represents realistic customer profiles
const mockCustomers: Customer[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
      dateOfBirth: '1985-06-15',
      nationality: 'US'
    },
    addresses: [
      {
        type: 'primary',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
        validFrom: '2025-01-01',
        isVerified: true
      }
    ],
    identityVerification: {
      kycStatus: 'VERIFIED',
      amlStatus: 'CLEARED',
      documents: [
        {
          type: 'DRIVERS_LICENSE',
          documentNumber: 'DL123456789',
          expiryDate: '2028-06-15',
          verificationDate: '2025-01-15',
          verificationMethod: 'AUTOMATED'
        }
      ],
      biometricData: {
        faceMatchScore: 0.95,
        livenessScore: 0.92,
        verificationTimestamp: '2025-01-15T10:30:00Z'
      }
    },
    riskProfile: {
      overallScore: 75,
      riskLevel: 'MEDIUM',
      lastAssessmentDate: '2025-01-15',
      riskFactors: []
    },
    compliance: {
      kycStatus: 'VERIFIED',
      amlStatus: 'CLEARED',
      pepStatus: 'NOT_PEP',
      sanctionsCheck: 'CLEARED'
    },
    metadata: {
      createdAt: '2025-01-15T09:00:00Z',
      updatedAt: '2025-01-15T10:30:00Z',
      version: 1,
      dataClassification: 'CONFIDENTIAL'
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    personalInfo: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-987-6543',
      dateOfBirth: '1990-03-22',
      nationality: 'US'
    },
    addresses: [
      {
        type: 'primary',
        street: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'US',
        validFrom: '2024-12-01',
        isVerified: true
      }
    ],
    identityVerification: {
      kycStatus: 'VERIFIED',
      amlStatus: 'CLEARED',
      documents: [
        {
          type: 'PASSPORT',
          documentNumber: 'P987654321',
          expiryDate: '2030-03-22',
          verificationDate: '2025-01-10',
          verificationMethod: 'BIOMETRIC'
        }
      ],
      biometricData: {
        faceMatchScore: 0.98,
        livenessScore: 0.94,
        verificationTimestamp: '2025-01-10T14:15:00Z'
      }
    },
    riskProfile: {
      overallScore: 85,
      riskLevel: 'LOW',
      lastAssessmentDate: '2025-01-10',
      riskFactors: []
    },
    compliance: {
      kycStatus: 'VERIFIED',
      amlStatus: 'CLEARED',
      pepStatus: 'NOT_PEP',
      sanctionsCheck: 'CLEARED'
    },
    metadata: {
      createdAt: '2025-01-10T08:00:00Z',
      updatedAt: '2025-01-10T14:15:00Z',
      version: 1,
      dataClassification: 'CONFIDENTIAL'
    }
  }
];

// Single customer for getCustomerById tests
const mockSingleCustomer: Customer = mockCustomers[0];

// Mock customer profile data for creation/update operations
const mockCustomerProfileData = {
  personalInfo: {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1-555-234-5678',
    dateOfBirth: '1988-09-12',
    nationality: 'US'
  },
  addresses: [
    {
      type: 'primary' as const,
      street: '789 Pine Street',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'US',
      validFrom: '2025-01-01',
      isVerified: false
    }
  ]
};

// Mock created customer response for create operations
const mockCreatedCustomer: Customer = {
  id: '550e8400-e29b-41d4-a716-446655440003',
  personalInfo: mockCustomerProfileData.personalInfo,
  addresses: mockCustomerProfileData.addresses,
  identityVerification: {
    kycStatus: 'PENDING',
    amlStatus: 'PENDING',
    documents: [],
    biometricData: {
      faceMatchScore: 0,
      livenessScore: 0,
      verificationTimestamp: ''
    }
  },
  riskProfile: {
    overallScore: 0,
    riskLevel: 'PENDING',
    lastAssessmentDate: '',
    riskFactors: []
  },
  compliance: {
    kycStatus: 'PENDING',
    amlStatus: 'PENDING',
    pepStatus: 'PENDING',
    sanctionsCheck: 'PENDING'
  },
  metadata: {
    createdAt: '2025-01-20T12:00:00Z',
    updatedAt: '2025-01-20T12:00:00Z',
    version: 1,
    dataClassification: 'CONFIDENTIAL'
  }
};

// Mock updated customer data for update operations
const mockUpdatedCustomerData = {
  personalInfo: {
    email: 'john.doe.updated@example.com',
    phone: '+1-555-987-6543'
  }
};

// Mock updated customer response
const mockUpdatedCustomer: Customer = {
  ...mockSingleCustomer,
  personalInfo: {
    ...mockSingleCustomer.personalInfo,
    ...mockUpdatedCustomerData.personalInfo
  },
  metadata: {
    ...mockSingleCustomer.metadata,
    updatedAt: '2025-01-20T15:30:00Z',
    version: 2
  }
};

/**
 * Main test suite for Customer Service functionality
 * 
 * Groups all customer service tests and provides setup/teardown for mock adapter.
 * This suite validates the customer service layer's integration with the API client
 * and ensures proper error handling across all customer management operations.
 */
describe('Customer Service', () => {
  /**
   * Test setup - Initialize mock adapter before each test
   * 
   * Creates a fresh MockAdapter instance to ensure test isolation
   * and prevent test interference. The mock adapter intercepts all
   * HTTP requests made by the axios instance used by the API client.
   */
  beforeEach(() => {
    // Create new MockAdapter instance for each test
    mockAdapter = new MockAdapter(api);
  });

  /**
   * Test cleanup - Restore mock adapter after each test
   * 
   * Restores the original axios behavior and cleans up any pending
   * mock configurations to ensure tests don't interfere with each other.
   * Essential for maintaining test isolation and preventing memory leaks.
   */
  afterEach(() => {
    // Restore original axios behavior and clean up mocks
    mockAdapter.restore();
  });

  /**
   * Test Suite: getCustomers Function
   * 
   * Validates the customer list retrieval functionality including:
   * - Successful customer list retrieval with proper data formatting
   * - Error handling for network failures and server errors
   * - Response structure validation for API consistency
   * - Empty result handling for edge cases
   */
  describe('getCustomers', () => {
    /**
     * Test Case: Successful Customer List Retrieval
     * 
     * Validates that getCustomers successfully retrieves and formats
     * customer data from the API, ensuring proper data structure and
     * successful response handling as per F-001 requirements.
     */
    it('should successfully fetch all customers and return formatted response', async () => {
      // Arrange: Mock successful API response for customer search
      const mockApiResponse = {
        data: {
          customers: mockCustomers,
          pagination: {
            page: 1,
            limit: 1000,
            total: 2,
            totalPages: 1
          }
        },
        metadata: {
          requestId: 'req_123456789',
          timestamp: '2025-01-20T12:00:00Z',
          dataSource: 'unified_customer_platform'
        }
      };

      // Mock the customer search API endpoint
      mockAdapter.onGet('/api/customer/profiles/search').reply(200, mockApiResponse);

      // Act: Call the getCustomers function
      const result = await getCustomers();

      // Assert: Validate response structure and data
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCustomers);
      expect(result.message).toContain('Successfully retrieved 2 customers');
      expect(result.errors).toBeNull();
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.pagination).toBeDefined();
      expect(result.metadata?.requestId).toBe('req_123456789');
      expect(result.metadata?.dataSource).toBe('unified_customer_platform');

      // Validate individual customer data structure
      result.data.forEach((customer: Customer) => {
        expect(customer).toHaveProperty('id');
        expect(customer).toHaveProperty('personalInfo');
        expect(customer).toHaveProperty('addresses');
        expect(customer).toHaveProperty('identityVerification');
        expect(customer).toHaveProperty('riskProfile');
        expect(customer).toHaveProperty('compliance');
        expect(customer).toHaveProperty('metadata');
      });
    });

    /**
     * Test Case: Network Error Handling
     * 
     * Validates that getCustomers properly handles network errors
     * and provides appropriate error messages and response structure
     * for reliable error handling in the application.
     */
    it('should handle network errors and return structured error response', async () => {
      // Arrange: Mock network error
      mockAdapter.onGet('/api/customer/profiles/search').networkError();

      // Act: Call the getCustomers function
      const result = await getCustomers();

      // Assert: Validate error response structure
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.message).toContain('Failed to retrieve customer list');
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].field).toBe('general');
      expect(result.errors![0].message).toContain('Network Error');
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.errorCategory).toBe('NETWORK_ERROR');
      expect(result.metadata?.operation).toBe('GET_CUSTOMERS');
    });

    /**
     * Test Case: Server Error Handling
     * 
     * Validates proper handling of server-side errors (5xx status codes)
     * and ensures appropriate error categorization and user-friendly
     * error messages for improved user experience.
     */
    it('should handle server errors (500) and return appropriate error response', async () => {
      // Arrange: Mock server error
      mockAdapter.onGet('/api/customer/profiles/search').reply(500, {
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });

      // Act: Call the getCustomers function
      const result = await getCustomers();

      // Assert: Validate server error response handling
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.message).toContain('Failed to retrieve customer list');
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
      expect(result.metadata?.errorCategory).toBe('SERVER_ERROR');
      expect(result.metadata?.errorStatus).toBe(500);
    });

    /**
     * Test Case: Empty Results Handling
     * 
     * Validates that getCustomers properly handles empty result sets
     * and returns appropriate success responses even when no customers
     * are found, ensuring consistent API behavior.
     */
    it('should handle empty customer list and return success response', async () => {
      // Arrange: Mock empty customer list response
      const mockEmptyResponse = {
        data: {
          customers: [],
          pagination: {
            page: 1,
            limit: 1000,
            total: 0,
            totalPages: 0
          }
        },
        metadata: {
          requestId: 'req_empty_123',
          timestamp: '2025-01-20T12:00:00Z',
          dataSource: 'unified_customer_platform'
        }
      };

      mockAdapter.onGet('/api/customer/profiles/search').reply(200, mockEmptyResponse);

      // Act: Call the getCustomers function
      const result = await getCustomers();

      // Assert: Validate empty results handling
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.message).toContain('Successfully retrieved 0 customers');
      expect(result.errors).toBeNull();
      expect(result.metadata?.pagination?.total).toBe(0);
    });
  });

  /**
   * Test Suite: getCustomerById Function
   * 
   * Validates individual customer retrieval functionality including:
   * - Successful customer profile retrieval by ID
   * - Customer not found (404) error handling
   * - Invalid ID parameter validation
   * - Authorization and access control validation
   */
  describe('getCustomerById', () => {
    /**
     * Test Case: Successful Customer Retrieval by ID
     * 
     * Validates that getCustomerById successfully retrieves a specific
     * customer profile by ID and returns properly formatted response
     * with complete customer information as per F-001 requirements.
     */
    it('should successfully fetch customer by ID and return complete profile', async () => {
      // Arrange: Mock successful customer profile API response
      const customerId = '550e8400-e29b-41d4-a716-446655440001';
      const mockApiResponse = {
        data: mockSingleCustomer,
        metadata: {
          requestId: 'req_customer_123',
          timestamp: '2025-01-20T12:30:00Z',
          dataSource: 'unified_customer_platform'
        }
      };

      // Mock the customer profile API endpoint
      mockAdapter.onGet(`/api/customer/profiles/${customerId}`).reply(200, mockApiResponse);

      // Act: Call the getCustomerById function
      const result = await getCustomerById(customerId);

      // Assert: Validate successful response structure and data
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSingleCustomer);
      expect(result.message).toContain(`Successfully retrieved customer profile for ID: ${customerId}`);
      expect(result.errors).toBeNull();
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.customerId).toBe(customerId);
      expect(result.metadata?.requestId).toBe('req_customer_123');
      expect(result.metadata?.operation).toBe('GET_CUSTOMER_BY_ID');

      // Validate complete customer profile structure
      expect(result.data.id).toBe(customerId);
      expect(result.data.personalInfo).toBeDefined();
      expect(result.data.personalInfo.firstName).toBe('John');
      expect(result.data.personalInfo.lastName).toBe('Doe');
      expect(result.data.personalInfo.email).toBe('john.doe@example.com');
      expect(result.data.identityVerification.kycStatus).toBe('VERIFIED');
      expect(result.data.addresses).toHaveLength(1);
      expect(result.data.riskProfile).toBeDefined();
      expect(result.data.compliance).toBeDefined();
      expect(result.data.metadata).toBeDefined();
    });

    /**
     * Test Case: Customer Not Found (404) Error Handling
     * 
     * Validates proper handling of customer not found scenarios
     * and ensures appropriate error messages and response structure
     * for non-existent customer ID requests.
     */
    it('should handle customer not found (404) and return appropriate error response', async () => {
      // Arrange: Mock 404 not found response
      const nonExistentCustomerId = '550e8400-e29b-41d4-a716-446655440999';
      
      mockAdapter.onGet(`/api/customer/profiles/${nonExistentCustomerId}`).reply(404, {
        message: 'Customer not found',
        code: 'CUSTOMER_NOT_FOUND'
      });

      // Act: Call the getCustomerById function
      const result = await getCustomerById(nonExistentCustomerId);

      // Assert: Validate 404 error response handling
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.data).toEqual({});
      expect(result.message).toContain(`Customer with ID '${nonExistentCustomerId}' was not found`);
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].field).toBe('customerId');
      expect(result.metadata?.customerId).toBe(nonExistentCustomerId);
      expect(result.metadata?.errorCategory).toBe('NOT_FOUND');
      expect(result.metadata?.errorStatus).toBe(404);
      expect(result.metadata?.operation).toBe('GET_CUSTOMER_BY_ID');
    });

    /**
     * Test Case: Invalid Customer ID Parameter Validation
     * 
     * Validates that getCustomerById properly validates input parameters
     * and returns appropriate validation errors for invalid or missing
     * customer IDs to ensure data integrity and user experience.
     */
    it('should validate customer ID parameter and return validation error for invalid input', async () => {
      // Test cases for invalid customer IDs
      const invalidIds = ['', '   ', null, undefined];

      for (const invalidId of invalidIds) {
        // Act: Call getCustomerById with invalid ID
        const result = await getCustomerById(invalidId as string);

        // Assert: Validate validation error response
        expect(result).toBeDefined();
        expect(result.success).toBe(false);
        expect(result.data).toEqual({});
        expect(result.message).toContain('Invalid customer ID provided');
        expect(result.errors).toBeDefined();
        expect(result.errors).toHaveLength(1);
        expect(result.errors![0].field).toBe('id');
        expect(result.errors![0].message).toContain('Customer ID is required');
        expect(result.metadata?.errorCategory).toBe('VALIDATION_ERROR');
        expect(result.metadata?.operation).toBe('GET_CUSTOMER_BY_ID');
      }
    });

    /**
     * Test Case: Access Denied (403) Error Handling
     * 
     * Validates proper handling of authorization errors when the user
     * does not have permission to access specific customer information,
     * ensuring security and access control compliance.
     */
    it('should handle access denied (403) errors and return appropriate response', async () => {
      // Arrange: Mock 403 forbidden response
      const restrictedCustomerId = '550e8400-e29b-41d4-a716-446655440001';
      
      mockAdapter.onGet(`/api/customer/profiles/${restrictedCustomerId}`).reply(403, {
        message: 'Access denied',
        code: 'INSUFFICIENT_PERMISSIONS'
      });

      // Act: Call the getCustomerById function
      const result = await getCustomerById(restrictedCustomerId);

      // Assert: Validate access denied error response
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.data).toEqual({});
      expect(result.message).toContain('You do not have permission to access this customer information');
      expect(result.errors).toBeDefined();
      expect(result.metadata?.errorCategory).toBe('ACCESS_DENIED');
      expect(result.metadata?.errorStatus).toBe(403);
    });
  });

  /**
   * Test Suite: createCustomer Function
   * 
   * Validates customer creation functionality including:
   * - Successful customer profile creation with complete data
   * - Input validation for required fields and data formats
   * - Duplicate customer detection and handling
   * - Business rule validation and compliance checking
   */
  describe('createCustomer', () => {
    /**
     * Test Case: Successful Customer Creation
     * 
     * Validates that createCustomer successfully creates a new customer
     * profile with valid data and returns properly formatted response
     * with created customer information and metadata.
     */
    it('should successfully create new customer and return created profile', async () => {
      // Arrange: Mock successful customer creation API response
      const mockApiResponse = {
        data: mockCreatedCustomer,
        metadata: {
          requestId: 'req_create_123',
          timestamp: '2025-01-20T12:00:00Z',
          dataSource: 'unified_customer_platform'
        }
      };

      // Mock the customer profile creation API endpoint
      mockAdapter.onPut('/api/customer/profiles/new').reply(200, mockApiResponse);

      // Act: Call the createCustomer function
      const result = await createCustomer(mockCustomerProfileData);

      // Assert: Validate successful creation response
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedCustomer);
      expect(result.message).toContain(`Customer account created successfully for ${mockCustomerProfileData.personalInfo.firstName} ${mockCustomerProfileData.personalInfo.lastName}`);
      expect(result.errors).toBeNull();
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.customerId).toBe(mockCreatedCustomer.id);
      expect(result.metadata?.requestId).toBe('req_create_123');
      expect(result.metadata?.operation).toBe('CREATE_CUSTOMER');
      expect(result.metadata?.nextSteps).toContain('identity_verification');
      expect(result.metadata?.nextSteps).toContain('risk_assessment');
      expect(result.metadata?.nextSteps).toContain('compliance_screening');

      // Validate created customer data structure
      expect(result.data.id).toBeDefined();
      expect(result.data.personalInfo.firstName).toBe(mockCustomerProfileData.personalInfo.firstName);
      expect(result.data.personalInfo.email).toBe(mockCustomerProfileData.personalInfo.email);
      expect(result.data.addresses).toHaveLength(1);
      expect(result.data.identityVerification.kycStatus).toBe('PENDING');
      expect(result.data.metadata.version).toBe(1);
    });

    /**
     * Test Case: Input Validation for Required Fields
     * 
     * Validates that createCustomer properly validates required fields
     * and returns appropriate validation errors for missing or invalid
     * customer data to ensure data integrity and compliance.
     */
    it('should validate required fields and return validation errors for incomplete data', async () => {
      // Test cases for invalid customer data
      const invalidCustomerData = [
        // Missing customer data entirely
        null,
        undefined,
        {},
        
        // Missing personal info
        { addresses: mockCustomerProfileData.addresses },
        
        // Missing required personal info fields
        {
          personalInfo: {
            lastName: 'Doe',
            email: 'test@example.com',
            dateOfBirth: '1990-01-01',
            nationality: 'US'
          },
          addresses: mockCustomerProfileData.addresses
        },
        
        // Invalid email format
        {
          personalInfo: {
            ...mockCustomerProfileData.personalInfo,
            email: 'invalid-email'
          },
          addresses: mockCustomerProfileData.addresses
        },
        
        // Missing addresses
        {
          personalInfo: mockCustomerProfileData.personalInfo,
          addresses: []
        }
      ];

      for (const invalidData of invalidCustomerData) {
        // Act: Call createCustomer with invalid data
        const result = await createCustomer(invalidData as any);

        // Assert: Validate validation error response
        expect(result).toBeDefined();
        expect(result.success).toBe(false);
        expect(result.data).toEqual({});
        expect(result.errors).toBeDefined();
        expect(result.errors!.length).toBeGreaterThan(0);
        expect(result.metadata?.errorCategory).toBe('VALIDATION_ERROR');
        expect(result.metadata?.operation).toBe('CREATE_CUSTOMER');
      }
    });

    /**
     * Test Case: Duplicate Customer Handling
     * 
     * Validates proper handling of duplicate customer creation attempts
     * and ensures appropriate error messages when a customer with the
     * same email address already exists in the system.
     */
    it('should handle duplicate customer creation (409) and return appropriate error', async () => {
      // Arrange: Mock 409 conflict response for duplicate customer
      mockAdapter.onPut('/api/customer/profiles/new').reply(409, {
        message: 'Customer with this email already exists',
        code: 'DUPLICATE_CUSTOMER'
      });

      // Act: Call the createCustomer function
      const result = await createCustomer(mockCustomerProfileData);

      // Assert: Validate duplicate customer error response
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.data).toEqual({});
      expect(result.message).toContain('A customer with this email address already exists');
      expect(result.errors).toBeDefined();
      expect(result.metadata?.errorCategory).toBe('DUPLICATE_CUSTOMER');
      expect(result.metadata?.errorStatus).toBe(409);
      expect(result.metadata?.operation).toBe('CREATE_CUSTOMER');
      expect(result.metadata?.email).toBe(mockCustomerProfileData.personalInfo.email);
    });

    /**
     * Test Case: Server Validation Error Handling
     * 
     * Validates proper handling of server-side validation errors (400)
     * and ensures appropriate error categorization and user guidance
     * for invalid customer data submissions.
     */
    it('should handle server validation errors (400) and return appropriate response', async () => {
      // Arrange: Mock 400 bad request response
      mockAdapter.onPut('/api/customer/profiles/new').reply(400, {
        message: 'Invalid customer data provided',
        code: 'VALIDATION_FAILED',
        details: ['Date of birth must be in the past', 'Phone number format is invalid']
      });

      // Act: Call the createCustomer function
      const result = await createCustomer(mockCustomerProfileData);

      // Assert: Validate server validation error response
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.data).toEqual({});
      expect(result.message).toContain('Invalid customer data provided');
      expect(result.errors).toBeDefined();
      expect(result.metadata?.errorCategory).toBe('VALIDATION_ERROR');
      expect(result.metadata?.errorStatus).toBe(400);
    });
  });

  /**
   * Test Suite: updateCustomer Function
   * 
   * Validates customer update functionality including:
   * - Successful customer profile updates with partial data
   * - Customer not found error handling for non-existent customers
   * - Input validation for update parameters and data formats
   * - Conflict resolution for concurrent update scenarios
   */
  describe('updateCustomer', () => {
    /**
     * Test Case: Successful Customer Update
     * 
     * Validates that updateCustomer successfully updates existing customer
     * profile with partial data and returns properly formatted response
     * with updated customer information and change metadata.
     */
    it('should successfully update existing customer and return updated profile', async () => {
      // Arrange: Mock successful customer update API response
      const customerId = '550e8400-e29b-41d4-a716-446655440001';
      const mockApiResponse = {
        data: mockUpdatedCustomer,
        metadata: {
          requestId: 'req_update_123',
          timestamp: '2025-01-20T15:30:00Z',
          dataSource: 'unified_customer_platform'
        }
      };

      // Mock the customer profile update API endpoint
      mockAdapter.onPut(`/api/customer/profiles/${customerId}`).reply(200, mockApiResponse);

      // Act: Call the updateCustomer function
      const result = await updateCustomer(customerId, mockUpdatedCustomerData);

      // Assert: Validate successful update response
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedCustomer);
      expect(result.message).toContain(`Customer profile updated successfully for ID: ${customerId}`);
      expect(result.errors).toBeNull();
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.customerId).toBe(customerId);
      expect(result.metadata?.requestId).toBe('req_update_123');
      expect(result.metadata?.operation).toBe('UPDATE_CUSTOMER');
      expect(result.metadata?.updatedFields).toContain('personalInfo');

      // Validate updated customer data
      expect(result.data.personalInfo.email).toBe(mockUpdatedCustomerData.personalInfo.email);
      expect(result.data.personalInfo.phone).toBe(mockUpdatedCustomerData.personalInfo.phone);
      expect(result.data.metadata.version).toBe(2);
      expect(result.data.metadata.updatedAt).toBe('2025-01-20T15:30:00Z');
    });

    /**
     * Test Case: Customer Not Found for Update
     * 
     * Validates proper handling of update attempts for non-existent
     * customers and ensures appropriate error messages and response
     * structure for invalid customer ID update requests.
     */
    it('should handle customer not found (404) during update and return error response', async () => {
      // Arrange: Mock 404 not found response for update
      const nonExistentCustomerId = '550e8400-e29b-41d4-a716-446655440999';
      
      mockAdapter.onPut(`/api/customer/profiles/${nonExistentCustomerId}`).reply(404, {
        message: 'Customer not found',
        code: 'CUSTOMER_NOT_FOUND'
      });

      // Act: Call the updateCustomer function
      const result = await updateCustomer(nonExistentCustomerId, mockUpdatedCustomerData);

      // Assert: Validate 404 error response for update
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.data).toEqual({});
      expect(result.message).toContain(`Customer with ID '${nonExistentCustomerId}' was not found`);
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
      expect(result.metadata?.customerId).toBe(nonExistentCustomerId);
      expect(result.metadata?.errorCategory).toBe('NOT_FOUND');
      expect(result.metadata?.errorStatus).toBe(404);
      expect(result.metadata?.operation).toBe('UPDATE_CUSTOMER');
    });

    /**
     * Test Case: Update Parameter Validation
     * 
     * Validates that updateCustomer properly validates input parameters
     * including customer ID and update data, and returns appropriate
     * validation errors for invalid or missing parameters.
     */
    it('should validate update parameters and return validation errors for invalid input', async () => {
      // Test invalid customer IDs
      const invalidIds = ['', '   ', null, undefined];
      
      for (const invalidId of invalidIds) {
        // Act: Call updateCustomer with invalid ID
        const result = await updateCustomer(invalidId as string, mockUpdatedCustomerData);

        // Assert: Validate ID validation error
        expect(result).toBeDefined();
        expect(result.success).toBe(false);
        expect(result.message).toContain('Valid customer ID is required');
        expect(result.errors![0].field).toBe('id');
        expect(result.metadata?.errorCategory).toBe('VALIDATION_ERROR');
      }

      // Test empty update data
      const validCustomerId = '550e8400-e29b-41d4-a716-446655440001';
      const emptyUpdateData = [null, undefined, {}];
      
      for (const emptyData of emptyUpdateData) {
        // Act: Call updateCustomer with empty update data
        const result = await updateCustomer(validCustomerId, emptyData as any);

        // Assert: Validate update data validation error
        expect(result).toBeDefined();
        expect(result.success).toBe(false);
        expect(result.message).toContain('Update data is required');
        expect(result.errors![0].field).toBe('customerData');
        expect(result.metadata?.errorCategory).toBe('VALIDATION_ERROR');
      }
    });

    /**
     * Test Case: Email Format Validation in Updates
     * 
     * Validates that updateCustomer properly validates email format
     * when email address is being updated and returns appropriate
     * validation errors for invalid email formats.
     */
    it('should validate email format in update data and return validation error for invalid email', async () => {
      // Arrange: Invalid email update data
      const customerId = '550e8400-e29b-41d4-a716-446655440001';
      const invalidEmailUpdate = {
        personalInfo: {
          email: 'invalid-email-format'
        }
      };

      // Act: Call updateCustomer with invalid email
      const result = await updateCustomer(customerId, invalidEmailUpdate);

      // Assert: Validate email format validation error
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.data).toEqual({});
      expect(result.message).toContain('Invalid email format provided');
      expect(result.errors).toBeDefined();
      expect(result.errors![0].field).toBe('personalInfo.email');
      expect(result.errors![0].message).toContain('A valid email address is required');
      expect(result.metadata?.errorCategory).toBe('VALIDATION_ERROR');
      expect(result.metadata?.operation).toBe('UPDATE_CUSTOMER');
    });

    /**
     * Test Case: Concurrent Update Conflict Handling
     * 
     * Validates proper handling of concurrent update conflicts (409)
     * when the customer profile has been modified by another user
     * and ensures appropriate error messages and resolution guidance.
     */
    it('should handle concurrent update conflicts (409) and return appropriate response', async () => {
      // Arrange: Mock 409 conflict response for concurrent updates
      const customerId = '550e8400-e29b-41d4-a716-446655440001';
      
      mockAdapter.onPut(`/api/customer/profiles/${customerId}`).reply(409, {
        message: 'Customer profile has been modified by another user',
        code: 'CONCURRENT_MODIFICATION'
      });

      // Act: Call the updateCustomer function
      const result = await updateCustomer(customerId, mockUpdatedCustomerData);

      // Assert: Validate conflict error response
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.data).toEqual({});
      expect(result.message).toContain('Conflict detected. The customer profile may have been updated by another user');
      expect(result.errors).toBeDefined();
      expect(result.metadata?.errorCategory).toBe('CONFLICT');
      expect(result.metadata?.errorStatus).toBe(409);
      expect(result.metadata?.operation).toBe('UPDATE_CUSTOMER');
    });

    /**
     * Test Case: Access Denied for Updates
     * 
     * Validates proper handling of authorization errors (403) when
     * the user does not have permission to update specific customer
     * profiles, ensuring security and access control compliance.
     */
    it('should handle access denied (403) for updates and return appropriate response', async () => {
      // Arrange: Mock 403 forbidden response for update
      const restrictedCustomerId = '550e8400-e29b-41d4-a716-446655440001';
      
      mockAdapter.onPut(`/api/customer/profiles/${restrictedCustomerId}`).reply(403, {
        message: 'Insufficient permissions to update customer',
        code: 'INSUFFICIENT_PERMISSIONS'
      });

      // Act: Call the updateCustomer function
      const result = await updateCustomer(restrictedCustomerId, mockUpdatedCustomerData);

      // Assert: Validate access denied error response
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.data).toEqual({});
      expect(result.message).toContain('You do not have permission to update this customer profile');
      expect(result.errors).toBeDefined();
      expect(result.metadata?.errorCategory).toBe('ACCESS_DENIED');
      expect(result.metadata?.errorStatus).toBe(403);
      expect(result.metadata?.operation).toBe('UPDATE_CUSTOMER');
    });
  });
});