package com.ufs.customer.model;

import org.springframework.data.mongodb.core.mapping.Document; // Spring Data MongoDB 4.2.0
import org.springframework.data.annotation.Id; // Spring Data Core 3.2.0
import org.springframework.data.mongodb.core.mapping.Field; // Spring Data MongoDB 4.2.0
import java.util.List; // Java 21
import java.util.Date; // Java 21
import java.math.BigDecimal; // Java 21

/**
 * CustomerProfile represents the comprehensive profile of a customer stored as a MongoDB document.
 * This class implements the unified customer data model as specified in the technical requirements
 * for F-001 (Unified Data Integration Platform) and F-004 (Digital Customer Onboarding).
 * 
 * The document structure supports:
 * - Unified customer profile consolidation across all touchpoints
 * - KYC/AML compliance requirements for digital onboarding
 * - Risk assessment and scoring capabilities
 * - Comprehensive audit trail and metadata tracking
 * 
 * Collection: customer_profiles
 * Database: MongoDB 7.0+
 * Framework: Spring Data MongoDB 4.2.0
 */
@Document(collection = "customer_profiles")
public class CustomerProfile {

    /**
     * Primary identifier for the customer profile document.
     * MongoDB ObjectId automatically generated if not provided.
     */
    @Id
    private String id;

    /**
     * Unique customer identifier used across all systems.
     * This serves as the business key for customer identification.
     */
    @Field("customer_id")
    private String customerId;

    /**
     * Personal information of the customer including demographics and contact details.
     * Essential for KYC compliance and customer communication.
     */
    @Field("personal_info")
    private PersonalInfo personalInfo;

    /**
     * List of customer addresses including residential, business, and correspondence addresses.
     * Supports multiple addresses with verification status for compliance requirements.
     */
    @Field("addresses")
    private List<Address> addresses;

    /**
     * Identity verification details including KYC/AML status and supporting documents.
     * Critical for regulatory compliance and digital onboarding process.
     */
    @Field("identity_verification")
    private IdentityVerification identityVerification;

    /**
     * Customer risk profile including current score, category, and contributing factors.
     * Used by the AI-powered risk assessment engine for decision making.
     */
    @Field("risk_profile")
    private RiskProfile riskProfile;

    /**
     * Customer preferences for communication, language, and marketing consent.
     * Supports personalized customer experience and compliance with privacy regulations.
     */
    @Field("preferences")
    private Preferences preferences;

    /**
     * Document metadata including creation timestamp, versioning, and data classification.
     * Essential for audit trail, compliance, and data governance.
     */
    @Field("metadata")
    private Metadata metadata;

    /**
     * Default constructor for CustomerProfile.
     * Required by Spring Data MongoDB for document instantiation.
     */
    public CustomerProfile() {
    }

    /**
     * Full constructor for CustomerProfile with all required fields.
     * 
     * @param customerId Unique customer business identifier
     * @param personalInfo Customer personal information
     * @param addresses List of customer addresses
     * @param identityVerification Identity verification details
     * @param riskProfile Customer risk assessment profile
     * @param preferences Customer communication and privacy preferences
     * @param metadata Document metadata and audit information
     */
    public CustomerProfile(String customerId, PersonalInfo personalInfo, List<Address> addresses,
                          IdentityVerification identityVerification, RiskProfile riskProfile,
                          Preferences preferences, Metadata metadata) {
        this.customerId = customerId;
        this.personalInfo = personalInfo;
        this.addresses = addresses;
        this.identityVerification = identityVerification;
        this.riskProfile = riskProfile;
        this.preferences = preferences;
        this.metadata = metadata;
    }

    // Getters and Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public PersonalInfo getPersonalInfo() {
        return personalInfo;
    }

    public void setPersonalInfo(PersonalInfo personalInfo) {
        this.personalInfo = personalInfo;
    }

    public List<Address> getAddresses() {
        return addresses;
    }

    public void setAddresses(List<Address> addresses) {
        this.addresses = addresses;
    }

    public IdentityVerification getIdentityVerification() {
        return identityVerification;
    }

    public void setIdentityVerification(IdentityVerification identityVerification) {
        this.identityVerification = identityVerification;
    }

    public RiskProfile getRiskProfile() {
        return riskProfile;
    }

    public void setRiskProfile(RiskProfile riskProfile) {
        this.riskProfile = riskProfile;
    }

    public Preferences getPreferences() {
        return preferences;
    }

    public void setPreferences(Preferences preferences) {
        this.preferences = preferences;
    }

    public Metadata getMetadata() {
        return metadata;
    }

    public void setMetadata(Metadata metadata) {
        this.metadata = metadata;
    }

    /**
     * PersonalInfo represents the personal information of a customer.
     * Contains demographic data required for KYC compliance and customer identification.
     */
    public static class PersonalInfo {

        /**
         * Customer's legal first name as per government-issued identification.
         */
        @Field("first_name")
        private String firstName;

        /**
         * Customer's legal last name as per government-issued identification.
         */
        @Field("last_name")
        private String lastName;

        /**
         * Primary email address for customer communication.
         * Used for digital onboarding notifications and account updates.
         */
        @Field("email")
        private String email;

        /**
         * Primary phone number for customer contact and two-factor authentication.
         */
        @Field("phone")
        private String phone;

        /**
         * Customer's date of birth for age verification and compliance checks.
         * Required for KYC/AML compliance and risk assessment.
         */
        @Field("date_of_birth")
        private Date dateOfBirth;

        /**
         * Customer's nationality for regulatory compliance and tax reporting.
         */
        @Field("nationality")
        private String nationality;

        // Default constructor
        public PersonalInfo() {
        }

        // Getters and Setters
        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public Date getDateOfBirth() {
            return dateOfBirth;
        }

        public void setDateOfBirth(Date dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
        }

        public String getNationality() {
            return nationality;
        }

        public void setNationality(String nationality) {
            this.nationality = nationality;
        }
    }

    /**
     * Address represents a customer's address with verification status.
     * Supports multiple address types for comprehensive customer profiling.
     */
    public static class Address {

        /**
         * Type of address (e.g., "residential", "business", "correspondence").
         * Used to categorize and prioritize address usage.
         */
        @Field("type")
        private String type;

        /**
         * Street address including house number and street name.
         */
        @Field("street")
        private String street;

        /**
         * City or municipality name.
         */
        @Field("city")
        private String city;

        /**
         * State, province, or administrative region.
         */
        @Field("state")
        private String state;

        /**
         * Postal or ZIP code for mail delivery.
         */
        @Field("zip_code")
        private String zipCode;

        /**
         * Country name or ISO country code.
         */
        @Field("country")
        private String country;

        /**
         * Date from which this address is valid.
         * Used for temporal address management and compliance.
         */
        @Field("valid_from")
        private Date validFrom;

        /**
         * Verification status indicating if the address has been validated.
         * Critical for KYC compliance and fraud prevention.
         */
        @Field("is_verified")
        private boolean isVerified;

        // Default constructor
        public Address() {
        }

        // Getters and Setters
        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getStreet() {
            return street;
        }

        public void setStreet(String street) {
            this.street = street;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public String getState() {
            return state;
        }

        public void setState(String state) {
            this.state = state;
        }

        public String getZipCode() {
            return zipCode;
        }

        public void setZipCode(String zipCode) {
            this.zipCode = zipCode;
        }

        public String getCountry() {
            return country;
        }

        public void setCountry(String country) {
            this.country = country;
        }

        public Date getValidFrom() {
            return validFrom;
        }

        public void setValidFrom(Date validFrom) {
            this.validFrom = validFrom;
        }

        public boolean isVerified() {
            return isVerified;
        }

        public void setVerified(boolean verified) {
            isVerified = verified;
        }
    }

    /**
     * IdentityVerification contains details about the customer's identity verification process.
     * Essential for KYC/AML compliance and digital customer onboarding.
     */
    public static class IdentityVerification {

        /**
         * Current KYC (Know Your Customer) verification status.
         * Values: "pending", "in_progress", "completed", "failed", "requires_review"
         */
        @Field("kyc_status")
        private String kycStatus;

        /**
         * Current AML (Anti-Money Laundering) screening status.
         * Values: "pending", "cleared", "flagged", "requires_manual_review"
         */
        @Field("aml_status")
        private String amlStatus;

        /**
         * List of identity documents submitted and verified during onboarding.
         * Includes government-issued IDs, passports, utility bills, etc.
         */
        @Field("documents")
        private List<DocumentDetails> documents;

        /**
         * Biometric verification data including face matching and liveness detection.
         * Used for enhanced security and fraud prevention.
         */
        @Field("biometric_data")
        private BiometricData biometricData;

        // Default constructor
        public IdentityVerification() {
        }

        // Getters and Setters
        public String getKycStatus() {
            return kycStatus;
        }

        public void setKycStatus(String kycStatus) {
            this.kycStatus = kycStatus;
        }

        public String getAmlStatus() {
            return amlStatus;
        }

        public void setAmlStatus(String amlStatus) {
            this.amlStatus = amlStatus;
        }

        public List<DocumentDetails> getDocuments() {
            return documents;
        }

        public void setDocuments(List<DocumentDetails> documents) {
            this.documents = documents;
        }

        public BiometricData getBiometricData() {
            return biometricData;
        }

        public void setBiometricData(BiometricData biometricData) {
            this.biometricData = biometricData;
        }
    }

    /**
     * DocumentDetails represents details of an identity document.
     * Tracks document verification status and metadata for compliance audit.
     */
    public static class DocumentDetails {

        /**
         * Type of document (e.g., "passport", "driver_license", "national_id", "utility_bill").
         */
        @Field("type")
        private String type;

        /**
         * Document number or identifier for verification purposes.
         */
        @Field("document_number")
        private String documentNumber;

        /**
         * Document expiry date for validity tracking.
         */
        @Field("expiry_date")
        private Date expiryDate;

        /**
         * Date when the document was verified by the system or manual review.
         */
        @Field("verification_date")
        private Date verificationDate;

        /**
         * Method used for document verification (e.g., "automated_ocr", "manual_review", "third_party_service").
         */
        @Field("verification_method")
        private String verificationMethod;

        // Default constructor
        public DocumentDetails() {
        }

        // Getters and Setters
        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getDocumentNumber() {
            return documentNumber;
        }

        public void setDocumentNumber(String documentNumber) {
            this.documentNumber = documentNumber;
        }

        public Date getExpiryDate() {
            return expiryDate;
        }

        public void setExpiryDate(Date expiryDate) {
            this.expiryDate = expiryDate;
        }

        public Date getVerificationDate() {
            return verificationDate;
        }

        public void setVerificationDate(Date verificationDate) {
            this.verificationDate = verificationDate;
        }

        public String getVerificationMethod() {
            return verificationMethod;
        }

        public void setVerificationMethod(String verificationMethod) {
            this.verificationMethod = verificationMethod;
        }
    }

    /**
     * BiometricData contains biometric verification data for enhanced security.
     * Supports face matching and liveness detection for fraud prevention.
     */
    public static class BiometricData {

        /**
         * Face matching confidence score (0.00 to 1.00).
         * Higher scores indicate better match between document photo and live selfie.
         */
        @Field("face_match_score")
        private BigDecimal faceMatchScore;

        /**
         * Liveness detection confidence score (0.00 to 1.00).
         * Higher scores indicate genuine live person vs. photo or video replay attack.
         */
        @Field("liveness_score")
        private BigDecimal livenessScore;

        /**
         * Timestamp when biometric verification was performed.
         */
        @Field("verification_timestamp")
        private Date verificationTimestamp;

        // Default constructor
        public BiometricData() {
        }

        // Getters and Setters
        public BigDecimal getFaceMatchScore() {
            return faceMatchScore;
        }

        public void setFaceMatchScore(BigDecimal faceMatchScore) {
            this.faceMatchScore = faceMatchScore;
        }

        public BigDecimal getLivenessScore() {
            return livenessScore;
        }

        public void setLivenessScore(BigDecimal livenessScore) {
            this.livenessScore = livenessScore;
        }

        public Date getVerificationTimestamp() {
            return verificationTimestamp;
        }

        public void setVerificationTimestamp(Date verificationTimestamp) {
            this.verificationTimestamp = verificationTimestamp;
        }
    }

    /**
     * RiskProfile represents the customer's risk assessment profile.
     * Used by the AI-powered risk assessment engine for decision making and compliance.
     */
    public static class RiskProfile {

        /**
         * Current risk score (0-1000 scale).
         * Higher scores indicate higher risk levels requiring additional scrutiny.
         */
        @Field("current_score")
        private Integer currentScore;

        /**
         * Risk category classification (e.g., "low", "medium", "high", "critical").
         * Used for automated decision making and manual review triggers.
         */
        @Field("risk_category")
        private String riskCategory;

        /**
         * Date of last risk assessment calculation.
         * Risk profiles are regularly updated based on customer activity and external factors.
         */
        @Field("last_assessment")
        private Date lastAssessment;

        /**
         * List of individual risk factors contributing to the overall risk score.
         * Provides explainability for AI-driven risk decisions.
         */
        @Field("factors")
        private List<RiskFactor> factors;

        // Default constructor
        public RiskProfile() {
        }

        // Getters and Setters
        public Integer getCurrentScore() {
            return currentScore;
        }

        public void setCurrentScore(Integer currentScore) {
            this.currentScore = currentScore;
        }

        public String getRiskCategory() {
            return riskCategory;
        }

        public void setRiskCategory(String riskCategory) {
            this.riskCategory = riskCategory;
        }

        public Date getLastAssessment() {
            return lastAssessment;
        }

        public void setLastAssessment(Date lastAssessment) {
            this.lastAssessment = lastAssessment;
        }

        public List<RiskFactor> getFactors() {
            return factors;
        }

        public void setFactors(List<RiskFactor> factors) {
            this.factors = factors;
        }
    }

    /**
     * RiskFactor represents a single factor contributing to the overall risk score.
     * Enables granular risk analysis and explainable AI decisions.
     */
    public static class RiskFactor {

        /**
         * Name or description of the risk factor (e.g., "transaction_velocity", "geographic_risk", "credit_history").
         */
        @Field("factor")
        private String factor;

        /**
         * Individual score contribution of this factor (0-100 scale).
         */
        @Field("score")
        private Integer score;

        /**
         * Weight of this factor in the overall risk calculation (0.00 to 1.00).
         * Allows for weighted risk scoring algorithms.
         */
        @Field("weight")
        private BigDecimal weight;

        // Default constructor
        public RiskFactor() {
        }

        // Getters and Setters
        public String getFactor() {
            return factor;
        }

        public void setFactor(String factor) {
            this.factor = factor;
        }

        public Integer getScore() {
            return score;
        }

        public void setScore(Integer score) {
            this.score = score;
        }

        public BigDecimal getWeight() {
            return weight;
        }

        public void setWeight(BigDecimal weight) {
            this.weight = weight;
        }
    }

    /**
     * Preferences represents customer preferences for communication and privacy.
     * Essential for personalized customer experience and privacy compliance.
     */
    public static class Preferences {

        /**
         * Preferred communication channels for customer notifications.
         * Options include: "email", "sms", "phone", "mobile_app", "postal_mail"
         */
        @Field("communication_channels")
        private List<String> communicationChannels;

        /**
         * Preferred language for communication (ISO 639-1 language codes).
         * Used for localized customer communications and document generation.
         */
        @Field("language")
        private String language;

        /**
         * Customer's timezone for scheduling and time-sensitive communications.
         * Format: IANA timezone identifier (e.g., "America/New_York", "Europe/London")
         */
        @Field("timezone")
        private String timezone;

        /**
         * Marketing consent status for promotional communications.
         * Required for GDPR and privacy regulation compliance.
         */
        @Field("marketing_consent")
        private boolean marketingConsent;

        // Default constructor
        public Preferences() {
        }

        // Getters and Setters
        public List<String> getCommunicationChannels() {
            return communicationChannels;
        }

        public void setCommunicationChannels(List<String> communicationChannels) {
            this.communicationChannels = communicationChannels;
        }

        public String getLanguage() {
            return language;
        }

        public void setLanguage(String language) {
            this.language = language;
        }

        public String getTimezone() {
            return timezone;
        }

        public void setTimezone(String timezone) {
            this.timezone = timezone;
        }

        public boolean isMarketingConsent() {
            return marketingConsent;
        }

        public void setMarketingConsent(boolean marketingConsent) {
            this.marketingConsent = marketingConsent;
        }
    }

    /**
     * Metadata contains document metadata for audit trail and data governance.
     * Essential for compliance, versioning, and data lifecycle management.
     */
    public static class Metadata {

        /**
         * Timestamp when the customer profile was initially created.
         * Immutable field for audit trail purposes.
         */
        @Field("created_at")
        private Date createdAt;

        /**
         * Timestamp of the last update to the customer profile.
         * Updated automatically on any profile modification.
         */
        @Field("updated_at")
        private Date updatedAt;

        /**
         * Document version number for optimistic concurrency control.
         * Incremented on each update to prevent lost updates in concurrent scenarios.
         */
        @Field("version")
        private Integer version;

        /**
         * Data classification level for security and compliance purposes.
         * Values: "public", "internal", "confidential", "restricted"
         */
        @Field("data_classification")
        private String dataClassification;

        // Default constructor
        public Metadata() {
        }

        // Getters and Setters
        public Date getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(Date createdAt) {
            this.createdAt = createdAt;
        }

        public Date getUpdatedAt() {
            return updatedAt;
        }

        public void setUpdatedAt(Date updatedAt) {
            this.updatedAt = updatedAt;
        }

        public Integer getVersion() {
            return version;
        }

        public void setVersion(Integer version) {
            this.version = version;
        }

        public String getDataClassification() {
            return dataClassification;
        }

        public void setDataClassification(String dataClassification) {
            this.dataClassification = dataClassification;
        }
    }
}