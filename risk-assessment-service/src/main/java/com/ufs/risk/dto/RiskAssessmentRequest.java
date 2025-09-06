package com.ufs.risk.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.Valid;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

/**
 * Data Transfer Object for submitting a risk assessment request to the AI-Powered Risk Assessment Engine.
 * 
 * This class encapsulates all the data required by the AI-Powered Risk Assessment Engine (F-002) 
 * to perform comprehensive risk analysis, generate risk scores (0-1000 scale), risk categories, 
 * mitigation recommendations, and confidence intervals.
 * 
 * The AI engine analyzes factors like spending habits, investment behaviors to gauge creditworthiness 
 * and provide tailored risk assessment strategies with explainable AI capabilities for regulatory compliance.
 * 
 * Performance Requirements:
 * - Supports real-time risk scoring with <500ms response time
 * - Designed for 95% accuracy rate in risk assessment
 * - 24/7 availability with horizontal scaling capability
 * - Bias detection and mitigation compliance ready
 * 
 * Compliance Features:
 * - Model explainability support for expert and lay audiences
 * - Algorithmic auditing for fairness and regulatory compliance
 * - Banking agencies review compatibility for AI risk management
 * - Annual resource disclosure support for AI risk management
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2025-01-01
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonDeserialize(builder = RiskAssessmentRequest.RiskAssessmentRequestBuilder.class)
public class RiskAssessmentRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Unique identifier for the customer requesting risk assessment.
     * 
     * This field is essential for linking the risk assessment to specific customer profiles,
     * enabling personalized risk scoring and maintaining audit trails for regulatory compliance.
     * 
     * Format: Alphanumeric string, typically UUID or internal customer ID
     * Example: "CUST-123456789" or "550e8400-e29b-41d4-a716-446655440000"
     */
    @NotBlank(message = "Customer ID is required for risk assessment")
    @Size(min = 3, max = 100, message = "Customer ID must be between 3 and 100 characters")
    @Pattern(regexp = "^[A-Za-z0-9\\-_]+$", message = "Customer ID must contain only alphanumeric characters, hyphens, and underscores")
    @JsonProperty("customer_id")
    private String customerId;

    /**
     * Comprehensive transaction history for the customer.
     * 
     * Contains historical transaction data used by the AI engine to analyze spending patterns,
     * investment behaviors, payment history, and financial stability indicators. Each transaction
     * includes detailed metadata for comprehensive behavioral analysis.
     * 
     * Expected transaction fields include:
     * - transaction_id: Unique transaction identifier
     * - amount: Transaction amount (positive for credits, negative for debits)
     * - currency: ISO 4217 currency code
     * - timestamp: Transaction timestamp (ISO 8601 format)
     * - category: Transaction category (e.g., "groceries", "utilities", "investment")
     * - merchant: Merchant name or identifier
     * - payment_method: Payment method used (e.g., "credit_card", "debit_card", "ach")
     * - account_type: Source account type (e.g., "checking", "savings", "credit")
     * - location: Geographic location of transaction
     * - risk_flags: Any existing risk indicators from fraud detection systems
     * 
     * This data enables the AI engine to:
     * - Assess spending habits and financial behavior patterns
     * - Evaluate payment consistency and reliability
     * - Identify irregular or suspicious transaction patterns
     * - Calculate debt-to-income ratios and cash flow stability
     * - Determine credit utilization patterns
     */
    @NotNull(message = "Transaction history is required for risk assessment")
    @NotEmpty(message = "Transaction history cannot be empty")
    @Size(min = 1, max = 10000, message = "Transaction history must contain between 1 and 10,000 transactions")
    @Valid
    @JsonProperty("transaction_history")
    private List<Map<String, Object>> transactionHistory = new ArrayList<>();

    /**
     * Real-time market data and economic indicators.
     * 
     * Contains current market conditions, economic indicators, and financial market data
     * that influence risk assessment calculations. This data provides contextual information
     * for the AI engine to adjust risk scores based on prevailing market conditions.
     * 
     * Expected market data fields include:
     * - market_volatility: Current market volatility indicators (VIX, sector volatilities)
     * - interest_rates: Current interest rate environment (federal funds rate, treasury yields)
     * - economic_indicators: GDP growth, unemployment rate, inflation metrics
     * - sector_performance: Relevant sector performance metrics
     * - currency_rates: Exchange rates for multi-currency assessments
     * - commodity_prices: Relevant commodity price data
     * - credit_spreads: Corporate bond spreads and credit market conditions
     * - liquidity_indicators: Market liquidity measures
     * - regulatory_announcements: Recent regulatory changes affecting risk
     * - geopolitical_events: Geopolitical risk factors
     * 
     * This data enables the AI engine to:
     * - Adjust risk scores based on current market conditions
     * - Account for systemic risk factors
     * - Provide market-sensitive risk assessments
     * - Consider macroeconomic impacts on individual risk profiles
     */
    @JsonProperty("market_data")
    private Map<String, Object> marketData = new HashMap<>();

    /**
     * External risk factors and third-party data sources.
     * 
     * Aggregates external risk indicators from various sources including credit bureaus,
     * regulatory databases, watchlists, and other risk intelligence platforms. This data
     * provides comprehensive external validation and risk factor identification.
     * 
     * Expected external risk factor fields include:
     * - credit_bureau_data: Credit scores, payment history, credit utilization from major bureaus
     * - regulatory_watchlists: Sanctions lists, PEP lists, adverse media screening
     * - fraud_indicators: External fraud risk signals and blacklist checks
     * - industry_risk_factors: Industry-specific risk indicators and trends
     * - geographic_risk: Location-based risk factors and sanctions
     * - social_media_sentiment: Social media and news sentiment analysis
     * - business_risk_factors: For business customers, industry and company-specific risks
     * - behavioral_biometrics: Device fingerprinting and behavioral analysis data
     * - third_party_scores: External risk scores from specialized providers (LexisNexis, etc.)
     * - compliance_history: Historical compliance issues or regulatory actions
     * - identity_verification: Results from identity verification services
     * - document_authenticity: Document verification and authenticity checks
     * - network_analysis: Connection to known high-risk entities or networks
     * 
     * This data enables the AI engine to:
     * - Validate internal risk assessments with external sources
     * - Identify previously unknown risk factors
     * - Ensure comprehensive compliance screening
     * - Detect sophisticated fraud patterns
     * - Provide holistic risk view combining internal and external data
     */
    @JsonProperty("external_risk_factors")
    private Map<String, Object> externalRiskFactors = new HashMap<>();

    /**
     * Timestamp when the risk assessment request was created.
     * 
     * Automatically populated to ensure proper temporal context for risk assessment
     * and to support audit trails and regulatory reporting requirements.
     */
    @JsonProperty("request_timestamp")
    private LocalDateTime requestTimestamp;

    /**
     * Additional metadata and processing instructions for the AI engine.
     * 
     * Contains optional configuration parameters, processing preferences, and
     * metadata that can influence the risk assessment process without changing
     * the core assessment logic.
     * 
     * Potential metadata fields include:
     * - assessment_type: Type of risk assessment requested (e.g., "credit", "operational", "market")
     * - urgency_level: Processing priority level
     * - model_version: Specific AI model version to use
     * - explainability_level: Level of explanation required (basic, detailed, regulatory)
     * - compliance_requirements: Specific regulatory requirements to consider
     * - customer_segment: Customer segment for tailored assessment
     * - product_type: Financial product being assessed for
     * - assessment_scope: Scope of assessment (individual, household, business)
     * - data_freshness_requirements: Requirements for data recency
     * - confidence_threshold: Minimum confidence level required
     */
    @JsonProperty("metadata")
    private Map<String, Object> metadata = new HashMap<>();

    /**
     * Configuration for model explainability and transparency requirements.
     * 
     * Specifies the level of explainability required for the AI model output,
     * ensuring compliance with regulatory requirements for transparent and
     * explainable AI systems in financial services.
     * 
     * Configuration options include:
     * - explanation_depth: Level of detail required (summary, detailed, technical)
     * - target_audience: Intended audience (customer, expert, regulator)
     * - feature_importance: Include feature importance scores
     * - model_confidence: Include confidence intervals and uncertainty measures
     * - alternative_scenarios: Include what-if scenario analysis
     * - bias_reporting: Include bias detection and fairness metrics
     * - regulatory_compliance: Specific regulatory explanation requirements
     */
    @JsonProperty("explainability_config")
    private Map<String, Object> explainabilityConfig = new HashMap<>();

    /**
     * Custom constructor with essential fields for basic risk assessment.
     * 
     * @param customerId Unique customer identifier
     * @param transactionHistory List of customer transactions
     */
    public RiskAssessmentRequest(String customerId, List<Map<String, Object>> transactionHistory) {
        this.customerId = customerId;
        this.transactionHistory = transactionHistory != null ? transactionHistory : new ArrayList<>();
        this.marketData = new HashMap<>();
        this.externalRiskFactors = new HashMap<>();
        this.metadata = new HashMap<>();
        this.explainabilityConfig = new HashMap<>();
        this.requestTimestamp = LocalDateTime.now();
    }

    /**
     * Builder pattern implementation for Jackson deserialization.
     */
    @JsonPOJOBuilder(withPrefix = "")
    public static class RiskAssessmentRequestBuilder {
        // Lombok will generate the builder implementation
    }

    /**
     * Validates the completeness and consistency of the risk assessment request.
     * 
     * Performs business logic validation beyond standard bean validation to ensure
     * the request contains sufficient data for meaningful risk assessment.
     * 
     * @return true if the request is valid for processing
     */
    public boolean isValidForProcessing() {
        if (customerId == null || customerId.trim().isEmpty()) {
            return false;
        }
        
        if (transactionHistory == null || transactionHistory.isEmpty()) {
            return false;
        }

        // Validate that transaction history contains minimum required fields
        for (Map<String, Object> transaction : transactionHistory) {
            if (!transaction.containsKey("amount") || !transaction.containsKey("timestamp")) {
                return false;
            }
        }

        return true;
    }

    /**
     * Enriches the request with default values and computed fields.
     * 
     * Adds timestamp, initializes empty collections, and sets default
     * configuration values to ensure the request is fully prepared for processing.
     */
    public void enrichWithDefaults() {
        if (this.requestTimestamp == null) {
            this.requestTimestamp = LocalDateTime.now();
        }
        
        if (this.marketData == null) {
            this.marketData = new HashMap<>();
        }
        
        if (this.externalRiskFactors == null) {
            this.externalRiskFactors = new HashMap<>();
        }
        
        if (this.metadata == null) {
            this.metadata = new HashMap<>();
        }
        
        if (this.explainabilityConfig == null) {
            this.explainabilityConfig = new HashMap<>();
            // Set default explainability requirements
            this.explainabilityConfig.put("explanation_depth", "detailed");
            this.explainabilityConfig.put("target_audience", "expert");
            this.explainabilityConfig.put("feature_importance", true);
            this.explainabilityConfig.put("model_confidence", true);
            this.explainabilityConfig.put("bias_reporting", true);
        }
        
        // Add default metadata
        if (!this.metadata.containsKey("assessment_type")) {
            this.metadata.put("assessment_type", "comprehensive");
        }
        
        if (!this.metadata.containsKey("model_version")) {
            this.metadata.put("model_version", "latest");
        }
    }

    /**
     * Gets the total number of transactions in the history.
     * 
     * @return Number of transactions available for analysis
     */
    public int getTransactionCount() {
        return transactionHistory != null ? transactionHistory.size() : 0;
    }

    /**
     * Checks if market data is available for risk assessment.
     * 
     * @return true if market data is present and not empty
     */
    public boolean hasMarketData() {
        return marketData != null && !marketData.isEmpty();
    }

    /**
     * Checks if external risk factors are available for risk assessment.
     * 
     * @return true if external risk factors are present and not empty
     */
    public boolean hasExternalRiskFactors() {
        return externalRiskFactors != null && !externalRiskFactors.isEmpty();
    }

    /**
     * Gets the risk assessment scope from metadata.
     * 
     * @return Assessment scope or "individual" as default
     */
    public String getAssessmentScope() {
        if (metadata != null && metadata.containsKey("assessment_scope")) {
            return metadata.get("assessment_scope").toString();
        }
        return "individual";
    }

    /**
     * Gets the requested model version from metadata.
     * 
     * @return Model version or "latest" as default
     */
    public String getModelVersion() {
        if (metadata != null && metadata.containsKey("model_version")) {
            return metadata.get("model_version").toString();
        }
        return "latest";
    }

    /**
     * Determines if detailed explainability is required.
     * 
     * @return true if detailed explanations are requested
     */
    public boolean requiresDetailedExplanation() {
        if (explainabilityConfig != null && explainabilityConfig.containsKey("explanation_depth")) {
            String depth = explainabilityConfig.get("explanation_depth").toString();
            return "detailed".equalsIgnoreCase(depth) || "technical".equalsIgnoreCase(depth);
        }
        return true; // Default to detailed for regulatory compliance
    }

    /**
     * Checks if bias reporting is required in the assessment.
     * 
     * @return true if bias detection and reporting is requested
     */
    public boolean requiresBiasReporting() {
        if (explainabilityConfig != null && explainabilityConfig.containsKey("bias_reporting")) {
            return Boolean.parseBoolean(explainabilityConfig.get("bias_reporting").toString());
        }
        return true; // Default to true for regulatory compliance
    }
}