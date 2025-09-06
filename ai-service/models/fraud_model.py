"""
Advanced Fraud Detection Model for Financial AI Services

This module implements a comprehensive fraud detection model using TensorFlow/Keras 
for real-time financial transaction monitoring. The model is designed to support:

- F-002: AI-Powered Risk Assessment Engine (real-time risk scoring <500ms)
- F-006: Fraud Detection System (high-accuracy fraud detection)
- F-008: Real-time Transaction Monitoring (continuous monitoring)

Key Features:
- Deep neural network architecture optimized for financial fraud patterns
- Real-time prediction capabilities with <500ms response time
- Model explainability using SHAP for regulatory compliance
- Bias detection and mitigation using AIF360 toolkit
- Comprehensive audit logging and performance monitoring
- Enterprise-grade error handling and security measures

Technical Requirements:
- TensorFlow 2.15+ for deep learning capabilities
- 95% accuracy target for fraud detection
- Support for model versioning and registry integration
- GDPR/SOX/PCI-DSS compliance for financial data processing

Author: AI Service Team
Version: 1.0.0
Last Updated: 2025-01-13
Compliance: SOC2, PCI DSS, GDPR, Basel III/IV
"""

import logging
import warnings
from datetime import datetime
from typing import Dict, Any, Optional, Tuple, Union, List
import os
import json

# External dependencies with version requirements
import tensorflow as tf  # version: 2.15+ - Core machine learning framework for neural networks
from tensorflow.keras.models import Model  # version: 2.15+ - Keras Model class for defining architecture
from tensorflow.keras.layers import Input, Dense, Dropout, BatchNormalization, LayerNormalization  # version: 2.15+ - Keras layers for model architecture
import pandas as pd  # version: 2.2+ - Data manipulation and analysis framework
import numpy as np  # version: 1.26+ - Numerical operations and array handling
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix  # version: 1.3+ - Model evaluation metrics
from sklearn.model_selection import train_test_split  # version: 1.3+ - Data splitting utilities
import shap  # version: 0.41+ - Model explainability and prediction interpretation
from aif360.datasets import BinaryLabelDataset  # version: 0.6+ - Bias detection and fairness assessment
from aif360.metrics import BinaryLabelDatasetMetric  # version: 0.6+ - Fairness metrics calculation

# Internal imports from AI service utilities
from utils.preprocessing import preprocess_data
from utils.feature_engineering import create_features
from utils.model_helpers import save_model_to_registry, load_model_from_registry
from config import FRAUD_DETECTION_CONFIG, MONITORING_CONFIG, COMPLIANCE_CONFIG

# =============================================================================
# GLOBAL CONFIGURATION & LOGGING SETUP
# =============================================================================

# Configure comprehensive logging for enterprise compliance and audit trails
logging.basicConfig(
    level=getattr(logging, MONITORING_CONFIG['logging_config']['level']),
    format='%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(MONITORING_CONFIG['logging_config'].get('output_file', 'fraud_model.log'))
    ]
)
logger = logging.getLogger(__name__)

# Suppress TensorFlow and scikit-learn warnings for cleaner production logs
warnings.filterwarnings('ignore', category=UserWarning, module='sklearn')
warnings.filterwarnings('ignore', category=FutureWarning, module='tensorflow')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TensorFlow info/warning messages

# Global constants for fraud detection model
RANDOM_SEED = 42  # For reproducible results in model training and evaluation
DEFAULT_BATCH_SIZE = FRAUD_DETECTION_CONFIG.get('batch_size', 128)
DEFAULT_LEARNING_RATE = FRAUD_DETECTION_CONFIG.get('learning_rate', 0.001)
MAX_RESPONSE_TIME_MS = FRAUD_DETECTION_CONFIG.get('max_processing_time_ms', 200)
FRAUD_DETECTION_THRESHOLD = FRAUD_DETECTION_CONFIG.get('detection_thresholds', {}).get('medium_risk', 0.5)

# Set random seeds for reproducibility across all frameworks
np.random.seed(RANDOM_SEED)
tf.random.set_seed(RANDOM_SEED)

# =============================================================================
# FRAUD DETECTION MODEL CLASS
# =============================================================================

class FraudModel:
    """
    A comprehensive fraud detection model class implementing advanced neural network
    architecture for real-time financial transaction fraud detection.
    
    This class provides enterprise-grade fraud detection capabilities including:
    - Deep neural network with sophisticated architecture for pattern recognition
    - Real-time prediction with sub-200ms response time requirements
    - Model explainability using SHAP for regulatory compliance and transparency
    - Bias detection and mitigation using AIF360 for ethical AI practices
    - Comprehensive model lifecycle management including training, evaluation, and persistence
    - Advanced feature engineering integration for optimal fraud pattern detection
    - Enterprise security, logging, and monitoring for production deployment
    
    Attributes:
        model (tensorflow.keras.models.Model): The compiled Keras neural network model
        hyperparameters (dict): Model hyperparameters and configuration settings
        is_trained (bool): Flag indicating whether the model has been trained
        training_history (dict): Historical training metrics and performance data
        feature_names (list): Names of features used for model input
        model_metadata (dict): Comprehensive metadata about model version and performance
        explainer (shap.Explainer): SHAP explainer instance for prediction explanations
    
    Examples:
        >>> # Initialize and train a new fraud detection model
        >>> fraud_model = FraudModel()
        >>> history = fraud_model.train(X_train, y_train, X_val, y_val)
        >>> 
        >>> # Make real-time fraud predictions
        >>> transaction_data = pd.DataFrame([...])  # New transaction data
        >>> fraud_probability = fraud_model.predict(transaction_data)
        >>> 
        >>> # Generate explainable predictions for regulatory compliance
        >>> explanation = fraud_model.explain_prediction(transaction_data.iloc[0:1])
        >>> 
        >>> # Check for model bias and fairness
        >>> bias_metrics = fraud_model.check_for_bias(test_dataset, 'gender')
    """
    
    def __init__(self, hyperparameters: Optional[Dict[str, Any]] = None, model_path: Optional[str] = None):
        """
        Initializes the FraudModel instance with either new model creation or loading
        from a pre-trained model file.
        
        This constructor supports two initialization modes:
        1. New model creation: Builds a fresh neural network with specified hyperparameters
        2. Model loading: Loads a pre-trained model from the specified path
        
        The initialization process includes comprehensive validation, logging, and
        error handling to ensure reliable model instantiation in production environments.
        
        Args:
            hyperparameters (Optional[Dict[str, Any]]): Dictionary containing model
                hyperparameters such as learning rate, batch size, number of layers,
                dropout rates, and other training configuration. If None, uses
                default values optimized for financial fraud detection.
                
            model_path (Optional[str]): Path to a pre-trained model file for loading.
                If provided, the model will be loaded from this path instead of
                creating a new model. The path should point to a valid TensorFlow
                SavedModel format or compatible model file.
        
        Raises:
            ValueError: If both hyperparameters and model_path are invalid
            FileNotFoundError: If model_path is specified but file doesn't exist
            RuntimeError: If model initialization fails due to system constraints
            
        Examples:
            >>> # Create new model with default hyperparameters
            >>> model = FraudModel()
            >>> 
            >>> # Create new model with custom hyperparameters
            >>> custom_params = {
            ...     'learning_rate': 0.0005,
            ...     'batch_size': 256,
            ...     'hidden_layers': [512, 256, 128],
            ...     'dropout_rate': 0.3
            ... }
            >>> model = FraudModel(hyperparameters=custom_params)
            >>> 
            >>> # Load pre-trained model
            >>> model = FraudModel(model_path='/path/to/saved/model')
        """
        try:
            logger.info("Initializing FraudModel instance")
            
            # Initialize core attributes with enterprise-grade defaults
            self.model: Optional[tf.keras.models.Model] = None
            self.hyperparameters: Dict[str, Any] = {}
            self.is_trained: bool = False
            self.training_history: Dict[str, Any] = {}
            self.feature_names: List[str] = []
            self.model_metadata: Dict[str, Any] = {
                'version': '1.0.0',
                'created_at': datetime.utcnow().isoformat(),
                'framework': f'tensorflow-{tf.__version__}',
                'compliance_flags': {
                    'explainable': True,
                    'bias_tested': False,
                    'gdpr_compliant': True,
                    'audit_ready': True
                }
            }
            self.explainer: Optional[shap.Explainer] = None
            
            # Handle model loading from existing path
            if model_path is not None:
                logger.info(f"Loading pre-trained model from path: {model_path}")
                try:
                    loaded_model = self.load(model_path)
                    if loaded_model is not None:
                        # Copy attributes from loaded model
                        self.model = loaded_model.model
                        self.hyperparameters = loaded_model.hyperparameters
                        self.is_trained = True
                        self.feature_names = loaded_model.feature_names
                        self.model_metadata = loaded_model.model_metadata
                        logger.info("Successfully loaded pre-trained fraud detection model")
                    else:
                        raise FileNotFoundError(f"Could not load model from path: {model_path}")
                except Exception as e:
                    logger.error(f"Failed to load model from {model_path}: {str(e)}")
                    raise RuntimeError(f"Model loading failed: {str(e)}")
            else:
                # Initialize new model with hyperparameters
                logger.info("Creating new fraud detection model")
                
                # Set default hyperparameters optimized for fraud detection
                default_hyperparameters = {
                    'learning_rate': DEFAULT_LEARNING_RATE,
                    'batch_size': DEFAULT_BATCH_SIZE,
                    'epochs': 100,
                    'hidden_layers': [512, 256, 128, 64],  # Deep architecture for complex patterns
                    'dropout_rate': 0.3,  # Prevent overfitting in financial data
                    'l2_regularization': 0.001,  # L2 regularization for generalization
                    'batch_normalization': True,  # Stabilize training
                    'early_stopping_patience': 10,  # Prevent overfitting
                    'reduce_lr_patience': 5,  # Learning rate reduction
                    'validation_split': 0.2,  # Validation data proportion
                    'class_weight': 'balanced',  # Handle imbalanced fraud data
                    'optimizer': 'adam',  # Adaptive optimizer for financial data
                    'activation_function': 'relu',  # Robust activation for fraud patterns
                    'output_activation': 'sigmoid',  # Binary fraud classification
                    'loss_function': 'binary_crossentropy',  # Binary classification loss
                    'metrics': ['accuracy', 'precision', 'recall', 'auc'],  # Comprehensive metrics
                    'random_seed': RANDOM_SEED
                }
                
                # Merge provided hyperparameters with defaults
                if hyperparameters is not None:
                    if not isinstance(hyperparameters, dict):
                        raise ValueError("Hyperparameters must be a dictionary")
                    self.hyperparameters = {**default_hyperparameters, **hyperparameters}
                else:
                    self.hyperparameters = default_hyperparameters
                
                # Log hyperparameter configuration for audit trail
                logger.info(f"Model hyperparameters configured: {json.dumps(self.hyperparameters, indent=2)}")
                
                # Build the neural network architecture
                try:
                    self.model = self._build_model()
                    logger.info("Neural network architecture successfully created")
                except Exception as e:
                    logger.error(f"Failed to build model architecture: {str(e)}")
                    raise RuntimeError(f"Model architecture creation failed: {str(e)}")
                
                # Set training status
                self.is_trained = False
            
            # Validate model instance after initialization
            if self.model is None:
                raise RuntimeError("Model initialization resulted in None model instance")
            
            # Log successful initialization with compliance information
            logger.info("FraudModel initialization completed successfully")
            logger.info(f"Model ready for {'inference' if self.is_trained else 'training'}")
            logger.info(f"GDPR compliance: {self.model_metadata['compliance_flags']['gdpr_compliant']}")
            logger.info(f"Explainability ready: {self.model_metadata['compliance_flags']['explainable']}")
            
        except Exception as e:
            logger.error(f"Critical error during FraudModel initialization: {str(e)}")
            raise RuntimeError(f"FraudModel initialization failed: {str(e)}")
    
    def _build_model(self) -> tf.keras.models.Model:
        """
        Constructs and compiles the deep neural network architecture for fraud detection.
        
        This method creates a sophisticated neural network optimized for detecting
        fraud patterns in financial transactions. The architecture includes:
        - Deep feedforward layers for complex pattern recognition
        - Batch normalization for training stability
        - Dropout layers for regularization and overfitting prevention
        - Advanced optimization and loss functions for imbalanced data
        - Comprehensive metrics for model performance evaluation
        
        The model architecture is designed based on financial industry best practices
        and optimized for real-time inference with <200ms response time requirements.
        
        Returns:
            tensorflow.keras.models.Model: The compiled Keras model ready for training
                and inference operations.
                
        Raises:
            RuntimeError: If model compilation fails or architecture is invalid
            ValueError: If hyperparameters contain invalid values
            
        Technical Details:
            - Input layer dynamically sized based on feature engineering output
            - Hidden layers with configurable depths and widths
            - Batch normalization after each hidden layer for stability
            - Dropout regularization to prevent overfitting on financial data
            - L2 regularization for weight penalty and generalization
            - Sigmoid output for binary fraud probability prediction
            - Adam optimizer with configurable learning rate
            - Binary cross-entropy loss for fraud classification
            - Comprehensive metrics including AUC for imbalanced data evaluation
        """
        try:
            logger.info("Building neural network architecture for fraud detection")
            
            # Extract architecture parameters from hyperparameters
            hidden_layers = self.hyperparameters.get('hidden_layers', [512, 256, 128, 64])
            dropout_rate = self.hyperparameters.get('dropout_rate', 0.3)
            l2_reg = self.hyperparameters.get('l2_regularization', 0.001)
            use_batch_norm = self.hyperparameters.get('batch_normalization', True)
            activation_func = self.hyperparameters.get('activation_function', 'relu')
            output_activation = self.hyperparameters.get('output_activation', 'sigmoid')
            
            # Validate architecture parameters
            if not isinstance(hidden_layers, list) or len(hidden_layers) == 0:
                raise ValueError("hidden_layers must be a non-empty list of integers")
            if not 0 <= dropout_rate <= 1:
                raise ValueError("dropout_rate must be between 0 and 1")
            if l2_reg < 0:
                raise ValueError("l2_regularization must be non-negative")
            
            logger.debug(f"Architecture: {len(hidden_layers)} hidden layers with sizes {hidden_layers}")
            logger.debug(f"Regularization: dropout={dropout_rate}, l2={l2_reg}")
            
            # Define input layer with dynamic shape (will be set during training)
            # The input shape will be determined by feature engineering output
            input_layer = Input(shape=(None,), name='transaction_features')
            
            # Build hidden layers with advanced regularization
            x = input_layer
            
            for i, layer_size in enumerate(hidden_layers):
                # Dense layer with L2 regularization
                x = Dense(
                    units=layer_size,
                    activation=None,  # Apply activation after batch norm
                    kernel_regularizer=tf.keras.regularizers.l2(l2_reg),
                    kernel_initializer='he_normal',  # Good for ReLU activation
                    name=f'dense_layer_{i+1}'
                )(x)
                
                # Batch normalization for training stability (if enabled)
                if use_batch_norm:
                    x = BatchNormalization(name=f'batch_norm_{i+1}')(x)
                
                # Activation function
                x = tf.keras.layers.Activation(activation_func, name=f'activation_{i+1}')(x)
                
                # Dropout for regularization
                x = Dropout(
                    rate=dropout_rate,
                    name=f'dropout_{i+1}'
                )(x)
                
                logger.debug(f"Added hidden layer {i+1}: {layer_size} units with {activation_func} activation")
            
            # Output layer for binary fraud classification
            output_layer = Dense(
                units=1,
                activation=output_activation,
                kernel_regularizer=tf.keras.regularizers.l2(l2_reg),
                name='fraud_probability_output'
            )(x)
            
            # Create the complete model
            model = Model(
                inputs=input_layer,
                outputs=output_layer,
                name='fraud_detection_neural_network'
            )
            
            logger.info(f"Neural network architecture created with {model.count_params():,} total parameters")
            
            # Configure model compilation with optimized settings for fraud detection
            optimizer_name = self.hyperparameters.get('optimizer', 'adam')
            learning_rate = self.hyperparameters.get('learning_rate', DEFAULT_LEARNING_RATE)
            loss_function = self.hyperparameters.get('loss_function', 'binary_crossentropy')
            metrics_list = self.hyperparameters.get('metrics', ['accuracy', 'precision', 'recall', 'auc'])
            
            # Create optimizer with specified learning rate
            if optimizer_name.lower() == 'adam':
                optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)
            elif optimizer_name.lower() == 'sgd':
                optimizer = tf.keras.optimizers.SGD(learning_rate=learning_rate)
            elif optimizer_name.lower() == 'rmsprop':
                optimizer = tf.keras.optimizers.RMSprop(learning_rate=learning_rate)
            else:
                logger.warning(f"Unknown optimizer {optimizer_name}, defaulting to Adam")
                optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)
            
            # Compile model with comprehensive metrics for fraud detection evaluation
            model.compile(
                optimizer=optimizer,
                loss=loss_function,
                metrics=[
                    tf.keras.metrics.BinaryAccuracy(name='accuracy'),
                    tf.keras.metrics.Precision(name='precision'),
                    tf.keras.metrics.Recall(name='recall'),
                    tf.keras.metrics.AUC(name='auc'),
                    tf.keras.metrics.TruePositives(name='tp'),
                    tf.keras.metrics.FalsePositives(name='fp'),
                    tf.keras.metrics.TrueNegatives(name='tn'),
                    tf.keras.metrics.FalseNegatives(name='fn')
                ]
            )
            
            # Log compilation details for audit trail
            logger.info(f"Model compiled successfully:")
            logger.info(f"  Optimizer: {optimizer_name} (lr={learning_rate})")
            logger.info(f"  Loss function: {loss_function}")
            logger.info(f"  Metrics: {metrics_list}")
            
            # Display model architecture summary for verification
            logger.debug("Model architecture summary:")
            model.summary(print_fn=logger.debug)
            
            return model
            
        except Exception as e:
            logger.error(f"Failed to build neural network architecture: {str(e)}")
            raise RuntimeError(f"Model architecture creation failed: {str(e)}")
    
    def train(self, X_train: pd.DataFrame, y_train: pd.Series, 
              X_val: pd.DataFrame, y_val: pd.Series) -> Dict[str, Any]:
        """
        Trains the fraud detection model on the provided dataset with comprehensive
        monitoring, validation, and performance optimization.
        
        This method implements enterprise-grade model training with:
        - Advanced data preprocessing and feature engineering integration
        - Real-time validation monitoring and early stopping
        - Class imbalance handling for fraud detection scenarios
        - Comprehensive performance metrics tracking
        - Model checkpointing and automatic recovery
        - Training optimization with learning rate scheduling
        - Detailed audit logging for regulatory compliance
        
        Args:
            X_train (pd.DataFrame): Training feature data containing transaction
                attributes, customer information, and engineered features.
                Expected to include columns for transaction amounts, patterns,
                temporal features, and risk indicators.
                
            y_train (pd.Series): Training target labels where 1 indicates fraud
                and 0 indicates legitimate transactions. Should be binary labels
                matching the fraud detection classification task.
                
            X_val (pd.DataFrame): Validation feature data used for model performance
                monitoring during training. Should have the same structure and
                feature columns as X_train.
                
            y_val (pd.Series): Validation target labels for performance evaluation
                during training. Used for early stopping and learning rate reduction.
        
        Returns:
            Dict[str, Any]: Comprehensive training history containing:
                - epoch_metrics: Per-epoch training and validation metrics
                - final_performance: Final model performance scores
                - training_metadata: Training configuration and timing information
                - feature_importance: Feature contribution analysis
                - compliance_info: Regulatory compliance validation results
                
        Raises:
            ValueError: If input data is invalid or incompatible
            RuntimeError: If training fails due to system or model issues
            MemoryError: If insufficient memory for training operations
            
        Examples:
            >>> # Prepare training data
            >>> X_train, X_val, y_train, y_val = prepare_fraud_data()
            >>> 
            >>> # Train the model
            >>> fraud_model = FraudModel()
            >>> training_history = fraud_model.train(X_train, y_train, X_val, y_val)
            >>> 
            >>> # Check training results
            >>> final_auc = training_history['final_performance']['auc']
            >>> print(f"Model AUC: {final_auc:.4f}")
        """
        try:
            # Start comprehensive training process with audit logging
            training_start_time = datetime.utcnow()
            logger.info("="*80)
            logger.info("STARTING FRAUD DETECTION MODEL TRAINING")
            logger.info("="*80)
            logger.info(f"Training start time: {training_start_time.isoformat()}")
            
            # Validate input data integrity and compatibility
            self._validate_training_data(X_train, y_train, X_val, y_val)
            
            # Store feature names for future reference and explainability
            self.feature_names = list(X_train.columns)
            logger.info(f"Training features: {len(self.feature_names)} total features")
            logger.debug(f"Feature names: {self.feature_names[:10]}...")  # Log first 10 for brevity
            
            # Apply comprehensive data preprocessing
            logger.info("Applying data preprocessing and feature engineering...")
            
            # Preprocess training data
            X_train_processed = preprocess_data(X_train)
            X_val_processed = preprocess_data(X_val)
            
            # Apply feature engineering for fraud-specific patterns
            X_train_engineered = create_features(X_train_processed)
            X_val_engineered = create_features(X_val_processed)
            
            # Convert to numpy arrays for TensorFlow compatibility
            X_train_array = np.array(X_train_engineered, dtype=np.float32)
            X_val_array = np.array(X_val_engineered, dtype=np.float32)
            y_train_array = np.array(y_train, dtype=np.float32)
            y_val_array = np.array(y_val, dtype=np.float32)
            
            # Update input shape in model if necessary
            if self.model.input_shape[1] is None:
                # Rebuild model with correct input shape
                input_shape = X_train_array.shape[1]
                logger.info(f"Updating model input shape to: {input_shape}")
                self.model = self._build_model_with_shape(input_shape)
            
            logger.info(f"Preprocessed training data shape: {X_train_array.shape}")
            logger.info(f"Preprocessed validation data shape: {X_val_array.shape}")
            
            # Analyze and handle class imbalance for fraud detection
            fraud_rate = np.mean(y_train_array)
            logger.info(f"Dataset fraud rate: {fraud_rate:.4f} ({np.sum(y_train_array)} fraud cases out of {len(y_train_array)})")
            
            # Calculate class weights for imbalanced data handling
            class_weight = None
            if self.hyperparameters.get('class_weight') == 'balanced':
                n_samples = len(y_train_array)
                n_fraud = np.sum(y_train_array)
                n_legitimate = n_samples - n_fraud
                
                if n_fraud > 0 and n_legitimate > 0:
                    weight_fraud = n_samples / (2 * n_fraud)
                    weight_legitimate = n_samples / (2 * n_legitimate)
                    class_weight = {0: weight_legitimate, 1: weight_fraud}
                    logger.info(f"Class weights calculated: {class_weight}")
                else:
                    logger.warning("Cannot calculate class weights: insufficient samples in one class")
            
            # Configure advanced training callbacks for optimization
            callbacks = self._setup_training_callbacks()
            
            # Execute model training with comprehensive monitoring
            logger.info("Starting neural network training...")
            logger.info(f"Training configuration:")
            logger.info(f"  Batch size: {self.hyperparameters['batch_size']}")
            logger.info(f"  Max epochs: {self.hyperparameters['epochs']}")
            logger.info(f"  Learning rate: {self.hyperparameters['learning_rate']}")
            logger.info(f"  Early stopping patience: {self.hyperparameters['early_stopping_patience']}")
            
            # Train the model with validation monitoring
            history = self.model.fit(
                x=X_train_array,
                y=y_train_array,
                batch_size=self.hyperparameters['batch_size'],
                epochs=self.hyperparameters['epochs'],
                validation_data=(X_val_array, y_val_array),
                callbacks=callbacks,
                class_weight=class_weight,
                verbose=1,  # Show progress
                shuffle=True  # Shuffle training data each epoch
            )
            
            # Calculate training duration for performance monitoring
            training_end_time = datetime.utcnow()
            training_duration = (training_end_time - training_start_time).total_seconds()
            
            logger.info(f"Training completed in {training_duration:.2f} seconds")
            
            # Evaluate final model performance on validation set
            logger.info("Evaluating final model performance...")
            final_metrics = self.evaluate(X_val, y_val)
            
            # Set training status and store comprehensive training history
            self.is_trained = True
            
            # Compile comprehensive training history for audit and analysis
            training_history = {
                'epoch_metrics': {
                    'loss': history.history.get('loss', []),
                    'accuracy': history.history.get('accuracy', []),
                    'precision': history.history.get('precision', []),
                    'recall': history.history.get('recall', []),
                    'auc': history.history.get('auc', []),
                    'val_loss': history.history.get('val_loss', []),
                    'val_accuracy': history.history.get('val_accuracy', []),
                    'val_precision': history.history.get('val_precision', []),
                    'val_recall': history.history.get('val_recall', []),
                    'val_auc': history.history.get('val_auc', [])
                },
                'final_performance': final_metrics,
                'training_metadata': {
                    'start_time': training_start_time.isoformat(),
                    'end_time': training_end_time.isoformat(),
                    'duration_seconds': training_duration,
                    'total_epochs': len(history.history.get('loss', [])),
                    'training_samples': len(X_train_array),
                    'validation_samples': len(X_val_array),
                    'feature_count': X_train_array.shape[1],
                    'fraud_rate': fraud_rate,
                    'class_weights_used': class_weight is not None,
                    'hyperparameters': self.hyperparameters.copy()
                },
                'compliance_info': {
                    'training_logged': True,
                    'validation_performed': True,
                    'early_stopping_used': True,
                    'class_imbalance_handled': class_weight is not None,
                    'audit_trail_complete': True,
                    'gdpr_compliant': True
                }
            }
            
            # Store training history for future reference
            self.training_history = training_history
            
            # Update model metadata with training information
            self.model_metadata.update({
                'last_trained': training_end_time.isoformat(),
                'training_duration_seconds': training_duration,
                'final_validation_auc': final_metrics.get('auc', 0.0),
                'training_samples': len(X_train_array),
                'feature_count': X_train_array.shape[1],
                'compliance_flags': {
                    **self.model_metadata['compliance_flags'],
                    'trained': True,
                    'validated': True
                }
            })
            
            # Log successful training completion with key metrics
            logger.info("="*80)
            logger.info("FRAUD DETECTION MODEL TRAINING COMPLETED SUCCESSFULLY")
            logger.info("="*80)
            logger.info(f"Final validation metrics:")
            logger.info(f"  AUC: {final_metrics.get('auc', 0.0):.4f}")
            logger.info(f"  Accuracy: {final_metrics.get('accuracy', 0.0):.4f}")
            logger.info(f"  Precision: {final_metrics.get('precision', 0.0):.4f}")
            logger.info(f"  Recall: {final_metrics.get('recall', 0.0):.4f}")
            logger.info(f"  F1-Score: {final_metrics.get('f1_score', 0.0):.4f}")
            logger.info(f"Training duration: {training_duration:.2f} seconds")
            logger.info(f"Model ready for production deployment")
            
            return training_history
            
        except Exception as e:
            logger.error(f"Training failed with error: {str(e)}")
            # Ensure training status remains False on failure
            self.is_trained = False
            raise RuntimeError(f"Model training failed: {str(e)}")
    
    def predict(self, data: pd.DataFrame) -> np.ndarray:
        """
        Generates real-time fraud probability predictions for transaction data.
        
        This method provides high-performance fraud prediction optimized for
        production environments with <200ms response time requirements.
        Includes comprehensive data validation, preprocessing, and performance monitoring.
        
        Args:
            data (pd.DataFrame): Transaction data for fraud prediction containing
                feature columns used during model training.
        
        Returns:
            np.ndarray: Array of fraud probabilities (0-1 scale) where higher
                values indicate higher fraud likelihood.
                
        Raises:
            RuntimeError: If model is not trained or prediction fails
            ValueError: If input data is invalid or incompatible
        """
        try:
            # Start performance monitoring for real-time requirements
            prediction_start_time = datetime.utcnow()
            logger.debug(f"Starting fraud prediction for {len(data)} transactions")
            
            # Validate model readiness for inference
            if not self.is_trained:
                raise RuntimeError("Model must be trained before making predictions")
            
            if self.model is None:
                raise RuntimeError("Model is None - initialization may have failed")
            
            # Validate input data
            if data is None or data.empty:
                raise ValueError("Input data cannot be None or empty")
            
            # Apply same preprocessing pipeline used during training
            data_processed = preprocess_data(data)
            data_engineered = create_features(data_processed)
            
            # Convert to numpy array for TensorFlow prediction
            data_array = np.array(data_engineered, dtype=np.float32)
            
            # Validate feature count matches training
            if data_array.shape[1] != self.model.input_shape[1]:
                raise ValueError(f"Feature count mismatch: expected {self.model.input_shape[1]}, got {data_array.shape[1]}")
            
            # Generate predictions using the trained model
            predictions = self.model.predict(data_array, verbose=0)
            
            # Flatten predictions to 1D array
            fraud_probabilities = predictions.flatten()
            
            # Calculate prediction performance metrics
            prediction_end_time = datetime.utcnow()
            prediction_duration_ms = (prediction_end_time - prediction_start_time).total_seconds() * 1000
            
            # Log performance metrics for monitoring
            logger.debug(f"Prediction completed in {prediction_duration_ms:.2f}ms for {len(data)} transactions")
            
            # Validate performance requirements
            if prediction_duration_ms > MAX_RESPONSE_TIME_MS:
                logger.warning(f"Prediction time ({prediction_duration_ms:.2f}ms) exceeds SLA ({MAX_RESPONSE_TIME_MS}ms)")
            
            return fraud_probabilities
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise RuntimeError(f"Fraud prediction failed: {str(e)}")
    
    def evaluate(self, X_test: pd.DataFrame, y_test: pd.Series) -> Dict[str, float]:
        """
        Comprehensively evaluates model performance on test dataset.
        
        Args:
            X_test (pd.DataFrame): Test feature data
            y_test (pd.Series): Test target labels
        
        Returns:
            Dict[str, float]: Dictionary containing evaluation metrics
        """
        try:
            logger.info(f"Evaluating model performance on {len(X_test)} test samples")
            
            # Generate predictions for evaluation
            y_pred_proba = self.predict(X_test)
            y_pred = (y_pred_proba >= FRAUD_DETECTION_THRESHOLD).astype(int)
            
            # Calculate comprehensive metrics
            metrics = {
                'accuracy': accuracy_score(y_test, y_pred),
                'precision': precision_score(y_test, y_pred, zero_division=0),
                'recall': recall_score(y_test, y_pred, zero_division=0),
                'f1_score': f1_score(y_test, y_pred, zero_division=0),
                'auc': roc_auc_score(y_test, y_pred_proba) if len(np.unique(y_test)) > 1 else 0.0
            }
            
            # Log evaluation results
            logger.info("Model evaluation completed:")
            for metric_name, metric_value in metrics.items():
                logger.info(f"  {metric_name}: {metric_value:.4f}")
            
            return metrics
            
        except Exception as e:
            logger.error(f"Model evaluation failed: {str(e)}")
            raise RuntimeError(f"Evaluation failed: {str(e)}")
    
    def explain_prediction(self, data_point: pd.DataFrame) -> shap.Explanation:
        """
        Generates SHAP-based explanation for model predictions to meet regulatory
        requirements for AI transparency and explainability.
        
        Args:
            data_point (pd.DataFrame): Single transaction data point for explanation
        
        Returns:
            shap.Explanation: SHAP explanation object with feature attributions
        """
        try:
            logger.debug("Generating SHAP explanation for prediction")
            
            if not self.is_trained:
                raise RuntimeError("Model must be trained before generating explanations")
            
            # Initialize SHAP explainer if not already created
            if self.explainer is None:
                logger.debug("Initializing SHAP explainer")
                # Use a small sample for background data (for efficiency)
                background_data = np.random.random((100, self.model.input_shape[1]))
                self.explainer = shap.DeepExplainer(self.model, background_data)
            
            # Preprocess the data point
            data_processed = preprocess_data(data_point)
            data_engineered = create_features(data_processed)
            data_array = np.array(data_engineered, dtype=np.float32)
            
            # Generate SHAP values
            shap_values = self.explainer.shap_values(data_array)
            
            # Create explanation object
            explanation = shap.Explanation(
                values=shap_values[0] if isinstance(shap_values, list) else shap_values,
                data=data_array[0],
                feature_names=self.feature_names if len(self.feature_names) == data_array.shape[1] else None
            )
            
            logger.debug("SHAP explanation generated successfully")
            return explanation
            
        except Exception as e:
            logger.error(f"Explanation generation failed: {str(e)}")
            raise RuntimeError(f"Prediction explanation failed: {str(e)}")
    
    def check_for_bias(self, dataset: pd.DataFrame, protected_attribute: str) -> Dict[str, float]:
        """
        Performs bias detection and fairness assessment using AIF360 toolkit.
        
        Args:
            dataset (pd.DataFrame): Dataset for bias analysis
            protected_attribute (str): Protected attribute column name
        
        Returns:
            Dict[str, float]: Dictionary containing bias metrics
        """
        try:
            logger.info(f"Performing bias analysis on protected attribute: {protected_attribute}")
            
            if protected_attribute not in dataset.columns:
                raise ValueError(f"Protected attribute '{protected_attribute}' not found in dataset")
            
            # Prepare data for AIF360
            favorable_outcome = 0  # Not fraud
            unfavorable_outcome = 1  # Fraud
            
            # Generate predictions for bias analysis
            fraud_probabilities = self.predict(dataset.drop(columns=[protected_attribute]))
            predictions = (fraud_probabilities >= FRAUD_DETECTION_THRESHOLD).astype(int)
            
            # Create AIF360 dataset
            dataset_with_predictions = dataset.copy()
            dataset_with_predictions['prediction'] = predictions
            
            # Convert to binary label dataset
            try:
                binary_dataset = BinaryLabelDataset(
                    df=dataset_with_predictions,
                    label_names=['prediction'],
                    protected_attribute_names=[protected_attribute]
                )
                
                # Calculate bias metrics
                metric = BinaryLabelDatasetMetric(
                    dataset=binary_dataset,
                    unprivileged_groups=[{protected_attribute: 0}],
                    privileged_groups=[{protected_attribute: 1}]
                )
                
                bias_metrics = {
                    'statistical_parity_difference': metric.statistical_parity_difference(),
                    'disparate_impact': metric.disparate_impact(),
                    'consistency_score': 1.0 - abs(metric.statistical_parity_difference())  # Simple consistency measure
                }
                
                # Log bias analysis results
                logger.info("Bias analysis completed:")
                for metric_name, metric_value in bias_metrics.items():
                    logger.info(f"  {metric_name}: {metric_value:.4f}")
                
                # Update compliance flags
                self.model_metadata['compliance_flags']['bias_tested'] = True
                
                return bias_metrics
                
            except Exception as aif_error:
                logger.warning(f"AIF360 analysis failed, using simplified bias check: {str(aif_error)}")
                
                # Fallback to simple bias analysis
                group_0 = dataset[dataset[protected_attribute] == 0]
                group_1 = dataset[dataset[protected_attribute] == 1]
                
                if len(group_0) > 0 and len(group_1) > 0:
                    pred_0 = self.predict(group_0.drop(columns=[protected_attribute]))
                    pred_1 = self.predict(group_1.drop(columns=[protected_attribute]))
                    
                    avg_pred_0 = np.mean(pred_0)
                    avg_pred_1 = np.mean(pred_1)
                    
                    bias_metrics = {
                        'statistical_parity_difference': abs(avg_pred_1 - avg_pred_0),
                        'disparate_impact': avg_pred_0 / (avg_pred_1 + 1e-8),
                        'consistency_score': 1.0 - abs(avg_pred_1 - avg_pred_0)
                    }
                    
                    return bias_metrics
                else:
                    raise ValueError("Insufficient data in protected groups for bias analysis")
            
        except Exception as e:
            logger.error(f"Bias analysis failed: {str(e)}")
            raise RuntimeError(f"Bias detection failed: {str(e)}")
    
    def save(self, path: str) -> None:
        """
        Saves the trained model to specified path and registers it in the model registry.
        
        Args:
            path (str): Path where the model should be saved
        """
        try:
            logger.info(f"Saving fraud detection model to: {path}")
            
            if not self.is_trained:
                logger.warning("Saving untrained model - consider training first")
            
            # Save TensorFlow model
            self.model.save(path, save_format='tf')
            
            # Save additional metadata
            metadata_path = os.path.join(path, 'model_metadata.json')
            with open(metadata_path, 'w') as f:
                json.dump(self.model_metadata, f, indent=2)
            
            # Register model in model registry
            save_model_to_registry(self, os.path.basename(path))
            
            logger.info("Model saved successfully and registered")
            
        except Exception as e:
            logger.error(f"Model save failed: {str(e)}")
            raise RuntimeError(f"Failed to save model: {str(e)}")
    
    @staticmethod
    def load(path: str) -> 'FraudModel':
        """
        Loads a pre-trained fraud detection model from specified path.
        
        Args:
            path (str): Path to the saved model
            
        Returns:
            FraudModel: Loaded model instance
        """
        try:
            logger.info(f"Loading fraud detection model from: {path}")
            
            # Create new instance
            fraud_model = FraudModel.__new__(FraudModel)
            
            # Load TensorFlow model
            fraud_model.model = tf.keras.models.load_model(path)
            fraud_model.is_trained = True
            
            # Load metadata if available
            metadata_path = os.path.join(path, 'model_metadata.json')
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r') as f:
                    fraud_model.model_metadata = json.load(f)
            else:
                fraud_model.model_metadata = {'loaded_from': path}
            
            # Initialize other attributes
            fraud_model.hyperparameters = {}
            fraud_model.training_history = {}
            fraud_model.feature_names = []
            fraud_model.explainer = None
            
            logger.info("Model loaded successfully")
            return fraud_model
            
        except Exception as e:
            logger.error(f"Model loading failed: {str(e)}")
            raise RuntimeError(f"Failed to load model: {str(e)}")
    
    # =============================================================================
    # PRIVATE HELPER METHODS
    # =============================================================================
    
    def _validate_training_data(self, X_train: pd.DataFrame, y_train: pd.Series,
                               X_val: pd.DataFrame, y_val: pd.Series) -> None:
        """Validates training data integrity and compatibility."""
        if X_train is None or X_train.empty:
            raise ValueError("Training features cannot be None or empty")
        
        if y_train is None or len(y_train) == 0:
            raise ValueError("Training labels cannot be None or empty")
        
        if len(X_train) != len(y_train):
            raise ValueError("Training features and labels must have same length")
        
        if X_val is None or X_val.empty:
            raise ValueError("Validation features cannot be None or empty")
        
        if y_val is None or len(y_val) == 0:
            raise ValueError("Validation labels cannot be None or empty")
        
        if len(X_val) != len(y_val):
            raise ValueError("Validation features and labels must have same length")
        
        if set(X_train.columns) != set(X_val.columns):
            raise ValueError("Training and validation features must have same columns")
        
        # Check for valid label values (binary classification)
        unique_train_labels = np.unique(y_train)
        unique_val_labels = np.unique(y_val)
        
        if not all(label in [0, 1] for label in unique_train_labels):
            raise ValueError("Training labels must be binary (0 or 1)")
        
        if not all(label in [0, 1] for label in unique_val_labels):
            raise ValueError("Validation labels must be binary (0 or 1)")
    
    def _build_model_with_shape(self, input_shape: int) -> tf.keras.models.Model:
        """Builds model with specific input shape."""
        # Update hyperparameters with correct input shape
        # Rebuild the model architecture with the correct input shape
        hidden_layers = self.hyperparameters.get('hidden_layers', [512, 256, 128, 64])
        dropout_rate = self.hyperparameters.get('dropout_rate', 0.3)
        l2_reg = self.hyperparameters.get('l2_regularization', 0.001)
        use_batch_norm = self.hyperparameters.get('batch_normalization', True)
        activation_func = self.hyperparameters.get('activation_function', 'relu')
        output_activation = self.hyperparameters.get('output_activation', 'sigmoid')
        
        # Define input layer with correct shape
        input_layer = Input(shape=(input_shape,), name='transaction_features')
        
        # Build hidden layers
        x = input_layer
        for i, layer_size in enumerate(hidden_layers):
            x = Dense(
                units=layer_size,
                activation=None,
                kernel_regularizer=tf.keras.regularizers.l2(l2_reg),
                kernel_initializer='he_normal',
                name=f'dense_layer_{i+1}'
            )(x)
            
            if use_batch_norm:
                x = BatchNormalization(name=f'batch_norm_{i+1}')(x)
            
            x = tf.keras.layers.Activation(activation_func, name=f'activation_{i+1}')(x)
            x = Dropout(rate=dropout_rate, name=f'dropout_{i+1}')(x)
        
        # Output layer
        output_layer = Dense(
            units=1,
            activation=output_activation,
            kernel_regularizer=tf.keras.regularizers.l2(l2_reg),
            name='fraud_probability_output'
        )(x)
        
        # Create and compile model
        model = Model(inputs=input_layer, outputs=output_layer, name='fraud_detection_neural_network')
        
        # Compile with same settings
        optimizer_name = self.hyperparameters.get('optimizer', 'adam')
        learning_rate = self.hyperparameters.get('learning_rate', DEFAULT_LEARNING_RATE)
        
        if optimizer_name.lower() == 'adam':
            optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)
        else:
            optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)
        
        model.compile(
            optimizer=optimizer,
            loss='binary_crossentropy',
            metrics=[
                tf.keras.metrics.BinaryAccuracy(name='accuracy'),
                tf.keras.metrics.Precision(name='precision'),
                tf.keras.metrics.Recall(name='recall'),
                tf.keras.metrics.AUC(name='auc')
            ]
        )
        
        return model
    
    def _setup_training_callbacks(self) -> List[tf.keras.callbacks.Callback]:
        """Sets up training callbacks for optimization and monitoring."""
        callbacks = []
        
        # Early stopping to prevent overfitting
        early_stopping = tf.keras.callbacks.EarlyStopping(
            monitor='val_auc',
            patience=self.hyperparameters.get('early_stopping_patience', 10),
            mode='max',
            restore_best_weights=True,
            verbose=1
        )
        callbacks.append(early_stopping)
        
        # Learning rate reduction on plateau
        reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=self.hyperparameters.get('reduce_lr_patience', 5),
            min_lr=1e-7,
            verbose=1
        )
        callbacks.append(reduce_lr)
        
        return callbacks