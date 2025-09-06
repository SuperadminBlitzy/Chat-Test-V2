"""
AI Service API Package Initialization

This module initializes the 'api' package for the AI service, making the main API router
available for inclusion in the FastAPI application. This design promotes clean separation
of concerns and simplifies the API module structure by providing a single entry point
for all AI service endpoints.

Features Addressed:
- F-002: AI-Powered Risk Assessment Engine - Exposes risk assessment endpoints
- F-006: Fraud Detection System - Provides fraud detection API endpoints  
- F-007: Personalized Financial Recommendations - Serves recommendation endpoints

The API package serves as the presentation layer for the AI service, implementing
three core enterprise-grade endpoints:

1. Risk Assessment (/api/v1/ai/risk-assessment)
   - Real-time risk scoring with <500ms response time
   - Predictive risk modeling and analysis
   - Regulatory compliance with explainable AI

2. Fraud Detection (/api/v1/ai/fraud-detection)
   - Real-time transaction fraud analysis with <200ms response time
   - Binary fraud classification with probability scoring
   - Enterprise-grade audit logging and monitoring

3. Personalized Recommendations (/api/v1/ai/recommendations/{user_id})
   - Customer-specific financial recommendations with <1s response time
   - Multi-category recommendation generation
   - GDPR-compliant data processing and privacy protection

Technical Architecture:
The API package follows a clean layered architecture pattern:
- API Layer (routes.py): Request validation, response formatting, error handling
- Service Layer: Business logic implementation and AI model orchestration
- Data Layer: Model inference, preprocessing, and feature engineering

Enterprise Features:
- Comprehensive audit logging for SOC2, PCI DSS, GDPR, and Basel III/IV compliance
- Performance monitoring and SLA tracking for all endpoints
- Enterprise-grade error handling with structured error responses
- Security controls including input validation and injection prevention
- Dependency injection for clean service layer separation and testability

Usage:
This package is designed to be imported by the main FastAPI application:

```python
from fastapi import FastAPI
from api import router as ai_router

app = FastAPI()
app.include_router(ai_router)
```

The router export simplifies integration and maintains clean separation between
the API definition and the main application configuration.

Author: AI Service Team
Version: 1.0.0
Last Updated: 2025
Compliance: SOC2 Type II, PCI DSS Level 1, GDPR Article 25, Basel III/IV
Performance: Sub-second response times, 99.9% availability, enterprise SLA compliance
Security: End-to-end encryption, comprehensive audit trails, privacy by design
"""

# Import the main API router from the routes module
# This router contains all AI service endpoints with comprehensive implementation:
# - Risk assessment endpoint with real-time AI-powered analysis
# - Fraud detection endpoint with enterprise-grade transaction monitoring  
# - Personalized recommendations endpoint with customer profiling
# All endpoints include enterprise features: audit logging, performance monitoring,
# error handling, and regulatory compliance controls
from .routes import router

# Export the router at package level for clean integration
# This allows the main FastAPI application to include all AI service routes
# by importing directly from the api package: `from api import router`
# The export promotes clean architecture and separation of concerns between
# the API package and the main application configuration
__all__ = ['router']

# Package metadata for enterprise audit and compliance tracking
__version__ = '1.0.0'
__author__ = 'AI Service Team'
__description__ = 'AI Service API package providing enterprise-grade financial AI endpoints'
__package_name__ = 'ai-service-api'

# Features supported by this API package aligned with technical specifications
__features_supported__ = [
    'F-002: AI-Powered Risk Assessment Engine',
    'F-006: Fraud Detection System', 
    'F-007: Personalized Financial Recommendations'
]

# Compliance frameworks implemented across all API endpoints
__compliance_frameworks__ = [
    'SOC2 Type II',      # Security controls and audit requirements
    'PCI DSS Level 1',   # Payment card data protection standards
    'GDPR Article 25',   # Data protection by design and by default
    'Basel III/IV'       # Banking regulatory framework compliance
]

# Performance targets and SLA commitments for enterprise deployment
__performance_targets__ = {
    'risk_assessment_sla_ms': 500,      # F-002-RQ-001: <500ms response time
    'fraud_detection_sla_ms': 200,      # Real-time fraud detection requirement
    'recommendations_sla_ms': 1000,     # Personalized recommendations target
    'availability_target': '99.9%',     # Enterprise availability commitment
    'throughput_capacity': '10000_rps'  # Requests per second capacity
}

# Security and audit features implemented across the API package
__security_features__ = [
    'comprehensive_audit_logging',      # Full audit trails for all requests
    'input_validation_sanitization',    # Protection against injection attacks
    'structured_error_handling',        # Secure error responses without data leakage
    'request_rate_limiting',            # DoS protection and resource management
    'data_encryption_in_transit',       # End-to-end encryption for all communications
    'privacy_preserving_analytics'      # Customer data protection and anonymization
]

# Enterprise architecture patterns implemented in the API package
__architecture_patterns__ = [
    'clean_layered_architecture',       # Separation of API, service, and data layers
    'dependency_injection',             # Loose coupling and enhanced testability
    'singleton_service_management',     # Optimized resource usage and performance
    'comprehensive_monitoring',         # Performance metrics and health checks
    'graceful_error_handling',          # Resilient error recovery and user experience
    'regulatory_compliance_by_design'   # Built-in compliance controls and reporting
]