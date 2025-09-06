package com.ufs.compliance.dto;

import javax.validation.constraints.NotNull; // version 2.0.1.Final - For validating that the annotated field is not null
import javax.validation.constraints.NotBlank; // version 2.0.1.Final - For validating that the annotated string is not null and contains at least one non-whitespace character
import javax.validation.constraints.Size; // version 2.0.1.Final - For validating that the annotated element's size is between the specified min and max

/**
 * Data Transfer Object for initiating a compliance check.
 * 
 * This class encapsulates the data required to perform a compliance check on a customer 
 * or transaction as part of the F-003: Regulatory Compliance Automation feature.
 * 
 * The compliance check request supports real-time regulatory compliance monitoring 
 * across multiple regulatory frameworks including PSD3, PSR, Basel reforms (CRR3), 
 * and FRTB implementation requirements.
 * 
 * This DTO is designed to support the automated compliance monitoring and reporting 
 * capabilities that enable 24-hour regulatory update cycles and continuous compliance 
 * status monitoring across operational units.
 * 
 * @author UFS Compliance Service
 * @version 1.0
 * @since 1.0
 */
public class ComplianceCheckRequest {

    /**
     * The unique identifier of the customer for whom the compliance check is being performed.
     * 
     * This field is mandatory and must not be null or blank. It supports the Customer 
     * Identification Programme (CIP) and Customer Due Diligence (CDD) processes as part 
     * of KYC/AML compliance requirements.
     * 
     * The customer ID should be between 1 and 50 characters to ensure compatibility 
     * with various customer identification systems and regulatory frameworks.
     */
    @NotNull(message = "Customer ID cannot be null")
    @NotBlank(message = "Customer ID cannot be blank")
    @Size(min = 1, max = 50, message = "Customer ID must be between 1 and 50 characters")
    private String customerId;

    /**
     * The unique identifier of the transaction requiring compliance verification.
     * 
     * This field is mandatory for transaction-based compliance checks and must not be 
     * null or blank. It enables real-time transaction monitoring and supports automated 
     * policy updates within the 24-hour regulatory change detection cycle.
     * 
     * The transaction ID should be between 1 and 100 characters to accommodate various 
     * transaction identification formats across different financial systems and networks.
     */
    @NotNull(message = "Transaction ID cannot be null")
    @NotBlank(message = "Transaction ID cannot be blank")
    @Size(min = 1, max = 100, message = "Transaction ID must be between 1 and 100 characters")
    private String transactionId;

    /**
     * The type of compliance check to be performed.
     * 
     * This field specifies the specific regulatory framework or compliance category 
     * to be applied during the check. Examples include: AML, KYC, SANCTIONS, 
     * BASEL_III, PSD3, FRTB, etc.
     * 
     * This field is mandatory and supports the multi-framework mapping and unified 
     * risk scoring capabilities of the regulatory compliance automation system.
     * 
     * The check type should be between 1 and 30 characters to ensure compatibility 
     * with regulatory framework identifiers and compliance categorization systems.
     */
    @NotNull(message = "Check type cannot be null")
    @NotBlank(message = "Check type cannot be blank")
    @Size(min = 1, max = 30, message = "Check type must be between 1 and 30 characters")
    private String checkType;

    /**
     * Default constructor for ComplianceCheckRequest.
     * 
     * Creates a new instance of ComplianceCheckRequest with all fields initialized to null.
     * This constructor supports dependency injection frameworks and serialization/deserialization 
     * processes commonly used in microservices architectures.
     */
    public ComplianceCheckRequest() {
        // Default constructor - fields will be initialized via setters or during deserialization
    }

    /**
     * Parameterized constructor for ComplianceCheckRequest.
     * 
     * Creates a new instance of ComplianceCheckRequest with the specified values.
     * This constructor provides a convenient way to create fully initialized instances
     * for testing and direct instantiation scenarios.
     * 
     * @param customerId The unique identifier of the customer
     * @param transactionId The unique identifier of the transaction
     * @param checkType The type of compliance check to be performed
     */
    public ComplianceCheckRequest(String customerId, String transactionId, String checkType) {
        this.customerId = customerId;
        this.transactionId = transactionId;
        this.checkType = checkType;
    }

    /**
     * Gets the customer ID for the compliance check.
     * 
     * @return The customer ID as a String. May be null if not yet set.
     */
    public String getCustomerId() {
        return this.customerId;
    }

    /**
     * Sets the customer ID for the compliance check.
     * 
     * The customer ID should be a valid, non-null, non-blank string that uniquely 
     * identifies the customer within the financial institution's customer management system.
     * 
     * @param customerId The customer ID to set. Should not be null or blank for valid compliance checks.
     */
    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    /**
     * Gets the transaction ID for the compliance check.
     * 
     * @return The transaction ID as a String. May be null if not yet set.
     */
    public String getTransactionId() {
        return this.transactionId;
    }

    /**
     * Sets the transaction ID for the compliance check.
     * 
     * The transaction ID should be a valid, non-null, non-blank string that uniquely 
     * identifies the transaction within the financial institution's transaction processing system.
     * 
     * @param transactionId The transaction ID to set. Should not be null or blank for valid compliance checks.
     */
    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    /**
     * Gets the type of compliance check to be performed.
     * 
     * @return The compliance check type as a String. May be null if not yet set.
     */
    public String getCheckType() {
        return this.checkType;
    }

    /**
     * Sets the type of compliance check to be performed.
     * 
     * The check type should correspond to a valid regulatory framework or compliance 
     * category supported by the compliance automation system. Common values include:
     * AML, KYC, SANCTIONS, BASEL_III, PSD3, FRTB, CDD, CIP, etc.
     * 
     * @param checkType The compliance check type to set. Should not be null or blank for valid compliance checks.
     */
    public void setCheckType(String checkType) {
        this.checkType = checkType;
    }

    /**
     * Returns a string representation of this ComplianceCheckRequest.
     * 
     * This method provides a readable representation of the object state for debugging 
     * and logging purposes. Sensitive information is not included in the string representation 
     * to maintain security and privacy compliance.
     * 
     * @return A string representation of this ComplianceCheckRequest
     */
    @Override
    public String toString() {
        return "ComplianceCheckRequest{" +
                "customerId='" + (customerId != null ? customerId.substring(0, Math.min(customerId.length(), 10)) + "..." : "null") + '\'' +
                ", transactionId='" + (transactionId != null ? transactionId.substring(0, Math.min(transactionId.length(), 10)) + "..." : "null") + '\'' +
                ", checkType='" + checkType + '\'' +
                '}';
    }

    /**
     * Indicates whether some other object is "equal to" this one.
     * 
     * Two ComplianceCheckRequest objects are considered equal if all their 
     * corresponding fields are equal.
     * 
     * @param obj The reference object with which to compare
     * @return true if this object is the same as the obj argument; false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        ComplianceCheckRequest that = (ComplianceCheckRequest) obj;
        
        if (customerId != null ? !customerId.equals(that.customerId) : that.customerId != null) return false;
        if (transactionId != null ? !transactionId.equals(that.transactionId) : that.transactionId != null) return false;
        return checkType != null ? checkType.equals(that.checkType) : that.checkType == null;
    }

    /**
     * Returns a hash code value for the object.
     * 
     * This method is supported for the benefit of hash tables such as those provided by HashMap.
     * 
     * @return A hash code value for this object
     */
    @Override
    public int hashCode() {
        int result = customerId != null ? customerId.hashCode() : 0;
        result = 31 * result + (transactionId != null ? transactionId.hashCode() : 0);
        result = 31 * result + (checkType != null ? checkType.hashCode() : 0);
        return result;
    }
}