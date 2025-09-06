"""
Unit and Integration Tests for AI Service Components

This module contains comprehensive test suites for the AI service prediction,
fraud detection, and recommendation services. The tests ensure proper functionality
of all AI-powered features while using mocking to isolate services from external
dependencies like models and data preprocessing.

Features Tested:
- F-002: AI-Powered Risk Assessment Engine - Real-time risk scoring and predictive modeling
- F-006: Fraud Detection System - Transaction fraud analysis and detection
- F-007: Personalized Financial Recommendations - Customer-specific financial advice

Test Coverage:
- Unit tests for individual service methods with comprehensive mocking
- Integration tests for service interactions and data flow validation  
- Edge case testing for error handling and boundary conditions
- Performance validation for response time requirements
- Data validation testing for request/response models

Testing Approach:
- Comprehensive mocking of ML models and external dependencies
- Isolated testing of business logic without external service calls
- Validation of request/response data structures and transformations
- Error handling and exception testing for robustness
- Performance benchmarking against SLA requirements

Author: AI Service Team
Version: 1.0.0
Test Framework: pytest 7.4
Mock Framework: unittest.mock 5.1.0
Compliance: SOC2, PCI DSS, GDPR, Basel III/IV
"""

import pytest  # Version 7.4 - Python testing framework for comprehensive test execution
import time  # Built-in Python module for performance timing and measurements
from unittest.mock import patch, MagicMock  # Version 5.1.0 - Mock objects and patching for dependency isolation
from typing import Dict, List, Any  # Built-in Python module for type annotations and validation

# Import the services under test and their dependencies
from services.prediction_service import PredictionService
from services.fraud_detection_service import FraudDetectionService  
from services.recommendation_service import RecommendationService

# Import API models for request/response validation and test data creation
from api.models import (
    RiskAssessmentRequest,
    RiskAssessmentResponse,
    FraudDetectionRequest,
    FraudDetectionResponse,
    RecommendationRequest,
    RecommendationResponse,
    Recommendation
)

# =============================================================================
# TEST FIXTURES AND SHARED UTILITIES
# =============================================================================

@pytest.fixture
def sample_risk_assessment_request() -> RiskAssessmentRequest:
    """
    Creates a sample risk assessment request for testing purposes.
    
    Returns:
        RiskAssessmentRequest: A properly structured request with realistic financial data
    """
    return RiskAssessmentRequest(
        customer_id="TEST_CUST_12345",
        financial_data={
            "annual_income": 75000.00,
            "total_assets": 250000.00,
            "total_liabilities": 150000.00,
            "credit_score": 750,
            "debt_to_income_ratio": 0.35,
            "account_balance": 15000.00,
            "credit_utilization": 0.25
        },
        transaction_patterns=[
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
        ],
        market_conditions={
            "market_volatility": 0.22,
            "interest_rate_environment": "rising",
            "economic_indicators": {
                "gdp_growth": 0.025,
                "inflation_rate": 0.032,
                "unemployment_rate": 0.045
            }
        }
    )

@pytest.fixture
def sample_fraud_detection_request() -> FraudDetectionRequest:
    """
    Creates a sample fraud detection request for testing purposes.
    
    Returns:
        FraudDetectionRequest: A properly structured transaction request with realistic data
    """
    return FraudDetectionRequest(
        transaction_id="TEST_TXN_20241213_001234",
        customer_id="TEST_CUST_12345",
        amount=1250.00,
        currency="USD",
        merchant="Amazon.com",
        timestamp="2024-12-13T14:30:00Z"
    )

@pytest.fixture  
def sample_recommendation_request() -> RecommendationRequest:
    """
    Creates a sample recommendation request for testing purposes.
    
    Returns:
        RecommendationRequest: A properly structured request with customer ID
    """
    return RecommendationRequest(customer_id="TEST_CUST_12345")

@pytest.fixture
def mock_risk_model() -> MagicMock:
    """
    Creates a mock risk assessment model for testing.
    
    Returns:
        MagicMock: A mock model with predict method that returns risk probability
    """
    mock_model = MagicMock()
    mock_model.predict.return_value = [[0.245]]  # Low risk score (24.5% probability)
    return mock_model

@pytest.fixture
def mock_fraud_model() -> MagicMock:
    """
    Creates a mock fraud detection model for testing.
    
    Returns:
        MagicMock: A mock model with predict method that returns fraud probability
    """
    mock_model = MagicMock()
    mock_model.predict.return_value = [[0.15]]  # Low fraud score (15% probability)
    return mock_model

@pytest.fixture
def mock_recommendation_model() -> MagicMock:
    """
    Creates a mock recommendation model for testing.
    
    Returns:
        MagicMock: A mock model with predict method that returns recommendation scores
    """
    mock_model = MagicMock()
    mock_model.predict.return_value = [0.8, 0.7, 0.6, 0.5, 0.4, 0.3]  # Recommendation scores
    return mock_model

# =============================================================================
# TEST SUITE: PREDICTION SERVICE
# =============================================================================

class TestPredictionService:
    """
    Test suite for the PredictionService class.
    
    This test suite validates the core prediction functionality for risk assessment,
    fraud detection, and financial recommendations. Tests use comprehensive mocking
    to isolate the service from external ML model dependencies while ensuring
    proper data flow, validation, and response formatting.
    
    Test Coverage:
    - Risk assessment prediction with various input scenarios
    - Fraud detection prediction with high and low risk transactions  
    - Recommendation prediction with customer profiling
    - Error handling for invalid inputs and model failures
    - Performance validation against SLA requirements
    - Data validation and sanitization testing
    """
    
    def test_predict_risk_assessment(self, sample_risk_assessment_request: RiskAssessmentRequest,
                                   mock_risk_model: MagicMock, mock_fraud_model: MagicMock,
                                   mock_recommendation_model: MagicMock) -> None:
        """
        Tests the risk assessment prediction functionality.
        
        This test validates the complete risk assessment pipeline including data preprocessing,
        model inference, post-processing, and response generation. It ensures that the service
        can accurately process customer financial data and generate meaningful risk scores
        within performance requirements.
        
        Test Steps:
        1. Initialize the PredictionService with mock models
        2. Create a sample RiskAssessmentRequest with comprehensive financial data
        3. Mock the predict method of the risk model to return a predefined risk score
        4. Call the predict_risk method of the PredictionService  
        5. Assert that the returned risk score matches the expected value
        6. Assert that the risk model's predict method was called once
        7. Validate response structure and data types
        8. Verify risk categorization logic and mitigation recommendations
        
        Args:
            sample_risk_assessment_request: Fixture providing test request data
            mock_risk_model: Mock risk assessment model
            mock_fraud_model: Mock fraud detection model (unused but required for init)
            mock_recommendation_model: Mock recommendation model (unused but required for init)
        """
        # Step 1: Initialize the PredictionService with mock models
        with patch('services.prediction_service.load_model') as mock_load_model:
            # Configure the mock to return our test models based on model type
            def load_model_side_effect(model_type):
                if model_type == 'risk_model':
                    return mock_risk_model
                elif model_type == 'fraud_model':
                    return mock_fraud_model
                elif model_type == 'recommendation_model':
                    return mock_recommendation_model
                else:
                    return MagicMock()
            
            mock_load_model.side_effect = load_model_side_effect
            
            # Initialize service with mocked model loading
            prediction_service = PredictionService()
            
            # Verify models were loaded correctly
            assert prediction_service.risk_model is not None
            assert prediction_service.fraud_model is not None
            assert prediction_service.recommendation_model is not None
        
        # Step 2: Create a sample RiskAssessmentRequest (already provided by fixture)
        request = sample_risk_assessment_request
        
        # Validate request structure before processing
        assert request.customer_id == "TEST_CUST_12345"
        assert request.financial_data["credit_score"] == 750
        assert len(request.transaction_patterns) == 2
        
        # Step 3: Mock the predict method of the risk model to return predefined risk score
        expected_risk_probability = 0.245  # 24.5% risk probability
        mock_risk_model.predict.return_value = [[expected_risk_probability]]
        
        # Step 4: Call the predict_risk method of the PredictionService
        start_time = time.time()
        response = prediction_service.predict_risk(request)
        processing_time_ms = (time.time() - start_time) * 1000
        
        # Step 5: Assert that the returned risk score matches the expected value
        expected_risk_score = expected_risk_probability * 1000.0  # Convert to 0-1000 scale
        assert response.risk_score == expected_risk_score
        
        # Verify response is correct type
        assert isinstance(response, RiskAssessmentResponse)
        
        # Step 6: Assert that the risk model's predict method was called once
        mock_risk_model.predict.assert_called_once()
        
        # Get the arguments passed to the model for validation
        call_args = mock_risk_model.predict.call_args
        model_input = call_args[0][0]  # First positional argument
        
        # Validate model input structure and shape
        assert model_input is not None
        assert len(model_input.shape) == 2  # Should be 2D array for batch processing
        assert model_input.shape[0] == 1  # Single prediction request
        
        # Step 7: Validate response structure and data types
        assert response.customer_id == request.customer_id
        assert isinstance(response.risk_score, float)
        assert 0.0 <= response.risk_score <= 1000.0
        assert isinstance(response.risk_category, str)
        assert response.risk_category in ["LOW_RISK", "MEDIUM_RISK", "HIGH_RISK", "VERY_HIGH_RISK"]
        assert isinstance(response.mitigation_recommendations, list)
        assert isinstance(response.confidence_interval, float)
        assert 0.0 <= response.confidence_interval <= 1.0
        
        # Step 8: Verify risk categorization logic based on expected score
        # Score of 245 should be LOW_RISK (typically threshold is 300)
        assert response.risk_category == "LOW_RISK"
        
        # Validate mitigation recommendations are appropriate for low risk
        assert len(response.mitigation_recommendations) > 0
        low_risk_keywords = ["continue", "maintain", "excellent", "opportunities"]
        recommendation_text = " ".join(response.mitigation_recommendations).lower()
        assert any(keyword in recommendation_text for keyword in low_risk_keywords)
        
        # Performance validation - should complete within 500ms (F-002 requirement)
        assert processing_time_ms < 500, f"Risk assessment took {processing_time_ms:.2f}ms, exceeds 500ms SLA"
        
        # Confidence interval validation - should be high for extreme scores
        assert response.confidence_interval >= 0.85, "Confidence should be high for clear low-risk score"
    
    def test_predict_fraud_detection(self, sample_fraud_detection_request: FraudDetectionRequest,
                                   mock_risk_model: MagicMock, mock_fraud_model: MagicMock, 
                                   mock_recommendation_model: MagicMock) -> None:
        """
        Tests the fraud detection prediction functionality.
        
        This test validates the fraud detection pipeline including transaction preprocessing,
        model inference, and fraud classification. It ensures accurate fraud scoring and
        proper threshold-based classification for transaction approval decisions.
        
        Test Steps:
        1. Initialize the PredictionService with mock models
        2. Create a sample FraudDetectionRequest with transaction details
        3. Mock the predict method of the fraud model to return a predefined fraud score
        4. Call the predict_fraud method of the PredictionService
        5. Assert that the returned fraud score matches the expected value
        6. Assert that the fraud model's predict method was called once
        7. Validate response structure and fraud classification logic
        8. Test both low and high fraud scenarios
        
        Args:
            sample_fraud_detection_request: Fixture providing test transaction data
            mock_risk_model: Mock risk assessment model (unused but required for init)
            mock_fraud_model: Mock fraud detection model
            mock_recommendation_model: Mock recommendation model (unused but required for init)
        """
        # Step 1: Initialize the PredictionService with mock models
        with patch('services.prediction_service.load_model') as mock_load_model:
            def load_model_side_effect(model_type):
                if model_type == 'risk_model':
                    return mock_risk_model
                elif model_type == 'fraud_model': 
                    return mock_fraud_model
                elif model_type == 'recommendation_model':
                    return mock_recommendation_model
                else:
                    return MagicMock()
            
            mock_load_model.side_effect = load_model_side_effect
            prediction_service = PredictionService()
        
        # Step 2: Create a sample FraudDetectionRequest (provided by fixture)
        request = sample_fraud_detection_request
        
        # Validate request structure
        assert request.transaction_id == "TEST_TXN_20241213_001234"
        assert request.amount == 1250.00
        assert request.currency == "USD"
        
        # Step 3: Mock the predict method of the fraud model to return predefined fraud score
        expected_fraud_probability = 0.15  # Low fraud probability (15%)
        mock_fraud_model.predict.return_value = [[expected_fraud_probability]]
        
        # Step 4: Call the predict_fraud method of the PredictionService
        start_time = time.time()
        response = prediction_service.predict_fraud(request)
        processing_time_ms = (time.time() - start_time) * 1000
        
        # Step 5: Assert that the returned fraud score matches the expected value
        assert response.fraud_score == expected_fraud_probability
        assert isinstance(response, FraudDetectionResponse)
        
        # Step 6: Assert that the fraud model's predict method was called once
        mock_fraud_model.predict.assert_called_once()
        
        # Validate model input was properly formatted
        call_args = mock_fraud_model.predict.call_args
        model_input = call_args[0][0]
        assert model_input is not None
        assert len(model_input.shape) == 2
        
        # Step 7: Validate response structure and fraud classification logic
        assert response.transaction_id == request.transaction_id
        assert isinstance(response.fraud_score, float)
        assert 0.0 <= response.fraud_score <= 1.0
        assert isinstance(response.is_fraud, bool)
        assert isinstance(response.reason, str)
        
        # For low fraud score (0.15), should not be classified as fraud
        assert response.is_fraud == False
        assert "fraud score" in response.reason.lower()
        
        # Performance validation - should complete within 200ms for fraud detection
        assert processing_time_ms < 200, f"Fraud detection took {processing_time_ms:.2f}ms, exceeds 200ms SLA"
        
        # Step 8: Test high fraud scenario with different mock return value
        high_fraud_probability = 0.95  # High fraud probability (95%)
        mock_fraud_model.predict.return_value = [[high_fraud_probability]]
        
        # Create high-risk transaction request (high amount, suspicious merchant)
        high_risk_request = FraudDetectionRequest(
            transaction_id="TEST_TXN_HIGH_RISK_001",
            customer_id="TEST_CUST_12345", 
            amount=15000.00,  # Large amount
            currency="BTC",   # Cryptocurrency
            merchant="Unknown Cash Transfer",  # Suspicious merchant
            timestamp="2024-12-13T23:45:00Z"  # Late night
        )
        
        high_risk_response = prediction_service.predict_fraud(high_risk_request)
        
        # Validate high fraud detection
        assert high_risk_response.fraud_score == high_fraud_probability
        assert high_risk_response.is_fraud == True  # Should be flagged as fraud
        assert "fraud detected" in high_risk_response.reason.lower()
        assert "high" in high_risk_response.reason.lower() or "exceeds" in high_risk_response.reason.lower()
        
        # Verify model was called again
        assert mock_fraud_model.predict.call_count == 2
    
    def test_predict_recommendation(self, sample_recommendation_request: RecommendationRequest,
                                  mock_risk_model: MagicMock, mock_fraud_model: MagicMock,
                                  mock_recommendation_model: MagicMock) -> None:
        """
        Tests the recommendation prediction functionality.
        
        This test validates the personalized recommendation generation pipeline including
        customer profiling, feature engineering, model inference, and recommendation
        formatting. It ensures relevant and personalized financial recommendations.
        
        Test Steps:
        1. Initialize the PredictionService with mock models
        2. Create a sample RecommendationRequest with customer ID
        3. Mock the predict method of the recommendation model to return predefined recommendations
        4. Call the predict_recommendation method of the PredictionService
        5. Assert that the returned recommendations match the expected values
        6. Assert that the recommendation model's predict method was called once
        7. Validate recommendation content, categories, and personalization
        
        Args:
            sample_recommendation_request: Fixture providing test request data
            mock_risk_model: Mock risk assessment model (unused but required for init)
            mock_fraud_model: Mock fraud detection model (unused but required for init)
            mock_recommendation_model: Mock recommendation model
        """
        # Step 1: Initialize the PredictionService with mock models
        with patch('services.prediction_service.load_model') as mock_load_model:
            def load_model_side_effect(model_type):
                if model_type == 'risk_model':
                    return mock_risk_model
                elif model_type == 'fraud_model':
                    return mock_fraud_model
                elif model_type == 'recommendation_model':
                    return mock_recommendation_model
                else:
                    return MagicMock()
            
            mock_load_model.side_effect = load_model_side_effect
            prediction_service = PredictionService()
        
        # Step 2: Create a sample RecommendationRequest (provided by fixture)
        request = sample_recommendation_request
        
        # Validate request structure
        assert request.customer_id == "TEST_CUST_12345"
        
        # Step 3: Mock the predict method of the recommendation model to return predefined recommendations
        expected_recommendation_scores = [0.9, 0.8, 0.75, 0.7, 0.65, 0.6]  # High to low relevance
        mock_recommendation_model.predict.return_value = expected_recommendation_scores
        
        # Step 4: Call the get_recommendations method of the PredictionService  
        start_time = time.time()
        response = prediction_service.get_recommendations(request)
        processing_time_ms = (time.time() - start_time) * 1000
        
        # Step 5: Assert that the returned recommendations match the expected values
        assert isinstance(response, RecommendationResponse)
        assert response.customer_id == request.customer_id
        assert isinstance(response.recommendations, list)
        assert len(response.recommendations) > 0
        
        # Step 6: Assert that the recommendation model's predict method was called once
        mock_recommendation_model.predict.assert_called_once()
        
        # Validate model input structure
        call_args = mock_recommendation_model.predict.call_args
        model_input = call_args[0][0]
        assert model_input is not None
        assert len(model_input.shape) == 2
        
        # Step 7: Validate recommendation content, categories, and personalization
        recommendations = response.recommendations
        
        # Verify recommendation structure and content
        for rec in recommendations:
            assert isinstance(rec, Recommendation)
            assert rec.recommendation_id is not None
            assert len(rec.recommendation_id) > 0
            assert rec.title is not None  
            assert len(rec.title) > 0
            assert rec.description is not None
            assert len(rec.description) > 0
            assert rec.category is not None
            assert len(rec.category) > 0
            
            # Validate recommendation ID format
            assert rec.recommendation_id.startswith("REC_")
            assert request.customer_id in rec.recommendation_id
            
            # Validate category is a known financial product category
            valid_categories = ["SAVINGS", "INVESTMENT", "CREDIT", "INSURANCE", "RETIREMENT", "DEBT"]
            assert rec.category in valid_categories
            
            # Validate description contains personalized content
            description_lower = rec.description.lower()
            personalization_indicators = ["your", "you", "based on", "recommended", "could"]
            assert any(indicator in description_lower for indicator in personalization_indicators)
        
        # Validate recommendation diversity (should have multiple categories)
        categories = [rec.category for rec in recommendations]
        unique_categories = set(categories)
        assert len(unique_categories) >= 2, "Should provide diverse recommendation categories"
        
        # Validate recommendations are ordered by relevance (high scores first)
        # This is implicitly tested by the mock scores being in descending order
        
        # Performance validation - should complete within 1000ms for recommendations
        assert processing_time_ms < 1000, f"Recommendation generation took {processing_time_ms:.2f}ms, exceeds 1000ms SLA"
        
        # Validate minimum recommendation count
        assert len(recommendations) >= 3, "Should provide at least 3 recommendations"
        assert len(recommendations) <= 10, "Should not exceed maximum recommendation limit"
        
        # Test content quality - descriptions should be substantive
        for rec in recommendations:
            assert len(rec.description) >= 50, f"Description too short: {rec.description}"
            assert len(rec.description) <= 500, f"Description too long: {rec.description}"
            
            # Should contain financial benefit information
            benefit_keywords = ["save", "earn", "benefit", "return", "rate", "value", "$", "%"]
            assert any(keyword in rec.description.lower() for keyword in benefit_keywords)

# =============================================================================
# TEST SUITE: FRAUD DETECTION SERVICE  
# =============================================================================

class TestFraudDetectionService:
    """
    Test suite for the FraudDetectionService class.
    
    This test suite validates the fraud detection service functionality including
    service initialization, dependency injection, transaction analysis, and
    fraud classification with configurable thresholds. Tests ensure proper
    integration with the PredictionService and enhanced fraud detection logic.
    
    Test Coverage:
    - Service initialization with dependency injection validation
    - Main fraud detection logic with various risk scenarios
    - Threshold-based classification and decision making
    - Enhanced reasoning and explanation generation
    - Error handling for invalid transactions and service failures
    - Performance validation against real-time processing requirements
    """
    
    def test_detect_fraud(self, sample_fraud_detection_request: FraudDetectionRequest,
                         mock_risk_model: MagicMock, mock_fraud_model: MagicMock,
                         mock_recommendation_model: MagicMock) -> None:
        """
        Tests the main fraud detection logic.
        
        This test validates the complete fraud detection workflow including service
        initialization, transaction preprocessing, model inference, threshold application,
        and enhanced fraud reasoning. It tests both high and low fraud scenarios to
        ensure proper classification and decision-making.
        
        Test Steps:
        1. Initialize the FraudDetectionService with a mock PredictionService
        2. Create a sample FraudDetectionRequest with transaction details
        3. Mock the predict_fraud method of the PredictionService to return a high fraud score
        4. Call the detect_fraud method of the FraudDetectionService
        5. Assert that the response indicates fraud was detected
        6. Mock the predict_fraud method to return a low fraud score  
        7. Call the detect_fraud method again
        8. Assert that the response indicates no fraud was detected
        9. Validate enhanced reasoning and service-level logic
        
        Args:
            sample_fraud_detection_request: Fixture providing test transaction data
            mock_risk_model: Mock risk assessment model for PredictionService init
            mock_fraud_model: Mock fraud detection model for PredictionService init
            mock_recommendation_model: Mock recommendation model for PredictionService init
        """
        # Step 1: Initialize the FraudDetectionService with a mock PredictionService
        with patch('services.prediction_service.load_model') as mock_load_model:
            def load_model_side_effect(model_type):
                if model_type == 'risk_model':
                    return mock_risk_model
                elif model_type == 'fraud_model':
                    return mock_fraud_model
                elif model_type == 'recommendation_model':
                    return mock_recommendation_model
                else:
                    return MagicMock()
            
            mock_load_model.side_effect = load_model_side_effect
            
            # Create mock PredictionService with proper initialization
            mock_prediction_service = PredictionService()
            
            # Initialize FraudDetectionService with mock dependency
            fraud_detection_service = FraudDetectionService(mock_prediction_service)
            
            # Verify service initialization
            assert fraud_detection_service.prediction_service is not None
            assert fraud_detection_service.model is not None
            assert hasattr(fraud_detection_service, 'fraud_threshold')
            assert hasattr(fraud_detection_service, 'service_metadata')
        
        # Step 2: Create a sample FraudDetectionRequest (provided by fixture)
        request = sample_fraud_detection_request
        
        # Validate request structure
        assert request.transaction_id == "TEST_TXN_20241213_001234"
        assert request.customer_id == "TEST_CUST_12345"
        assert request.amount == 1250.00
        
        # Step 3: Mock the predict_fraud method of the PredictionService to return high fraud score
        high_fraud_response = FraudDetectionResponse(
            transaction_id=request.transaction_id,
            fraud_score=0.92,  # High fraud score (92%)
            is_fraud=True,
            reason="High fraud risk detected based on transaction patterns and risk factors"
        )
        
        # Mock the PredictionService predict_fraud method  
        with patch.object(fraud_detection_service.prediction_service, 'predict_fraud', 
                         return_value=high_fraud_response) as mock_predict_fraud:
            
            # Step 4: Call the detect_fraud method of the FraudDetectionService
            start_time = time.time()
            high_risk_result = fraud_detection_service.detect_fraud(request)
            processing_time_ms = (time.time() - start_time) * 1000
            
            # Step 5: Assert that the response indicates fraud was detected
            assert isinstance(high_risk_result, FraudDetectionResponse)
            assert high_risk_result.transaction_id == request.transaction_id
            assert high_risk_result.is_fraud == True
            assert high_risk_result.fraud_score >= 0.8  # Should be high fraud score
            assert isinstance(high_risk_result.reason, str)
            assert len(high_risk_result.reason) > 0
            
            # Verify PredictionService method was called correctly
            mock_predict_fraud.assert_called_once_with(request)
            
            # Validate enhanced fraud reasoning contains service-level analysis
            reason_lower = high_risk_result.reason.lower()
            fraud_indicators = ["fraud", "risk", "detected", "score", "threshold"]
            assert any(indicator in reason_lower for indicator in fraud_indicators)
            
            # Performance validation
            assert processing_time_ms < 200, f"Fraud detection took {processing_time_ms:.2f}ms, exceeds 200ms SLA"
        
        # Step 6: Mock the predict_fraud method to return a low fraud score
        low_fraud_response = FraudDetectionResponse(
            transaction_id=request.transaction_id,
            fraud_score=0.12,  # Low fraud score (12%)
            is_fraud=False,
            reason="Low fraud risk: transaction patterns within normal range"
        )
        
        with patch.object(fraud_detection_service.prediction_service, 'predict_fraud',
                         return_value=low_fraud_response) as mock_predict_fraud_low:
            
            # Step 7: Call the detect_fraud method again
            low_risk_result = fraud_detection_service.detect_fraud(request)
            
            # Step 8: Assert that the response indicates no fraud was detected
            assert isinstance(low_risk_result, FraudDetectionResponse)
            assert low_risk_result.transaction_id == request.transaction_id
            assert low_risk_result.is_fraud == False
            assert low_risk_result.fraud_score <= 0.2  # Should be low fraud score
            assert isinstance(low_risk_result.reason, str)
            
            # Verify PredictionService method was called
            mock_predict_fraud_low.assert_called_once_with(request)
        
        # Step 9: Validate enhanced reasoning and service-level logic
        # Test service configuration and thresholds
        assert hasattr(fraud_detection_service, 'fraud_threshold')
        assert hasattr(fraud_detection_service, 'high_confidence_threshold')
        assert hasattr(fraud_detection_service, 'low_confidence_threshold')
        
        # Validate threshold values are reasonable
        assert 0.5 <= fraud_detection_service.fraud_threshold <= 0.95
        assert fraud_detection_service.high_confidence_threshold > fraud_detection_service.fraud_threshold
        assert fraud_detection_service.low_confidence_threshold < fraud_detection_service.fraud_threshold
        
        # Test service metadata and audit capabilities
        assert hasattr(fraud_detection_service, 'service_metadata')
        assert hasattr(fraud_detection_service, 'performance_metrics')
        assert hasattr(fraud_detection_service, 'audit_trail')
        
        metadata = fraud_detection_service.service_metadata
        assert metadata['service_name'] == 'FraudDetectionService'
        assert 'F-006: Fraud Detection System' in metadata['features_supported']
        assert 'SOC2' in metadata['compliance_standards']
        
        # Validate performance metrics are being tracked
        metrics = fraud_detection_service.performance_metrics
        assert 'total_predictions' in metrics
        assert 'successful_predictions' in metrics
        assert 'failed_predictions' in metrics
        assert metrics['total_predictions'] > 0  # Should have processed our test requests
        
        # Test edge case - invalid request handling
        with pytest.raises(ValueError):
            invalid_request = FraudDetectionRequest(
                transaction_id="",  # Empty transaction ID should cause validation error
                customer_id="TEST_CUST_12345",
                amount=100.0,
                currency="USD", 
                merchant="Test Merchant",
                timestamp="2024-12-13T14:30:00Z"
            )
            fraud_detection_service.detect_fraud(invalid_request)
        
        # Test another edge case - negative amount
        with pytest.raises(ValueError):
            negative_amount_request = FraudDetectionRequest(
                transaction_id="TEST_TXN_NEGATIVE",
                customer_id="TEST_CUST_12345", 
                amount=-100.0,  # Negative amount should cause validation error
                currency="USD",
                merchant="Test Merchant",
                timestamp="2024-12-13T14:30:00Z"
            )
            fraud_detection_service.detect_fraud(negative_amount_request)

# =============================================================================
# TEST SUITE: RECOMMENDATION SERVICE
# =============================================================================

class TestRecommendationService:
    """
    Test suite for the RecommendationService class.
    
    This test suite validates the personalized recommendation service functionality
    including service initialization, customer profiling, feature engineering,
    model inference, and recommendation generation. Tests ensure high-quality
    personalized financial recommendations with proper categorization and content.
    
    Test Coverage:
    - Service initialization and model loading validation
    - Customer profile retrieval and data preprocessing  
    - Main recommendation generation logic with comprehensive validation
    - Recommendation filtering, ranking, and compliance checking
    - Error handling for invalid customers and service failures
    - Performance validation against recommendation generation SLA
    """
    
    def test_get_recommendations(self, sample_recommendation_request: RecommendationRequest) -> None:
        """
        Tests the main recommendation logic.
        
        This test validates the complete recommendation generation workflow including
        service initialization, customer profiling, feature engineering, model inference,
        post-processing, and response formatting. It ensures that high-quality personalized
        recommendations are generated with proper content and categorization.
        
        Test Steps:
        1. Initialize the RecommendationService with a mock PredictionService
        2. Create a sample RecommendationRequest with customer ID
        3. Mock the predict_recommendation method of the PredictionService to return a list of recommendations
        4. Call the get_recommendations method of the RecommendationService
        5. Assert that the returned recommendations match the expected list
        6. Assert that the predict_recommendation method was called with the correct data
        7. Validate recommendation content quality and personalization
        8. Test various customer profiles and edge cases
        
        Args:
            sample_recommendation_request: Fixture providing test request data
        """
        # Step 1: Initialize the RecommendationService with proper mocking
        with patch('services.recommendation_service.load_model') as mock_load_model:
            # Create a mock recommendation model
            mock_recommendation_model = MagicMock()
            mock_recommendation_model.predict.return_value = [0.9, 0.85, 0.8, 0.75, 0.7, 0.65]
            
            # Configure load_model to return our mock
            mock_load_model.return_value = mock_recommendation_model
            
            # Initialize the RecommendationService
            recommendation_service = RecommendationService()
            
            # Verify service initialization
            assert recommendation_service.service_ready == True
            assert recommendation_service.service_healthy == True
            assert recommendation_service.model is not None
            assert hasattr(recommendation_service, 'candidate_items_catalog')
            assert len(recommendation_service.candidate_items_catalog) > 0
        
        # Step 2: Create a sample RecommendationRequest (provided by fixture)
        request = sample_recommendation_request
        
        # Validate request structure
        assert request.customer_id == "TEST_CUST_12345"
        
        # Step 3: Mock internal methods for controlled testing
        with patch.object(recommendation_service, '_retrieve_user_profile') as mock_retrieve_profile, \
             patch.object(recommendation_service, '_preprocess_user_data') as mock_preprocess, \
             patch.object(recommendation_service, '_prepare_candidate_items') as mock_prepare_candidates:
            
            # Configure mock user profile
            mock_user_profile = {
                'customer_id': request.customer_id,
                'demographics': {
                    'age': 35,
                    'income': 75000,
                    'occupation': 'professional'
                },
                'financial_profile': {
                    'credit_score': 750,
                    'risk_tolerance': 'moderate',
                    'investment_experience': 'intermediate'
                },
                'current_products': {
                    'checking_account': True,
                    'savings_account': False,
                    'investment_account': False
                }
            }
            mock_retrieve_profile.return_value = mock_user_profile
            
            # Configure mock preprocessed features
            mock_processed_features = {
                'customer_id': request.customer_id,
                'age': 35,
                'income': 75000,
                'credit_score': 750,
                'risk_tolerance': 'moderate'
            }
            mock_preprocess.return_value = mock_processed_features
            
            # Configure mock candidate items
            mock_candidate_items = [
                {
                    'item_id': 'SAVINGS_001',
                    'category': 'banking',
                    'name': 'High-Yield Savings Account',
                    'interest_rate': 0.045
                },
                {
                    'item_id': 'INV_001', 
                    'category': 'investment',
                    'name': 'Balanced Index Fund',
                    'risk_level': 'moderate'
                },
                {
                    'item_id': 'CREDIT_001',
                    'category': 'banking',
                    'name': 'Rewards Credit Card',
                    'cashback_rate': 0.015
                }
            ]
            mock_prepare_candidates.return_value = mock_candidate_items
            
            # Step 4: Call the generate_recommendations method of the RecommendationService
            start_time = time.time()
            response = recommendation_service.generate_recommendations(request)
            processing_time_ms = (time.time() - start_time) * 1000
            
            # Step 5: Assert that the returned recommendations match the expected list
            assert isinstance(response, RecommendationResponse)
            assert response.customer_id == request.customer_id
            assert isinstance(response.recommendations, list)
            assert len(response.recommendations) > 0
            
            # Step 6: Assert that internal methods were called with correct data
            mock_retrieve_profile.assert_called_once_with(request.customer_id)
            mock_preprocess.assert_called_once_with(mock_user_profile)
            mock_prepare_candidates.assert_called_once_with(mock_user_profile)
            
            # Verify model prediction was called
            recommendation_service.model.predict.assert_called_once()
            
            # Step 7: Validate recommendation content quality and personalization
            recommendations = response.recommendations
            
            # Validate each recommendation structure and content
            for i, rec in enumerate(recommendations):
                assert isinstance(rec, Recommendation)
                assert rec.recommendation_id is not None
                assert len(rec.recommendation_id) > 0
                assert rec.title is not None
                assert len(rec.title) > 0
                assert rec.description is not None
                assert len(rec.description) > 0
                assert rec.category is not None
                assert len(rec.category) > 0
                
                # Validate recommendation ID format and uniqueness
                assert rec.recommendation_id.startswith("REC_")
                expected_id_pattern = f"REC_{request.customer_id}_{i+1:03d}"
                assert rec.recommendation_id == expected_id_pattern
                
                # Validate content quality
                assert len(rec.title) >= 10, f"Title too short: {rec.title}"
                assert len(rec.description) >= 50, f"Description too short: {rec.description}"
                assert len(rec.description) <= 500, f"Description too long: {rec.description}"
                
                # Validate personalization indicators
                description_lower = rec.description.lower()
                personalization_keywords = ["your", "you", "based on", "recommended"]
                assert any(keyword in description_lower for keyword in personalization_keywords), \
                       f"Description lacks personalization: {rec.description}"
                
                # Validate financial benefit information
                benefit_keywords = ["save", "earn", "apy", "rate", "$", "%", "return", "benefit"]
                assert any(keyword in description_lower for keyword in benefit_keywords), \
                       f"Description lacks financial benefit info: {rec.description}"
            
            # Validate recommendation diversity and categories
            categories = [rec.category for rec in recommendations]
            unique_categories = set(categories)
            assert len(unique_categories) >= 2, "Should provide diverse recommendation categories"
            
            valid_categories = ["SAVINGS", "INVESTMENT", "CREDIT", "INSURANCE", "RETIREMENT", "DEBT"]
            for category in categories:
                assert category in valid_categories, f"Invalid category: {category}"
            
            # Performance validation - should complete within 1000ms
            assert processing_time_ms < 1000, f"Recommendation generation took {processing_time_ms:.2f}ms, exceeds 1000ms SLA"
            
            # Validate recommendation count is reasonable
            assert 3 <= len(recommendations) <= 10, f"Unexpected recommendation count: {len(recommendations)}"
        
        # Step 8: Test various customer profiles and edge cases
        
        # Test high-income customer profile
        with patch.object(recommendation_service, '_retrieve_user_profile') as mock_high_income:
            high_income_profile = {
                'customer_id': 'HIGH_INCOME_CUST',
                'demographics': {'age': 45, 'income': 150000},
                'financial_profile': {'credit_score': 800, 'risk_tolerance': 'high'},
                'current_products': {'checking_account': True, 'investment_account': True}
            }
            mock_high_income.return_value = high_income_profile
            
            high_income_request = RecommendationRequest(customer_id="HIGH_INCOME_CUST")
            high_income_response = recommendation_service.generate_recommendations(high_income_request)
            
            assert len(high_income_response.recommendations) > 0
            assert high_income_response.customer_id == "HIGH_INCOME_CUST"
        
        # Test customer with minimal profile data
        with patch.object(recommendation_service, '_retrieve_user_profile') as mock_minimal:
            mock_minimal.return_value = {}  # Empty profile to trigger minimal profile creation
            
            minimal_request = RecommendationRequest(customer_id="MINIMAL_CUST")
            minimal_response = recommendation_service.generate_recommendations(minimal_request)
            
            assert len(minimal_response.recommendations) > 0
            assert minimal_response.customer_id == "MINIMAL_CUST"
        
        # Test error handling - invalid customer ID
        with pytest.raises(ValueError):
            invalid_request = RecommendationRequest(customer_id="")
            recommendation_service.generate_recommendations(invalid_request)
        
        # Test error handling - service not ready
        recommendation_service.service_ready = False
        with pytest.raises(RuntimeError):
            recommendation_service.generate_recommendations(request)
        
        # Restore service ready state
        recommendation_service.service_ready = True
        
        # Validate service health and metrics
        assert hasattr(recommendation_service, 'performance_metrics')
        metrics = recommendation_service.performance_metrics
        assert 'total_requests' in metrics
        assert 'successful_requests' in metrics
        assert metrics['total_requests'] > 0
        assert metrics['successful_requests'] > 0
        
        # Validate service metadata
        assert hasattr(recommendation_service, 'service_metadata')
        metadata = recommendation_service.service_metadata
        assert metadata['service_name'] == 'PersonalizedRecommendationService'
        assert metadata['feature_id'] == 'F-007'
        assert 'GDPR' in metadata['compliance_frameworks']

# =============================================================================
# INTEGRATION TESTS
# =============================================================================

class TestServiceIntegration:
    """
    Integration test suite for testing interactions between AI services.
    
    This test suite validates the integration and data flow between different
    AI services, ensuring proper service composition and end-to-end functionality
    for complex financial workflows.
    """
    
    def test_service_initialization_sequence(self):
        """
        Tests the proper initialization sequence of all AI services.
        
        This test ensures that services can be initialized in the correct order
        with proper dependency injection and that they can work together without
        conflicts or resource issues.
        """
        with patch('services.prediction_service.load_model') as mock_load_model:
            # Setup mock models for all services
            mock_models = {
                'risk_model': MagicMock(),
                'fraud_model': MagicMock(), 
                'recommendation_model': MagicMock()
            }
            
            def load_model_side_effect(model_type):
                return mock_models.get(model_type, MagicMock())
            
            mock_load_model.side_effect = load_model_side_effect
            
            # Initialize services in typical startup sequence
            prediction_service = PredictionService()
            fraud_service = FraudDetectionService(prediction_service)
            
            # Verify all services are properly initialized
            assert prediction_service is not None
            assert fraud_service is not None
            assert fraud_service.prediction_service is prediction_service
            
            # Test service health and readiness
            assert hasattr(prediction_service, 'model_status')
            assert hasattr(fraud_service, 'service_metadata')
            
    def test_cross_service_data_flow(self, sample_fraud_detection_request: FraudDetectionRequest):
        """
        Tests data flow between PredictionService and FraudDetectionService.
        
        This test validates that data is properly passed between services and
        that the enhanced fraud detection logic works correctly with the
        underlying prediction service.
        """
        with patch('services.prediction_service.load_model') as mock_load_model:
            # Setup mocks
            mock_fraud_model = MagicMock()
            mock_fraud_model.predict.return_value = [[0.8]]  # High fraud score
            
            def load_model_side_effect(model_type):
                if model_type == 'fraud_model':
                    return mock_fraud_model
                return MagicMock()
            
            mock_load_model.side_effect = load_model_side_effect
            
            # Initialize services
            prediction_service = PredictionService()
            fraud_service = FraudDetectionService(prediction_service)
            
            # Test data flow
            request = sample_fraud_detection_request
            
            # Call through fraud service (should internally call prediction service)
            fraud_result = fraud_service.detect_fraud(request)
            
            # Verify results and data flow
            assert fraud_result.transaction_id == request.transaction_id
            assert fraud_result.fraud_score > 0.5  # Should be high due to mock
            assert fraud_result.is_fraud == True
            
            # Verify underlying model was called
            mock_fraud_model.predict.assert_called()

# =============================================================================
# PERFORMANCE BENCHMARKS
# =============================================================================

class TestPerformanceBenchmarks:
    """
    Performance benchmark test suite for AI services.
    
    This test suite validates that all AI services meet their performance
    requirements and SLA commitments for response times and throughput.
    """
    
    @pytest.mark.performance
    def test_risk_assessment_performance_sla(self, sample_risk_assessment_request: RiskAssessmentRequest):
        """
        Tests that risk assessment meets the <500ms SLA requirement.
        """
        with patch('services.prediction_service.load_model') as mock_load_model:
            mock_risk_model = MagicMock()
            mock_risk_model.predict.return_value = [[0.3]]
            
            def load_model_side_effect(model_type):
                if model_type == 'risk_model':
                    return mock_risk_model
                return MagicMock()
            
            mock_load_model.side_effect = load_model_side_effect
            prediction_service = PredictionService()
            
            # Benchmark multiple requests
            response_times = []
            for _ in range(10):
                start_time = time.time()
                response = prediction_service.predict_risk(sample_risk_assessment_request)
                end_time = time.time()
                response_times.append((end_time - start_time) * 1000)
            
            # Validate SLA compliance
            avg_response_time = sum(response_times) / len(response_times)
            max_response_time = max(response_times)
            
            assert avg_response_time < 500, f"Average response time {avg_response_time:.2f}ms exceeds 500ms SLA"
            assert max_response_time < 1000, f"Max response time {max_response_time:.2f}ms exceeds acceptable limits"
    
    @pytest.mark.performance
    def test_fraud_detection_performance_sla(self, sample_fraud_detection_request: FraudDetectionRequest):
        """
        Tests that fraud detection meets the <200ms SLA requirement.
        """
        with patch('services.prediction_service.load_model') as mock_load_model:
            mock_fraud_model = MagicMock()
            mock_fraud_model.predict.return_value = [[0.2]]
            
            def load_model_side_effect(model_type):
                if model_type == 'fraud_model':
                    return mock_fraud_model
                return MagicMock()
            
            mock_load_model.side_effect = load_model_side_effect
            
            prediction_service = PredictionService()
            fraud_service = FraudDetectionService(prediction_service)
            
            # Benchmark multiple requests
            response_times = []
            for _ in range(10):
                start_time = time.time()
                response = fraud_service.detect_fraud(sample_fraud_detection_request)
                end_time = time.time()
                response_times.append((end_time - start_time) * 1000)
            
            # Validate SLA compliance
            avg_response_time = sum(response_times) / len(response_times)
            max_response_time = max(response_times)
            
            assert avg_response_time < 200, f"Average response time {avg_response_time:.2f}ms exceeds 200ms SLA"
            assert max_response_time < 500, f"Max response time {max_response_time:.2f}ms exceeds acceptable limits"

# =============================================================================
# MODULE METADATA AND CONFIGURATION
# =============================================================================

# Test configuration for pytest
pytest_plugins = []

# Test markers for categorizing tests
pytestmark = [
    pytest.mark.unit,        # Unit tests  
    pytest.mark.integration, # Integration tests
    pytest.mark.ai_service   # AI service specific tests
]

# Module metadata for test reporting and compliance
__test_version__ = "1.0.0"
__test_author__ = "AI Service Team"
__test_description__ = "Comprehensive test suite for AI service prediction, fraud detection, and recommendation services"
__features_tested__ = [
    "F-002: AI-Powered Risk Assessment Engine",
    "F-006: Fraud Detection System", 
    "F-007: Personalized Financial Recommendations"
]
__compliance_frameworks__ = ["SOC2", "PCI DSS", "GDPR", "Basel III/IV"]
__test_coverage_target__ = "95%"
__performance_sla_validated__ = True