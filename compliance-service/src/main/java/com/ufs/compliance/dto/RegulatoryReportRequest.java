package com.ufs.compliance.dto;

import java.time.LocalDate; // Java 8+ - For representing start and end dates for the report
import java.util.Map; // Java 8+ - To hold any additional, report-specific parameters
import java.io.Serializable; // Java 8+ - For object serialization support
import javax.validation.constraints.NotNull; // Java Validation API 2.0+ - For validation annotations
import javax.validation.constraints.NotBlank; // Java Validation API 2.0+ - For non-blank string validation
import javax.validation.constraints.Size; // Java Validation API 2.0+ - For size constraints
import javax.validation.Valid; // Java Validation API 2.0+ - For nested object validation
import com.fasterxml.jackson.annotation.JsonProperty; // Jackson 2.15+ - For JSON serialization control
import com.fasterxml.jackson.annotation.JsonFormat; // Jackson 2.15+ - For date formatting
import com.fasterxml.jackson.databind.annotation.JsonDeserialize; // Jackson 2.15+ - For custom deserialization
import com.fasterxml.jackson.databind.annotation.JsonSerialize; // Jackson 2.15+ - For custom serialization
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer; // Jackson JSR310 2.15+ - For LocalDate serialization
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer; // Jackson JSR310 2.15+ - For LocalDate deserialization

/**
 * Data Transfer Object (DTO) for requesting the generation of a regulatory compliance report.
 * 
 * This class encapsulates all the necessary parameters needed to generate a specific compliance 
 * report as part of the F-003: Regulatory Compliance Automation feature. It supports continuous 
 * assessments and compliance status monitoring across operational units.
 * 
 * The DTO is designed to handle various regulatory reporting requirements including:
 * - Multi-jurisdictional compliance reporting
 * - Time-bounded report generation with configurable date ranges
 * - Flexible parameter passing for different report types
 * - Enterprise-grade validation and serialization support
 * 
 * This class implements Serializable to support distributed caching and message queue 
 * operations in the microservices architecture.
 * 
 * @author UFS Compliance Service
 * @version 1.0
 * @since 2025-01-01
 */
public class RegulatoryReportRequest implements Serializable {

    /**
     * Serial version UID for maintaining serialization compatibility across different versions
     * of this class. This ensures that serialized objects can be properly deserialized even
     * after minor class modifications.
     */
    private static final long serialVersionUID = 1L;

    /**
     * The name identifier of the regulatory report to be generated.
     * 
     * This field specifies the unique name or identifier of the report template
     * that should be used for generation. Examples include:
     * - "BASEL_III_CAPITAL_ADEQUACY"
     * - "PCI_DSS_COMPLIANCE_ASSESSMENT" 
     * - "SOX_INTERNAL_CONTROLS_REVIEW"
     * - "GDPR_DATA_PROCESSING_AUDIT"
     * 
     * The report name is used by the compliance engine to locate the appropriate
     * report template and apply the correct regulatory rules and calculations.
     */
    @NotBlank(message = "Report name cannot be blank")
    @Size(min = 1, max = 255, message = "Report name must be between 1 and 255 characters")
    @JsonProperty("reportName")
    private String reportName;

    /**
     * The type classification of the regulatory report.
     * 
     * This field categorizes the report into different types based on regulatory
     * framework, frequency, or purpose. Common types include:
     * - "FINANCIAL" - Financial compliance reports (Basel, IFRS, etc.)
     * - "OPERATIONAL" - Operational risk and control reports
     * - "DATA_PRIVACY" - GDPR, CCPA, and other privacy compliance reports
     * - "SECURITY" - Cybersecurity and information security reports
     * - "AML_KYC" - Anti-Money Laundering and Know Your Customer reports
     * - "REGULATORY_CAPITAL" - Capital adequacy and liquidity reports
     * 
     * The report type helps determine the appropriate validation rules, data sources,
     * and formatting requirements for the generated report.
     */
    @NotBlank(message = "Report type cannot be blank")
    @Size(min = 1, max = 100, message = "Report type must be between 1 and 100 characters")
    @JsonProperty("reportType")
    private String reportType;

    /**
     * The start date for the report's data collection period.
     * 
     * This field defines the beginning of the time range for which data should be
     * included in the report. The start date is inclusive, meaning data from this
     * date will be included in the report calculations.
     * 
     * For regulatory reports, this typically aligns with:
     * - Regulatory reporting periods (quarterly, annually)
     * - Fiscal year boundaries
     * - Compliance assessment cycles
     * - Audit periods
     * 
     * The date is stored as LocalDate to ensure timezone-independent processing
     * and to align with regulatory reporting standards that typically work with
     * calendar dates rather than specific timestamps.
     */
    @NotNull(message = "Start date cannot be null")
    @JsonProperty("startDate")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @JsonSerialize(using = LocalDateSerializer.class)
    @JsonDeserialize(using = LocalDateDeserializer.class)
    private LocalDate startDate;

    /**
     * The end date for the report's data collection period.
     * 
     * This field defines the end of the time range for which data should be
     * included in the report. The end date is inclusive, meaning data from this
     * date will be included in the report calculations.
     * 
     * The end date must be greater than or equal to the start date to ensure
     * a valid reporting period. Business validation rules will enforce this
     * constraint during request processing.
     * 
     * Common usage patterns include:
     * - Quarter-end dates for quarterly regulatory reports
     * - Year-end dates for annual compliance assessments
     * - Month-end dates for monthly monitoring reports
     * - Custom date ranges for ad-hoc compliance reviews
     */
    @NotNull(message = "End date cannot be null")
    @JsonProperty("endDate")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @JsonSerialize(using = LocalDateSerializer.class)
    @JsonDeserialize(using = LocalDateDeserializer.class)
    private LocalDate endDate;

    /**
     * The regulatory jurisdiction for which the report is being generated.
     * 
     * This field specifies the legal and regulatory jurisdiction that applies
     * to this report. The jurisdiction determines:
     * - Which regulatory rules and standards to apply
     * - The format and structure requirements for the report
     * - The submission deadlines and frequencies
     * - The regulatory authorities that will receive the report
     * 
     * Common jurisdiction values include:
     * - "US_FEDERAL" - United States federal regulations (SEC, CFTC, OCC)
     * - "EU_CENTRAL" - European Union central regulations (EBA, ESMA, EIOPA)
     * - "UK_FCA" - United Kingdom Financial Conduct Authority
     * - "SINGAPORE_MAS" - Monetary Authority of Singapore
     * - "HONG_KONG_HKMA" - Hong Kong Monetary Authority
     * - "CANADA_OSFI" - Office of the Superintendent of Financial Institutions Canada
     * 
     * Multi-jurisdictional reports can be generated by making separate requests
     * for each jurisdiction to ensure proper compliance with local requirements.
     */
    @NotBlank(message = "Jurisdiction cannot be blank")
    @Size(min = 2, max = 50, message = "Jurisdiction must be between 2 and 50 characters")
    @JsonProperty("jurisdiction")
    private String jurisdiction;

    /**
     * Additional parameters for customizing the report generation process.
     * 
     * This flexible parameter map allows for report-specific configuration options
     * without requiring changes to the core DTO structure. The map supports various
     * data types through the Object value type, providing maximum flexibility for
     * different report requirements.
     * 
     * Common parameter categories include:
     * 
     * Report Formatting Parameters:
     * - "outputFormat" -> "PDF", "EXCEL", "XML", "JSON"
     * - "includeCharts" -> Boolean (true/false)
     * - "detailLevel" -> "SUMMARY", "DETAILED", "FULL"
     * - "language" -> "EN", "FR", "DE", "ES"
     * 
     * Data Filtering Parameters:
     * - "businessUnits" -> List<String> (specific units to include)
     * - "productTypes" -> List<String> (specific products to analyze)
     * - "riskCategories" -> List<String> (risk types to focus on)
     * - "customerSegments" -> List<String> (customer categories)
     * 
     * Regulatory Specific Parameters:
     * - "baselPillar" -> "PILLAR_1", "PILLAR_2", "PILLAR_3"
     * - "ifrsStandard" -> "IFRS_9", "IFRS_17"
     * - "stressTestScenario" -> "BASELINE", "ADVERSE", "SEVERELY_ADVERSE"
     * - "complianceThreshold" -> Double (minimum compliance percentage)
     * 
     * Technical Parameters:
     * - "maxProcessingTime" -> Integer (seconds)
     * - "enableParallelProcessing" -> Boolean
     * - "dataCacheExpiry" -> Integer (minutes)
     * - "notificationEmail" -> String (completion notification)
     * 
     * The parameters are validated by the report generation service based on
     * the specific report type and template requirements.
     */
    @JsonProperty("parameters")
    @Valid
    private Map<String, Object> parameters;

    /**
     * Default constructor for the RegulatoryReportRequest class.
     * 
     * This no-argument constructor is required for:
     * - JSON deserialization by Jackson framework
     * - JPA entity instantiation (if used as embedded object)
     * - Bean validation framework operations
     * - Spring Framework dependency injection
     * - Reflection-based frameworks and tools
     * 
     * The constructor initializes the object in a valid but empty state.
     * All fields will have their default values (null for objects).
     * Proper validation will ensure that required fields are populated
     * before the request is processed.
     */
    public RegulatoryReportRequest() {
        // Default constructor - no initialization required
        // All fields will be set through setter methods or deserialization
    }

    /**
     * Returns the name of the regulatory report to be generated.
     * 
     * The report name serves as a unique identifier for the report template
     * and is used by the compliance engine to locate the appropriate
     * report generation logic and regulatory rules.
     * 
     * @return String The name of the report, or null if not set
     */
    public String getReportName() {
        return this.reportName;
    }

    /**
     * Sets the name of the regulatory report to be generated.
     * 
     * This method allows setting the report name that will be used to identify
     * the specific report template and associated regulatory rules for generation.
     * The report name should correspond to a valid template registered in the
     * compliance reporting system.
     * 
     * Validation constraints:
     * - Cannot be null or blank
     * - Must be between 1 and 255 characters in length
     * - Should match existing report template identifiers
     * 
     * @param reportName The name of the report to be generated
     */
    public void setReportName(String reportName) {
        this.reportName = reportName;
    }

    /**
     * Returns the type classification of the regulatory report.
     * 
     * The report type helps categorize the report based on regulatory framework,
     * compliance domain, or business purpose. This classification is used to
     * apply appropriate validation rules, data sources, and formatting standards.
     * 
     * @return String The type of the report, or null if not set
     */
    public String getReportType() {
        return this.reportType;
    }

    /**
     * Sets the type classification of the regulatory report.
     * 
     * This method allows setting the report type which categorizes the report
     * based on regulatory framework or compliance domain. The report type
     * influences how the report is processed, validated, and formatted.
     * 
     * Validation constraints:
     * - Cannot be null or blank
     * - Must be between 1 and 100 characters in length
     * - Should match recognized report type categories
     * 
     * @param reportType The type classification of the report
     */
    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    /**
     * Returns the start date for the report's data collection period.
     * 
     * The start date defines the beginning of the time range for which data
     * will be included in the regulatory report. This date is inclusive,
     * meaning data from this date will be part of the report calculations.
     * 
     * @return LocalDate The start date of the report period, or null if not set
     */
    public LocalDate getStartDate() {
        return this.startDate;
    }

    /**
     * Sets the start date for the report's data collection period.
     * 
     * This method allows setting the beginning date of the reporting period.
     * The start date must be a valid date and should be before or equal to
     * the end date to ensure a valid reporting period.
     * 
     * Business rules enforced:
     * - Start date cannot be null
     * - Start date should not be in the future (for most report types)
     * - Start date must be before or equal to end date
     * - Start date should align with regulatory reporting periods
     * 
     * @param startDate The start date for the report's data collection period
     */
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    /**
     * Returns the end date for the report's data collection period.
     * 
     * The end date defines the end of the time range for which data
     * will be included in the regulatory report. This date is inclusive,
     * meaning data from this date will be part of the report calculations.
     * 
     * @return LocalDate The end date of the report period, or null if not set
     */
    public LocalDate getEndDate() {
        return this.endDate;
    }

    /**
     * Sets the end date for the report's data collection period.
     * 
     * This method allows setting the ending date of the reporting period.
     * The end date must be a valid date and should be after or equal to
     * the start date to ensure a valid reporting period.
     * 
     * Business rules enforced:
     * - End date cannot be null
     * - End date should not be in the future (for most report types)
     * - End date must be after or equal to start date
     * - End date should align with regulatory reporting periods
     * 
     * @param endDate The end date for the report's data collection period
     */
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    /**
     * Returns the regulatory jurisdiction for which the report is being generated.
     * 
     * The jurisdiction determines which regulatory framework, rules, and standards
     * will be applied during report generation. It also influences the report
     * format, required disclosures, and submission requirements.
     * 
     * @return String The regulatory jurisdiction, or null if not set
     */
    public String getJurisdiction() {
        return this.jurisdiction;
    }

    /**
     * Sets the regulatory jurisdiction for the report generation.
     * 
     * This method allows setting the regulatory jurisdiction that will determine
     * which specific regulatory rules, standards, and formatting requirements
     * are applied during report generation.
     * 
     * Validation constraints:
     * - Cannot be null or blank
     * - Must be between 2 and 50 characters in length
     * - Should match recognized jurisdiction identifiers
     * - Must correspond to supported regulatory frameworks
     * 
     * @param jurisdiction The regulatory jurisdiction for report generation
     */
    public void setJurisdiction(String jurisdiction) {
        this.jurisdiction = jurisdiction;
    }

    /**
     * Returns the additional parameters for customizing the report generation.
     * 
     * The parameters map contains report-specific configuration options that
     * allow for flexible customization of the report generation process without
     * requiring changes to the core DTO structure.
     * 
     * @return Map<String, Object> A map of additional parameters, or null if not set
     */
    public Map<String, Object> getParameters() {
        return this.parameters;
    }

    /**
     * Sets the additional parameters for customizing the report generation.
     * 
     * This method allows setting a map of additional parameters that provide
     * flexibility for report-specific configuration options. The parameters
     * can include formatting options, data filters, regulatory-specific settings,
     * and technical configuration options.
     * 
     * Parameter validation:
     * - Map can be null or empty (optional parameters)
     * - Parameter keys should be non-null strings
     * - Parameter values are validated based on report type requirements
     * - Nested objects within parameters are subject to validation
     * 
     * @param parameters A map of additional configuration parameters
     */
    public void setParameters(Map<String, Object> parameters) {
        this.parameters = parameters;
    }

    /**
     * Returns a string representation of the RegulatoryReportRequest object.
     * 
     * This method provides a human-readable representation of the request object
     * that includes all key fields. It's useful for logging, debugging, and
     * audit trail purposes in compliance reporting scenarios.
     * 
     * The string representation includes:
     * - Report name and type for identification
     * - Date range for the reporting period
     * - Jurisdiction for regulatory context
     * - Parameter count (without exposing sensitive parameter values)
     * 
     * Note: Sensitive information in parameters is not exposed in the string
     * representation to maintain security and privacy standards.
     * 
     * @return String A formatted string representation of the request object
     */
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("RegulatoryReportRequest{");
        sb.append("reportName='").append(reportName).append('\'');
        sb.append(", reportType='").append(reportType).append('\'');
        sb.append(", startDate=").append(startDate);
        sb.append(", endDate=").append(endDate);
        sb.append(", jurisdiction='").append(jurisdiction).append('\'');
        sb.append(", parameters=").append(parameters != null ? "[" + parameters.size() + " parameters]" : "null");
        sb.append('}');
        return sb.toString();
    }

    /**
     * Compares this RegulatoryReportRequest with another object for equality.
     * 
     * Two RegulatoryReportRequest objects are considered equal if all their
     * fields have the same values. This method is important for:
     * - Deduplication of report requests
     * - Caching mechanisms
     * - Unit testing and validation
     * - Audit trail comparison
     * 
     * The equality check includes:
     * - Report name and type
     * - Start and end dates
     * - Jurisdiction
     * - All parameters in the parameters map
     * 
     * @param obj The object to compare with this RegulatoryReportRequest
     * @return boolean true if the objects are equal, false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }
        
        RegulatoryReportRequest that = (RegulatoryReportRequest) obj;
        
        if (reportName != null ? !reportName.equals(that.reportName) : that.reportName != null) {
            return false;
        }
        if (reportType != null ? !reportType.equals(that.reportType) : that.reportType != null) {
            return false;
        }
        if (startDate != null ? !startDate.equals(that.startDate) : that.startDate != null) {
            return false;
        }
        if (endDate != null ? !endDate.equals(that.endDate) : that.endDate != null) {
            return false;
        }
        if (jurisdiction != null ? !jurisdiction.equals(that.jurisdiction) : that.jurisdiction != null) {
            return false;
        }
        return parameters != null ? parameters.equals(that.parameters) : that.parameters == null;
    }

    /**
     * Returns a hash code value for this RegulatoryReportRequest object.
     * 
     * The hash code is computed based on all fields of the object to ensure
     * that equal objects have equal hash codes. This method is important for:
     * - Hash-based collections (HashMap, HashSet)
     * - Caching mechanisms
     * - Efficient equality comparisons
     * - Consistent behavior with equals() method
     * 
     * The hash code calculation includes:
     * - Report name and type
     * - Start and end dates
     * - Jurisdiction
     * - Parameters map
     * 
     * @return int A hash code value for this object
     */
    @Override
    public int hashCode() {
        int result = reportName != null ? reportName.hashCode() : 0;
        result = 31 * result + (reportType != null ? reportType.hashCode() : 0);
        result = 31 * result + (startDate != null ? startDate.hashCode() : 0);
        result = 31 * result + (endDate != null ? endDate.hashCode() : 0);
        result = 31 * result + (jurisdiction != null ? jurisdiction.hashCode() : 0);
        result = 31 * result + (parameters != null ? parameters.hashCode() : 0);
        return result;
    }
}