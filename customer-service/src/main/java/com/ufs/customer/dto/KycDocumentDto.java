package com.ufs.customer.dto;

import java.time.LocalDate; // Java 21 LTS - Date handling for document expiry
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Future;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Data Transfer Object for KYC (Know Your Customer) documents.
 * 
 * This class serves as the primary data transfer mechanism for customer identity 
 * verification documents during the digital onboarding process, specifically 
 * addressing functional requirement F-004: Digital Customer Onboarding.
 * 
 * The DTO implements strict validation rules to comply with KYC/AML protocols
 * and regulatory requirements including:
 * - Bank Secrecy Act (BSA) compliance
 * - Customer Identification Programme (CIP) requirements
 * - Customer Due Diligence (CDD) processes
 * - International KYC/AML regulatory standards
 * 
 * Key Features:
 * - Supports government-issued ID verification (F-004-RQ-001)
 * - Enables digital identity verification workflows
 * - Provides structured data for compliance reporting
 * - Facilitates automated risk assessment integration
 * 
 * Security Considerations:
 * - Document URLs should reference secure, encrypted storage
 * - PII data handling follows financial industry security standards
 * - Audit trail compatibility for compliance monitoring
 * 
 * Performance Requirements:
 * - Optimized for sub-5-minute onboarding process
 * - Compatible with real-time verification APIs
 * - Supports batch processing for compliance reporting
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2024-01-01
 */
@Schema(
    description = "KYC Document Data Transfer Object for customer identity verification",
    example = """
        {
            "documentType": "PASSPORT",
            "documentNumber": "A12345678",
            "expiryDate": "2030-12-31",
            "documentUrl": "https://secure-storage.ufs.com/documents/abc123def456",
            "status": "VERIFIED"
        }
        """
)
public class KycDocumentDto {

    /**
     * Type of government-issued identity document.
     * 
     * Supported document types for KYC compliance:
     * - PASSPORT: International passport document
     * - NATIONAL_ID: National identity card
     * - DRIVING_LICENSE: Government-issued driving license
     * - RESIDENCE_PERMIT: Immigration residence document
     * 
     * This field is critical for F-004-RQ-001 (Digital identity verification)
     * and must align with regulatory accepted document types.
     */
    @Schema(
        description = "Type of government-issued identity document",
        example = "PASSPORT",
        allowableValues = {"PASSPORT", "NATIONAL_ID", "DRIVING_LICENSE", "RESIDENCE_PERMIT"},
        required = true
    )
    @NotBlank(message = "Document type is mandatory for KYC compliance")
    @Pattern(
        regexp = "^(PASSPORT|NATIONAL_ID|DRIVING_LICENSE|RESIDENCE_PERMIT)$",
        message = "Document type must be one of: PASSPORT, NATIONAL_ID, DRIVING_LICENSE, RESIDENCE_PERMIT"
    )
    @JsonProperty("documentType")
    private String documentType;

    /**
     * Unique identifier/number of the identity document.
     * 
     * This field contains the official document number as issued by the
     * government authority. Critical for identity verification processes
     * and compliance with CIP (Customer Identification Programme) requirements.
     * 
     * Security Note: This field contains sensitive PII and should be handled
     * according to financial industry data protection standards.
     */
    @Schema(
        description = "Unique document number as issued by government authority",
        example = "A12345678",
        required = true,
        minLength = 3,
        maxLength = 50
    )
    @NotBlank(message = "Document number is required for identity verification")
    @Size(
        min = 3, 
        max = 50, 
        message = "Document number must be between 3 and 50 characters"
    )
    @Pattern(
        regexp = "^[A-Za-z0-9\\-\\s]+$",
        message = "Document number can only contain alphanumeric characters, hyphens, and spaces"
    )
    @JsonProperty("documentNumber")
    private String documentNumber;

    /**
     * Document expiration date.
     * 
     * Essential for validating document validity during the KYC process.
     * Documents must be valid (not expired) to pass identity verification.
     * 
     * Business Rule: Only documents with future expiry dates are accepted
     * for new customer onboarding to ensure ongoing identity validity.
     */
    @Schema(
        description = "Document expiration date (must be in the future for new applications)",
        example = "2030-12-31",
        required = true,
        type = "string",
        format = "date"
    )
    @NotNull(message = "Document expiry date is required for validity verification")
    @Future(message = "Document must be valid (expiry date in the future) for onboarding")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @JsonProperty("expiryDate")
    private LocalDate expiryDate;

    /**
     * Secure URL reference to the uploaded document image/scan.
     * 
     * Points to encrypted storage location containing the digital copy
     * of the identity document. Used for:
     * - Manual verification processes
     * - AI-powered document authentication
     * - Compliance audit requirements
     * - Dispute resolution processes
     * 
     * Security Requirements:
     * - Must reference HTTPS secure storage
     * - Access should be time-limited and authenticated
     * - Storage should support audit logging
     */
    @Schema(
        description = "Secure HTTPS URL to the uploaded document image in encrypted storage",
        example = "https://secure-storage.ufs.com/documents/abc123def456",
        required = true,
        format = "uri"
    )
    @NotBlank(message = "Document URL is required for verification processing")
    @Pattern(
        regexp = "^https://[a-zA-Z0-9\\-\\.]+\\.[a-zA-Z]{2,}(/.*)?$",
        message = "Document URL must be a valid HTTPS URL"
    )
    @Size(
        max = 500,
        message = "Document URL cannot exceed 500 characters"
    )
    @JsonProperty("documentUrl")
    private String documentUrl;

    /**
     * Current verification status of the KYC document.
     * 
     * Tracks the document through the verification workflow:
     * - PENDING: Document uploaded, awaiting verification
     * - PROCESSING: Under review (manual or automated)
     * - VERIFIED: Successfully verified and accepted
     * - REJECTED: Failed verification, requires resubmission
     * - EXPIRED: Document has expired and needs renewal
     * 
     * This status drives the customer onboarding workflow and determines
     * account activation eligibility.
     */
    @Schema(
        description = "Current verification status of the document",
        example = "VERIFIED",
        allowableValues = {"PENDING", "PROCESSING", "VERIFIED", "REJECTED", "EXPIRED"},
        required = true
    )
    @NotBlank(message = "Document status is required for workflow management")
    @Pattern(
        regexp = "^(PENDING|PROCESSING|VERIFIED|REJECTED|EXPIRED)$",
        message = "Status must be one of: PENDING, PROCESSING, VERIFIED, REJECTED, EXPIRED"
    )
    @JsonProperty("status")
    private String status;

    /**
     * Default constructor for KycDocumentDto.
     * 
     * Creates an empty instance suitable for:
     * - JSON deserialization
     * - Builder pattern initialization
     * - Framework instantiation (Spring, Jackson)
     * - Unit testing scenarios
     * 
     * Note: All fields must be populated before use in production workflows
     * to ensure KYC compliance and data integrity.
     */
    public KycDocumentDto() {
        // Default constructor for framework compatibility
        // Fields initialized to null - must be populated before use
    }

    /**
     * Retrieves the type of government-issued identity document.
     * 
     * @return The document type (PASSPORT, NATIONAL_ID, DRIVING_LICENSE, RESIDENCE_PERMIT)
     */
    public String getDocumentType() {
        return documentType;
    }

    /**
     * Sets the type of government-issued identity document.
     * 
     * @param documentType The document type to set
     *                    Must be one of: PASSPORT, NATIONAL_ID, DRIVING_LICENSE, RESIDENCE_PERMIT
     */
    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    /**
     * Retrieves the unique document number as issued by government authority.
     * 
     * @return The official document number/identifier
     */
    public String getDocumentNumber() {
        return documentNumber;
    }

    /**
     * Sets the unique document number for identity verification.
     * 
     * @param documentNumber The official document number to set
     *                      Must be 3-50 characters, alphanumeric with hyphens/spaces allowed
     */
    public void setDocumentNumber(String documentNumber) {
        this.documentNumber = documentNumber;
    }

    /**
     * Retrieves the document expiration date.
     * 
     * @return The expiry date as LocalDate object
     */
    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    /**
     * Sets the document expiration date for validity verification.
     * 
     * @param expiryDate The expiry date to set
     *                   Must be in the future for new customer onboarding
     */
    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    /**
     * Retrieves the secure URL to the uploaded document image.
     * 
     * @return The HTTPS URL pointing to the document in encrypted storage
     */
    public String getDocumentUrl() {
        return documentUrl;
    }

    /**
     * Sets the secure URL reference to the document image.
     * 
     * @param documentUrl The HTTPS URL to set
     *                   Must be a valid HTTPS URL pointing to secure storage
     */
    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    /**
     * Retrieves the current verification status of the document.
     * 
     * @return The verification status (PENDING, PROCESSING, VERIFIED, REJECTED, EXPIRED)
     */
    public String getStatus() {
        return status;
    }

    /**
     * Sets the verification status for workflow management.
     * 
     * @param status The verification status to set
     *              Must be one of: PENDING, PROCESSING, VERIFIED, REJECTED, EXPIRED
     */
    public void setStatus(String status) {
        this.status = status;
    }

    /**
     * Provides a string representation of the KycDocumentDto.
     * 
     * Note: Excludes sensitive document number for security purposes
     * in log files and debugging output.
     * 
     * @return A string representation with non-sensitive fields only
     */
    @Override
    public String toString() {
        return "KycDocumentDto{" +
                "documentType='" + documentType + '\'' +
                ", documentNumber='[REDACTED]'" + // Security: Hide sensitive PII in logs
                ", expiryDate=" + expiryDate +
                ", documentUrl='[REDACTED]'" + // Security: Hide URLs in logs
                ", status='" + status + '\'' +
                '}';
    }

    /**
     * Validates if the document is currently valid (not expired).
     * 
     * Business logic helper method for determining document validity
     * during the verification process.
     * 
     * @return true if the document is valid (expiry date is in the future), false otherwise
     */
    public boolean isDocumentValid() {
        return expiryDate != null && expiryDate.isAfter(LocalDate.now());
    }

    /**
     * Checks if the document has been successfully verified.
     * 
     * Convenience method for workflow decision-making and business logic.
     * 
     * @return true if the document status is VERIFIED, false otherwise
     */
    public boolean isVerified() {
        return "VERIFIED".equals(status);
    }

    /**
     * Determines if the document is in a processing state.
     * 
     * Helper method to identify documents that are actively being processed
     * for verification.
     * 
     * @return true if the document is PENDING or PROCESSING, false otherwise
     */
    public boolean isProcessing() {
        return "PENDING".equals(status) || "PROCESSING".equals(status);
    }
}