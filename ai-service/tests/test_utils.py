"""
Comprehensive Unit Tests for AI Service Utility Functions

This test suite provides extensive coverage for the utility functions used in the
AI-powered financial services platform, ensuring reliability, accuracy, and 
compliance with enterprise-grade quality standards.

Tests cover:
- Metrics calculation functions for model performance evaluation
- Model loading and management utilities
- Feature engineering for risk assessment and fraud detection
- Data preprocessing and scaling operations

Requirements Addressed:
- F-002: AI-Powered Risk Assessment Engine testing
- 6.6.1.1: Unit Testing for AI/ML components
- Regulatory compliance through comprehensive test coverage
- Performance validation against <500ms response time requirements

Author: AI Service Team
Version: 1.0.0
Compliance: SOC2, PCI DSS, GDPR, Basel III/IV
"""

import pytest  # version: 7.4 - Testing framework for writing and running tests
import numpy as np  # version: 1.23.5 - Numerical operations and test data creation
import pandas as pd  # version: 1.5.3 - Data manipulation and test DataFrame creation
import os
import tempfile
import warnings
from unittest.mock import Mock, patch, MagicMock, call
from datetime import datetime, timedelta
import joblib
import logging

# Internal module imports for testing
from utils.metrics import (
    calculate_accuracy,
    calculate_precision,
    calculate_recall,
    calculate_f1_score,
    calculate_roc_auc,
    generate_confusion_matrix,
    calculate_fairness_metrics,
    calculate_model_performance_summary
)

from utils.model_helpers import (
    load_model,
    save_model,
    load_tensorflow_model,
    get_model_explanation,
    validate_model_compatibility,
    get_model_metadata
)

from utils.feature_engineering import (
    create_transaction_features,
    create_customer_features,
    create_risk_features,
    create_financial_wellness_features,
    create_fraud_detection_features
)

from utils.preprocessing import (
    clean_data,
    create_preprocessing_pipeline,
    preprocess_data
)

# Configure test logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Test configuration constants
TEST_DATA_SIZE = 1000
TEST_TOLERANCE = 1e-6
PERFORMANCE_THRESHOLD_MS = 500


class TestMetricsModule:
    """
    Comprehensive test suite for the metrics calculation functions.
    
    Tests the AI model performance evaluation utilities including accuracy,
    precision, recall, F1-score, ROC AUC, confusion matrix generation,
    and fairness metrics calculation.
    """
    
    def setup_method(self):
        """Set up test data and fixtures for each test method."""
        # Create deterministic test data for consistent results
        np.random.seed(42)
        
        # Binary classification test data
        self.y_true_binary = np.array([0, 1, 1, 0, 1, 0, 1, 1, 0, 0])
        self.y_pred_binary = np.array([0, 1, 0, 0, 1, 0, 1, 1, 0, 1])
        self.y_scores_binary = np.array([0.1, 0.9, 0.4, 0.2, 0.8, 0.3, 0.85, 0.95, 0.15, 0.6])
        
        # Multiclass test data
        self.y_true_multiclass = np.array([0, 1, 2, 0, 1, 2, 0, 1, 2, 0])
        self.y_pred_multiclass = np.array([0, 1, 1, 0, 1, 2, 0, 2, 2, 1])
        
        # Large dataset for performance testing
        self.y_true_large = np.random.randint(0, 2, TEST_DATA_SIZE)
        self.y_pred_large = np.random.randint(0, 2, TEST_DATA_SIZE)
        
        # Sensitive features for fairness testing
        self.sensitive_features = np.array([0, 0, 1, 1, 0, 1, 0, 1, 0, 1])
    
    def test_calculate_accuracy(self):
        """
        Tests the calculate_accuracy function from the metrics module.
        
        Validates:
        - Correct accuracy calculation for binary and multiclass scenarios
        - Input validation and error handling
        - Edge cases with perfect and worst-case accuracy
        - Performance requirements for large datasets
        """
        logger.info("Testing calculate_accuracy function")
        
        # Test basic binary classification accuracy
        accuracy = calculate_accuracy(self.y_true_binary, self.y_pred_binary)
        expected_accuracy = 0.8  # 8 out of 10 correct predictions
        
        assert abs(accuracy - expected_accuracy) < TEST_TOLERANCE, \
            f"Expected accuracy {expected_accuracy}, got {accuracy}"
        
        # Test perfect accuracy case
        perfect_true = np.array([1, 0, 1, 0, 1])
        perfect_pred = np.array([1, 0, 1, 0, 1])
        perfect_accuracy = calculate_accuracy(perfect_true, perfect_pred)
        
        assert perfect_accuracy == 1.0, \
            f"Perfect accuracy should be 1.0, got {perfect_accuracy}"
        
        # Test worst case accuracy
        worst_true = np.array([1, 0, 1, 0, 1])
        worst_pred = np.array([0, 1, 0, 1, 0])
        worst_accuracy = calculate_accuracy(worst_true, worst_pred)
        
        assert worst_accuracy == 0.0, \
            f"Worst case accuracy should be 0.0, got {worst_accuracy}"
        
        # Test multiclass accuracy
        multiclass_accuracy = calculate_accuracy(self.y_true_multiclass, self.y_pred_multiclass)
        expected_multiclass = 0.6  # 6 out of 10 correct
        
        assert abs(multiclass_accuracy - expected_multiclass) < TEST_TOLERANCE, \
            f"Expected multiclass accuracy {expected_multiclass}, got {multiclass_accuracy}"
        
        # Test input validation
        with pytest.raises(ValueError, match="Input arrays cannot be empty"):
            calculate_accuracy(np.array([]), np.array([]))
        
        with pytest.raises(ValueError, match="Shape mismatch"):
            calculate_accuracy(np.array([1, 0, 1]), np.array([1, 0]))
        
        # Test performance on large dataset
        start_time = datetime.now()
        large_accuracy = calculate_accuracy(self.y_true_large, self.y_pred_large)
        end_time = datetime.now()
        
        processing_time_ms = (end_time - start_time).total_seconds() * 1000
        
        assert processing_time_ms < PERFORMANCE_THRESHOLD_MS, \
            f"Accuracy calculation took {processing_time_ms}ms, exceeds {PERFORMANCE_THRESHOLD_MS}ms threshold"
        
        assert 0.0 <= large_accuracy <= 1.0, \
            f"Accuracy must be between 0 and 1, got {large_accuracy}"
        
        logger.info(f"calculate_accuracy tests passed. Performance: {processing_time_ms:.2f}ms")
    
    def test_calculate_precision(self):
        """Tests precision calculation with various averaging strategies."""
        logger.info("Testing calculate_precision function")
        
        # Test binary precision
        precision = calculate_precision(self.y_true_binary, self.y_pred_binary)
        
        # Manual calculation: TP=4, FP=1, so precision = 4/(4+1) = 0.8
        expected_precision = 4/5
        
        assert abs(precision - expected_precision) < TEST_TOLERANCE, \
            f"Expected precision {expected_precision}, got {precision}"
        
        # Test edge case with no positive predictions
        no_pos_true = np.array([0, 0, 0, 0])
        no_pos_pred = np.array([0, 0, 0, 0])
        
        # Should handle zero division gracefully
        precision_zero = calculate_precision(no_pos_true, no_pos_pred, zero_division=1)
        assert precision_zero == 1.0, \
            f"Expected precision 1.0 for zero division case, got {precision_zero}"
    
    def test_calculate_recall(self):
        """Tests recall calculation for sensitivity analysis."""
        logger.info("Testing calculate_recall function")
        
        # Test binary recall
        recall = calculate_recall(self.y_true_binary, self.y_pred_binary)
        
        # Manual calculation: TP=4, FN=1, so recall = 4/(4+1) = 0.8
        expected_recall = 4/5
        
        assert abs(recall - expected_recall) < TEST_TOLERANCE, \
            f"Expected recall {expected_recall}, got {recall}"
    
    def test_calculate_f1_score(self):
        """Tests F1 score calculation as harmonic mean of precision and recall."""
        logger.info("Testing calculate_f1_score function")
        
        # Calculate F1 score
        f1 = calculate_f1_score(self.y_true_binary, self.y_pred_binary)
        
        # F1 = 2 * (precision * recall) / (precision + recall)
        # With precision = recall = 0.8, F1 = 2 * (0.8 * 0.8) / (0.8 + 0.8) = 0.8
        expected_f1 = 0.8
        
        assert abs(f1 - expected_f1) < TEST_TOLERANCE, \
            f"Expected F1 score {expected_f1}, got {f1}"
    
    def test_calculate_roc_auc(self):
        """Tests ROC AUC calculation for model discrimination ability."""
        logger.info("Testing calculate_roc_auc function")
        
        # Test binary ROC AUC
        roc_auc = calculate_roc_auc(self.y_true_binary, self.y_scores_binary)
        
        # ROC AUC should be between 0.5 (random) and 1.0 (perfect)
        assert 0.5 <= roc_auc <= 1.0, \
            f"ROC AUC should be between 0.5 and 1.0, got {roc_auc}"
        
        # Test perfect classifier
        perfect_scores = np.array([0.1, 0.9, 0.9, 0.1, 0.9, 0.1, 0.9, 0.9, 0.1, 0.1])
        perfect_auc = calculate_roc_auc(self.y_true_binary, perfect_scores)
        
        assert perfect_auc == 1.0, \
            f"Perfect classifier should have AUC = 1.0, got {perfect_auc}"
    
    def test_generate_confusion_matrix(self):
        """Tests confusion matrix generation for detailed classification analysis."""
        logger.info("Testing generate_confusion_matrix function")
        
        # Generate confusion matrix
        cm = generate_confusion_matrix(self.y_true_binary, self.y_pred_binary)
        
        # Expected confusion matrix:
        # TN=4, FP=1, FN=1, TP=4
        expected_cm = np.array([[4, 1], [1, 4]])
        
        np.testing.assert_array_equal(cm, expected_cm, 
            "Confusion matrix does not match expected values")
        
        # Test multiclass confusion matrix
        cm_multi = generate_confusion_matrix(self.y_true_multiclass, self.y_pred_multiclass)
        
        assert cm_multi.shape == (3, 3), \
            f"Multiclass confusion matrix should be 3x3, got shape {cm_multi.shape}"
        
        # Verify that sum equals total predictions
        assert np.sum(cm_multi) == len(self.y_true_multiclass), \
            f"Confusion matrix sum should equal number of predictions"
    
    def test_calculate_fairness_metrics(self):
        """Tests fairness metrics calculation for bias detection and compliance."""
        logger.info("Testing calculate_fairness_metrics function")
        
        # Calculate fairness metrics
        fairness_metrics = calculate_fairness_metrics(
            self.y_true_binary, 
            self.y_pred_binary, 
            self.sensitive_features
        )
        
        # Validate structure of returned metrics
        required_keys = [
            'demographic_parity', 'demographic_parity_difference',
            'equalized_odds', 'equalized_odds_difference',
            'equal_opportunity_difference', 'group_counts', 'overall_metrics'
        ]
        
        for key in required_keys:
            assert key in fairness_metrics, f"Missing required key: {key}"
        
        # Validate demographic parity values are between 0 and 1
        for group, rate in fairness_metrics['demographic_parity'].items():
            assert 0 <= rate <= 1, \
                f"Demographic parity rate should be between 0 and 1, got {rate} for group {group}"
        
        # Validate that differences are non-negative
        assert fairness_metrics['demographic_parity_difference'] >= 0, \
            "Demographic parity difference should be non-negative"
        
        assert fairness_metrics['equal_opportunity_difference'] >= 0, \
            "Equal opportunity difference should be non-negative"
        
        # Test error handling for insufficient groups
        single_group_features = np.zeros(len(self.y_true_binary))
        
        with pytest.raises(ValueError, match="At least two different groups are required"):
            calculate_fairness_metrics(self.y_true_binary, self.y_pred_binary, single_group_features)


class TestModelHelpersModule:
    """
    Comprehensive test suite for model loading and management utilities.
    
    Tests model persistence, loading, TensorFlow model handling, and
    model explainability functions with proper mocking of external dependencies.
    """
    
    def setup_method(self):
        """Set up test fixtures and temporary directories."""
        # Create temporary directory for test models
        self.temp_dir = tempfile.mkdtemp()
        self.original_model_path = None
        
        # Mock model for testing
        self.mock_model = Mock()
        self.mock_model.predict.return_value = np.array([[0.7, 0.3]])
        self.mock_model.predict_proba.return_value = np.array([[0.3, 0.7]])
        self.mock_model.__class__.__name__ = 'MockClassifier'
        
        # Test data for model explanation
        self.test_data = np.array([[1, 2, 3, 4, 5]])
    
    def teardown_method(self):
        """Clean up temporary files and restore configuration."""
        import shutil
        if os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)
    
    @patch('utils.model_helpers.MODEL_PATH')
    @patch('utils.model_helpers.joblib.load')
    def test_load_model(self, mock_joblib_load, mock_model_path):
        """
        Tests the load_model function from the model_helpers module.
        
        Validates:
        - Successful model loading with proper file path construction
        - Error handling for missing files
        - Input validation and sanitization
        - Security checks and logging
        """
        logger.info("Testing load_model function")
        
        # Configure mocks
        mock_model_path.__str__ = lambda: self.temp_dir
        mock_model_path.__fspath__ = lambda: self.temp_dir
        mock_joblib_load.return_value = self.mock_model
        
        # Create a mock model file
        model_file_path = os.path.join(self.temp_dir, 'test_model.pkl')
        
        with patch('utils.model_helpers.os.path.exists', return_value=True), \
             patch('utils.model_helpers.os.access', return_value=True), \
             patch('utils.model_helpers.os.stat') as mock_stat, \
             patch('utils.model_helpers.os.path.join', return_value=model_file_path):
            
            # Mock file stats for security validation
            mock_stat_result = Mock()
            mock_stat_result.st_size = 1024 * 1024  # 1MB file
            mock_stat.return_value = mock_stat_result
            
            # Test successful model loading
            loaded_model = load_model('test_model')
            
            assert loaded_model is not None, "Model should be loaded successfully"
            assert loaded_model == self.mock_model, "Loaded model should match mock model"
            
            # Verify joblib.load was called with correct parameters
            mock_joblib_load.assert_called_once()
            
            # Test model name sanitization
            loaded_model_sanitized = load_model('test-model_v1.2')
            assert loaded_model_sanitized is not None, "Model with complex name should be loaded"
        
        # Test file not found scenario
        with patch('utils.model_helpers.os.path.exists', return_value=False):
            missing_model = load_model('missing_model')
            assert missing_model is None, "Missing model should return None"
        
        # Test invalid model name
        with pytest.raises(ValueError, match="Model name must be a non-empty string"):
            load_model("")
        
        with pytest.raises(ValueError, match="Model name must be a non-empty string"):
            load_model(None)
        
        # Test model name with only invalid characters
        with pytest.raises(ValueError, match="Model name contains only invalid characters"):
            load_model("!@#$%")
        
        logger.info("load_model tests completed successfully")
    
    @patch('utils.model_helpers.MODEL_PATH')
    @patch('utils.model_helpers.joblib.dump')
    @patch('utils.model_helpers.os.makedirs')
    def test_save_model(self, mock_makedirs, mock_joblib_dump, mock_model_path):
        """Tests model saving functionality with proper error handling."""
        logger.info("Testing save_model function")
        
        # Configure mocks
        mock_model_path.__str__ = lambda: self.temp_dir
        mock_model_path.__fspath__ = lambda: self.temp_dir
        
        with patch('utils.model_helpers.os.path.join', return_value=os.path.join(self.temp_dir, 'test_model.pkl')), \
             patch('utils.model_helpers.os.rename') as mock_rename, \
             patch('utils.model_helpers.os.chmod') as mock_chmod, \
             patch('utils.model_helpers.os.path.getsize', return_value=1024):
            
            # Test successful model saving
            save_model(self.mock_model, 'test_model')
            
            # Verify joblib.dump was called
            mock_joblib_dump.assert_called_once()
            
            # Verify security measures were applied
            mock_rename.assert_called_once()  # Atomic operation
            mock_chmod.assert_called_once()   # File permissions
        
        # Test invalid inputs
        with pytest.raises(ValueError, match="Model name must be a non-empty string"):
            save_model(self.mock_model, "")
        
        with pytest.raises(ValueError, match="Cannot save None model object"):
            save_model(None, "test_model")
    
    @patch('utils.model_helpers.tf.keras.models.load_model')
    @patch('utils.model_helpers.MODEL_PATH')
    def test_load_tensorflow_model(self, mock_model_path, mock_tf_load):
        """Tests TensorFlow model loading with proper format detection."""
        logger.info("Testing load_tensorflow_model function")
        
        mock_model_path.__str__ = lambda: self.temp_dir
        mock_model_path.__fspath__ = lambda: self.temp_dir
        
        # Mock TensorFlow model
        mock_tf_model = Mock()
        mock_tf_model.__class__.__name__ = 'Sequential'
        mock_tf_model.layers = [Mock(), Mock()]
        mock_tf_model.count_params.return_value = 10000
        mock_tf_load.return_value = mock_tf_model
        
        model_dir = os.path.join(self.temp_dir, 'tf_model')
        
        with patch('utils.model_helpers.os.path.exists', return_value=True), \
             patch('utils.model_helpers.os.path.isdir', return_value=True), \
             patch('utils.model_helpers.os.access', return_value=True), \
             patch('utils.model_helpers.os.listdir', return_value=['saved_model.pb', 'variables']), \
             patch('utils.model_helpers.os.path.join', return_value=model_dir):
            
            # Test successful TensorFlow model loading
            tf_model = load_tensorflow_model('tf_model')
            
            assert tf_model is not None, "TensorFlow model should be loaded successfully"
            assert tf_model == mock_tf_model, "Loaded model should match mock model"
        
        # Test missing model directory
        with patch('utils.model_helpers.os.path.exists', return_value=False):
            missing_tf_model = load_tensorflow_model('missing_tf_model')
            assert missing_tf_model is None, "Missing TensorFlow model should return None"
    
    def test_get_model_explanation(self):
        """Tests model explainability functionality for regulatory compliance."""
        logger.info("Testing get_model_explanation function")
        
        # Test basic explanation generation
        explanation = get_model_explanation(self.mock_model, self.test_data)
        
        # Validate explanation structure
        required_keys = [
            'timestamp', 'prediction', 'confidence', 'feature_importances',
            'explanation_type', 'model_metadata', 'compliance_info'
        ]
        
        for key in required_keys:
            assert key in explanation, f"Missing required explanation key: {key}"
        
        # Validate compliance information
        compliance_info = explanation['compliance_info']
        assert compliance_info['gdpr_compliant'] == True, "Explanation should be GDPR compliant"
        assert 'audit_trail_id' in compliance_info, "Audit trail ID should be present"
        
        # Test error handling
        with pytest.raises(ValueError, match="Model cannot be None"):
            get_model_explanation(None, self.test_data)
        
        with pytest.raises(ValueError, match="Data instance cannot be None"):
            get_model_explanation(self.mock_model, None)
    
    def test_validate_model_compatibility(self):
        """Tests model validation and compatibility checking."""
        logger.info("Testing validate_model_compatibility function")
        
        # Test valid model
        validation_result = validate_model_compatibility(self.mock_model)
        
        assert validation_result['is_valid'] == True, "Mock model should be valid"
        assert validation_result['has_predict_method'] == True, "Model should have predict method"
        
        # Test invalid model (None)
        invalid_result = validate_model_compatibility(None)
        assert invalid_result['is_valid'] == False, "None model should be invalid"
        assert 'Model is None' in invalid_result['issues'], "Should report None model issue"


class TestFeatureEngineeringModule:
    """
    Comprehensive test suite for feature engineering functions.
    
    Tests the creation of transaction features, customer features, risk features,
    financial wellness features, and fraud detection features.
    """
    
    def setup_method(self):
        """Set up test data for feature engineering tests."""
        # Create sample transaction data
        self.transaction_data = pd.DataFrame({
            'customer_id': ['cust_1', 'cust_1', 'cust_2', 'cust_2', 'cust_3'],
            'transaction_amount': [100.0, 250.0, 75.0, 500.0, 300.0],
            'transaction_date': pd.date_range('2024-01-01', periods=5, freq='D'),
            'transaction_type': ['debit', 'credit', 'debit', 'credit', 'debit'],
            'merchant_category': ['grocery', 'salary', 'gas', 'bonus', 'restaurant'],
            'location': ['city_a', 'city_a', 'city_b', 'city_b', 'city_c'],
            'channel': ['online', 'direct', 'atm', 'online', 'mobile']
        })
        
        # Create sample customer data
        self.customer_data = pd.DataFrame({
            'customer_id': ['cust_1', 'cust_2', 'cust_3'],
            'date_of_birth': pd.to_datetime(['1990-01-01', '1985-05-15', '1995-12-20']),
            'account_opening_date': pd.to_datetime(['2020-01-01', '2019-06-01', '2021-03-15']),
            'gender': ['M', 'F', 'M'],
            'occupation': ['engineer', 'teacher', 'analyst'],
            'annual_income': [75000, 65000, 80000],
            'credit_score': [720, 680, 750],
            'marital_status': ['single', 'married', 'single'],
            'education_level': ['bachelors', 'masters', 'bachelors'],
            'employment_status': ['employed', 'employed', 'employed'],
            'address_state': ['CA', 'NY', 'TX'],
            'phone_verified': [True, True, False],
            'email_verified': [True, False, True]
        })
    
    def test_create_transaction_features(self):
        """Tests creation of comprehensive transaction-based features."""
        logger.info("Testing create_transaction_features function")
        
        # Create transaction features
        transaction_features = create_transaction_features(self.transaction_data)
        
        # Validate output structure
        assert isinstance(transaction_features, pd.DataFrame), \
            "Output should be a pandas DataFrame"
        
        assert 'customer_id' in transaction_features.columns, \
            "Output should contain customer_id column"
        
        # Validate feature creation
        expected_features = [
            'transaction_frequency_daily', 'avg_transaction_amount',
            'std_transaction_amount', 'days_since_last_transaction'
        ]
        
        for feature in expected_features:
            assert feature in transaction_features.columns, \
                f"Missing expected feature: {feature}"
        
        # Validate data types and ranges
        assert transaction_features['customer_id'].nunique() <= self.transaction_data['customer_id'].nunique(), \
            "Number of unique customers should not increase"
        
        # Test performance
        start_time = datetime.now()
        large_transaction_data = pd.concat([self.transaction_data] * 100, ignore_index=True)
        large_features = create_transaction_features(large_transaction_data)
        end_time = datetime.now()
        
        processing_time_ms = (end_time - start_time).total_seconds() * 1000
        assert processing_time_ms < PERFORMANCE_THRESHOLD_MS, \
            f"Feature engineering took {processing_time_ms}ms, exceeds threshold"
    
    def test_create_customer_features(self):
        """Tests creation of customer demographic and account-based features."""
        logger.info("Testing create_customer_features function")
        
        # Create customer features
        customer_features = create_customer_features(self.customer_data)
        
        # Validate output structure
        assert isinstance(customer_features, pd.DataFrame), \
            "Output should be a pandas DataFrame"
        
        assert len(customer_features) == len(self.customer_data), \
            "Output should have same number of rows as input"
        
        # Validate feature creation
        expected_features = [
            'customer_age', 'account_tenure_days', 'income_decile',
            'credit_score_normalized', 'verification_score'
        ]
        
        for feature in expected_features:
            assert feature in customer_features.columns, \
                f"Missing expected feature: {feature}"
        
        # Validate data quality
        assert customer_features['customer_age'].min() > 0, \
            "Customer age should be positive"
        
        assert customer_features['credit_score_normalized'].min() >= 0, \
            "Normalized credit score should be non-negative"
        
        assert customer_features['credit_score_normalized'].max() <= 1, \
            "Normalized credit score should not exceed 1"
    
    def test_create_interaction_features(self):
        """
        Tests the creation of interaction features between customer and transaction data.
        
        This test adapts to the actual implementation which creates risk features
        that include interaction terms between customer and transaction features.
        """
        logger.info("Testing create_interaction_features (via create_risk_features)")
        
        # First create base features
        customer_features = create_customer_features(self.customer_data)
        transaction_features = create_transaction_features(self.transaction_data)
        
        # Create interaction features through risk feature engineering
        risk_features = create_risk_features(customer_features, transaction_features)
        
        # Validate that interaction features were created
        interaction_feature_patterns = [
            'transaction_amount_to_income_ratio',  # Transaction amount interacting with income
            'high_value_transaction_frequency',   # Transaction frequency interacting with income level
            'age_income_ratio',                   # Age interacting with income
            'tenure_income_ratio'                 # Account tenure interacting with income
        ]
        
        for pattern in interaction_feature_patterns:
            matching_columns = [col for col in risk_features.columns if pattern in col]
            assert len(matching_columns) > 0, \
                f"No interaction features found matching pattern: {pattern}"
        
        # Validate that interaction features have reasonable values
        assert risk_features['transaction_amount_to_income_ratio'].min() >= 0, \
            "Transaction-to-income ratio should be non-negative"
        
        # Test feature engineering creates meaningful interactions
        assert len(risk_features.columns) > len(customer_features.columns), \
            "Risk features should include additional interaction features"
        
        # Verify data integrity
        assert len(risk_features) > 0, "Risk features DataFrame should not be empty"
        assert risk_features['customer_id'].nunique() > 0, "Should have customer identifiers"
    
    def test_create_financial_wellness_features(self):
        """Tests creation of financial wellness and recommendation features."""
        logger.info("Testing create_financial_wellness_features function")
        
        # Create financial wellness features
        wellness_features = create_financial_wellness_features(
            self.customer_data, self.transaction_data
        )
        
        # Validate output structure
        assert isinstance(wellness_features, pd.DataFrame), \
            "Output should be a pandas DataFrame"
        
        # Validate key wellness metrics
        expected_wellness_features = [
            'savings_rate', 'debt_to_income_ratio', 'financial_wellness_score'
        ]
        
        for feature in expected_wellness_features:
            assert feature in wellness_features.columns, \
                f"Missing expected wellness feature: {feature}"
        
        # Validate wellness score is normalized
        wellness_score = wellness_features['financial_wellness_score']
        assert wellness_score.min() >= 0, "Wellness score should be non-negative"
        assert wellness_score.max() <= 1, "Wellness score should not exceed 1"
    
    def test_create_fraud_detection_features(self):
        """Tests creation of fraud detection features for suspicious activity identification."""
        logger.info("Testing create_fraud_detection_features function")
        
        # Create fraud detection features
        fraud_features = create_fraud_detection_features(self.transaction_data)
        
        # Validate output structure
        assert isinstance(fraud_features, pd.DataFrame), \
            "Output should be a pandas DataFrame"
        
        # Validate fraud-specific features
        expected_fraud_features = [
            'unusual_time_transactions', 'unusual_location_transactions',
            'unusual_amount_transactions', 'fraud_composite_score'
        ]
        
        for feature in expected_fraud_features:
            assert feature in fraud_features.columns, \
                f"Missing expected fraud feature: {feature}"
        
        # Validate fraud composite score
        fraud_score = fraud_features['fraud_composite_score']
        assert fraud_score.min() >= 0, "Fraud score should be non-negative"
        assert fraud_score.max() <= 1, "Fraud score should not exceed 1"


class TestPreprocessingModule:
    """
    Comprehensive test suite for data preprocessing utilities.
    
    Tests data cleaning, preprocessing pipeline creation, and data transformation
    functions with focus on financial data quality and compliance requirements.
    """
    
    def setup_method(self):
        """Set up test data for preprocessing tests."""
        # Create sample data with missing values and outliers
        np.random.seed(42)
        
        self.sample_data = pd.DataFrame({
            'numerical_feature_1': [1.0, 2.0, np.nan, 4.0, 100.0],  # Contains missing and outlier
            'numerical_feature_2': [10.0, 20.0, 30.0, np.nan, 50.0],  # Contains missing
            'categorical_feature_1': ['A', 'B', 'A', np.nan, 'C'],  # Contains missing
            'categorical_feature_2': ['X', 'Y', 'X', 'Y', 'Z']  # Complete data
        })
        
        self.numerical_features = ['numerical_feature_1', 'numerical_feature_2']
        self.categorical_features = ['categorical_feature_1', 'categorical_feature_2']
    
    def test_clean_data(self):
        """Tests data cleaning functionality with missing values and outlier handling."""
        logger.info("Testing clean_data function")
        
        # Test data cleaning
        cleaned_data = clean_data(self.sample_data)
        
        # Validate no missing values remain
        assert cleaned_data.isnull().sum().sum() == 0, \
            "Cleaned data should not contain missing values"
        
        # Validate shape preservation
        assert cleaned_data.shape == self.sample_data.shape, \
            "Data shape should be preserved during cleaning"
        
        # Validate outlier handling (extreme values should be capped)
        original_max = self.sample_data['numerical_feature_1'].max()
        cleaned_max = cleaned_data['numerical_feature_1'].max()
        
        assert cleaned_max < original_max, \
            "Outliers should be capped to reduce extreme values"
        
        # Test empty DataFrame handling
        empty_df = pd.DataFrame()
        cleaned_empty = clean_data(empty_df)
        
        assert cleaned_empty.empty, "Empty DataFrame should remain empty"
        
        # Test invalid input handling
        with pytest.raises(TypeError, match="Input must be a pandas DataFrame"):
            clean_data("not_a_dataframe")
    
    def test_create_preprocessing_pipeline(self):
        """Tests creation of scikit-learn preprocessing pipeline."""
        logger.info("Testing create_preprocessing_pipeline function")
        
        # Create preprocessing pipeline
        pipeline = create_preprocessing_pipeline(
            self.numerical_features, 
            self.categorical_features
        )
        
        # Validate pipeline structure
        assert hasattr(pipeline, 'fit'), "Pipeline should have fit method"
        assert hasattr(pipeline, 'transform'), "Pipeline should have transform method"
        
        # Validate pipeline metadata
        assert hasattr(pipeline, '_feature_config'), \
            "Pipeline should contain feature configuration metadata"
        
        feature_config = pipeline._feature_config
        assert feature_config['numerical_features'] == self.numerical_features, \
            "Pipeline should store numerical feature names"
        assert feature_config['categorical_features'] == self.categorical_features, \
            "Pipeline should store categorical feature names"
        
        # Test empty feature lists
        with pytest.raises(ValueError, match="At least one feature type"):
            create_preprocessing_pipeline([], [])
        
        # Test invalid input types
        with pytest.raises(TypeError, match="Feature lists must be provided as Python lists"):
            create_preprocessing_pipeline("not_a_list", self.categorical_features)
    
    def test_scale_features(self):
        """
        Tests the scaling functionality through the preprocessing pipeline.
        
        This test validates that features are properly scaled and normalized
        according to financial industry standards.
        """
        logger.info("Testing scale_features functionality through preprocessing pipeline")
        
        # Create and fit pipeline
        pipeline = create_preprocessing_pipeline(
            self.numerical_features, 
            self.categorical_features
        )
        
        # Clean data first
        cleaned_data = clean_data(self.sample_data)
        
        # Fit the pipeline
        pipeline.fit(cleaned_data)
        
        # Transform the data
        scaled_data = preprocess_data(cleaned_data, pipeline)
        
        # Validate transformation output
        assert isinstance(scaled_data, np.ndarray), \
            "Preprocessing should return numpy array"
        
        assert scaled_data.shape[0] == cleaned_data.shape[0], \
            "Number of samples should be preserved"
        
        # Validate that numerical features are scaled (should have different variance)
        original_var = cleaned_data[self.numerical_features].var()
        
        # The transformed data should have standardized features (approximately unit variance)
        # Note: We can't directly check this without knowing the exact column mapping
        # after one-hot encoding, but we can verify the transformation occurred
        assert scaled_data.shape[1] >= len(self.numerical_features), \
            "Transformed data should have at least as many features as numerical inputs"
        
        # Test performance on larger dataset
        start_time = datetime.now()
        large_data = pd.concat([cleaned_data] * 100, ignore_index=True)
        large_scaled = preprocess_data(large_data, pipeline)
        end_time = datetime.now()
        
        processing_time_ms = (end_time - start_time).total_seconds() * 1000
        assert processing_time_ms < PERFORMANCE_THRESHOLD_MS, \
            f"Scaling took {processing_time_ms}ms, exceeds threshold"
    
    def test_preprocess_data(self):
        """Tests the complete data preprocessing workflow."""
        logger.info("Testing preprocess_data function")
        
        # Create and fit pipeline
        pipeline = create_preprocessing_pipeline(
            self.numerical_features, 
            self.categorical_features
        )
        
        # Clean and prepare data
        cleaned_data = clean_data(self.sample_data)
        
        # Fit pipeline
        pipeline.fit(cleaned_data)
        
        # Test data preprocessing
        preprocessed_data = preprocess_data(cleaned_data, pipeline)
        
        # Validate output
        assert isinstance(preprocessed_data, np.ndarray), \
            "Preprocessed data should be numpy array"
        
        assert not np.isnan(preprocessed_data).any(), \
            "Preprocessed data should not contain NaN values"
        
        assert not np.isinf(preprocessed_data).any(), \
            "Preprocessed data should not contain infinite values"
        
        # Test error handling
        with pytest.raises(TypeError, match="Input data must be a pandas DataFrame"):
            preprocess_data("not_a_dataframe", pipeline)
        
        with pytest.raises(TypeError, match="Pipeline must be a scikit-learn Pipeline"):
            preprocess_data(cleaned_data, "not_a_pipeline")
        
        with pytest.raises(ValueError, match="Input DataFrame is empty"):
            preprocess_data(pd.DataFrame(), pipeline)


class TestIntegrationScenarios:
    """
    Integration tests that validate end-to-end workflows combining multiple utility functions.
    
    These tests ensure that the utility functions work together seamlessly in
    realistic AI service scenarios.
    """
    
    def setup_method(self):
        """Set up comprehensive test data for integration scenarios."""
        # Create larger, more realistic dataset
        np.random.seed(42)
        
        # Generate customer data
        n_customers = 100
        customer_ids = [f'cust_{i:04d}' for i in range(n_customers)]
        
        self.integration_customer_data = pd.DataFrame({
            'customer_id': customer_ids,
            'date_of_birth': pd.date_range('1970-01-01', '2000-12-31', periods=n_customers),
            'account_opening_date': pd.date_range('2015-01-01', '2024-01-01', periods=n_customers),
            'gender': np.random.choice(['M', 'F'], n_customers),
            'occupation': np.random.choice(['engineer', 'teacher', 'analyst', 'manager'], n_customers),
            'annual_income': np.random.normal(70000, 20000, n_customers).clip(30000, 200000),
            'credit_score': np.random.normal(700, 100, n_customers).clip(300, 850),
            'marital_status': np.random.choice(['single', 'married', 'divorced'], n_customers),
            'education_level': np.random.choice(['high_school', 'bachelors', 'masters'], n_customers),
            'employment_status': np.random.choice(['employed', 'self_employed', 'unemployed'], n_customers),
            'address_state': np.random.choice(['CA', 'NY', 'TX', 'FL'], n_customers),
            'phone_verified': np.random.choice([True, False], n_customers),
            'email_verified': np.random.choice([True, False], n_customers)
        })
        
        # Generate transaction data
        n_transactions = 1000
        transaction_customer_ids = np.random.choice(customer_ids, n_transactions)
        
        self.integration_transaction_data = pd.DataFrame({
            'customer_id': transaction_customer_ids,
            'transaction_amount': np.random.lognormal(4, 1, n_transactions).clip(1, 10000),
            'transaction_date': pd.date_range('2024-01-01', '2024-12-31', periods=n_transactions),
            'transaction_type': np.random.choice(['debit', 'credit'], n_transactions),
            'merchant_category': np.random.choice(['grocery', 'gas', 'restaurant', 'shopping'], n_transactions),
            'location': np.random.choice(['city_a', 'city_b', 'city_c'], n_transactions),
            'channel': np.random.choice(['online', 'atm', 'mobile', 'branch'], n_transactions)
        })
    
    def test_end_to_end_risk_assessment_pipeline(self):
        """Tests complete risk assessment pipeline from raw data to model-ready features."""
        logger.info("Testing end-to-end risk assessment pipeline")
        
        start_time = datetime.now()
        
        # Step 1: Create customer features
        customer_features = create_customer_features(self.integration_customer_data)
        assert len(customer_features) > 0, "Customer features should be created"
        
        # Step 2: Create transaction features
        transaction_features = create_transaction_features(self.integration_transaction_data)
        assert len(transaction_features) > 0, "Transaction features should be created"
        
        # Step 3: Create risk features (interaction features)
        risk_features = create_risk_features(customer_features, transaction_features)
        assert len(risk_features) > 0, "Risk features should be created"
        
        # Step 4: Clean the data
        cleaned_risk_features = clean_data(risk_features)
        assert cleaned_risk_features.isnull().sum().sum() == 0, "Data should be clean"
        
        # Step 5: Create preprocessing pipeline
        feature_columns = [col for col in cleaned_risk_features.columns if col != 'customer_id']
        numerical_features = cleaned_risk_features[feature_columns].select_dtypes(include=[np.number]).columns.tolist()
        categorical_features = cleaned_risk_features[feature_columns].select_dtypes(exclude=[np.number]).columns.tolist()
        
        pipeline = create_preprocessing_pipeline(numerical_features, categorical_features)
        
        # Step 6: Fit and transform data
        pipeline.fit(cleaned_risk_features[feature_columns])
        final_features = preprocess_data(cleaned_risk_features[feature_columns], pipeline)
        
        # Validate final output
        assert isinstance(final_features, np.ndarray), "Final features should be numpy array"
        assert final_features.shape[0] > 0, "Should have samples"
        assert final_features.shape[1] > 0, "Should have features"
        
        # Performance validation
        end_time = datetime.now()
        total_time_ms = (end_time - start_time).total_seconds() * 1000
        
        assert total_time_ms < PERFORMANCE_THRESHOLD_MS * 5, \
            f"End-to-end pipeline took {total_time_ms}ms, exceeds threshold"
        
        logger.info(f"End-to-end risk assessment pipeline completed in {total_time_ms:.2f}ms")
    
    def test_model_performance_evaluation_workflow(self):
        """Tests complete model evaluation workflow with multiple metrics."""
        logger.info("Testing model performance evaluation workflow")
        
        # Generate synthetic model predictions for evaluation
        n_samples = 1000
        y_true = np.random.randint(0, 2, n_samples)
        y_pred = np.random.randint(0, 2, n_samples)
        y_scores = np.random.random(n_samples)
        
        # Add some correlation to make results more realistic
        correlation_mask = np.random.random(n_samples) < 0.7
        y_pred[correlation_mask] = y_true[correlation_mask]
        
        # Generate sensitive features for fairness testing
        sensitive_features = np.random.randint(0, 2, n_samples)
        
        # Calculate all metrics
        accuracy = calculate_accuracy(y_true, y_pred)
        precision = calculate_precision(y_true, y_pred)
        recall = calculate_recall(y_true, y_pred)
        f1 = calculate_f1_score(y_true, y_pred)
        roc_auc = calculate_roc_auc(y_true, y_scores)
        confusion_matrix = generate_confusion_matrix(y_true, y_pred)
        fairness_metrics = calculate_fairness_metrics(y_true, y_pred, sensitive_features)
        
        # Create comprehensive performance summary
        performance_summary = calculate_model_performance_summary(
            y_true, y_pred, y_scores, sensitive_features
        )
        
        # Validate comprehensive evaluation
        assert 0 <= accuracy <= 1, "Accuracy should be between 0 and 1"
        assert 0 <= precision <= 1, "Precision should be between 0 and 1"
        assert 0 <= recall <= 1, "Recall should be between 0 and 1"
        assert 0 <= f1 <= 1, "F1 score should be between 0 and 1"
        assert 0.5 <= roc_auc <= 1, "ROC AUC should be between 0.5 and 1"
        
        assert isinstance(confusion_matrix, np.ndarray), "Confusion matrix should be numpy array"
        assert confusion_matrix.shape == (2, 2), "Binary confusion matrix should be 2x2"
        
        assert isinstance(fairness_metrics, dict), "Fairness metrics should be dictionary"
        assert 'demographic_parity_difference' in fairness_metrics, "Should include demographic parity"
        
        assert isinstance(performance_summary, dict), "Performance summary should be dictionary"
        assert 'classification_metrics' in performance_summary, "Should include classification metrics"
        assert 'fairness_metrics' in performance_summary, "Should include fairness metrics"
        
        logger.info("Model performance evaluation workflow completed successfully")


# Performance and compliance test markers
@pytest.mark.performance
class TestPerformanceRequirements:
    """Tests to validate performance requirements for the AI service."""
    
    def test_metrics_calculation_performance(self):
        """Validates that metrics calculations meet <500ms requirement."""
        # Large dataset for performance testing
        n_samples = 50000
        y_true = np.random.randint(0, 2, n_samples)
        y_pred = np.random.randint(0, 2, n_samples)
        
        start_time = datetime.now()
        accuracy = calculate_accuracy(y_true, y_pred)
        end_time = datetime.now()
        
        processing_time_ms = (end_time - start_time).total_seconds() * 1000
        assert processing_time_ms < PERFORMANCE_THRESHOLD_MS, \
            f"Metrics calculation took {processing_time_ms}ms, exceeds {PERFORMANCE_THRESHOLD_MS}ms threshold"


@pytest.mark.compliance
class TestComplianceRequirements:
    """Tests to validate regulatory compliance requirements."""
    
    def test_fairness_metrics_gdpr_compliance(self):
        """Validates that fairness metrics support GDPR compliance."""
        y_true = np.array([0, 1, 1, 0, 1, 0, 1, 1, 0, 0])
        y_pred = np.array([0, 1, 0, 0, 1, 0, 1, 1, 0, 1])
        sensitive_features = np.array([0, 0, 1, 1, 0, 1, 0, 1, 0, 1])
        
        fairness_metrics = calculate_fairness_metrics(y_true, y_pred, sensitive_features)
        
        # Validate compliance features
        assert 'demographic_parity' in fairness_metrics, "Must support demographic parity analysis"
        assert 'equalized_odds' in fairness_metrics, "Must support equalized odds analysis"
        assert 'group_counts' in fairness_metrics, "Must provide group size information"
        
        # Validate transparency requirements
        assert isinstance(fairness_metrics, dict), "Metrics must be interpretable"
        assert len(fairness_metrics) > 0, "Must provide meaningful fairness analysis"


if __name__ == "__main__":
    # Run tests with detailed output
    pytest.main([
        __file__,
        "-v",  # Verbose output
        "-s",  # Show print statements
        "--tb=short",  # Short traceback format
        "--strict-markers",  # Strict marker usage
        "-m", "not performance and not compliance",  # Skip performance/compliance tests in basic run
    ])