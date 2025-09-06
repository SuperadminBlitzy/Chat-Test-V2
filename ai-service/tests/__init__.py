# -*- coding: utf-8 -*-
"""
AI Service Test Package Initialization

This module initializes the test package for the AI Service component of the
Unified Financial Services Platform. It provides common test utilities,
configurations, and fixtures that are shared across all test modules within
this package.

The AI Service is responsible for:
- AI-powered risk assessment and fraud detection
- Predictive analytics for financial services
- Regulatory compliance automation
- Machine learning model serving via FastAPI

Test Framework Stack:
- pytest: Primary testing framework
- pytest-asyncio: For testing async functionality
- pytest-mock: Mocking utilities
- pytest-cov: Code coverage reporting

Enterprise Testing Standards:
- Comprehensive test coverage (>95% target)
- Integration with CI/CD pipeline (GitHub Actions)
- Security testing compliance (OWASP standards)
- Performance testing for financial data processing

Version: 1.0.0
Python Version: 3.12+
Framework: FastAPI 0.104+
AI/ML Stack: TensorFlow 2.15+, PyTorch 2.1+, scikit-learn 1.3+

Author: AI Service Development Team
Created: 2025
License: Proprietary - Unified Financial Services Platform
"""

import os
import sys
import logging
import warnings
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

# Version information for the test package
__version__ = "1.0.0"
__author__ = "AI Service Development Team"
__email__ = "ai-service-team@unifiedfinancial.com"
__status__ = "Production"

# Test package metadata
__title__ = "AI Service Test Suite"
__description__ = "Comprehensive test package for AI-powered financial services"
__url__ = "https://github.com/unified-financial/ai-service"
__license__ = "Proprietary"
__copyright__ = f"Copyright 2025 Unified Financial Services Platform"

# Test configuration constants
TEST_CONFIG = {
    "environment": os.getenv("TEST_ENV", "test"),
    "log_level": os.getenv("TEST_LOG_LEVEL", "INFO"),
    "timeout": int(os.getenv("TEST_TIMEOUT", "30")),
    "parallel_workers": int(os.getenv("TEST_WORKERS", "4")),
    "coverage_threshold": float(os.getenv("COVERAGE_THRESHOLD", "95.0")),
    "enable_integration_tests": os.getenv("ENABLE_INTEGRATION_TESTS", "true").lower() == "true",
    "enable_performance_tests": os.getenv("ENABLE_PERFORMANCE_TESTS", "false").lower() == "true",
    "mock_external_apis": os.getenv("MOCK_EXTERNAL_APIS", "true").lower() == "true",
}

# Test data directories
TEST_ROOT_DIR = Path(__file__).parent
TEST_DATA_DIR = TEST_ROOT_DIR / "data"
TEST_FIXTURES_DIR = TEST_ROOT_DIR / "fixtures"
TEST_REPORTS_DIR = TEST_ROOT_DIR / "reports"
TEST_LOGS_DIR = TEST_ROOT_DIR / "logs"

# AI/ML specific test configurations
AI_TEST_CONFIG = {
    "model_artifacts_dir": TEST_DATA_DIR / "models",
    "test_datasets_dir": TEST_DATA_DIR / "datasets",
    "model_performance_threshold": 0.85,
    "inference_timeout": 5.0,  # seconds
    "batch_size_limit": 1000,
    "memory_limit_mb": 2048,
    "gpu_enabled": os.getenv("TEST_GPU_ENABLED", "false").lower() == "true",
}

# Financial services specific test configurations
FINTECH_TEST_CONFIG = {
    "regulatory_compliance_checks": True,
    "pci_dss_validation": True,
    "gdpr_compliance_tests": True,
    "sox_audit_trails": True,
    "encryption_validation": True,
    "fraud_detection_sensitivity": 0.95,
    "risk_assessment_accuracy": 0.90,
    "transaction_processing_sla": 1.0,  # seconds
}

# Database test configurations
DATABASE_TEST_CONFIG = {
    "postgresql_test_db": os.getenv("POSTGRES_TEST_DB", "ai_service_test"),
    "mongodb_test_db": os.getenv("MONGO_TEST_DB", "ai_service_test"),
    "redis_test_db": int(os.getenv("REDIS_TEST_DB", "1")),
    "connection_pool_size": 5,
    "transaction_isolation": "READ_COMMITTED",
    "cleanup_after_tests": True,
}

# API testing configurations
API_TEST_CONFIG = {
    "base_url": os.getenv("AI_SERVICE_BASE_URL", "http://localhost:8000"),
    "api_version": "v1",
    "rate_limit_requests": 1000,
    "rate_limit_window": 3600,  # seconds
    "request_timeout": 30.0,
    "retry_attempts": 3,
    "retry_backoff": 1.0,
}

# Security testing configurations
SECURITY_TEST_CONFIG = {
    "jwt_secret_key": os.getenv("TEST_JWT_SECRET", "test-secret-key-for-ai-service"),
    "encryption_key": os.getenv("TEST_ENCRYPTION_KEY", "test-encryption-key-32-chars"),
    "oauth2_test_client_id": os.getenv("TEST_OAUTH2_CLIENT_ID", "test-client-id"),
    "oauth2_test_client_secret": os.getenv("TEST_OAUTH2_CLIENT_SECRET", "test-client-secret"),
    "test_user_permissions": ["read", "write", "admin"],
    "vulnerability_scan_enabled": True,
}


def setup_test_logging() -> logging.Logger:
    """
    Configure comprehensive logging for the test suite.
    
    Sets up structured logging with appropriate levels, formatters, and handlers
    for both console and file output. Includes security audit trails and
    performance metrics logging as required by financial services compliance.
    
    Returns:
        logging.Logger: Configured logger instance for test operations
        
    Compliance:
        - SOX audit trail requirements
        - PCI-DSS logging standards
        - GDPR data processing logs
    """
    # Ensure logs directory exists
    TEST_LOGS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Configure logger
    logger = logging.getLogger("ai_service_tests")
    logger.setLevel(getattr(logging, TEST_CONFIG["log_level"]))
    
    # Prevent duplicate handlers
    if logger.handlers:
        logger.handlers.clear()
    
    # Console handler with colored output
    console_handler = logging.StreamHandler(sys.stdout)
    console_formatter = logging.Formatter(
        fmt='%(asctime)s | %(levelname)-8s | %(name)s | %(funcName)s:%(lineno)d | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    # File handler for persistent logging
    log_file = TEST_LOGS_DIR / f"ai_service_tests_{datetime.now().strftime('%Y%m%d')}.log"
    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_formatter = logging.Formatter(
        fmt='%(asctime)s | %(levelname)-8s | %(name)s | %(process)d | %(thread)d | '
            '%(funcName)s:%(lineno)d | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)
    
    # Security audit log handler (separate file for compliance)
    audit_log_file = TEST_LOGS_DIR / f"security_audit_{datetime.now().strftime('%Y%m%d')}.log"
    audit_handler = logging.FileHandler(audit_log_file, encoding='utf-8')
    audit_formatter = logging.Formatter(
        fmt='%(asctime)s | AUDIT | %(name)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    audit_handler.setFormatter(audit_formatter)
    
    # Create separate security logger
    security_logger = logging.getLogger("ai_service_security_audit")
    security_logger.setLevel(logging.INFO)
    if security_logger.handlers:
        security_logger.handlers.clear()
    security_logger.addHandler(audit_handler)
    
    logger.info(f"Test logging initialized - Environment: {TEST_CONFIG['environment']}")
    security_logger.info("Security audit logging initialized for AI service tests")
    
    return logger


def setup_test_environment() -> Dict[str, Any]:
    """
    Initialize the comprehensive test environment for AI service testing.
    
    Configures test directories, environment variables, database connections,
    external API mocks, and security settings required for enterprise-grade
    testing of financial AI services.
    
    Returns:
        Dict[str, Any]: Environment configuration summary
        
    Raises:
        EnvironmentError: If critical test dependencies are not available
        
    Features:
        - Test data directory structure creation
        - Environment variable validation
        - Database test configuration
        - AI/ML model test setup
        - Security context initialization
    """
    logger = setup_test_logging()
    
    try:
        # Create required test directories
        directories = [
            TEST_DATA_DIR,
            TEST_FIXTURES_DIR,
            TEST_REPORTS_DIR,
            TEST_LOGS_DIR,
            AI_TEST_CONFIG["model_artifacts_dir"],
            AI_TEST_CONFIG["test_datasets_dir"]
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            logger.debug(f"Created test directory: {directory}")
        
        # Validate critical environment variables
        required_env_vars = [
            "TEST_ENV",
            "AI_SERVICE_BASE_URL",
            "POSTGRES_TEST_DB",
            "MONGO_TEST_DB"
        ]
        
        missing_vars = []
        for var in required_env_vars:
            if not os.getenv(var):
                missing_vars.append(var)
        
        if missing_vars:
            logger.warning(f"Missing optional environment variables: {missing_vars}")
        
        # Configure Python warnings for test environment
        if TEST_CONFIG["environment"] == "test":
            warnings.filterwarnings("ignore", category=DeprecationWarning)
            warnings.filterwarnings("ignore", category=PendingDeprecationWarning)
            logger.debug("Configured warning filters for test environment")
        
        # Set up AI/ML specific configurations
        if AI_TEST_CONFIG["gpu_enabled"]:
            os.environ["CUDA_VISIBLE_DEVICES"] = "0"
            logger.info("GPU testing enabled for AI/ML models")
        else:
            os.environ["CUDA_VISIBLE_DEVICES"] = ""
            logger.info("CPU-only testing configured for AI/ML models")
        
        # Configure test database settings
        os.environ["DATABASE_URL"] = f"postgresql://localhost:5432/{DATABASE_TEST_CONFIG['postgresql_test_db']}"
        os.environ["MONGODB_URL"] = f"mongodb://localhost:27017/{DATABASE_TEST_CONFIG['mongodb_test_db']}"
        os.environ["REDIS_URL"] = f"redis://localhost:6379/{DATABASE_TEST_CONFIG['redis_test_db']}"
        
        # Configure security test settings
        os.environ["JWT_SECRET_KEY"] = SECURITY_TEST_CONFIG["jwt_secret_key"]
        os.environ["ENCRYPTION_KEY"] = SECURITY_TEST_CONFIG["encryption_key"]
        
        environment_summary = {
            "test_package_version": __version__,
            "python_version": sys.version,
            "test_environment": TEST_CONFIG["environment"],
            "directories_created": len(directories),
            "ai_gpu_enabled": AI_TEST_CONFIG["gpu_enabled"],
            "security_tests_enabled": SECURITY_TEST_CONFIG["vulnerability_scan_enabled"],
            "integration_tests_enabled": TEST_CONFIG["enable_integration_tests"],
            "performance_tests_enabled": TEST_CONFIG["enable_performance_tests"],
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info("AI Service test environment initialized successfully")
        logger.info(f"Environment summary: {environment_summary}")
        
        return environment_summary
        
    except Exception as e:
        logger.error(f"Failed to initialize test environment: {str(e)}")
        raise EnvironmentError(f"Test environment setup failed: {str(e)}")


def get_test_config(config_type: str = "default") -> Dict[str, Any]:
    """
    Retrieve specific test configuration based on the requested type.
    
    Provides access to different configuration sets for various testing scenarios
    including unit tests, integration tests, performance tests, and security tests.
    
    Args:
        config_type (str): Type of configuration to retrieve
            Options: "default", "ai", "fintech", "database", "api", "security"
    
    Returns:
        Dict[str, Any]: Configuration dictionary for the specified type
        
    Raises:
        ValueError: If config_type is not recognized
        
    Examples:
        >>> config = get_test_config("ai")
        >>> model_dir = config["model_artifacts_dir"]
        
        >>> db_config = get_test_config("database")
        >>> test_db = db_config["postgresql_test_db"]
    """
    config_mapping = {
        "default": TEST_CONFIG,
        "ai": AI_TEST_CONFIG,
        "fintech": FINTECH_TEST_CONFIG,
        "database": DATABASE_TEST_CONFIG,
        "api": API_TEST_CONFIG,
        "security": SECURITY_TEST_CONFIG
    }
    
    if config_type not in config_mapping:
        raise ValueError(f"Unknown config type: {config_type}. "
                        f"Available types: {list(config_mapping.keys())}")
    
    return config_mapping[config_type].copy()


# Initialize test environment when module is imported
try:
    _test_environment = setup_test_environment()
    _test_logger = logging.getLogger("ai_service_tests")
    _test_logger.info(f"AI Service Test Package v{__version__} loaded successfully")
except Exception as e:
    print(f"Warning: Failed to initialize test environment: {e}")
    _test_environment = {}

# Export public interface
__all__ = [
    "__version__",
    "__author__",
    "__title__",
    "__description__",
    "TEST_CONFIG",
    "AI_TEST_CONFIG",
    "FINTECH_TEST_CONFIG",
    "DATABASE_TEST_CONFIG",
    "API_TEST_CONFIG",
    "SECURITY_TEST_CONFIG",
    "TEST_ROOT_DIR",
    "TEST_DATA_DIR",
    "TEST_FIXTURES_DIR",
    "TEST_REPORTS_DIR",
    "TEST_LOGS_DIR",
    "setup_test_logging",
    "setup_test_environment",
    "get_test_config"
]