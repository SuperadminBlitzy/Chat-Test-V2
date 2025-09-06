package com.ufs.customer.dto;

import jakarta.validation.constraints.NotBlank; // Jakarta Validation 3.0.2 - Bean validation
import jakarta.validation.constraints.NotNull; // Jakarta Validation 3.0.2 - Null validation
import jakarta.validation.constraints.Size; // Jakarta Validation 3.0.2 - Size constraints
import jakarta.validation.constraints.Email; // Jakarta Validation 3.0.2 - Email validation
import jakarta.validation.constraints.Past; // Jakarta Validation 3.0.2 - Past date validation
import jakarta.validation.Valid; // Jakarta Validation 3.0.2 - Nested object validation
import java.util.List; // Java 11 - Collection framework
import java.time.LocalDate; // Java 11 - Modern date handling
import com.ufs.customer.dto.KycDocumentDto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

/**
 * Data Transfer Object for customer onboarding requests.
 * 
 * This class serves as the primary data carrier for the Digital Customer Onboarding
 * feature (F-004), encapsulating all necessary information required to initiate 
 * the customer onboarding process including personal details, address information, 
 * and KYC documents.
 * 
 * Functional Requirements Addressed:
 * - F-004-RQ-001: Digital identity verification through comprehensive personal data collection
 * - F-004-RQ-002: KYC/AML compliance checks via structured document submission
 * - F-004-RQ-003: Biometric authentication readiness with identity correlation
 * - F-004-RQ-004: Risk-based onboarding through detailed customer profiling
 * 
 * Business Value:
 * - Enables sub-5-minute onboarding process as per performance requirements
 * - Supports 99% accuracy in identity verification through comprehensive data validation
 * - Facilitates compliance with Bank Secrecy Act (BSA) and international KYC/AML regulations
 * - Enables automated risk assessment and scoring workflows
 * 
 * Security Considerations:
 * - Contains sensitive PII requiring encryption in transit and at rest
 * - Implements comprehensive validation to prevent data integrity issues
 * - Supports audit trail requirements for compliance monitoring
 * - Enables secure document handling workflows
 * 
 * Performance Characteristics:
 * - Optimized for JSON serialization/deserialization
 * - Minimal memory footprint for high-throughput processing
 * - Supports batch processing for compliance reporting
 * - Compatible with reactive processing pipelines
 * 
 * Integration Points:
 * - OnboardingController: Primary REST endpoint data binding
 * - OnboardingService: Business logic processing and validation
 * - Risk Assessment Engine: Customer risk scoring and evaluation
 * - Compliance Service: KYC/AML verification and reporting
 * - Document Management: Secure KYC document processing
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2024-01-01
 */
@Schema(
    description = "Customer onboarding request containing personal information, address details, and KYC documents",
    example = """
        {
            "personalInfo": {
                "firstName": "John",
                "lastName": "Doe",
                "email": "john.doe@example.com",
                "phoneNumber": "+1-555-123-4567",
                "dateOfBirth": "1990-05-15"
            },
            "address": {
                "street": "123 Main Street",
                "city": "New York",
                "state": "NY",
                "zipCode": "10001",
                "country": "USA"
            },
            "documents": [
                {
                    "documentType": "PASSPORT",
                    "documentNumber": "A12345678",
                    "expiryDate": "2030-12-31",
                    "documentUrl": "https://secure-storage.ufs.com/documents/abc123def456",
                    "status": "PENDING"
                }
            ]
        }
        """
)
public class OnboardingRequest {

    /**
     * Personal information of the customer requesting onboarding.
     * 
     * Contains essential identity information required for F-004-RQ-001
     * (Digital identity verification) including full name, contact details,
     * and date of birth for age verification and risk assessment.
     * 
     * This nested object is critical for:
     * - Customer Identification Programme (CIP) compliance
     * - Identity correlation with KYC documents
     * - Risk-based customer profiling
     * - Communication and notification workflows
     */
    @Schema(
        description = "Personal information required for customer identification and verification",
        required = true
    )
    @NotNull(message = "Personal information is required for customer onboarding")
    @Valid
    @JsonProperty("personalInfo")
    private PersonalInfo personalInfo;

    /**
     * Address information of the customer for verification and compliance.
     * 
     * Required for Customer Due Diligence (CDD) processes and regulatory
     * compliance. Address verification is a critical component of F-004-RQ-001
     * and supports geographic risk assessment for F-004-RQ-004.
     * 
     * Used for:
     * - Proof of address verification against utility bills/bank statements
     * - Geographic risk scoring and sanctions screening
     * - Regulatory reporting and jurisdiction compliance
     * - Service availability determination
     */
    @Schema(
        description = "Customer address information for verification and compliance purposes",
        required = true
    )
    @NotNull(message = "Address information is mandatory for KYC compliance")
    @Valid
    @JsonProperty("address")
    private AddressInfo address;

    /**
     * Collection of KYC documents submitted for identity verification.
     * 
     * Supports F-004-RQ-002 (KYC/AML compliance checks) by providing
     * structured document submission workflow. Each document undergoes
     * verification processes including:
     * - Document authenticity validation
     * - Expiry date verification
     * - Identity correlation with personal information
     * - Compliance screening against watchlists
     * 
     * Business Rules:
     * - Minimum one government-issued photo ID required
     * - All documents must be valid (not expired)
     * - Document information must correlate with personal details
     * - Maximum 10 documents per onboarding request for performance optimization
     */
    @Schema(
        description = "List of KYC documents for identity verification and compliance",
        required = true,
        minItems = 1,
        maxItems = 10
    )
    @NotNull(message = "KYC documents are required for identity verification")
    @Size(
        min = 1, 
        max = 10, 
        message = "Must provide between 1 and 10 KYC documents for onboarding"
    )
    @Valid
    @JsonProperty("documents")
    private List<KycDocumentDto> documents;

    /**
     * Default constructor for OnboardingRequest.
     * 
     * Provides framework compatibility for:
     * - JSON deserialization (Jackson)
     * - Spring MVC request binding
     * - JPA entity mapping (if needed)
     * - Unit testing and mocking
     * - Builder pattern initialization
     * 
     * Note: All fields must be populated and validated before use in
     * production workflows to ensure compliance and data integrity.
     */
    public OnboardingRequest() {
        // Default constructor for framework compatibility
        // All fields initialized to null - must be populated through setters or JSON binding
    }

    /**
     * Retrieves the personal information of the customer.
     * 
     * @return PersonalInfo object containing customer's personal details
     */
    public PersonalInfo getPersonalInfo() {
        return personalInfo;
    }

    /**
     * Sets the personal information for the onboarding request.
     * 
     * @param personalInfo The personal information to set
     *                    Must contain valid name, email, phone, and date of birth
     */
    public void setPersonalInfo(PersonalInfo personalInfo) {
        this.personalInfo = personalInfo;
    }

    /**
     * Retrieves the address information of the customer.
     * 
     * @return AddressInfo object containing customer's address details
     */
    public AddressInfo getAddress() {
        return address;
    }

    /**
     * Sets the address information for the onboarding request.
     * 
     * @param address The address information to set
     *               Must contain complete address including country for compliance
     */
    public void setAddress(AddressInfo address) {
        this.address = address;
    }

    /**
     * Retrieves the list of KYC documents submitted for verification.
     * 
     * @return List of KycDocumentDto objects containing document information
     */
    public List<KycDocumentDto> getDocuments() {
        return documents;
    }

    /**
     * Sets the KYC documents for identity verification.
     * 
     * @param documents The list of KYC documents to set
     *                 Must contain at least one valid government-issued ID
     */
    public void setDocuments(List<KycDocumentDto> documents) {
        this.documents = documents;
    }

    /**
     * Provides a string representation of the onboarding request.
     * 
     * Note: Excludes sensitive personal information for security purposes
     * in log files and debugging output.
     * 
     * @return A string representation with non-sensitive summary information
     */
    @Override
    public String toString() {
        return "OnboardingRequest{" +
                "personalInfo=" + (personalInfo != null ? "[PRESENT]" : "[NULL]") +
                ", address=" + (address != null ? "[PRESENT]" : "[NULL]") +
                ", documentCount=" + (documents != null ? documents.size() : 0) +
                '}';
    }

    /**
     * Validates if the onboarding request contains all required information.
     * 
     * Business logic helper method for pre-processing validation
     * before submitting to verification workflows.
     * 
     * @return true if all required fields are present, false otherwise
     */
    public boolean isComplete() {
        return personalInfo != null && 
               address != null && 
               documents != null && 
               !documents.isEmpty();
    }

    /**
     * Counts the number of verified KYC documents in the request.
     * 
     * Utility method for workflow decision-making and progress tracking
     * during the onboarding process.
     * 
     * @return The number of documents with VERIFIED status
     */
    public long getVerifiedDocumentCount() {
        if (documents == null) {
            return 0;
        }
        return documents.stream()
                       .filter(doc -> doc != null && doc.isVerified())
                       .count();
    }

    /**
     * Checks if all submitted documents have been processed (verified or rejected).
     * 
     * Workflow helper method to determine if the onboarding request
     * is ready for final approval or requires additional action.
     * 
     * @return true if all documents are in a final state (VERIFIED, REJECTED, EXPIRED), false otherwise
     */
    public boolean areAllDocumentsProcessed() {
        if (documents == null || documents.isEmpty()) {
            return false;
        }
        return documents.stream()
                       .filter(doc -> doc != null)
                       .allMatch(doc -> !doc.isProcessing());
    }

    /**
     * Nested class representing the personal information of the customer.
     * 
     * This class encapsulates all personal details required for customer
     * identification and verification processes as mandated by F-004-RQ-001.
     * 
     * The information collected supports:
     * - Customer Identification Programme (CIP) requirements
     * - Identity correlation with KYC documents
     * - Age verification for regulatory compliance
     * - Contact information for communication workflows
     * - Risk assessment and customer profiling
     * 
     * Data Protection:
     * - Contains sensitive PII requiring secure handling
     * - Supports GDPR and privacy regulation compliance
     * - Enables data anonymization for analytics
     * - Audit trail compatibility for compliance reporting
     */
    @Schema(description = "Personal information required for customer identification")
    public static class PersonalInfo {

        /**
         * Customer's legal first name as it appears on government-issued identification.
         * 
         * Critical for F-004-RQ-001 identity verification and must match
         * the name on submitted KYC documents. Used for:
         * - Identity correlation and verification
         * - Legal document generation
         * - Communication personalization
         * - Compliance reporting and audit trails
         * 
         * Validation ensures data quality and prevents processing errors
         * during automated verification workflows.
         */
        @Schema(
            description = "Customer's legal first name as shown on government ID",
            example = "John",
            required = true,
            minLength = 1,
            maxLength = 50
        )
        @NotBlank(message = "First name is required for customer identification")
        @Size(
            min = 1, 
            max = 50, 
            message = "First name must be between 1 and 50 characters"
        )
        @Pattern(
            regexp = "^[a-zA-Z\\s\\-\\']+$",
            message = "First name can only contain letters, spaces, hyphens, and apostrophes"
        )
        @JsonProperty("firstName")
        private String firstName;

        /**
         * Customer's legal last name as it appears on government-issued identification.
         * 
         * Essential for complete identity verification and legal compliance.
         * Must correspond with KYC document information for successful
         * onboarding process completion.
         * 
         * Used in conjunction with first name for:
         * - Full identity verification workflows
         * - Legal document preparation and signing
         * - Anti-money laundering (AML) screening
         * - Customer communication and service delivery
         */
        @Schema(
            description = "Customer's legal last name as shown on government ID",
            example = "Doe",
            required = true,
            minLength = 1,
            maxLength = 50
        )
        @NotBlank(message = "Last name is required for customer identification")
        @Size(
            min = 1, 
            max = 50, 
            message = "Last name must be between 1 and 50 characters"
        )
        @Pattern(
            regexp = "^[a-zA-Z\\s\\-\\']+$",
            message = "Last name can only contain letters, spaces, hyphens, and apostrophes"
        )
        @JsonProperty("lastName")
        private String lastName;

        /**
         * Customer's primary email address for communication and account access.
         * 
         * Serves as the primary communication channel and potential login credential
         * for digital banking services. Critical for:
         * - Account activation and verification workflows
         * - Security notifications and alerts
         * - Service updates and communications
         * - Password reset and account recovery
         * - Marketing communications (with consent)
         * 
         * Must be unique within the system to prevent account conflicts
         * and ensure secure customer identification.
         */
        @Schema(
            description = "Customer's primary email address for communication and account access",
            example = "john.doe@example.com",
            required = true,
            format = "email"
        )
        @NotBlank(message = "Email address is required for account communication")
        @Email(message = "Must provide a valid email address format")
        @Size(
            max = 100, 
            message = "Email address cannot exceed 100 characters"
        )
        @JsonProperty("email")
        private String email;

        /**
         * Customer's primary phone number for verification and communication.
         * 
         * Essential for multi-factor authentication, SMS verification,
         * and emergency communication. Supports:
         * - Two-factor authentication (2FA) workflows
         * - Account verification via SMS codes
         * - Emergency account security notifications
         * - Customer service contact and support
         * - Fraud alert and prevention communications
         * 
         * International format support enables global customer onboarding
         * while maintaining consistent validation standards.
         */
        @Schema(
            description = "Customer's primary phone number with international format support",
            example = "+1-555-123-4567",
            required = true,
            pattern = "^\\+?[1-9]\\d{1,14}$"
        )
        @NotBlank(message = "Phone number is required for account verification")
        @Pattern(
            regexp = "^\\+?[1-9]\\d{1,14}$",
            message = "Phone number must be in valid international format (E.164)"
        )
        @JsonProperty("phoneNumber")
        private String phoneNumber;

        /**
         * Customer's date of birth for age verification and compliance.
         * 
         * Critical for regulatory compliance and age-based service restrictions.
         * Used for:
         * - Legal age verification (18+ for financial services)
         * - Regulatory compliance reporting
         * - Identity correlation with KYC documents
         * - Risk assessment and customer profiling
         * - Birthday communications and engagement
         * 
         * Must be in the past and correlate with government-issued ID
         * to pass identity verification requirements.
         */
        @Schema(
            description = "Customer's date of birth for age verification and identity correlation",
            example = "1990-05-15",
            required = true,
            type = "string",
            format = "date"
        )
        @NotNull(message = "Date of birth is required for age verification")
        @Past(message = "Date of birth must be in the past")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        @JsonProperty("dateOfBirth")
        private LocalDate dateOfBirth;

        /**
         * Default constructor for PersonalInfo.
         * 
         * Enables framework compatibility and flexible initialization patterns.
         */
        public PersonalInfo() {
            // Default constructor for framework compatibility
        }

        /**
         * Retrieves the customer's first name.
         * 
         * @return The customer's legal first name
         */
        public String getFirstName() {
            return firstName;
        }

        /**
         * Sets the customer's first name.
         * 
         * @param firstName The legal first name to set
         */
        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        /**
         * Retrieves the customer's last name.
         * 
         * @return The customer's legal last name
         */
        public String getLastName() {
            return lastName;
        }

        /**
         * Sets the customer's last name.
         * 
         * @param lastName The legal last name to set
         */
        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        /**
         * Retrieves the customer's email address.
         * 
         * @return The customer's primary email address
         */
        public String getEmail() {
            return email;
        }

        /**
         * Sets the customer's email address.
         * 
         * @param email The primary email address to set
         */
        public void setEmail(String email) {
            this.email = email;
        }

        /**
         * Retrieves the customer's phone number.
         * 
         * @return The customer's primary phone number
         */
        public String getPhoneNumber() {
            return phoneNumber;
        }

        /**
         * Sets the customer's phone number.
         * 
         * @param phoneNumber The primary phone number to set
         */
        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }

        /**
         * Retrieves the customer's date of birth.
         * 
         * @return The date of birth as LocalDate
         */
        public LocalDate getDateOfBirth() {
            return dateOfBirth;
        }

        /**
         * Sets the customer's date of birth.
         * 
         * @param dateOfBirth The date of birth to set
         */
        public void setDateOfBirth(LocalDate dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
        }

        /**
         * Returns the customer's full name by combining first and last names.
         * 
         * Utility method for display purposes and document generation.
         * 
         * @return The full name in "FirstName LastName" format
         */
        public String getFullName() {
            if (firstName == null && lastName == null) {
                return null;
            }
            if (firstName == null) {
                return lastName;
            }
            if (lastName == null) {
                return firstName;
            }
            return firstName + " " + lastName;
        }

        /**
         * Calculates the customer's current age based on date of birth.
         * 
         * Business logic helper for age-based validation and compliance checks.
         * 
         * @return The customer's age in years, or -1 if date of birth is null
         */
        public int getAge() {
            if (dateOfBirth == null) {
                return -1;
            }
            return LocalDate.now().getYear() - dateOfBirth.getYear() -
                   (LocalDate.now().getDayOfYear() < dateOfBirth.getDayOfYear() ? 1 : 0);
        }

        /**
         * Validates if the customer meets minimum age requirements.
         * 
         * Financial services typically require customers to be 18 or older
         * for account opening and service access.
         * 
         * @return true if customer is 18 or older, false otherwise
         */
        public boolean isEligibleAge() {
            return getAge() >= 18;
        }

        /**
         * Provides a string representation with privacy protection.
         * 
         * @return A string representation excluding sensitive information
         */
        @Override
        public String toString() {
            return "PersonalInfo{" +
                    "firstName='" + (firstName != null ? firstName.charAt(0) + "***" : null) + "'" +
                    ", lastName='" + (lastName != null ? lastName.charAt(0) + "***" : null) + "'" +
                    ", email='[REDACTED]'" +
                    ", phoneNumber='[REDACTED]'" +
                    ", age=" + getAge() +
                    '}';
        }
    }

    /**
     * Nested class representing the address information of the customer.
     * 
     * Comprehensive address information is required for Customer Due Diligence (CDD)
     * processes and regulatory compliance as specified in F-004-RQ-001.
     * 
     * The address information supports:
     * - Proof of address verification workflows
     * - Geographic risk assessment and scoring
     * - Regulatory jurisdiction determination
     * - Service availability and eligibility checks
     * - Sanctions screening and compliance monitoring
     * - Tax reporting and regulatory obligations
     * 
     * Data Quality:
     * - Structured format enables automated verification
     * - Standardized fields support international addresses
     * - Validation ensures completeness for compliance
     * - Compatible with address verification services
     */
    @Schema(description = "Customer address information for verification and compliance")
    public static class AddressInfo {

        /**
         * Street address including house number and street name.
         * 
         * Primary component of the address used for:
         * - Proof of address verification against utility bills
         * - Mail delivery and correspondence
         * - Geographic location determination
         * - Address standardization and validation
         * - Compliance screening and verification
         * 
         * Should include complete street information to enable
         * successful address verification processes.
         */
        @Schema(
            description = "Complete street address including house number and street name",
            example = "123 Main Street",
            required = true,
            minLength = 5,
            maxLength = 100
        )
        @NotBlank(message = "Street address is required for customer verification")
        @Size(
            min = 5, 
            max = 100, 
            message = "Street address must be between 5 and 100 characters"
        )
        @Pattern(
            regexp = "^[a-zA-Z0-9\\s\\-\\.\\'\\#]+$",
            message = "Street address can contain letters, numbers, spaces, hyphens, periods, apostrophes, and hash symbols"
        )
        @JsonProperty("street")
        private String street;

        /**
         * City or locality name for address verification.
         * 
         * Essential component for complete address identification and
         * geographic compliance requirements. Used for:
         * - Address standardization and normalization
         * - Geographic risk assessment
         * - Local regulatory compliance
         * - Service area determination
         * - Tax jurisdiction identification
         */
        @Schema(
            description = "City or locality name",
            example = "New York",
            required = true,
            minLength = 2,
            maxLength = 50
        )
        @NotBlank(message = "City is required for address verification")
        @Size(
            min = 2, 
            max = 50, 
            message = "City must be between 2 and 50 characters"
        )
        @Pattern(
            regexp = "^[a-zA-Z\\s\\-\\']+$",
            message = "City name can only contain letters, spaces, hyphens, and apostrophes"
        )
        @JsonProperty("city")
        private String city;

        /**
         * State, province, or administrative region.
         * 
         * Required for complete address specification and regulatory
         * compliance in many jurisdictions. Supports:
         * - State-specific regulatory requirements
         * - Tax jurisdiction determination
         * - Geographic risk assessment
         * - Address standardization processes
         * - Service eligibility verification
         */
        @Schema(
            description = "State, province, or administrative region",
            example = "NY",
            required = true,
            minLength = 2,
            maxLength = 50
        )
        @NotBlank(message = "State/Province is required for address verification")
        @Size(
            min = 2, 
            max = 50, 
            message = "State/Province must be between 2 and 50 characters"
        )
        @Pattern(
            regexp = "^[a-zA-Z\\s\\-\\']+$",
            message = "State/Province can only contain letters, spaces, hyphens, and apostrophes"
        )
        @JsonProperty("state")
        private String state;

        /**
         * Postal or ZIP code for address verification.
         * 
         * Critical for precise address identification and verification
         * against postal services and address databases. Enables:
         * - Address validation and standardization
         * - Geographic precision for risk assessment
         * - Service area and eligibility determination
         * - Mail delivery verification
         * - Compliance with local postal regulations
         * 
         * Supports various international postal code formats
         * while maintaining validation for data quality.
         */
        @Schema(
            description = "Postal or ZIP code",
            example = "10001",
            required = true,
            minLength = 3,
            maxLength = 12
        )
        @NotBlank(message = "ZIP/Postal code is required for address verification")
        @Size(
            min = 3, 
            max = 12, 
            message = "ZIP/Postal code must be between 3 and 12 characters"
        )
        @Pattern(
            regexp = "^[a-zA-Z0-9\\s\\-]+$",
            message = "ZIP/Postal code can contain letters, numbers, spaces, and hyphens"
        )
        @JsonProperty("zipCode")
        private String zipCode;

        /**
         * Country name or code for international compliance.
         * 
         * Fundamental for regulatory compliance and international operations.
         * The country information determines:
         * - Applicable regulatory frameworks and requirements
         * - Sanctions screening and compliance obligations
         * - Tax reporting and jurisdiction requirements
         * - Service availability and restrictions
         * - Cross-border transaction regulations
         * - Anti-money laundering (AML) risk assessment
         * 
         * Must comply with international standards (ISO 3166) for
         * consistent processing and compliance verification.
         */
        @Schema(
            description = "Country name (preferably ISO 3166 standard)",
            example = "USA",
            required = true,
            minLength = 2,
            maxLength = 50
        )
        @NotBlank(message = "Country is required for regulatory compliance")
        @Size(
            min = 2, 
            max = 50, 
            message = "Country must be between 2 and 50 characters"
        )
        @Pattern(
            regexp = "^[a-zA-Z\\s\\-\\.]+$",
            message = "Country name can contain letters, spaces, hyphens, and periods"
        )
        @JsonProperty("country")
        private String country;

        /**
         * Default constructor for AddressInfo.
         * 
         * Enables framework compatibility and flexible initialization.
         */
        public AddressInfo() {
            // Default constructor for framework compatibility
        }

        /**
         * Retrieves the street address.
         * 
         * @return The complete street address
         */
        public String getStreet() {
            return street;
        }

        /**
         * Sets the street address.
         * 
         * @param street The street address to set
         */
        public void setStreet(String street) {
            this.street = street;
        }

        /**
         * Retrieves the city name.
         * 
         * @return The city or locality name
         */
        public String getCity() {
            return city;
        }

        /**
         * Sets the city name.
         * 
         * @param city The city name to set
         */
        public void setCity(String city) {
            this.city = city;
        }

        /**
         * Retrieves the state or province.
         * 
         * @return The state/province name
         */
        public String getState() {
            return state;
        }

        /**
         * Sets the state or province.
         * 
         * @param state The state/province to set
         */
        public void setState(String state) {
            this.state = state;
        }

        /**
         * Retrieves the postal code.
         * 
         * @return The ZIP or postal code
         */
        public String getZipCode() {
            return zipCode;
        }

        /**
         * Sets the postal code.
         * 
         * @param zipCode The ZIP/postal code to set
         */
        public void setZipCode(String zipCode) {
            this.zipCode = zipCode;
        }

        /**
         * Retrieves the country.
         * 
         * @return The country name or code
         */
        public String getCountry() {
            return country;
        }

        /**
         * Sets the country.
         * 
         * @param country The country name or code to set
         */
        public void setCountry(String country) {
            this.country = country;
        }

        /**
         * Returns the complete formatted address.
         * 
         * Utility method for display purposes and document generation.
         * 
         * @return The complete address in standard format
         */
        public String getFormattedAddress() {
            StringBuilder address = new StringBuilder();
            
            if (street != null) {
                address.append(street);
            }
            
            if (city != null) {
                if (address.length() > 0) address.append(", ");
                address.append(city);
            }
            
            if (state != null) {
                if (address.length() > 0) address.append(", ");
                address.append(state);
            }
            
            if (zipCode != null) {
                if (address.length() > 0) address.append(" ");
                address.append(zipCode);
            }
            
            if (country != null) {
                if (address.length() > 0) address.append(", ");
                address.append(country);
            }
            
            return address.toString();
        }

        /**
         * Validates if the address is within supported service areas.
         * 
         * Business logic helper for determining service eligibility
         * based on geographic location.
         * 
         * @return true for US addresses (primary service area), false for others
         */
        public boolean isInSupportedRegion() {
            return country != null && 
                   (country.equalsIgnoreCase("USA") || 
                    country.equalsIgnoreCase("United States") ||
                    country.equalsIgnoreCase("US"));
        }

        /**
         * Provides a string representation of the address.
         * 
         * @return A string representation of the address information
         */
        @Override
        public String toString() {
            return "AddressInfo{" +
                    "street='" + street + '\'' +
                    ", city='" + city + '\'' +
                    ", state='" + state + '\'' +
                    ", zipCode='" + zipCode + '\'' +
                    ", country='" + country + '\'' +
                    '}';
        }
    }
}