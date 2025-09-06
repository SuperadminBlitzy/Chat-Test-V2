package com.ufs.compliance.dto;

import java.math.BigDecimal; // java.math 1.8 - To represent the transaction amount with precision
import java.time.LocalDate; // java.time 1.8 - To represent the customer's date of birth
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Size;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Past;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Data Transfer Object for initiating an Anti-Money Laundering (AML) check.
 * This request object carries the necessary information to perform an AML check 
 * on a customer or transaction in compliance with regulatory requirements.
 * 
 * Supports the following functional requirements:
 * - F-004-RQ-002: KYC/AML compliance checks - Customer identification programme (CIP) 
 *   and customer due diligence (CDD) processes
 * - F-004-RQ-001: Digital identity verification - Customer identity confirmation through 
 *   full name, date of birth, address, and government-issued ID verification
 * 
 * Complies with Bank Secrecy Act (BSA) requirements and international KYC/AML rules
 * for watchlist screening against AML watchlists worldwide.
 * 
 * @author UFS Compliance Service
 * @version 1.0
 * @since 2025-01-01
 */
@Schema(
    description = "Request object for initiating Anti-Money Laundering (AML) compliance checks",
    title = "AML Check Request"
)
public class AmlCheckRequest {

    /**
     * Unique identifier for the customer being screened.
     * Used for customer identification programme (CIP) compliance.
     */
    @Schema(
        description = "Unique identifier for the customer being screened for AML compliance",
        example = "CUST-2025-001234",
        required = true
    )
    @NotBlank(message = "Customer ID cannot be blank")
    @Size(min = 3, max = 50, message = "Customer ID must be between 3 and 50 characters")
    @Pattern(regexp = "^[A-Z0-9\\-_]+$", message = "Customer ID must contain only uppercase letters, numbers, hyphens, and underscores")
    @JsonProperty("customerId")
    private String customerId;

    /**
     * Unique identifier for the transaction being screened.
     * Required for transaction-based AML monitoring and audit trails.
     */
    @Schema(
        description = "Unique identifier for the transaction being screened for suspicious activity",
        example = "TXN-2025-567890",
        required = true
    )
    @NotBlank(message = "Transaction ID cannot be blank")
    @Size(min = 3, max = 50, message = "Transaction ID must be between 3 and 50 characters")
    @Pattern(regexp = "^[A-Z0-9\\-_]+$", message = "Transaction ID must contain only uppercase letters, numbers, hyphens, and underscores")
    @JsonProperty("transactionId")
    private String transactionId;

    /**
     * Full legal name of the customer as per official documentation.
     * Critical for identity verification and watchlist screening processes.
     */
    @Schema(
        description = "Full legal name of the customer for identity verification and watchlist screening",
        example = "John Michael Smith",
        required = true
    )
    @NotBlank(message = "Customer name cannot be blank")
    @Size(min = 2, max = 100, message = "Customer name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-\\']+$", message = "Customer name must contain only letters, spaces, hyphens, and apostrophes")
    @JsonProperty("customerName")
    private String customerName;

    /**
     * Date of birth of the customer for age verification and identity confirmation.
     * Used in customer due diligence (CDD) processes and risk assessment.
     */
    @Schema(
        description = "Customer's date of birth for identity verification and age-based risk assessment",
        example = "1985-03-15",
        required = true,
        type = "string",
        format = "date"
    )
    @NotNull(message = "Date of birth cannot be null")
    @Past(message = "Date of birth must be in the past")
    @JsonProperty("dateOfBirth")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    /**
     * Current residential address of the customer.
     * Required for geographic risk assessment and sanctions screening.
     */
    @Schema(
        description = "Customer's current residential address for geographic risk assessment",
        example = "123 Main Street, New York, NY 10001, USA",
        required = true
    )
    @NotBlank(message = "Address cannot be blank")
    @Size(min = 10, max = 200, message = "Address must be between 10 and 200 characters")
    @JsonProperty("address")
    private String address;

    /**
     * Monetary amount of the transaction being screened.
     * Used for threshold-based monitoring and suspicious activity detection.
     * Precision is maintained using BigDecimal for financial accuracy.
     */
    @Schema(
        description = "Transaction amount for threshold-based AML monitoring",
        example = "15000.50",
        required = true,
        type = "number",
        format = "decimal"
    )
    @NotNull(message = "Transaction amount cannot be null")
    @DecimalMin(value = "0.01", message = "Transaction amount must be greater than zero")
    @JsonProperty("transactionAmount")
    private BigDecimal transactionAmount;

    /**
     * ISO 4217 currency code for the transaction.
     * Required for cross-border transaction monitoring and sanctions compliance.
     */
    @Schema(
        description = "ISO 4217 currency code for the transaction",
        example = "USD",
        required = true
    )
    @NotBlank(message = "Transaction currency cannot be blank")
    @Size(min = 3, max = 3, message = "Currency code must be exactly 3 characters")
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency code must be a valid ISO 4217 code (3 uppercase letters)")
    @JsonProperty("transactionCurrency")
    private String transactionCurrency;

    /**
     * Default constructor for AmlCheckRequest.
     * Creates an empty instance suitable for deserialization and framework usage.
     * 
     * This constructor supports the microservices architecture pattern where
     * DTOs are populated through JSON deserialization or builder patterns.
     */
    public AmlCheckRequest() {
        // Default constructor for framework compatibility and deserialization
        // All properties will be initialized through setters or field injection
    }

    /**
     * Comprehensive constructor for creating a fully populated AML check request.
     * 
     * @param customerId Unique customer identifier for CIP compliance
     * @param transactionId Unique transaction identifier for audit trails
     * @param customerName Full legal name for identity verification
     * @param dateOfBirth Customer's date of birth for age verification
     * @param address Current residential address for geographic risk assessment
     * @param transactionAmount Transaction amount for threshold monitoring
     * @param transactionCurrency ISO 4217 currency code for compliance
     */
    public AmlCheckRequest(String customerId, String transactionId, String customerName, 
                          LocalDate dateOfBirth, String address, BigDecimal transactionAmount, 
                          String transactionCurrency) {
        this.customerId = customerId;
        this.transactionId = transactionId;
        this.customerName = customerName;
        this.dateOfBirth = dateOfBirth;
        this.address = address;
        this.transactionAmount = transactionAmount;
        this.transactionCurrency = transactionCurrency;
    }

    // Getter and Setter methods with comprehensive documentation

    /**
     * Gets the unique customer identifier used for AML screening.
     * 
     * @return Customer ID string for CIP compliance
     */
    public String getCustomerId() {
        return customerId;
    }

    /**
     * Sets the unique customer identifier for AML screening.
     * 
     * @param customerId Customer ID for customer identification programme compliance
     */
    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    /**
     * Gets the unique transaction identifier for audit and monitoring purposes.
     * 
     * @return Transaction ID string for compliance tracking
     */
    public String getTransactionId() {
        return transactionId;
    }

    /**
     * Sets the unique transaction identifier for AML monitoring.
     * 
     * @param transactionId Transaction ID for suspicious activity detection
     */
    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    /**
     * Gets the customer's full legal name for identity verification.
     * 
     * @return Customer's full name as per official documentation
     */
    public String getCustomerName() {
        return customerName;
    }

    /**
     * Sets the customer's full legal name for watchlist screening.
     * 
     * @param customerName Full legal name for identity verification
     */
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    /**
     * Gets the customer's date of birth for age verification.
     * 
     * @return Date of birth for identity confirmation and risk assessment
     */
    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    /**
     * Sets the customer's date of birth for CDD processes.
     * 
     * @param dateOfBirth Customer's birth date for due diligence verification
     */
    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    /**
     * Gets the customer's current residential address.
     * 
     * @return Address string for geographic risk assessment
     */
    public String getAddress() {
        return address;
    }

    /**
     * Sets the customer's residential address for sanctions screening.
     * 
     * @param address Current address for geographic compliance checks
     */
    public void setAddress(String address) {
        this.address = address;
    }

    /**
     * Gets the transaction amount for threshold-based monitoring.
     * 
     * @return Transaction amount with financial precision
     */
    public BigDecimal getTransactionAmount() {
        return transactionAmount;
    }

    /**
     * Sets the transaction amount for AML threshold monitoring.
     * 
     * @param transactionAmount Amount for suspicious activity detection
     */
    public void setTransactionAmount(BigDecimal transactionAmount) {
        this.transactionAmount = transactionAmount;
    }

    /**
     * Gets the ISO 4217 currency code for the transaction.
     * 
     * @return Three-letter currency code for compliance reporting
     */
    public String getTransactionCurrency() {
        return transactionCurrency;
    }

    /**
     * Sets the ISO 4217 currency code for cross-border monitoring.
     * 
     * @param transactionCurrency Currency code for sanctions compliance
     */
    public void setTransactionCurrency(String transactionCurrency) {
        this.transactionCurrency = transactionCurrency;
    }

    /**
     * Validates the completeness and integrity of the AML check request.
     * Ensures all required fields are populated for compliance processing.
     * 
     * @return true if the request contains all required data for AML screening
     */
    public boolean isValid() {
        return customerId != null && !customerId.trim().isEmpty() &&
               transactionId != null && !transactionId.trim().isEmpty() &&
               customerName != null && !customerName.trim().isEmpty() &&
               dateOfBirth != null &&
               address != null && !address.trim().isEmpty() &&
               transactionAmount != null && transactionAmount.compareTo(BigDecimal.ZERO) > 0 &&
               transactionCurrency != null && transactionCurrency.length() == 3;
    }

    /**
     * Creates a sanitized string representation for audit logging.
     * Excludes sensitive customer information while maintaining traceability.
     * 
     * @return Audit-safe string representation of the request
     */
    public String toAuditString() {
        return String.format("AmlCheckRequest{customerId='%s', transactionId='%s', " +
                           "customerName='***MASKED***', dateOfBirth='***MASKED***', " +
                           "address='***MASKED***', transactionAmount=%s, transactionCurrency='%s'}",
                           customerId, transactionId, transactionAmount, transactionCurrency);
    }

    /**
     * Standard toString method providing complete object representation.
     * Should only be used in secure environments due to sensitive data exposure.
     * 
     * @return Complete string representation of the AML check request
     */
    @Override
    public String toString() {
        return String.format("AmlCheckRequest{customerId='%s', transactionId='%s', " +
                           "customerName='%s', dateOfBirth=%s, address='%s', " +
                           "transactionAmount=%s, transactionCurrency='%s'}",
                           customerId, transactionId, customerName, dateOfBirth, 
                           address, transactionAmount, transactionCurrency);
    }

    /**
     * Equals method for object comparison based on business identifiers.
     * Uses customer ID and transaction ID as primary comparison criteria.
     * 
     * @param obj Object to compare with this instance
     * @return true if objects represent the same AML check request
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        AmlCheckRequest that = (AmlCheckRequest) obj;
        
        return customerId != null ? customerId.equals(that.customerId) : that.customerId == null &&
               transactionId != null ? transactionId.equals(that.transactionId) : that.transactionId == null;
    }

    /**
     * Hash code method consistent with equals implementation.
     * Based on customer ID and transaction ID for proper collection behavior.
     * 
     * @return Hash code for this AML check request
     */
    @Override
    public int hashCode() {
        int result = customerId != null ? customerId.hashCode() : 0;
        result = 31 * result + (transactionId != null ? transactionId.hashCode() : 0);
        return result;
    }
}