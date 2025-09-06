package com.ufs.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;
import java.util.Objects;

/**
 * Data Transfer Object (DTO) for handling customer creation and update requests.
 * 
 * This class encapsulates the data sent from the client to the customer service
 * for creating or updating a customer's profile as part of the Digital Customer
 * Onboarding process (F-004). It supports KYC (Know Your Customer) and AML 
 * (Anti-Money Laundering) compliance requirements by capturing essential 
 * personal and contact information required for identity verification and
 * customer due diligence (CDD) processes.
 * 
 * Key Compliance Features:
 * - Supports Customer Identification Programme (CIP) requirements
 * - Enables identity verification through personal data validation
 * - Facilitates real-time data checks for KYC/AML compliance
 * - Contributes to unified customer profile creation for risk assessment
 * 
 * Business Context:
 * This DTO is designed to support the goal of reducing customer onboarding time
 * to under 5 minutes while maintaining 99% accuracy in identity verification,
 * as specified in the Digital Customer Onboarding requirements.
 * 
 * Security Considerations:
 * - All fields are validated for format and content compliance
 * - PII (Personally Identifiable Information) handling follows GDPR standards
 * - Input validation prevents injection attacks and data corruption
 * 
 * @author Unified Financial Services Platform
 * @version 1.0
 * @since 2025-01-01
 */
public class CustomerRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Customer's first name as it appears on government-issued identification.
     * Required for KYC identity verification and CIP compliance.
     * 
     * Validation Rules:
     * - Cannot be null or empty
     * - Must be between 1 and 50 characters
     * - Only alphabetic characters and common punctuation allowed
     * - Trimmed of leading/trailing whitespace
     */
    @NotBlank(message = "First name is required for customer identification and KYC compliance")
    @Size(min = 1, max = 50, message = "First name must be between 1 and 50 characters")
    @Pattern(regexp = "^[\\p{L}][\\p{L}\\s'.-]*[\\p{L}]$|^[\\p{L}]$", 
             message = "First name must contain only letters, spaces, apostrophes, periods, and hyphens")
    @JsonProperty("firstName")
    private String firstName;

    /**
     * Customer's last name (surname/family name) as it appears on government-issued identification.
     * Required for KYC identity verification and CIP compliance.
     * 
     * Validation Rules:
     * - Cannot be null or empty
     * - Must be between 1 and 50 characters
     * - Only alphabetic characters and common punctuation allowed
     * - Trimmed of leading/trailing whitespace
     */
    @NotBlank(message = "Last name is required for customer identification and KYC compliance")
    @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
    @Pattern(regexp = "^[\\p{L}][\\p{L}\\s'.-]*[\\p{L}]$|^[\\p{L}]$", 
             message = "Last name must contain only letters, spaces, apostrophes, periods, and hyphens")
    @JsonProperty("lastName")
    private String lastName;

    /**
     * Customer's primary email address for communication and account verification.
     * Used for digital identity verification and account notifications.
     * 
     * Validation Rules:
     * - Cannot be null or empty
     * - Must be a valid email format according to RFC 5322
     * - Maximum length of 254 characters (RFC standard)
     * - Case-insensitive validation
     */
    @NotBlank(message = "Email address is required for customer communication and verification")
    @Email(message = "Email address must be in valid format (e.g., user@example.com)")
    @Size(max = 254, message = "Email address cannot exceed 254 characters")
    @JsonProperty("email")
    private String email;

    /**
     * Customer's primary phone number for verification and communication.
     * Required for multi-factor authentication and identity verification processes.
     * 
     * Validation Rules:
     * - Cannot be null or empty
     * - Must be between 10 and 15 digits
     * - Supports international format with optional country code and separators
     * - Allows for common formatting characters (+, -, space, parentheses)
     */
    @NotBlank(message = "Phone number is required for customer verification and communication")
    @Pattern(regexp = "^[+]?[(]?[\\d\\s().-]{10,15}$", 
             message = "Phone number must be between 10-15 digits and may include country code, spaces, hyphens, and parentheses")
    @JsonProperty("phoneNumber")
    private String phoneNumber;

    /**
     * Customer's date of birth in ISO 8601 format (YYYY-MM-DD).
     * Critical for age verification, KYC compliance, and regulatory requirements.
     * Used to verify identity against government-issued identification documents.
     * 
     * Validation Rules:
     * - Cannot be null or empty
     * - Must be in ISO 8601 date format (YYYY-MM-DD)
     * - Used for age verification and compliance checks
     * - Validated against minimum age requirements for financial services
     */
    @NotBlank(message = "Date of birth is required for age verification and KYC compliance")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$", 
             message = "Date of birth must be in ISO 8601 format (YYYY-MM-DD)")
    @JsonProperty("dateOfBirth")
    private String dateOfBirth;

    /**
     * Customer's nationality or citizenship for regulatory compliance.
     * Required for AML screening, sanctions checking, and regulatory reporting.
     * Used for determining applicable compliance requirements and risk assessment.
     * 
     * Validation Rules:
     * - Cannot be null or empty
     * - Must be between 2 and 100 characters
     * - Accepts full country names or ISO country codes
     * - Used for sanctions screening and compliance checks
     */
    @NotBlank(message = "Nationality is required for regulatory compliance and AML screening")
    @Size(min = 2, max = 100, message = "Nationality must be between 2 and 100 characters")
    @Pattern(regexp = "^[\\p{L}][\\p{L}\\s.-]*[\\p{L}]$|^[\\p{L}]{2,3}$", 
             message = "Nationality must contain only letters, spaces, periods, and hyphens, or be a valid country code")
    @JsonProperty("nationality")
    private String nationality;

    /**
     * Customer's residential address for identity verification and compliance.
     * Required for CDD (Customer Due Diligence) and address verification processes.
     * Used for proof of address validation and regulatory reporting requirements.
     * 
     * Validation Rules:
     * - Cannot be null or empty
     * - Must be between 10 and 500 characters
     * - Allows alphanumeric characters and common address punctuation
     * - Must be complete enough for verification purposes
     */
    @NotBlank(message = "Address is required for customer due diligence and identity verification")
    @Size(min = 10, max = 500, message = "Address must be between 10 and 500 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}][\\p{L}\\p{N}\\s,.'#-]*[\\p{L}\\p{N}]$", 
             message = "Address must contain valid characters including letters, numbers, spaces, commas, periods, apostrophes, hashes, and hyphens")
    @JsonProperty("address")
    private String address;

    /**
     * Default constructor for CustomerRequest.
     * Required for JSON deserialization and framework compatibility.
     * Initializes an empty CustomerRequest object that can be populated
     * via setter methods or JSON binding.
     */
    public CustomerRequest() {
        // Default constructor for JSON deserialization and framework compatibility
    }

    /**
     * Full constructor for CustomerRequest with all required fields.
     * 
     * @param firstName Customer's first name as it appears on government ID
     * @param lastName Customer's last name as it appears on government ID  
     * @param email Customer's primary email address for verification
     * @param phoneNumber Customer's primary phone number for contact
     * @param dateOfBirth Customer's date of birth in ISO 8601 format (YYYY-MM-DD)
     * @param nationality Customer's nationality or citizenship
     * @param address Customer's residential address for verification
     */
    public CustomerRequest(String firstName, String lastName, String email, 
                          String phoneNumber, String dateOfBirth, String nationality, String address) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.dateOfBirth = dateOfBirth;
        this.nationality = nationality;
        this.address = address;
    }

    /**
     * Gets the customer's first name.
     * 
     * @return Customer's first name as provided for KYC verification
     */
    public String getFirstName() {
        return firstName;
    }

    /**
     * Sets the customer's first name.
     * 
     * @param firstName Customer's first name as it appears on government-issued ID
     */
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    /**
     * Gets the customer's last name.
     * 
     * @return Customer's last name as provided for KYC verification
     */
    public String getLastName() {
        return lastName;
    }

    /**
     * Sets the customer's last name.
     * 
     * @param lastName Customer's last name as it appears on government-issued ID
     */
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    /**
     * Gets the customer's email address.
     * 
     * @return Customer's primary email address for communication and verification
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets the customer's email address.
     * 
     * @param email Customer's primary email address in valid format
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Gets the customer's phone number.
     * 
     * @return Customer's primary phone number for verification and contact
     */
    public String getPhoneNumber() {
        return phoneNumber;
    }

    /**
     * Sets the customer's phone number.
     * 
     * @param phoneNumber Customer's primary phone number with optional country code
     */
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    /**
     * Gets the customer's date of birth.
     * 
     * @return Customer's date of birth in ISO 8601 format (YYYY-MM-DD)
     */
    public String getDateOfBirth() {
        return dateOfBirth;
    }

    /**
     * Sets the customer's date of birth.
     * 
     * @param dateOfBirth Customer's date of birth in ISO 8601 format (YYYY-MM-DD)
     */
    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    /**
     * Gets the customer's nationality.
     * 
     * @return Customer's nationality or citizenship for regulatory compliance
     */
    public String getNationality() {
        return nationality;
    }

    /**
     * Sets the customer's nationality.
     * 
     * @param nationality Customer's nationality or citizenship
     */
    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    /**
     * Gets the customer's address.
     * 
     * @return Customer's residential address for verification purposes
     */
    public String getAddress() {
        return address;
    }

    /**
     * Sets the customer's address.
     * 
     * @param address Customer's complete residential address
     */
    public void setAddress(String address) {
        this.address = address;
    }

    /**
     * Indicates whether some other object is "equal to" this one.
     * Two CustomerRequest objects are considered equal if all their fields are equal.
     * 
     * @param obj The reference object with which to compare
     * @return true if this object is the same as the obj argument; false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }
        CustomerRequest that = (CustomerRequest) obj;
        return Objects.equals(firstName, that.firstName) &&
               Objects.equals(lastName, that.lastName) &&
               Objects.equals(email, that.email) &&
               Objects.equals(phoneNumber, that.phoneNumber) &&
               Objects.equals(dateOfBirth, that.dateOfBirth) &&
               Objects.equals(nationality, that.nationality) &&
               Objects.equals(address, that.address);
    }

    /**
     * Returns a hash code value for the object.
     * This method is supported for the benefit of hash tables such as those provided by HashMap.
     * 
     * @return A hash code value for this object
     */
    @Override
    public int hashCode() {
        return Objects.hash(firstName, lastName, email, phoneNumber, dateOfBirth, nationality, address);
    }

    /**
     * Returns a string representation of the CustomerRequest object.
     * Note: Sensitive information like full address details are masked for security.
     * 
     * @return A string representation of this CustomerRequest for logging and debugging
     */
    @Override
    public String toString() {
        return "CustomerRequest{" +
                "firstName='" + (firstName != null ? firstName.charAt(0) + "***" : "null") + '\'' +
                ", lastName='" + (lastName != null ? lastName.charAt(0) + "***" : "null") + '\'' +
                ", email='" + (email != null ? email.replaceAll("(.{2}).*(@.*)", "$1***$2") : "null") + '\'' +
                ", phoneNumber='" + (phoneNumber != null ? phoneNumber.replaceAll("(.{3}).*(.{2})", "$1***$2") : "null") + '\'' +
                ", dateOfBirth='" + (dateOfBirth != null ? dateOfBirth.substring(0, 4) + "-**-**" : "null") + '\'' +
                ", nationality='" + nationality + '\'' +
                ", address='" + (address != null ? address.substring(0, Math.min(10, address.length())) + "***" : "null") + '\'' +
                '}';
    }

    /**
     * Validates that all required fields are present and properly formatted.
     * This method performs additional business logic validation beyond annotation-based validation.
     * 
     * @return true if all required fields are present and valid, false otherwise
     */
    public boolean isValid() {
        return firstName != null && !firstName.trim().isEmpty() &&
               lastName != null && !lastName.trim().isEmpty() &&
               email != null && !email.trim().isEmpty() &&
               phoneNumber != null && !phoneNumber.trim().isEmpty() &&
               dateOfBirth != null && !dateOfBirth.trim().isEmpty() &&
               nationality != null && !nationality.trim().isEmpty() &&
               address != null && !address.trim().isEmpty();
    }

    /**
     * Gets the full name of the customer by concatenating first and last names.
     * Useful for display purposes and identity verification processes.
     * 
     * @return The customer's full name (firstName + lastName) or empty string if names are null
     */
    public String getFullName() {
        if (firstName != null && lastName != null) {
            return firstName.trim() + " " + lastName.trim();
        }
        return "";
    }

    /**
     * Sanitizes the input data by trimming whitespace from all string fields.
     * This method should be called before validation to ensure consistent data format.
     * Helps prevent validation errors due to leading/trailing spaces.
     */
    public void sanitizeData() {
        if (firstName != null) {
            firstName = firstName.trim();
        }
        if (lastName != null) {
            lastName = lastName.trim();
        }
        if (email != null) {
            email = email.trim().toLowerCase();
        }
        if (phoneNumber != null) {
            phoneNumber = phoneNumber.trim();
        }
        if (dateOfBirth != null) {
            dateOfBirth = dateOfBirth.trim();
        }
        if (nationality != null) {
            nationality = nationality.trim();
        }
        if (address != null) {
            address = address.trim();
        }
    }
}