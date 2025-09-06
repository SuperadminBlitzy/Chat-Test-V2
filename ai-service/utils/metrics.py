"""
AI Model Performance Metrics Utility Module

This module provides comprehensive utility functions for calculating and reporting
performance metrics for AI models used in financial risk assessment. These metrics
are crucial for evaluating model performance, ensuring fairness, meeting regulatory
requirements for model explainability and transparency, and supporting algorithmic
auditing for compliance.

The module supports the AI-Powered Risk Assessment Engine (F-002) requirements
including model explainability, bias detection and mitigation, and performance
criteria compliance with 95% accuracy standards.
"""

import numpy as np  # version: 1.26.2
from sklearn.metrics import (  # version: 1.3+
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)
from typing import Dict, Union, Optional, Tuple
import warnings
import logging

# Configure logging for enterprise-level monitoring
logger = logging.getLogger(__name__)


def calculate_accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """
    Calculates the accuracy score of a model's predictions.
    
    This function computes the fraction of predictions that match the true labels,
    which is essential for evaluating binary and multiclass classification models
    in financial risk assessment scenarios.
    
    Args:
        y_true (np.ndarray): True labels/target values. Shape: (n_samples,)
        y_pred (np.ndarray): Predicted labels. Shape: (n_samples,)
        
    Returns:
        float: The accuracy score as a float value between 0.0 and 1.0,
               where 1.0 represents perfect accuracy.
               
    Raises:
        ValueError: If input arrays have different shapes or are empty.
        TypeError: If inputs are not numpy arrays or array-like objects.
        
    Examples:
        >>> y_true = np.array([0, 1, 1, 0, 1])
        >>> y_pred = np.array([0, 1, 0, 0, 1])
        >>> accuracy = calculate_accuracy(y_true, y_pred)
        >>> print(f"Accuracy: {accuracy:.3f}")
        Accuracy: 0.800
    """
    try:
        # Input validation
        y_true = np.asarray(y_true)
        y_pred = np.asarray(y_pred)
        
        if y_true.size == 0 or y_pred.size == 0:
            raise ValueError("Input arrays cannot be empty")
            
        if y_true.shape != y_pred.shape:
            raise ValueError(f"Shape mismatch: y_true {y_true.shape} vs y_pred {y_pred.shape}")
        
        # Calculate accuracy using scikit-learn's accuracy_score function
        accuracy = accuracy_score(y_true, y_pred)
        
        # Log for audit trail and model monitoring
        logger.info(f"Accuracy calculated: {accuracy:.6f} for {len(y_true)} predictions")
        
        return float(accuracy)
        
    except Exception as e:
        logger.error(f"Error calculating accuracy: {str(e)}")
        raise


def calculate_precision(y_true: np.ndarray, y_pred: np.ndarray, 
                       average: str = 'binary', zero_division: Union[str, int] = 'warn') -> float:
    """
    Calculates the precision score of a model's predictions.
    
    Precision is the ratio of true positives to the sum of true and false positives.
    It answers the question: "Of all positive predictions, how many were actually correct?"
    This is particularly important in financial risk assessment where false positives
    can lead to unnecessary risk mitigation costs.
    
    Args:
        y_true (np.ndarray): True labels/target values. Shape: (n_samples,)
        y_pred (np.ndarray): Predicted labels. Shape: (n_samples,)
        average (str): Averaging strategy for multiclass problems. 
                      Options: 'binary', 'micro', 'macro', 'weighted'
        zero_division (Union[str, int]): Sets the value to return when there is 
                                        a zero division. Options: "warn", 0, 1
        
    Returns:
        float: The precision score as a float value between 0.0 and 1.0,
               where 1.0 represents perfect precision.
               
    Raises:
        ValueError: If input arrays have different shapes, are empty, or contain invalid values.
        TypeError: If inputs are not numpy arrays or array-like objects.
    """
    try:
        # Input validation
        y_true = np.asarray(y_true)
        y_pred = np.asarray(y_pred)
        
        if y_true.size == 0 or y_pred.size == 0:
            raise ValueError("Input arrays cannot be empty")
            
        if y_true.shape != y_pred.shape:
            raise ValueError(f"Shape mismatch: y_true {y_true.shape} vs y_pred {y_pred.shape}")
        
        # Calculate precision using scikit-learn's precision_score function
        precision = precision_score(y_true, y_pred, average=average, zero_division=zero_division)
        
        # Log for audit trail and model monitoring
        logger.info(f"Precision calculated: {precision:.6f} (average={average}) for {len(y_true)} predictions")
        
        return float(precision)
        
    except Exception as e:
        logger.error(f"Error calculating precision: {str(e)}")
        raise


def calculate_recall(y_true: np.ndarray, y_pred: np.ndarray, 
                    average: str = 'binary', zero_division: Union[str, int] = 'warn') -> float:
    """
    Calculates the recall score of a model's predictions.
    
    Recall (also known as sensitivity) is the ratio of true positives to the sum of
    true positives and false negatives. It answers the question: "Of all actual positive
    cases, how many did we correctly identify?" This is crucial in financial risk assessment
    where missing actual risks (false negatives) can lead to significant losses.
    
    Args:
        y_true (np.ndarray): True labels/target values. Shape: (n_samples,)
        y_pred (np.ndarray): Predicted labels. Shape: (n_samples,)
        average (str): Averaging strategy for multiclass problems.
                      Options: 'binary', 'micro', 'macro', 'weighted'
        zero_division (Union[str, int]): Sets the value to return when there is 
                                        a zero division. Options: "warn", 0, 1
        
    Returns:
        float: The recall score as a float value between 0.0 and 1.0,
               where 1.0 represents perfect recall.
               
    Raises:
        ValueError: If input arrays have different shapes, are empty, or contain invalid values.
        TypeError: If inputs are not numpy arrays or array-like objects.
    """
    try:
        # Input validation
        y_true = np.asarray(y_true)
        y_pred = np.asarray(y_pred)
        
        if y_true.size == 0 or y_pred.size == 0:
            raise ValueError("Input arrays cannot be empty")
            
        if y_true.shape != y_pred.shape:
            raise ValueError(f"Shape mismatch: y_true {y_true.shape} vs y_pred {y_pred.shape}")
        
        # Calculate recall using scikit-learn's recall_score function
        recall = recall_score(y_true, y_pred, average=average, zero_division=zero_division)
        
        # Log for audit trail and model monitoring
        logger.info(f"Recall calculated: {recall:.6f} (average={average}) for {len(y_true)} predictions")
        
        return float(recall)
        
    except Exception as e:
        logger.error(f"Error calculating recall: {str(e)}")
        raise


def calculate_f1_score(y_true: np.ndarray, y_pred: np.ndarray, 
                      average: str = 'binary', zero_division: Union[str, int] = 'warn') -> float:
    """
    Calculates the F1 score of a model's predictions.
    
    The F1 score is the harmonic mean of precision and recall, providing a single metric
    that balances both precision and recall. It's particularly useful when you need to
    find an optimal blend of precision and recall, which is common in financial risk
    assessment where both false positives and false negatives have significant costs.
    
    Formula: F1 = 2 * (precision * recall) / (precision + recall)
    
    Args:
        y_true (np.ndarray): True labels/target values. Shape: (n_samples,)
        y_pred (np.ndarray): Predicted labels. Shape: (n_samples,)
        average (str): Averaging strategy for multiclass problems.
                      Options: 'binary', 'micro', 'macro', 'weighted'
        zero_division (Union[str, int]): Sets the value to return when there is 
                                        a zero division. Options: "warn", 0, 1
        
    Returns:
        float: The F1 score as a float value between 0.0 and 1.0,
               where 1.0 represents perfect F1 score.
               
    Raises:
        ValueError: If input arrays have different shapes, are empty, or contain invalid values.
        TypeError: If inputs are not numpy arrays or array-like objects.
    """
    try:
        # Input validation
        y_true = np.asarray(y_true)
        y_pred = np.asarray(y_pred)
        
        if y_true.size == 0 or y_pred.size == 0:
            raise ValueError("Input arrays cannot be empty")
            
        if y_true.shape != y_pred.shape:
            raise ValueError(f"Shape mismatch: y_true {y_true.shape} vs y_pred {y_pred.shape}")
        
        # Calculate F1 score using scikit-learn's f1_score function
        f1 = f1_score(y_true, y_pred, average=average, zero_division=zero_division)
        
        # Log for audit trail and model monitoring
        logger.info(f"F1 score calculated: {f1:.6f} (average={average}) for {len(y_true)} predictions")
        
        return float(f1)
        
    except Exception as e:
        logger.error(f"Error calculating F1 score: {str(e)}")
        raise


def calculate_roc_auc(y_true: np.ndarray, y_scores: np.ndarray, 
                     average: str = 'macro', multi_class: str = 'ovr') -> float:
    """
    Calculates the ROC AUC score of a model's predictions.
    
    The ROC AUC (Receiver Operating Characteristic Area Under the Curve) measures
    the model's ability to distinguish between classes across all classification
    thresholds. It's particularly valuable for risk assessment models as it evaluates
    performance across the entire range of decision thresholds, which is crucial
    for setting optimal risk tolerance levels.
    
    Args:
        y_true (np.ndarray): True labels/target values. Shape: (n_samples,)
                           For binary classification: 0 or 1
                           For multiclass: integer class labels
        y_scores (np.ndarray): Prediction scores/probabilities. Shape: (n_samples,) for binary,
                              (n_samples, n_classes) for multiclass
        average (str): Averaging strategy for multiclass problems.
                      Options: 'macro', 'weighted', None
        multi_class (str): Multiclass ROC AUC calculation method.
                          Options: 'ovr' (one-vs-rest), 'ovo' (one-vs-one)
        
    Returns:
        float: The ROC AUC score as a float value between 0.0 and 1.0,
               where 0.5 represents random performance and 1.0 represents perfect performance.
               
    Raises:
        ValueError: If input arrays have different shapes, are empty, or contain invalid values.
        TypeError: If inputs are not numpy arrays or array-like objects.
    """
    try:
        # Input validation
        y_true = np.asarray(y_true)
        y_scores = np.asarray(y_scores)
        
        if y_true.size == 0 or y_scores.size == 0:
            raise ValueError("Input arrays cannot be empty")
            
        # For binary classification, y_scores should be 1D
        if y_true.ndim == 1 and y_scores.ndim == 1:
            if y_true.shape[0] != y_scores.shape[0]:
                raise ValueError(f"Shape mismatch: y_true {y_true.shape} vs y_scores {y_scores.shape}")
        # For multiclass, y_scores should be 2D
        elif y_true.ndim == 1 and y_scores.ndim == 2:
            if y_true.shape[0] != y_scores.shape[0]:
                raise ValueError(f"Shape mismatch: y_true {y_true.shape} vs y_scores {y_scores.shape}")
        else:
            raise ValueError("Invalid input dimensions")
        
        # Check for binary vs multiclass scenario
        unique_classes = np.unique(y_true)
        if len(unique_classes) == 2 and y_scores.ndim == 1:
            # Binary classification
            roc_auc = roc_auc_score(y_true, y_scores)
        else:
            # Multiclass classification
            roc_auc = roc_auc_score(y_true, y_scores, average=average, multi_class=multi_class)
        
        # Log for audit trail and model monitoring
        logger.info(f"ROC AUC calculated: {roc_auc:.6f} (average={average}, multi_class={multi_class}) for {len(y_true)} predictions")
        
        return float(roc_auc)
        
    except Exception as e:
        logger.error(f"Error calculating ROC AUC: {str(e)}")
        raise


def generate_confusion_matrix(y_true: np.ndarray, y_pred: np.ndarray, 
                            labels: Optional[np.ndarray] = None) -> np.ndarray:
    """
    Generates a confusion matrix for a model's predictions.
    
    A confusion matrix is a table used to describe the performance of a classification
    model. It shows the counts of true vs predicted classifications, providing detailed
    insight into what kinds of errors the model is making. This is essential for
    understanding model behavior in financial risk assessment scenarios.
    
    Args:
        y_true (np.ndarray): True labels/target values. Shape: (n_samples,)
        y_pred (np.ndarray): Predicted labels. Shape: (n_samples,)
        labels (Optional[np.ndarray]): List of labels to index the matrix.
                                     If None, those that appear at least once in y_true or y_pred are used.
        
    Returns:
        np.ndarray: The confusion matrix as a 2D numpy array. Shape: (n_classes, n_classes)
                   Element [i, j] is the number of observations known to be in group i
                   but predicted to be in group j.
                   
    Raises:
        ValueError: If input arrays have different shapes, are empty, or contain invalid values.
        TypeError: If inputs are not numpy arrays or array-like objects.
    """
    try:
        # Input validation
        y_true = np.asarray(y_true)
        y_pred = np.asarray(y_pred)
        
        if y_true.size == 0 or y_pred.size == 0:
            raise ValueError("Input arrays cannot be empty")
            
        if y_true.shape != y_pred.shape:
            raise ValueError(f"Shape mismatch: y_true {y_true.shape} vs y_pred {y_pred.shape}")
        
        # Generate confusion matrix using scikit-learn's confusion_matrix function
        cm = confusion_matrix(y_true, y_pred, labels=labels)
        
        # Log matrix dimensions and basic statistics for audit trail
        n_classes = cm.shape[0]
        total_predictions = np.sum(cm)
        diagonal_sum = np.trace(cm)  # Sum of correct predictions
        
        logger.info(f"Confusion matrix generated: {n_classes}x{n_classes} matrix for {total_predictions} predictions")
        logger.info(f"Correct predictions: {diagonal_sum}/{total_predictions} ({diagonal_sum/total_predictions:.3f})")
        
        return cm
        
    except Exception as e:
        logger.error(f"Error generating confusion matrix: {str(e)}")
        raise


def calculate_fairness_metrics(y_true: np.ndarray, y_pred: np.ndarray, 
                             sensitive_features: np.ndarray) -> Dict[str, Union[float, Dict[str, float]]]:
    """
    Calculates fairness metrics such as demographic parity and equalized odds.
    
    This function addresses the critical requirement for bias detection and mitigation
    in AI systems used for financial risk assessment. It calculates key fairness metrics
    to ensure algorithmic fairness across different demographic groups, supporting
    regulatory compliance and ethical AI practices.
    
    Fairness Metrics Calculated:
    1. Demographic Parity: Measures whether the positive prediction rate is equal across groups
    2. Equalized Odds: Measures whether true positive and false positive rates are equal across groups
    3. Equal Opportunity: Measures whether true positive rates are equal across groups
    
    Args:
        y_true (np.ndarray): True labels/target values. Shape: (n_samples,)
        y_pred (np.ndarray): Predicted labels. Shape: (n_samples,)
        sensitive_features (np.ndarray): Sensitive attribute values (e.g., race, gender, age group).
                                       Shape: (n_samples,)
        
    Returns:
        Dict[str, Union[float, Dict[str, float]]]: A dictionary containing fairness metrics:
            - 'demographic_parity': Dict with positive rates for each group
            - 'demographic_parity_difference': Float, max difference in positive rates
            - 'equalized_odds': Dict with TPR and FPR for each group
            - 'equalized_odds_difference': Dict with max differences in TPR and FPR
            - 'equal_opportunity_difference': Float, max difference in TPR across groups
            - 'group_counts': Dict with sample counts for each group
            - 'overall_metrics': Dict with overall performance metrics
            
    Raises:
        ValueError: If input arrays have different shapes, are empty, or contain invalid values.
        TypeError: If inputs are not numpy arrays or array-like objects.
    """
    try:
        # Input validation
        y_true = np.asarray(y_true)
        y_pred = np.asarray(y_pred)
        sensitive_features = np.asarray(sensitive_features)
        
        if y_true.size == 0 or y_pred.size == 0 or sensitive_features.size == 0:
            raise ValueError("Input arrays cannot be empty")
            
        if not (y_true.shape == y_pred.shape == sensitive_features.shape):
            raise ValueError(f"Shape mismatch: y_true {y_true.shape}, y_pred {y_pred.shape}, sensitive_features {sensitive_features.shape}")
        
        # Get unique groups from sensitive features
        unique_groups = np.unique(sensitive_features)
        
        if len(unique_groups) < 2:
            raise ValueError("At least two different groups are required for fairness analysis")
        
        # Initialize metrics dictionary
        fairness_metrics = {
            'demographic_parity': {},
            'equalized_odds': {},
            'group_counts': {},
            'overall_metrics': {}
        }
        
        # Calculate metrics for each group
        group_positive_rates = {}
        group_tpr = {}  # True Positive Rate
        group_fpr = {}  # False Positive Rate
        
        for group in unique_groups:
            # Get indices for current group
            group_mask = sensitive_features == group
            group_y_true = y_true[group_mask]
            group_y_pred = y_pred[group_mask]
            
            # Count samples in group
            group_size = np.sum(group_mask)
            fairness_metrics['group_counts'][str(group)] = int(group_size)
            
            # Skip groups with insufficient data
            if group_size < 10:
                logger.warning(f"Group {group} has only {group_size} samples, which may not be sufficient for reliable fairness metrics")
            
            # Calculate demographic parity (positive prediction rate)
            positive_rate = np.mean(group_y_pred)
            group_positive_rates[str(group)] = float(positive_rate)
            fairness_metrics['demographic_parity'][str(group)] = float(positive_rate)
            
            # Calculate True Positive Rate and False Positive Rate for equalized odds
            if len(np.unique(group_y_true)) > 1:  # Only if both classes are present
                # True positives and False positives
                true_positives = np.sum((group_y_true == 1) & (group_y_pred == 1))
                false_positives = np.sum((group_y_true == 0) & (group_y_pred == 1))
                true_negatives = np.sum((group_y_true == 0) & (group_y_pred == 0))
                false_negatives = np.sum((group_y_true == 1) & (group_y_pred == 0))
                
                # Calculate rates with zero division handling
                tpr = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0.0
                fpr = false_positives / (false_positives + true_negatives) if (false_positives + true_negatives) > 0 else 0.0
                
                group_tpr[str(group)] = float(tpr)
                group_fpr[str(group)] = float(fpr)
                
                fairness_metrics['equalized_odds'][str(group)] = {
                    'true_positive_rate': float(tpr),
                    'false_positive_rate': float(fpr),
                    'true_positives': int(true_positives),
                    'false_positives': int(false_positives),
                    'true_negatives': int(true_negatives),
                    'false_negatives': int(false_negatives)
                }
            else:
                # Handle case where only one class is present in the group
                group_tpr[str(group)] = 0.0
                group_fpr[str(group)] = 0.0
                fairness_metrics['equalized_odds'][str(group)] = {
                    'true_positive_rate': 0.0,
                    'false_positive_rate': 0.0,
                    'note': 'Only one class present in group'
                }
        
        # Calculate fairness metric differences
        if len(group_positive_rates) >= 2:
            pos_rates = list(group_positive_rates.values())
            fairness_metrics['demographic_parity_difference'] = float(max(pos_rates) - min(pos_rates))
        else:
            fairness_metrics['demographic_parity_difference'] = 0.0
        
        if len(group_tpr) >= 2:
            tpr_values = list(group_tpr.values())
            fpr_values = list(group_fpr.values())
            
            fairness_metrics['equalized_odds_difference'] = {
                'true_positive_rate_difference': float(max(tpr_values) - min(tpr_values)),
                'false_positive_rate_difference': float(max(fpr_values) - min(fpr_values))
            }
            
            # Equal opportunity difference (focuses only on TPR)
            fairness_metrics['equal_opportunity_difference'] = float(max(tpr_values) - min(tpr_values))
        else:
            fairness_metrics['equalized_odds_difference'] = {
                'true_positive_rate_difference': 0.0,
                'false_positive_rate_difference': 0.0
            }
            fairness_metrics['equal_opportunity_difference'] = 0.0
        
        # Calculate overall performance metrics for context
        fairness_metrics['overall_metrics'] = {
            'overall_accuracy': float(accuracy_score(y_true, y_pred)),
            'overall_precision': float(precision_score(y_true, y_pred, average='weighted', zero_division=0)),
            'overall_recall': float(recall_score(y_true, y_pred, average='weighted', zero_division=0)),
            'overall_f1': float(f1_score(y_true, y_pred, average='weighted', zero_division=0)),
            'total_samples': int(len(y_true)),
            'number_of_groups': int(len(unique_groups))
        }
        
        # Log fairness analysis results for audit trail
        logger.info(f"Fairness metrics calculated for {len(unique_groups)} groups with {len(y_true)} total samples")
        logger.info(f"Demographic parity difference: {fairness_metrics['demographic_parity_difference']:.6f}")
        logger.info(f"Equal opportunity difference: {fairness_metrics['equal_opportunity_difference']:.6f}")
        
        # Flag potential fairness issues
        if fairness_metrics['demographic_parity_difference'] > 0.1:
            logger.warning(f"High demographic parity difference detected: {fairness_metrics['demographic_parity_difference']:.3f}")
        
        if fairness_metrics['equal_opportunity_difference'] > 0.1:
            logger.warning(f"High equal opportunity difference detected: {fairness_metrics['equal_opportunity_difference']:.3f}")
        
        return fairness_metrics
        
    except Exception as e:
        logger.error(f"Error calculating fairness metrics: {str(e)}")
        raise


# Additional utility functions for comprehensive model evaluation

def calculate_model_performance_summary(y_true: np.ndarray, y_pred: np.ndarray, 
                                      y_scores: Optional[np.ndarray] = None,
                                      sensitive_features: Optional[np.ndarray] = None) -> Dict[str, Union[float, Dict]]:
    """
    Calculates a comprehensive summary of model performance metrics.
    
    This function provides a complete evaluation of model performance including
    standard classification metrics and fairness metrics if sensitive features
    are provided. It's designed to support regulatory requirements for model
    explainability and transparency.
    
    Args:
        y_true (np.ndarray): True labels/target values
        y_pred (np.ndarray): Predicted labels
        y_scores (Optional[np.ndarray]): Prediction scores for ROC AUC calculation
        sensitive_features (Optional[np.ndarray]): Sensitive attributes for fairness analysis
        
    Returns:
        Dict[str, Union[float, Dict]]: Comprehensive performance summary
    """
    try:
        summary = {
            'classification_metrics': {
                'accuracy': calculate_accuracy(y_true, y_pred),
                'precision': calculate_precision(y_true, y_pred),
                'recall': calculate_recall(y_true, y_pred),
                'f1_score': calculate_f1_score(y_true, y_pred)
            },
            'confusion_matrix': generate_confusion_matrix(y_true, y_pred).tolist()
        }
        
        # Add ROC AUC if scores are provided
        if y_scores is not None:
            try:
                summary['classification_metrics']['roc_auc'] = calculate_roc_auc(y_true, y_scores)
            except Exception as e:
                logger.warning(f"Could not calculate ROC AUC: {str(e)}")
                summary['classification_metrics']['roc_auc'] = None
        
        # Add fairness metrics if sensitive features are provided
        if sensitive_features is not None:
            try:
                summary['fairness_metrics'] = calculate_fairness_metrics(y_true, y_pred, sensitive_features)
            except Exception as e:
                logger.warning(f"Could not calculate fairness metrics: {str(e)}")
                summary['fairness_metrics'] = None
        
        # Add metadata
        summary['metadata'] = {
            'total_samples': int(len(y_true)),
            'unique_classes': len(np.unique(y_true)),
            'class_distribution': {str(cls): int(count) for cls, count in 
                                 zip(*np.unique(y_true, return_counts=True))}
        }
        
        logger.info("Comprehensive model performance summary calculated")
        
        return summary
        
    except Exception as e:
        logger.error(f"Error calculating model performance summary: {str(e)}")
        raise


# Export all functions for use by other modules
__all__ = [
    'calculate_accuracy',
    'calculate_precision', 
    'calculate_recall',
    'calculate_f1_score',
    'calculate_roc_auc',
    'generate_confusion_matrix',
    'calculate_fairness_metrics',
    'calculate_model_performance_summary'
]