# API Endpoint Specification

This document provides a comprehensive specification of all API endpoints for the Unified Financial Services Platform, designed for developers integrating with our enterprise-grade financial services infrastructure.

For general API guidelines, versioning, and error handling, please refer to the [API Documentation](./api-documentation.md).

For details on authentication and authorization, please refer to the [Authentication Documentation](./authentication.md).

## Table of Contents

- [Authentication Service](#authentication-service)
- [Customer Service](#customer-service)
- [Transaction Service](#transaction-service)
- [Risk Assessment Service](#risk-assessment-service)
- [Compliance Service](#compliance-service)
- [Analytics Service](#analytics-service)
- [Financial Wellness Service](#financial-wellness-service)
- [Blockchain Service](#blockchain-service)
- [Notification Service](#notification-service)
- [Data Models](#data-models)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)

---

## Authentication Service

Base Path: `/api/v1/auth`

The Authentication Service implements enterprise-grade security with OAuth 2.0, multi-factor authentication, and zero-trust architecture principles. All endpoints support rate limiting and comprehensive audit logging.

### Endpoints

#### POST /login

**Description**: Authenticates a user and returns a JWT access token and refresh token with enterprise security controls.

**Request Headers**:
```http
Content-Type: application/json
X-Request-ID: string (optional)
User-Agent: string (required)
```

**Request Body**:
```json
{
  "username": "string (required, 3-255 characters)",
  "password": "string (required, 8-128 characters)",
  "mfa_code": "string (optional, 6-8 digits)",
  "remember_me": "boolean (optional, default: false)",
  "device_info": {
    "device_id": "string (optional)",
    "device_type": "string (optional)", // "web", "mobile", "api"
    "os": "string (optional)",
    "browser": "string (optional)"
  },
  "client_metadata": {
    "ip_address": "string (optional)",
    "user_agent": "string (optional)",
    "timezone": "string (optional)"
  }
}
```

**Response Body** (200 OK):
```json
{
  "access_token": "string (JWT, expires in 15 minutes)",
  "refresh_token": "string (encrypted, expires in 30 days)",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_expires_in": 2592000,
  "user_id": "string (UUID)",
  "user_profile": {
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "roles": ["array", "of", "role", "strings"],
    "permissions": ["array", "of", "permission", "strings"]
  },
  "session_id": "string (UUID)",
  "device_registered": "boolean",
  "mfa_required": "boolean",
  "password_expires_in": "number (days)"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request format or missing required fields
- `401 Unauthorized`: Invalid credentials
- `423 Locked`: Account locked due to multiple failed attempts
- `428 Precondition Required`: MFA required
- `429 Too Many Requests`: Rate limit exceeded

**Rate Limiting**: 10 requests per minute per IP address
**Performance**: Average response time <500ms, 99.9% availability

#### POST /refresh

**Description**: Refreshes an expired access token using a valid refresh token with automatic rotation.

**Request Headers**:
```http
Content-Type: application/json
Authorization: Bearer <refresh_token>
X-Request-ID: string (optional)
```

**Request Body**:
```json
{
  "refresh_token": "string (required)",
  "device_id": "string (optional)"
}
```

**Response Body** (200 OK):
```json
{
  "access_token": "string (JWT)",
  "refresh_token": "string (new token with rotation)",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_expires_in": 2592000,
  "session_id": "string"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid refresh token format
- `401 Unauthorized`: Expired or invalid refresh token
- `403 Forbidden`: Token family compromised (security breach detected)

#### POST /logout

**Description**: Logs out the user, invalidates the session, and blacklists all associated tokens.

**Request Headers**:
```http
Authorization: Bearer <access_token>
X-Request-ID: string (optional)
```

**Request Body**:
```json
{
  "logout_all_devices": "boolean (optional, default: false)"
}
```

**Response** (204 No Content)

**Error Responses**:
- `401 Unauthorized`: Invalid or expired token

#### POST /mfa/challenge

**Description**: Initiates a multi-factor authentication challenge for enhanced security operations.

**Request Headers**:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "method": "string (required)", // "sms", "email", "push", "totp", "webauthn"
  "context": {
    "action": "string (required)", // "high_value_transfer", "admin_access", "sensitive_data"
    "amount": "number (optional)",
    "currency": "string (optional)",
    "target_account": "string (optional)"
  }
}
```

**Response Body** (201 Created):
```json
{
  "challenge_id": "string (UUID)",
  "method": "string",
  "delivery_status": "string", // "sent", "pending", "failed"
  "expires_at": "string (ISO 8601 datetime)",
  "retry_count": "number",
  "max_retries": "number"
}
```

#### POST /mfa/verify

**Description**: Verifies a multi-factor authentication challenge response.

**Request Headers**:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "challenge_id": "string (required, UUID)",
  "token": "string (required)", // OTP code or signed challenge
  "method": "string (required)"
}
```

**Response Body** (200 OK):
```json
{
  "verified": "boolean",
  "mfa_token": "string (temporary token for elevated operations)",
  "expires_in": 300,
  "remaining_attempts": "number"
}
```

---

## Customer Service

Base Path: `/api/v1/customers`

The Customer Service manages customer data, profiles, and digital onboarding processes with AI-powered identity verification and comprehensive KYC/AML compliance.

### Endpoints

#### POST /onboarding

**Description**: Initiates the AI-powered digital customer onboarding process with real-time identity verification and risk assessment.

**Request Headers**:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
X-Request-ID: string (required)
X-Client-IP: string (optional)
```

**Request Body**:
```json
{
  "personal_info": {
    "first_name": "string (required, 1-50 characters)",
    "last_name": "string (required, 1-50 characters)",
    "middle_name": "string (optional, 1-50 characters)",
    "date_of_birth": "string (required, YYYY-MM-DD)",
    "ssn": "string (required, encrypted)",
    "phone": "string (required, E.164 format)",
    "email": "string (required, valid email)",
    "nationality": "string (required, ISO 3166-1 alpha-2)",
    "preferred_language": "string (optional, ISO 639-1)"
  },
  "address": {
    "street": "string (required, 1-100 characters)",
    "street2": "string (optional, 1-100 characters)",
    "city": "string (required, 1-50 characters)",
    "state": "string (required, 2-50 characters)",
    "zip_code": "string (required, 5-10 characters)",
    "country": "string (required, ISO 3166-1 alpha-2)"
  },
  "identity_documents": [
    {
      "type": "string (required)", // "passport", "drivers_license", "national_id", "utility_bill"
      "document_data": "string (required, base64 encoded)",
      "document_back": "string (optional, base64 encoded)",
      "document_metadata": {
        "file_size": "number",
        "file_type": "string", // "image/jpeg", "image/png", "application/pdf"
        "capture_method": "string" // "camera", "scanner", "upload"
      }
    }
  ],
  "biometric_data": {
    "selfie": "string (required, base64 encoded)",
    "fingerprint": "string (optional, base64 encoded)",
    "voice_sample": "string (optional, base64 encoded)"
  },
  "account_preferences": {
    "account_type": "string (required)", // "checking", "savings", "business", "investment"
    "initial_deposit": "number (optional, minimum based on account type)",
    "communication_preferences": {
      "email": "boolean (default: true)",
      "sms": "boolean (default: false)",
      "push": "boolean (default: true)"
    }
  },
  "risk_profile": {
    "annual_income": "number (optional)",
    "employment_status": "string (optional)",
    "investment_experience": "string (optional)",
    "risk_tolerance": "string (optional)" // "conservative", "moderate", "aggressive"
  }
}
```

**Response Body** (201 Created):
```json
{
  "onboarding_id": "string (UUID)",
  "customer_id": "string (UUID)",
  "status": "string", // "pending", "under_review", "approved", "rejected", "requires_additional_info"
  "verification_results": {
    "identity_verification": {
      "status": "string", // "passed", "failed", "manual_review"
      "confidence_score": "number (0-1)",
      "document_authenticity": "string", // "authentic", "suspicious", "failed"
      "biometric_match": "number (0-1)",
      "liveness_check": "boolean"
    },
    "aml_check": {
      "status": "string", // "clear", "potential_match", "match"
      "risk_level": "string", // "low", "medium", "high", "critical"
      "sanctions_screening": "boolean",
      "pep_screening": "boolean",
      "adverse_media_check": "boolean"
    },
    "kyc_status": "string", // "compliant", "requires_edd", "non_compliant"
    "risk_assessment": {
      "overall_score": "number (0-1000)",
      "category": "string", // "low", "medium", "high"
      "contributing_factors": ["array", "of", "risk", "indicators"]
    }
  },
  "next_steps": [
    {
      "action": "string",
      "description": "string",
      "deadline": "string (ISO 8601 datetime)",
      "priority": "string" // "low", "medium", "high", "urgent"
    }
  ],
  "estimated_completion": "string (ISO 8601 datetime)",
  "compliance_requirements": {
    "documents_needed": ["array", "of", "document", "types"],
    "verification_level": "string", // "standard", "enhanced", "simplified"
    "regulatory_flags": ["array", "of", "compliance", "requirements"]
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request data or missing required fields
- `409 Conflict`: Customer already exists (duplicate detection)
- `422 Unprocessable Entity`: Business rule violations (e.g., age restrictions)

**Performance**: Average processing time <5 minutes, 99% accuracy in identity verification
**Rate Limiting**: 5 requests per minute per user

#### GET /{customerId}

**Description**: Retrieves comprehensive customer profile information with security controls and audit logging.

**Request Headers**:
```http
Authorization: Bearer <access_token>
X-Request-ID: string (required)
```

**Path Parameters**:
- `customerId` (string, required): Unique customer identifier (UUID format)

**Query Parameters**:
- `include` (string, optional): Comma-separated list of additional data sections
  - `transactions`, `risk_profile`, `wellness_data`, `compliance_history`, `account_details`
- `fields` (string, optional): Comma-separated list of specific fields to include
- `audit_trail` (boolean, optional): Include audit trail information (requires elevated permissions)

**Response Body** (200 OK):
```json
{
  "customer_id": "string (UUID)",
  "personal_info": {
    "first_name": "string",
    "last_name": "string",
    "middle_name": "string",
    "date_of_birth": "string (YYYY-MM-DD)",
    "phone": "string (masked for security)",
    "email": "string (masked for security)",
    "nationality": "string",
    "preferred_language": "string"
  },
  "address": {
    "street": "string",
    "street2": "string",
    "city": "string",
    "state": "string",
    "zip_code": "string",
    "country": "string",
    "is_verified": "boolean",
    "verification_date": "string (ISO 8601 datetime)"
  },
  "account_status": "string", // "active", "inactive", "suspended", "closed", "pending"
  "account_details": {
    "account_numbers": ["array", "of", "masked", "account", "numbers"],
    "account_types": ["array", "of", "account", "types"],
    "primary_account": "string",
    "account_opening_date": "string (ISO 8601 datetime)"
  },
  "risk_profile": {
    "risk_score": "number (0-1000)",
    "risk_category": "string", // "low", "medium", "high", "critical"
    "last_assessment": "string (ISO 8601 datetime)",
    "next_review_date": "string (ISO 8601 datetime)",
    "risk_factors": ["array", "of", "identified", "risk", "factors"]
  },
  "compliance_status": {
    "kyc_status": "string", // "compliant", "requires_review", "expired"
    "aml_status": "string", // "clear", "monitoring", "investigation"
    "last_review": "string (ISO 8601 datetime)",
    "next_review_due": "string (ISO 8601 datetime)",
    "compliance_alerts": ["array", "of", "active", "alerts"]
  },
  "verification_status": {
    "identity_verified": "boolean",
    "address_verified": "boolean",
    "phone_verified": "boolean",
    "email_verified": "boolean",
    "biometric_enrolled": "boolean"
  },
  "preferences": {
    "communication_channels": ["email", "sms", "push"],
    "language": "string",
    "timezone": "string",
    "marketing_consent": "boolean",
    "data_sharing_consent": "boolean"
  },
  "created_at": "string (ISO 8601 datetime)",
  "updated_at": "string (ISO 8601 datetime)",
  "last_login": "string (ISO 8601 datetime)",
  "metadata": {
    "source": "string", // "web", "mobile", "branch", "call_center"
    "customer_segment": "string", // "retail", "premium", "business", "enterprise"
    "relationship_manager": "string (optional)"
  }
}
```

**Error Responses**:
- `404 Not Found`: Customer not found
- `403 Forbidden`: Insufficient permissions to access customer data
- `429 Too Many Requests`: Rate limit exceeded

#### PUT /{customerId}

**Description**: Updates customer profile information with comprehensive validation and audit trail.

**Request Headers**:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
X-Request-ID: string (required)
If-Match: string (optional, for optimistic concurrency control)
```

**Request Body**:
```json
{
  "personal_info": {
    "phone": "string (optional, E.164 format)",
    "email": "string (optional, valid email)",
    "preferred_language": "string (optional, ISO 639-1)"
  },
  "address": {
    "street": "string (optional)",
    "street2": "string (optional)",
    "city": "string (optional)",
    "state": "string (optional)",
    "zip_code": "string (optional)",
    "country": "string (optional, ISO 3166-1 alpha-2)"
  },
  "preferences": {
    "communication_channels": ["array", "optional"],
    "marketing_consent": "boolean (optional)",
    "data_sharing_consent": "boolean (optional)",
    "timezone": "string (optional)"
  },
  "risk_profile": {
    "annual_income": "number (optional)",
    "employment_status": "string (optional)",
    "investment_experience": "string (optional)",
    "risk_tolerance": "string (optional)"
  },
  "update_metadata": {
    "reason": "string (required)", // "customer_request", "data_correction", "compliance_update"
    "source": "string (optional)", // "web", "mobile", "admin", "api"
    "notes": "string (optional, max 500 characters)"
  }
}
```

**Response Body** (200 OK):
```json
{
  "customer_id": "string (UUID)",
  "updated_fields": ["array", "of", "field", "names", "that", "were", "updated"],
  "validation_results": {
    "warnings": ["array", "of", "validation", "warnings"],
    "address_verification": {
      "status": "string", // "verified", "pending", "failed"
      "provider": "string"
    }
  },
  "audit_trail": {
    "updated_by": "string (user ID)",
    "updated_at": "string (ISO 8601 datetime)",
    "reason": "string",
    "change_summary": "object (before/after values)",
    "approval_required": "boolean"
  },
  "compliance_impact": {
    "kyc_review_triggered": "boolean",
    "risk_reassessment_required": "boolean",
    "notification_sent": "boolean"
  }
}
```

#### GET /

**Description**: Retrieves a paginated list of customers with advanced filtering and search capabilities (authorized personnel only).

**Request Headers**:
```http
Authorization: Bearer <access_token>
X-Request-ID: string (required)
```

**Query Parameters**:
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 50, max: 200): Number of records per page
- `sort` (string, optional, default: "created_at"): Sort field
- `order` (string, optional, default: "desc"): Sort order ("asc" or "desc")
- `status` (string, optional): Filter by account status
- `risk_level` (string, optional): Filter by risk level
- `search` (string, optional): Search by name, email, or customer ID
- `created_after` (string, optional): Filter by creation date (ISO 8601)
- `created_before` (string, optional): Filter by creation date (ISO 8601)
- `segment` (string, optional): Filter by customer segment
- `compliance_status` (string, optional): Filter by compliance status

**Response Body** (200 OK):
```json
{
  "customers": [
    {
      "customer_id": "string (UUID)",
      "name": "string (full name)",
      "email": "string (masked)",
      "phone": "string (masked)",
      "account_status": "string",
      "risk_level": "string",
      "compliance_status": "string",
      "segment": "string",
      "created_at": "string (ISO 8601 datetime)",
      "last_activity": "string (ISO 8601 datetime)",
      "account_balance": "number (total across accounts)"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total_pages": "number",
    "total_records": "number",
    "has_next": "boolean",
    "has_previous": "boolean"
  },
  "summary": {
    "total_customers": "number",
    "active_customers": "number",
    "high_risk_customers": "number",
    "compliance_alerts": "number"
  },
  "filters_applied": {
    "status": "string",
    "risk_level": "string",
    "search_query": "string"
  }
}
```

---

## Transaction Service

Base Path: `/api/v1/transactions`

The Transaction Service handles financial transactions with real-time fraud detection, blockchain settlement integration, and comprehensive audit trails. Supports 10,000+ TPS with sub-second response times.

### Endpoints

#### POST /

**Description**: Initiates a new financial transaction with real-time risk assessment, fraud detection, and blockchain settlement capabilities.

**Request Headers**:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
X-Request-ID: string (required)
X-Idempotency-Key: string (required, UUID)
X-Client-IP: string (optional)
```

**Request Body**:
```json
{
  "transaction_type": "string (required)", // "transfer", "payment", "withdrawal", "deposit", "wire", "ach"
  "from_account": "string (required, account identifier)",
  "to_account": "string (required, account identifier or external account)",
  "amount": {
    "value": "number (required, positive, up to 2 decimal places)",
    "currency": "string (required, ISO 4217 currency code)"
  },
  "description": "string (optional, max 255 characters)",
  "reference": "string (optional, max 50 characters, alphanumeric)",
  "scheduled_date": "string (optional, ISO 8601 datetime, future date)",
  "priority": "string (optional, default: standard)", // "standard", "high", "urgent"
  "metadata": {
    "source": "string (required)", // "web", "mobile", "api", "branch"
    "channel": "string (required)", // "online", "atm", "branch", "phone"
    "purpose": "string (optional)", // "salary", "rent", "investment", "loan_payment"
    "tags": ["array", "of", "strings", "optional"],
    "location": {
      "latitude": "number (optional)",
      "longitude": "number (optional)",
      "country": "string (optional, ISO 3166-1 alpha-2)",
      "ip_address": "string (optional)"
    },
    "device_info": {
      "device_id": "string (optional)",
      "device_type": "string (optional)",
      "os": "string (optional)",
      "app_version": "string (optional)"
    }
  },
  "compliance_info": {
    "regulatory_purpose": "string (optional)",
    "beneficiary_info": {
      "name": "string (optional)",
      "address": "string (optional)",
      "relationship": "string (optional)"
    }
  },
  "settlement_preferences": {
    "method": "string (optional, default: standard)", // "standard", "instant", "blockchain"
    "blockchain_network": "string (optional)", // "hyperledger_fabric", "ethereum"
    "confirmation_required": "boolean (optional, default: true)"
  }
}
```

**Response Body** (201 Created):
```json
{
  "transaction_id": "string (UUID)",
  "status": "string", // "pending", "processing", "completed", "failed", "requires_approval", "scheduled"
  "transaction_reference": "string (unique transaction reference)",
  "risk_assessment": {
    "risk_score": "number (0-1000)",
    "risk_level": "string", // "low", "medium", "high", "critical"
    "fraud_indicators": [
      {
        "type": "string",
        "severity": "string", // "low", "medium", "high"
        "description": "string",
        "confidence": "number (0-1)"
      }
    ],
    "recommendation": "string", // "approve", "review", "decline", "require_mfa"
    "model_version": "string",
    "processing_time_ms": "number"
  },
  "processing_details": {
    "estimated_completion": "string (ISO 8601 datetime)",
    "network_processing_time": "string",
    "settlement_method": "string",
    "confirmation_count": "number (for blockchain transactions)"
  },
  "fees": {
    "processing_fee": "number",
    "network_fee": "number (for blockchain)",
    "total_fee": "number",
    "currency": "string",
    "fee_breakdown": [
      {
        "type": "string",
        "amount": "number",
        "description": "string"
      }
    ]
  },
  "compliance_checks": {
    "aml_status": "string", // "cleared", "flagged", "under_review"
    "sanctions_screening": "string", // "cleared", "potential_match", "blocked"
    "ctr_required": "boolean",
    "sar_filed": "boolean",
    "regulatory_flags": ["array", "of", "regulatory", "flags"]
  },
  "blockchain_details": {
    "transaction_hash": "string (optional)",
    "block_number": "number (optional)",
    "network": "string (optional)",
    "smart_contract_address": "string (optional)"
  },
  "approvals_required": [
    {
      "type": "string", // "manager", "compliance", "risk"
      "reason": "string",
      "deadline": "string (ISO 8601 datetime)"
    }
  ],
  "created_at": "string (ISO 8601 datetime)",
  "expires_at": "string (ISO 8601 datetime, for pending transactions)"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid transaction data
- `402 Payment Required`: Insufficient funds
- `403 Forbidden`: Transaction not allowed (policy violation)
- `409 Conflict`: Duplicate transaction (idempotency key already used)
- `422 Unprocessable Entity`: Business rule violation

**Performance**: Sub-second risk assessment, 10,000+ TPS capacity
**Rate Limiting**: 100 requests per minute per user

#### GET /{transactionId}

**Description**: Retrieves comprehensive details of a specific transaction with complete audit trail and blockchain verification.

**Request Headers**:
```http
Authorization: Bearer <access_token>
X-Request-ID: string (required)
```

**Path Parameters**:
- `transactionId` (string, required): Unique transaction identifier (UUID format)

**Query Parameters**:
- `include_audit_trail` (boolean, optional, default: false): Include complete audit trail
- `include_blockchain_details` (boolean, optional, default: false): Include blockchain verification details
- `include_risk_details` (boolean, optional, default: false): Include detailed risk assessment

**Response Body** (200 OK):
```json
{
  "transaction_id": "string (UUID)",
  "transaction_reference": "string",
  "transaction_type": "string",
  "status": "string",
  "amount": {
    "value": "number",
    "currency": "string",
    "original_amount": "number (if currency conversion occurred)",
    "original_currency": "string",
    "exchange_rate": "number (optional)"
  },
  "accounts": {
    "from_account": {
      "account_id": "string",
      "account_holder": "string",
      "account_type": "string",
      "bank_name": "string (for external accounts)",
      "routing_number": "string (masked, for external accounts)"
    },
    "to_account": {
      "account_id": "string",
      "account_holder": "string",
      "account_type": "string",
      "bank_name": "string (for external accounts)",
      "routing_number": "string (masked, for external accounts)"
    }
  },
  "processing_details": {
    "initiated_at": "string (ISO 8601 datetime)",
    "completed_at": "string (ISO 8601 datetime)",
    "processing_network": "string", // "ach", "wire", "instant", "blockchain"
    "reference_number": "string",
    "confirmation_number": "string",
    "settlement_date": "string (ISO 8601 datetime)"
  },
  "risk_assessment": {
    "risk_score": "number",
    "risk_level": "string",
    "fraud_detection_results": {
      "overall_score": "number",
      "individual_checks": [
        {
          "check_name": "string",
          "result": "string", // "pass", "fail", "warning"
          "score": "number",
          "details": "string"
        }
      ],
      "machine_learning_insights": {
        "model_predictions": ["array", "of", "predictions"],
        "feature_importance": ["array", "of", "important", "features"],
        "anomaly_score": "number"
      }
    }
  },
  "compliance_details": {
    "aml_screening": {
      "status": "string",
      "screening_time": "string (ISO 8601 datetime)",
      "matches_found": "number",
      "review_required": "boolean"
    },
    "sanctions_check": {
      "status": "string",
      "lists_checked": ["array", "of", "sanctions", "lists"],
      "matches": ["array", "of", "potential", "matches"]
    },
    "regulatory_reporting": {
      "ctr_filed": "boolean",
      "sar_required": "boolean",
      "reports_generated": ["array", "of", "report", "types"]
    }
  },
  "blockchain_details": {
    "settlement_id": "string (optional)",
    "transaction_hash": "string (optional)",
    "block_hash": "string (optional)",
    "block_number": "number (optional)",
    "confirmation_count": "number (optional)",
    "network_fees": "number (optional)",
    "smart_contract_execution": {
      "contract_address": "string (optional)",
      "gas_used": "number (optional)",
      "execution_status": "string (optional)"
    }
  },
  "fees_applied": {
    "processing_fee": "number",
    "network_fee": "number",
    "regulatory_fee": "number",
    "total_fees": "number",
    "fee_currency": "string"
  },
  "audit_trail": [
    {
      "timestamp": "string (ISO 8601 datetime)",
      "action": "string",
      "actor": "string", // "system", "user", "admin"
      "actor_id": "string",
      "details": "string",
      "ip_address": "string (optional)",
      "user_agent": "string (optional)"
    }
  ],
  "related_transactions": [
    {
      "transaction_id": "string",
      "relationship": "string", // "reversal", "correction", "related"
      "created_at": "string"
    }
  ]
}
```

#### GET /accounts/{accountId}/transactions

**Description**: Retrieves paginated transaction history for a specific account with advanced filtering and analytics.

**Request Headers**:
```http
Authorization: Bearer <access_token>
X-Request-ID: string (required)
```

**Path Parameters**:
- `accountId` (string, required): Account identifier

**Query Parameters**:
- `page` (number, optional, default: 1): Page number
- `limit` (number, optional, default: 50, max: 200): Records per page
- `start_date` (string, optional): Filter from date (YYYY-MM-DD or ISO 8601)
- `end_date` (string, optional): Filter to date (YYYY-MM-DD or ISO 8601)
- `transaction_type` (string, optional): Filter by transaction type
- `status` (string, optional): Filter by transaction status
- `min_amount` (number, optional): Minimum transaction amount
- `max_amount` (number, optional): Maximum transaction amount
- `currency` (string, optional): Filter by currency
- `search` (string, optional): Search in description or reference
- `include_pending` (boolean, optional, default: true): Include pending transactions
- `sort` (string, optional, default: "created_at"): Sort field
- `order` (string, optional, default: "desc"): Sort order

**Response Body** (200 OK):
```json
{
  "account_id": "string",
  "account_info": {
    "account_holder": "string",
    "account_type": "string",
    "current_balance": "number",
    "available_balance": "number",
    "currency": "string"
  },
  "transactions": [
    {
      "transaction_id": "string",
      "transaction_reference": "string",
      "transaction_type": "string",
      "status": "string",
      "amount": {
        "value": "number",
        "currency": "string"
      },
      "counterparty": {
        "name": "string",
        "account_identifier": "string (masked)",
        "bank_name": "string"
      },
      "description": "string",
      "reference": "string",
      "category": "string", // auto-categorized
      "timestamp": "string (ISO 8601 datetime)",
      "balance_after": "number",
      "fees": "number",
      "risk_level": "string"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total_pages": "number",
    "total_records": "number",
    "has_next": "boolean",
    "has_previous": "boolean"
  },
  "summary": {
    "period": {
      "start_date": "string",
      "end_date": "string"
    },
    "totals": {
      "total_credits": "number",
      "total_debits": "number",
      "net_amount": "number",
      "transaction_count": "number",
      "average_transaction": "number"
    },
    "breakdown_by_type": [
      {
        "type": "string",
        "count": "number",
        "total_amount": "number",
        "percentage": "number"
      }
    ],
    "breakdown_by_category": [
      {
        "category": "string",
        "count": "number",
        "total_amount": "number",
        "percentage": "number"
      }
    ]
  },
  "analytics": {
    "spending_trends": [
      {
        "period": "string",
        "amount": "number",
        "change_percentage": "number"
      }
    ],
    "top_merchants": [
      {
        "merchant": "string",
        "transaction_count": "number",
        "total_amount": "number"
      }
    ],
    "unusual_activity": [
      {
        "type": "string",
        "description": "string",
        "transaction_id": "string"
      }
    ]
  }
}
```

---

## Risk Assessment Service

Base Path: `/api/v1/risk`

The Risk Assessment Service provides real-time AI-powered risk assessment and fraud detection with 95% accuracy rate and sub-500ms response times.

### Endpoints

#### POST /assessment

**Description**: Performs comprehensive risk assessment using advanced AI/ML models with explainable results and bias detection.

**Request Headers**:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
X-Request-ID: string (required)
```

**Request Body**:
```json
{
  "assessment_type": "string (required)", // "transaction", "customer", "portfolio", "loan_application"
  "subject_id": "string (required)", // transaction_id, customer_id, portfolio_id, or application_id
  "assessment_context": {
    "transaction_details": {
      "amount": "number (optional)",
      "currency": "string (optional)",
      "transaction_type": "string (optional)",
      "counterparty": "string (optional)",
      "frequency": "string (optional)", // "one_time", "recurring", "bulk"
      "location": {
        "country": "string (optional, ISO 3166-1 alpha-2)",
        "region": "string (optional)",
        "ip_address": "string (optional)",
        "coordinates": {
          "latitude": "number (optional)",
          "longitude": "number (optional)"
        }
      }
    },
    "customer_context": {
      "customer_id": "string (optional)",
      "account_age": "number (optional, days)",
      "relationship_length": "number (optional, months)",
      "transaction_history": {
        "volume_last_30d": "number (optional)",
        "average_amount": "number (optional)",
        "frequency": "number (optional)"
      },
      "profile_changes": {
        "recent_address_change": "boolean (optional)",
        "recent_contact_change": "boolean (optional)",
        "days_since_last_change": "number (optional)"
      }
    },
    "device_context": {
      "device_id": "string (optional)",
      "device_fingerprint": "string (optional)",
      "is_known_device": "boolean (optional)",
      "device_reputation": "number (optional, 0-1)",
      "behavioral_biometrics": {
        "typing_pattern": "object (optional)",
        "mouse_dynamics": "object (optional)",
        "touch_dynamics": "object (optional)"
      }
    },
    "market_conditions": {
      "volatility_index": "number (optional)",
      "market_sentiment": "string (optional)", // "bullish", "bearish", "neutral"
      "economic_indicators": ["array", "of", "indicators", "optional"]
    },
    "external_data": {
      "credit_score": "number (optional)",
      "income_verification": "boolean (optional)",
      "employment_status": "string (optional)",
      "debt_to_income_ratio": "number (optional)"
    }
  },
  "assessment_parameters": {
    "include_fraud_detection": "boolean (default: true)",
    "include_credit_risk": "boolean (default: true)",
    "include_market_risk": "boolean (default: false)",
    "include_operational_risk": "boolean (default: false)",
    "risk_model_version": "string (optional)",
    "explanation_level": "string (optional, default: standard)", // "basic", "standard", "detailed"
    "bias_check": "boolean (optional, default: true)",
    "benchmark_comparison": "boolean (optional, default: false)"
  }
}
```

**Response Body** (200 OK):
```json
{
  "assessment_id": "string (UUID)",
  "subject_id": "string",
  "assessment_type": "string",
  "risk_score": {
    "overall_score": "number (0-1000)",
    "confidence_level": "number (0-1)",
    "risk_category": "string", // "low", "medium", "high", "critical"
    "percentile_ranking": "number (0-100)",
    "score_distribution": {
      "fraud_risk": "number",
      "credit_risk": "number",
      "market_risk": "number",
      "operational_risk": "number"
    }
  },
  "detailed_assessment": {
    "fraud_risk": {
      "score": "number (0-1000)",
      "probability": "number (0-1)",
      "indicators": [
        {
          "type": "string",
          "severity": "string", // "low", "medium", "high", "critical"
          "description": "string",
          "confidence": "number (0-1)",
          "weight": "number"
        }
      ],
      "model_explanation": {
        "top_features": [
          {
            "feature": "string",
            "importance": "number",
            "value": "string",
            "impact": "string" // "positive", "negative"
          }
        ],
        "decision_path": ["array", "of", "decision", "steps"],
        "similar_cases": ["array", "of", "similar", "case", "references"]
      }
    },
    "credit_risk": {
      "score": "number (0-1000)",
      "probability_of_default": "number (0-1)",
      "credit_grade": "string", // "AAA", "AA", "A", "BBB", "BB", "B", "CCC", "CC", "C", "D"
      "factors": [
        {
          "factor": "string",
          "impact": "string", // "positive", "negative", "neutral"
          "weight": "number",
          "value": "string"
        }
      ],
      "benchmarks": {
        "industry_average": "number",
        "peer_group_average": "number",
        "historical_performance": "number"
      }
    },
    "operational_risk": {
      "score": "number (0-1000)",
      "risk_factors": [
        {
          "category": "string", // "process", "people", "systems", "external"
          "risk": "string",
          "probability": "number",
          "impact": "number",
          "mitigation": "string"
        }
      ],
      "scenario_analysis": ["array", "of", "risk", "scenarios"]
    }
  },
  "recommendations": [
    {
      "action": "string", // "approve", "review", "decline", "require_additional_verification", "apply_controls"
      "priority": "string", // "immediate", "high", "medium", "low"
      "reasoning": "string",
      "confidence": "number (0-1)",
      "suggested_controls": [
        {
          "control_type": "string",
          "description": "string",
          "implementation_cost": "string", // "low", "medium", "high"
          "effectiveness": "number (0-1)"
        }
      ],
      "timeline": "string", // "immediate", "within_24h", "within_week"
    }
  ],
  "model_metadata": {
    "model_version": "string",
    "model_type": "string", // "ensemble", "neural_network", "gradient_boosting"
    "training_date": "string (ISO 8601 datetime)",
    "performance_metrics": {
      "accuracy": "number",
      "precision": "number",
      "recall": "number",
      "f1_score": "number",
      "auc_roc": "number"
    },
    "bias_metrics": {
      "demographic_parity": "number",
      "equal_opportunity": "number",
      "calibration": "number"
    },
    "processing_time": "number (milliseconds)",
    "data_freshness": "string (ISO 8601 datetime)"
  },
  "assessed_at": "string (ISO 8601 datetime)",
  "expires_at": "string (ISO 8601 datetime)",
  "risk_monitoring": {
    "monitor_frequency": "string", // "real_time", "daily", "weekly"
    "alert_thresholds": {
      "score_increase": "number",
      "new_risk_factors": "boolean"
    },
    "next_assessment_due": "string (ISO 8601 datetime)"
  }
}
```

**Performance**: <500ms response time, 95% accuracy rate
**Rate Limiting**: 1000 requests per minute per service

#### POST /fraud-detection

**Description**: Analyzes transaction patterns and user behavior for potential fraud using advanced AI models with real-time decision making.

**Request Headers**:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
X-Request-ID: string (required)
```

**Request Body**:
```json
{
  "transaction_id": "string (required, UUID)",
  "real_time_data": {
    "device_fingerprint": "string (optional)",
    "ip_address": "string (optional)",
    "user_agent": "string (optional)",
    "geolocation": {
      "latitude": "number (optional)",
      "longitude": "number (optional)",
      "accuracy": "number (optional, meters)",
      "timestamp": "string (optional, ISO 8601 datetime)"
    },
    "network_info": {
      "isp": "string (optional)",
      "connection_type": "string (optional)", // "wifi", "cellular", "ethernet"
      "vpn_detected": "boolean (optional)",
      "proxy_detected": "boolean (optional)"
    },
    "behavioral_biometrics": {
      "typing_pattern": {
        "dwell_times": ["array", "of", "numbers"],
        "flight_times": ["array", "of", "numbers"],
        "typing_speed": "number"
      },
      "mouse_movement": {
        "velocity_patterns": ["array", "of", "numbers"],
        "click_patterns": ["array", "of", "coordinates"],
        "scroll_behavior": "object"
      },
      "touch_dynamics": {
        "pressure_patterns": ["array", "of", "numbers"],
        "swipe_velocities": ["array", "of", "numbers"],
        "tap_durations": ["array", "of", "numbers"]
      }
    },
    "session_data": {
      "session_duration": "number (seconds)",
      "pages_visited": "number",
      "form_completion_time": "number (seconds)",
      "copy_paste_detected": "boolean",
      "multiple_tabs": "boolean"
    }
  },
  "historical_context": {
    "include_account_history": "boolean (default: true)",
    "lookback_period": "number (days, default: 90)",
    "include_peer_analysis": "boolean (default: true)",
    "include_device_history": "boolean (default: true)"
  },
  "detection_parameters": {
    "sensitivity_level": "string (optional, default: standard)", // "low", "standard", "high", "maximum"
    "focus_areas": ["array", "of", "focus", "areas"], // "account_takeover", "synthetic_identity", "payment_fraud", "money_laundering"
    "real_time_scoring": "boolean (default: true)",
    "explanation_required": "boolean (default: true)"
  }
}
```

**Response Body** (200 OK):
```json
{
  "fraud_assessment_id": "string (UUID)",
  "transaction_id": "string",
  "fraud_score": "number (0-1000)",
  "fraud_probability": "number (0-1)",
  "risk_level": "string", // "low", "medium", "high", "critical"
  "decision": "string", // "allow", "challenge", "block", "manual_review"
  "fraud_indicators": [
    {
      "indicator_type": "string", // "velocity", "location", "device", "behavioral", "network"
      "severity": "string", // "low", "medium", "high", "critical"
      "description": "string",
      "confidence": "number (0-1)",
      "contributing_score": "number",
      "historical_frequency": "number"
    }
  ],
  "behavioral_analysis": {
    "device_analysis": {
      "is_known_device": "boolean",
      "device_risk_score": "number (0-1000)",
      "device_fingerprint_match": "number (0-1)",
      "anomalies": [
        {
          "type": "string",
          "description": "string",
          "severity": "string"
        }
      ],
      "device_reputation": "number (0-1)"
    },
    "location_analysis": {
      "is_usual_location": "boolean",
      "location_risk_score": "number (0-1000)",
      "distance_from_usual": "number (kilometers)",
      "velocity_analysis": {
        "impossible_travel": "boolean",
        "unlikely_travel": "boolean",
        "travel_time": "number (hours)"
      },
      "geolocation_spoofing": {
        "detected": "boolean",
        "confidence": "number (0-1)"
      }
    },
    "behavioral_analysis": {
      "biometric_match": "number (0-1)",
      "typing_pattern_anomaly": "boolean",
      "mouse_behavior_anomaly": "boolean",
      "session_behavior_score": "number (0-1000)",
      "automation_detected": "boolean"
    },
    "pattern_analysis": {
      "transaction_pattern_match": "number (0-1)",
      "time_pattern_anomaly": "boolean",
      "amount_pattern_anomaly": "boolean",
      "frequency_anomaly": "boolean",
      "peer_comparison": {
        "deviation_from_peer_group": "number",
        "peer_group_size": "number"
      }
    }
  },
  "network_analysis": {
    "ip_reputation": "number (0-1)",
    "proxy_vpn_analysis": {
      "proxy_detected": "boolean",
      "vpn_detected": "boolean",
      "tor_detected": "boolean",
      "anonymization_score": "number (0-1)"
    },
    "isp_analysis": {
      "isp_risk_level": "string",
      "known_fraudulent_isp": "boolean"
    }
  },
  "recommendation": {
    "action": "string", // "allow", "challenge", "block", "manual_review"
    "confidence": "number (0-1)",
    "reasoning": "string",
    "suggested_challenges": [
      {
        "type": "string", // "sms_otp", "email_otp", "push_notification", "security_questions", "biometric"
        "priority": "number"
      }
    ],
    "monitoring_recommendations": [
      {
        "type": "string",
        "duration": "string",
        "frequency": "string"
      }
    ]
  },
  "model_insights": {
    "primary_model": "string",
    "ensemble_models": ["array", "of", "model", "names"],
    "feature_importance": [
      {
        "feature": "string",
        "importance": "number",
        "value": "string"
      }
    ],
    "anomaly_scores": {
      "global_anomaly": "number",
      "local_anomaly": "number",
      "temporal_anomaly": "number"
    }
  },
  "processing_metadata": {
    "processing_time": "number (milliseconds)",
    "data_sources_used": ["array", "of", "data", "sources"],
    "model_versions": {
      "fraud_detection": "string",
      "behavioral_analysis": "string",
      "device_fingerprinting": "string"
    }
  },
  "processed_at": "string (ISO 8601 datetime)",
  "expires_at": "string (ISO 8601 datetime)",
  "correlation_id": "string (for tracking related assessments)"
}
```

---

## Compliance Service

Base Path: `/api/v1/compliance`

The Compliance Service manages regulatory compliance, AML checks, and automated reporting with real-time monitoring and comprehensive audit trails.

### Endpoints

#### POST /aml-check

**Description**: Performs comprehensive Anti-Money Laundering check with multi-jurisdictional screening and enhanced due diligence capabilities.

**Request Headers**:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
X-Request-ID: string (required)
```

**Request Body**:
```json
{
  "check_type": "string (required)", // "customer", "transaction", "periodic_review", "enhanced_dd"
  "subject_data": {
    "customer_id": "string (optional, UUID)",
    "transaction_id": "string (optional, UUID)",
    "customer_details": {
      "name": "string (required for customer checks)",
      "aliases": ["array", "of", "known", "aliases"],
      "date_of_birth": "string (optional, YYYY-MM-DD)",
      "nationality": "string (optional, ISO 3166-1 alpha-2)",
      "place_of_birth": "string (optional)",
      "gender": "string (optional)",
      "passport_number": "string (optional, encrypted)",
      "national_id": "string (optional, encrypted)",
      "address": {
        "street": "string (optional)",
        "city": "string (optional)",
        "state": "string (optional)",
        "country": "string (optional)",
        "postal_code": "string (optional)"
      }
    },
    "business_details": {
      "company_name": "string (optional)",
      "registration_number": "string (optional)",
      "incorporation_country": "string (optional)",
      "business_type": "string (optional)",
      "beneficial_owners": [
        {
          "name": "string",
          "ownership_percentage": "number",
          "role": "string"
        }
      ]
    },
    "transaction_details": {
      "amount": "number (optional)",
      "currency": "string (optional)",
      "counterparty": "string (optional)",
      "purpose": "string (optional)",
      "originating_country": "string (optional)",
      "destination_country": "string (optional)"
    }
  },
  "screening_parameters": {
    "sanctions_lists": ["array", "of", "lists"], // "OFAC", "UN", "EU", "HMT", "AUSTRAC", "national"
    "pep_screening": "boolean (default: true)",
    "adverse_media_screening": "boolean (default: true)",
    "enhanced_due_diligence": "boolean (default: false)",
    "jurisdictions": ["array", "of", "ISO", "country", "codes"],
    "screening_depth": "string (optional, default: standard)", // "basic", "standard", "enhanced", "comprehensive"
    "match_threshold": "number (optional, 0-1, default: 0.85)"
  },
  "business_context": {
    "relationship_type": "string (optional)", // "new_customer", "existing_customer", "one_time_transaction"
    "risk_appetite": "string (optional)", // "low", "medium", "high"
    "business_line": "string (optional)",
    "product_type": "string (optional)"
  }
}
```

**Response Body** (200 OK):
```json
{
  "aml_check_id": "string (UUID)",
  "check_type": "string",
  "overall_result": "string", // "clear", "potential_match", "match", "requires_review", "enhanced_dd_required"
  "risk_rating": "string", // "low", "medium", "high", "prohibited"
  "screening_results": {
    "sanctions_screening": {
      "status": "string", // "clear", "potential_match", "match"
      "total_matches": "number",
      "highest_match_score": "number (0-1)",
      "matches": [
        {
          "list_name": "string", // "OFAC SDN", "UN Consolidated", "EU Sanctions"
          "list_type": "string", // "sanctions", "embargo", "asset_freeze"
          "entity_name": "string",
          "match_strength": "number (0-1)",
          "match_type": "string", // "exact", "phonetic", "fuzzy"
          "entity_details": {
            "entity_type": "string", // "individual", "organization", "vessel", "aircraft"
            "aliases": ["array", "of", "aliases"],
            "addresses": ["array", "of", "addresses"],
            "identifiers": ["array", "of", "identifiers"],
            "sanctions_details": {
              "programs": ["array", "of", "sanction", "programs"],
              "effective_date": "string",
              "listing_authority": "string"
            }
          },
          "match_reasons": ["array", "of", "matching", "criteria"],
          "confidence_level": "string" // "high", "medium", "low"
        }
      ]
    },
    "pep_screening": {
      "status": "string", // "clear", "potential_match", "match"
      "is_pep": "boolean",
      "pep_category": "string", // "head_of_state", "government_official", "judicial", "military", "state_enterprise", "political_party", "international_organization"
      "jurisdiction": "string",
      "positions": [
        {
          "title": "string",
          "organization": "string",
          "country": "string",
          "start_date": "string",
          "end_date": "string (optional)",
          "current": "boolean"
        }
      ],
      "family_associations": [
        {
          "name": "string",
          "relationship": "string",
          "pep_status": "boolean"
        }
      ],
      "close_associates": [
        {
          "name": "string",
          "relationship": "string",
          "risk_level": "string"
        }
      ]
    },
    "adverse_media_screening": {
      "status": "string", // "clear", "articles_found", "high_risk_articles"
      "articles_found": "number",
      "risk_score": "number (0-1000)",
      "risk_categories": [
        {
          "category": "string", // "financial_crime", "corruption", "terrorism", "drug_trafficking", "human_trafficking"
          "article_count": "number",
          "severity": "string", // "low", "medium", "high"
          "latest_article_date": "string"
        }
      ],
      "sample_articles": [
        {
          "title": "string",
          "source": "string",
          "published_date": "string",
          "relevance_score": "number (0-1)",
          "summary": "string",
          "categories": ["array", "of", "categories"]
        }
      ]
    },
    "watchlist_screening": {
      "status": "string",
      "custom_lists_checked": ["array", "of", "custom", "list", "names"],
      "matches": [
        {
          "list_name": "string",
          "match_details": "object"
        }
      ]
    }
  },
  "risk_assessment": {
    "composite_risk_score": "number (0-1000)",
    "risk_factors": [
      {
        "factor": "string",
        "weight": "number",
        "score": "number",
        "description": "string"
      }
    ],
    "geographic_risk": {
      "country_risk_scores": [
        {
          "country": "string",
          "risk_score": "number",
          "risk_factors": ["array"]
        }
      ]
    },
    "product_risk": "number",
    "channel_risk": "number"
  },
  "compliance_requirements": {
    "reporting_required": "boolean",
    "enhanced_monitoring": "boolean",
    "additional_documentation": [
      {
        "document_type": "string",
        "reason": "string",
        "deadline": "string (ISO 8601 datetime)"
      }
    ],
    "approval_requirements": [
      {
        "approval_type": "string", // "manager", "mlro", "compliance_committee"
        "reason": "string",
        "deadline": "string"
      }
    ]
  },
  "recommendations": [
    {
      "action": "string", // "proceed", "enhanced_dd", "decline", "file_sar", "ongoing_monitoring"
      "priority": "string", // "immediate", "high", "medium", "low"
      "deadline": "string (ISO 8601 datetime)",
      "responsible_team": "string",
      "justification": "string",
      "regulatory_basis": "string"
    }
  ],
  "regulatory_context": {
    "applicable_regulations": ["array", "of", "regulations"],
    "jurisdiction_requirements": [
      {
        "jurisdiction": "string",
        "requirements": ["array", "of", "requirements"],
        "thresholds": "object"
      }
    ]
  },
  "processing_metadata": {
    "data_sources": ["array", "of", "data", "sources"],
    "screening_providers": ["array", "of", "providers"],
    "processing_time": "number (milliseconds)",
    "data_freshness": {
      "sanctions_lists": "string (ISO 8601 datetime)",
      "pep_data": "string (ISO 8601 datetime)",
      "adverse_media": "string (ISO 8601 datetime)"
    }
  },
  "checked_at": "string (ISO 8601 datetime)",
  "valid_until": "string (ISO 8601 datetime)",
  "next_review_date": "string (ISO 8601 datetime)"
}
```

#### GET /reports

**Description**: Generates and retrieves comprehensive compliance reports for regulatory submission and internal monitoring.

**Request Headers**:
```http
Authorization: Bearer <access_token>
X-Request-ID: string (required)
```

**Query Parameters**:
- `report_type` (string, required): Type of compliance report
  - `sar` (Suspicious Activity Report)
  - `ctr` (Currency Transaction Report)
  - `kyc_summary` (KYC Summary Report)
  - `transaction_monitoring` (Transaction Monitoring Report)
  - `aml_effectiveness` (AML Program Effectiveness Report)
  - `regulatory_summary` (Regulatory Summary Report)
- `start_date` (string, required): Report start date (YYYY-MM-DD)
- `end_date` (string, required): Report end date (YYYY-MM-DD)
- `format` (string, optional, default: json): Output format (`json`, `pdf`, `csv`, `xml`, `excel`)
- `jurisdiction` (string, optional): Specific regulatory jurisdiction (ISO 3166-1 alpha-2)
- `business_unit` (string, optional): Filter by business unit
- `include_details` (boolean, optional, default: true): Include detailed findings
- `aggregate_level` (string, optional, default: summary): Aggregation level (`summary`, `detailed`, `granular`)

**Response Body** (200 OK):
```json
{
  "report_id": "string (UUID)",
  "report_type": "string",
  "report_name": "string",
  "period": {
    "start_date": "string (YYYY-MM-DD)",
    "end_date": "string (YYYY-MM-DD)",
    "business_days": "number",
    "reporting_currency": "string"
  },
  "generation_metadata": {
    "generated_at": "string (ISO 8601 datetime)",
    "generated_by": "string (user ID)",
    "generation_time": "number (seconds)",
    "data_as_of": "string (ISO 8601 datetime)",
    "report_version": "string",
    "data_sources": ["array", "of", "data", "sources"]
  },
  "executive_summary": {
    "key_metrics": {
      "total_transactions_reviewed": "number",
      "suspicious_activities_identified": "number",
      "reports_filed": "number",
      "false_positive_rate": "number",
      "average_case_resolution_time": "number (days)"
    },
    "compliance_status": "string", // "compliant", "minor_issues", "significant_issues", "non_compliant"
    "risk_level": "string", // "low", "medium", "high"
    "trending": {
      "compared_to_previous_period": "string", // "improved", "stable", "deteriorated"
      "key_changes": ["array", "of", "significant", "changes"]
    }
  },
  "report_data": {
    "summary": {
      "total_transactions": "number",
      "total_amount": "number",
      "flagged_transactions": "number",
      "flagged_amount": "number",
      "reported_transactions": "number",
      "reported_amount": "number",
      "customers_reviewed": "number",
      "high_risk_customers": "number"
    },
    "detailed_findings": [
      {
        "finding_id": "string (UUID)",
        "finding_type": "string", // "suspicious_activity", "policy_violation", "system_issue", "training_gap"
        "severity": "string", // "low", "medium", "high", "critical"
        "category": "string", // "aml", "sanctions", "fraud", "operational"
        "subject_id": "string",
        "subject_type": "string", // "customer", "transaction", "account"
        "description": "string",
        "detection_method": "string", // "automated_alert", "manual_review", "external_source"
        "regulatory_citation": "string",
        "recommended_action": "string",
        "status": "string", // "open", "under_investigation", "closed", "escalated"
        "assigned_to": "string",
        "created_date": "string",
        "due_date": "string",
        "resolution_date": "string (optional)"
      }
    ],
    "regulatory_metrics": {
      "compliance_score": "number (0-100)",
      "policy_violations": "number",
      "false_positive_rate": "number",
      "alert_resolution_rate": "number",
      "training_completion_rate": "number",
      "system_availability": "number"
    },
    "risk_indicators": [
      {
        "indicator": "string",
        "current_value": "number",
        "threshold": "number",
        "status": "string", // "normal", "warning", "critical"
        "trend": "string" // "improving", "stable", "deteriorating"
      }
    ],
    "geographic_analysis": [
      {
        "country": "string",
        "transaction_volume": "number",
        "transaction_amount": "number",
        "risk_score": "number",
        "suspicious_activity_rate": "number"
      }
    ],
    "customer_segmentation": [
      {
        "segment": "string",
        "customer_count": "number",
        "average_risk_score": "number",
        "suspicious_activity_rate": "number"
      }
    ]
  },
  "regulatory_submissions": [
    {
      "submission_type": "string",
      "submission_date": "string",
      "reference_number": "string",
      "status": "string", // "pending", "submitted", "acknowledged", "rejected"
      "regulatory_authority": "string"
    }
  ],
  "recommendations": [
    {
      "recommendation_id": "string",
      "priority": "string",
      "category": "string",
      "description": "string",
      "implementation_timeline": "string",
      "responsible_department": "string",
      "estimated_cost": "string",
      "expected_impact": "string"
    }
  ],
  "quality_assurance": {
    "data_completeness": "number (0-1)",
    "data_accuracy": "number (0-1)",
    "validation_checks_passed": "number",
    "validation_checks_total": "number",
    "anomalies_detected": ["array", "of", "data", "anomalies"]
  },
  "download_links": {
    "pdf": "string (presigned URL)",
    "csv": "string (presigned URL)",
    "excel": "string (presigned URL)",
    "xml": "string (presigned URL)"
  },
  "access_control": {
    "classification": "string", // "public", "internal", "confidential", "restricted"
    "access_list": ["array", "of", "authorized", "user", "ids"],
    "retention_period": "string",
    "destruction_date": "string"
  }
}
```

---

## Analytics Service

Base Path: `/api/v1/analytics`

The Analytics Service provides comprehensive data analytics, reporting, and business intelligence capabilities with real-time processing and advanced visualizations.

### Endpoints

#### GET /transactions

**Description**: Retrieves aggregated transaction analytics with advanced filtering, segmentation, and trend analysis capabilities.

**Request Headers**:
```http
Authorization: Bearer <access_token>
X-Request-ID: string (required)
```

**Query Parameters**:
- `period` (string, required): Time period for analysis
  - `daily`, `weekly`, `monthly`, `quarterly`, `yearly`, `custom`
- `start_date` (string, optional): Analysis start date (YYYY-MM-DD or ISO 8601)
- `end_date` (string, optional): Analysis end date (YYYY-MM-DD or ISO 8601)
- `group_by` (string, optional): Primary grouping dimension
  - `transaction_type`, `currency`, `customer_segment`, `geographic_region`, `channel`, `product_type`
- `secondary_group_by` (string, optional): Secondary grouping for cross-tabulation
- `metrics` (string, optional): Comma-separated list of metrics to include
  - `volume`, `value`, `avg_amount`, `unique_customers`, `success_rate`, `fraud_rate`, `fee_revenue`
- `filters` (object, optional): Advanced filtering criteria
- `include_forecasts` (boolean, optional, default: false): Include predictive forecasts
- `include_benchmarks` (boolean, optional, default: false): Include industry benchmarks
- `aggregation_level` (string, optional, default: summary): Detail level (`summary`, `detailed`, `granular`)

**Response Body** (200 OK):
```json
{
  "analytics_id": "string (UUID)",
  "period": "string",
  "date_range": {
    "start_date": "string (ISO 8601 datetime)",
    "end_date": "string (ISO 8601 datetime)",
    "business_days": "number",
    "total_days": "number"
  },
  "summary_metrics": {
    "total_transaction_volume": "number",
    "total_transaction_value": {
      "amount": "number",
      "currency": "string"
    },
    "average_transaction_size": "number",
    "median_transaction_size": "number",
    "unique_customers": "number",
    "unique_merchants": "number",
    "success_rate": "number (0-1)",
    "fraud_rate": "number (0-1)",
    "total_fee_revenue": "number",
    "processing_costs": "number",
    "net_revenue": "number"
  },
  "trend_analysis": [
    {
      "period": "string (ISO 8601 date or datetime)",
      "volume": "number",
      "value": "number",
      "average_size": "number",
      "unique_customers": "number",
      "success_rate": "number",
      "growth_rate": "number",
      "seasonality_factor": "number"
    }
  ],
  "segmentation_analysis": {
    "by_transaction_type": [
      {
        "type": "string",
        "volume": "number",
        "value": "number",
        "percentage_of_total": "number",
        "average_size": "number",
        "growth_rate": "number",
        "profitability": "number"
      }
    ],
    "by_customer_segment": [
      {
        "segment": "string", // "retail", "premium", "business", "enterprise"
        "volume": "number",
        "value": "number",
        "avg_transaction_size": "number",
        "customer_count": "number",
        "revenue_per_customer": "number",
        "churn_rate": "number"
      }
    ],
    "by_geographic_region": [
      {
        "region": "string",
        "country": "string",
        "volume": "number",
        "value": "number",
        "growth_rate": "number",
        "market_share": "number",
        "regulatory_complexity": "string"
      }
    ],
    "by_channel": [
      {
        "channel": "string", // "online", "mobile", "branch", "atm"
        "volume": "number",
        "value": "number",
        "adoption_rate": "number",
        "cost_per_transaction": "number",
        "satisfaction_score": "number"
      }
    ]
  },
  "risk_analytics": {
    "fraud_detection_rate": "number",
    "false_positive_rate": "number",
    "average_risk_score": "number",
    "high_risk_transactions": "number",
    "blocked_transactions": "number",
    "fraud_losses": "number",
    "risk_distribution": [
      {
        "risk_level": "string",
        "transaction_count": "number",
        "percentage": "number"
      }
    ]
  },
  "operational_metrics": {
    "processing_times": {
      "average": "number (milliseconds)",
      "median": "number (milliseconds)",
      "p95": "number (milliseconds)",
      "p99": "number (milliseconds)"
    },
    "system_availability": "number (0-1)",
    "error_rates": {
      "total_errors": "number",
      "error_rate": "number",
      "timeout_rate": "number"
    },
    "capacity_utilization": "number (0-1)"
  },
  "forecasts": {
    "next_period_prediction": {
      "volume": "number",
      "value": "number",
      "confidence_interval": {
        "lower": "number",
        "upper": "number"
      }
    },
    "seasonal_patterns": [
      {
        "period": "string",
        "multiplier": "number",
        "confidence": "number"
      }
    ],
    "trend_direction": "string", // "increasing", "decreasing", "stable"
    "model_accuracy": "number (0-1)"
  },
  "benchmarks": {
    "industry_averages": {
      "transaction_volume": "number",
      "success_rate": "number",
      "fraud_rate": "number",
      "processing_time": "number"
    },
    "peer_comparison": {
      "volume_percentile": "number (0-100)",
      "efficiency_percentile": "number (0-100)",
      "quality_percentile": "number (0-100)"
    }
  },
  "insights": [
    {
      "insight_type": "string", // "trend", "anomaly", "opportunity", "risk"
      "priority": "string", // "high", "medium", "low"
      "description": "string",
      "impact": "string", // "positive", "negative", "neutral"
      "confidence": "number (0-1)",
      "recommended_actions": ["array", "of", "recommendations"]
    }
  ],
  "generated_at": "string (ISO 8601 datetime)",
  "data_freshness": "string (ISO 8601 datetime)",
  "processing_time": "number (milliseconds)"
}
```

#### GET /reports/{reportId}

**Description**: Retrieves a specific analytics report with detailed insights, visualizations, and interactive capabilities.

**Request Headers**:
```http
Authorization: Bearer <access_token>
X-Request-ID: string (required)
```

**Path Parameters**:
- `reportId` (string, required): Analytics report identifier (UUID)

**Query Parameters**:
- `format` (string, optional, default: json): Response format (`json`, `pdf`, `excel`)
- `include_raw_data` (boolean, optional, default: false): Include underlying data
- `visualization_type` (string, optional): Preferred visualization format

**Response Body** (200 OK):
```json
{
  "report_id": "string (UUID)",
  "report_name": "string",
  "report_type": "string", // "financial_performance", "risk_analysis", "customer_insights", "operational_metrics"
  "created_at": "string (ISO 8601 datetime)",
  "created_by": "string (user ID)",
  "last_updated": "string (ISO 8601 datetime)",
  "parameters": {
    "date_range": {
      "start_date": "string",
      "end_date": "string"
    },
    "filters": "object",
    "metrics": ["array", "of", "selected", "metrics"],
    "grouping": ["array", "of", "grouping", "dimensions"]
  },
  "executive_summary": {
    "key_insights": [
      {
        "insight": "string",
        "impact": "string", // "high", "medium", "low"
        "trend": "string", // "positive", "negative", "neutral"
        "supporting_data": "object"
      }
    ],
    "performance_indicators": {
      "revenue_growth": "number",
      "customer_acquisition_rate": "number",
      "operational_efficiency": "number",
      "risk_metrics": "object"
    },
    "recommendations": [
      {
        "priority": "string",
        "recommendation": "string",
        "expected_impact": "string",
        "implementation_effort": "string", // "low", "medium", "high"
        "timeline": "string"
      }
    ]
  },
  "detailed_data": {
    "charts": [
      {
        "chart_id": "string",
        "chart_type": "string", // "line", "bar", "pie", "scatter", "heatmap", "funnel"
        "title": "string",
        "description": "string",
        "data": {
          "series": [
            {
              "name": "string",
              "data": ["array", "of", "data", "points"],
              "color": "string (hex color)",
              "type": "string"
            }
          ],
          "categories": ["array", "of", "category", "labels"],
          "metadata": {
            "x_axis_label": "string",
            "y_axis_label": "string",
            "unit": "string"
          }
        },
        "insights": ["array", "of", "chart", "specific", "insights"]
      }
    ],
    "tables": [
      {
        "table_id": "string",
        "title": "string",
        "description": "string",
        "headers": [
          {
            "field": "string",
            "label": "string",
            "type": "string", // "string", "number", "date", "currency"
            "format": "string"
          }
        ],
        "rows": ["array", "of", "data", "rows"],
        "summary_row": "object (optional)",
        "pagination": {
          "total_rows": "number",
          "page_size": "number",
          "current_page": "number"
        }
      }
    ],
    "metrics_grid": [
      {
        "metric_name": "string",
        "current_value": "number",
        "previous_value": "number",
        "change": "number",
        "change_percentage": "number",
        "trend": "string", // "up", "down", "stable"
        "target": "number (optional)",
        "benchmark": "number (optional)",
        "unit": "string",
        "color_indicator": "string" // "green", "yellow", "red"
      }
    ]
  },
  "raw_data": {
    "datasets": [
      {
        "name": "string",
        "schema": ["array", "of", "column", "definitions"],
        "data": ["array", "of", "raw", "data", "records"],
        "row_count": "number"
      }
    ]
  },
  "data_sources": [
    {
      "source_name": "string",
      "source_type": "string", // "database", "api", "file", "stream"
      "last_updated": "string (ISO 8601 datetime)",
      "record_count": "number",
      "data_quality_score": "number (0-1)"
    }
  ],
  "refresh_frequency": "string", // "real_time", "hourly", "daily", "weekly", "monthly"
  "next_refresh": "string (ISO 8601 datetime)",
  "auto_refresh_enabled": "boolean",
  "sharing_settings": {
    "visibility": "string", // "private", "team", "organization", "public"
    "allowed_users": ["array", "of", "user", "ids"],
    "export_permissions": ["array", "of", "export", "formats"]
  },
  "alerts": [
    {
      "alert_id": "string",
      "condition": "string",
      "threshold": "number",
      "notification_method": "string",
      "recipients": ["array"]
    }
  ],
  "export_urls": {
    "pdf": "string (presigned URL)",
    "excel": "string (presigned URL)",
    "csv": "string (presigned URL)"
  }
}
```

---

## Financial Wellness Service

Base Path: `/api/v1/wellness`

The Financial Wellness Service manages personalized financial wellness profiles, goals, and AI-powered recommendations to help customers achieve financial health.

### Endpoints

#### GET /profile/{customerId}

**Description**: Retrieves comprehensive financial wellness profile with AI-generated insights and personalized recommendations.

**Request Headers**:
```http
Authorization: Bearer <access_token>
X-Request-ID: string (required)
```

**Path Parameters**:
- `customerId` (string, required): Customer identifier (UUID)

**Query Parameters**:
- `include_history` (boolean, optional, default: false): Include historical wellness scores
- `include_benchmarks` (boolean, optional, default: true): Include peer group comparisons
- `analysis_period` (string, optional, default: 12m): Analysis period (3m, 6m, 12m, 24m)

**Response Body** (200 OK):
```json
{
  "customer_id": "string (UUID)",
  "profile_created": "string (ISO 8601 datetime)",
  "last_updated": "string (ISO 8601 datetime)",
  "wellness_score": {
    "overall_score": "number (0-100)",
    "score_trend": "string", // "improving", "stable", "declining"
    "trend_direction": "number", // positive/negative change rate
    "percentile_ranking": "number (0-100)",
    "peer_group": "string", // "age_income_similar", "geographic_similar", "life_stage_similar"
  },
  "score_components": {
    "budgeting_score": "number (0-100)",
    "savings_score": "number (0-100)",
    "debt_management_score": "number (0-100)",
    "investment_score": "number (0-100)",
    "protection_score": "number (0-100)",
    "planning_score": "number (0-100)"
  },
  "financial_health_metrics": {
    "debt_to_income_ratio": "number",
    "savings_rate": "number (percentage of income)",
    "emergency_fund_months": "number",
    "credit_utilization": "number (0-1)",
    "investment_diversification": "number (0-1)",
    "monthly_cash_flow": "number",
    "net_worth": "number",
    "net_worth_growth": "number (monthly percentage)"
  },
  "spending_analysis": {
    "total_monthly_spending": "number",
    "discretionary_spending": "number",
    "essential_spending": "number",
    "categories": [
      {
        "category": "string", // "housing", "transportation", "food", "entertainment", "healthcare"
        "amount": "number",
        "percentage_of_income": "number",
        "percentage_of_spending": "number",
        "trend": "string", // "increasing", "decreasing", "stable"
        "benchmark_comparison": "string", // "above_average", "average", "below_average"
        "anomalies": [
          {
            "date": "string",
            "amount": "number",
            "description": "string",
            "category_deviation": "number"
          }
        ]
      }
    ],
    "unusual_spending": [
      {
        "description": "string",
        "amount": "number",
        "date": "string (ISO 8601 date)",
        "category": "string",
        "impact_on_budget": "string", // "low", "medium", "high"
        "recurring_risk": "string" // "low", "medium", "high"
      }
    ],
    "spending_patterns": {
      "most_active_day": "string",
      "most_active_time": "string",
      "seasonal_variations": ["array", "of", "seasonal", "patterns"],
      "payment_method_preferences": ["array", "of", "preferences"]
    }
  },
  "income_analysis": {
    "primary_income": "number",
    "secondary_income": "number",
    "total_monthly_income": "number",
    "income_stability": "string", // "very_stable", "stable", "variable", "irregular"
    "income_growth_trend": "number",
    "income_sources": [
      {
        "source": "string",
        "amount": "number",
        "frequency": "string",
        "stability": "string"
      }
    ]
  },
  "goals_progress": [
    {
      "goal_id": "string (UUID)",
      "goal_type": "string", // "emergency_fund", "debt_payoff", "savings", "investment", "retirement"
      "goal_name": "string",
      "target_amount": "number",
      "current_progress": "number",
      "target_date": "string (ISO 8601 date)",
      "completion_percentage": "number (0-100)",
      "on_track": "boolean",
      "projected_completion": "string (ISO 8601 date)",
      "monthly_contribution": "number",
      "required_monthly_contribution": "number",
      "status": "string", // "on_track", "behind", "ahead", "at_risk"
    }
  ],
  "personalized_recommendations": [
    {
      "recommendation_id": "string (UUID)",
      "type": "string", // "budgeting", "savings", "investment", "debt_management", "protection", "planning"
      "priority": "string", // "high", "medium", "low"
      "category": "string",
      "title": "string",
      "description": "string",
      "potential_impact": {
        "monthly_savings": "number",
        "wellness_score_improvement": "number",
        "timeframe": "string"
      },
      "action_steps": [
        {
          "step": "string",
          "description": "string",
          "estimated_time": "string",
          "difficulty": "string" // "easy", "medium", "hard"
        }
      ],
      "ai_confidence": "number (0-1)",
      "personalization_factors": ["array", "of", "factors", "used"],
      "expires_at": "string (ISO 8601 datetime)"
    }
  ],
  "risk_alerts": [
    {
      "alert_id": "string",
      "severity": "string", // "low", "medium", "high", "critical"
      "type": "string", // "overspending", "debt_increase", "irregular_income", "goal_at_risk"
      "description": "string",
      "recommendation": "string",
      "created_at": "string (ISO 8601 datetime)"
    }
  ],
  "educational_content": [
    {
      "content_id": "string",
      "title": "string",
      "type": "string", // "article", "video", "calculator", "course"
      "topic": "string",
      "relevance_score": "number (0-1)",
      "estimated_reading_time": "number (minutes)",
      "url": "string"
    }
  ],
  "benchmark_comparisons": {
    "peer_group_comparison": {
      "savings_rate": {
        "user_value": "number",
        "peer_average": "number",
        "percentile": "number"
      },
      "debt_ratio": {
        "user_value": "number",
        "peer_average": "number",
        "percentile": "number"
      },
      "investment_allocation": {
        "user_value": "number",
        "peer_average": "number",
        "percentile": "number"
      }
    },
    "age_group_benchmarks": "object",
    "income_group_benchmarks": "object"
  },
  "historical_data": [
    {
      "date": "string (ISO 8601 date)",
      "wellness_score": "number",
      "net_worth": "number",
      "debt_ratio": "number",
      "savings_rate": "number"
    }
  ],
  "last_updated": "string (ISO 8601 datetime)",
  "next_update_due": "string (ISO 8601 datetime)"
}
```

#### POST /goals

**Description**: Creates a new financial goal with AI-powered recommendations for achievement strategies and realistic timelines.

**Request Headers**:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
X-Request-ID: string (required)
```

**Request Body**:
```json
{
  "customer_id": "string (required, UUID)",
  "goal_type": "string (required)", // "emergency_fund", "debt_payoff", "savings", "investment", "retirement", "home_purchase", "education", "vacation"
  "goal_name": "string (required, max 100 characters)",
  "description": "string (optional, max 500 characters)",
  "target_amount": "number (required, positive)",
  "target_date": "string (required, ISO 8601 date, future date)",
  "current_amount": "number (optional, default: 0)",
  "priority": "string (optional, default: medium)", // "high", "medium", "low"
  "goal_specifics": {
    "debt_details": {
      "debt_type": "string (optional)", // "credit_card", "student_loan", "mortgage", "personal_loan", "auto_loan"
      "current_balance": "number (optional)",
      "interest_rate": "number (optional)",
      "minimum_payment": "number (optional)"
    },
    "investment_details": {
      "risk_tolerance": "string (optional)", // "conservative", "moderate", "aggressive"
      "investment_type": "string (optional)", // "retirement", "growth", "income", "balanced"
      "tax_advantaged": "boolean (optional)"
    },
    "purchase_details": {
      "item_type": "string (optional)", // "home", "car", "education", "vacation"
      "down_payment_percentage": "number (optional)",
      "financing_needed": "boolean (optional)"
    }
  },
  "auto_transfer": {
    "enabled": "boolean (optional, default: false)",
    "amount": "number (optional)",
    "frequency": "string (optional)", // "weekly", "biweekly", "monthly", "quarterly"
    "source_account": "string (optional, account ID)",
    "start_date": "string (optional, ISO 8601 date)"
  },
  "preferences": {
    "reminder_frequency": "string (optional, default: monthly)", // "weekly", "monthly", "quarterly"
    "milestone_notifications": "boolean (optional, default: true)",
    "adjustment_recommendations": "boolean (optional, default: true)",
    "progress_sharing": "boolean (optional, default: false)"
  },
  "external_accounts": [
    {
      "account_type": "string", // "savings", "investment", "retirement"
      "institution": "string",
      "current_balance": "number",
      "contribution_amount": "number"
    }
  ]
}
```

**Response Body** (201 Created):
```json
{
  "goal_id": "string (UUID)",
  "customer_id": "string (UUID)",
  "goal_details": {
    "goal_type": "string",
    "goal_name": "string",
    "description": "string",
    "target_amount": "number",
    "target_date": "string (ISO 8601 date)",
    "current_amount": "number",
    "priority": "string"
  },
  "ai_recommendations": {
    "feasibility_analysis": {
      "probability_of_success": "number (0-1)",
      "risk_factors": ["array", "of", "identified", "risks"],
      "success_factors": ["array", "of", "success", "enablers"]
    },
    "suggested_monthly_contribution": "number",
    "alternative_strategies": [
      {
        "strategy": "string",
        "monthly_contribution": "number",
        "target_date": "string",
        "success_probability": "number",
        "pros": ["array"],
        "cons": ["array"]
      }
    ],
    "recommended_investment_strategy": {
      "asset_allocation": {
        "stocks": "number (percentage)",
        "bonds": "number (percentage)",
        "cash": "number (percentage)",
        "alternatives": "number (percentage)"
      },
      "recommended_products": [
        {
          "product_type": "string",
          "product_name": "string",
          "allocation_percentage": "number",
          "expected_return": "number",
          "risk_level": "string"
        }
      ]
    },
    "optimization_opportunities": [
      {
        "opportunity": "string",
        "potential_savings": "number",
        "implementation_effort": "string",
        "impact": "string"
      }
    ]
  },
  "milestones": [
    {
      "milestone_id": "string",
      "milestone_date": "string (ISO 8601 date)",
      "target_amount": "number",
      "description": "string",
      "achievement_probability": "number (0-1)"
    }
  ],
  "tracking_config": {
    "progress_notifications": "boolean",
    "milestone_alerts": "boolean",
    "adjustment_recommendations": "boolean",
    "performance_reports": "boolean"
  },
  "risk_assessment": {
    "goal_risk_level": "string", // "low", "medium", "high"
    "market_risk": "number (0-1)",
    "inflation_risk": "number (0-1)",
    "liquidity_risk": "number (0-1)",
    "mitigation_strategies": ["array", "of", "strategies"]
  },
  "compliance_considerations": {
    "tax_implications": ["array", "of", "tax", "considerations"],
    "regulatory_requirements": ["array", "if", "applicable"],
    "contribution_limits": {
      "annual_limit": "number (optional)",
      "catch_up_eligible": "boolean (optional)"
    }
  },
  "created_at": "string (ISO 8601 datetime)",
  "last_updated": "string (ISO 8601 datetime)",
  "status": "string" // "active", "paused", "completed", "cancelled"
}
```

#### GET /goals/{customerId}

**Description**: Retrieves all financial goals for a customer with progress tracking and performance analytics.

**Request Headers**:
```http
Authorization: Bearer <access_token>
X-Request-ID: string (required)
```

**Path Parameters**:
- `customerId` (string, required): Customer identifier (UUID)

**Query Parameters**:
- `status` (string, optional): Filter by goal status (`active`, `completed`, `paused`, `cancelled`)
- `goal_type` (string, optional): Filter by goal type
- `priority` (string, optional): Filter by priority level
- `include_history` (boolean, optional, default: false): Include progress history
- `include_projections` (boolean, optional, default: true): Include future projections

**Response Body** (200 OK):
```json
{
  "customer_id": "string (UUID)",
  "goals": [
    {
      "goal_id": "string (UUID)",
      "goal_type": "string",
      "goal_name": "string",
      "description": "string",
      "status": "string",
      "priority": "string",
      "target_amount": "number",
      "current_amount": "number",
      "target_date": "string (ISO 8601 date)",
      "completion_percentage": "number (0-100)",
      "monthly_contribution": "number",
      "required_monthly_contribution": "number",
      "on_track": "boolean",
      "last_contribution": "string (ISO 8601 datetime)",
      "created_at": "string (ISO 8601 datetime)",
      "performance_metrics": {
        "actual_vs_target_progress": "number",
        "contribution_consistency": "number (0-1)",
        "time_to_completion": "string",
        "projected_completion": "string (ISO 8601 date)",
        "variance_from_plan": "number"
      },
      "risk_indicators": [
        {
          "risk_type": "string",
          "severity": "string",
          "description": "string",
          "mitigation": "string"
        }
      ],
      "recent_activity": [
        {
          "date": "string",
          "type": "string", // "contribution", "withdrawal", "adjustment"
          "amount": "number",
          "balance_after": "number"
        }
      ]
    }
  ],
  "summary": {
    "total_goals": "number",
    "active_goals": "number",
    "completed_goals": "number",
    "paused_goals": "number",
    "total_target_amount": "number",
    "total_saved": "number",
    "total_monthly_commitment": "number",
    "overall_progress": "number (0-100)"
  },
  "portfolio_analysis": {
    "asset_allocation": {
      "cash": "number",
      "stocks": "number",
      "bonds": "number",
      "real_estate": "number",
      "alternatives": "number"
    },
    "risk_profile": "string",
    "diversification_score": "number (0-100)",
    "expected_annual_return": "number",
    "volatility": "number"
  },
  "recommendations": [
    {
      "type": "string", // "rebalance", "increase_contribution", "adjust_timeline", "change_strategy"
      "priority": "string",
      "description": "string",
      "potential_impact": "string",
      "effort_required": "string"
    }
  ],
  "insights": [
    {
      "insight": "string",
      "category": "string",
      "impact": "string",
      "confidence": "number (0-1)"
    }
  ]
}
```

---

## Blockchain Service

Base Path: `/api/v1/blockchain`

The Blockchain Service handles interactions with the Hyperledger Fabric network for secure settlements, smart contract execution, and immutable transaction records.

### Endpoints

#### GET /settlements/{settlementId}

**Description**: Retrieves comprehensive details of a blockchain settlement with cryptographic verification and audit trail.

**Request Headers**:
```http
Authorization: Bearer <access_token>
X-Request-ID: string (required)
```

**Path Parameters**:
- `settlementId` (string, required): Blockchain settlement identifier (UUID)

**Query Parameters**:
- `include_proofs` (boolean, optional, default: false): Include cryptographic proofs
- `include_participants` (boolean, optional, default: true): Include participant details
- `verification_level` (string, optional, default: standard): Level of verification (`basic`, `standard`, `comprehensive`)

**Response Body** (200 OK):
```json
{
  "settlement_id": "string (UUID)",
  "transaction_id": "string (UUID)",
  "blockchain_network": "string", // "hyperledger_fabric", "ethereum", "bitcoin"
  "network_version": "string",
  "settlement_status": "string", // "pending", "confirmed", "settled", "failed", "disputed"
  "settlement_type": "string", // "payment", "trade", "cross_border", "multi_party"
  "settlement_details": {
    "from_institution": {
      "institution_id": "string",
      "institution_name": "string",
      "bic_code": "string",
      "country": "string",
      "node_id": "string"
    },
    "to_institution": {
      "institution_id": "string",
      "institution_name": "string",
      "bic_code": "string",
      "country": "string",
      "node_id": "string"
    },
    "amount": {
      "value": "number",
      "currency": "string (ISO 4217)",
      "exchange_rate": "number (optional)",
      "original_amount": "number (optional)",
      "original_currency": "string (optional)"
    },
    "settlement_date": "string (ISO 8601 datetime)",
    "value_date": "string (ISO 8601 datetime)",
    "reference_number": "string",
    "instruction_id": "string",
    "end_to_end_id": "string"
  },
  "blockchain_metadata": {
    "block_hash": "string",
    "block_number": "number",
    "transaction_hash": "string",
    "transaction_index": "number",
    "confirmation_count": "number",
    "required_confirmations": "number",
    "gas_used": "number (optional)",
    "gas_price": "number (optional)",
    "network_fee": "number",
    "smart_contract_address": "string",
    "smart_contract_version": "string"
  },
  "participants": [
    {
      "participant_id": "string",
      "role": "string", // "originator", "beneficiary", "intermediary", "validator"
      "institution_name": "string",
      "node_address": "string",
      "digital_signature": "string",
      "signature_algorithm": "string", // "ECDSA", "RSA", "EdDSA"
      "public_key": "string",
      "certificate_hash": "string",
      "timestamp": "string (ISO 8601 datetime)",
      "endorsement_policy": "string"
    }
  ],
  "smart_contract_execution": {
    "contract_name": "string",
    "function_called": "string",
    "input_parameters": "object",
    "output_result": "object",
    "execution_time": "number (milliseconds)",
    "state_changes": [
      {
        "key": "string",
        "previous_value": "string",
        "new_value": "string"
      }
    ],
    "events_emitted": [
      {
        "event_name": "string",
        "event_data": "object",
        "timestamp": "string"
      }
    ]
  },
  "cryptographic_verification": {
    "merkle_root": "string",
    "merkle_proof": ["array", "of", "hash", "values"],
    "hash_algorithm": "string", // "SHA-256", "SHA-3", "Blake2b"
    "digital_signatures": [
      {
        "signer": "string",
        "signature": "string",
        "verification_status": "boolean",
        "certificate_chain": ["array", "of", "certificates"]
      }
    ],
    "consensus_proof": {
      "consensus_algorithm": "string", // "PBFT", "RAFT", "PoW", "PoS"
      "validator_count": "number",
      "endorser_count": "number",
      "endorsement_policy": "string"
    }
  },
  "audit_trail": [
    {
      "timestamp": "string (ISO 8601 datetime)",
      "action": "string", // "initiated", "endorsed", "committed", "validated"
      "actor": "string",
      "actor_type": "string", // "participant", "validator", "system"
      "block_reference": "string",
      "transaction_reference": "string",
      "details": "string",
      "hash": "string"
    }
  ],
  "compliance_verification": {
    "kyc_verified": "boolean",
    "aml_cleared": "boolean",
    "sanctions_checked": "boolean",
    "regulatory_approval": "string",
    "compliance_officer": "string",
    "approval_timestamp": "string (ISO 8601 datetime)",
    "jurisdiction_compliance": [
      {
        "jurisdiction": "string",
        "regulation": "string",
        "compliance_status": "string", // "compliant", "pending", "non_compliant"
        "verification_date": "string"
      }
    ]
  },
  "performance_metrics": {
    "initiation_time": "string (ISO 8601 datetime)",
    "first_confirmation_time": "string (ISO 8601 datetime)",
    "final_settlement_time": "string (ISO 8601 datetime)",
    "total_processing_time": "number (milliseconds)",
    "network_latency": "number (milliseconds)",
    "throughput": "number (TPS during processing)"
  },
  "related_transactions": [
    {
      "transaction_id": "string",
      "relationship": "string", // "linked", "dependent", "batch", "reversal"
      "status": "string"
    }
  ],
  "dispute_information": {
    "dispute_status": "string", // "none", "pending", "resolved", "escalated"
    "dispute_reason": "string",
    "filed_by": "string",
    "filed_at": "string (ISO 8601 datetime)",
    "resolution": "string",
    "resolution_date": "string (ISO 8601 datetime)"
  }
}
```

#### GET /transactions/{transactionId}

**Description**: Retrieves blockchain transaction details with comprehensive verification status and immutable record proof.

**Request Headers**:
```http
Authorization: Bearer <access_token>
X-Request-ID: string (required)
```

**Path Parameters**:
- `transactionId` (string, required): Blockchain transaction identifier

**Query Parameters**:
- `include_raw_data` (boolean, optional, default: false): Include raw blockchain data
- `verification_depth` (string, optional, default: standard): Verification level (`basic`, `standard`, `full`)

**Response Body** (200 OK):
```json
{
  "transaction_id": "string (UUID)",
  "blockchain_hash": "string",
  "status": "string", // "pending", "confirmed", "finalized", "failed", "orphaned"
  "transaction_type": "string", // "settlement", "smart_contract", "token_transfer", "multi_sig"
  "blockchain_details": {
    "network": "string",
    "network_id": "string",
    "protocol_version": "string",
    "block_hash": "string",
    "block_number": "number",
    "block_timestamp": "string (ISO 8601 datetime)",
    "transaction_index": "number",
    "confirmation_count": "number",
    "required_confirmations": "number",
    "finality_status": "string" // "probabilistic", "deterministic", "instant"
  },
  "smart_contract": {
    "contract_address": "string",
    "contract_name": "string",
    "contract_version": "string",
    "function_name": "string",
    "function_signature": "string",
    "input_parameters": {
      "parameter_types": ["array"],
      "parameter_values": ["array"],
      "encoded_data": "string"
    },
    "execution_result": {
      "success": "boolean",
      "return_value": "object",
      "gas_limit": "number",
      "gas_used": "number",
      "gas_price": "number",
      "execution_time": "number (milliseconds)"
    },
    "state_changes": [
      {
        "storage_slot": "string",
        "previous_value": "string",
        "new_value": "string",
        "access_type": "string" // "read", "write", "delete"
      }
    ],
    "events_logged": [
      {
        "event_signature": "string",
        "event_data": "object",
        "topics": ["array"],
        "log_index": "number"
      }
    ]
  },
  "participants": [
    {
      "address": "string",
      "role": "string", // "sender", "receiver", "validator", "endorser"
      "participant_type": "string", // "user", "contract", "system"
      "digital_signature": "string",
      "signature_type": "string",
      "public_key": "string",
      "nonce": "number",
      "balance_before": "number",
      "balance_after": "number"
    }
  ],
  "immutable_record": {
    "original_data_hash": "string",
    "merkle_proof": {
      "merkle_root": "string",
      "proof_path": ["array", "of", "hashes"],
      "leaf_index": "number",
      "tree_depth": "number"
    },
    "timestamp_proof": {
      "timestamp": "string (ISO 8601 datetime)",
      "timestamp_authority": "string",
      "timestamp_signature": "string"
    },
    "chain_of_custody": [
      {
        "custodian": "string",
        "timestamp": "string",
        "action": "string",
        "hash": "string"
      }
    ]
  },
  "verification_status": {
    "cryptographic_verification": {
      "signature_valid": "boolean",
      "hash_valid": "boolean",
      "merkle_proof_valid": "boolean",
      "timestamp_valid": "boolean"
    },
    "consensus_verification": {
      "consensus_reached": "boolean",
      "validator_count": "number",
      "endorsement_count": "number",
      "voting_power": "number",
      "consensus_algorithm": "string"
    },
    "compliance_verification": {
      "regulatory_compliant": "boolean",
      "aml_checked": "boolean",
      "sanctions_cleared": "boolean",
      "jurisdiction_approved": "boolean"
    },
    "business_logic_verification": {
      "business_rules_satisfied": "boolean",
      "authorization_valid": "boolean",
      "settlement_rules_met": "boolean"
    }
  },
  "network_information": {
    "peer_count": "number",
    "node_version": "string",
    "protocol_upgrade": "boolean",
    "network_health": "string", // "healthy", "degraded", "partitioned"
    "consensus_health": "string"
  },
  "performance_data": {
    "submission_time": "string (ISO 8601 datetime)",
    "first_confirmation_time": "string (ISO 8601 datetime)",
    "finalization_time": "string (ISO 8601 datetime)",
    "end_to_end_latency": "number (milliseconds)",
    "network_propagation_time": "number (milliseconds)"
  },
  "fees_and_costs": {
    "transaction_fee": "number",
    "gas_fee": "number",
    "network_fee": "number",
    "total_cost": "number",
    "fee_currency": "string"
  },
  "raw_transaction_data": {
    "hex_data": "string (optional)",
    "rlp_encoded": "string (optional)",
    "proto_buffer": "string (optional)"
  }
}
```

---

## Notification Service

Base Path: `/api/v1/notifications`

The Notification Service manages multi-channel notifications with delivery tracking, template management, and compliance with communication preferences.

### Endpoints

#### POST /

**Description**: Sends notifications across multiple channels with delivery tracking, personalization, and compliance verification.

**Request Headers**:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
X-Request-ID: string (required)
X-Idempotency-Key: string (optional, UUID)
```

**Request Body**:
```json
{
  "recipient": {
    "customer_id": "string (required, UUID)",
    "channels": ["array (required)"], // "email", "sms", "push", "in_app", "webhook"
    "fallback_channels": ["array (optional)"], // channels to use if primary fails
    "preferences_override": "boolean (optional, default: false)"
  },
  "message": {
    "type": "string (required)", // "transactional", "marketing", "alert", "reminder", "security", "compliance"
    "category": "string (required)", // "account", "transaction", "security", "promotion", "service"
    "priority": "string (optional, default: medium)", // "low", "medium", "high", "urgent", "critical"
    "subject": "string (required for email, max 150 characters)",
    "content": {
      "text": "string (required, max 1600 characters for SMS)",
      "html": "string (optional, for email)",
      "rich_content": {
        "title": "string (optional)",
        "body": "string (optional)",
        "action_buttons": [
          {
            "text": "string",
            "action": "string", // "url", "deeplink", "callback"
            "value": "string"
          }
        ],
        "media": {
          "image_url": "string (optional)",
          "video_url": "string (optional)",
          "thumbnail_url": "string (optional)"
        }
      }
    },
    "template_id": "string (optional, UUID)",
    "personalization": {
      "variables": {
        "customer_name": "string (optional)",
        "account_number": "string (optional)",
        "amount": "number (optional)",
        "currency": "string (optional)",
        "custom_variables": "object (optional)"
      },
      "dynamic_content": {
        "product_recommendations": ["array (optional)"],
        "account_summary": "object (optional)",
        "personalized_offers": ["array (optional)"]
      }
    },
    "localization": {
      "language": "string (optional, ISO 639-1)",
      "region": "string (optional, ISO 3166-1 alpha-2)",
      "timezone": "string (optional, IANA timezone)"
    }
  },
  "delivery_options": {
    "schedule_time": "string (optional, ISO 8601 datetime, future time)",
    "time_zone": "string (optional, IANA timezone)",
    "expiry_time": "string (optional, ISO 8601 datetime)",
    "retry_policy": {
      "max_attempts": "number (optional, default: 3, max: 5)",
      "retry_interval": "number (optional, seconds, default: 300)",
      "backoff_strategy": "string (optional, default: exponential)" // "linear", "exponential"
    },
    "delivery_receipt": "boolean (optional, default: true)",
    "read_receipt": "boolean (optional, default: false)",
    "click_tracking": "boolean (optional, default: true)"
  },
  "compliance": {
    "opt_in_verified": "boolean (required)",
    "marketing_consent": "boolean (required for marketing type)",
    "data_processing_consent": "boolean (optional)",
    "communication_frequency_respected": "boolean (optional, default: true)",
    "data_retention_period": "number (optional, days)",
    "regulatory_requirements": ["array (optional)"], // "GDPR", "CAN_SPAM", "TCPA", "CASL"
    "unsubscribe_link": "boolean (optional, default: true for marketing)"
  },
  "business_context": {
    "campaign_id": "string (optional, UUID)",
    "journey_id": "string (optional, UUID)",
    "trigger_event": "string (optional)",
    "source_system": "string (optional)",
    "business_unit": "string (optional)",
    "cost_center": "string (optional)"
  },
  "advanced_options": {
    "a_b_test": {
      "test_id": "string (optional)",
      "variant": "string (optional)" // "A", "B", "control"
    },
    "segmentation": {
      "customer_segment": "string (optional)",
      "behavior_score": "number (optional)",
      "engagement_level": "string (optional)"
    },
    "delivery_optimization": {
      "send_time_optimization": "boolean (optional, default: false)",
      "channel_optimization": "boolean (optional, default: false)",
      "frequency_capping": "boolean (optional, default: true)"
    }
  }
}
```

**Response Body** (202 Accepted):
```json
{
  "notification_id": "string (UUID)",
  "recipient_id": "string (UUID)",
  "message_type": "string",
  "delivery_status": {
    "overall_status": "string", // "queued", "sending", "delivered", "failed", "partially_delivered", "expired"
    "channel_status": [
      {
        "channel": "string",
        "status": "string", // "queued", "sent", "delivered", "failed", "bounced", "rejected"
        "delivery_time": "string (ISO 8601 datetime, optional)",
        "failure_reason": "string (optional)",
        "provider_response": "string (optional)",
        "message_id": "string (optional, provider message ID)",
        "cost": "number (optional, in cents)"
      }
    ]
  },
  "tracking": {
    "tracking_id": "string (UUID)",
    "tracking_pixel_url": "string (optional, for email)",
    "unsubscribe_url": "string (optional)",
    "delivery_receipt_webhook": "string (optional)",
    "analytics_enabled": "boolean"
  },
  "compliance_record": {
    "consent_timestamp": "string (ISO 8601 datetime)",
    "consent_source": "string",
    "legal_basis": "string", // "consent", "contract", "legal_obligation", "legitimate_interest"
    "retention_until": "string (ISO 8601 datetime)",
    "data_classification": "string", // "public", "internal", "confidential", "restricted"
    "audit_trail_id": "string"
  },
  "personalization_applied": {
    "template_used": "string",
    "variables_substituted": ["array"],
    "dynamic_content_included": ["array"],
    "localization_applied": "boolean"
  },
  "delivery_optimization": {
    "optimal_send_time": "string (ISO 8601 datetime, optional)",
    "channel_preference_applied": "boolean",
    "frequency_cap_applied": "boolean",
    "send_time_optimized": "boolean"
  },
  "created_at": "string (ISO 8601 datetime)",
  "scheduled_for": "string (ISO 8601 datetime, optional)",
  "estimated_delivery": "string (ISO 8601 datetime)",
  "expires_at": "string (ISO 8601 datetime, optional)"
}
```

#### GET /templates

**Description**: Retrieves available notification templates with filtering and search capabilities.

**Request Headers**:
```http
Authorization: Bearer <access_token>
X-Request-ID: string (required)
```

**Query Parameters**:
- `type` (string, optional): Filter by message type
- `category` (string, optional): Filter by message category
- `channel` (string, optional): Filter by supported channel
- `language` (string, optional): Filter by language support
- `active_only` (boolean, optional, default: true): Include only active templates
- `search` (string, optional): Search in template name or description
- `page` (number, optional, default: 1): Page number
- `limit` (number, optional, default: 50, max: 200): Records per page

**Response Body** (200 OK):
```json
{
  "templates": [
    {
      "template_id": "string (UUID)",
      "template_name": "string",
      "description": "string",
      "type": "string",
      "category": "string",
      "status": "string", // "active", "inactive", "draft", "archived"
      "supported_channels": ["array"],
      "supported_languages": ["array"],
      "version": "string",
      "created_at": "string (ISO 8601 datetime)",
      "updated_at": "string (ISO 8601 datetime)",
      "usage_count": "number",
      "performance_metrics": {
        "delivery_rate": "number (0-1)",
        "open_rate": "number (0-1)",
        "click_rate": "number (0-1)",
        "conversion_rate": "number (0-1)"
      },
      "content_preview": {
        "subject": "string",
        "text_preview": "string (first 100 characters)",
        "variables": ["array", "of", "required", "variables"]
      },
      "compliance_tags": ["array"],
      "business_unit": "string"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total_pages": "number",
    "total_records": "number",
    "has_next": "boolean",
    "has_previous": "boolean"
  },
  "summary": {
    "total_templates": "number",
    "active_templates": "number",
    "templates_by_type": [
      {
        "type": "string",
        "count": "number"
      }
    ],
    "templates_by_channel": [
      {
        "channel": "string",
        "count": "number"
      }
    ]
  }
}
```

---

## Data Models

### Core Data Structures

#### Customer Model
```json
{
  "customer_id": "string (UUID)",
  "personal_info": {
    "first_name": "string",
    "last_name": "string",
    "middle_name": "string (optional)",
    "date_of_birth": "string (YYYY-MM-DD)",
    "ssn": "string (encrypted)",
    "phone": "string (E.164 format)",
    "email": "string",
    "nationality": "string (ISO 3166-1 alpha-2)",
    "preferred_language": "string (ISO 639-1)"
  },
  "address": {
    "street": "string",
    "street2": "string (optional)",
    "city": "string",
    "state": "string",
    "zip_code": "string",
    "country": "string (ISO 3166-1 alpha-2)"
  },
  "account_status": "string", // "active", "inactive", "suspended", "closed"
  "created_at": "string (ISO 8601 datetime)",
  "updated_at": "string (ISO 8601 datetime)"
}
```

#### Transaction Model
```json
{
  "transaction_id": "string (UUID)",
  "transaction_reference": "string",
  "transaction_type": "string",
  "status": "string",
  "amount": {
    "value": "number",
    "currency": "string (ISO 4217)"
  },
  "from_account": "string",
  "to_account": "string",
  "description": "string",
  "reference": "string",
  "created_at": "string (ISO 8601 datetime)",
  "processed_at": "string (ISO 8601 datetime)",
  "metadata": "object"
}
```

#### Risk Assessment Model
```json
{
  "assessment_id": "string (UUID)",
  "subject_id": "string",
  "risk_score": "number (0-1000)",
  "risk_level": "string", // "low", "medium", "high", "critical"
  "confidence": "number (0-1)",
  "factors": ["array of risk factors"],
  "model_version": "string",
  "assessed_at": "string (ISO 8601 datetime)",
  "expires_at": "string (ISO 8601 datetime)"
}