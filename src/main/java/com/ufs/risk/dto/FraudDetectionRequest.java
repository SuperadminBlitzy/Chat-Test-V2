package com.ufs.risk.dto;

import lombok.AllArgsConstructor; // v1.18.30
import lombok.Data; // v1.18.30
import lombok.NoArgsConstructor; // v1.18.30
import java.math.BigDecimal; // v21
import java.time.Instant; // v21

/**
 * Data Transfer Object (DTO) for carrying data for a fraud detection request.
 * 
 * This class encapsulates all the necessary information required by the 
 * FraudDetectionService to assess the risk of a transaction as part of the
 * AI-Powered Risk Assessment Engine (F-002) and Fraud Detection System (F-006).
 * 
 * The DTO supports real-time fraud scoring and predictive modeling capabilities
 * with sub-500ms response time requirements as specified in the technical 
 * requirements (F-002-RQ-001).
 * 
 * Key Features:
 * - Real-time risk scoring input data structure
 * - Supports AI-powered fraud detection algorithms  
 * - Complies with enterprise data validation standards
 * - Designed for high-throughput transaction processing (10,000+ TPS)
 * - Integrates with unified data integration platform
 * 
 * Business Context:
 * This DTO addresses the critical need for unified fraud detection across
 * financial institutions where data silos create challenges. It serves as
 * the standardized input format for the AI-powered risk assessment engine
 * that analyzes transaction patterns, customer behaviors, and risk factors
 * to generate risk scores on a 0-1000 scale with 95% accuracy rate.
 * 
 * Compliance:
 * - Supports SOC2, PCI-DSS, and GDPR compliance requirements
 * - Enables audit trail creation for regulatory compliance automation
 * - Facilitates real-time compliance monitoring and reporting
 * 
 * @author Unified Financial Services Platform
 * @version 1.0
 * @since 2025-01-01
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FraudDetectionRequest {

    /**
     * Unique identifier for the transaction being analyzed.
     * 
     * This field serves as the primary key for transaction tracking and 
     * correlation across the distributed microservices architecture.
     * Used for audit trails and compliance reporting requirements.
     * 
     * Format: UUID or alphanumeric string
     * Example: "TXN-2025-001234567890" or "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
     * 
     * Business Rules:
     * - Must be unique across all transactions in the system
     * - Required for risk scoring and fraud detection processing
     * - Used in blockchain settlement network for transaction reconciliation
     * - Essential for regulatory compliance and audit trail creation
     */
    private String transactionId;

    /**
     * Unique identifier for the customer initiating the transaction.
     * 
     * Links the transaction to the unified customer profile created by the
     * Unified Data Integration Platform (F-001). This enables comprehensive
     * risk assessment based on customer history, behavior patterns, and
     * relationship context.
     * 
     * Format: UUID or customer account number
     * Example: "CUST-123456789" or "c1d2e3f4-g5h6-7890-ijkl-mn1234567890"
     * 
     * Business Rules:
     * - Must exist in the unified customer database
     * - Used for customer behavior analysis and risk profiling
     * - Required for KYC/AML compliance checks
     * - Enables personalized risk assessment based on customer history
     * - Links to digital onboarding and customer due diligence data
     */
    private String customerId;

    /**
     * Transaction amount with high precision for financial calculations.
     * 
     * Uses BigDecimal to ensure precise monetary calculations without 
     * floating-point precision issues, critical for financial accuracy
     * and regulatory compliance in banking operations.
     * 
     * Precision: Up to 19 digits with configurable decimal places
     * Currency: Specified in separate currency field
     * 
     * Business Rules:
     * - Must be positive value for standard transactions
     * - Used in risk scoring algorithms for amount-based risk assessment
     * - Critical input for AI-powered predictive modeling
     * - Required for regulatory reporting and compliance monitoring
     * - Supports multi-currency transaction processing
     */
    private BigDecimal amount;

    /**
     * ISO 4217 currency code for the transaction amount.
     * 
     * Standardized three-letter currency code enabling support for
     * cross-border payment processing and multi-currency operations
     * as part of the blockchain-based settlement network.
     * 
     * Format: ISO 4217 standard (3-letter codes)
     * Examples: "USD", "EUR", "GBP", "JPY", "INR"
     * 
     * Business Rules:
     * - Must be valid ISO 4217 currency code
     * - Used for currency-specific risk assessment rules
     * - Required for cross-border transaction monitoring
     * - Enables regulatory compliance across different jurisdictions
     * - Supports real-time currency risk evaluation
     */
    private String currency;

    /**
     * Precise timestamp when the transaction was initiated.
     * 
     * Uses Instant for UTC-based timestamp ensuring consistent
     * time handling across distributed microservices and multiple
     * time zones. Critical for time-based fraud detection patterns
     * and regulatory compliance reporting.
     * 
     * Format: ISO-8601 UTC timestamp with nanosecond precision
     * Example: "2025-01-15T14:30:25.123456789Z"
     * 
     * Business Rules:
     * - Must be in UTC timezone for consistency
     * - Used for time-pattern analysis in fraud detection
     * - Required for transaction sequencing and ordering
     * - Critical for audit trails and compliance reporting
     * - Enables velocity-based fraud detection algorithms
     * - Used in blockchain timestamp validation
     */
    private Instant transactionTimestamp;

    /**
     * Type/category of the transaction being processed.
     * 
     * Classifies transactions for type-specific risk assessment rules
     * and fraud detection patterns. Different transaction types have
     * different risk profiles and require specialized analysis.
     * 
     * Examples: "TRANSFER", "PAYMENT", "WITHDRAWAL", "DEPOSIT", 
     *          "PURCHASE", "REFUND", "FOREX", "INVESTMENT"
     * 
     * Business Rules:
     * - Must be from predefined transaction type catalog
     * - Used for transaction-type specific risk scoring
     * - Required for regulatory classification and reporting
     * - Enables specialized fraud detection algorithms per type
     * - Used in compliance automation for transaction monitoring
     */
    private String transactionType;

    /**
     * Information about the merchant or recipient of the transaction.
     * 
     * Contains merchant details including name, category, location, and
     * identifier for comprehensive merchant-based risk assessment.
     * Critical for identifying merchant-related fraud patterns and
     * high-risk merchant categories.
     * 
     * Format: JSON string or delimited fields
     * Example: "MerchantName|Category|Location|ID" or JSON structure
     * 
     * Business Rules:
     * - May contain PII requiring encryption and data protection
     * - Used for merchant risk scoring and blacklist checking
     * - Required for card-not-present transaction analysis
     * - Enables merchant category-based risk assessment
     * - Used in machine learning models for merchant pattern analysis
     */
    private String merchantInfo;

    /**
     * IP address from which the transaction was initiated.
     * 
     * Critical for geographic risk assessment, device tracking, and
     * identifying suspicious access patterns. Used in AI-powered
     * fraud detection for location-based risk scoring.
     * 
     * Format: IPv4 or IPv6 address
     * Examples: "192.168.1.100", "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
     * 
     * Business Rules:
     * - Must be valid IP address format
     * - Used for geolocation-based fraud detection
     * - Required for velocity checking and access pattern analysis
     * - Critical for identifying proxy/VPN usage for fraud prevention
     * - Used in machine learning models for IP reputation scoring
     * - Required for regulatory compliance and audit trails
     */
    private String ipAddress;

    /**
     * Unique fingerprint of the device used for the transaction.
     * 
     * Device fingerprinting data used for device-based fraud detection
     * and authentication. Helps identify device anomalies, new devices,
     * and suspicious device characteristics in real-time risk assessment.
     * 
     * Format: Hash or encoded device characteristics
     * Example: "dev_fp_a1b2c3d4e5f6789012345abcdef67890"
     * 
     * Business Rules:
     * - Generated by client-side device fingerprinting libraries
     * - Used for device-based risk scoring and authentication
     * - Critical for identifying device takeover attacks
     * - Enables new device detection and verification workflows
     * - Used in behavioral biometrics and fraud prevention
     * - Required for advanced fraud detection pattern recognition
     */
    private String deviceFingerprint;
}