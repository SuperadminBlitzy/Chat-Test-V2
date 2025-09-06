package com.ufs.customer.model;

// Jakarta Persistence API 3.1.0 - JPA entity annotations and lifecycle management
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.Index;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;

// Java Time API - Standard Java library for date/time handling
import java.time.LocalDate;
import java.time.LocalDateTime;

// Java Util - Standard Java library for UUID and validation
import java.util.UUID;
import java.util.Objects;

/**
 * KYC Document Entity - Core component of the Digital Customer Onboarding feature (F-004)
 * 
 * This JPA entity represents a Know Your Customer (KYC) document provided by customers
 * during the digital onboarding process for identity verification and regulatory compliance.
 * 
 * Business Context:
 * - Supports KYC/AML compliance checks as required by financial regulations
 * - Enables digital identity verification through document validation
 * - Stores document metadata for audit trails and regulatory reporting
 * - Integrates with AI-powered risk assessment for document authenticity
 * 
 * Technical Implementation:
 * - Persists to PostgreSQL database in 'kyc_documents' table
 * - Uses UUID-based primary key generation for enhanced security
 * - Implements audit trail with created/updated timestamps
 * - Supports document verification status tracking throughout lifecycle
 * 
 * Regulatory Compliance:
 * - Supports Bank Secrecy Act (BSA) requirements
 * - Enables Customer Identification Programme (CIP) compliance
 * - Facilitates Customer Due Diligence (CDD) processes
 * - Maintains audit logs for regulatory reporting
 * 
 * @version 1.0
 * @since 2025-01-01
 * @author UFS Development Team
 */
@Entity
@Table(name = "kyc_documents", indexes = {
    @Index(name = "idx_kyc_customer_id", columnList = "customer_id"),
    @Index(name = "idx_kyc_document_type", columnList = "document_type"),
    @Index(name = "idx_kyc_verification_status", columnList = "verification_status"),
    @Index(name = "idx_kyc_created_at", columnList = "created_at"),
    @Index(name = "idx_kyc_expiry_date", columnList = "expiry_date")
})
public class KycDocument {

    /**
     * Document Verification Status Enumeration
     * 
     * Represents the various states of document verification in the KYC process:
     * - PENDING: Document uploaded, awaiting verification
     * - IN_PROGRESS: Document is being verified by AI systems or manual review
     * - VERIFIED: Document successfully verified and approved
     * - REJECTED: Document failed verification checks
     * - EXPIRED: Document has expired and requires replacement
     * - FLAGGED: Document flagged for manual review due to anomalies
     */
    public enum DocumentVerificationStatus {
        PENDING,
        IN_PROGRESS,
        VERIFIED,
        REJECTED,
        EXPIRED,
        FLAGGED
    }

    /**
     * Document Type Enumeration
     * 
     * Supported KYC document types for identity verification:
     * - PASSPORT: International passport document
     * - DRIVERS_LICENSE: Government-issued driver's license
     * - NATIONAL_ID: National identity card or state ID
     * - UTILITY_BILL: Proof of address utility bill
     * - BANK_STATEMENT: Bank statement for address verification
     * - TAX_DOCUMENT: Tax return or assessment document
     * - BIRTH_CERTIFICATE: Birth certificate for identity verification
     * - SOCIAL_SECURITY: Social security card or equivalent
     */
    public enum DocumentType {
        PASSPORT,
        DRIVERS_LICENSE,
        NATIONAL_ID,
        UTILITY_BILL,
        BANK_STATEMENT,
        TAX_DOCUMENT,
        BIRTH_CERTIFICATE,
        SOCIAL_SECURITY
    }

    /**
     * Primary Key - Unique identifier for the KYC document
     * 
     * Uses UUID generation strategy for enhanced security and distributed system compatibility.
     * UUID provides better security than sequential IDs and prevents enumeration attacks.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    /**
     * Customer Reference - Links document to customer record
     * 
     * Foreign key reference to the customer who provided this document.
     * Essential for associating documents with customer profiles during onboarding.
     * Indexed for efficient customer document retrieval.
     */
    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    /**
     * Document Type Classification
     * 
     * Categorizes the type of document provided by the customer.
     * Used for determining appropriate verification workflows and compliance requirements.
     * Different document types may require different validation rules.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 50)
    private DocumentType documentType;

    /**
     * Document Number - Unique identifier from the document itself
     * 
     * The identification number printed on the document (e.g., passport number, license number).
     * Used for document authenticity verification and cross-referencing with external databases.
     * Critical for KYC compliance and identity verification processes.
     */
    @Column(name = "document_number", nullable = false, length = 100)
    private String documentNumber;

    /**
     * Document Expiry Date
     * 
     * The expiration date of the document as printed on the document.
     * Used to determine document validity and trigger renewal notifications.
     * Critical for maintaining compliance with current document requirements.
     */
    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    /**
     * Verification Status - Current state of document verification
     * 
     * Tracks the verification status throughout the KYC process lifecycle.
     * Updated by automated verification systems and manual review processes.
     * Used for workflow management and compliance reporting.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 20)
    private DocumentVerificationStatus verificationStatus;

    /**
     * Document Storage URL
     * 
     * Secure reference to the stored document file in the document management system.
     * Points to encrypted document storage with appropriate access controls.
     * Used for document retrieval during verification and audit processes.
     */
    @Column(name = "document_url", nullable = false, length = 500)
    private String documentUrl;

    /**
     * Document Issue Date
     * 
     * The date when the document was issued by the issuing authority.
     * Used for document age verification and authenticity checks.
     * Helps determine document validity period and compliance requirements.
     */
    @Column(name = "issue_date")
    private LocalDate issueDate;

    /**
     * Issuing Authority
     * 
     * The government agency or authority that issued the document.
     * Used for document authenticity verification and compliance checks.
     * Critical for validating document legitimacy and jurisdiction compliance.
     */
    @Column(name = "issuing_authority", length = 200)
    private String issuingAuthority;

    /**
     * Document Country of Origin
     * 
     * ISO 3166-1 alpha-2 country code of the document's issuing country.
     * Used for international compliance and risk assessment.
     * Helps determine applicable regulations and verification requirements.
     */
    @Column(name = "country_code", length = 2)
    private String countryCode;

    /**
     * Document File Hash
     * 
     * SHA-256 hash of the uploaded document file for integrity verification.
     * Ensures document hasn't been tampered with after upload.
     * Critical for maintaining audit trail and regulatory compliance.
     */
    @Column(name = "file_hash", length = 64)
    private String fileHash;

    /**
     * Document File Size
     * 
     * Size of the uploaded document file in bytes.
     * Used for storage management and validation purposes.
     * Helps prevent oversized uploads and optimize storage allocation.
     */
    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    /**
     * MIME Type of the Document File
     * 
     * The media type of the uploaded document (e.g., application/pdf, image/jpeg).
     * Used for file validation and appropriate document processing.
     * Ensures only supported file types are processed.
     */
    @Column(name = "mime_type", length = 100)
    private String mimeType;

    /**
     * Verification Notes
     * 
     * Additional notes from automated or manual verification processes.
     * Contains details about verification results, anomalies, or special conditions.
     * Important for audit trails and manual review processes.
     */
    @Column(name = "verification_notes", length = 1000)
    private String verificationNotes;

    /**
     * Risk Score
     * 
     * AI-generated risk score for the document (0.0 to 1.0 scale).
     * Higher scores indicate higher risk or lower confidence in document authenticity.
     * Used for automated decision making and manual review prioritization.
     */
    @Column(name = "risk_score", precision = 5, scale = 4)
    private Double riskScore;

    /**
     * Verification Method
     * 
     * The method used to verify the document (AUTOMATED, MANUAL, HYBRID).
     * Tracks how the document was processed for audit and quality assurance.
     * Helps optimize verification workflows and compliance reporting.
     */
    @Column(name = "verification_method", length = 20)
    private String verificationMethod;

    /**
     * Audit Trail - Record Creation Timestamp
     * 
     * Automatically set when the record is first persisted to the database.
     * Immutable timestamp for audit trails and regulatory compliance.
     * Critical for maintaining accurate record-keeping requirements.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime createdAt;

    /**
     * Audit Trail - Last Updated Timestamp
     * 
     * Automatically updated whenever the record is modified.
     * Tracks the most recent change to the document record.
     * Essential for audit trails and change tracking.
     */
    @Column(name = "updated_at", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime updatedAt;

    /**
     * User who created the record
     * 
     * Reference to the system user or process that created this document record.
     * Used for audit trails and accountability tracking.
     * Important for compliance and security investigations.
     */
    @Column(name = "created_by", length = 100)
    private String createdBy;

    /**
     * User who last updated the record
     * 
     * Reference to the system user who made the most recent update.
     * Critical for audit trails and change management.
     * Helps track responsibility for document modifications.
     */
    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    /**
     * Document Retention Period
     * 
     * Date until which the document must be retained for regulatory compliance.
     * Based on applicable regulations and institutional policies.
     * Used for automated document lifecycle management.
     */
    @Column(name = "retention_until")
    private LocalDate retentionUntil;

    /**
     * Regulatory Tags
     * 
     * Comma-separated tags for regulatory classification and reporting.
     * Examples: "BSA", "CIP", "CDD", "AML", "PATRIOT_ACT"
     * Used for compliance reporting and regulatory audit preparation.
     */
    @Column(name = "regulatory_tags", length = 500)
    private String regulatoryTags;

    /**
     * Default Constructor
     * 
     * Required by JPA specification for entity instantiation.
     * Initializes the entity with default verification status.
     * Sets initial audit timestamps through lifecycle callbacks.
     */
    public KycDocument() {
        this.verificationStatus = DocumentVerificationStatus.PENDING;
    }

    /**
     * Primary Constructor for KYC Document Creation
     * 
     * Creates a new KYC document with essential information required for the digital onboarding process.
     * Automatically sets initial verification status and audit information.
     * 
     * @param customerId The UUID of the customer providing the document
     * @param documentType The type of document being provided (enum value)
     * @param documentNumber The unique identifier from the document
     * @param documentUrl The secure URL where the document file is stored
     * @param createdBy The system user creating this record
     */
    public KycDocument(UUID customerId, DocumentType documentType, String documentNumber, 
                      String documentUrl, String createdBy) {
        this();
        this.customerId = customerId;
        this.documentType = documentType;
        this.documentNumber = documentNumber;
        this.documentUrl = documentUrl;
        this.createdBy = createdBy;
        this.updatedBy = createdBy;
    }

    /**
     * Complete Constructor for KYC Document with Full Details
     * 
     * Creates a KYC document with comprehensive information including expiry date and issuing details.
     * Used when complete document information is available during creation.
     * 
     * @param customerId The UUID of the customer providing the document
     * @param documentType The type of document being provided
     * @param documentNumber The unique identifier from the document
     * @param expiryDate The document's expiration date
     * @param documentUrl The secure URL where the document file is stored
     * @param issueDate The date when the document was issued
     * @param issuingAuthority The authority that issued the document
     * @param countryCode ISO country code of the issuing country
     * @param createdBy The system user creating this record
     */
    public KycDocument(UUID customerId, DocumentType documentType, String documentNumber,
                      LocalDate expiryDate, String documentUrl, LocalDate issueDate,
                      String issuingAuthority, String countryCode, String createdBy) {
        this(customerId, documentType, documentNumber, documentUrl, createdBy);
        this.expiryDate = expiryDate;
        this.issueDate = issueDate;
        this.issuingAuthority = issuingAuthority;
        this.countryCode = countryCode;
    }

    /**
     * JPA Lifecycle Callback - Before Persist
     * 
     * Automatically executed before the entity is first saved to the database.
     * Sets the creation timestamp and ensures audit trail integrity.
     * Critical for maintaining accurate record-keeping for regulatory compliance.
     */
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        
        // Ensure verification status is set
        if (this.verificationStatus == null) {
            this.verificationStatus = DocumentVerificationStatus.PENDING;
        }
        
        // Set default retention period if not specified (7 years for financial records)
        if (this.retentionUntil == null) {
            this.retentionUntil = LocalDate.now().plusYears(7);
        }
    }

    /**
     * JPA Lifecycle Callback - Before Update
     * 
     * Automatically executed before the entity is updated in the database.
     * Updates the modification timestamp for audit trail purposes.
     * Ensures accurate tracking of all changes for compliance requirements.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Business Logic - Check if Document is Expired
     * 
     * Determines whether the document has expired based on its expiry date.
     * Used for automatic status updates and compliance validation.
     * 
     * @return true if the document has expired, false otherwise
     */
    public boolean isExpired() {
        return expiryDate != null && expiryDate.isBefore(LocalDate.now());
    }

    /**
     * Business Logic - Check if Document is Valid for KYC
     * 
     * Determines whether the document meets basic KYC validity requirements.
     * Checks expiration status and verification status.
     * 
     * @return true if the document is valid for KYC purposes, false otherwise
     */
    public boolean isValidForKyc() {
        return !isExpired() && 
               (verificationStatus == DocumentVerificationStatus.VERIFIED ||
                verificationStatus == DocumentVerificationStatus.IN_PROGRESS);
    }

    /**
     * Business Logic - Check if Document Needs Manual Review
     * 
     * Determines whether the document requires manual review based on status or risk score.
     * Used for workflow management and quality assurance processes.
     * 
     * @return true if manual review is required, false otherwise
     */
    public boolean needsManualReview() {
        return verificationStatus == DocumentVerificationStatus.FLAGGED ||
               (riskScore != null && riskScore > 0.7);
    }

    /**
     * Business Logic - Update Verification Status with Audit Trail
     * 
     * Updates the verification status while maintaining proper audit trail.
     * Ensures all status changes are properly tracked for compliance.
     * 
     * @param newStatus The new verification status
     * @param updatedBy The user making the status change
     * @param notes Additional notes about the status change
     */
    public void updateVerificationStatus(DocumentVerificationStatus newStatus, 
                                       String updatedBy, String notes) {
        this.verificationStatus = newStatus;
        this.updatedBy = updatedBy;
        
        // Append to existing notes with timestamp
        String timestampedNote = LocalDateTime.now() + " - " + notes;
        if (this.verificationNotes == null || this.verificationNotes.trim().isEmpty()) {
            this.verificationNotes = timestampedNote;
        } else {
            this.verificationNotes += "\n" + timestampedNote;
        }
    }

    // Getter and Setter Methods with Comprehensive Documentation

    /**
     * Gets the unique identifier for this KYC document.
     * 
     * @return The UUID primary key of this document record
     */
    public UUID getId() {
        return id;
    }

    /**
     * Sets the unique identifier for this KYC document.
     * Note: This should only be used by the JPA framework.
     * 
     * @param id The UUID primary key to set
     */
    public void setId(UUID id) {
        this.id = id;
    }

    /**
     * Gets the customer identifier associated with this document.
     * 
     * @return The UUID of the customer who provided this document
     */
    public UUID getCustomerId() {
        return customerId;
    }

    /**
     * Sets the customer identifier for this document.
     * 
     * @param customerId The UUID of the customer providing the document
     */
    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }

    /**
     * Gets the type of this KYC document.
     * 
     * @return The document type enumeration value
     */
    public DocumentType getDocumentType() {
        return documentType;
    }

    /**
     * Sets the type of this KYC document.
     * 
     * @param documentType The document type to set
     */
    public void setDocumentType(DocumentType documentType) {
        this.documentType = documentType;
    }

    /**
     * Gets the document number as printed on the document.
     * 
     * @return The document's unique identification number
     */
    public String getDocumentNumber() {
        return documentNumber;
    }

    /**
     * Sets the document number from the physical document.
     * 
     * @param documentNumber The document's unique identification number
     */
    public void setDocumentNumber(String documentNumber) {
        this.documentNumber = documentNumber;
    }

    /**
     * Gets the expiration date of the document.
     * 
     * @return The document's expiry date, or null if not applicable
     */
    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    /**
     * Sets the expiration date of the document.
     * 
     * @param expiryDate The document's expiry date
     */
    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    /**
     * Gets the current verification status of the document.
     * 
     * @return The current verification status
     */
    public DocumentVerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    /**
     * Sets the verification status of the document.
     * Consider using updateVerificationStatus() for better audit trail management.
     * 
     * @param verificationStatus The verification status to set
     */
    public void setVerificationStatus(DocumentVerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    /**
     * Gets the secure URL where the document is stored.
     * 
     * @return The document storage URL
     */
    public String getDocumentUrl() {
        return documentUrl;
    }

    /**
     * Sets the secure URL where the document is stored.
     * 
     * @param documentUrl The document storage URL
     */
    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    /**
     * Gets the date when the document was issued.
     * 
     * @return The document issue date
     */
    public LocalDate getIssueDate() {
        return issueDate;
    }

    /**
     * Sets the date when the document was issued.
     * 
     * @param issueDate The document issue date
     */
    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    /**
     * Gets the authority that issued the document.
     * 
     * @return The issuing authority name
     */
    public String getIssuingAuthority() {
        return issuingAuthority;
    }

    /**
     * Sets the authority that issued the document.
     * 
     * @param issuingAuthority The issuing authority name
     */
    public void setIssuingAuthority(String issuingAuthority) {
        this.issuingAuthority = issuingAuthority;
    }

    /**
     * Gets the ISO country code of the document's issuing country.
     * 
     * @return The ISO 3166-1 alpha-2 country code
     */
    public String getCountryCode() {
        return countryCode;
    }

    /**
     * Sets the ISO country code of the document's issuing country.
     * 
     * @param countryCode The ISO 3166-1 alpha-2 country code
     */
    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    /**
     * Gets the SHA-256 hash of the document file.
     * 
     * @return The document file hash for integrity verification
     */
    public String getFileHash() {
        return fileHash;
    }

    /**
     * Sets the SHA-256 hash of the document file.
     * 
     * @param fileHash The document file hash
     */
    public void setFileHash(String fileHash) {
        this.fileHash = fileHash;
    }

    /**
     * Gets the size of the document file in bytes.
     * 
     * @return The file size in bytes
     */
    public Long getFileSizeBytes() {
        return fileSizeBytes;
    }

    /**
     * Sets the size of the document file in bytes.
     * 
     * @param fileSizeBytes The file size in bytes
     */
    public void setFileSizeBytes(Long fileSizeBytes) {
        this.fileSizeBytes = fileSizeBytes;
    }

    /**
     * Gets the MIME type of the document file.
     * 
     * @return The document file MIME type
     */
    public String getMimeType() {
        return mimeType;
    }

    /**
     * Sets the MIME type of the document file.
     * 
     * @param mimeType The document file MIME type
     */
    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    /**
     * Gets the verification notes for this document.
     * 
     * @return The verification notes
     */
    public String getVerificationNotes() {
        return verificationNotes;
    }

    /**
     * Sets the verification notes for this document.
     * 
     * @param verificationNotes The verification notes
     */
    public void setVerificationNotes(String verificationNotes) {
        this.verificationNotes = verificationNotes;
    }

    /**
     * Gets the AI-generated risk score for this document.
     * 
     * @return The risk score (0.0 to 1.0 scale)
     */
    public Double getRiskScore() {
        return riskScore;
    }

    /**
     * Sets the AI-generated risk score for this document.
     * 
     * @param riskScore The risk score (0.0 to 1.0 scale)
     */
    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
    }

    /**
     * Gets the method used to verify this document.
     * 
     * @return The verification method
     */
    public String getVerificationMethod() {
        return verificationMethod;
    }

    /**
     * Sets the method used to verify this document.
     * 
     * @param verificationMethod The verification method
     */
    public void setVerificationMethod(String verificationMethod) {
        this.verificationMethod = verificationMethod;
    }

    /**
     * Gets the timestamp when this record was created.
     * 
     * @return The record creation timestamp
     */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * Sets the timestamp when this record was created.
     * Note: This is typically managed by JPA lifecycle callbacks.
     * 
     * @param createdAt The record creation timestamp
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Gets the timestamp when this record was last updated.
     * 
     * @return The last update timestamp
     */
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    /**
     * Sets the timestamp when this record was last updated.
     * Note: This is typically managed by JPA lifecycle callbacks.
     * 
     * @param updatedAt The last update timestamp
     */
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * Gets the user who created this record.
     * 
     * @return The creator's user identifier
     */
    public String getCreatedBy() {
        return createdBy;
    }

    /**
     * Sets the user who created this record.
     * 
     * @param createdBy The creator's user identifier
     */
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    /**
     * Gets the user who last updated this record.
     * 
     * @return The last updater's user identifier
     */
    public String getUpdatedBy() {
        return updatedBy;
    }

    /**
     * Sets the user who last updated this record.
     * 
     * @param updatedBy The last updater's user identifier
     */
    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    /**
     * Gets the date until which this document must be retained.
     * 
     * @return The retention deadline
     */
    public LocalDate getRetentionUntil() {
        return retentionUntil;
    }

    /**
     * Sets the date until which this document must be retained.
     * 
     * @param retentionUntil The retention deadline
     */
    public void setRetentionUntil(LocalDate retentionUntil) {
        this.retentionUntil = retentionUntil;
    }

    /**
     * Gets the regulatory tags for this document.
     * 
     * @return The comma-separated regulatory tags
     */
    public String getRegulatoryTags() {
        return regulatoryTags;
    }

    /**
     * Sets the regulatory tags for this document.
     * 
     * @param regulatoryTags The comma-separated regulatory tags
     */
    public void setRegulatoryTags(String regulatoryTags) {
        this.regulatoryTags = regulatoryTags;
    }

    /**
     * Equals method for entity comparison.
     * 
     * Two KycDocument entities are considered equal if they have the same ID.
     * This follows JPA best practices for entity equality.
     * 
     * @param obj The object to compare with
     * @return true if the objects are equal, false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        KycDocument that = (KycDocument) obj;
        return Objects.equals(id, that.id);
    }

    /**
     * Hash code method for entity hashing.
     * 
     * Uses the ID field for hash code generation, following JPA best practices.
     * Ensures consistency with equals() method.
     * 
     * @return The hash code for this entity
     */
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    /**
     * String representation of the KYC document.
     * 
     * Provides a human-readable representation without exposing sensitive information.
     * Used for logging and debugging purposes while maintaining security.
     * 
     * @return A string representation of this entity
     */
    @Override
    public String toString() {
        return "KycDocument{" +
                "id=" + id +
                ", customerId=" + customerId +
                ", documentType=" + documentType +
                ", verificationStatus=" + verificationStatus +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", isExpired=" + isExpired() +
                '}';
    }
}