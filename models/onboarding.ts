// TypeScript 5.3+ - Frontend language as per technology stack
import { Customer } from './customer';
import { RiskAssessment } from './risk-assessment';

/**
 * Defines the possible steps in the customer onboarding process.
 * Based on F-004: Digital Customer Onboarding requirements including:
 * - Personal information collection and verification
 * - Document upload and verification for KYC compliance
 * - Biometric authentication for enhanced security
 * - AI-powered risk assessment integration
 * - Review process for compliance validation
 * - Final success confirmation
 */
export type OnboardingStep = 
  | 'PERSONAL_INFO'
  | 'DOCUMENT_UPLOAD'
  | 'BIOMETRIC_VERIFICATION'
  | 'RISK_ASSESSMENT'
  | 'REVIEW'
  | 'SUCCESS';

/**
 * Defines the possible statuses of the onboarding process.
 * Supports comprehensive state management for regulatory compliance
 * and customer experience optimization as per F-004 requirements.
 */
export type OnboardingStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'NEEDS_REVIEW';

/**
 * Represents the complete state of a customer's onboarding session.
 * This interface serves as the central data structure for tracking
 * digital customer onboarding progress and maintaining audit trails
 * for regulatory compliance as required by F-004: Digital Customer Onboarding.
 * 
 * Supports requirements for:
 * - Digital identity verification (<5 minute onboarding time target)
 * - KYC/AML compliance checks
 * - Biometric authentication integration
 * - Risk-based onboarding workflows
 * - Real-time progress tracking and state management
 */
export interface OnboardingSession {
  /** Unique identifier for the onboarding session */
  id: string;
  
  /** Current step in the onboarding process flow */
  currentStep: OnboardingStep;
  
  /** Overall status of the onboarding session */
  status: OnboardingStatus;
  
  /** Reference to the customer record once created, null during initial steps */
  customerId: string | null;
  
  /** Reference to the risk assessment record, null until risk assessment step */
  riskAssessmentId: string | null;
  
  /** Personal information collected during the onboarding process */
  personalInfo: PersonalInfoData | null;
  
  /** Array of documents uploaded and verified during onboarding */
  documents: DocumentUploadData[];
  
  /** Biometric verification data collected during identity verification */
  biometricData: BiometricVerificationData | null;
  
  /** Session creation timestamp for audit and compliance tracking */
  createdAt: Date;
  
  /** Last update timestamp for session state management */
  updatedAt: Date;
  
  /** Session expiration timestamp for security and cleanup */
  expiresAt: Date;
  
  /** IP address of the client for security and audit logging */
  clientIpAddress: string;
  
  /** User agent string for device tracking and security analysis */
  userAgent: string;
  
  /** Compliance flags and regulatory status indicators */
  complianceFlags: ComplianceFlags;
  
  /** Session metadata for additional tracking and analytics */
  sessionMetadata: SessionMetadata;
}

/**
 * Defines the structure for personal information collection during onboarding.
 * Complies with F-004 requirements for digital identity verification including
 * full name, date of birth, and address verification as mandated by
 * Bank Secrecy Act (BSA) and KYC regulations.
 */
export interface PersonalInfoData {
  /** Customer's legal first name as it appears on government-issued ID */
  firstName: string;
  
  /** Customer's legal middle name or initial (optional) */
  middleName?: string;
  
  /** Customer's legal last name as it appears on government-issued ID */
  lastName: string;
  
  /** Date of birth in ISO 8601 format (YYYY-MM-DD) for age verification */
  dateOfBirth: string;
  
  /** Primary email address for customer communication and verification */
  email: string;
  
  /** Primary phone number for customer contact and SMS verification */
  phone: string;
  
  /** Complete address information for KYC compliance and verification */
  address: AddressData;
  
  /** Social Security Number (encrypted at rest) for identity verification */
  ssn?: string;
  
  /** Nationality/citizenship for regulatory compliance screening */
  nationality: string;
  
  /** Employment information for risk assessment and compliance */
  employmentInfo?: EmploymentData;
  
  /** Annual income range for risk assessment and product eligibility */
  annualIncomeRange?: IncomeRange;
  
  /** Source of funds declaration for AML compliance */
  sourceOfFunds?: string[];
  
  /** Politically Exposed Person (PEP) declaration */
  isPoliticallyExposed: boolean;
  
  /** Additional regulatory declarations and confirmations */
  regulatoryDeclarations: RegulatoryDeclarations;
}

/**
 * Address information structure supporting comprehensive address verification
 * and regulatory compliance requirements for customer onboarding.
 */
export interface AddressData {
  /** Street address including number and street name */
  street: string;
  
  /** Apartment, suite, or unit number (optional) */
  unit?: string;
  
  /** City or municipality */
  city: string;
  
  /** State, province, or region */
  state: string;
  
  /** Postal or ZIP code */
  zipCode: string;
  
  /** Country code (ISO 3166-1 alpha-2) */
  country: string;
  
  /** Address type classification */
  addressType: 'RESIDENTIAL' | 'BUSINESS' | 'MAILING';
  
  /** Whether this is the primary residence */
  isPrimary: boolean;
  
  /** Duration at this address in months */
  residenceDuration?: number;
}

/**
 * Employment information for risk assessment and compliance verification.
 */
export interface EmploymentData {
  /** Employment status */
  status: 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'RETIRED' | 'STUDENT';
  
  /** Employer name */
  employerName?: string;
  
  /** Job title or position */
  jobTitle?: string;
  
  /** Industry or sector */
  industry?: string;
  
  /** Employment duration in months */
  employmentDuration?: number;
  
  /** Employer address information */
  employerAddress?: AddressData;
}

/**
 * Income range classification for risk assessment and product eligibility.
 */
export type IncomeRange = 
  | 'UNDER_25K'
  | '25K_50K'
  | '50K_75K'
  | '75K_100K'
  | '100K_150K'
  | '150K_250K'
  | 'OVER_250K';

/**
 * Regulatory declarations and compliance confirmations.
 */
export interface RegulatoryDeclarations {
  /** Customer acknowledgment of terms and conditions */
  termsAccepted: boolean;
  
  /** Privacy policy acknowledgment */
  privacyPolicyAccepted: boolean;
  
  /** Consent for credit checks and background verification */
  creditCheckConsent: boolean;
  
  /** Consent for data sharing with regulatory authorities */
  regulatoryDataSharingConsent: boolean;
  
  /** FATCA (Foreign Account Tax Compliance Act) status */
  fatcaStatus?: 'US_PERSON' | 'NON_US_PERSON' | 'US_PERSON_ABROAD';
  
  /** Tax residency information */
  taxResidency: string[];
  
  /** Declaration timestamp */
  declarationTimestamp: Date;
}

/**
 * Defines the structure for document upload and verification during onboarding.
 * Supports F-004 requirements for authentic and valid documentary evidence
 * including ID cards, passports, and utility bills for comprehensive
 * identity verification and address confirmation.
 */
export interface DocumentUploadData {
  /** Unique identifier for the document upload */
  documentId: string;
  
  /** Type of document being uploaded for verification */
  documentType: DocumentType;
  
  /** The actual file object containing the document image or PDF */
  file: File;
  
  /** Document verification status */
  verificationStatus: DocumentVerificationStatus;
  
  /** Extraction results from document OCR and analysis */
  extractedData?: DocumentExtractionData;
  
  /** Verification confidence score (0.0 - 1.0) */
  confidenceScore?: number;
  
  /** Document upload timestamp */
  uploadedAt: Date;
  
  /** Document verification completion timestamp */
  verifiedAt?: Date;
  
  /** Document expiry date (if applicable) */
  expiryDate?: string;
  
  /** Document issuing authority */
  issuingAuthority?: string;
  
  /** Document number or identifier */
  documentNumber?: string;
  
  /** Quality assessment of the uploaded document */
  qualityAssessment: DocumentQualityAssessment;
  
  /** Security features detected in the document */
  securityFeatures: SecurityFeatureDetection;
}

/**
 * Supported document types for identity verification and KYC compliance.
 */
export type DocumentType = 
  | 'PASSPORT'
  | 'DRIVERS_LICENSE'
  | 'NATIONAL_ID'
  | 'UTILITY_BILL'
  | 'BANK_STATEMENT'
  | 'TAX_DOCUMENT'
  | 'EMPLOYMENT_LETTER'
  | 'PROOF_OF_ADDRESS'
  | 'BIRTH_CERTIFICATE'
  | 'SOCIAL_SECURITY_CARD';

/**
 * Document verification status tracking.
 */
export type DocumentVerificationStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'VERIFIED'
  | 'REJECTED'
  | 'REQUIRES_MANUAL_REVIEW'
  | 'EXPIRED';

/**
 * Data extracted from document OCR and analysis.
 */
export interface DocumentExtractionData {
  /** Extracted text content from the document */
  extractedText: string;
  
  /** Structured data fields extracted from the document */
  extractedFields: Record<string, string>;
  
  /** Confidence scores for each extracted field */
  fieldConfidenceScores: Record<string, number>;
  
  /** Detected document format and structure */
  documentFormat: string;
  
  /** Language detection results */
  detectedLanguage: string;
}

/**
 * Document quality assessment for verification reliability.
 */
export interface DocumentQualityAssessment {
  /** Overall image quality score (0.0 - 1.0) */
  imageQuality: number;
  
  /** Text readability score (0.0 - 1.0) */
  textClarity: number;
  
  /** Document completeness (all required areas visible) */
  completeness: number;
  
  /** Glare or reflection detection */
  hasGlare: boolean;
  
  /** Blur detection */
  isBlurred: boolean;
  
  /** Proper orientation detection */
  isProperlyOriented: boolean;
  
  /** Color accuracy assessment */
  colorAccuracy: number;
}

/**
 * Security feature detection in identity documents.
 */
export interface SecurityFeatureDetection {
  /** Watermarks detected */
  watermarksDetected: boolean;
  
  /** Holograms or security foils detected */
  hologramsDetected: boolean;
  
  /** Microprinting detected */
  microprintingDetected: boolean;
  
  /** UV-reactive elements detected */
  uvElementsDetected: boolean;
  
  /** Tampering or alteration indicators */
  tamperingIndicators: string[];
  
  /** Overall authenticity score (0.0 - 1.0) */
  authenticityScore: number;
}

/**
 * Defines the structure for biometric verification during onboarding.
 * Supports F-004 requirements for biometric authentication using
 * AI and machine learning to determine customer authenticity through
 * facial recognition, liveness detection, and document comparison.
 */
export interface BiometricVerificationData {
  /** Unique identifier for the biometric verification session */
  verificationId: string;
  
  /** Face scan identifier from the biometric verification service */
  faceScanId: string;
  
  /** Liveness detection result to prevent spoofing attacks */
  livenessCheck: boolean;
  
  /** Face matching confidence score against document photo (0.0 - 1.0) */
  faceMatchScore: number;
  
  /** Liveness detection confidence score (0.0 - 1.0) */
  livenessScore: number;
  
  /** Overall biometric verification status */
  verificationStatus: BiometricVerificationStatus;
  
  /** Timestamp when biometric verification was initiated */
  verificationStartedAt: Date;
  
  /** Timestamp when biometric verification was completed */
  verificationCompletedAt?: Date;
  
  /** Biometric verification method used */
  verificationMethod: BiometricMethod;
  
  /** Quality assessment of the biometric sample */
  biometricQuality: BiometricQualityAssessment;
  
  /** Anti-spoofing measures and results */
  antiSpoofingResults: AntiSpoofingResults;
  
  /** Device information used for biometric capture */
  deviceInfo: BiometricDeviceInfo;
  
  /** Additional verification metadata */
  verificationMetadata: BiometricMetadata;
}

/**
 * Biometric verification status tracking.
 */
export type BiometricVerificationStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'PASSED'
  | 'FAILED'
  | 'REQUIRES_RETRY'
  | 'MANUAL_REVIEW_REQUIRED';

/**
 * Supported biometric verification methods.
 */
export type BiometricMethod = 
  | 'FACIAL_RECOGNITION'
  | 'FINGERPRINT'
  | 'VOICE_RECOGNITION'
  | 'IRIS_SCAN'
  | 'MULTI_MODAL';

/**
 * Quality assessment of biometric samples.
 */
export interface BiometricQualityAssessment {
  /** Overall sample quality score (0.0 - 1.0) */
  overallQuality: number;
  
  /** Image resolution and clarity */
  imageResolution: number;
  
  /** Lighting conditions assessment */
  lightingQuality: number;
  
  /** Face pose and angle assessment */
  poseQuality: number;
  
  /** Facial expression assessment */
  expressionQuality: number;
  
  /** Occlusion detection (glasses, masks, etc.) */
  occlusionDetected: boolean;
  
  /** Motion blur detection */
  motionBlurDetected: boolean;
}

/**
 * Anti-spoofing measures and detection results.
 */
export interface AntiSpoofingResults {
  /** Print attack detection (photo of photo) */
  printAttackDetected: boolean;
  
  /** Digital display attack detection (screen replay) */
  digitalAttackDetected: boolean;
  
  /** 3D mask attack detection */
  maskAttackDetected: boolean;
  
  /** Deepfake detection results */
  deepfakeDetected: boolean;
  
  /** Passive liveness score */
  passiveLivenessScore: number;
  
  /** Active liveness challenges passed */
  activeLivenessPassed: boolean;
  
  /** Overall spoofing risk score (0.0 - 1.0) */
  spoofingRiskScore: number;
}

/**
 * Device information for biometric capture context.
 */
export interface BiometricDeviceInfo {
  /** Device type used for capture */
  deviceType: 'MOBILE' | 'TABLET' | 'DESKTOP' | 'DEDICATED_SCANNER';
  
  /** Operating system information */
  operatingSystem: string;
  
  /** Browser information (if web-based) */
  browserInfo?: string;
  
  /** Camera specifications */
  cameraSpecs: CameraSpecifications;
  
  /** Device security assessment */
  deviceSecurityScore: number;
  
  /** Geolocation information (if available) */
  geolocation?: GeolocationData;
}

/**
 * Camera specifications for biometric quality assessment.
 */
export interface CameraSpecifications {
  /** Camera resolution */
  resolution: string;
  
  /** Camera model/manufacturer */
  cameraModel?: string;
  
  /** Autofocus capability */
  hasAutofocus: boolean;
  
  /** Flash capability */
  hasFlash: boolean;
  
  /** Front/rear camera designation */
  cameraPosition: 'FRONT' | 'REAR' | 'EXTERNAL';
}

/**
 * Geolocation data for verification context.
 */
export interface GeolocationData {
  /** Latitude coordinate */
  latitude: number;
  
  /** Longitude coordinate */
  longitude: number;
  
  /** Location accuracy in meters */
  accuracy: number;
  
  /** Timestamp of location capture */
  timestamp: Date;
  
  /** Country code derived from location */
  countryCode?: string;
}

/**
 * Additional biometric verification metadata.
 */
export interface BiometricMetadata {
  /** Number of verification attempts */
  attemptCount: number;
  
  /** Previous attempt results */
  previousAttempts: BiometricAttempt[];
  
  /** Verification duration in milliseconds */
  verificationDuration: number;
  
  /** SDK or service version used */
  serviceVersion: string;
  
  /** Additional custom metadata */
  customMetadata: Record<string, any>;
}

/**
 * Individual biometric verification attempt record.
 */
export interface BiometricAttempt {
  /** Attempt number */
  attemptNumber: number;
  
  /** Attempt timestamp */
  attemptTimestamp: Date;
  
  /** Attempt result */
  result: BiometricVerificationStatus;
  
  /** Failure reason (if applicable) */
  failureReason?: string;
  
  /** Quality scores for this attempt */
  qualityScores: BiometricQualityAssessment;
}

/**
 * Compliance flags and regulatory status indicators for onboarding sessions.
 */
export interface ComplianceFlags {
  /** KYC compliance status */
  kycCompliant: boolean;
  
  /** AML screening status */
  amlCleared: boolean;
  
  /** Sanctions list screening status */
  sanctionsCleared: boolean;
  
  /** PEP (Politically Exposed Person) screening status */
  pepScreeningPassed: boolean;
  
  /** OFAC (Office of Foreign Assets Control) screening status */
  ofacCleared: boolean;
  
  /** Risk assessment completion status */
  riskAssessmentComplete: boolean;
  
  /** Regulatory notifications required */
  regulatoryNotificationsRequired: string[];
  
  /** Compliance review required flag */
  manualReviewRequired: boolean;
  
  /** Compliance officer assignment */
  assignedComplianceOfficer?: string;
}

/**
 * Session metadata for additional tracking and analytics.
 */
export interface SessionMetadata {
  /** Referral source or marketing campaign */
  referralSource?: string;
  
  /** Customer acquisition channel */
  acquisitionChannel: 'WEB' | 'MOBILE_APP' | 'BRANCH' | 'PHONE' | 'PARTNER';
  
  /** A/B testing variant (if applicable) */
  abTestVariant?: string;
  
  /** Session analytics data */
  analyticsData: SessionAnalytics;
  
  /** Feature flags active during session */
  activeFeatureFlags: string[];
  
  /** Custom tracking parameters */
  customTrackingParams: Record<string, string>;
}

/**
 * Session analytics data for optimization and reporting.
 */
export interface SessionAnalytics {
  /** Time spent on each onboarding step */
  stepDurations: Record<OnboardingStep, number>;
  
  /** Number of attempts per step */
  stepAttempts: Record<OnboardingStep, number>;
  
  /** Abandonment points and reasons */
  abandonmentPoints: AbandonmentPoint[];
  
  /** Total session duration in milliseconds */
  totalSessionDuration: number;
  
  /** Conversion funnel metrics */
  conversionMetrics: ConversionMetrics;
}

/**
 * Session abandonment tracking for optimization.
 */
export interface AbandonmentPoint {
  /** Step where abandonment occurred */
  step: OnboardingStep;
  
  /** Abandonment timestamp */
  timestamp: Date;
  
  /** Reason for abandonment (if known) */
  reason?: 'TIMEOUT' | 'USER_EXIT' | 'TECHNICAL_ERROR' | 'COMPLIANCE_ISSUE';
  
  /** Additional context */
  context?: string;
}

/**
 * Conversion funnel metrics for business intelligence.
 */
export interface ConversionMetrics {
  /** Completion rate by step */
  stepCompletionRates: Record<OnboardingStep, number>;
  
  /** Drop-off rate by step */
  stepDropOffRates: Record<OnboardingStep, number>;
  
  /** Average time to completion */
  averageCompletionTime: number;
  
  /** Success rate by customer segment */
  successRateBySegment: Record<string, number>;
}

/**
 * Onboarding session creation parameters for initializing new sessions.
 */
export interface CreateOnboardingSessionRequest {
  /** Initial customer information (if available) */
  initialData?: Partial<PersonalInfoData>;
  
  /** Client IP address for security tracking */
  clientIpAddress: string;
  
  /** User agent string for device identification */
  userAgent: string;
  
  /** Referral source or campaign information */
  referralSource?: string;
  
  /** Acquisition channel designation */
  acquisitionChannel: SessionMetadata['acquisitionChannel'];
  
  /** Custom metadata for the session */
  customMetadata?: Record<string, any>;
}

/**
 * Onboarding session update parameters for state transitions.
 */
export interface UpdateOnboardingSessionRequest {
  /** Session identifier */
  sessionId: string;
  
  /** New onboarding step (if transitioning) */
  currentStep?: OnboardingStep;
  
  /** New onboarding status (if changing) */
  status?: OnboardingStatus;
  
  /** Updated personal information */
  personalInfo?: PersonalInfoData;
  
  /** Document upload data to add */
  documentData?: DocumentUploadData;
  
  /** Biometric verification data to add */
  biometricData?: BiometricVerificationData;
  
  /** Compliance flags to update */
  complianceFlags?: Partial<ComplianceFlags>;
  
  /** Additional metadata updates */
  metadataUpdates?: Record<string, any>;
}

/**
 * Onboarding validation result for business rule enforcement.
 */
export interface OnboardingValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  
  /** Validation error messages */
  errors: ValidationError[];
  
  /** Validation warnings (non-blocking) */
  warnings: ValidationWarning[];
  
  /** Next recommended step */
  nextStep?: OnboardingStep;
  
  /** Required actions for progression */
  requiredActions: string[];
}

/**
 * Validation error details.
 */
export interface ValidationError {
  /** Error code for programmatic handling */
  code: string;
  
  /** Human-readable error message */
  message: string;
  
  /** Field or section causing the error */
  field?: string;
  
  /** Error severity level */
  severity: 'ERROR' | 'CRITICAL';
}

/**
 * Validation warning details.
 */
export interface ValidationWarning {
  /** Warning code for programmatic handling */
  code: string;
  
  /** Human-readable warning message */
  message: string;
  
  /** Field or section causing the warning */
  field?: string;
  
  /** Warning type */
  type: 'QUALITY' | 'COMPLIANCE' | 'SECURITY' | 'BUSINESS_RULE';
}