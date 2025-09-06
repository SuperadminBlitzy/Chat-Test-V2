package com.ufs.wellness.dto;

import jakarta.validation.constraints.NotNull; // jakarta.validation.constraints:3.0.2
import jakarta.validation.constraints.Size; // jakarta.validation.constraints:3.0.2
import jakarta.validation.constraints.Min; // jakarta.validation.constraints:3.0.2
import jakarta.validation.constraints.Max; // jakarta.validation.constraints:3.0.2
import java.math.BigDecimal; // java.math:1.8

/**
 * Data Transfer Object (DTO) for creating or updating a customer's financial wellness profile.
 * 
 * This class encapsulates the data sent from the client to the server for wellness profile operations,
 * supporting the Personalized Financial Wellness capability and F-007: Personalized Financial 
 * Recommendations feature. The data from this DTO serves as a key input for generating personalized 
 * financial recommendations and creating holistic financial profiles.
 * 
 * All financial amounts are represented using BigDecimal to ensure precision in financial calculations
 * and comply with financial industry standards for monetary data handling.
 * 
 * The class includes comprehensive validation to ensure data integrity and compliance with
 * financial regulatory requirements for data collection and processing.
 * 
 * @author UFS Financial Wellness Service
 * @version 1.0
 * @since 2025-01-01
 */
public class WellnessProfileRequest {

    /**
     * Customer's monthly income in the base currency.
     * 
     * This field represents the total monthly income across all sources and is critical
     * for financial wellness assessment and recommendation generation. The value must be
     * non-negative as negative income is not valid for financial wellness calculations.
     * 
     * Maximum allowed value is set to 10,000,000 to prevent unrealistic data entry
     * while accommodating high-net-worth individuals.
     */
    @NotNull(message = "Monthly income is required for financial wellness assessment")
    @Min(value = 0, message = "Monthly income cannot be negative")
    @Max(value = 10000000, message = "Monthly income cannot exceed 10,000,000")
    private BigDecimal monthlyIncome;

    /**
     * Customer's monthly expenses in the base currency.
     * 
     * This field captures the total monthly expenses and is essential for calculating
     * disposable income, savings rate, and financial health metrics. The value must be
     * non-negative as negative expenses are not valid for financial analysis.
     * 
     * Maximum allowed value is set to 10,000,000 to prevent unrealistic data entry
     * while accommodating high-spending scenarios.
     */
    @NotNull(message = "Monthly expenses are required for financial wellness assessment")
    @Min(value = 0, message = "Monthly expenses cannot be negative")
    @Max(value = 10000000, message = "Monthly expenses cannot exceed 10,000,000")
    private BigDecimal monthlyExpenses;

    /**
     * Customer's total assets value in the base currency.
     * 
     * This field represents the sum of all customer assets including liquid assets,
     * investments, real estate, and other valuable holdings. It's crucial for net worth
     * calculation and comprehensive financial wellness assessment.
     * 
     * The value must be non-negative as negative total assets are not valid.
     * Maximum value is set to accommodate ultra-high-net-worth individuals.
     */
    @NotNull(message = "Total assets value is required for financial wellness assessment")
    @Min(value = 0, message = "Total assets cannot be negative")
    @Max(value = 1000000000, message = "Total assets cannot exceed 1,000,000,000")
    private BigDecimal totalAssets;

    /**
     * Customer's total liabilities value in the base currency.
     * 
     * This field represents the sum of all customer liabilities including mortgages,
     * loans, credit card debt, and other financial obligations. It's essential for
     * net worth calculation and debt-to-income ratio analysis.
     * 
     * The value must be non-negative as negative total liabilities are not valid.
     * Maximum value is set to prevent unrealistic data entry.
     */
    @NotNull(message = "Total liabilities value is required for financial wellness assessment")
    @Min(value = 0, message = "Total liabilities cannot be negative")
    @Max(value = 1000000000, message = "Total liabilities cannot exceed 1,000,000,000")
    private BigDecimal totalLiabilities;

    /**
     * Customer's risk tolerance level for investment recommendations.
     * 
     * This field captures the customer's comfort level with investment risk and directly
     * influences the types of financial products and investment strategies recommended
     * by the AI-powered recommendation engine.
     * 
     * Expected values include but are not limited to:
     * - CONSERVATIVE: Low risk tolerance, preference for capital preservation
     * - MODERATE: Balanced approach to risk and return
     * - AGGRESSIVE: High risk tolerance, seeking maximum returns
     * - VERY_CONSERVATIVE: Extremely low risk tolerance
     * - VERY_AGGRESSIVE: Extremely high risk tolerance
     * 
     * The field is required and must be between 3 and 50 characters to accommodate
     * various risk tolerance categorizations while preventing malicious input.
     */
    @NotNull(message = "Risk tolerance is required for personalized recommendations")
    @Size(min = 3, max = 50, message = "Risk tolerance must be between 3 and 50 characters")
    private String riskTolerance;

    /**
     * Customer's investment goals and financial objectives.
     * 
     * This field captures the customer's specific financial goals and investment objectives,
     * which are crucial for generating personalized financial recommendations. The AI engine
     * uses this information to tailor investment strategies and financial products.
     * 
     * Examples of investment goals include:
     * - Retirement planning
     * - Wealth accumulation
     * - Education funding
     * - Home purchase
     * - Emergency fund building
     * - Tax optimization
     * - Estate planning
     * 
     * The field is required and must be between 5 and 200 characters to ensure
     * meaningful input while preventing abuse and maintaining data quality.
     */
    @NotNull(message = "Investment goals are required for personalized recommendations")
    @Size(min = 5, max = 200, message = "Investment goals must be between 5 and 200 characters")
    private String investmentGoals;

    /**
     * Default constructor for WellnessProfileRequest.
     * 
     * Creates a new instance with all fields initialized to null.
     * This constructor is required for JSON deserialization and Spring framework integration.
     */
    public WellnessProfileRequest() {
        // Default constructor for framework compatibility
    }

    /**
     * Full constructor for WellnessProfileRequest.
     * 
     * Creates a new instance with all fields initialized to the provided values.
     * This constructor facilitates easy object creation in tests and direct instantiation scenarios.
     * 
     * @param monthlyIncome The customer's monthly income
     * @param monthlyExpenses The customer's monthly expenses
     * @param totalAssets The customer's total assets value
     * @param totalLiabilities The customer's total liabilities value
     * @param riskTolerance The customer's risk tolerance level
     * @param investmentGoals The customer's investment goals and objectives
     */
    public WellnessProfileRequest(BigDecimal monthlyIncome, BigDecimal monthlyExpenses, 
                                 BigDecimal totalAssets, BigDecimal totalLiabilities,
                                 String riskTolerance, String investmentGoals) {
        this.monthlyIncome = monthlyIncome;
        this.monthlyExpenses = monthlyExpenses;
        this.totalAssets = totalAssets;
        this.totalLiabilities = totalLiabilities;
        this.riskTolerance = riskTolerance;
        this.investmentGoals = investmentGoals;
    }

    /**
     * Gets the customer's monthly income.
     * 
     * @return The monthly income as BigDecimal, or null if not set
     */
    public BigDecimal getMonthlyIncome() {
        return monthlyIncome;
    }

    /**
     * Sets the customer's monthly income.
     * 
     * @param monthlyIncome The monthly income to set
     */
    public void setMonthlyIncome(BigDecimal monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }

    /**
     * Gets the customer's monthly expenses.
     * 
     * @return The monthly expenses as BigDecimal, or null if not set
     */
    public BigDecimal getMonthlyExpenses() {
        return monthlyExpenses;
    }

    /**
     * Sets the customer's monthly expenses.
     * 
     * @param monthlyExpenses The monthly expenses to set
     */
    public void setMonthlyExpenses(BigDecimal monthlyExpenses) {
        this.monthlyExpenses = monthlyExpenses;
    }

    /**
     * Gets the customer's total assets value.
     * 
     * @return The total assets as BigDecimal, or null if not set
     */
    public BigDecimal getTotalAssets() {
        return totalAssets;
    }

    /**
     * Sets the customer's total assets value.
     * 
     * @param totalAssets The total assets to set
     */
    public void setTotalAssets(BigDecimal totalAssets) {
        this.totalAssets = totalAssets;
    }

    /**
     * Gets the customer's total liabilities value.
     * 
     * @return The total liabilities as BigDecimal, or null if not set
     */
    public BigDecimal getTotalLiabilities() {
        return totalLiabilities;
    }

    /**
     * Sets the customer's total liabilities value.
     * 
     * @param totalLiabilities The total liabilities to set
     */
    public void setTotalLiabilities(BigDecimal totalLiabilities) {
        this.totalLiabilities = totalLiabilities;
    }

    /**
     * Gets the customer's risk tolerance level.
     * 
     * @return The risk tolerance as String, or null if not set
     */
    public String getRiskTolerance() {
        return riskTolerance;
    }

    /**
     * Sets the customer's risk tolerance level.
     * 
     * @param riskTolerance The risk tolerance to set
     */
    public void setRiskTolerance(String riskTolerance) {
        this.riskTolerance = riskTolerance;
    }

    /**
     * Gets the customer's investment goals.
     * 
     * @return The investment goals as String, or null if not set
     */
    public String getInvestmentGoals() {
        return investmentGoals;
    }

    /**
     * Sets the customer's investment goals.
     * 
     * @param investmentGoals The investment goals to set
     */
    public void setInvestmentGoals(String investmentGoals) {
        this.investmentGoals = investmentGoals;
    }

    /**
     * Calculates the monthly disposable income.
     * 
     * This utility method calculates the difference between monthly income and expenses,
     * which is useful for financial wellness assessment and savings recommendations.
     * 
     * @return The monthly disposable income, or null if either income or expenses are null
     */
    public BigDecimal getMonthlyDisposableIncome() {
        if (monthlyIncome != null && monthlyExpenses != null) {
            return monthlyIncome.subtract(monthlyExpenses);
        }
        return null;
    }

    /**
     * Calculates the net worth.
     * 
     * This utility method calculates the difference between total assets and total liabilities,
     * providing a key financial wellness metric.
     * 
     * @return The net worth, or null if either assets or liabilities are null
     */
    public BigDecimal getNetWorth() {
        if (totalAssets != null && totalLiabilities != null) {
            return totalAssets.subtract(totalLiabilities);
        }
        return null;
    }

    /**
     * Calculates the savings rate as a percentage.
     * 
     * This utility method calculates the percentage of income that represents disposable income,
     * which is a key indicator of financial health and savings potential.
     * 
     * @return The savings rate as a percentage (0-100), or null if calculation is not possible
     */
    public BigDecimal getSavingsRate() {
        BigDecimal disposableIncome = getMonthlyDisposableIncome();
        if (disposableIncome != null && monthlyIncome != null && monthlyIncome.compareTo(BigDecimal.ZERO) > 0) {
            return disposableIncome.divide(monthlyIncome, 4, BigDecimal.ROUND_HALF_UP)
                                 .multiply(new BigDecimal("100"));
        }
        return null;
    }

    /**
     * Returns a string representation of the WellnessProfileRequest.
     * 
     * This method provides a comprehensive string representation of the object,
     * excluding sensitive financial details for security purposes in logging scenarios.
     * 
     * @return A string representation of the wellness profile request
     */
    @Override
    public String toString() {
        return "WellnessProfileRequest{" +
                "monthlyIncome=" + (monthlyIncome != null ? "[REDACTED]" : "null") +
                ", monthlyExpenses=" + (monthlyExpenses != null ? "[REDACTED]" : "null") +
                ", totalAssets=" + (totalAssets != null ? "[REDACTED]" : "null") +
                ", totalLiabilities=" + (totalLiabilities != null ? "[REDACTED]" : "null") +
                ", riskTolerance='" + riskTolerance + '\'' +
                ", investmentGoals='" + (investmentGoals != null ? investmentGoals.substring(0, Math.min(20, investmentGoals.length())) + "..." : "null") + '\'' +
                '}';
    }

    /**
     * Checks if this WellnessProfileRequest equals another object.
     * 
     * @param obj The object to compare with
     * @return true if the objects are equal, false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        WellnessProfileRequest that = (WellnessProfileRequest) obj;
        
        return java.util.Objects.equals(monthlyIncome, that.monthlyIncome) &&
               java.util.Objects.equals(monthlyExpenses, that.monthlyExpenses) &&
               java.util.Objects.equals(totalAssets, that.totalAssets) &&
               java.util.Objects.equals(totalLiabilities, that.totalLiabilities) &&
               java.util.Objects.equals(riskTolerance, that.riskTolerance) &&
               java.util.Objects.equals(investmentGoals, that.investmentGoals);
    }

    /**
     * Returns the hash code for this WellnessProfileRequest.
     * 
     * @return The hash code value for this object
     */
    @Override
    public int hashCode() {
        return java.util.Objects.hash(monthlyIncome, monthlyExpenses, totalAssets, 
                                    totalLiabilities, riskTolerance, investmentGoals);
    }
}