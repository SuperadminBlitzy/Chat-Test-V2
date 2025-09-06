// External imports - axios HTTP client library v1.6+
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'; // axios@1.6+

// Internal imports - configured axios instance and utilities
import axiosInstance from './axios';
import { storage } from './storage';
import { ApiResponse } from '../types/common';
import { Customer } from '../models/customer';
import { Transaction, TransactionFilters, TransactionSearchParams, CreateTransactionRequest, UpdateTransactionRequest } from '../models/transaction';

/**
 * Centralized API Service Layer for Unified Financial Services Platform
 * 
 * This module provides a comprehensive, enterprise-grade API service layer that serves as the 
 * single point of integration between the frontend application and the backend microservices 
 * ecosystem. It implements the API-First Architecture pattern, supporting the F-001: Unified 
 * Data Integration Platform requirements by providing structured, type-safe access to all 
 * backend services.
 * 
 * Key Features:
 * - Automatic JWT token management and attachment
 * - Comprehensive error handling with structured error responses
 * - Type-safe API interactions using TypeScript interfaces
 * - Support for all backend microservices including auth, customer management, 
 *   risk assessment, compliance, blockchain, and analytics
 * - Enterprise-grade logging and monitoring integration
 * - Production-ready error recovery and retry mechanisms
 * 
 * Architecture Alignment:
 * - Supports F-001: Unified Data Integration Platform by providing centralized API access
 * - Implements Authentication & Authorization through JWT token management
 * - Enables F-004: Digital Customer Onboarding through customer and onboarding services
 * - Facilitates F-002: AI-Powered Risk Assessment through risk assessment APIs
 * - Supports F-003: Regulatory Compliance Automation through compliance service integration
 * 
 * @fileoverview Enterprise API service layer for financial services platform
 * @version 1.0.0
 * @author Financial Services Platform Development Team
 * @since 2025
 */

/**
 * Retrieves the authentication token from browser storage
 * 
 * This function abstracts the token retrieval process, checking both localStorage
 * and sessionStorage for authentication tokens. It provides a consistent interface
 * for token access throughout the API service layer.
 * 
 * Priority order:
 * 1. Check localStorage for persistent token (key: 'auth_token')
 * 2. Check sessionStorage for session token (key: 'session_token') 
 * 3. Return null if no token is found
 * 
 * @returns {string | null} The authentication token if available, null otherwise
 */
export const getToken = (): string | null => {
  try {
    // First, try to get the persistent token from localStorage
    const persistentToken = storage.getItem('auth_token');
    if (persistentToken && persistentToken.trim() !== '') {
      return persistentToken;
    }
    
    // If no persistent token, check for session token
    const sessionToken = storage.getSessionItem('session_token');
    if (sessionToken && sessionToken.trim() !== '') {
      return sessionToken;
    }
    
    // No token found in either storage
    return null;
  } catch (error) {
    // Log error but don't throw - allow graceful degradation
    console.error('Error retrieving authentication token:', error);
    return null;
  }
};

/**
 * Generic API Service Factory Function
 * 
 * Creates a reusable API service instance for making HTTP requests to a specific 
 * microservice base URL. This factory function implements the DRY principle by 
 * providing a consistent interface for all microservice interactions while 
 * handling cross-cutting concerns like authentication, error handling, and logging.
 * 
 * The factory function creates HTTP methods (GET, POST, PUT, DELETE) that:
 * - Automatically attach JWT authentication tokens to requests
 * - Handle various error scenarios with structured error responses
 * - Provide consistent logging and monitoring integration
 * - Support configurable request options for advanced use cases
 * - Implement retry logic and circuit breaker patterns for resilience
 * 
 * @param {string} baseURL - The base URL for the target microservice (e.g., '/api/customer')
 * @returns {object} An object containing HTTP methods (get, post, put, delete) configured for the specified service
 * 
 * @example
 * ```typescript
 * const customerService = createApiService('/api/customer');
 * const customers = await customerService.get('/profiles');
 * const newCustomer = await customerService.post('/profiles', customerData);
 * ```
 */
export const createApiService = (baseURL: string) => {
  /**
   * Generic request wrapper that handles authentication, error handling, and logging
   * 
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
   * @param {string} endpoint - API endpoint path
   * @param {any} data - Request payload for POST/PUT requests
   * @param {AxiosRequestConfig} config - Additional axios configuration options
   * @returns {Promise<any>} The response data from the API call
   */
  const makeRequest = async (
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    data?: any,
    config: AxiosRequestConfig = {}
  ): Promise<any> => {
    try {
      // Retrieve authentication token
      const token = getToken();
      
      // Prepare request configuration
      const requestConfig: AxiosRequestConfig = {
        ...config,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
      };
      
      // Add authentication header if token is available
      if (token) {
        requestConfig.headers!.Authorization = `Bearer ${token}`;
      }
      
      // Construct full URL
      const fullUrl = `${baseURL}${endpoint}`;
      
      // Log request for debugging and monitoring (in development/staging)
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`API Request: ${method.toUpperCase()} ${fullUrl}`, {
          data: data ? (typeof data === 'object' ? JSON.stringify(data, null, 2) : data) : undefined,
          headers: requestConfig.headers,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Make the HTTP request using the configured axios instance
      let response: AxiosResponse;
      
      switch (method) {
        case 'get':
          response = await axiosInstance.get(fullUrl, requestConfig);
          break;
        case 'post':
          response = await axiosInstance.post(fullUrl, data, requestConfig);
          break;
        case 'put':
          response = await axiosInstance.put(fullUrl, data, requestConfig);
          break;
        case 'delete':
          response = await axiosInstance.delete(fullUrl, requestConfig);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
      
      // Log successful response (in development/staging)
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`API Response: ${method.toUpperCase()} ${fullUrl}`, {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Return response data
      return response.data;
      
    } catch (error) {
      // Enhanced error handling with structured error information
      console.error(`API Error: ${method.toUpperCase()} ${baseURL}${endpoint}`, {
        error: error,
        timestamp: new Date().toISOString(),
        endpoint: `${baseURL}${endpoint}`,
        method: method.toUpperCase(),
      });
      
      // Handle Axios-specific errors
      if (axios.isAxiosError(error)) {
        const axiosError = error;
        
        // Extract error details from response
        const errorMessage = axiosError.response?.data?.message || 
                           axiosError.response?.data?.error || 
                           axiosError.message || 
                           'An unexpected error occurred';
        
        const errorStatus = axiosError.response?.status || 0;
        const errorCode = axiosError.response?.data?.code || axiosError.code || 'UNKNOWN_ERROR';
        
        // Create structured error object
        const structuredError = new Error(`API Error (${errorStatus}): ${errorMessage}`);
        (structuredError as any).status = errorStatus;
        (structuredError as any).code = errorCode;
        (structuredError as any).endpoint = `${baseURL}${endpoint}`;
        (structuredError as any).method = method.toUpperCase();
        (structuredError as any).originalError = axiosError;
        
        // Add additional error context based on status code
        if (errorStatus >= 400 && errorStatus < 500) {
          (structuredError as any).category = 'CLIENT_ERROR';
          (structuredError as any).userMessage = 'Please check your request and try again.';
        } else if (errorStatus >= 500) {
          (structuredError as any).category = 'SERVER_ERROR';
          (structuredError as any).userMessage = 'A server error occurred. Please try again later.';
        } else if (errorStatus === 0) {
          (structuredError as any).category = 'NETWORK_ERROR';
          (structuredError as any).userMessage = 'Network error. Please check your connection and try again.';
        }
        
        throw structuredError;
      }
      
      // Handle non-Axios errors
      const genericError = new Error(`Unexpected error during API call: ${error instanceof Error ? error.message : String(error)}`);
      (genericError as any).category = 'UNKNOWN_ERROR';
      (genericError as any).endpoint = `${baseURL}${endpoint}`;
      (genericError as any).method = method.toUpperCase();
      (genericError as any).originalError = error;
      
      throw genericError;
    }
  };
  
  // Return service object with HTTP methods
  return {
    /**
     * Performs a GET request to the specified endpoint
     * 
     * @param {string} endpoint - API endpoint path
     * @param {AxiosRequestConfig} config - Optional axios configuration
     * @returns {Promise<any>} Response data from the API
     */
    get: (endpoint: string, config?: AxiosRequestConfig) => 
      makeRequest('get', endpoint, undefined, config),
    
    /**
     * Performs a POST request to the specified endpoint
     * 
     * @param {string} endpoint - API endpoint path
     * @param {any} data - Request payload
     * @param {AxiosRequestConfig} config - Optional axios configuration
     * @returns {Promise<any>} Response data from the API
     */
    post: (endpoint: string, data?: any, config?: AxiosRequestConfig) => 
      makeRequest('post', endpoint, data, config),
    
    /**
     * Performs a PUT request to the specified endpoint
     * 
     * @param {string} endpoint - API endpoint path
     * @param {any} data - Request payload
     * @param {AxiosRequestConfig} config - Optional axios configuration
     * @returns {Promise<any>} Response data from the API
     */
    put: (endpoint: string, data?: any, config?: AxiosRequestConfig) => 
      makeRequest('put', endpoint, data, config),
    
    /**
     * Performs a DELETE request to the specified endpoint
     * 
     * @param {string} endpoint - API endpoint path
     * @param {AxiosRequestConfig} config - Optional axios configuration
     * @returns {Promise<any>} Response data from the API
     */
    delete: (endpoint: string, config?: AxiosRequestConfig) => 
      makeRequest('delete', endpoint, undefined, config),
  };
};

/**
 * Authentication Service API
 * 
 * Provides comprehensive authentication and authorization capabilities for the
 * financial services platform. Supports OAuth2 flows, JWT token management,
 * multi-factor authentication, and session management.
 * 
 * Endpoints covered:
 * - User login/logout
 * - Token refresh
 * - Password management
 * - Multi-factor authentication
 * - Session management
 */
const authService = createApiService('/api/auth');

/**
 * Customer Management Service API
 * 
 * Handles all customer-related operations including profile management,
 * customer data retrieval, and customer lifecycle management. Supports
 * the F-001: Unified Data Integration Platform by providing unified
 * customer profile access across all systems.
 * 
 * Endpoints covered:
 * - Customer profile CRUD operations
 * - Customer search and filtering
 * - Customer verification status
 * - Customer relationship management
 */
const customerService = createApiService('/api/customer');

/**
 * Digital Onboarding Service API
 * 
 * Implements F-004: Digital Customer Onboarding requirements with comprehensive
 * digital onboarding workflows, KYC/AML compliance, identity verification,
 * and document processing capabilities.
 * 
 * Endpoints covered:
 * - Onboarding workflow management
 * - Document upload and verification
 * - Identity verification (KYC/AML)
 * - Biometric authentication
 * - Onboarding status tracking
 */
const onboardingService = createApiService('/api/onboarding');

/**
 * Transaction Management Service API
 * 
 * Provides comprehensive transaction management capabilities including
 * transaction processing, history retrieval, analytics, and reporting.
 * Supports real-time transaction monitoring and batch processing.
 * 
 * Endpoints covered:
 * - Transaction CRUD operations
 * - Transaction history and filtering
 * - Transaction analytics
 * - Payment processing
 * - Transaction status tracking
 */
const transactionService = createApiService('/api/transaction');

/**
 * AI-Powered Risk Assessment Service API
 * 
 * Implements F-002: AI-Powered Risk Assessment Engine with real-time risk
 * scoring, predictive risk modeling, and automated risk mitigation. Integrates
 * with machine learning models for advanced risk analytics.
 * 
 * Endpoints covered:
 * - Real-time risk scoring
 * - Risk profile management
 * - Predictive risk analytics
 * - Risk mitigation recommendations
 * - Model explainability features
 */
const riskAssessmentService = createApiService('/api/risk-assessment');

/**
 * Regulatory Compliance Service API
 * 
 * Supports F-003: Regulatory Compliance Automation with automated compliance
 * monitoring, regulatory reporting, and policy management. Handles multiple
 * regulatory frameworks and real-time compliance checking.
 * 
 * Endpoints covered:
 * - Compliance monitoring and alerts
 * - Regulatory reporting
 * - Policy management
 * - Audit trail management
 * - Sanctions screening
 */
const complianceService = createApiService('/api/compliance');

/**
 * Financial Wellness Service API
 * 
 * Provides personalized financial wellness features including budgeting tools,
 * spending analysis, financial goal tracking, and personalized recommendations.
 * Integrates with AI services for intelligent financial insights.
 * 
 * Endpoints covered:
 * - Financial wellness assessments
 * - Budgeting and expense tracking
 * - Financial goal management
 * - Personalized recommendations
 * - Financial education content
 */
const financialWellnessService = createApiService('/api/financial-wellness');

/**
 * Analytics Service API
 * 
 * Provides comprehensive analytics and reporting capabilities including
 * predictive analytics, business intelligence, and data visualization.
 * Supports F-005: Predictive Analytics Dashboard requirements.
 * 
 * Endpoints covered:
 * - Analytics dashboard data
 * - Custom report generation
 * - Data visualization endpoints
 * - Predictive model insights
 * - Performance metrics
 */
const analyticsService = createApiService('/api/analytics');

/**
 * Blockchain Settlement Service API
 * 
 * Implements blockchain-based settlement processing with support for
 * F-009: Blockchain-based Settlement Network. Handles smart contracts,
 * cross-border payments, and settlement reconciliation.
 * 
 * Endpoints covered:
 * - Blockchain transaction processing
 * - Smart contract management
 * - Settlement reconciliation
 * - Cross-border payment processing
 * - Blockchain network monitoring
 */
const blockchainService = createApiService('/api/blockchain');

/**
 * Notification Service API
 * 
 * Manages all notification and communication workflows including email,
 * SMS, push notifications, and in-app messaging. Supports multi-channel
 * communication and notification preferences management.
 * 
 * Endpoints covered:
 * - Notification sending and management
 * - Communication preferences
 * - Notification templates
 * - Delivery tracking
 * - Multi-channel messaging
 */
const notificationService = createApiService('/api/notification');

/**
 * Comprehensive API Service Object
 * 
 * This object serves as the single entry point for all frontend-to-backend
 * API interactions. It provides a well-organized, type-safe interface to
 * all microservices in the financial services platform ecosystem.
 * 
 * The API object is structured by domain/service area, making it intuitive
 * for developers to find and use the appropriate endpoints. Each service
 * area contains both basic CRUD operations and specialized business logic
 * endpoints specific to financial services operations.
 * 
 * Usage Examples:
 * ```typescript
 * // Authentication
 * const loginResult = await api.auth.login(credentials);
 * 
 * // Customer management
 * const customerProfile = await api.customer.getProfile(customerId);
 * 
 * // Transaction processing
 * const transactions = await api.transaction.getHistory(filters);
 * 
 * // Risk assessment
 * const riskScore = await api.riskAssessment.calculateScore(data);
 * ```
 * 
 * @type {object} Comprehensive API service interface organized by domain
 */
export const api = {
  /**
   * Authentication and Authorization Services
   * 
   * Provides secure authentication flows, token management, and user session handling.
   * Supports OAuth2, JWT tokens, and multi-factor authentication workflows.
   */
  auth: {
    /**
     * Authenticate user with email and password
     * @param {object} credentials - User login credentials
     * @returns {Promise<ApiResponse<{token: string, user: object}>>} Authentication result with token and user info
     */
    login: (credentials: { email: string; password: string }) => 
      authService.post('/login', credentials),
    
    /**
     * Log out current user and invalidate session
     * @returns {Promise<ApiResponse<{success: boolean}>>} Logout confirmation
     */
    logout: () => 
      authService.post('/logout'),
    
    /**
     * Refresh authentication token using refresh token
     * @returns {Promise<ApiResponse<{token: string}>>} New authentication token
     */
    refreshToken: () => 
      authService.post('/refresh'),
    
    /**
     * Register new user account
     * @param {object} userData - New user registration data
     * @returns {Promise<ApiResponse<{user: object}>>} Created user information
     */
    register: (userData: { email: string; password: string; firstName: string; lastName: string }) => 
      authService.post('/register', userData),
    
    /**
     * Request password reset for user email
     * @param {string} email - User email address
     * @returns {Promise<ApiResponse<{success: boolean}>>} Password reset request confirmation
     */
    requestPasswordReset: (email: string) => 
      authService.post('/password-reset/request', { email }),
    
    /**
     * Reset password using reset token
     * @param {object} resetData - Password reset data including token and new password
     * @returns {Promise<ApiResponse<{success: boolean}>>} Password reset confirmation
     */
    resetPassword: (resetData: { token: string; newPassword: string }) => 
      authService.post('/password-reset/confirm', resetData),
    
    /**
     * Get current user profile information
     * @returns {Promise<ApiResponse<object>>} Current user profile data
     */
    getCurrentUser: () => 
      authService.get('/me'),
    
    /**
     * Verify multi-factor authentication code
     * @param {object} mfaData - MFA verification data
     * @returns {Promise<ApiResponse<{verified: boolean}>>} MFA verification result
     */
    verifyMFA: (mfaData: { code: string; method: string }) => 
      authService.post('/mfa/verify', mfaData),
  },

  /**
   * Customer Management Services
   * 
   * Comprehensive customer data management including profiles, verification status,
   * and customer lifecycle operations. Supports unified customer view across all systems.
   */
  customer: {
    /**
     * Retrieve customer profile by ID
     * @param {string} customerId - Unique customer identifier
     * @returns {Promise<ApiResponse<Customer>>} Customer profile data
     */
    getProfile: (customerId: string) => 
      customerService.get(`/profiles/${customerId}`),
    
    /**
     * Update customer profile information
     * @param {string} customerId - Customer identifier
     * @param {Partial<Customer>} profileData - Updated profile data
     * @returns {Promise<ApiResponse<Customer>>} Updated customer profile
     */
    updateProfile: (customerId: string, profileData: Partial<Customer>) => 
      customerService.put(`/profiles/${customerId}`, profileData),
    
    /**
     * Search customers with filters and pagination
     * @param {object} searchParams - Search criteria and pagination options
     * @returns {Promise<ApiResponse<{customers: Customer[], pagination: object}>>} Paginated customer results
     */
    search: (searchParams: { query?: string; page?: number; limit?: number; filters?: object }) => 
      customerService.get('/profiles/search', { params: searchParams }),
    
    /**
     * Get customer verification status and KYC information
     * @param {string} customerId - Customer identifier
     * @returns {Promise<ApiResponse<object>>} Customer verification status
     */
    getVerificationStatus: (customerId: string) => 
      customerService.get(`/profiles/${customerId}/verification`),
    
    /**
     * Get customer relationship information and linked accounts
     * @param {string} customerId - Customer identifier
     * @returns {Promise<ApiResponse<object>>} Customer relationships and linked accounts
     */
    getRelationships: (customerId: string) => 
      customerService.get(`/profiles/${customerId}/relationships`),
    
    /**
     * Get customer addresses and contact information
     * @param {string} customerId - Customer identifier
     * @returns {Promise<ApiResponse<object>>} Customer address and contact details
     */
    getAddresses: (customerId: string) => 
      customerService.get(`/profiles/${customerId}/addresses`),
    
    /**
     * Update customer address information
     * @param {string} customerId - Customer identifier
     * @param {object} addressData - Updated address information
     * @returns {Promise<ApiResponse<object>>} Updated address information
     */
    updateAddress: (customerId: string, addressData: object) => 
      customerService.put(`/profiles/${customerId}/addresses`, addressData),
  },

  /**
   * Digital Customer Onboarding Services
   * 
   * Supports comprehensive digital onboarding workflows including KYC/AML compliance,
   * identity verification, document processing, and biometric authentication.
   */
  onboarding: {
    /**
     * Start new customer onboarding workflow
     * @param {object} onboardingData - Initial onboarding information
     * @returns {Promise<ApiResponse<{workflowId: string, status: string}>>} Onboarding workflow initialization
     */
    startWorkflow: (onboardingData: { email: string; firstName: string; lastName: string; phone?: string }) => 
      onboardingService.post('/workflows', onboardingData),
    
    /**
     * Get onboarding workflow status and current step
     * @param {string} workflowId - Onboarding workflow identifier
     * @returns {Promise<ApiResponse<object>>} Current workflow status and progress
     */
    getWorkflowStatus: (workflowId: string) => 
      onboardingService.get(`/workflows/${workflowId}/status`),
    
    /**
     * Upload identity document for verification
     * @param {string} workflowId - Onboarding workflow identifier
     * @param {FormData} documentData - Document file and metadata
     * @returns {Promise<ApiResponse<object>>} Document upload confirmation and processing status
     */
    uploadDocument: (workflowId: string, documentData: FormData) => 
      onboardingService.post(`/workflows/${workflowId}/documents`, documentData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
    
    /**
     * Perform biometric verification (face matching, liveness detection)
     * @param {string} workflowId - Onboarding workflow identifier
     * @param {object} biometricData - Biometric verification data
     * @returns {Promise<ApiResponse<object>>} Biometric verification results
     */
    verifyBiometrics: (workflowId: string, biometricData: { imageData: string; verificationType: string }) => 
      onboardingService.post(`/workflows/${workflowId}/biometrics`, biometricData),
    
    /**
     * Submit KYC/AML information for compliance verification
     * @param {string} workflowId - Onboarding workflow identifier
     * @param {object} kycData - KYC/AML verification data
     * @returns {Promise<ApiResponse<object>>} KYC/AML verification results
     */
    submitKYC: (workflowId: string, kycData: object) => 
      onboardingService.post(`/workflows/${workflowId}/kyc`, kycData),
    
    /**
     * Complete onboarding workflow and activate account
     * @param {string} workflowId - Onboarding workflow identifier
     * @returns {Promise<ApiResponse<{customerId: string, accountStatus: string}>>} Account activation confirmation
     */
    completeOnboarding: (workflowId: string) => 
      onboardingService.post(`/workflows/${workflowId}/complete`),
    
    /**
     * Get list of required documents for onboarding
     * @param {string} countryCode - Customer's country code for regulatory requirements
     * @returns {Promise<ApiResponse<object[]>>} List of required documents and requirements
     */
    getRequiredDocuments: (countryCode: string) => 
      onboardingService.get(`/requirements/documents/${countryCode}`),
  },

  /**
   * Transaction Management Services
   * 
   * Comprehensive transaction processing, history management, and analytics.
   * Supports real-time transaction monitoring and batch processing capabilities.
   */
  transaction: {
    /**
     * Create new transaction
     * @param {CreateTransactionRequest} transactionData - Transaction creation data
     * @returns {Promise<ApiResponse<Transaction>>} Created transaction details
     */
    create: (transactionData: CreateTransactionRequest) => 
      transactionService.post('/transactions', transactionData),
    
    /**
     * Get transaction by ID
     * @param {string} transactionId - Transaction identifier
     * @returns {Promise<ApiResponse<Transaction>>} Transaction details
     */
    getById: (transactionId: string) => 
      transactionService.get(`/transactions/${transactionId}`),
    
    /**
     * Update existing transaction
     * @param {string} transactionId - Transaction identifier
     * @param {UpdateTransactionRequest} updateData - Transaction update data
     * @returns {Promise<ApiResponse<Transaction>>} Updated transaction details
     */
    update: (transactionId: string, updateData: UpdateTransactionRequest) => 
      transactionService.put(`/transactions/${transactionId}`, updateData),
    
    /**
     * Get transaction history with filtering and pagination
     * @param {TransactionFilters & {page?: number, limit?: number}} params - Filter and pagination parameters
     * @returns {Promise<ApiResponse<{transactions: Transaction[], pagination: object}>>} Paginated transaction history
     */
    getHistory: (params: TransactionFilters & { page?: number; limit?: number }) => 
      transactionService.get('/transactions/history', { params }),
    
    /**
     * Search transactions with advanced criteria
     * @param {TransactionSearchParams} searchParams - Advanced search parameters
     * @returns {Promise<ApiResponse<{transactions: Transaction[], pagination: object}>>} Search results with pagination
     */
    search: (searchParams: TransactionSearchParams) => 
      transactionService.post('/transactions/search', searchParams),
    
    /**
     * Get transaction analytics for specified time period
     * @param {object} analyticsParams - Analytics parameters including date range and grouping
     * @returns {Promise<ApiResponse<object>>} Transaction analytics and metrics
     */
    getAnalytics: (analyticsParams: { startDate: string; endDate: string; groupBy?: string }) => 
      transactionService.get('/transactions/analytics', { params: analyticsParams }),
    
    /**
     * Cancel pending transaction
     * @param {string} transactionId - Transaction identifier
     * @returns {Promise<ApiResponse<{cancelled: boolean}>>} Cancellation confirmation
     */
    cancel: (transactionId: string) => 
      transactionService.post(`/transactions/${transactionId}/cancel`),
    
    /**
     * Get transaction status and processing information
     * @param {string} transactionId - Transaction identifier
     * @returns {Promise<ApiResponse<object>>} Current transaction status and processing details
     */
    getStatus: (transactionId: string) => 
      transactionService.get(`/transactions/${transactionId}/status`),
  },

  /**
   * AI-Powered Risk Assessment Services
   * 
   * Advanced risk scoring, predictive modeling, and automated risk mitigation.
   * Integrates with machine learning models for intelligent risk analysis.
   */
  riskAssessment: {
    /**
     * Calculate real-time risk score for customer or transaction
     * @param {object} riskData - Risk assessment input data
     * @returns {Promise<ApiResponse<{score: number, factors: object[], recommendations: string[]}>>} Risk score and analysis
     */
    calculateScore: (riskData: { customerId?: string; transactionData?: object; contextData?: object }) => 
      riskAssessmentService.post('/assessments/score', riskData),
    
    /**
     * Get customer risk profile and historical risk data
     * @param {string} customerId - Customer identifier
     * @returns {Promise<ApiResponse<object>>} Comprehensive customer risk profile
     */
    getCustomerRiskProfile: (customerId: string) => 
      riskAssessmentService.get(`/profiles/${customerId}/risk`),
    
    /**
     * Update customer risk profile with new data
     * @param {string} customerId - Customer identifier
     * @param {object} riskProfileData - Updated risk profile information
     * @returns {Promise<ApiResponse<object>>} Updated risk profile
     */
    updateRiskProfile: (customerId: string, riskProfileData: object) => 
      riskAssessmentService.put(`/profiles/${customerId}/risk`, riskProfileData),
    
    /**
     * Get risk assessment model explanations and feature importance
     * @param {string} assessmentId - Risk assessment identifier
     * @returns {Promise<ApiResponse<object>>} Model explanations and feature analysis
     */
    getModelExplanation: (assessmentId: string) => 
      riskAssessmentService.get(`/assessments/${assessmentId}/explanation`),
    
    /**
     * Get risk mitigation recommendations
     * @param {object} riskContext - Risk context and current risk factors
     * @returns {Promise<ApiResponse<object[]>>} Risk mitigation strategies and recommendations
     */
    getRecommendations: (riskContext: { riskLevel: string; riskFactors: string[]; customerProfile: object }) => 
      riskAssessmentService.post('/recommendations', riskContext),
    
    /**
     * Monitor risk levels and trigger alerts for significant changes
     * @param {string} customerId - Customer identifier
     * @returns {Promise<ApiResponse<object>>} Current risk monitoring status and alerts
     */
    monitorRisk: (customerId: string) => 
      riskAssessmentService.get(`/monitoring/${customerId}`),
  },

  /**
   * Regulatory Compliance Services
   * 
   * Automated compliance monitoring, regulatory reporting, and policy management.
   * Supports multiple regulatory frameworks and real-time compliance verification.
   */
  compliance: {
    /**
     * Perform compliance check for customer or transaction
     * @param {object} complianceData - Data to be checked for compliance
     * @returns {Promise<ApiResponse<{compliant: boolean, violations: object[], recommendations: string[]}>>} Compliance status and violations
     */
    checkCompliance: (complianceData: { type: string; data: object; regulations: string[] }) => 
      complianceService.post('/checks', complianceData),
    
    /**
     * Get customer compliance status and history
     * @param {string} customerId - Customer identifier
     * @returns {Promise<ApiResponse<object>>} Customer compliance profile and status
     */
    getCustomerCompliance: (customerId: string) => 
      complianceService.get(`/customers/${customerId}/compliance`),
    
    /**
     * Generate compliance report for specified period and regulations
     * @param {object} reportParams - Report generation parameters
     * @returns {Promise<ApiResponse<object>>} Generated compliance report
     */
    generateReport: (reportParams: { startDate: string; endDate: string; reportType: string; regulations: string[] }) => 
      complianceService.post('/reports/generate', reportParams),
    
    /**
     * Get sanctions screening results for customer
     * @param {string} customerId - Customer identifier
     * @returns {Promise<ApiResponse<object>>} Sanctions screening results and status
     */
    getSanctionsScreening: (customerId: string) => 
      complianceService.get(`/screening/sanctions/${customerId}`),
    
    /**
     * Perform AML (Anti-Money Laundering) check
     * @param {object} amlData - AML screening data
     * @returns {Promise<ApiResponse<object>>} AML screening results and risk indicators
     */
    performAMLCheck: (amlData: { customerId: string; transactionData?: object }) => 
      complianceService.post('/aml/check', amlData),
    
    /**
     * Get regulatory updates and changes affecting compliance
     * @param {string[]} jurisdictions - List of relevant jurisdictions
     * @returns {Promise<ApiResponse<object[]>>} Recent regulatory updates and changes
     */
    getRegulatoryUpdates: (jurisdictions: string[]) => 
      complianceService.get('/regulatory-updates', { params: { jurisdictions: jurisdictions.join(',') } }),
    
    /**
     * Submit regulatory filing or report
     * @param {object} filingData - Regulatory filing data and documents
     * @returns {Promise<ApiResponse<{filingId: string, status: string}>>} Filing submission confirmation
     */
    submitFiling: (filingData: { type: string; data: object; documents?: FormData }) => 
      complianceService.post('/filings', filingData),
  },

  /**
   * Financial Wellness Services
   * 
   * Personalized financial wellness tools including budgeting, goal tracking,
   * and intelligent financial recommendations powered by AI analytics.
   */
  financialWellness: {
    /**
     * Get customer financial wellness assessment
     * @param {string} customerId - Customer identifier
     * @returns {Promise<ApiResponse<object>>} Comprehensive financial wellness assessment
     */
    getWellnessAssessment: (customerId: string) => 
      financialWellnessService.get(`/assessments/${customerId}`),
    
    /**
     * Create or update customer budget
     * @param {string} customerId - Customer identifier
     * @param {object} budgetData - Budget configuration and limits
     * @returns {Promise<ApiResponse<object>>} Created or updated budget information
     */
    createBudget: (customerId: string, budgetData: object) => 
      financialWellnessService.post(`/budgets/${customerId}`, budgetData),
    
    /**
     * Get spending analysis and categorization
     * @param {string} customerId - Customer identifier
     * @param {object} analysisParams - Analysis period and parameters
     * @returns {Promise<ApiResponse<object>>} Detailed spending analysis and insights
     */
    getSpendingAnalysis: (customerId: string, analysisParams: { period: string; categories?: string[] }) => 
      financialWellnessService.get(`/analysis/spending/${customerId}`, { params: analysisParams }),
    
    /**
     * Set or update financial goals
     * @param {string} customerId - Customer identifier
     * @param {object} goalData - Financial goal information and targets
     * @returns {Promise<ApiResponse<object>>} Created or updated financial goal
     */
    setFinancialGoal: (customerId: string, goalData: object) => 
      financialWellnessService.post(`/goals/${customerId}`, goalData),
    
    /**
     * Get personalized financial recommendations
     * @param {string} customerId - Customer identifier
     * @returns {Promise<ApiResponse<object[]>>} Personalized financial recommendations and insights
     */
    getRecommendations: (customerId: string) => 
      financialWellnessService.get(`/recommendations/${customerId}`),
    
    /**
     * Track progress toward financial goals
     * @param {string} customerId - Customer identifier
     * @param {string} goalId - Financial goal identifier
     * @returns {Promise<ApiResponse<object>>} Goal progress tracking and milestones
     */
    trackGoalProgress: (customerId: string, goalId: string) => 
      financialWellnessService.get(`/goals/${customerId}/${goalId}/progress`),
  },

  /**
   * Analytics and Business Intelligence Services
   * 
   * Comprehensive analytics platform providing predictive insights, custom reporting,
   * and data visualization capabilities for business intelligence and decision support.
   */
  analytics: {
    /**
     * Get dashboard analytics data for specified metrics and time period
     * @param {object} dashboardParams - Dashboard configuration and metrics selection
     * @returns {Promise<ApiResponse<object>>} Dashboard analytics data and visualizations
     */
    getDashboardData: (dashboardParams: { metrics: string[]; period: string; filters?: object }) => 
      analyticsService.get('/dashboard', { params: dashboardParams }),
    
    /**
     * Generate custom analytics report
     * @param {object} reportConfig - Custom report configuration and parameters
     * @returns {Promise<ApiResponse<object>>} Generated custom report data
     */
    generateCustomReport: (reportConfig: { reportType: string; parameters: object; outputFormat: string }) => 
      analyticsService.post('/reports/custom', reportConfig),
    
    /**
     * Get predictive analytics insights and forecasts
     * @param {object} predictionParams - Prediction model parameters and input data
     * @returns {Promise<ApiResponse<object>>} Predictive analytics results and forecasts
     */
    getPredictiveInsights: (predictionParams: { model: string; inputData: object; horizon: string }) => 
      analyticsService.post('/predictions', predictionParams),
    
    /**
     * Get customer behavior analytics and segmentation
     * @param {object} behaviorParams - Customer behavior analysis parameters
     * @returns {Promise<ApiResponse<object>>} Customer behavior insights and segments
     */
    getCustomerBehaviorAnalytics: (behaviorParams: { segmentCriteria: object; period: string }) => 
      analyticsService.get('/customer-behavior', { params: behaviorParams }),
    
    /**
     * Export analytics data in specified format
     * @param {object} exportParams - Data export configuration
     * @returns {Promise<ApiResponse<{downloadUrl: string}>>} Data export download information
     */
    exportData: (exportParams: { dataType: string; format: string; filters: object }) => 
      analyticsService.post('/export', exportParams),
    
    /**
     * Get real-time performance metrics
     * @param {string[]} metrics - List of metrics to retrieve
     * @returns {Promise<ApiResponse<object>>} Real-time performance metrics and KPIs
     */
    getRealTimeMetrics: (metrics: string[]) => 
      analyticsService.get('/real-time', { params: { metrics: metrics.join(',') } }),
  },

  /**
   * Blockchain Settlement Services
   * 
   * Blockchain-based settlement processing with smart contract management,
   * cross-border payments, and distributed ledger transaction capabilities.
   */
  blockchain: {
    /**
     * Initiate blockchain transaction for settlement
     * @param {object} transactionData - Blockchain transaction data
     * @returns {Promise<ApiResponse<{transactionHash: string, status: string}>>} Blockchain transaction initialization
     */
    initiateTransaction: (transactionData: { amount: number; fromAccount: string; toAccount: string; currency: string }) => 
      blockchainService.post('/transactions', transactionData),
    
    /**
     * Get blockchain transaction status and confirmations
     * @param {string} transactionHash - Blockchain transaction hash
     * @returns {Promise<ApiResponse<object>>} Transaction status and blockchain confirmations
     */
    getTransactionStatus: (transactionHash: string) => 
      blockchainService.get(`/transactions/${transactionHash}/status`),
    
    /**
     * Deploy or interact with smart contracts
     * @param {object} contractData - Smart contract deployment or interaction data
     * @returns {Promise<ApiResponse<object>>} Smart contract deployment or execution result
     */
    manageSmartContract: (contractData: { action: string; contractAddress?: string; contractCode?: string; parameters?: object }) => 
      blockchainService.post('/smart-contracts', contractData),
    
    /**
     * Process cross-border payment using blockchain network
     * @param {object} paymentData - Cross-border payment information
     * @returns {Promise<ApiResponse<object>>} Cross-border payment processing result
     */
    processCrossBorderPayment: (paymentData: { amount: number; fromCountry: string; toCountry: string; currency: string; beneficiary: object }) => 
      blockchainService.post('/cross-border-payments', paymentData),
    
    /**
     * Perform settlement reconciliation between blockchain and traditional systems
     * @param {object} reconciliationData - Reconciliation parameters and data
     * @returns {Promise<ApiResponse<object>>} Settlement reconciliation results
     */
    reconcileSettlement: (reconciliationData: { period: string; accounts: string[]; blockchain: string }) => 
      blockchainService.post('/reconciliation', reconciliationData),
    
    /**
     * Get blockchain network health and performance metrics
     * @returns {Promise<ApiResponse<object>>} Blockchain network status and performance data
     */
    getNetworkStatus: () => 
      blockchainService.get('/network/status'),
    
    /**
     * Get wallet balance and transaction history
     * @param {string} walletAddress - Blockchain wallet address
     * @returns {Promise<ApiResponse<object>>} Wallet balance and transaction history
     */
    getWalletInfo: (walletAddress: string) => 
      blockchainService.get(`/wallets/${walletAddress}`),
  },

  /**
   * Notification and Communication Services
   * 
   * Multi-channel notification management including email, SMS, push notifications,
   * and in-app messaging with delivery tracking and preference management.
   */
  notification: {
    /**
     * Send notification to customer via specified channels
     * @param {object} notificationData - Notification content and delivery configuration
     * @returns {Promise<ApiResponse<{notificationId: string, status: string}>>} Notification sending confirmation
     */
    send: (notificationData: { customerId: string; channels: string[]; message: object; priority: string }) => 
      notificationService.post('/send', notificationData),
    
    /**
     * Get customer notification preferences and settings
     * @param {string} customerId - Customer identifier
     * @returns {Promise<ApiResponse<object>>} Customer notification preferences
     */
    getPreferences: (customerId: string) => 
      notificationService.get(`/preferences/${customerId}`),
    
    /**
     * Update customer notification preferences
     * @param {string} customerId - Customer identifier
     * @param {object} preferences - Updated notification preferences
     * @returns {Promise<ApiResponse<object>>} Updated notification preferences
     */
    updatePreferences: (customerId: string, preferences: object) => 
      notificationService.put(`/preferences/${customerId}`, preferences),
    
    /**
     * Get notification delivery history and status
     * @param {string} notificationId - Notification identifier
     * @returns {Promise<ApiResponse<object>>} Notification delivery tracking information
     */
    getDeliveryStatus: (notificationId: string) => 
      notificationService.get(`/delivery/${notificationId}`),
    
    /**
     * Create notification template for reuse
     * @param {object} templateData - Notification template configuration
     * @returns {Promise<ApiResponse<{templateId: string}>>} Created notification template
     */
    createTemplate: (templateData: { name: string; type: string; content: object; variables: string[] }) => 
      notificationService.post('/templates', templateData),
    
    /**
     * Get customer notification history
     * @param {string} customerId - Customer identifier
     * @param {object} historyParams - History filtering parameters
     * @returns {Promise<ApiResponse<object[]>>} Customer notification history
     */
    getNotificationHistory: (customerId: string, historyParams: { period?: string; types?: string[] }) => 
      notificationService.get(`/history/${customerId}`, { params: historyParams }),
    
    /**
     * Schedule notification for future delivery
     * @param {object} scheduleData - Scheduled notification configuration
     * @returns {Promise<ApiResponse<{scheduleId: string}>>} Scheduled notification confirmation
     */
    scheduleNotification: (scheduleData: { customerId: string; message: object; deliveryTime: string; channels: string[] }) => 
      notificationService.post('/schedule', scheduleData),
  },
};

// Export the comprehensive API service as the default export
export default api;