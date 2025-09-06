// Import risk assessment types (assuming they will be available)
import { RiskFactor, RiskProfile } from './risk-assessment';

/**
 * Represents the complete profile of a customer in the unified financial services platform.
 * This interface provides a single, coherent view of the customer across all touchpoints and systems
 * as per F-001: Unified Data Integration Platform requirements.
 */
export interface Customer {
  /** Unique identifier for the customer record */
  id: string;
  
  /** Personal information and identity data */
  personalInfo: PersonalInfo;
  
  /** Array of customer addresses (primary, secondary, etc.) */
  addresses: Address[];
  
  /** Identity verification status and related KYC/AML data */
  identityVerification: IdentityVerification;
  
  /** AI-powered risk assessment profile for credit and fraud evaluation */
  riskProfile: RiskProfile;
  
  /** Compliance-related information and regulatory status */
  compliance: ComplianceInfo;
  
  /** System metadata for record management and auditing */
  metadata: Metadata;
}

/**
 * Contains the personal details of a customer as required for digital onboarding
 * and unified customer profile creation. Supports F-004: Digital Customer Onboarding requirements.
 */
export interface PersonalInfo {
  /** Customer's legal first name */
  firstName: string;
  
  /** Customer's legal last name */
  lastName: string;
  
  /** Primary email address for customer communication */
  email: string;
  
  /** Primary phone number for customer contact */
  phone: string;
  
  /** Date of birth in ISO 8601 format (YYYY-MM-DD) for age verification and compliance */
  dateOfBirth: string;
  
  /** Customer's nationality for regulatory compliance and risk assessment */
  nationality: string;
}

/**
 * Represents a physical address associated with a customer.
 * Supports multiple address types for comprehensive customer profiling and verification.
 */
export interface Address {
  /** Type of address - primary for main residence, secondary for additional addresses */
  type: 'primary' | 'secondary';
  
  /** Street address including number and street name */
  street: string;
  
  /** City or municipality */
  city: string;
  
  /** State, province, or region */
  state: string;
  
  /** Postal or ZIP code */
  zipCode: string;
  
  /** Country code (ISO 3166-1 alpha-2) */
  country: string;
  
  /** Date from which this address is valid (ISO 8601 format) */
  validFrom: string;
  
  /** Whether this address has been verified through documentation or other means */
  isVerified: boolean;
}

/**
 * Holds information about the customer's identity verification status as per
 * F-004: Digital Customer Onboarding requirements. Supports KYC/AML compliance
 * and biometric authentication processes.
 */
export interface IdentityVerification {
  /** Know Your Customer (KYC) verification status */
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'IN_PROGRESS';
  
  /** Anti-Money Laundering (AML) screening status */
  amlStatus: 'CLEARED' | 'PENDING' | 'FAILED';
  
  /** Array of identity documents provided by the customer */
  documents: IdentityDocument[];
  
  /** Biometric verification data and scores */
  biometricData: BiometricData;
}

/**
 * Represents an identity document provided by the customer during the onboarding process.
 * Supports digital identity verification and document scanning capabilities.
 */
export interface IdentityDocument {
  /** Type of identity document */
  type: 'PASSPORT' | 'DRIVERS_LICENSE' | 'NATIONAL_ID';
  
  /** Document identification number */
  documentNumber: string;
  
  /** Document expiry date in ISO 8601 format (YYYY-MM-DD) */
  expiryDate: string;
  
  /** Date when the document was verified by the system */
  verificationDate: string;
  
  /** Method used to verify the document */
  verificationMethod: 'AUTOMATED' | 'MANUAL' | 'BIOMETRIC';
}

/**
 * Stores the results of biometric verification processes.
 * Supports AI-powered identity verification and fraud detection capabilities.
 */
export interface BiometricData {
  /** Face matching confidence score (0.0 - 1.0, where 1.0 is perfect match) */
  faceMatchScore: number;
  
  /** Liveness detection score (0.0 - 1.0, where 1.0 indicates live person) */
  livenessScore: number;
  
  /** Timestamp when biometric verification was performed (ISO 8601 format) */
  verificationTimestamp: string;
}

/**
 * Contains compliance-related information for a customer to support
 * F-003: Regulatory Compliance Automation requirements.
 * Tracks various regulatory and compliance statuses.
 */
export interface ComplianceInfo {
  /** Know Your Customer compliance status */
  kycStatus: string;
  
  /** Anti-Money Laundering compliance status */
  amlStatus: string;
  
  /** Politically Exposed Person (PEP) screening status */
  pepStatus: string;
  
  /** Sanctions list screening status */
  sanctionsCheck: string;
}

/**
 * Contains metadata associated with a customer record for audit trails,
 * version control, and data classification as required by financial
 * services regulatory compliance.
 */
export interface Metadata {
  /** Record creation timestamp in ISO 8601 format */
  createdAt: string;
  
  /** Last update timestamp in ISO 8601 format */
  updatedAt: string;
  
  /** Record version number for optimistic locking and change tracking */
  version: number;
  
  /** Data classification level for security and access control */
  dataClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
}