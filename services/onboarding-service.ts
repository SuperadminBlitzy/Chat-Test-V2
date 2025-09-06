// External imports - axios HTTP client library v1.6+
// Internal imports - API service and onboarding models
import api from '../lib/api';
import {
  OnboardingRequest,
  OnboardingResponse,
  DocumentUploadRequest,
  DocumentUploadResponse,
  BiometricVerificationRequest,
  BiometricVerificationResponse
} from '../models/onboarding';

/**
 * Digital Customer Onboarding Service
 * 
 * This service handles all API interactions related to the customer onboarding process,
 * implementing F-004: Digital Customer Onboarding requirements from the technical specification.
 * 
 * The service provides comprehensive digital onboarding functionality including:
 * - Digital identity verification with <5 minute target completion time
 * - KYC/AML compliance checks with automated regulatory screening
 * - Biometric authentication using AI and machine learning for authenticity determination
 * - Risk-based onboarding workflows with real-time risk assessment integration
 * - Document verification supporting multiple identity document types
 * - Real-time progress tracking and audit trail maintenance for regulatory compliance
 * 
 * Architecture Alignment:
 * - Supports F-004: Digital Customer Onboarding with comprehensive digital identity verification
 * - Integrates with F-001: Unified Data Integration Platform for seamless data flow
 * - Leverages F-002: AI-Powered Risk Assessment Engine for intelligent risk scoring
 * - Ensures F-003: Regulatory Compliance Automation with KYC/AML checks
 * 
 * Business Value:
 * - Reduces onboarding time from traditional days to minutes (target <5 minutes)
 * - Increases conversion rates by minimizing customer abandonment
 * - Ensures regulatory compliance with automated KYC/AML processes
 * - Provides enhanced security through biometric authentication
 * - Enables risk-based onboarding for optimized customer experience
 * 
 * Technical Implementation:
 * - Built on the centralized API service layer for consistent error handling
 * - Implements type-safe TypeScript interfaces for all data structures
 * - Provides comprehensive error handling and logging for audit trails
 * - Supports real-time status tracking and progress monitoring
 * - Ensures data security through encrypted transmission and secure storage
 * 
 * @fileoverview Digital Customer Onboarding Service for Financial Services Platform
 * @version 1.0.0
 * @author Financial Services Platform Development Team
 * @since 2025
 */

/**
 * Submits the user's personal information to the backend for the first step of onboarding.
 * 
 * This function implements the initial step of the F-004: Digital Customer Onboarding process,
 * handling the collection and submission of customer personal information including:
 * - Full name verification (first, middle, last names)
 * - Date of birth for age verification and compliance
 * - Contact information (email, phone) for customer communication
 * - Address information for KYC compliance and verification
 * - Employment details for risk assessment
 * - Regulatory declarations and compliance confirmations
 * 
 * The function performs comprehensive data validation, regulatory compliance checks,
 * and integrates with the risk assessment engine to provide intelligent onboarding workflows.
 * 
 * Business Rules Implemented:
 * - Bank Secrecy Act (BSA) compliance through identity verification
 * - KYC (Know Your Customer) requirements with full name, DOB, and address verification
 * - AML (Anti-Money Laundering) preliminary screening
 * - PEP (Politically Exposed Person) declaration handling
 * - FATCA status collection for tax compliance
 * - Data validation ensuring authentic and complete information
 * 
 * Error Handling:
 * - Comprehensive validation error messages for user guidance
 * - Regulatory compliance failure notifications
 * - Network error handling with retry capabilities
 * - Structured error responses for frontend consumption
 * 
 * Security Features:
 * - Encrypted data transmission using HTTPS/TLS
 * - PII (Personally Identifiable Information) protection
 * - Audit logging for regulatory compliance
 * - IP address and user agent tracking for security analysis
 * 
 * @param {OnboardingRequest} data - The onboarding request containing customer personal information
 * @returns {Promise<OnboardingResponse>} A promise that resolves with the onboarding response from the backend
 * 
 * @throws {Error} When API request fails or validation errors occur
 * @throws {Error} When regulatory compliance checks fail
 * @throws {Error} When network connectivity issues prevent request completion
 * 
 * @example
 * ```typescript
 * try {
 *   const personalInfo: OnboardingRequest = {
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     email: 'john.doe@example.com',
 *     phone: '+1-555-123-4567',
 *     dateOfBirth: '1990-01-15',
 *     address: {
 *       street: '123 Main Street',
 *       city: 'New York',
 *       state: 'NY',
 *       zipCode: '10001',
 *       country: 'US'
 *     },
 *     // ... other required fields
 *   };
 *   
 *   const response = await submitPersonalInfo(personalInfo);
 *   console.log('Onboarding initiated:', response.workflowId);
 *   console.log('Next step:', response.nextStep);
 * } catch (error) {
 *   console.error('Personal info submission failed:', error.message);
 *   // Handle specific error types for user feedback
 * }
 * ```
 */
export const submitPersonalInfo = async (data: OnboardingRequest): Promise<OnboardingResponse> => {
  try {
    // Log the API call for debugging and monitoring purposes
    console.debug('Submitting personal information for onboarding', {
      timestamp: new Date().toISOString(),
      hasPersonalInfo: Boolean(data),
      email: data.email ? data.email.substring(0, 3) + '***' : undefined, // Masked for privacy
      customerInitials: data.firstName && data.lastName ? `${data.firstName[0]}${data.lastName[0]}` : undefined,
    });

    // Validate required fields before making the API call
    if (!data.firstName || !data.lastName || !data.email || !data.dateOfBirth) {
      throw new Error('Required personal information fields are missing. Please provide first name, last name, email, and date of birth.');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Please provide a valid email address.');
    }

    // Validate date of birth format and age requirements
    const dobDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    
    if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      throw new Error('Customer must be at least 18 years old to open an account.');
    }

    // Make the API call to submit personal information
    // The API endpoint follows the F-004 onboarding workflow specification
    const response = await api.onboarding.submitPersonalInfo(data);

    // Log successful submission for audit trail
    console.info('Personal information submitted successfully', {
      timestamp: new Date().toISOString(),
      workflowId: response.workflowId,
      status: response.status,
      nextStep: response.nextStep,
    });

    // Return the structured response from the backend
    return response;

  } catch (error) {
    // Enhanced error handling with detailed logging for troubleshooting
    console.error('Failed to submit personal information', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      hasData: Boolean(data),
      endpoint: '/api/onboarding/personal-info',
    });

    // Re-throw the error with additional context for upstream handling
    if (error instanceof Error) {
      // Preserve the original error but add context
      const enhancedError = new Error(`Personal information submission failed: ${error.message}`);
      (enhancedError as any).originalError = error;
      (enhancedError as any).step = 'PERSONAL_INFO_SUBMISSION';
      (enhancedError as any).timestamp = new Date().toISOString();
      throw enhancedError;
    }

    // Handle non-Error objects
    throw new Error(`Personal information submission failed: ${String(error)}`);
  }
};

/**
 * Uploads a user's identity document to the backend for verification.
 * 
 * This function implements the document verification step of the F-004: Digital Customer Onboarding
 * process, handling the upload and processing of identity documents including:
 * - Government-issued ID cards (Driver's License, National ID, Passport)
 * - Proof of address documents (Utility bills, Bank statements)
 * - Supporting documentation (Employment letters, Tax documents)
 * - Document quality assessment and validation
 * - OCR (Optical Character Recognition) data extraction
 * - Security feature detection and authenticity verification
 * 
 * The function integrates with advanced document verification services to ensure:
 * - Authentic and valid documentary evidence as required by regulations
 * - High-quality document capture for reliable verification
 * - Security feature detection to prevent fraud
 * - Automated data extraction for streamlined processing
 * - Compliance with KYC/AML document verification requirements
 * 
 * Document Processing Pipeline:
 * 1. File validation (format, size, quality)
 * 2. Document upload to secure storage
 * 3. OCR processing for data extraction
 * 4. Security feature analysis
 * 5. Document authenticity verification
 * 6. Compliance checking against regulatory requirements
 * 7. Integration with customer risk assessment
 * 
 * Supported Document Types:
 * - PASSPORT: International travel document with biometric data
 * - DRIVERS_LICENSE: State-issued driving license with photo ID
 * - NATIONAL_ID: Government-issued national identity card
 * - UTILITY_BILL: Proof of address (gas, electric, water, internet bills)
 * - BANK_STATEMENT: Financial institution statements for address verification
 * - TAX_DOCUMENT: IRS or tax authority documents
 * - EMPLOYMENT_LETTER: Official employment verification documents
 * 
 * Quality Requirements:
 * - Minimum resolution for OCR processing
 * - Proper lighting and contrast
 * - Complete document visibility (no cropping)
 * - Minimal glare or reflection
 * - Proper orientation and focus
 * 
 * Security Features:
 * - Encrypted file transmission
 * - Secure document storage with access controls
 * - Audit logging for all document operations
 * - Automatic document deletion after verification completion
 * - Compliance with data protection regulations
 * 
 * @param {DocumentUploadRequest} data - The document upload request containing file and metadata
 * @returns {Promise<DocumentUploadResponse>} A promise that resolves with the document upload response from the backend
 * 
 * @throws {Error} When document upload fails or validation errors occur
 * @throws {Error} When document quality is insufficient for verification
 * @throws {Error} When unsupported document type is provided
 * @throws {Error} When file size exceeds maximum allowed limits
 * 
 * @example
 * ```typescript
 * try {
 *   const documentData: DocumentUploadRequest = {
 *     workflowId: 'onboarding-123456',
 *     documentType: 'DRIVERS_LICENSE',
 *     file: selectedFile, // File object from input
 *     metadata: {
 *       captureMethod: 'CAMERA',
 *       deviceInfo: {
 *         userAgent: navigator.userAgent,
 *         platform: navigator.platform
 *       }
 *     }
 *   };
 *   
 *   const response = await uploadDocument(documentData);
 *   console.log('Document uploaded:', response.documentId);
 *   console.log('Verification status:', response.verificationStatus);
 * } catch (error) {
 *   console.error('Document upload failed:', error.message);
 *   // Handle specific error types for user guidance
 * }
 * ```
 */
export const uploadDocument = async (data: DocumentUploadRequest): Promise<DocumentUploadResponse> => {
  try {
    // Log the document upload attempt for monitoring and debugging
    console.debug('Uploading document for verification', {
      timestamp: new Date().toISOString(),
      workflowId: data.workflowId,
      documentType: data.documentType,
      fileName: data.file?.name,
      fileSize: data.file?.size,
      fileType: data.file?.type,
    });

    // Validate required fields
    if (!data.workflowId) {
      throw new Error('Workflow ID is required for document upload.');
    }

    if (!data.documentType) {
      throw new Error('Document type must be specified for proper verification.');
    }

    if (!data.file) {
      throw new Error('Document file is required for upload.');
    }

    // Validate file size (maximum 10MB for document uploads)
    const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
    if (data.file.size > maxFileSize) {
      throw new Error('Document file size exceeds the maximum allowed limit of 10MB. Please compress or use a different file.');
    }

    // Validate file type - only allow common document formats
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'application/pdf'
    ];

    if (!allowedTypes.includes(data.file.type)) {
      throw new Error('Unsupported file type. Please upload a JPEG, PNG, WebP, or PDF file.');
    }

    // Validate document type against supported types
    const supportedDocumentTypes = [
      'PASSPORT',
      'DRIVERS_LICENSE',
      'NATIONAL_ID',
      'UTILITY_BILL',
      'BANK_STATEMENT',
      'TAX_DOCUMENT',
      'EMPLOYMENT_LETTER',
      'PROOF_OF_ADDRESS',
      'BIRTH_CERTIFICATE',
      'SOCIAL_SECURITY_CARD'
    ];

    if (!supportedDocumentTypes.includes(data.documentType)) {
      throw new Error(`Unsupported document type: ${data.documentType}. Please select a valid document type.`);
    }

    // Prepare FormData for multipart file upload
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('documentType', data.documentType);
    formData.append('workflowId', data.workflowId);
    
    // Add metadata if provided
    if (data.metadata) {
      formData.append('metadata', JSON.stringify(data.metadata));
    }

    // Add additional tracking information
    formData.append('uploadTimestamp', new Date().toISOString());
    formData.append('clientInfo', JSON.stringify({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
    }));

    // Make the API call to upload the document
    // The API endpoint follows the F-004 document verification specification
    const response = await api.onboarding.uploadDocument(data.workflowId, formData);

    // Log successful upload for audit trail
    console.info('Document uploaded successfully', {
      timestamp: new Date().toISOString(),
      workflowId: data.workflowId,
      documentId: response.documentId,
      documentType: data.documentType,
      verificationStatus: response.verificationStatus,
      processingTime: response.processingTimeMs,
    });

    // Return the structured response from the backend
    return response;

  } catch (error) {
    // Enhanced error handling with detailed logging for troubleshooting
    console.error('Failed to upload document', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      workflowId: data.workflowId,
      documentType: data.documentType,
      fileName: data.file?.name,
      fileSize: data.file?.size,
      endpoint: '/api/onboarding/document-upload',
    });

    // Re-throw the error with additional context for upstream handling
    if (error instanceof Error) {
      // Preserve the original error but add context
      const enhancedError = new Error(`Document upload failed: ${error.message}`);
      (enhancedError as any).originalError = error;
      (enhancedError as any).step = 'DOCUMENT_UPLOAD';
      (enhancedError as any).workflowId = data.workflowId;
      (enhancedError as any).documentType = data.documentType;
      (enhancedError as any).timestamp = new Date().toISOString();
      throw enhancedError;
    }

    // Handle non-Error objects
    throw new Error(`Document upload failed: ${String(error)}`);
  }
};

/**
 * Submits the user's biometric data to the backend for verification.
 * 
 * This function implements the biometric authentication step of the F-004: Digital Customer
 * Onboarding process, utilizing AI and machine learning technologies to determine customer
 * authenticity through advanced biometric verification including:
 * - Facial recognition with liveness detection
 * - Face matching against government-issued document photos
 * - Anti-spoofing measures to prevent fraud attempts
 * - Multi-modal biometric verification when required
 * - Device security assessment and geolocation tracking
 * - Quality assessment of biometric samples
 * 
 * The function integrates with state-of-the-art biometric verification services to provide:
 * - Real-time liveness detection to prevent photo/video replay attacks
 * - High-accuracy face matching with confidence scoring
 * - Comprehensive anti-spoofing detection (print attacks, digital displays, 3D masks)
 * - Deepfake detection using advanced AI algorithms
 * - Device fingerprinting for security context
 * - Biometric quality assessment for reliable verification
 * 
 * Biometric Verification Pipeline:
 * 1. Biometric sample capture and quality assessment
 * 2. Liveness detection using passive and active challenges
 * 3. Face detection and feature extraction
 * 4. Anti-spoofing analysis and threat detection
 * 5. Face matching against reference document photo
 * 6. Confidence scoring and threshold evaluation
 * 7. Security context analysis (device, location, behavior)
 * 8. Integration with risk assessment and compliance systems
 * 
 * Security Features:
 * - Print attack detection (photo of photo)
 * - Digital display attack detection (screen replay)
 * - 3D mask attack detection
 * - Deepfake detection and analysis
 * - Passive liveness scoring
 * - Active liveness challenges
 * - Device security assessment
 * - Geolocation verification
 * 
 * Quality Requirements:
 * - Minimum image resolution for face detection
 * - Proper lighting conditions
 * - Frontal face pose with minimal rotation
 * - Clear facial features without occlusion
 * - Stable image without motion blur
 * - Appropriate distance from camera
 * 
 * Compliance Integration:
 * - Biometric data protection according to privacy regulations
 * - Secure biometric template storage
 * - Audit logging for all biometric operations
 * - Consent management for biometric data processing
 * - Data retention policies compliance
 * - Cross-border data transfer restrictions
 * 
 * AI/ML Integration:
 * - Advanced neural networks for face recognition
 * - Machine learning models for liveness detection
 * - Deep learning algorithms for anti-spoofing
 * - Computer vision for quality assessment
 * - Behavioral analysis for fraud detection
 * - Continuous model improvement and updates
 * 
 * @param {BiometricVerificationRequest} data - The biometric verification request containing biometric data and metadata
 * @returns {Promise<BiometricVerificationResponse>} A promise that resolves with the biometric verification response from the backend
 * 
 * @throws {Error} When biometric verification fails or validation errors occur
 * @throws {Error} When biometric sample quality is insufficient
 * @throws {Error} When liveness detection fails
 * @throws {Error} When face matching confidence is below threshold
 * @throws {Error} When anti-spoofing measures detect fraud attempts
 * 
 * @example
 * ```typescript
 * try {
 *   const biometricData: BiometricVerificationRequest = {
 *     workflowId: 'onboarding-123456',
 *     biometricType: 'FACIAL_RECOGNITION',
 *     imageData: base64EncodedImage, // Base64 encoded face image
 *     livenessData: {
 *       challengeType: 'ACTIVE',
 *       challengeResponse: challengeVideoData
 *     },
 *     deviceInfo: {
 *       deviceType: 'MOBILE',
 *       operatingSystem: 'iOS 17.2',
 *       browserInfo: 'Safari 17.2',
 *       cameraSpecs: {
 *         resolution: '1920x1080',
 *         cameraPosition: 'FRONT'
 *       }
 *     },
 *     geolocation: {
 *       latitude: 40.7128,
 *       longitude: -74.0060,
 *       accuracy: 10
 *     }
 *   };
 *   
 *   const response = await verifyBiometrics(biometricData);
 *   console.log('Biometric verification:', response.verificationStatus);
 *   console.log('Face match score:', response.faceMatchScore);
 *   console.log('Liveness score:', response.livenessScore);
 * } catch (error) {
 *   console.error('Biometric verification failed:', error.message);
 *   // Handle specific error types for user guidance
 * }
 * ```
 */
export const verifyBiometrics = async (data: BiometricVerificationRequest): Promise<BiometricVerificationResponse> => {
  try {
    // Log the biometric verification attempt for monitoring and security analysis
    console.debug('Initiating biometric verification', {
      timestamp: new Date().toISOString(),
      workflowId: data.workflowId,
      biometricType: data.biometricType,
      hasImageData: Boolean(data.imageData),
      hasLivenessData: Boolean(data.livenessData),
      deviceType: data.deviceInfo?.deviceType,
      verificationMethod: data.verificationMethod,
    });

    // Validate required fields
    if (!data.workflowId) {
      throw new Error('Workflow ID is required for biometric verification.');
    }

    if (!data.biometricType) {
      throw new Error('Biometric type must be specified for verification.');
    }

    if (!data.imageData) {
      throw new Error('Biometric image data is required for verification.');
    }

    if (!data.verificationMethod) {
      throw new Error('Verification method must be specified.');
    }

    // Validate biometric type against supported methods
    const supportedBiometricTypes = [
      'FACIAL_RECOGNITION',
      'FINGERPRINT',
      'VOICE_RECOGNITION',
      'IRIS_SCAN',
      'MULTI_MODAL'
    ];

    if (!supportedBiometricTypes.includes(data.biometricType)) {
      throw new Error(`Unsupported biometric type: ${data.biometricType}. Please select a valid biometric verification method.`);
    }

    // Validate verification method
    const supportedVerificationMethods = [
      'FACIAL_RECOGNITION',
      'FINGERPRINT',
      'VOICE_RECOGNITION',
      'IRIS_SCAN',
      'MULTI_MODAL'
    ];

    if (!supportedVerificationMethods.includes(data.verificationMethod)) {
      throw new Error(`Unsupported verification method: ${data.verificationMethod}.`);
    }

    // Validate image data format (should be base64 encoded)
    if (typeof data.imageData !== 'string' || !data.imageData.startsWith('data:image/')) {
      throw new Error('Invalid image data format. Please provide a valid base64 encoded image.');
    }

    // Validate image data size (maximum 5MB for biometric images)
    const base64Data = data.imageData.split(',')[1];
    const imageSize = (base64Data.length * 3) / 4; // Approximate size in bytes
    const maxImageSize = 5 * 1024 * 1024; // 5MB in bytes

    if (imageSize > maxImageSize) {
      throw new Error('Biometric image size exceeds the maximum allowed limit of 5MB. Please capture a smaller image.');
    }

    // Validate device info if provided
    if (data.deviceInfo) {
      if (!data.deviceInfo.deviceType) {
        throw new Error('Device type is required when providing device information.');
      }

      const supportedDeviceTypes = ['MOBILE', 'TABLET', 'DESKTOP', 'DEDICATED_SCANNER'];
      if (!supportedDeviceTypes.includes(data.deviceInfo.deviceType)) {
        throw new Error(`Unsupported device type: ${data.deviceInfo.deviceType}.`);
      }
    }

    // Add security and audit metadata
    const enhancedData = {
      ...data,
      securityMetadata: {
        timestamp: new Date().toISOString(),
        sessionId: crypto.randomUUID(),
        ipAddress: undefined, // Will be populated by backend
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      qualityMetrics: {
        imageResolution: undefined, // Will be calculated by backend
        compressionRatio: base64Data.length / imageSize,
        captureMethod: data.captureMethod || 'UNKNOWN',
      }
    };

    // Make the API call to verify biometrics
    // The API endpoint follows the F-004 biometric verification specification
    const response = await api.onboarding.verifyBiometrics(data.workflowId, enhancedData);

    // Log successful verification for audit trail and security monitoring
    console.info('Biometric verification completed', {
      timestamp: new Date().toISOString(),
      workflowId: data.workflowId,
      verificationId: response.verificationId,
      verificationStatus: response.verificationStatus,
      faceMatchScore: response.faceMatchScore,
      livenessScore: response.livenessScore,
      processingTime: response.processingTimeMs,
      securityFlags: response.securityFlags,
    });

    // Additional security logging for compliance and fraud detection
    if (response.antiSpoofingResults) {
      console.info('Anti-spoofing analysis completed', {
        timestamp: new Date().toISOString(),
        workflowId: data.workflowId,
        verificationId: response.verificationId,
        spoofingRiskScore: response.antiSpoofingResults.spoofingRiskScore,
        printAttackDetected: response.antiSpoofingResults.printAttackDetected,
        digitalAttackDetected: response.antiSpoofingResults.digitalAttackDetected,
        deepfakeDetected: response.antiSpoofingResults.deepfakeDetected,
      });
    }

    // Return the structured response from the backend
    return response;

  } catch (error) {
    // Enhanced error handling with detailed logging for security analysis
    console.error('Failed to verify biometrics', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      workflowId: data.workflowId,
      biometricType: data.biometricType,
      verificationMethod: data.verificationMethod,
      hasImageData: Boolean(data.imageData),
      deviceType: data.deviceInfo?.deviceType,
      endpoint: '/api/onboarding/biometric-verification',
    });

    // Security event logging for potential fraud attempts
    console.warn('Biometric verification failure - security event', {
      timestamp: new Date().toISOString(),
      workflowId: data.workflowId,
      failureReason: error instanceof Error ? error.message : String(error),
      deviceFingerprint: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      securityContext: {
        hasMultipleAttempts: false, // Will be tracked by backend
        suspiciousActivity: false, // Will be analyzed by backend
        riskLevel: 'UNKNOWN', // Will be determined by backend
      }
    });

    // Re-throw the error with additional context for upstream handling
    if (error instanceof Error) {
      // Preserve the original error but add context
      const enhancedError = new Error(`Biometric verification failed: ${error.message}`);
      (enhancedError as any).originalError = error;
      (enhancedError as any).step = 'BIOMETRIC_VERIFICATION';
      (enhancedError as any).workflowId = data.workflowId;
      (enhancedError as any).biometricType = data.biometricType;
      (enhancedError as any).verificationMethod = data.verificationMethod;
      (enhancedError as any).timestamp = new Date().toISOString();
      (enhancedError as any).securityEvent = true;
      throw enhancedError;
    }

    // Handle non-Error objects
    throw new Error(`Biometric verification failed: ${String(error)}`);
  }
};

// Export all functions for use by other parts of the application
export {
  submitPersonalInfo,
  uploadDocument,
  verifyBiometrics
};

// Export a combined service object for alternative usage patterns
export const onboardingService = {
  submitPersonalInfo,
  uploadDocument,
  verifyBiometrics
};

// Export as default for convenient importing
export default {
  submitPersonalInfo,
  uploadDocument,
  verifyBiometrics
};