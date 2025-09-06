"""
AI Service API Models

This module defines the Pydantic models for the AI service API, including request and response
validation, and serialization/deserialization of data for AI/ML endpoints covering:
- Risk assessment with real-time scoring and predictive modeling
- Fraud detection with transaction analysis and risk scoring
- Personalized financial recommendations with customer-specific insights

Models are designed for enterprise-grade production use with comprehensive validation,
documentation, and compliance with financial services standards.
"""

from typing import List, Optional  # Python 3.10
from pydantic import BaseModel, Field  # pydantic 2.5.2


class RiskAssessmentRequest(BaseModel):
    """
    Data model for requesting a risk assessment.
    
    This model captures all necessary information for AI-powered risk assessment,
    supporting real-time risk scoring and predictive risk modeling as per F-002
    requirements. The model ensures comprehensive data collection for accurate
    risk evaluation with <500ms response time capability.
    """
    
    customer_id: str = Field(
        ...,
        description="Unique identifier for the customer requesting risk assessment",
        min_length=1,
        max_length=50,
        example="CUST_12345"
    )
    
    financial_data: dict = Field(
        ...,
        description="Customer's financial information including income, assets, liabilities, credit history, and account balances",
        example={
            "annual_income": 75000.00,
            "total_assets": 250000.00,
            "total_liabilities": 150000.00,
            "credit_score": 750,
            "debt_to_income_ratio": 0.35,
            "account_balance": 15000.00,
            "credit_utilization": 0.25
        }
    )
    
    transaction_patterns: List[dict] = Field(
        ...,
        description="Historical transaction patterns for spending habits and investment behavior analysis",
        min_items=1,
        example=[
            {
                "category": "retail",
                "average_monthly_amount": 1200.00,
                "frequency": 25,
                "volatility": 0.15,
                "trend": "stable"
            },
            {
                "category": "investment",
                "average_monthly_amount": 2000.00,
                "frequency": 2,
                "volatility": 0.30,
                "trend": "increasing"
            }
        ]
    )
    
    market_conditions: Optional[dict] = Field(
        None,
        description="Current market conditions and external risk factors affecting assessment",
        example={
            "market_volatility": 0.22,
            "interest_rate_environment": "rising",
            "economic_indicators": {
                "gdp_growth": 0.025,
                "inflation_rate": 0.032,
                "unemployment_rate": 0.045
            },
            "sector_risks": ["technology", "real_estate"]
        }
    )

    class Config:
        """Pydantic model configuration for enhanced validation and documentation."""
        json_schema_extra = {
            "example": {
                "customer_id": "CUST_12345",
                "financial_data": {
                    "annual_income": 75000.00,
                    "total_assets": 250000.00,
                    "total_liabilities": 150000.00,
                    "credit_score": 750,
                    "debt_to_income_ratio": 0.35
                },
                "transaction_patterns": [
                    {
                        "category": "retail",
                        "average_monthly_amount": 1200.00,
                        "frequency": 25,
                        "volatility": 0.15
                    }
                ],
                "market_conditions": {
                    "market_volatility": 0.22,
                    "interest_rate_environment": "rising"
                }
            }
        }


class RiskAssessmentResponse(BaseModel):
    """
    Data model for the response of a risk assessment.
    
    Returns comprehensive risk analysis results with scoring on 0-1000 scale,
    risk categorization, and actionable mitigation recommendations. Supports
    95% accuracy requirements and explainable AI standards for regulatory compliance.
    """
    
    customer_id: str = Field(
        ...,
        description="Unique identifier for the assessed customer",
        min_length=1,
        max_length=50,
        example="CUST_12345"
    )
    
    risk_score: float = Field(
        ...,
        description="Numerical risk score on 0-1000 scale (0=lowest risk, 1000=highest risk)",
        ge=0.0,
        le=1000.0,
        example=245.8
    )
    
    risk_category: str = Field(
        ...,
        description="Categorical risk classification based on score ranges",
        example="LOW_RISK"
    )
    
    mitigation_recommendations: List[str] = Field(
        ...,
        description="List of actionable recommendations to mitigate identified risks",
        min_items=0,
        example=[
            "Consider diversifying investment portfolio to reduce concentration risk",
            "Maintain emergency fund equivalent to 6 months of expenses",
            "Review and optimize debt-to-income ratio through accelerated payments"
        ]
    )
    
    confidence_interval: float = Field(
        ...,
        description="Confidence level of the risk assessment (0.0-1.0)",
        ge=0.0,
        le=1.0,
        example=0.95
    )

    class Config:
        """Pydantic model configuration for enhanced validation and documentation."""
        json_schema_extra = {
            "example": {
                "customer_id": "CUST_12345",
                "risk_score": 245.8,
                "risk_category": "LOW_RISK",
                "mitigation_recommendations": [
                    "Consider diversifying investment portfolio",
                    "Maintain adequate emergency fund"
                ],
                "confidence_interval": 0.95
            }
        }


class FraudDetectionRequest(BaseModel):
    """
    Data model for a fraud detection request.
    
    Captures transaction details for real-time fraud analysis and risk scoring.
    Supports F-006 fraud detection system requirements with comprehensive
    transaction context for accurate fraud assessment.
    """
    
    transaction_id: str = Field(
        ...,
        description="Unique identifier for the transaction being analyzed",
        min_length=1,
        max_length=100,
        example="TXN_20241213_001234"
    )
    
    customer_id: str = Field(
        ...,
        description="Unique identifier for the customer initiating the transaction",
        min_length=1,
        max_length=50,
        example="CUST_12345"
    )
    
    amount: float = Field(
        ...,
        description="Transaction amount in the specified currency",
        gt=0,
        example=1250.00
    )
    
    currency: str = Field(
        ...,
        description="ISO 4217 currency code for the transaction",
        min_length=3,
        max_length=3,
        example="USD"
    )
    
    merchant: str = Field(
        ...,
        description="Merchant or recipient information for the transaction",
        min_length=1,
        max_length=200,
        example="Amazon.com"
    )
    
    timestamp: str = Field(
        ...,
        description="ISO 8601 timestamp of when the transaction occurred",
        example="2024-12-13T14:30:00Z"
    )

    class Config:
        """Pydantic model configuration for enhanced validation and documentation."""
        json_schema_extra = {
            "example": {
                "transaction_id": "TXN_20241213_001234",
                "customer_id": "CUST_12345",
                "amount": 1250.00,
                "currency": "USD",
                "merchant": "Amazon.com",
                "timestamp": "2024-12-13T14:30:00Z"
            }
        }


class FraudDetectionResponse(BaseModel):
    """
    Data model for the response of a fraud detection request.
    
    Provides fraud risk assessment results with scoring, binary classification,
    and explanatory reasoning. Supports real-time fraud detection with
    actionable insights for transaction approval or rejection decisions.
    """
    
    transaction_id: str = Field(
        ...,
        description="Unique identifier for the analyzed transaction",
        min_length=1,
        max_length=100,
        example="TXN_20241213_001234"
    )
    
    fraud_score: float = Field(
        ...,
        description="Fraud probability score (0.0-1.0, where 1.0 indicates highest fraud risk)",
        ge=0.0,
        le=1.0,
        example=0.15
    )
    
    is_fraud: bool = Field(
        ...,
        description="Binary classification indicating if transaction is flagged as fraudulent",
        example=False
    )
    
    reason: Optional[str] = Field(
        None,
        description="Explanation for fraud detection decision, especially for high-risk transactions",
        max_length=500,
        example="Transaction amount is within normal range for customer spending patterns"
    )

    class Config:
        """Pydantic model configuration for enhanced validation and documentation."""
        json_schema_extra = {
            "example": {
                "transaction_id": "TXN_20241213_001234",
                "fraud_score": 0.15,
                "is_fraud": False,
                "reason": "Transaction amount is within normal range for customer"
            }
        }


class RecommendationRequest(BaseModel):
    """
    Data model for requesting financial recommendations.
    
    Minimal request model for F-007 personalized financial recommendations,
    leveraging customer profile data from the unified data platform to
    generate tailored financial advice and product suggestions.
    """
    
    customer_id: str = Field(
        ...,
        description="Unique identifier for the customer requesting personalized recommendations",
        min_length=1,
        max_length=50,
        example="CUST_12345"
    )

    class Config:
        """Pydantic model configuration for enhanced validation and documentation."""
        json_schema_extra = {
            "example": {
                "customer_id": "CUST_12345"
            }
        }


class Recommendation(BaseModel):
    """
    A single financial recommendation.
    
    Represents an individual recommendation with comprehensive details
    for customer financial wellness and product suggestions. Supports
    personalized financial advice based on customer profile analysis.
    """
    
    recommendation_id: str = Field(
        ...,
        description="Unique identifier for the recommendation",
        min_length=1,
        max_length=100,
        example="REC_12345_001"
    )
    
    title: str = Field(
        ...,
        description="Concise title or summary of the recommendation",
        min_length=1,
        max_length=200,
        example="High-Yield Savings Account Opportunity"
    )
    
    description: str = Field(
        ...,
        description="Detailed description of the recommendation and its benefits",
        min_length=1,
        max_length=1000,
        example="Based on your current savings pattern, switching to our high-yield savings account could earn you an additional $240 annually with a 2.4% APY compared to your current 0.5% rate."
    )
    
    category: str = Field(
        ...,
        description="Category or type of the financial recommendation",
        min_length=1,
        max_length=50,
        example="SAVINGS"
    )

    class Config:
        """Pydantic model configuration for enhanced validation and documentation."""
        json_schema_extra = {
            "example": {
                "recommendation_id": "REC_12345_001",
                "title": "High-Yield Savings Account Opportunity",
                "description": "Based on your savings pattern, switching accounts could earn you an additional $240 annually",
                "category": "SAVINGS"
            }
        }


class RecommendationResponse(BaseModel):
    """
    Data model for the response of a recommendation request.
    
    Returns a collection of personalized financial recommendations
    tailored to the customer's financial profile, goals, and behavior patterns.
    Supports F-007 requirements for personalized financial wellness tools.
    """
    
    customer_id: str = Field(
        ...,
        description="Unique identifier for the customer receiving recommendations",
        min_length=1,
        max_length=50,
        example="CUST_12345"
    )
    
    recommendations: List[Recommendation] = Field(
        ...,
        description="List of personalized financial recommendations for the customer",
        min_items=0,
        example=[
            {
                "recommendation_id": "REC_12345_001",
                "title": "High-Yield Savings Account",
                "description": "Switch to earn higher interest rates",
                "category": "SAVINGS"
            },
            {
                "recommendation_id": "REC_12345_002",
                "title": "Credit Card Upgrade",
                "description": "Qualify for premium rewards card",
                "category": "CREDIT"
            }
        ]
    )

    class Config:
        """Pydantic model configuration for enhanced validation and documentation."""
        json_schema_extra = {
            "example": {
                "customer_id": "CUST_12345",
                "recommendations": [
                    {
                        "recommendation_id": "REC_12345_001",
                        "title": "High-Yield Savings Account",
                        "description": "Switch to earn higher interest rates",
                        "category": "SAVINGS"
                    }
                ]
            }
        }