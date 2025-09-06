/**
 * Compliance Service Module
 * 
 * This service is responsible for handling all interactions with compliance-related 
 * backend services within the Unified Financial Services Platform. It provides 
 * comprehensive functions for fetching compliance reports, regulatory rules, 
 * performing Anti-Money Laundering (AML) checks, and managing compliance checks.
 * 
 * The service implements F-003: Regulatory Compliance Automation requirements
 * by providing automated compliance monitoring, real-time regulatory change 
 * detection, and streamlined compliance reporting processes.
 * 
 * Key Features:
 * - Automated compliance report generation and retrieval
 * - Real-time regulatory rule monitoring with 24-hour update cycles
 * - Comprehensive AML screening and risk assessment capabilities
 * - Multi-framework compliance support (PSD3, PSR, Basel III/IV, GDPR, SOX)
 * - Enterprise-grade error handling and audit trail management
 * - Type-safe API interactions with structured error responses
 * 
 * Architecture Alignment:
 * - Supports F-003-RQ-001: Real-time dashboards with multi-framework mapping
 * - Implements F-003-RQ-002: Automated policy updates within 24 hours
 * - Enables F-003-RQ-003: Continuous compliance status monitoring
 * - Facilitates F-004: Digital Customer Onboarding through KYC/AML compliance
 * 
 * Security Considerations:
 * - All API calls include automatic JWT token authentication
 * - Sensitive compliance data is encrypted in transit and at rest
 * - Comprehensive audit logging for all compliance operations
 * - Role-based access control for compliance data access
 * 
 * @fileoverview Enterprise compliance service for regulatory automation
 * @version 1.0.0
 * @author Financial Services Platform Development Team
 * @since 2025
 */

// External imports - No external dependencies required for this service

// Internal imports - API client and compliance data models
import api from '../lib/api'; // Centralized API service layer
import { 
  AmlCheckRequest, 
  AmlCheckResponse, 
  ComplianceCheck, 
  ComplianceReport, 
  RegulatoryRule 
} from '../models/compliance'; // Compliance data type definitions

/**
 * Request structure for Anti-Money Laundering (AML) checks
 * 
 * This interface defines the data structure required to initiate an AML check
 * for customer verification during onboarding or ongoing monitoring processes.
 * 
 * Supports F-004: Digital Customer Onboarding KYC/AML requirements and
 * Bank Secrecy Act (BSA) compliance obligations.
 * 
 * @interface AmlCheckRequest
 */
export interface AmlCheckRequest {
  /**
   * Unique identifier of the customer to be screened
   * Links the AML check to the customer profile for audit trail purposes
   * 
   * @type {string}
   * @example "CUST-2025-567890"
   */
  customerId: string;

  /**
   * Type of AML check to be performed
   * Determines the screening intensity and databases to be checked
   * 
   * - STANDARD: Basic AML screening against primary watchlists
   * - ENHANCED: Enhanced due diligence with expanded screening
   * - TRANSACTION: Transaction-specific AML monitoring
   * 
   * @type {'STANDARD' | 'ENHANCED' | 'TRANSACTION'}
   */
  checkType: 'STANDARD' | 'ENHANCED' | 'TRANSACTION';

  /**
   * Optional transaction data for transaction-specific AML checks
   * Required when checkType is 'TRANSACTION'
   * 
   * @type {object}
   * @optional
   */
  transactionData?: {
    /** Transaction amount in base currency */
    amount: number;
    /** Transaction currency code (ISO 4217) */
    currency: string;
    /** Source country for cross-border transaction monitoring */
    sourceCountry?: string;
    /** Destination country for cross-border transaction monitoring */
    destinationCountry?: string;
    /** Transaction purpose or category */
    purpose?: string;
  };

  /**
   * Optional metadata for enhanced screening capabilities
   * Provides additional context for risk assessment algorithms
   * 
   * @type {object}
   * @optional
   */
  metadata?: {
    /** Customer risk profile from previous assessments */
    riskProfile?: string;
    /** Geographic location of the customer */
    location?: string;
    /** Business relationship type with the customer */
    relationshipType?: string;
    /** Additional screening parameters */
    additionalScreening?: string[];
  };
}

/**
 * Response structure for Anti-Money Laundering (AML) check results
 * 
 * This interface defines the comprehensive response data returned from
 * an AML screening operation, including risk assessment, screening results,
 * and compliance recommendations.
 * 
 * @interface AmlCheckResponse
 */
export interface AmlCheckResponse {
  /**
   * Unique identifier for the completed AML check
   * Used for tracking, audit trail, and future reference
   * 
   * @type {string}
   * @example "AML-CHK-2025-001234"
   */
  checkId: string;

  /**
   * Customer identifier that was screened
   * Links back to the original request for audit purposes
   * 
   * @type {string}
   * @example "CUST-2025-567890"
   */
  customerId: string;

  /**
   * Overall result status of the AML check
   * Determines the next steps in the compliance workflow
   * 
   * - CLEARED: Customer passed AML screening, proceed with onboarding
   * - FLAGGED: Potential issues identified, manual review required
   * - BLOCKED: High-risk customer, onboarding should be declined
   * - PENDING: Check in progress, awaiting additional data or review
   * 
   * @type {'CLEARED' | 'FLAGGED' | 'BLOCKED' | 'PENDING'}
   */
  status: 'CLEARED' | 'FLAGGED' | 'BLOCKED' | 'PENDING';

  /**
   * Risk level assessment based on AML screening results
   * Supports risk-based onboarding and enhanced due diligence decisions
   * 
   * - LOW: Minimal risk, standard processing acceptable
   * - MEDIUM: Moderate risk, additional verification recommended
   * - HIGH: High risk, enhanced due diligence required
   * - CRITICAL: Critical risk, immediate escalation and manual review
   * 
   * @type {'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'}
   */
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  /**
   * Detailed screening results from various AML databases and watchlists
   * Provides transparency into the screening process and findings
   * 
   * @type {object}
   */
  screeningResults: {
    /** Results from sanctions list screening */
    sanctionsLists: {
      /** Whether any matches were found on sanctions lists */
      matchFound: boolean;
      /** List of sanctions databases checked */
      databasesChecked: string[];
      /** Details of any matches found */
      matches: Array<{
        /** Name of the sanctions list where match was found */
        listName: string;
        /** Confidence score of the match (0-100) */
        confidence: number;
        /** Additional details about the match */
        details: string;
      }>;
    };

    /** Results from Politically Exposed Persons (PEP) screening */
    pepScreening: {
      /** Whether customer is identified as a PEP */
      isPep: boolean;
      /** PEP risk level if applicable */
      pepRiskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
      /** Details of PEP status */
      pepDetails?: string;
    };

    /** Results from adverse media screening */
    adverseMedia: {
      /** Whether negative media coverage was found */
      adverseMediaFound: boolean;
      /** Summary of adverse media findings */
      summary?: string;
      /** Media sources and severity assessment */
      findings?: Array<{
        /** Media source */
        source: string;
        /** Severity level of the finding */
        severity: 'LOW' | 'MEDIUM' | 'HIGH';
        /** Brief description of the finding */
        description: string;
      }>;
    };
  };

  /**
   * Detailed explanation of the AML check results
   * Provides human-readable summary for compliance officers
   * 
   * @type {string}
   * @example "Customer cleared against all AML watchlists. No PEP matches. No adverse media findings."
   */
  details: string;

  /**
   * Recommended next actions based on AML check results
   * Guides compliance officers on appropriate follow-up steps
   * 
   * @type {string[]}
   * @example ["PROCEED_WITH_ONBOARDING", "COLLECT_ADDITIONAL_DOCUMENTS", "MANUAL_REVIEW_REQUIRED"]
   */
  recommendations: string[];

  /**
   * Timestamp when the AML check was completed
   * Supports audit trail and compliance timeline requirements
   * 
   * @type {string}
   * @format ISO 8601 datetime string
   * @example "2025-01-15T10:30:00.000Z"
   */
  completedAt: string;

  /**
   * Validity period for the AML check results
   * Indicates when the check should be renewed for ongoing monitoring
   * 
   * @type {string}
   * @format ISO 8601 datetime string
   * @example "2025-04-15T10:30:00.000Z"
   */
  validUntil: string;
}

/**
 * Retrieves a comprehensive list of compliance reports from the backend service.
 * 
 * This function implements F-003-RQ-003: Compliance reporting requirements by
 * providing access to continuous compliance assessments and status monitoring
 * across all operational units.
 * 
 * The function supports multiple compliance frameworks including:
 * - SOX (Sarbanes-Oxley) quarterly and annual reports
 * - PCI DSS (Payment Card Industry Data Security Standard) reports
 * - GDPR (General Data Protection Regulation) compliance reports
 * - Basel III/IV regulatory capital and risk reports
 * - Custom regulatory framework reports based on jurisdiction
 * 
 * Features:
 * - Real-time access to compliance report catalog
 * - Supports multiple report formats (PDF, CSV, JSON)
 * - Automatic report status tracking and lifecycle management
 * - Secure access with role-based permissions
 * - Comprehensive error handling with structured error responses
 * 
 * @async
 * @function getComplianceReports
 * @returns {Promise<ComplianceReport[]>} A promise that resolves to an array of compliance reports
 * 
 * @throws {Error} Throws structured error for API failures, network issues, or authentication problems
 * 
 * @example
 * ```typescript
 * try {
 *   const reports = await getComplianceReports();
 *   console.log(`Retrieved ${reports.length} compliance reports`);
 *   
 *   // Filter for SOX reports
 *   const soxReports = reports.filter(report => 
 *     report.name.toLowerCase().includes('sox')
 *   );
 * } catch (error) {
 *   console.error('Failed to retrieve compliance reports:', error.message);
 * }
 * ```
 * 
 * @since 1.0.0
 */
export const getComplianceReports = async (): Promise<ComplianceReport[]> => {
  try {
    // Log the compliance reports retrieval attempt for audit purposes
    console.info('Retrieving compliance reports from backend service', {
      timestamp: new Date().toISOString(),
      endpoint: '/compliance/reports',
      method: 'GET',
    });

    // Make GET request to the compliance reports endpoint using the centralized API client
    // The api.compliance service automatically handles JWT authentication, error handling,
    // and request/response logging for enterprise compliance and audit requirements
    const response = await api.compliance.get('/reports');

    // Validate the response structure to ensure data integrity
    if (!response || !Array.isArray(response)) {
      throw new Error('Invalid response format: Expected array of compliance reports');
    }

    // Log successful retrieval for audit trail and monitoring
    console.info('Successfully retrieved compliance reports', {
      timestamp: new Date().toISOString(),
      reportCount: response.length,
      reportTypes: response.map(report => report.name).slice(0, 5), // Log first 5 report names
    });

    // Return the array of compliance reports with full type safety
    return response as ComplianceReport[];

  } catch (error) {
    // Enhanced error handling with detailed logging for compliance audit requirements
    console.error('Failed to retrieve compliance reports', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      endpoint: '/compliance/reports',
      method: 'GET',
    });

    // Re-throw with enhanced error context for upstream error handling
    if (error instanceof Error) {
      // Preserve original error while adding context
      const enhancedError = new Error(`Compliance reports retrieval failed: ${error.message}`);
      (enhancedError as any).originalError = error;
      (enhancedError as any).endpoint = '/compliance/reports';
      (enhancedError as any).method = 'GET';
      (enhancedError as any).timestamp = new Date().toISOString();
      throw enhancedError;
    }

    // Handle non-Error objects
    throw new Error(`Unexpected error during compliance reports retrieval: ${String(error)}`);
  }
};

/**
 * Retrieves a comprehensive list of regulatory rules from the backend service.
 * 
 * This function implements F-003-RQ-001: Regulatory change monitoring requirements
 * by providing real-time access to regulatory rules with multi-framework mapping
 * and unified risk scoring capabilities.
 * 
 * The function supports monitoring of multiple regulatory frameworks including:
 * - PSD3 (Payment Services Directive 3) - EU payment services regulation
 * - PSR (Payment Services Regulation) - UK payment services framework
 * - Basel III/IV reforms - International banking supervision standards
 * - FRTB (Fundamental Review of the Trading Book) - Market risk framework
 * - GDPR (General Data Protection Regulation) - EU data protection law
 * - SOX (Sarbanes-Oxley Act) - US financial reporting requirements
 * - PCI DSS - Payment card data security standards
 * 
 * Features:
 * - Real-time regulatory rule synchronization with 24-hour update cycles
 * - Multi-jurisdictional rule management (EU, US, UK, APAC)
 * - Automated rule status tracking and lifecycle management
 * - Framework-specific categorization and filtering capabilities
 * - Secure access with audit logging for compliance requirements
 * 
 * @async
 * @function getRegulatoryRules
 * @returns {Promise<RegulatoryRule[]>} A promise that resolves to an array of regulatory rules
 * 
 * @throws {Error} Throws structured error for API failures, network issues, or authentication problems
 * 
 * @example
 * ```typescript
 * try {
 *   const rules = await getRegulatoryRules();
 *   console.log(`Retrieved ${rules.length} regulatory rules`);
 *   
 *   // Filter for active PSD3 rules
 *   const activePsd3Rules = rules.filter(rule => 
 *     rule.framework === 'PSD3' && rule.status === 'ACTIVE'
 *   );
 *   
 *   // Group rules by jurisdiction
 *   const rulesByJurisdiction = rules.reduce((acc, rule) => {
 *     acc[rule.jurisdiction] = acc[rule.jurisdiction] || [];
 *     acc[rule.jurisdiction].push(rule);
 *     return acc;
 *   }, {} as Record<string, RegulatoryRule[]>);
 * } catch (error) {
 *   console.error('Failed to retrieve regulatory rules:', error.message);
 * }
 * ```
 * 
 * @since 1.0.0
 */
export const getRegulatoryRules = async (): Promise<RegulatoryRule[]> => {
  try {
    // Log the regulatory rules retrieval attempt for audit and monitoring purposes
    console.info('Retrieving regulatory rules from backend service', {
      timestamp: new Date().toISOString(),
      endpoint: '/compliance/rules',
      method: 'GET',
    });

    // Make GET request to the regulatory rules endpoint using the centralized API client
    // This supports F-003-RQ-001 by providing real-time access to regulatory changes
    // with multi-framework mapping and unified risk scoring capabilities
    const response = await api.compliance.get('/rules');

    // Validate the response structure to ensure data integrity and type safety
    if (!response || !Array.isArray(response)) {
      throw new Error('Invalid response format: Expected array of regulatory rules');
    }

    // Validate that each rule has required fields for compliance monitoring
    const validatedRules = response.map((rule, index) => {
      if (!rule.id || !rule.name || !rule.framework || !rule.jurisdiction) {
        throw new Error(`Invalid regulatory rule structure at index ${index}: Missing required fields`);
      }
      return rule;
    });

    // Log successful retrieval with regulatory framework breakdown for audit purposes
    const frameworkSummary = validatedRules.reduce((acc, rule) => {
      acc[rule.framework] = (acc[rule.framework] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.info('Successfully retrieved regulatory rules', {
      timestamp: new Date().toISOString(),
      totalRules: validatedRules.length,
      frameworkBreakdown: frameworkSummary,
      activeRules: validatedRules.filter(rule => rule.status === 'ACTIVE').length,
    });

    // Return the validated array of regulatory rules with full type safety
    return validatedRules as RegulatoryRule[];

  } catch (error) {
    // Enhanced error handling with detailed logging for regulatory compliance audit
    console.error('Failed to retrieve regulatory rules', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      endpoint: '/compliance/rules',
      method: 'GET',
    });

    // Re-throw with enhanced error context for upstream error handling
    if (error instanceof Error) {
      // Preserve original error while adding regulatory compliance context
      const enhancedError = new Error(`Regulatory rules retrieval failed: ${error.message}`);
      (enhancedError as any).originalError = error;
      (enhancedError as any).endpoint = '/compliance/rules';
      (enhancedError as any).method = 'GET';
      (enhancedError as any).timestamp = new Date().toISOString();
      (enhancedError as any).complianceImpact = 'HIGH'; // Flag for compliance monitoring
      throw enhancedError;
    }

    // Handle non-Error objects with compliance context
    throw new Error(`Unexpected error during regulatory rules retrieval: ${String(error)}`);
  }
};

/**
 * Performs a comprehensive Anti-Money Laundering (AML) check for customer verification.
 * 
 * This function implements F-004: Digital Customer Onboarding KYC/AML requirements
 * by providing automated AML screening capabilities that support customer identification
 * programs (CIP) and customer due diligence (CDD) processes.
 * 
 * The AML check process includes:
 * - Sanctions list screening against global watchlists (OFAC, UN, EU, etc.)
 * - Politically Exposed Persons (PEP) identification and risk assessment
 * - Adverse media screening for negative coverage and criminal activity
 * - Cross-border transaction monitoring for suspicious patterns
 * - Risk-based assessment with automated scoring and recommendations
 * 
 * Compliance Framework Support:
 * - Bank Secrecy Act (BSA) requirements for US financial institutions
 * - FinCEN database integration for beneficial ownership verification
 * - International KYC/AML rules and compliance requirements
 * - Fourth Anti-Money Laundering Directive (4AMLD) compliance
 * - Fifth Anti-Money Laundering Directive (5AMLD) enhanced due diligence
 * 
 * Features:
 * - Real-time AML screening with sub-second response times
 * - Multi-database screening with confidence scoring
 * - Automated risk level assessment and escalation workflows
 * - Comprehensive audit trail for regulatory reporting
 * - Integration with global sanctions and PEP databases
 * 
 * @async
 * @function performAmlCheck
 * @param {AmlCheckRequest} request - The AML check request containing customer and transaction data
 * @returns {Promise<AmlCheckResponse>} A promise that resolves to comprehensive AML check results
 * 
 * @throws {Error} Throws structured error for API failures, validation errors, or screening issues
 * 
 * @example
 * ```typescript
 * try {
 *   const amlRequest: AmlCheckRequest = {
 *     customerId: 'CUST-2025-567890',
 *     checkType: 'ENHANCED',
 *     transactionData: {
 *       amount: 25000,
 *       currency: 'USD',
 *       sourceCountry: 'US',
 *       destinationCountry: 'CH'
 *     }
 *   };
 *   
 *   const amlResult = await performAmlCheck(amlRequest);
 *   
 *   if (amlResult.status === 'CLEARED') {
 *     console.log('Customer cleared AML screening');
 *   } else if (amlResult.status === 'FLAGGED') {
 *     console.log('Manual review required:', amlResult.recommendations);
 *   }
 * } catch (error) {
 *   console.error('AML check failed:', error.message);
 * }
 * ```
 * 
 * @since 1.0.0
 */
export const performAmlCheck = async (request: AmlCheckRequest): Promise<AmlCheckResponse> => {
  try {
    // Validate the AML check request to ensure all required data is present
    if (!request.customerId || typeof request.customerId !== 'string' || request.customerId.trim() === '') {
      throw new Error('Invalid AML request: customerId is required and must be a non-empty string');
    }

    if (!request.checkType || !['STANDARD', 'ENHANCED', 'TRANSACTION'].includes(request.checkType)) {
      throw new Error('Invalid AML request: checkType must be STANDARD, ENHANCED, or TRANSACTION');
    }

    // Validate transaction data if this is a transaction-specific AML check
    if (request.checkType === 'TRANSACTION') {
      if (!request.transactionData) {
        throw new Error('Invalid AML request: transactionData is required for TRANSACTION checkType');
      }
      if (!request.transactionData.amount || request.transactionData.amount <= 0) {
        throw new Error('Invalid AML request: transactionData.amount must be a positive number');
      }
      if (!request.transactionData.currency || typeof request.transactionData.currency !== 'string') {
        throw new Error('Invalid AML request: transactionData.currency is required');
      }
    }

    // Log the AML check initiation for comprehensive audit trail
    console.info('Initiating AML check for customer', {
      timestamp: new Date().toISOString(),
      customerId: request.customerId,
      checkType: request.checkType,
      endpoint: '/compliance/aml-check',
      method: 'POST',
      hasTransactionData: !!request.transactionData,
      transactionAmount: request.transactionData?.amount,
      transactionCurrency: request.transactionData?.currency,
    });

    // Make POST request to the AML check endpoint with the validated request payload
    // This implements F-004 KYC/AML compliance requirements with comprehensive screening
    const response = await api.compliance.post('/aml-check', request);

    // Validate the AML response structure to ensure data integrity
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid AML response format: Expected AML check response object');
    }

    // Validate required fields in the AML response
    const requiredFields = ['checkId', 'customerId', 'status', 'riskLevel', 'details', 'completedAt'];
    for (const field of requiredFields) {
      if (!(field in response) || response[field] === null || response[field] === undefined) {
        throw new Error(`Invalid AML response: Missing required field '${field}'`);
      }
    }

    // Validate AML status values
    const validStatuses = ['CLEARED', 'FLAGGED', 'BLOCKED', 'PENDING'];
    if (!validStatuses.includes(response.status)) {
      throw new Error(`Invalid AML response: status must be one of ${validStatuses.join(', ')}`);
    }

    // Validate risk level values
    const validRiskLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    if (!validRiskLevels.includes(response.riskLevel)) {
      throw new Error(`Invalid AML response: riskLevel must be one of ${validRiskLevels.join(', ')}`);
    }

    // Log successful AML check completion with key results for audit and monitoring
    console.info('AML check completed successfully', {
      timestamp: new Date().toISOString(),
      checkId: response.checkId,
      customerId: response.customerId,
      status: response.status,
      riskLevel: response.riskLevel,
      screeningResults: {
        sanctionsMatches: response.screeningResults?.sanctionsLists?.matchFound || false,
        pepFound: response.screeningResults?.pepScreening?.isPep || false,
        adverseMediaFound: response.screeningResults?.adverseMedia?.adverseMediaFound || false,
      },
      recommendationsCount: response.recommendations?.length || 0,
    });

    // Return the validated AML check response with full type safety
    return response as AmlCheckResponse;

  } catch (error) {
    // Enhanced error handling with detailed logging for AML compliance audit requirements
    console.error('AML check failed', {
      timestamp: new Date().toISOString(),
      customerId: request?.customerId,
      checkType: request?.checkType,
      error: error instanceof Error ? error.message : String(error),
      endpoint: '/compliance/aml-check',
      method: 'POST',
    });

    // Re-throw with enhanced error context for upstream error handling and compliance monitoring
    if (error instanceof Error) {
      // Preserve original error while adding AML compliance context
      const enhancedError = new Error(`AML check failed: ${error.message}`);
      (enhancedError as any).originalError = error;
      (enhancedError as any).customerId = request?.customerId;
      (enhancedError as any).checkType = request?.checkType;
      (enhancedError as any).endpoint = '/compliance/aml-check';
      (enhancedError as any).method = 'POST';
      (enhancedError as any).timestamp = new Date().toISOString();
      (enhancedError as any).complianceImpact = 'CRITICAL'; // Flag for immediate attention
      throw enhancedError;
    }

    // Handle non-Error objects with AML compliance context
    throw new Error(`Unexpected error during AML check: ${String(error)}`);
  }
};

/**
 * Retrieves detailed information about a specific compliance check by its unique identifier.
 * 
 * This function supports F-003-RQ-003: Compliance reporting requirements by providing
 * access to individual compliance check details, supporting continuous assessments
 * and compliance status monitoring across operational units.
 * 
 * The function provides comprehensive compliance check information including:
 * - Check type and status (identity verification, document validation, etc.)
 * - Detailed results and findings from compliance assessments
 * - Audit trail information with timestamps and entity linking
 * - Processing status and any error conditions encountered
 * - Recommendations for next steps based on compliance results
 * 
 * Supported Compliance Check Types:
 * - IDENTITY_VERIFICATION: Customer identity document validation
 * - DOCUMENT_VALIDATION: Official document authenticity verification
 * - BIOMETRIC_AUTH: Biometric authentication and liveness detection
 * - TRANSACTION_MONITORING: Real-time transaction compliance screening
 * - SANCTIONS_SCREENING: Global sanctions list and PEP screening
 * - ADDRESS_VERIFICATION: Customer address validation and risk assessment
 * 
 * Features:
 * - Real-time compliance check status retrieval
 * - Comprehensive audit trail and processing history
 * - Structured error handling with detailed error context
 * - Support for both customer and transaction compliance checks
 * - Integration with compliance reporting and dashboard systems
 * 
 * @async
 * @function getComplianceCheck
 * @param {string} checkId - Unique identifier of the compliance check to retrieve
 * @returns {Promise<ComplianceCheck>} A promise that resolves to detailed compliance check information
 * 
 * @throws {Error} Throws structured error for API failures, invalid check ID, or access issues
 * 
 * @example
 * ```typescript
 * try {
 *   const checkId = 'CHK-KYC-2025-001234';
 *   const complianceCheck = await getComplianceCheck(checkId);
 *   
 *   console.log(`Check Type: ${complianceCheck.checkType}`);
 *   console.log(`Status: ${complianceCheck.status}`);
 *   console.log(`Entity: ${complianceCheck.entityType} - ${complianceCheck.entityId}`);
 *   
 *   if (complianceCheck.status === 'FAILED') {
 *     console.log('Compliance check details:', complianceCheck.details);
 *   }
 * } catch (error) {
 *   if (error.message.includes('not found')) {
 *     console.error('Compliance check not found:', checkId);
 *   } else {
 *     console.error('Failed to retrieve compliance check:', error.message);
 *   }
 * }
 * ```
 * 
 * @since 1.0.0
 */
export const getComplianceCheck = async (checkId: string): Promise<ComplianceCheck> => {
  try {
    // Validate the check ID parameter to ensure it's a valid identifier
    if (!checkId || typeof checkId !== 'string' || checkId.trim() === '') {
      throw new Error('Invalid compliance check request: checkId is required and must be a non-empty string');
    }

    // Sanitize the check ID to prevent injection attacks
    const sanitizedCheckId = checkId.trim();
    if (sanitizedCheckId.length > 100) { // Reasonable maximum length for check IDs
      throw new Error('Invalid compliance check request: checkId exceeds maximum length of 100 characters');
    }

    // Log the compliance check retrieval attempt for audit and monitoring purposes
    console.info('Retrieving compliance check details', {
      timestamp: new Date().toISOString(),
      checkId: sanitizedCheckId,
      endpoint: `/compliance/checks/${sanitizedCheckId}`,
      method: 'GET',
    });

    // Make GET request to the compliance check endpoint with the sanitized check ID
    // This supports F-003-RQ-003 compliance reporting by providing access to individual
    // compliance check details and continuous compliance status monitoring
    const response = await api.compliance.get(`/checks/${sanitizedCheckId}`);

    // Validate the compliance check response structure to ensure data integrity
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid compliance check response format: Expected compliance check object');
    }

    // Validate required fields in the compliance check response
    const requiredFields = ['id', 'checkType', 'status', 'details', 'timestamp', 'entityId', 'entityType'];
    for (const field of requiredFields) {
      if (!(field in response) || response[field] === null || response[field] === undefined) {
        throw new Error(`Invalid compliance check response: Missing required field '${field}'`);
      }
    }

    // Validate compliance check status values
    const validStatuses = ['PENDING', 'PASSED', 'FAILED'];
    if (!validStatuses.includes(response.status)) {
      throw new Error(`Invalid compliance check response: status must be one of ${validStatuses.join(', ')}`);
    }

    // Validate entity type values
    const validEntityTypes = ['CUSTOMER', 'TRANSACTION'];
    if (!validEntityTypes.includes(response.entityType)) {
      throw new Error(`Invalid compliance check response: entityType must be one of ${validEntityTypes.join(', ')}`);
    }

    // Validate that the returned check ID matches the requested ID
    if (response.id !== sanitizedCheckId) {
      console.warn('Compliance check ID mismatch', {
        timestamp: new Date().toISOString(),
        requestedCheckId: sanitizedCheckId,
        returnedCheckId: response.id,
      });
    }

    // Log successful compliance check retrieval with key information for audit purposes
    console.info('Successfully retrieved compliance check details', {
      timestamp: new Date().toISOString(),
      checkId: response.id,
      checkType: response.checkType,
      status: response.status,
      entityType: response.entityType,
      entityId: response.entityId,
      checkTimestamp: response.timestamp,
    });

    // Return the validated compliance check with full type safety
    return response as ComplianceCheck;

  } catch (error) {
    // Enhanced error handling with detailed logging for compliance audit requirements
    console.error('Failed to retrieve compliance check details', {
      timestamp: new Date().toISOString(),
      checkId: checkId,
      error: error instanceof Error ? error.message : String(error),
      endpoint: `/compliance/checks/${checkId}`,
      method: 'GET',
    });

    // Re-throw with enhanced error context for upstream error handling
    if (error instanceof Error) {
      // Preserve original error while adding compliance check context
      const enhancedError = new Error(`Compliance check retrieval failed: ${error.message}`);
      (enhancedError as any).originalError = error;
      (enhancedError as any).checkId = checkId;
      (enhancedError as any).endpoint = `/compliance/checks/${checkId}`;
      (enhancedError as any).method = 'GET';
      (enhancedError as any).timestamp = new Date().toISOString();
      (enhancedError as any).complianceImpact = 'MEDIUM'; // Flag for compliance monitoring
      throw enhancedError;
    }

    // Handle non-Error objects with compliance context
    throw new Error(`Unexpected error during compliance check retrieval: ${String(error)}`);
  }
};

// Export all compliance service functions for use throughout the application
// These exports support the enterprise compliance automation requirements and
// provide type-safe access to all compliance-related backend services
export {
  getComplianceReports,
  getRegulatoryRules,
  performAmlCheck,
  getComplianceCheck,
};

// Default export containing all compliance service functions for convenience
export default {
  getComplianceReports,
  getRegulatoryRules,
  performAmlCheck,
  getComplianceCheck,
};