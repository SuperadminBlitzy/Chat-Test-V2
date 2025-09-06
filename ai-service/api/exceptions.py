"""
Custom Exception Classes for AI Service API

This module defines custom exception classes specifically designed for the AI service API
within the financial services platform. These exceptions provide detailed error handling
for the AI-Powered Risk Assessment Engine (F-002) and support the error handling patterns
outlined in the technical specification.

The exceptions are built on top of FastAPI's HTTPException to ensure seamless integration
with the FastAPI framework used for AI/ML model serving and data processing APIs.

Author: AI Service Team
Version: 1.0.0
Last Updated: 2025
"""

from fastapi import HTTPException  # fastapi>=0.104.0


class ModelNotFoundException(HTTPException):
    """
    Custom exception raised when a requested machine learning model cannot be found or loaded.
    
    This exception is specifically designed to handle scenarios in the AI-Powered Risk Assessment
    Engine where:
    - A requested ML model is not available in the model registry
    - Model loading fails due to file system issues
    - Model artifacts are corrupted or incompatible
    - Model versioning conflicts occur
    
    This supports the F-002 requirement for robust error handling during risk assessment
    processes, ensuring that model availability issues are clearly communicated to clients
    with appropriate HTTP status codes and detailed error messages.
    
    Attributes:
        status_code (int): HTTP status code to be returned to the client
        detail (str): Detailed error message explaining the specific model loading issue
    
    Example Usage:
        # Raise when a specific risk assessment model is not found
        raise ModelNotFoundException(
            status_code=404, 
            detail="Risk assessment model 'credit_risk_v2.1' not found in model registry"
        )
        
        # Raise when model loading fails
        raise ModelNotFoundException(
            status_code=503, 
            detail="Failed to load fraud detection model due to insufficient memory"
        )
    """
    
    def __init__(self, status_code: int, detail: str) -> None:
        """
        Initialize the ModelNotFoundException with HTTP status code and error detail.
        
        This constructor follows the enterprise error handling pattern by ensuring
        consistent error response structure across the AI service API. The status_code
        and detail are passed directly to the FastAPI HTTPException parent class,
        which handles the HTTP response formatting automatically.
        
        Args:
            status_code (int): HTTP status code indicating the type of error
                              Common codes: 404 (Not Found), 503 (Service Unavailable)
            detail (str): Human-readable error message providing specific context
                         about the model loading failure
        
        Raises:
            No exceptions are raised during initialization as this follows the
            standard HTTPException pattern.
        """
        # Call the parent HTTPException constructor with provided parameters
        # This ensures proper HTTP response formatting and FastAPI integration
        super().__init__(status_code=status_code, detail=detail)


class InvalidInputException(HTTPException):
    """
    Custom exception raised for errors in input data provided for AI model predictions or analysis.
    
    This exception handles validation failures in the AI-Powered Risk Assessment Engine where
    input data is:
    - Malformed or incorrectly structured
    - Missing required fields or parameters
    - Contains invalid data types or values outside acceptable ranges
    - Fails business rule validation (e.g., negative transaction amounts)
    - Violates data quality thresholds required for accurate predictions
    
    This supports the F-002 requirement for handling invalid input data during risk assessment,
    ensuring that data quality issues are identified early and communicated clearly to clients.
    
    Attributes:
        status_code (int): HTTP status code to be returned to the client
        detail (str): Detailed error message explaining the specific input validation failure
    
    Example Usage:
        # Raise when required fields are missing
        raise InvalidInputException(
            status_code=400, 
            detail="Missing required field 'customer_id' for risk assessment"
        )
        
        # Raise when data types are incorrect
        raise InvalidInputException(
            status_code=422, 
            detail="Field 'transaction_amount' must be a positive number, received: 'invalid'"
        )
        
        # Raise when business rules are violated
        raise InvalidInputException(
            status_code=400, 
            detail="Transaction date cannot be in the future for historical risk analysis"
        )
    """
    
    def __init__(self, status_code: int, detail: str) -> None:
        """
        Initialize the InvalidInputException with HTTP status code and error detail.
        
        This constructor ensures consistent error handling for input validation failures
        across all AI service endpoints. The error response follows REST API best practices
        by providing both machine-readable status codes and human-readable error messages.
        
        Args:
            status_code (int): HTTP status code indicating the type of validation error
                              Common codes: 400 (Bad Request), 422 (Unprocessable Entity)
            detail (str): Descriptive error message explaining what input validation failed
                         and potentially how to correct it
        
        Raises:
            No exceptions are raised during initialization following standard patterns.
        """
        # Call the parent HTTPException constructor to maintain FastAPI compatibility
        # and ensure proper HTTP error response formatting
        super().__init__(status_code=status_code, detail=detail)


class PredictionException(HTTPException):
    """
    General-purpose exception for errors that occur during the AI model prediction process.
    
    This exception serves as a catch-all for various prediction-related errors in the
    AI-Powered Risk Assessment Engine that don't fall into more specific categories:
    - Runtime errors during model inference
    - Numerical computation failures (overflow, underflow, NaN values)
    - Memory allocation issues during large-scale predictions
    - Timeout errors for long-running prediction tasks
    - Unexpected model output formats or ranges
    - Integration failures with external data sources during prediction
    
    This supports the F-002 requirement for comprehensive error handling during the
    prediction process, ensuring that all runtime issues are properly captured and
    communicated while maintaining system stability.
    
    Attributes:
        status_code (int): HTTP status code to be returned to the client
        detail (str): Detailed error message explaining the specific prediction failure
    
    Example Usage:
        # Raise when model inference fails
        raise PredictionException(
            status_code=500, 
            detail="Risk prediction failed due to numerical overflow in model computation"
        )
        
        # Raise when prediction times out
        raise PredictionException(
            status_code=504, 
            detail="Prediction request timed out after 30 seconds for batch risk assessment"
        )
        
        # Raise when unexpected model behavior occurs
        raise PredictionException(
            status_code=500, 
            detail="Model returned invalid risk score outside expected range [0, 1000]"
        )
    """
    
    def __init__(self, status_code: int, detail: str) -> None:
        """
        Initialize the PredictionException with HTTP status code and error detail.
        
        This constructor provides a standardized way to handle prediction failures
        while maintaining detailed error context for debugging and monitoring purposes.
        The error information is structured to support both client error handling
        and internal system monitoring/alerting.
        
        Args:
            status_code (int): HTTP status code representing the error category
                              Common codes: 500 (Internal Server Error), 503 (Service Unavailable),
                              504 (Gateway Timeout)
            detail (str): Comprehensive error message providing context about the prediction
                         failure, including potential troubleshooting information
        
        Raises:
            No exceptions are raised during initialization to prevent error handling loops.
        """
        # Call the parent HTTPException constructor to ensure proper integration
        # with FastAPI's automatic error response handling and logging systems
        super().__init__(status_code=status_code, detail=detail)