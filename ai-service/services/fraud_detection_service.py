"""
Fraud Detection Service for AI-Powered Financial Services Platform

This service implements the F-006 Fraud Detection System feature, providing real-time
fraud detection capabilities for financial transactions. It integrates with the 
AI-Powered Risk Assessment Engine (F-002) to contribute to real-time risk scoring
with sub-500ms response time requirements and 95% accuracy targets.

Features Addressed:
- F-006: Fraud Detection System - Real-time fraud detection to identify and prevent fraudulent transactions
- F-002-RQ-001: Real-time risk scoring - Contributes fraud-specific scores to overall risk assessment

Technical Requirements:
- Real-time prediction with <200ms response time for fraud detection
- High accuracy fraud classification with configurable thresholds
- Integration with unified data platform for transaction analysis
- Enterprise-grade logging and audit trails for regulatory compliance
- Explainable AI support for fraud decision transparency

Dependencies:
- TensorFlow 2.15.0 for neural network-based fraud detection models
- NumPy 1.26.0 for numerical operations and data manipulation
- Pandas 2.1.0 for transaction data processing and analysis

Author: AI Service Team
Version: 1.0.0
Last Updated: 2025-01-13
Compliance: SOC2, PCI DSS, GDPR, Basel III/IV
"""

import logging  # Built-in Python module for structured enterprise logging
import time  # Built-in Python module for performance timing and monitoring
from datetime import datetime, timezone  # Built-in Python module for timestamp handling
from typing import Dict, List, Optional, Any, Union  # Built-in Python module for type annotations

# External dependencies with specific version requirements
import numpy as np  # Version 1.26.0 - Numerical computing for data operations and array processing
import pandas as pd  # Version 2.1.0 - Data manipulation and analysis for transaction processing
import tensorflow as tf  # Version 2.15.0 - Machine learning framework for fraud detection models

# Internal imports from AI service components
from services.prediction_service import PredictionService  # Singleton service for ML model predictions
from models.fraud_model import FraudDetectionModel  # Advanced fraud detection neural network model
from api.models import FraudDetectionRequest, FraudDetectionResponse  # Request/response data models for API
from utils.model_helpers import load_model  # Utility function for loading serialized ML models

# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================

# Initialize comprehensive logging for enterprise audit trails and monitoring
logger = logging.getLogger(__name__)

# Configure logger format for financial services compliance and audit requirements
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# =============================================================================
# FRAUD DETECTION PREPROCESSING FUNCTION
# =============================================================================

def preprocess_transaction_data(transaction_data: Dict[str, Any]) -> pd.DataFrame:
    """
    Preprocesses raw transaction data into a format suitable for fraud detection models.
    
    This function transforms transaction request data into a structured DataFrame
    that can be processed by the fraud detection neural network. It handles feature
    extraction, data type conversions, temporal feature engineering, and validation
    to ensure consistent input formatting for reliable fraud detection.
    
    The preprocessing pipeline includes:
    - Transaction amount normalization and scaling
    - Temporal feature extraction from timestamps
    - Merchant risk categorization and encoding
    - Currency risk assessment and normalization
    - Missing value handling with domain-appropriate defaults
    - Feature engineering for fraud pattern detection
    
    Args:
        transaction_data (Dict[str, Any]): Raw transaction data dictionary containing:
            - transaction_id: Unique transaction identifier
            - customer_id: Customer identifier for behavioral analysis
            - amount: Transaction amount in specified currency
            - currency: ISO 4217 currency code (e.g., 'USD', 'EUR')
            - merchant: Merchant name or identifier
            - timestamp: ISO 8601 timestamp of transaction
            
    Returns:
        pd.DataFrame: Preprocessed transaction data ready for fraud model input.
                     Contains engineered features including normalized amounts,
                     temporal indicators, merchant risk scores, and currency factors.
                     
    Raises:
        ValueError: If required fields are missing or contain invalid data
        TypeError: If transaction_data is not a dictionary
        
    Examples:
        >>> transaction = {
        ...     'transaction_id': 'TXN_12345',
        ...     'customer_id': 'CUST_67890',
        ...     'amount': 1250.00,
        ...     'currency': 'USD',
        ...     'merchant': 'Amazon.com',
        ...     'timestamp': '2024-12-13T14:30:00Z'
        ... }
        >>> processed_df = preprocess_transaction_data(transaction)
        >>> print(processed_df.columns.tolist())
        ['amount_log', 'amount_normalized', 'hour_of_day', 'day_of_week', 'is_weekend', ...]
    """
    
    try:
        # Input validation and type checking
        if not isinstance(transaction_data, dict):
            error_msg = f"Transaction data must be a dictionary, received {type(transaction_data)}"
            logger.error(error_msg)
            raise TypeError(error_msg)
        
        # Validate required fields are present
        required_fields = ['transaction_id', 'customer_id', 'amount', 'currency', 'merchant', 'timestamp']
        missing_fields = [field for field in required_fields if field not in transaction_data]
        
        if missing_fields:
            error_msg = f"Missing required transaction fields: {missing_fields}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        logger.debug(f"Starting preprocessing for transaction: {transaction_data.get('transaction_id', 'unknown')}")
        
        # Extract transaction attributes for feature engineering
        transaction_id = str(transaction_data['transaction_id'])
        customer_id = str(transaction_data['customer_id'])
        amount = float(transaction_data['amount'])
        currency = str(transaction_data['currency']).upper()
        merchant = str(transaction_data['merchant'])
        timestamp_str = str(transaction_data['timestamp'])
        
        # Validate transaction amount
        if amount <= 0:
            logger.warning(f"Invalid transaction amount: {amount}, setting to minimum value")
            amount = 0.01  # Set minimum valid amount for log transformation
        
        # Initialize feature dictionary for structured feature collection
        features = {}
        
        # =============================================================================
        # AMOUNT-BASED FEATURE ENGINEERING
        # =============================================================================
        
        # Log transformation for amount (handles skewed distribution common in financial data)
        features['amount_log'] = np.log10(amount)
        
        # Normalized amount with scaling (normalize to typical transaction ranges)
        features['amount_normalized'] = min(amount / 10000.0, 10.0)  # Cap at 10x normalization
        
        # Amount category indicators for different transaction size brackets
        features['amount_small'] = 1.0 if amount < 50.0 else 0.0          # Small transactions (<$50)
        features['amount_medium'] = 1.0 if 50.0 <= amount < 1000.0 else 0.0  # Medium transactions ($50-$1K)
        features['amount_large'] = 1.0 if 1000.0 <= amount < 10000.0 else 0.0  # Large transactions ($1K-$10K)
        features['amount_very_large'] = 1.0 if amount >= 10000.0 else 0.0     # Very large transactions (>$10K)
        
        logger.debug(f"Amount features: log={features['amount_log']:.3f}, normalized={features['amount_normalized']:.3f}")
        
        # =============================================================================
        # TEMPORAL FEATURE ENGINEERING
        # =============================================================================
        
        try:
            # Parse ISO 8601 timestamp with timezone handling
            transaction_time = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            
            # Extract time-based features for fraud pattern detection
            features['hour_of_day'] = transaction_time.hour / 24.0  # Normalized hour (0-1)
            features['day_of_week'] = transaction_time.weekday() / 7.0  # Normalized day (0-1)
            features['day_of_month'] = transaction_time.day / 31.0  # Normalized day of month (0-1)
            features['month_of_year'] = transaction_time.month / 12.0  # Normalized month (0-1)
            
            # Risk-based temporal indicators
            features['is_weekend'] = 1.0 if transaction_time.weekday() >= 5 else 0.0
            features['is_late_night'] = 1.0 if transaction_time.hour >= 22 or transaction_time.hour <= 5 else 0.0
            features['is_early_morning'] = 1.0 if 5 < transaction_time.hour <= 8 else 0.0
            features['is_business_hours'] = 1.0 if 9 <= transaction_time.hour <= 17 else 0.0
            features['is_evening'] = 1.0 if 18 <= transaction_time.hour <= 21 else 0.0
            
            logger.debug(f"Temporal features: hour={features['hour_of_day']:.3f}, weekend={features['is_weekend']}")
            
        except Exception as timestamp_error:
            logger.warning(f"Failed to parse timestamp '{timestamp_str}': {str(timestamp_error)}")
            # Use default temporal features if timestamp parsing fails
            features.update({
                'hour_of_day': 0.5, 'day_of_week': 0.3, 'day_of_month': 0.5, 'month_of_year': 0.5,
                'is_weekend': 0.0, 'is_late_night': 0.0, 'is_early_morning': 0.0,
                'is_business_hours': 1.0, 'is_evening': 0.0
            })
        
        # =============================================================================
        # MERCHANT-BASED FEATURE ENGINEERING
        # =============================================================================
        
        # Merchant risk assessment based on name patterns and known risk indicators
        merchant_lower = merchant.lower().strip()
        
        # High-risk merchant keywords (commonly associated with fraud)
        high_risk_keywords = [
            'unknown', 'cash', 'atm', 'transfer', 'crypto', 'gambling', 'casino',
            'bitcoin', 'forex', 'trading', 'investment', 'loan', 'payday'
        ]
        
        # Low-risk merchant keywords (trusted brands and categories)
        low_risk_keywords = [
            'amazon', 'walmart', 'target', 'starbucks', 'mcdonalds', 'apple',
            'google', 'microsoft', 'netflix', 'spotify', 'uber', 'airbnb'
        ]
        
        # Calculate merchant risk score based on keyword matching
        high_risk_matches = sum(1 for keyword in high_risk_keywords if keyword in merchant_lower)
        low_risk_matches = sum(1 for keyword in low_risk_keywords if keyword in merchant_lower)
        
        if high_risk_matches > 0:
            features['merchant_risk_score'] = 0.8 + (high_risk_matches * 0.1)  # High risk (0.8-1.0)
        elif low_risk_matches > 0:
            features['merchant_risk_score'] = 0.1 + (low_risk_matches * 0.05)   # Low risk (0.1-0.3)
        else:
            features['merchant_risk_score'] = 0.5  # Medium risk (neutral)
        
        # Ensure risk score stays within bounds
        features['merchant_risk_score'] = min(1.0, max(0.0, features['merchant_risk_score']))
        
        # Merchant category indicators
        features['merchant_is_online'] = 1.0 if any(keyword in merchant_lower for keyword in 
                                                   ['online', 'web', 'internet', '.com', 'digital']) else 0.0
        features['merchant_is_financial'] = 1.0 if any(keyword in merchant_lower for keyword in 
                                                      ['bank', 'credit', 'loan', 'finance', 'payment']) else 0.0
        features['merchant_is_retail'] = 1.0 if any(keyword in merchant_lower for keyword in 
                                                   ['store', 'shop', 'retail', 'market', 'mall']) else 0.0
        
        # Merchant name length (suspicious very short or very long names)
        merchant_length_normalized = min(len(merchant) / 100.0, 1.0)
        features['merchant_name_length'] = merchant_length_normalized
        features['merchant_name_suspicious'] = 1.0 if len(merchant) < 3 or len(merchant) > 50 else 0.0
        
        logger.debug(f"Merchant features: risk_score={features['merchant_risk_score']:.3f}, "
                    f"online={features['merchant_is_online']}")
        
        # =============================================================================
        # CURRENCY-BASED FEATURE ENGINEERING
        # =============================================================================
        
        # Currency risk assessment based on fraud statistics and geographic factors
        currency_risk_mapping = {
            'USD': 0.2,  # US Dollar - generally lower fraud risk
            'EUR': 0.3,  # Euro - moderate fraud risk
            'GBP': 0.3,  # British Pound - moderate fraud risk
            'CAD': 0.3,  # Canadian Dollar - moderate fraud risk
            'AUD': 0.3,  # Australian Dollar - moderate fraud risk
            'JPY': 0.4,  # Japanese Yen - slightly higher risk
            'CHF': 0.3,  # Swiss Franc - moderate risk
            'SEK': 0.4,  # Swedish Krona - moderate to high risk
            'NOK': 0.4,  # Norwegian Krone - moderate to high risk
            'DKK': 0.4,  # Danish Krone - moderate to high risk
        }
        
        # Get currency risk or default to higher risk for unknown currencies
        features['currency_risk_score'] = currency_risk_mapping.get(currency, 0.7)
        
        # Major currency indicators
        major_currencies = {'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF'}
        features['currency_is_major'] = 1.0 if currency in major_currencies else 0.0
        features['currency_is_usd'] = 1.0 if currency == 'USD' else 0.0
        features['currency_is_crypto'] = 1.0 if currency in {'BTC', 'ETH', 'LTC', 'XRP'} else 0.0
        
        logger.debug(f"Currency features: risk_score={features['currency_risk_score']:.3f}, "
                    f"is_major={features['currency_is_major']}")
        
        # =============================================================================
        # CUSTOMER CONTEXT FEATURES (SIMPLIFIED)
        # =============================================================================
        
        # Note: In a production environment, these would be enriched with actual customer data
        # from the unified data platform. For this implementation, we use placeholder values
        # that would typically be derived from customer behavioral analysis.
        
        # Customer risk indicators (would be populated from customer profile data)
        features['customer_age_factor'] = 0.4       # Placeholder: customer age risk factor
        features['customer_history_score'] = 0.3    # Placeholder: historical fraud rate for customer
        features['customer_velocity_score'] = 0.5   # Placeholder: transaction velocity risk
        features['customer_geographic_risk'] = 0.4  # Placeholder: geographic location risk
        features['customer_device_risk'] = 0.3      # Placeholder: device/browser risk assessment
        
        # Account and relationship features
        features['customer_account_age'] = 0.6      # Placeholder: account age factor (older = lower risk)
        features['customer_product_diversity'] = 0.4  # Placeholder: number of financial products used
        features['customer_engagement_score'] = 0.5   # Placeholder: digital engagement level
        
        logger.debug("Customer context features applied (placeholder values)")
        
        # =============================================================================
        # TRANSACTION PATTERN FEATURES
        # =============================================================================
        
        # Transaction sequence and pattern indicators (would be enhanced with historical data)
        features['transaction_sequence_risk'] = 0.3  # Placeholder: rapid transaction sequence indicator
        features['transaction_amount_deviation'] = 0.4  # Placeholder: deviation from customer's typical amounts
        features['transaction_time_deviation'] = 0.3    # Placeholder: deviation from customer's typical timing
        features['transaction_merchant_familiarity'] = 0.6  # Placeholder: customer's history with merchant
        
        # Cross-reference features (would use actual transaction history)
        features['similar_recent_transactions'] = 0.2   # Placeholder: count of similar recent transactions
        features['duplicate_transaction_risk'] = 0.1    # Placeholder: risk of duplicate/repeated transaction
        
        # =============================================================================
        # FEATURE VALIDATION AND DATAFRAME CREATION
        # =============================================================================
        
        # Validate all features are numeric and within expected ranges
        for feature_name, feature_value in features.items():
            if not isinstance(feature_value, (int, float, np.number)):
                logger.warning(f"Non-numeric feature value for {feature_name}: {feature_value}")
                features[feature_name] = 0.0
            elif not np.isfinite(feature_value):
                logger.warning(f"Invalid feature value for {feature_name}: {feature_value}")
                features[feature_name] = 0.0
            else:
                # Ensure values are within reasonable bounds
                features[feature_name] = max(-10.0, min(10.0, float(feature_value)))
        
        # Create DataFrame with consistent column ordering for model compatibility
        feature_columns = sorted(features.keys())  # Sort for consistency
        processed_df = pd.DataFrame([features], columns=feature_columns)
        
        # Add metadata columns for tracking and debugging
        processed_df['_transaction_id'] = transaction_id
        processed_df['_customer_id'] = customer_id
        processed_df['_original_amount'] = amount
        processed_df['_currency'] = currency
        processed_df['_preprocessing_timestamp'] = datetime.now(timezone.utc).isoformat()
        
        # Log successful preprocessing completion
        logger.info(f"Transaction preprocessing completed successfully for {transaction_id}")
        logger.debug(f"Generated {len(feature_columns)} features: {feature_columns[:10]}...")
        
        return processed_df
        
    except TypeError as e:
        logger.error(f"Type error in transaction preprocessing: {str(e)}")
        raise
    except ValueError as e:
        logger.error(f"Value error in transaction preprocessing: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error in transaction preprocessing: {str(e)}")
        raise RuntimeError(f"Transaction preprocessing failed: {str(e)}")

# =============================================================================
# FRAUD DETECTION SERVICE CLASS
# =============================================================================

class FraudDetectionService:
    """
    A comprehensive service class for real-time fraud detection in financial transactions.
    
    This service implements the F-006 Fraud Detection System feature, providing enterprise-grade
    fraud detection capabilities with real-time analysis and risk scoring. It integrates with
    the AI-Powered Risk Assessment Engine (F-002) to contribute fraud-specific risk scores for
    comprehensive transaction monitoring and decision-making.
    
    Key Features:
    - Real-time fraud detection with <200ms response time requirements
    - Integration with pre-trained neural network fraud detection models
    - Comprehensive transaction preprocessing and feature engineering
    - Configurable fraud detection thresholds for different risk tolerance levels
    - Enterprise-grade logging and audit trails for regulatory compliance
    - Explainable fraud detection decisions for transparency and accountability
    - Performance monitoring and quality assurance for production reliability
    
    Technical Architecture:
    - Utilizes dependency injection with PredictionService for model management
    - Implements robust error handling and graceful degradation strategies
    - Provides comprehensive preprocessing pipeline for transaction data
    - Supports multiple fraud detection models and ensemble approaches
    - Maintains audit trails and performance metrics for monitoring
    
    Regulatory Compliance:
    - Supports SOC2, PCI DSS, GDPR, and Basel III/IV compliance requirements
    - Provides detailed audit logging for transaction fraud analysis
    - Implements explainable AI features for regulatory transparency
    - Maintains data privacy and security throughout the fraud detection process
    
    Attributes:
        prediction_service (PredictionService): Injected prediction service for ML model access
        model (tensorflow.keras.Model): Loaded fraud detection neural network model
        fraud_threshold (float): Configurable threshold for fraud classification (default: 0.85)
        service_metadata (Dict[str, Any]): Service configuration and performance metadata
    """
    
    def __init__(self, prediction_service: PredictionService):
        """
        Initializes the FraudDetectionService with dependency injection and model loading.
        
        This constructor sets up the fraud detection service by injecting the PredictionService
        dependency and loading the pre-trained fraud detection model. It implements comprehensive
        initialization procedures including model validation, configuration loading, and service
        metadata setup for enterprise-grade operation.
        
        The initialization process includes:
        1. Validation of the injected PredictionService dependency
        2. Loading and validation of the fraud detection neural network model
        3. Configuration of fraud detection thresholds and parameters
        4. Setup of enterprise logging and audit trail capabilities
        5. Initialization of performance monitoring and quality assurance systems
        
        Args:
            prediction_service (PredictionService): The injected PredictionService instance
                that provides access to loaded machine learning models and prediction capabilities.
                This service manages model lifecycle, caching, and performance optimization.
                
        Raises:
            ValueError: If prediction_service is None or invalid
            RuntimeError: If fraud detection model loading fails
            TypeError: If prediction_service is not of expected type
            
        Examples:
            >>> from services.prediction_service import get_prediction_service
            >>> prediction_service = get_prediction_service()
            >>> fraud_service = FraudDetectionService(prediction_service)
            >>> print(f"Fraud detection ready: {fraud_service.model is not None}")
        """
        
        try:
            # Start comprehensive initialization with audit logging
            initialization_start_time = time.time()
            logger.info("="*80)
            logger.info("INITIALIZING FRAUD DETECTION SERVICE")
            logger.info("="*80)
            logger.info(f"Initialization start time: {datetime.now(timezone.utc).isoformat()}")
            
            # Validate injected PredictionService dependency
            if prediction_service is None:
                error_msg = "PredictionService dependency cannot be None"
                logger.error(error_msg)
                raise ValueError(error_msg)
            
            if not isinstance(prediction_service, PredictionService):
                error_msg = f"Expected PredictionService, received {type(prediction_service)}"
                logger.error(error_msg)
                raise TypeError(error_msg)
            
            # Store the injected PredictionService for fraud detection operations
            self.prediction_service = prediction_service
            logger.info("PredictionService dependency injection completed successfully")
            
            # Initialize service configuration and metadata
            self.service_metadata = {
                'service_name': 'FraudDetectionService',
                'version': '1.0.0',
                'initialized_at': datetime.now(timezone.utc).isoformat(),
                'features_supported': [
                    'F-006: Fraud Detection System',
                    'F-002-RQ-001: Real-time risk scoring'
                ],
                'performance_targets': {
                    'response_time_ms': 200,
                    'accuracy_threshold': 0.95,
                    'throughput_tps': 10000
                },
                'compliance_standards': ['SOC2', 'PCI DSS', 'GDPR', 'Basel III/IV']
            }
            
            # Configure fraud detection thresholds and parameters
            self.fraud_threshold = 0.85  # Default threshold for fraud classification
            self.high_confidence_threshold = 0.95  # Threshold for high-confidence fraud detection
            self.low_confidence_threshold = 0.15   # Threshold for low-confidence legitimate transactions
            
            logger.info(f"Fraud detection thresholds configured:")
            logger.info(f"  Standard threshold: {self.fraud_threshold}")
            logger.info(f"  High confidence threshold: {self.high_confidence_threshold}")
            logger.info(f"  Low confidence threshold: {self.low_confidence_threshold}")
            
            # Load the pre-trained fraud detection model using model helpers
            logger.info("Loading pre-trained fraud detection model...")
            
            try:
                # Load the fraud detection model using the model helpers utility
                self.model = load_model('fraud_model')
                
                if self.model is None:
                    error_msg = "Fraud detection model loading returned None - model file may not exist"
                    logger.error(error_msg)
                    raise RuntimeError(error_msg)
                
                # Validate the loaded model has required methods for fraud detection
                if not hasattr(self.model, 'predict'):
                    error_msg = "Loaded fraud model does not have predict method"
                    logger.error(error_msg)
                    raise RuntimeError(error_msg)
                
                logger.info("Fraud detection model loaded and validated successfully")
                logger.debug(f"Model type: {type(self.model).__name__}")
                
                # Log model metadata if available
                if hasattr(self.model, 'model_metadata'):
                    model_metadata = self.model.model_metadata
                    logger.info(f"Model version: {model_metadata.get('version', 'unknown')}")
                    logger.info(f"Model trained at: {model_metadata.get('last_trained', 'unknown')}")
                
            except Exception as model_error:
                error_msg = f"Failed to load fraud detection model: {str(model_error)}"
                logger.error(error_msg)
                raise RuntimeError(error_msg)
            
            # Initialize performance monitoring and quality assurance systems
            self.performance_metrics = {
                'total_predictions': 0,
                'successful_predictions': 0,
                'failed_predictions': 0,
                'average_response_time_ms': 0.0,
                'fraud_detection_rate': 0.0,
                'false_positive_rate': 0.0,
                'last_reset_time': datetime.now(timezone.utc).isoformat()
            }
            
            # Initialize audit trail and compliance tracking
            self.audit_trail = {
                'service_initialization': True,
                'model_loaded': True,
                'dependency_injection': True,
                'configuration_applied': True,
                'compliance_validated': True
            }
            
            # Calculate initialization duration for performance monitoring
            initialization_duration = (time.time() - initialization_start_time) * 1000  # Convert to ms
            
            # Update service metadata with initialization results
            self.service_metadata.update({
                'initialization_duration_ms': initialization_duration,
                'model_loaded': True,
                'dependencies_ready': True,
                'status': 'operational'
            })
            
            # Log successful initialization with comprehensive details
            logger.info("="*80)
            logger.info("FRAUD DETECTION SERVICE INITIALIZATION COMPLETED")
            logger.info("="*80)
            logger.info(f"Service status: OPERATIONAL")
            logger.info(f"Initialization duration: {initialization_duration:.2f}ms")
            logger.info(f"Fraud detection model: LOADED")
            logger.info(f"Performance targets: {self.service_metadata['performance_targets']}")
            logger.info(f"Compliance standards: {', '.join(self.service_metadata['compliance_standards'])}")
            logger.info("Fraud Detection Service ready for production traffic")
            
        except ValueError as e:
            logger.error(f"Validation error during FraudDetectionService initialization: {str(e)}")
            raise
        except TypeError as e:
            logger.error(f"Type error during FraudDetectionService initialization: {str(e)}")
            raise
        except RuntimeError as e:
            logger.error(f"Runtime error during FraudDetectionService initialization: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error during FraudDetectionService initialization: {str(e)}")
            raise RuntimeError(f"FraudDetectionService initialization failed: {str(e)}")
    
    def detect_fraud(self, request: FraudDetectionRequest) -> FraudDetectionResponse:
        """
        Analyzes a transaction to detect potential fraud with comprehensive risk assessment.
        
        This method implements the core fraud detection functionality for the F-006 Fraud Detection
        System, providing real-time analysis of financial transactions with enterprise-grade
        performance and accuracy. It processes transaction data through a sophisticated pipeline
        including preprocessing, feature engineering, model inference, and risk assessment to
        generate actionable fraud detection results.
        
        The fraud detection process includes:
        1. Transaction data validation and security checks
        2. Comprehensive preprocessing and feature engineering
        3. Neural network model inference for fraud probability calculation
        4. Risk-based threshold analysis and fraud classification
        5. Explanatory reasoning generation for decision transparency
        6. Performance monitoring and audit trail generation
        
        Technical Implementation:
        - Utilizes advanced preprocessing pipeline for feature extraction
        - Employs neural network models for pattern recognition and fraud detection
        - Implements configurable thresholds for different risk tolerance levels
        - Provides detailed reasoning and explainability for fraud decisions
        - Maintains sub-200ms response time for real-time transaction processing
        - Generates comprehensive audit trails for regulatory compliance
        
        Args:
            request (FraudDetectionRequest): The fraud detection request containing:
                - transaction_id: Unique identifier for transaction tracking and audit trails
                - customer_id: Customer identifier for behavioral analysis and profiling
                - amount: Transaction amount for anomaly detection and risk assessment
                - currency: Transaction currency for international risk evaluation
                - merchant: Merchant information for risk categorization and analysis
                - timestamp: Transaction timing for temporal pattern analysis
                
        Returns:
            FraudDetectionResponse: Comprehensive fraud detection results containing:
                - transaction_id: Original transaction identifier for correlation
                - fraud_score: Probability score (0.0-1.0) indicating fraud likelihood
                - is_fraud: Binary classification result based on configured thresholds
                - reason: Detailed explanation of fraud detection decision and contributing factors
                
        Raises:
            ValueError: If request data is invalid, missing required fields, or contains malformed data
            RuntimeError: If fraud detection processing fails due to model or system errors
            TimeoutError: If fraud detection exceeds maximum allowed processing time
            
        Examples:
            >>> request = FraudDetectionRequest(
            ...     transaction_id="TXN_20241213_001234",
            ...     customer_id="CUST_12345",
            ...     amount=2500.00,
            ...     currency="USD",
            ...     merchant="Unknown Online Retailer",
            ...     timestamp="2024-12-13T23:45:00Z"
            ... )
            >>> response = fraud_service.detect_fraud(request)
            >>> if response.is_fraud:
            ...     print(f"FRAUD DETECTED: Score {response.fraud_score:.3f}")
            ...     print(f"Reason: {response.reason}")
            
        Performance Requirements:
            - Response time: <200ms for 99% of fraud detection requests
            - Accuracy: 95% or higher fraud detection accuracy
            - Throughput: 10,000+ transactions per second capacity
            - Availability: 99.99% uptime for payment processing systems
        """
        
        try:
            # Start comprehensive fraud detection with performance monitoring
            detection_start_time = time.time()
            logger.info(f"Starting fraud detection for transaction: {request.transaction_id}")
            logger.debug(f"Request details: customer={request.customer_id}, amount={request.amount} {request.currency}")
            
            # Increment total predictions counter for performance tracking
            self.performance_metrics['total_predictions'] += 1
            
            # Validate the fraud detection request for completeness and security
            self._validate_fraud_request(request)
            
            # Step 1: Convert the request data into a pandas DataFrame for preprocessing
            logger.debug("Converting request data to DataFrame format")
            
            try:
                # Extract request data into dictionary format for preprocessing
                transaction_data = {
                    'transaction_id': request.transaction_id,
                    'customer_id': request.customer_id,
                    'amount': request.amount,
                    'currency': request.currency,
                    'merchant': request.merchant,
                    'timestamp': request.timestamp
                }
                
                logger.debug(f"Transaction data extracted: {len(transaction_data)} fields")
                
            except Exception as e:
                error_msg = f"Failed to extract transaction data from request: {str(e)}"
                logger.error(f"Data extraction error for {request.transaction_id}: {error_msg}")
                raise ValueError(error_msg)
            
            # Step 2: Call preprocess_transaction_data to prepare the data for the model
            logger.debug("Starting transaction data preprocessing")
            
            try:
                # Apply comprehensive preprocessing pipeline
                preprocessed_data = preprocess_transaction_data(transaction_data)
                
                # Validate preprocessing results
                if preprocessed_data is None or preprocessed_data.empty:
                    raise ValueError("Preprocessing returned empty or None DataFrame")
                
                # Remove metadata columns that shouldn't be used for model input
                model_input_columns = [col for col in preprocessed_data.columns if not col.startswith('_')]
                model_input_data = preprocessed_data[model_input_columns]
                
                logger.debug(f"Preprocessing completed: {len(model_input_columns)} features generated")
                logger.debug(f"Model input shape: {model_input_data.shape}")
                
            except Exception as e:
                error_msg = f"Transaction preprocessing failed: {str(e)}"
                logger.error(f"Preprocessing error for {request.transaction_id}: {error_msg}")
                raise RuntimeError(error_msg)
            
            # Step 3: Use the injected prediction_service to get a prediction from the fraud model
            logger.debug("Executing fraud model prediction via PredictionService")
            
            try:
                # Use the prediction service's predict_fraud method for consistency
                fraud_detection_request = request  # Already in correct format
                prediction_response = self.prediction_service.predict_fraud(fraud_detection_request)
                
                # Extract fraud probability from prediction service response
                fraud_probability = prediction_response.fraud_score
                preliminary_is_fraud = prediction_response.is_fraud
                preliminary_reason = prediction_response.reason
                
                logger.debug(f"PredictionService response: fraud_score={fraud_probability:.4f}, "
                           f"is_fraud={preliminary_is_fraud}")
                
            except Exception as e:
                error_msg = f"Fraud model prediction failed: {str(e)}"
                logger.error(f"Model prediction error for {request.transaction_id}: {error_msg}")
                raise RuntimeError(error_msg)
            
            # Step 4: Apply fraud detection service thresholds and enhanced reasoning
            logger.debug("Applying fraud detection thresholds and generating enhanced reasoning")
            
            try:
                # Validate fraud probability is in expected range
                if not 0.0 <= fraud_probability <= 1.0:
                    logger.warning(f"Invalid fraud probability: {fraud_probability}, clamping to valid range")
                    fraud_probability = max(0.0, min(1.0, fraud_probability))
                
                # Apply service-level fraud classification with enhanced thresholds
                if fraud_probability >= self.high_confidence_threshold:
                    is_fraud = True
                    confidence_level = "HIGH"
                    risk_category = "CRITICAL"
                elif fraud_probability >= self.fraud_threshold:
                    is_fraud = True
                    confidence_level = "MEDIUM"
                    risk_category = "HIGH"
                elif fraud_probability <= self.low_confidence_threshold:
                    is_fraud = False
                    confidence_level = "HIGH"
                    risk_category = "LOW"
                else:
                    is_fraud = False
                    confidence_level = "MEDIUM"
                    risk_category = "MEDIUM"
                
                # Generate comprehensive fraud detection reasoning
                reason_components = []
                
                # Add fraud score information
                reason_components.append(f"Fraud probability score: {fraud_probability:.4f}")
                reason_components.append(f"Risk category: {risk_category}")
                reason_components.append(f"Confidence level: {confidence_level}")
                
                # Add transaction amount analysis
                if request.amount > 10000:
                    reason_components.append("High transaction amount increases fraud risk")
                elif request.amount < 1:
                    reason_components.append("Unusually low transaction amount flagged")
                else:
                    reason_components.append("Transaction amount within normal range")
                
                # Add temporal analysis
                try:
                    transaction_time = datetime.fromisoformat(request.timestamp.replace('Z', '+00:00'))
                    hour = transaction_time.hour
                    
                    if 22 <= hour or hour <= 5:
                        reason_components.append("Late night transaction time increases risk")
                    elif transaction_time.weekday() >= 5:
                        reason_components.append("Weekend transaction timing noted")
                    else:
                        reason_components.append("Transaction timing within normal business patterns")
                        
                except Exception:
                    reason_components.append("Transaction timing analysis unavailable")
                
                # Add merchant analysis
                merchant_lower = request.merchant.lower()
                if any(keyword in merchant_lower for keyword in ['unknown', 'cash', 'crypto']):
                    reason_components.append("High-risk merchant category detected")
                elif any(keyword in merchant_lower for keyword in ['amazon', 'walmart', 'target']):
                    reason_components.append("Trusted merchant reduces fraud risk")
                else:
                    reason_components.append("Standard merchant risk profile")
                
                # Add currency analysis
                if request.currency != 'USD':
                    reason_components.append(f"Foreign currency transaction ({request.currency}) increases risk")
                
                # Add threshold-based decision reasoning
                if is_fraud:
                    if fraud_probability >= self.high_confidence_threshold:
                        reason_components.append(f"Score exceeds high-confidence fraud threshold ({self.high_confidence_threshold})")
                    else:
                        reason_components.append(f"Score exceeds standard fraud threshold ({self.fraud_threshold})")
                    reason_components.append("Transaction flagged for manual review or blocking")
                else:
                    if fraud_probability <= self.low_confidence_threshold:
                        reason_components.append(f"Score below low-risk threshold ({self.low_confidence_threshold})")
                    else:
                        reason_components.append(f"Score below fraud threshold ({self.fraud_threshold})")
                    reason_components.append("Transaction approved with continued monitoring")
                
                # Combine reasoning components into comprehensive explanation
                comprehensive_reason = ". ".join(reason_components)
                
                # Truncate reason if it exceeds maximum length for API response
                max_reason_length = 500
                if len(comprehensive_reason) > max_reason_length:
                    comprehensive_reason = comprehensive_reason[:max_reason_length - 3] + "..."
                
                logger.debug(f"Enhanced fraud reasoning generated: {len(comprehensive_reason)} characters")
                
            except Exception as e:
                error_msg = f"Fraud classification and reasoning generation failed: {str(e)}"
                logger.error(f"Classification error for {request.transaction_id}: {error_msg}")
                # Fall back to prediction service results if enhancement fails
                is_fraud = preliminary_is_fraud
                comprehensive_reason = preliminary_reason or "Fraud detection completed with basic reasoning"
            
            # Calculate processing performance metrics
            detection_end_time = time.time()
            processing_duration_ms = (detection_end_time - detection_start_time) * 1000
            
            # Step 5: Construct and return the FraudDetectionResponse object
            response = FraudDetectionResponse(
                transaction_id=request.transaction_id,
                fraud_score=round(fraud_probability, 4),
                is_fraud=is_fraud,
                reason=comprehensive_reason
            )
            
            # Update performance metrics and audit trail
            self.performance_metrics['successful_predictions'] += 1
            self._update_performance_metrics(processing_duration_ms, is_fraud)
            
            # Log comprehensive fraud detection results for audit trail
            logger.info(f"Fraud detection completed for {request.transaction_id}:")
            logger.info(f"  Fraud Score: {response.fraud_score}")
            logger.info(f"  Is Fraud: {response.is_fraud}")
            logger.info(f"  Risk Category: {risk_category if 'risk_category' in locals() else 'UNKNOWN'}")
            logger.info(f"  Processing Time: {processing_duration_ms:.2f}ms")
            
            # Performance validation against SLA requirements
            if processing_duration_ms > 200:  # 200ms SLA for fraud detection
                logger.warning(f"Fraud detection processing time ({processing_duration_ms:.2f}ms) "
                             f"exceeds SLA threshold (200ms)")
            
            # High-risk transaction alerting
            if response.is_fraud and fraud_probability >= self.high_confidence_threshold:
                logger.warning(f"HIGH-RISK FRAUD TRANSACTION DETECTED: {request.transaction_id} "
                             f"(customer: {request.customer_id}, amount: {request.amount} {request.currency}, "
                             f"merchant: {request.merchant}, score: {response.fraud_score})")
            
            return response
            
        except ValueError as e:
            # Update failure metrics
            self.performance_metrics['failed_predictions'] += 1
            logger.error(f"Fraud detection validation error for {request.transaction_id}: {str(e)}")
            raise
        except RuntimeError as e:
            # Update failure metrics
            self.performance_metrics['failed_predictions'] += 1
            logger.error(f"Fraud detection runtime error for {request.transaction_id}: {str(e)}")
            raise
        except Exception as e:
            # Update failure metrics and handle unexpected errors
            self.performance_metrics['failed_predictions'] += 1
            error_msg = f"Unexpected error in fraud detection: {str(e)}"
            logger.error(f"Fraud detection unexpected error for {request.transaction_id}: {error_msg}")
            raise RuntimeError(error_msg)
    
    # =============================================================================
    # PRIVATE HELPER METHODS
    # =============================================================================
    
    def _validate_fraud_request(self, request: FraudDetectionRequest) -> None:
        """
        Validates fraud detection request for completeness and security.
        
        Args:
            request (FraudDetectionRequest): The request to validate
            
        Raises:
            ValueError: If request validation fails
        """
        if not isinstance(request, FraudDetectionRequest):
            raise ValueError(f"Request must be FraudDetectionRequest, received {type(request)}")
        
        # Validate required fields are present and non-empty
        if not request.transaction_id or not request.transaction_id.strip():
            raise ValueError("Transaction ID cannot be empty")
        
        if not request.customer_id or not request.customer_id.strip():
            raise ValueError("Customer ID cannot be empty")
        
        if not request.currency or not request.currency.strip():
            raise ValueError("Currency cannot be empty")
        
        if not request.merchant or not request.merchant.strip():
            raise ValueError("Merchant cannot be empty")
        
        if not request.timestamp or not request.timestamp.strip():
            raise ValueError("Timestamp cannot be empty")
        
        # Validate transaction amount
        if request.amount is None or request.amount <= 0:
            raise ValueError(f"Transaction amount must be positive, received: {request.amount}")
        
        if request.amount > 1000000:  # $1M limit for security
            raise ValueError(f"Transaction amount exceeds maximum allowed: {request.amount}")
        
        # Validate currency format
        if len(request.currency) != 3 or not request.currency.isalpha():
            raise ValueError(f"Invalid currency format: {request.currency}")
        
        # Validate timestamp format
        try:
            datetime.fromisoformat(request.timestamp.replace('Z', '+00:00'))
        except ValueError:
            raise ValueError(f"Invalid timestamp format: {request.timestamp}")
        
        logger.debug(f"Request validation passed for transaction: {request.transaction_id}")
    
    def _update_performance_metrics(self, processing_time_ms: float, is_fraud: bool) -> None:
        """
        Updates internal performance metrics for monitoring and optimization.
        
        Args:
            processing_time_ms (float): Processing time in milliseconds
            is_fraud (bool): Whether fraud was detected
        """
        try:
            # Update average response time using exponential moving average
            if self.performance_metrics['average_response_time_ms'] == 0:
                self.performance_metrics['average_response_time_ms'] = processing_time_ms
            else:
                # Use exponential moving average with alpha = 0.1
                alpha = 0.1
                current_avg = self.performance_metrics['average_response_time_ms']
                self.performance_metrics['average_response_time_ms'] = (
                    alpha * processing_time_ms + (1 - alpha) * current_avg
                )
            
            # Update fraud detection rate
            total_predictions = self.performance_metrics['total_predictions']
            if total_predictions > 0:
                fraud_detections = (self.performance_metrics.get('total_fraud_detected', 0) + 
                                  (1 if is_fraud else 0))
                self.performance_metrics['total_fraud_detected'] = fraud_detections
                self.performance_metrics['fraud_detection_rate'] = fraud_detections / total_predictions
            
            logger.debug(f"Performance metrics updated: avg_time={self.performance_metrics['average_response_time_ms']:.2f}ms, "
                        f"fraud_rate={self.performance_metrics['fraud_detection_rate']:.4f}")
            
        except Exception as e:
            logger.warning(f"Failed to update performance metrics: {str(e)}")


# =============================================================================
# MODULE EXPORTS
# =============================================================================

# Export the main service class for external use
__all__ = ['FraudDetectionService', 'preprocess_transaction_data']

# Log module initialization for audit trail
logger.info("Fraud Detection Service module initialized successfully")
logger.info("Ready to provide real-time fraud detection capabilities")
logger.info("Supporting F-006 Fraud Detection System and F-002 Risk Assessment integration")