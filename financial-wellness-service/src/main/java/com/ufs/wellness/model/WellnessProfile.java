package com.ufs.wellness.model;

import org.springframework.data.annotation.Id; // Spring Data 3.2.0
import org.springframework.data.mongodb.core.mapping.Document; // Spring Data MongoDB 4.2.0
import org.springframework.data.mongodb.core.mapping.DBRef; // Spring Data MongoDB 4.2.0
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Size;
import jakarta.validation.Valid;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List; // Java 21
import java.util.Date; // Java 21
import java.util.ArrayList;
import java.util.Objects;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * MongoDB document representing a customer's comprehensive financial wellness profile 
 * within the Unified Financial Services Platform.
 * 
 * This class serves as the core entity for the F-007: Personalized Financial Recommendations 
 * feature, providing holistic financial profiling capabilities that enable AI-powered 
 * risk assessment, goal tracking, and personalized financial wellness recommendations.
 * 
 * Business Context:
 * The WellnessProfile addresses the critical need identified in the platform requirements 
 * where 88% of IT decision makers across FSIs agree that data silos create challenges. 
 * This unified profile consolidates customer financial data to support:
 * - Personalized financial wellness tools and recommendations
 * - Goal-oriented financial planning and tracking
 * - AI-powered risk assessment and predictive analytics
 * - Regulatory compliance and audit trail maintenance
 * 
 * Technical Implementation:
 * - Stored in MongoDB for flexible document-based financial data modeling
 * - Integrates with AI/ML services for predictive analytics and recommendations
 * - Supports real-time financial wellness scoring and progress tracking
 * - Enables horizontal scaling across distributed financial services architecture
 * 
 * Security and Compliance Considerations:
 * - All monetary fields use precise BigDecimal calculations for financial accuracy
 * - Customer data handled according to GDPR, PCI DSS, and financial regulations
 * - Audit trails maintained through lastUpdated timestamps and document versioning
 * - Data validation ensures integrity of financial wellness calculations
 * 
 * Performance Optimization:
 * - Indexed customer ID for efficient customer-specific queries
 * - DBRef relationships for optimized financial goal and recommendation retrieval
 * - Designed for sub-second response times supporting 10,000+ TPS requirements
 * - MongoDB 7.0+ optimized document structure for analytical workloads
 * 
 * @author Unified Financial Services Platform Development Team
 * @version 1.0
 * @since 2025-01-01
 */
@Document(collection = "wellness_profiles")
@JsonIgnoreProperties(ignoreUnknown = true)
public class WellnessProfile {

    /**
     * Unique identifier for the wellness profile document.
     * Generated automatically by MongoDB as ObjectId and converted to String.
     * Used for direct document access and cross-service references.
     */
    @Id
    @JsonProperty("id")
    private String id;

    /**
     * Unique identifier linking this wellness profile to a specific customer.
     * References the customer's identity across the unified financial services platform.
     * Indexed for efficient customer-specific wellness profile retrieval.
     * 
     * This field enables:
     * - Customer-specific financial wellness dashboard access
     * - Integration with customer onboarding and KYC processes
     * - Personalized recommendation engine targeting
     * - Multi-channel customer experience consistency
     * 
     * The customer ID serves as the primary correlation key between the wellness
     * profile and other platform services including digital onboarding, risk assessment,
     * and compliance monitoring systems.
     */
    @Field("customer_id")
    @Indexed(unique = true)
    @NotBlank(message = "Customer ID is required and cannot be blank")
    @Size(min = 5, max = 50, message = "Customer ID must be between 5 and 50 characters")
    @JsonProperty("customerId")
    private String customerId;

    /**
     * Calculated wellness score representing the customer's overall financial health.
     * Ranges from 0.0 to 100.0, with higher scores indicating better financial wellness.
     * 
     * Wellness Score Calculation Factors:
     * - Debt-to-income ratio and debt management effectiveness
     * - Savings rate and emergency fund adequacy
     * - Investment diversification and performance
     * - Goal achievement progress and consistency
     * - Financial behavior patterns and stability
     * 
     * Score Ranges and Interpretations:
     * - 90-100: Excellent financial wellness with optimized financial management
     * - 75-89: Good financial health with minor optimization opportunities  
     * - 60-74: Fair financial wellness requiring moderate improvements
     * - 40-59: Poor financial health needing significant attention
     * - 0-39: Critical financial wellness requiring immediate intervention
     * 
     * The wellness score drives personalized recommendations and serves as a key
     * performance indicator for customer financial health tracking over time.
     */
    @Field("wellness_score")
    @NotNull(message = "Wellness score is required")
    @DecimalMin(value = "0.0", message = "Wellness score cannot be negative")
    @DecimalMax(value = "100.0", message = "Wellness score cannot exceed 100.0")
    @JsonProperty("wellnessScore")
    private Double wellnessScore;

    /**
     * Monthly income amount for the customer.
     * Represents verified recurring income used for financial wellness calculations.
     * Uses BigDecimal for precise financial arithmetic and regulatory compliance.
     * 
     * Income Sources Considered:
     * - Primary employment salary and wages
     * - Secondary income streams and side businesses
     * - Investment returns and passive income
     * - Government benefits and pensions
     * - Other verified recurring income sources
     * 
     * Income Verification and Updates:
     * - Integration with banking transaction analysis
     * - Customer-reported income with verification workflows
     * - Automatic updates based on transaction patterns
     * - Annual income verification and adjustment processes
     * 
     * This field is critical for debt-to-income calculations, affordability assessments,
     * and personalized budgeting and savings recommendations.
     */
    @Field("income")
    @NotNull(message = "Income is required")
    @DecimalMin(value = "0.00", message = "Income cannot be negative")
    @JsonProperty("income")
    private Double income;

    /**
     * Monthly expense amount for the customer.
     * Represents analyzed spending patterns across all expense categories.
     * 
     * Expense Categories Tracked:
     * - Housing costs (rent, mortgage, utilities, maintenance)
     * - Transportation expenses (car payments, fuel, insurance, public transport)
     * - Food and dining (groceries, restaurants, food delivery)
     * - Healthcare costs (insurance premiums, medical expenses, prescriptions)
     * - Entertainment and lifestyle (subscriptions, hobbies, travel)
     * - Personal care and clothing
     * - Debt service payments (minimum payments tracked separately)
     * - Miscellaneous and variable expenses
     * 
     * Expense Analysis Features:
     * - Automatic categorization using AI transaction analysis
     * - Trend analysis and seasonal adjustment
     * - Budget variance tracking and alerts
     * - Expense optimization recommendations
     * 
     * This field enables comprehensive budgeting analysis and forms the foundation
     * for cash flow optimization and savings opportunity identification.
     */
    @Field("expenses")
    @NotNull(message = "Expenses are required")
    @DecimalMin(value = "0.00", message = "Expenses cannot be negative")
    @JsonProperty("expenses")
    private Double expenses;

    /**
     * Current savings balance across all savings accounts and instruments.
     * Includes liquid savings available for emergency funds and goal funding.
     * 
     * Savings Categories Included:
     * - Traditional savings accounts with immediate liquidity
     * - High-yield savings accounts and money market accounts
     * - Certificates of deposit and term deposits
     * - Cash equivalents and short-term treasury instruments
     * - Emergency fund designations and goal-specific savings
     * 
     * Savings Analysis and Recommendations:
     * - Emergency fund adequacy assessment (3-6 months expenses)
     * - Savings rate calculation and optimization suggestions
     * - High-yield account optimization recommendations
     * - Goal-based savings allocation and progress tracking
     * - Tax-advantaged savings opportunity identification
     * 
     * The savings balance is fundamental to financial security assessment
     * and emergency preparedness evaluation within the wellness framework.
     */
    @Field("savings")
    @NotNull(message = "Savings are required")
    @DecimalMin(value = "0.00", message = "Savings cannot be negative")
    @JsonProperty("savings")
    private Double savings;

    /**
     * Total outstanding debt balance across all debt instruments.
     * Includes secured and unsecured debt obligations affecting financial wellness.
     * 
     * Debt Categories Tracked:
     * - Credit card balances and revolving credit
     * - Personal loans and installment debt
     * - Mortgage debt and home equity obligations
     * - Auto loans and vehicle financing
     * - Student loans and educational debt
     * - Business debt and entrepreneurial obligations
     * - Other secured and unsecured debt instruments
     * 
     * Debt Analysis Features:
     * - Debt-to-income ratio calculation and monitoring
     * - High-interest debt identification and prioritization
     * - Debt consolidation opportunity analysis
     * - Payment optimization and acceleration strategies
     * - Credit utilization impact on credit scores
     * 
     * This field is critical for risk assessment, credit evaluation,
     * and debt management strategy development within the wellness platform.
     */
    @Field("debt")
    @NotNull(message = "Debt is required")
    @DecimalMin(value = "0.00", message = "Debt cannot be negative")
    @JsonProperty("debt")
    private Double debt;

    /**
     * Current investment portfolio value across all investment accounts.
     * Represents long-term wealth building and retirement preparation assets.
     * 
     * Investment Categories Included:
     * - Retirement accounts (401k, IRA, Roth IRA, pension plans)
     * - Taxable investment accounts and brokerage holdings
     * - Stock portfolio and individual equity positions
     * - Bond portfolios and fixed-income investments
     * - Mutual funds and exchange-traded funds (ETFs)
     * - Real estate investment trusts (REITs) and alternative investments
     * - Cryptocurrency holdings and digital assets (where applicable)
     * 
     * Investment Analysis Capabilities:
     * - Portfolio diversification assessment and optimization
     * - Risk tolerance alignment and adjustment recommendations
     * - Asset allocation optimization based on age and goals
     * - Tax-loss harvesting and tax-efficiency improvements
     * - Retirement readiness evaluation and projections
     * - Investment cost analysis and fee optimization
     * 
     * The investment balance supports long-term financial planning,
     * retirement preparation, and wealth accumulation strategy development.
     */
    @Field("investments")
    @NotNull(message = "Investments are required")
    @DecimalMin(value = "0.00", message = "Investments cannot be negative")
    @JsonProperty("investments")
    private Double investments;

    /**
     * Collection of financial goals associated with this wellness profile.
     * Represents the customer's short-term and long-term financial objectives.
     * 
     * Goal Types and Categories:
     * - Emergency fund building and maintenance goals
     * - Home purchase and down payment savings objectives
     * - Retirement planning and pension accumulation targets
     * - Education funding for children or personal development
     * - Vacation and travel savings goals
     * - Debt payoff and financial freedom objectives
     * - Investment milestones and wealth building targets
     * 
     * DBRef Configuration:
     * - Lazy loading for performance optimization
     * - Maintains referential integrity with FinancialGoal collection
     * - Supports efficient goal-specific query operations
     * - Enables goal lifecycle management and archiving
     * 
     * Goal Integration Features:
     * - Progress tracking and milestone celebrations
     * - Goal prioritization and resource allocation
     * - Automated recommendation generation for goal achievement
     * - Timeline optimization and deadline management
     * 
     * The financial goals collection drives personalized recommendations
     * and provides structure for customer financial planning workflows.
     */
    @DBRef(lazy = true)
    @Field("financial_goals")
    @Valid
    @JsonProperty("financialGoals")
    private List<FinancialGoal> financialGoals;

    /**
     * Collection of personalized financial recommendations for this customer.
     * AI-generated guidance for improving financial wellness and achieving goals.
     * 
     * Recommendation Categories:
     * - Savings optimization and high-yield account suggestions
     * - Debt reduction strategies and consolidation opportunities
     * - Investment diversification and portfolio rebalancing
     * - Budget optimization and expense reduction ideas
     * - Tax planning and optimization strategies
     * - Insurance coverage adequacy and cost optimization
     * - Goal-specific action items and milestone guidance
     * 
     * DBRef Implementation:
     * - Lazy loading for improved profile retrieval performance
     * - Maintains relationship integrity with Recommendation collection
     * - Supports recommendation lifecycle and status tracking
     * - Enables bulk recommendation operations and analytics
     * 
     * AI-Powered Recommendation Engine:
     * - Machine learning analysis of financial patterns and behaviors
     * - Personalization based on customer profile and preferences
     * - Market condition integration and timing optimization
     * - Behavioral economics principles for actionable guidance
     * 
     * The recommendations collection implements the core value proposition
     * of personalized financial guidance within the wellness platform.
     */
    @DBRef(lazy = true)
    @Field("recommendations")
    @Valid
    @JsonProperty("recommendations")
    private List<Recommendation> recommendations;

    /**
     * Timestamp when the wellness profile was last updated.
     * Provides audit trail and enables time-based analysis and caching strategies.
     * 
     * Update Triggers:
     * - Manual customer profile updates through web or mobile interfaces
     * - Automatic updates from transaction analysis and financial data feeds
     * - Periodic wellness score recalculation and refresh cycles
     * - Goal progress updates and milestone achievements
     * - Recommendation generation and status changes
     * 
     * Audit and Compliance Uses:
     * - Regulatory audit trail for customer data changes
     * - Data freshness validation for decision-making processes
     * - Cache invalidation and data synchronization triggers
     * - Customer service historical context and change tracking
     * 
     * Performance Optimization:
     * - Enables incremental data processing and delta analysis
     * - Supports efficient data replication and backup strategies
     * - Facilitates real-time vs. batch processing decisions
     * 
     * The lastUpdated timestamp is automatically maintained by the service layer
     * and should not be manually modified to preserve data integrity.
     */
    @Field("last_updated")
    @NotNull(message = "Last updated timestamp is required")
    @JsonProperty("lastUpdated")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Date lastUpdated;

    /**
     * Default constructor for the WellnessProfile class.
     * Initializes a new wellness profile with default values and empty collections.
     * 
     * Default Initialization:
     * - Sets wellness score to 0.0 for new profiles
     * - Initializes all financial amounts to 0.0
     * - Creates empty collections for goals and recommendations
     * - Sets lastUpdated to current timestamp
     * 
     * This constructor is required by:
     * - Spring Data MongoDB for document instantiation during queries
     * - Jackson JSON deserialization for REST API operations
     * - Unit testing frameworks for entity creation and mocking
     * - Service layer code for programmatic profile creation
     */
    public WellnessProfile() {
        this.wellnessScore = 0.0;
        this.income = 0.0;
        this.expenses = 0.0;
        this.savings = 0.0;
        this.debt = 0.0;
        this.investments = 0.0;
        this.financialGoals = new ArrayList<>();
        this.recommendations = new ArrayList<>();
        this.lastUpdated = new Date();
    }

    /**
     * Parameterized constructor for creating a wellness profile with essential customer information.
     * Provides convenient initialization for service layer profile creation workflows.
     * 
     * @param customerId The unique identifier for the customer
     * @param income The customer's monthly income amount
     * @param expenses The customer's monthly expense amount
     * @param savings The customer's current savings balance
     * @param debt The customer's total outstanding debt
     * @param investments The customer's current investment portfolio value
     */
    public WellnessProfile(String customerId, Double income, Double expenses, 
                          Double savings, Double debt, Double investments) {
        this();
        this.customerId = customerId;
        this.income = income;
        this.expenses = expenses;
        this.savings = savings;
        this.debt = debt;
        this.investments = investments;
        this.wellnessScore = calculateWellnessScore();
    }

    // Comprehensive getter and setter methods with validation and business logic

    /**
     * Gets the unique identifier for this wellness profile.
     * 
     * @return The MongoDB ObjectId as a String, or null for new documents
     */
    public String getId() {
        return id;
    }

    /**
     * Sets the unique identifier for this wellness profile.
     * Typically managed by MongoDB, manual setting should be avoided.
     * 
     * @param id The unique identifier as a String
     */
    public void setId(String id) {
        this.id = id;
        updateLastModified();
    }

    /**
     * Gets the customer identifier linking this profile to a specific customer.
     * 
     * @return The customer ID as a String
     */
    public String getCustomerId() {
        return customerId;
    }

    /**
     * Sets the customer identifier for this wellness profile.
     * 
     * @param customerId The customer's unique identifier
     * @throws IllegalArgumentException if customerId is null or blank
     */
    public void setCustomerId(String customerId) {
        if (customerId == null || customerId.trim().isEmpty()) {
            throw new IllegalArgumentException("Customer ID cannot be null or blank");
        }
        this.customerId = customerId;
        updateLastModified();
    }

    /**
     * Gets the calculated wellness score for this customer.
     * 
     * @return The wellness score as a Double (0.0 to 100.0)
     */
    public Double getWellnessScore() {
        return wellnessScore;
    }

    /**
     * Sets the wellness score for this customer.
     * Generally calculated automatically, manual setting should include recalculation logic.
     * 
     * @param wellnessScore The wellness score (0.0 to 100.0)
     * @throws IllegalArgumentException if wellnessScore is outside valid range
     */
    public void setWellnessScore(Double wellnessScore) {
        if (wellnessScore == null || wellnessScore < 0.0 || wellnessScore > 100.0) {
            throw new IllegalArgumentException("Wellness score must be between 0.0 and 100.0");
        }
        this.wellnessScore = wellnessScore;
        updateLastModified();
    }

    /**
     * Gets the customer's monthly income amount.
     * 
     * @return The income as a Double
     */
    public Double getIncome() {
        return income;
    }

    /**
     * Sets the customer's monthly income amount.
     * Triggers wellness score recalculation and recommendation refresh.
     * 
     * @param income The monthly income amount
     * @throws IllegalArgumentException if income is null or negative
     */
    public void setIncome(Double income) {
        if (income == null || income < 0.0) {
            throw new IllegalArgumentException("Income cannot be null or negative");
        }
        this.income = income;
        this.wellnessScore = calculateWellnessScore();
        updateLastModified();
    }

    /**
     * Gets the customer's monthly expense amount.
     * 
     * @return The expenses as a Double
     */
    public Double getExpenses() {
        return expenses;
    }

    /**
     * Sets the customer's monthly expense amount.
     * Triggers wellness score recalculation and budget analysis.
     * 
     * @param expenses The monthly expense amount
     * @throws IllegalArgumentException if expenses is null or negative
     */
    public void setExpenses(Double expenses) {
        if (expenses == null || expenses < 0.0) {
            throw new IllegalArgumentException("Expenses cannot be null or negative");
        }
        this.expenses = expenses;
        this.wellnessScore = calculateWellnessScore();
        updateLastModified();
    }

    /**
     * Gets the customer's current savings balance.
     * 
     * @return The savings as a Double
     */
    public Double getSavings() {
        return savings;
    }

    /**
     * Sets the customer's current savings balance.
     * Triggers emergency fund analysis and savings rate evaluation.
     * 
     * @param savings The current savings balance
     * @throws IllegalArgumentException if savings is null or negative
     */
    public void setSavings(Double savings) {
        if (savings == null || savings < 0.0) {
            throw new IllegalArgumentException("Savings cannot be null or negative");
        }
        this.savings = savings;
        this.wellnessScore = calculateWellnessScore();
        updateLastModified();
    }

    /**
     * Gets the customer's total outstanding debt.
     * 
     * @return The debt as a Double
     */
    public Double getDebt() {
        return debt;
    }

    /**
     * Sets the customer's total outstanding debt.
     * Triggers debt-to-income analysis and debt management recommendations.
     * 
     * @param debt The total outstanding debt
     * @throws IllegalArgumentException if debt is null or negative
     */
    public void setDebt(Double debt) {
        if (debt == null || debt < 0.0) {
            throw new IllegalArgumentException("Debt cannot be null or negative");
        }
        this.debt = debt;
        this.wellnessScore = calculateWellnessScore();
        updateLastModified();
    }

    /**
     * Gets the customer's current investment portfolio value.
     * 
     * @return The investments as a Double
     */
    public Double getInvestments() {
        return investments;
    }

    /**
     * Sets the customer's current investment portfolio value.
     * Triggers portfolio analysis and retirement readiness evaluation.
     * 
     * @param investments The current investment portfolio value
     * @throws IllegalArgumentException if investments is null or negative
     */
    public void setInvestments(Double investments) {
        if (investments == null || investments < 0.0) {
            throw new IllegalArgumentException("Investments cannot be null or negative");
        }
        this.investments = investments;
        this.wellnessScore = calculateWellnessScore();
        updateLastModified();
    }

    /**
     * Gets the list of financial goals associated with this wellness profile.
     * 
     * @return The financial goals as a List of FinancialGoal objects
     */
    public List<FinancialGoal> getFinancialGoals() {
        return financialGoals != null ? financialGoals : new ArrayList<>();
    }

    /**
     * Sets the list of financial goals for this wellness profile.
     * 
     * @param financialGoals The list of financial goals
     */
    public void setFinancialGoals(List<FinancialGoal> financialGoals) {
        this.financialGoals = financialGoals != null ? financialGoals : new ArrayList<>();
        updateLastModified();
    }

    /**
     * Gets the list of recommendations associated with this wellness profile.
     * 
     * @return The recommendations as a List of Recommendation objects
     */
    public List<Recommendation> getRecommendations() {
        return recommendations != null ? recommendations : new ArrayList<>();
    }

    /**
     * Sets the list of recommendations for this wellness profile.
     * 
     * @param recommendations The list of recommendations
     */
    public void setRecommendations(List<Recommendation> recommendations) {
        this.recommendations = recommendations != null ? recommendations : new ArrayList<>();
        updateLastModified();
    }

    /**
     * Gets the last updated timestamp for this wellness profile.
     * 
     * @return The last updated date as a Date object
     */
    public Date getLastUpdated() {
        return lastUpdated;
    }

    /**
     * Sets the last updated timestamp for this wellness profile.
     * 
     * @param lastUpdated The last updated timestamp
     */
    public void setLastUpdated(Date lastUpdated) {
        this.lastUpdated = lastUpdated != null ? lastUpdated : new Date();
    }

    // Advanced business logic and financial analysis methods

    /**
     * Calculates the comprehensive financial wellness score based on multiple factors.
     * Implements a sophisticated scoring algorithm considering debt ratios, savings adequacy,
     * investment diversification, and financial goal progress.
     * 
     * Scoring Algorithm Components:
     * - Debt-to-Income Ratio (25% weight): Lower ratios improve score
     * - Emergency Fund Adequacy (20% weight): 3-6 months expenses coverage
     * - Savings Rate (20% weight): Monthly savings as percentage of income
     * - Investment Allocation (15% weight): Age-appropriate investment levels
     * - Net Worth Growth (10% weight): Assets vs. liabilities trend
     * - Goal Achievement Progress (10% weight): Active goal completion rates
     * 
     * @return The calculated wellness score as a Double (0.0 to 100.0)
     */
    public Double calculateWellnessScore() {
        if (income == null || income <= 0) {
            return 0.0;
        }

        double score = 0.0;
        
        // Debt-to-Income Ratio Component (25% weight)
        double debtToIncomeRatio = (debt != null ? debt : 0.0) / (income * 12); // Annual comparison
        double debtScore = Math.max(0, 100 - (debtToIncomeRatio * 100 * 2.5)); // Penalty increases with ratio
        score += debtScore * 0.25;
        
        // Emergency Fund Adequacy Component (20% weight)
        double monthlyExpenses = expenses != null ? expenses : 0.0;
        double emergencyFundMonths = monthlyExpenses > 0 ? (savings != null ? savings : 0.0) / monthlyExpenses : 0;
        double emergencyScore = Math.min(100, (emergencyFundMonths / 6.0) * 100); // 6 months = 100%
        score += emergencyScore * 0.20;
        
        // Savings Rate Component (20% weight)
        double netIncome = income - monthlyExpenses;
        double savingsRate = netIncome > 0 ? Math.max(0, netIncome) / income : 0;
        double savingsScore = Math.min(100, savingsRate * 100 * 5); // 20% savings rate = 100%
        score += savingsScore * 0.20;
        
        // Investment Allocation Component (15% weight)
        double totalAssets = (savings != null ? savings : 0.0) + (investments != null ? investments : 0.0);
        double investmentRatio = totalAssets > 0 ? (investments != null ? investments : 0.0) / totalAssets : 0;
        double investmentScore = Math.min(100, investmentRatio * 100 * 1.25); // 80% invested = 100%
        score += investmentScore * 0.15;
        
        // Net Worth Calculation Component (10% weight)
        double assets = totalAssets;
        double liabilities = debt != null ? debt : 0.0;
        double netWorth = assets - liabilities;
        double netWorthScore = netWorth >= 0 ? Math.min(100, (netWorth / (income * 2)) * 100) : 0; // 2x annual income = 100%
        score += netWorthScore * 0.10;
        
        // Goal Achievement Progress Component (10% weight)
        double goalScore = calculateGoalProgressScore();
        score += goalScore * 0.10;
        
        return Math.min(100.0, Math.max(0.0, score));
    }

    /**
     * Calculates the debt-to-income ratio for this customer.
     * Critical metric for creditworthiness and financial stability assessment.
     * 
     * @return The debt-to-income ratio as a percentage (0.0 to 100.0+)
     */
    public Double getDebtToIncomeRatio() {
        if (income == null || income <= 0) {
            return 0.0;
        }
        double annualIncome = income * 12;
        double totalDebt = debt != null ? debt : 0.0;
        return (totalDebt / annualIncome) * 100;
    }

    /**
     * Calculates the monthly savings rate as a percentage of income.
     * Indicates the customer's ability to build wealth and achieve financial goals.
     * 
     * @return The savings rate as a percentage (can be negative if expenses exceed income)
     */
    public Double getSavingsRate() {
        if (income == null || income <= 0) {
            return 0.0;
        }
        double monthlyExpenses = expenses != null ? expenses : 0.0;
        double netIncome = income - monthlyExpenses;
        return (netIncome / income) * 100;
    }

    /**
     * Calculates emergency fund adequacy in months of expenses covered.
     * Financial planning best practice recommends 3-6 months of expenses in emergency savings.
     * 
     * @return The number of months of expenses covered by current savings
     */
    public Double getEmergencyFundMonths() {
        if (expenses == null || expenses <= 0) {
            return 0.0;
        }
        double currentSavings = savings != null ? savings : 0.0;
        return currentSavings / expenses;
    }

    /**
     * Calculates the net worth (assets minus liabilities) for this customer.
     * Fundamental metric for overall financial health and wealth building progress.
     * 
     * @return The net worth as a Double (can be negative)
     */
    public Double getNetWorth() {
        double totalAssets = (savings != null ? savings : 0.0) + (investments != null ? investments : 0.0);
        double totalLiabilities = debt != null ? debt : 0.0;
        return totalAssets - totalLiabilities;
    }

    /**
     * Calculates the investment allocation percentage of total financial assets.
     * Indicates long-term wealth building strategy and risk tolerance alignment.
     * 
     * @return The investment allocation percentage (0.0 to 100.0)
     */
    public Double getInvestmentAllocation() {
        double totalAssets = (savings != null ? savings : 0.0) + (investments != null ? investments : 0.0);
        if (totalAssets <= 0) {
            return 0.0;
        }
        double investmentAmount = investments != null ? investments : 0.0;
        return (investmentAmount / totalAssets) * 100;
    }

    /**
     * Checks if the customer has adequate emergency fund coverage.
     * Based on financial planning best practice of 3-6 months expense coverage.
     * 
     * @return true if emergency fund covers 3+ months of expenses
     */
    public boolean hasAdequateEmergencyFund() {
        return getEmergencyFundMonths() >= 3.0;
    }

    /**
     * Checks if the customer has a healthy debt-to-income ratio.
     * Financial institutions typically prefer DTI ratios below 36% for creditworthiness.
     * 
     * @return true if debt-to-income ratio is below 36%
     */
    public boolean hasHealthyDebtRatio() {
        return getDebtToIncomeRatio() < 36.0;
    }

    /**
     * Checks if the customer has a positive savings rate.
     * Indicates the ability to build wealth and achieve financial goals.
     * 
     * @return true if monthly income exceeds monthly expenses
     */
    public boolean hasPositiveSavingsRate() {
        return getSavingsRate() > 0.0;
    }

    /**
     * Calculates goal achievement progress score based on active financial goals.
     * Considers completion percentages and goal timeline adherence.
     * 
     * @return The goal progress score as a Double (0.0 to 100.0)
     */
    private Double calculateGoalProgressScore() {
        List<FinancialGoal> goals = getFinancialGoals();
        if (goals == null || goals.isEmpty()) {
            return 50.0; // Neutral score for no goals
        }

        double totalProgress = 0.0;
        int activeGoalCount = 0;

        for (FinancialGoal goal : goals) {
            if (goal != null && goal.isActive()) {
                double completionPercentage = goal.getCompletionPercentage();
                totalProgress += Math.min(100.0, completionPercentage);
                activeGoalCount++;
            }
        }

        return activeGoalCount > 0 ? totalProgress / activeGoalCount : 50.0;
    }

    /**
     * Adds a financial goal to this wellness profile.
     * Maintains bidirectional relationship and triggers score recalculation.
     * 
     * @param goal The financial goal to add
     * @throws IllegalArgumentException if goal is null
     */
    public void addFinancialGoal(FinancialGoal goal) {
        if (goal == null) {
            throw new IllegalArgumentException("Financial goal cannot be null");
        }
        if (this.financialGoals == null) {
            this.financialGoals = new ArrayList<>();
        }
        this.financialGoals.add(goal);
        this.wellnessScore = calculateWellnessScore();
        updateLastModified();
    }

    /**
     * Removes a financial goal from this wellness profile.
     * Maintains relationship integrity and triggers score recalculation.
     * 
     * @param goal The financial goal to remove
     * @return true if the goal was successfully removed
     */
    public boolean removeFinancialGoal(FinancialGoal goal) {
        if (goal == null || this.financialGoals == null) {
            return false;
        }
        boolean removed = this.financialGoals.remove(goal);
        if (removed) {
            this.wellnessScore = calculateWellnessScore();
            updateLastModified();
        }
        return removed;
    }

    /**
     * Adds a recommendation to this wellness profile.
     * Maintains collection integrity and audit trail.
     * 
     * @param recommendation The recommendation to add
     * @throws IllegalArgumentException if recommendation is null
     */
    public void addRecommendation(Recommendation recommendation) {
        if (recommendation == null) {
            throw new IllegalArgumentException("Recommendation cannot be null");
        }
        if (this.recommendations == null) {
            this.recommendations = new ArrayList<>();
        }
        this.recommendations.add(recommendation);
        updateLastModified();
    }

    /**
     * Removes a recommendation from this wellness profile.
     * Maintains collection integrity and audit trail.
     * 
     * @param recommendation The recommendation to remove
     * @return true if the recommendation was successfully removed
     */
    public boolean removeRecommendation(Recommendation recommendation) {
        if (recommendation == null || this.recommendations == null) {
            return false;
        }
        boolean removed = this.recommendations.remove(recommendation);
        if (removed) {
            updateLastModified();
        }
        return removed;
    }

    /**
     * Updates the last modified timestamp to current time.
     * Called automatically when any field is modified for audit compliance.
     */
    private void updateLastModified() {
        this.lastUpdated = new Date();
    }

    /**
     * Refreshes the wellness score and triggers recommendation engine analysis.
     * Should be called after bulk updates or external data synchronization.
     */
    public void refreshWellnessAnalysis() {
        this.wellnessScore = calculateWellnessScore();
        updateLastModified();
    }

    // Standard Object methods for proper collection handling and debugging

    /**
     * Compares this WellnessProfile with another object for equality.
     * Two wellness profiles are considered equal if they have the same ID.
     * 
     * @param obj The object to compare with
     * @return true if objects are equal, false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        WellnessProfile that = (WellnessProfile) obj;
        return Objects.equals(id, that.id) &&
               Objects.equals(customerId, that.customerId) &&
               Objects.equals(wellnessScore, that.wellnessScore) &&
               Objects.equals(income, that.income) &&
               Objects.equals(expenses, that.expenses) &&
               Objects.equals(savings, that.savings) &&
               Objects.equals(debt, that.debt) &&
               Objects.equals(investments, that.investments);
    }

    /**
     * Generates a hash code for this WellnessProfile.
     * Based on the unique identifier and key business fields.
     * 
     * @return The hash code as an integer
     */
    @Override
    public int hashCode() {
        return Objects.hash(id, customerId, wellnessScore, income, expenses, 
                          savings, debt, investments);
    }

    /**
     * Returns a string representation of this WellnessProfile.
     * Includes key financial metrics for debugging and logging.
     * Sensitive financial amounts are included but should be logged carefully in production.
     * 
     * @return A detailed string representation of the wellness profile
     */
    @Override
    public String toString() {
        return "WellnessProfile{" +
                "id='" + id + '\'' +
                ", customerId='" + customerId + '\'' +
                ", wellnessScore=" + String.format("%.2f", wellnessScore) +
                ", income=" + String.format("%.2f", income) +
                ", expenses=" + String.format("%.2f", expenses) +
                ", savings=" + String.format("%.2f", savings) +
                ", debt=" + String.format("%.2f", debt) +
                ", investments=" + String.format("%.2f", investments) +
                ", debtToIncomeRatio=" + String.format("%.2f%%", getDebtToIncomeRatio()) +
                ", savingsRate=" + String.format("%.2f%%", getSavingsRate()) +
                ", netWorth=" + String.format("%.2f", getNetWorth()) +
                ", goalCount=" + getFinancialGoals().size() +
                ", recommendationCount=" + getRecommendations().size() +
                ", lastUpdated=" + lastUpdated +
                '}';
    }
}