"""
AI Service Configuration Module

This module centralizes all configuration settings for the AI-powered financial services
including risk assessment, fraud detection, and personalized recommendations.
Follows enterprise security standards and regulatory compliance requirements.

Features Addressed:
- F-002: AI-Powered Risk Assessment Engine
- F-006: Fraud Detection System  
- F-007: Personalized Financial Recommendations

Author: AI Service Team
Version: 1.0.0
Last Updated: 2025
"""

import os  # Built-in Python module for OS interface and environment variables
from typing import Dict, Any, Optional
import json
from pathlib import Path

# =============================================================================
# CORE SYSTEM CONFIGURATION
# =============================================================================

# Base model directory path - configurable via environment
MODEL_PATH = os.getenv('MODEL_PATH', './models')

# Individual model paths for different AI services
RISK_MODEL_PATH = os.path.join(MODEL_PATH, 'risk_model.pkl')
FRAUD_MODEL_PATH = os.path.join(MODEL_PATH, 'fraud_model.pkl')
RECOMMENDATION_MODEL_PATH = os.path.join(MODEL_PATH, 'recommendation_model.pkl')

# Logging configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# API service configuration
API_PORT = int(os.getenv('API_PORT', 8000))

# ML Framework versions as per technology stack requirements
TENSORFLOW_VERSION = '2.15+'
PYTORCH_VERSION = '2.1+'

# =============================================================================
# AI MODEL CONFIGURATION
# =============================================================================

# Risk Assessment Engine Configuration (F-002)
RISK_ASSESSMENT_CONFIG = {
    'model_type': os.getenv('RISK_MODEL_TYPE', 'gradient_boosting'),
    'model_path': RISK_MODEL_PATH,
    'backup_model_path': os.path.join(MODEL_PATH, 'risk_model_backup.pkl'),
    'feature_columns': [
        'credit_score', 'debt_to_income', 'payment_history', 'account_age',
        'transaction_frequency', 'average_balance', 'income_stability',
        'employment_length', 'loan_history', 'market_volatility'
    ],
    'scoring_thresholds': {
        'low_risk': float(os.getenv('RISK_LOW_THRESHOLD', '0.3')),
        'medium_risk': float(os.getenv('RISK_MEDIUM_THRESHOLD', '0.6')),
        'high_risk': float(os.getenv('RISK_HIGH_THRESHOLD', '0.8'))
    },
    'max_response_time_ms': int(os.getenv('RISK_MAX_RESPONSE_TIME', '500')),
    'accuracy_threshold': float(os.getenv('RISK_ACCURACY_THRESHOLD', '0.95')),
    'model_refresh_interval_hours': int(os.getenv('RISK_MODEL_REFRESH_HOURS', '24')),
    'explainability_enabled': os.getenv('RISK_EXPLAINABILITY', 'true').lower() == 'true',
    'bias_monitoring_enabled': os.getenv('RISK_BIAS_MONITORING', 'true').lower() == 'true'
}

# Fraud Detection System Configuration (F-006)
FRAUD_DETECTION_CONFIG = {
    'model_type': os.getenv('FRAUD_MODEL_TYPE', 'neural_network'),
    'model_path': FRAUD_MODEL_PATH,
    'backup_model_path': os.path.join(MODEL_PATH, 'fraud_model_backup.pkl'),
    'feature_columns': [
        'transaction_amount', 'merchant_category', 'time_of_day', 'day_of_week',
        'location_risk_score', 'device_fingerprint', 'velocity_checks',
        'historical_patterns', 'account_age', 'spending_patterns'
    ],
    'detection_thresholds': {
        'low_risk': float(os.getenv('FRAUD_LOW_THRESHOLD', '0.2')),
        'medium_risk': float(os.getenv('FRAUD_MEDIUM_THRESHOLD', '0.5')),
        'high_risk': float(os.getenv('FRAUD_HIGH_THRESHOLD', '0.8'))
    },
    'real_time_scoring': os.getenv('FRAUD_REAL_TIME', 'true').lower() == 'true',
    'max_processing_time_ms': int(os.getenv('FRAUD_MAX_PROCESSING_TIME', '200')),
    'alert_enabled': os.getenv('FRAUD_ALERTS', 'true').lower() == 'true',
    'learning_rate': float(os.getenv('FRAUD_LEARNING_RATE', '0.001')),
    'batch_size': int(os.getenv('FRAUD_BATCH_SIZE', '128')),
    'model_retraining_frequency_days': int(os.getenv('FRAUD_RETRAIN_DAYS', '7'))
}

# Personalized Recommendations Configuration (F-007)
RECOMMENDATION_CONFIG = {
    'model_type': os.getenv('RECOMMENDATION_MODEL_TYPE', 'collaborative_filtering'),
    'model_path': RECOMMENDATION_MODEL_PATH,
    'backup_model_path': os.path.join(MODEL_PATH, 'recommendation_model_backup.pkl'),
    'feature_columns': [
        'customer_age', 'income_bracket', 'spending_categories', 'investment_profile',
        'risk_tolerance', 'financial_goals', 'product_usage', 'transaction_history',
        'life_events', 'seasonal_patterns'
    ],
    'recommendation_types': ['products', 'services', 'investments', 'savings'],
    'max_recommendations': int(os.getenv('REC_MAX_COUNT', '10')),
    'min_confidence_score': float(os.getenv('REC_MIN_CONFIDENCE', '0.7')),
    'personalization_depth': os.getenv('REC_PERSONALIZATION_DEPTH', 'high'),
    'privacy_mode': os.getenv('REC_PRIVACY_MODE', 'strict'),
    'a_b_testing_enabled': os.getenv('REC_AB_TESTING', 'true').lower() == 'true',
    'model_update_frequency_hours': int(os.getenv('REC_UPDATE_HOURS', '12'))
}

# =============================================================================
# DATABASE & DATA PIPELINE CONFIGURATION
# =============================================================================

# Database connections for AI services
DATABASE_CONFIG = {
    'postgresql': {
        'host': os.getenv('POSTGRES_HOST', 'localhost'),
        'port': int(os.getenv('POSTGRES_PORT', '5432')),
        'database': os.getenv('POSTGRES_DB', 'ai_service'),
        'username': os.getenv('POSTGRES_USER', 'ai_user'),
        'password': os.getenv('POSTGRES_PASSWORD', ''),
        'ssl_mode': os.getenv('POSTGRES_SSL_MODE', 'require'),
        'connection_pool_size': int(os.getenv('POSTGRES_POOL_SIZE', '20'))
    },
    'mongodb': {
        'host': os.getenv('MONGO_HOST', 'localhost'),
        'port': int(os.getenv('MONGO_PORT', '27017')),
        'database': os.getenv('MONGO_DB', 'ai_analytics'),
        'username': os.getenv('MONGO_USER', 'ai_user'),
        'password': os.getenv('MONGO_PASSWORD', ''),
        'ssl_enabled': os.getenv('MONGO_SSL', 'true').lower() == 'true',
        'connection_pool_size': int(os.getenv('MONGO_POOL_SIZE', '50'))
    },
    'redis': {
        'host': os.getenv('REDIS_HOST', 'localhost'),
        'port': int(os.getenv('REDIS_PORT', '6379')),
        'password': os.getenv('REDIS_PASSWORD', ''),
        'db': int(os.getenv('REDIS_DB', '0')),
        'ssl_enabled': os.getenv('REDIS_SSL', 'false').lower() == 'true',
        'connection_pool_size': int(os.getenv('REDIS_POOL_SIZE', '10'))
    }
}

# Feature store configuration for real-time features
FEATURE_STORE_CONFIG = {
    'enabled': os.getenv('FEATURE_STORE_ENABLED', 'true').lower() == 'true',
    'provider': os.getenv('FEATURE_STORE_PROVIDER', 'redis'),
    'cache_ttl_seconds': int(os.getenv('FEATURE_CACHE_TTL', '3600')),
    'batch_update_interval_minutes': int(os.getenv('FEATURE_BATCH_UPDATE', '15')),
    'feature_validation_enabled': os.getenv('FEATURE_VALIDATION', 'true').lower() == 'true'
}

# =============================================================================
# SECURITY & COMPLIANCE CONFIGURATION
# =============================================================================

# Security settings for financial data protection
SECURITY_CONFIG = {
    'encryption_key': os.getenv('AI_ENCRYPTION_KEY', ''),
    'jwt_secret': os.getenv('AI_JWT_SECRET', ''),
    'api_key_required': os.getenv('AI_API_KEY_REQUIRED', 'true').lower() == 'true',
    'rate_limiting': {
        'enabled': os.getenv('RATE_LIMITING_ENABLED', 'true').lower() == 'true',
        'requests_per_minute': int(os.getenv('RATE_LIMIT_RPM', '1000')),
        'burst_limit': int(os.getenv('RATE_LIMIT_BURST', '100'))
    },
    'data_masking_enabled': os.getenv('DATA_MASKING', 'true').lower() == 'true',
    'audit_logging_enabled': os.getenv('AUDIT_LOGGING', 'true').lower() == 'true',
    'pii_detection_enabled': os.getenv('PII_DETECTION', 'true').lower() == 'true'
}

# Compliance settings for regulatory requirements
COMPLIANCE_CONFIG = {
    'gdpr_compliance': os.getenv('GDPR_COMPLIANCE', 'true').lower() == 'true',
    'pci_dss_compliance': os.getenv('PCI_DSS_COMPLIANCE', 'true').lower() == 'true',
    'sox_compliance': os.getenv('SOX_COMPLIANCE', 'true').lower() == 'true',
    'data_retention_days': int(os.getenv('DATA_RETENTION_DAYS', '2555')),  # 7 years
    'model_governance': {
        'version_control_required': os.getenv('MODEL_VERSION_CONTROL', 'true').lower() == 'true',
        'approval_workflow_enabled': os.getenv('MODEL_APPROVAL_WORKFLOW', 'true').lower() == 'true',
        'performance_monitoring_required': os.getenv('MODEL_PERFORMANCE_MONITORING', 'true').lower() == 'true',
        'bias_testing_frequency_days': int(os.getenv('BIAS_TESTING_FREQUENCY', '30'))
    }
}

# =============================================================================
# PERFORMANCE & MONITORING CONFIGURATION
# =============================================================================

# Performance optimization settings
PERFORMANCE_CONFIG = {
    'multi_processing_enabled': os.getenv('MULTIPROCESSING', 'true').lower() == 'true',
    'worker_processes': int(os.getenv('WORKER_PROCESSES', '4')),
    'batch_processing_size': int(os.getenv('BATCH_SIZE', '1000')),
    'model_caching_enabled': os.getenv('MODEL_CACHING', 'true').lower() == 'true',
    'prediction_caching_ttl_seconds': int(os.getenv('PREDICTION_CACHE_TTL', '300')),
    'gpu_enabled': os.getenv('GPU_ENABLED', 'false').lower() == 'true',
    'memory_limit_gb': int(os.getenv('MEMORY_LIMIT_GB', '8'))
}

# Monitoring and alerting configuration
MONITORING_CONFIG = {
    'metrics_enabled': os.getenv('METRICS_ENABLED', 'true').lower() == 'true',
    'prometheus_port': int(os.getenv('PROMETHEUS_PORT', '9090')),
    'health_check_interval_seconds': int(os.getenv('HEALTH_CHECK_INTERVAL', '30')),
    'model_drift_detection': os.getenv('MODEL_DRIFT_DETECTION', 'true').lower() == 'true',
    'performance_alerts': {
        'response_time_threshold_ms': int(os.getenv('ALERT_RESPONSE_TIME', '1000')),
        'accuracy_degradation_threshold': float(os.getenv('ALERT_ACCURACY_THRESHOLD', '0.05')),
        'error_rate_threshold': float(os.getenv('ALERT_ERROR_RATE', '0.01'))
    },
    'logging_config': {
        'level': LOG_LEVEL,
        'format': os.getenv('LOG_FORMAT', 'json'),
        'output_file': os.getenv('LOG_FILE', '/var/log/ai-service/ai-service.log'),
        'max_file_size_mb': int(os.getenv('LOG_MAX_SIZE_MB', '100')),
        'backup_count': int(os.getenv('LOG_BACKUP_COUNT', '5'))
    }
}

# =============================================================================
# FEATURE FLAGS & EXPERIMENTAL CONFIGURATION
# =============================================================================

# Feature flags for gradual rollout and A/B testing
FEATURE_FLAGS = {
    'advanced_risk_models_enabled': os.getenv('FF_ADVANCED_RISK', 'false').lower() == 'true',
    'real_time_fraud_scoring': os.getenv('FF_REALTIME_FRAUD', 'true').lower() == 'true',
    'ml_explainability': os.getenv('FF_ML_EXPLAINABILITY', 'true').lower() == 'true',
    'automated_model_retraining': os.getenv('FF_AUTO_RETRAIN', 'false').lower() == 'true',
    'cross_sell_recommendations': os.getenv('FF_CROSS_SELL', 'true').lower() == 'true',
    'behavioral_analytics': os.getenv('FF_BEHAVIORAL_ANALYTICS', 'true').lower() == 'true'
}

# Experimental model configurations
EXPERIMENTAL_CONFIG = {
    'enabled': os.getenv('EXPERIMENTAL_ENABLED', 'false').lower() == 'true',
    'traffic_percentage': float(os.getenv('EXPERIMENTAL_TRAFFIC', '0.05')),
    'models': {
        'next_gen_risk_model': {
            'path': os.path.join(MODEL_PATH, 'experimental', 'next_gen_risk.pkl'),
            'enabled': os.getenv('EXP_NEXT_GEN_RISK', 'false').lower() == 'true'
        },
        'transformer_fraud_model': {
            'path': os.path.join(MODEL_PATH, 'experimental', 'transformer_fraud.pkl'),
            'enabled': os.getenv('EXP_TRANSFORMER_FRAUD', 'false').lower() == 'true'
        }
    }
}

# =============================================================================
# EXTERNAL INTEGRATIONS CONFIGURATION
# =============================================================================

# Third-party service integrations
EXTERNAL_SERVICES_CONFIG = {
    'credit_bureau_api': {
        'enabled': os.getenv('CREDIT_BUREAU_ENABLED', 'true').lower() == 'true',
        'endpoint': os.getenv('CREDIT_BUREAU_ENDPOINT', ''),
        'api_key': os.getenv('CREDIT_BUREAU_API_KEY', ''),
        'timeout_seconds': int(os.getenv('CREDIT_BUREAU_TIMEOUT', '10'))
    },
    'market_data_feed': {
        'enabled': os.getenv('MARKET_DATA_ENABLED', 'true').lower() == 'true',
        'endpoint': os.getenv('MARKET_DATA_ENDPOINT', ''),
        'api_key': os.getenv('MARKET_DATA_API_KEY', ''),
        'refresh_interval_minutes': int(os.getenv('MARKET_DATA_REFRESH', '5'))
    },
    'regulatory_updates': {
        'enabled': os.getenv('REGULATORY_UPDATES_ENABLED', 'true').lower() == 'true',
        'endpoint': os.getenv('REGULATORY_ENDPOINT', ''),
        'api_key': os.getenv('REGULATORY_API_KEY', ''),
        'check_interval_hours': int(os.getenv('REGULATORY_CHECK_HOURS', '6'))
    }
}

# =============================================================================
# ENVIRONMENT-SPECIFIC CONFIGURATION
# =============================================================================

# Environment detection
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development').lower()

# Environment-specific overrides
if ENVIRONMENT == 'production':
    # Production-specific settings for enhanced security and performance
    PERFORMANCE_CONFIG['worker_processes'] = int(os.getenv('PROD_WORKER_PROCESSES', '8'))
    SECURITY_CONFIG['rate_limiting']['requests_per_minute'] = int(os.getenv('PROD_RATE_LIMIT', '5000'))
    MONITORING_CONFIG['health_check_interval_seconds'] = int(os.getenv('PROD_HEALTH_CHECK', '10'))
    
elif ENVIRONMENT == 'staging':
    # Staging-specific settings for testing
    FEATURE_FLAGS['automated_model_retraining'] = True
    EXPERIMENTAL_CONFIG['traffic_percentage'] = 0.1
    
elif ENVIRONMENT == 'development':
    # Development-specific settings for easier debugging
    MONITORING_CONFIG['logging_config']['level'] = 'DEBUG'
    SECURITY_CONFIG['rate_limiting']['enabled'] = False

# =============================================================================
# CONFIGURATION VALIDATION & UTILITIES
# =============================================================================

def validate_configuration() -> bool:
    """
    Validates the current configuration settings.
    
    Returns:
        bool: True if configuration is valid, False otherwise
    """
    try:
        # Validate model paths exist
        if not os.path.exists(MODEL_PATH):
            os.makedirs(MODEL_PATH, exist_ok=True)
        
        # Validate critical environment variables
        required_vars = ['POSTGRES_PASSWORD', 'AI_ENCRYPTION_KEY', 'AI_JWT_SECRET']
        for var in required_vars:
            if ENVIRONMENT == 'production' and not os.getenv(var):
                raise ValueError(f"Required environment variable {var} not set in production")
        
        # Validate threshold ranges
        for config in [RISK_ASSESSMENT_CONFIG, FRAUD_DETECTION_CONFIG]:
            thresholds = config.get('scoring_thresholds', {}) or config.get('detection_thresholds', {})
            if thresholds:
                values = list(thresholds.values())
                if not all(0 <= v <= 1 for v in values):
                    raise ValueError("Threshold values must be between 0 and 1")
        
        return True
        
    except Exception as e:
        print(f"Configuration validation error: {e}")
        return False

def get_model_config(model_type: str) -> Dict[str, Any]:
    """
    Retrieves configuration for a specific model type.
    
    Args:
        model_type (str): Type of model ('risk', 'fraud', 'recommendation')
        
    Returns:
        Dict[str, Any]: Model-specific configuration
    """
    config_map = {
        'risk': RISK_ASSESSMENT_CONFIG,
        'fraud': FRAUD_DETECTION_CONFIG,
        'recommendation': RECOMMENDATION_CONFIG
    }
    return config_map.get(model_type, {})

def get_database_url(db_type: str) -> str:
    """
    Constructs database connection URL.
    
    Args:
        db_type (str): Database type ('postgresql', 'mongodb', 'redis')
        
    Returns:
        str: Database connection URL
    """
    config = DATABASE_CONFIG.get(db_type, {})
    if not config:
        return ""
    
    if db_type == 'postgresql':
        return f"postgresql://{config['username']}:{config['password']}@{config['host']}:{config['port']}/{config['database']}"
    elif db_type == 'mongodb':
        return f"mongodb://{config['username']}:{config['password']}@{config['host']}:{config['port']}/{config['database']}"
    elif db_type == 'redis':
        auth = f":{config['password']}@" if config['password'] else ""
        return f"redis://{auth}{config['host']}:{config['port']}/{config['db']}"
    
    return ""

# =============================================================================
# INITIALIZATION
# =============================================================================

# Validate configuration on module import
if not validate_configuration():
    print("WARNING: Configuration validation failed. Please check your settings.")

# Export key configuration objects for easy access
__all__ = [
    'MODEL_PATH', 'RISK_MODEL_PATH', 'FRAUD_MODEL_PATH', 'RECOMMENDATION_MODEL_PATH',
    'LOG_LEVEL', 'API_PORT', 'TENSORFLOW_VERSION', 'PYTORCH_VERSION',
    'RISK_ASSESSMENT_CONFIG', 'FRAUD_DETECTION_CONFIG', 'RECOMMENDATION_CONFIG',
    'DATABASE_CONFIG', 'SECURITY_CONFIG', 'COMPLIANCE_CONFIG', 'PERFORMANCE_CONFIG',
    'MONITORING_CONFIG', 'FEATURE_FLAGS', 'EXTERNAL_SERVICES_CONFIG',
    'validate_configuration', 'get_model_config', 'get_database_url'
]