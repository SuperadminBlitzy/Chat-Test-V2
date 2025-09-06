"""
Advanced Feature Engineering Utilities for Financial AI Services

This module provides comprehensive feature engineering functions for creating ML-ready features
from raw financial data. These functions support:
- AI-Powered Risk Assessment Engine (F-002)
- Fraud Detection System (F-006) 
- Personalized Financial Recommendations (F-007)

All functions are optimized for real-time processing (<500ms response time) and
production-grade financial applications with 99.9% availability requirements.

Author: AI Service Team
Version: 1.0.0
Last Updated: 2025-01-13
"""

import pandas as pd  # version 2.2.0 - Data manipulation and analysis framework
import numpy as np  # version 1.26.4 - Numerical computing library for efficient array operations
from sklearn.preprocessing import StandardScaler, LabelEncoder, RobustScaler  # version 1.3.0 - Preprocessing utilities
from sklearn.impute import SimpleImputer  # version 1.3.0 - Missing value imputation
import warnings
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Union
import logging

# Configure logging for production monitoring
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Suppress sklearn warnings for cleaner production logs
warnings.filterwarnings('ignore', category=UserWarning)

def create_transaction_features(transaction_data: pd.DataFrame) -> pd.DataFrame:
    """
    Creates comprehensive features from raw transaction data for AI/ML models.
    
    This function generates features critical for risk assessment, fraud detection,
    and financial wellness analysis. Features include transaction frequency patterns,
    amount statistics, temporal patterns, and behavioral indicators.
    
    Performance Target: <500ms for risk assessment compliance (F-002-RQ-001)
    Accuracy Target: Contributes to 95% overall model accuracy (F-002-RQ-002)
    
    Args:
        transaction_data (pd.DataFrame): Raw transaction data containing columns:
            - customer_id: Unique customer identifier
            - transaction_amount: Transaction amount in base currency
            - transaction_date: Transaction timestamp
            - transaction_type: Type of transaction (debit/credit/transfer)
            - merchant_category: Category of merchant/transaction
            - location: Transaction location
            - channel: Transaction channel (online/atm/branch/mobile)
    
    Returns:
        pd.DataFrame: Engineered transaction features with columns:
            - customer_id: Customer identifier for joining
            - transaction_frequency_daily: Average transactions per day
            - transaction_frequency_weekly: Average transactions per week
            - transaction_frequency_monthly: Average transactions per month
            - avg_transaction_amount: Mean transaction amount
            - median_transaction_amount: Median transaction amount
            - std_transaction_amount: Standard deviation of amounts
            - max_transaction_amount: Maximum transaction amount
            - min_transaction_amount: Minimum transaction amount
            - total_transaction_amount: Sum of all transactions
            - days_since_last_transaction: Days since most recent transaction
            - rolling_avg_7d: 7-day rolling average of transaction amounts
            - rolling_avg_30d: 30-day rolling average of transaction amounts
            - rolling_std_7d: 7-day rolling standard deviation
            - rolling_std_30d: 30-day rolling standard deviation
            - transaction_velocity: Rate of transactions per hour
            - unique_merchants: Number of unique merchants
            - unique_locations: Number of unique transaction locations
            - unique_channels: Number of unique transaction channels
            - weekend_transaction_ratio: Ratio of weekend transactions
            - night_transaction_ratio: Ratio of transactions 22:00-06:00
            - large_transaction_ratio: Ratio of transactions >2 std devs from mean
            - small_transaction_ratio: Ratio of transactions <0.5 std devs from mean
            - credit_debit_ratio: Ratio of credit to debit transactions
            - online_offline_ratio: Ratio of online to offline transactions
            - transaction_amount_trend: Linear trend of transaction amounts over time
            - transaction_frequency_trend: Linear trend of transaction frequency
    
    Raises:
        ValueError: If required columns are missing from input data
        Exception: For unexpected processing errors with detailed logging
    """
    try:
        logger.info(f"Starting transaction feature engineering for {len(transaction_data)} records")
        
        # Validate required columns
        required_columns = ['customer_id', 'transaction_amount', 'transaction_date', 
                          'transaction_type', 'merchant_category', 'location', 'channel']
        missing_columns = [col for col in required_columns if col not in transaction_data.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")
        
        # Create a copy to avoid modifying original data
        df = transaction_data.copy()
        
        # Convert transaction_date to datetime for temporal analysis
        df['transaction_date'] = pd.to_datetime(df['transaction_date'])
        df = df.sort_values(['customer_id', 'transaction_date'])
        
        # Initialize feature dictionary for efficient computation
        features = {}
        
        # Group by customer for feature calculation
        customer_groups = df.groupby('customer_id')
        
        logger.info("Computing basic transaction statistics...")
        
        # Calculate transaction frequency per customer
        date_ranges = customer_groups['transaction_date'].agg(['min', 'max'])
        date_ranges['date_range_days'] = (date_ranges['max'] - date_ranges['min']).dt.days + 1
        transaction_counts = customer_groups.size()
        
        features['transaction_frequency_daily'] = (transaction_counts / date_ranges['date_range_days']).fillna(0)
        features['transaction_frequency_weekly'] = features['transaction_frequency_daily'] * 7
        features['transaction_frequency_monthly'] = features['transaction_frequency_daily'] * 30
        
        # Calculate comprehensive amount statistics
        amount_stats = customer_groups['transaction_amount'].agg([
            'mean', 'median', 'std', 'max', 'min', 'sum', 'count'
        ])
        features['avg_transaction_amount'] = amount_stats['mean']
        features['median_transaction_amount'] = amount_stats['median']
        features['std_transaction_amount'] = amount_stats['std'].fillna(0)
        features['max_transaction_amount'] = amount_stats['max']
        features['min_transaction_amount'] = amount_stats['min']
        features['total_transaction_amount'] = amount_stats['sum']
        
        logger.info("Computing temporal features and recency metrics...")
        
        # Calculate time since last transaction for risk assessment
        current_date = datetime.now()
        last_transaction_dates = customer_groups['transaction_date'].max()
        features['days_since_last_transaction'] = (current_date - last_transaction_dates).dt.days
        
        # Calculate rolling statistics for trend analysis
        df['rolling_avg_7d'] = df.groupby('customer_id')['transaction_amount'].transform(
            lambda x: x.rolling(window=7, min_periods=1).mean()
        )
        df['rolling_avg_30d'] = df.groupby('customer_id')['transaction_amount'].transform(
            lambda x: x.rolling(window=30, min_periods=1).mean()
        )
        df['rolling_std_7d'] = df.groupby('customer_id')['transaction_amount'].transform(
            lambda x: x.rolling(window=7, min_periods=1).std().fillna(0)
        )
        df['rolling_std_30d'] = df.groupby('customer_id')['transaction_amount'].transform(
            lambda x: x.rolling(window=30, min_periods=1).std().fillna(0)
        )
        
        # Get latest rolling values per customer
        latest_values = df.groupby('customer_id').last()
        features['rolling_avg_7d'] = latest_values['rolling_avg_7d']
        features['rolling_avg_30d'] = latest_values['rolling_avg_30d']
        features['rolling_std_7d'] = latest_values['rolling_std_7d']
        features['rolling_std_30d'] = latest_values['rolling_std_30d']
        
        logger.info("Computing velocity and behavioral features...")
        
        # Calculate transaction velocity (critical for fraud detection F-006)
        df['hour_diff'] = df.groupby('customer_id')['transaction_date'].diff().dt.total_seconds() / 3600
        velocity_stats = df.groupby('customer_id')['hour_diff'].agg(['mean', 'min'])
        features['transaction_velocity'] = 1 / velocity_stats['mean'].replace([np.inf, 0], 24)  # Transactions per hour
        
        # Calculate diversity metrics for risk profiling
        features['unique_merchants'] = customer_groups['merchant_category'].nunique()
        features['unique_locations'] = customer_groups['location'].nunique()
        features['unique_channels'] = customer_groups['channel'].nunique()
        
        logger.info("Computing advanced behavioral patterns...")
        
        # Calculate temporal behavior patterns
        df['hour'] = df['transaction_date'].dt.hour
        df['is_weekend'] = df['transaction_date'].dt.weekday >= 5
        df['is_night'] = (df['hour'] >= 22) | (df['hour'] <= 6)
        
        weekend_ratios = df.groupby('customer_id')['is_weekend'].mean()
        night_ratios = df.groupby('customer_id')['is_night'].mean()
        features['weekend_transaction_ratio'] = weekend_ratios
        features['night_transaction_ratio'] = night_ratios
        
        # Calculate amount-based behavioral indicators
        df['z_score'] = df.groupby('customer_id')['transaction_amount'].transform(
            lambda x: (x - x.mean()) / (x.std() + 1e-8)  # Add small epsilon to avoid division by zero
        )
        
        large_transaction_ratios = df.groupby('customer_id').apply(
            lambda group: (group['z_score'] > 2).mean()
        )
        small_transaction_ratios = df.groupby('customer_id').apply(
            lambda group: (group['z_score'] < -0.5).mean()
        )
        features['large_transaction_ratio'] = large_transaction_ratios
        features['small_transaction_ratio'] = small_transaction_ratios
        
        # Calculate transaction type ratios for risk assessment
        type_ratios = df.groupby(['customer_id', 'transaction_type']).size().unstack(fill_value=0)
        if 'credit' in type_ratios.columns and 'debit' in type_ratios.columns:
            features['credit_debit_ratio'] = (type_ratios['credit'] + 1) / (type_ratios['debit'] + 1)
        else:
            features['credit_debit_ratio'] = pd.Series(1.0, index=customer_groups.groups.keys())
        
        # Calculate channel-based behavior patterns
        df['is_online'] = df['channel'].isin(['online', 'mobile'])
        online_ratios = df.groupby('customer_id')['is_online'].mean()
        features['online_offline_ratio'] = online_ratios / (1 - online_ratios + 1e-8)
        
        logger.info("Computing trend analysis features...")
        
        # Calculate transaction amount trends over time for predictive modeling
        def calculate_trend(group):
            if len(group) < 2:
                return 0
            x = np.arange(len(group))
            y = group['transaction_amount'].values
            try:
                trend = np.polyfit(x, y, 1)[0]  # Linear trend slope
                return trend
            except:
                return 0
        
        amount_trends = customer_groups.apply(calculate_trend)
        features['transaction_amount_trend'] = amount_trends
        
        # Calculate transaction frequency trends
        df['date_numeric'] = (df['transaction_date'] - df['transaction_date'].min()).dt.days
        freq_trends = df.groupby('customer_id').apply(
            lambda group: np.polyfit(group['date_numeric'], np.ones(len(group)), 1)[0] 
            if len(group) > 1 else 0
        )
        features['transaction_frequency_trend'] = freq_trends
        
        # Combine all features into final DataFrame
        logger.info("Assembling final feature set...")
        
        feature_df = pd.DataFrame(features)
        feature_df.index.name = 'customer_id'
        feature_df = feature_df.reset_index()
        
        # Handle any remaining missing values with appropriate imputation
        numeric_columns = feature_df.select_dtypes(include=[np.number]).columns
        feature_df[numeric_columns] = feature_df[numeric_columns].fillna(0)
        
        # Apply robust scaling to handle outliers in financial data
        scaler = RobustScaler()
        scaling_columns = [col for col in numeric_columns if col != 'customer_id']
        feature_df[scaling_columns] = scaler.fit_transform(feature_df[scaling_columns])
        
        logger.info(f"Transaction feature engineering completed. Generated {len(feature_df.columns)-1} features for {len(feature_df)} customers")
        
        return feature_df
        
    except Exception as e:
        logger.error(f"Error in create_transaction_features: {str(e)}")
        raise


def create_customer_features(customer_data: pd.DataFrame) -> pd.DataFrame:
    """
    Creates comprehensive features from raw customer data for AI/ML risk assessment.
    
    This function generates demographic and account-based features essential for
    risk scoring, personalized recommendations, and compliance monitoring.
    Supports explainable AI requirements (F-002-RQ-003) through interpretable features.
    
    Args:
        customer_data (pd.DataFrame): Raw customer data containing:
            - customer_id: Unique customer identifier
            - date_of_birth: Customer birth date
            - account_opening_date: Date when account was opened
            - gender: Customer gender
            - occupation: Customer occupation
            - annual_income: Annual income in base currency
            - credit_score: Credit score if available
            - marital_status: Marital status
            - education_level: Education level
            - employment_status: Employment status
            - address_state: State/province of residence
            - phone_verified: Boolean indicating phone verification
            - email_verified: Boolean indicating email verification
    
    Returns:
        pd.DataFrame: Engineered customer features including:
            - customer_id: Customer identifier
            - customer_age: Age calculated from date of birth
            - account_tenure_days: Days since account opening
            - account_tenure_years: Years since account opening
            - gender_encoded: Numerically encoded gender
            - occupation_encoded: Numerically encoded occupation
            - marital_status_encoded: Numerically encoded marital status
            - education_level_encoded: Numerically encoded education
            - employment_status_encoded: Numerically encoded employment
            - state_encoded: Numerically encoded state
            - income_decile: Income percentile ranking (1-10)
            - income_log: Log-transformed income for normalization
            - credit_score_normalized: Normalized credit score (0-1)
            - age_income_ratio: Age to income interaction feature
            - tenure_income_ratio: Account tenure to income ratio
            - verification_score: Combined verification status score
            - risk_profile_demographic: Demographic-based risk indicator
            - income_stability_indicator: Income stability assessment
    
    Raises:
        ValueError: If required columns are missing
        Exception: For processing errors with detailed logging
    """
    try:
        logger.info(f"Starting customer feature engineering for {len(customer_data)} records")
        
        # Validate required columns
        required_columns = ['customer_id', 'date_of_birth', 'account_opening_date', 
                          'gender', 'occupation', 'annual_income']
        missing_columns = [col for col in required_columns if col not in customer_data.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")
        
        # Create working copy
        df = customer_data.copy()
        
        # Convert date columns
        df['date_of_birth'] = pd.to_datetime(df['date_of_birth'])
        df['account_opening_date'] = pd.to_datetime(df['account_opening_date'])
        
        logger.info("Computing age and tenure features...")
        
        # Calculate customer age from date of birth
        current_date = datetime.now()
        df['customer_age'] = (current_date - df['date_of_birth']).dt.days / 365.25
        
        # Calculate account tenure from account opening date
        df['account_tenure_days'] = (current_date - df['account_opening_date']).dt.days
        df['account_tenure_years'] = df['account_tenure_days'] / 365.25
        
        logger.info("Encoding categorical features...")
        
        # Initialize label encoders for categorical features
        categorical_columns = ['gender', 'occupation', 'marital_status', 'education_level', 
                             'employment_status', 'address_state']
        
        for col in categorical_columns:
            if col in df.columns:
                # Handle missing values before encoding
                df[col] = df[col].fillna('Unknown')
                
                # Create label encoder
                le = LabelEncoder()
                df[f'{col}_encoded'] = le.fit_transform(df[col])
            else:
                # Create default encoding if column doesn't exist
                df[f'{col}_encoded'] = 0
        
        logger.info("Computing income-based features...")
        
        # Create income-based features for risk assessment
        df['annual_income'] = df['annual_income'].fillna(df['annual_income'].median())
        
        # Calculate income deciles for risk stratification
        df['income_decile'] = pd.qcut(df['annual_income'], q=10, labels=range(1, 11), duplicates='drop')
        df['income_decile'] = df['income_decile'].astype(float)
        
        # Log transform income to handle skewness
        df['income_log'] = np.log1p(df['annual_income'])  # log(1+x) to handle zero values
        
        # Normalize credit score if available
        if 'credit_score' in df.columns:
            df['credit_score'] = df['credit_score'].fillna(df['credit_score'].median())
            df['credit_score_normalized'] = (df['credit_score'] - 300) / (850 - 300)  # Assuming FICO range
        else:
            df['credit_score_normalized'] = 0.5  # Default middle score
        
        logger.info("Creating interaction and composite features...")
        
        # Create interaction features for enhanced predictive power
        df['age_income_ratio'] = df['customer_age'] / (df['annual_income'] / 1000)  # Age per $1K income
        df['tenure_income_ratio'] = df['account_tenure_years'] / (df['annual_income'] / 10000)  # Tenure per $10K
        
        # Create verification score from boolean verification fields
        verification_cols = ['phone_verified', 'email_verified']
        verification_sum = 0
        verification_count = 0
        
        for col in verification_cols:
            if col in df.columns:
                df[col] = df[col].fillna(False).astype(bool)
                verification_sum += df[col].astype(int)
                verification_count += 1
        
        df['verification_score'] = verification_sum / max(verification_count, 1)
        
        logger.info("Computing risk profile indicators...")
        
        # Create demographic-based risk profile (explainable AI feature)
        # Higher risk: younger age, shorter tenure, lower income, lower verification
        df['risk_profile_demographic'] = (
            (df['customer_age'] < 25).astype(int) * 0.3 +  # Young age risk
            (df['account_tenure_years'] < 1).astype(int) * 0.3 +  # New account risk
            (df['income_decile'] <= 3).astype(int) * 0.2 +  # Low income risk
            (df['verification_score'] < 0.5).astype(int) * 0.2  # Low verification risk
        )
        
        # Create income stability indicator based on employment and education
        stability_score = 0
        if 'employment_status_encoded' in df.columns:
            # Assume higher encoded values represent more stable employment
            stability_score += df['employment_status_encoded'] / df['employment_status_encoded'].max()
        
        if 'education_level_encoded' in df.columns:
            # Higher education typically indicates income stability
            stability_score += df['education_level_encoded'] / df['education_level_encoded'].max()
        
        df['income_stability_indicator'] = stability_score / 2  # Normalize to 0-1
        
        logger.info("Finalizing customer features...")
        
        # Select final feature columns
        feature_columns = [
            'customer_id', 'customer_age', 'account_tenure_days', 'account_tenure_years',
            'gender_encoded', 'occupation_encoded', 'marital_status_encoded',
            'education_level_encoded', 'employment_status_encoded', 'address_state_encoded',
            'income_decile', 'income_log', 'credit_score_normalized',
            'age_income_ratio', 'tenure_income_ratio', 'verification_score',
            'risk_profile_demographic', 'income_stability_indicator'
        ]
        
        # Create final feature DataFrame
        feature_df = df[feature_columns].copy()
        
        # Handle any remaining missing values
        numeric_columns = feature_df.select_dtypes(include=[np.number]).columns
        feature_df[numeric_columns] = feature_df[numeric_columns].fillna(0)
        
        # Apply standard scaling to numeric features (excluding customer_id)
        scaler = StandardScaler()
        scaling_columns = [col for col in numeric_columns if col != 'customer_id']
        feature_df[scaling_columns] = scaler.fit_transform(feature_df[scaling_columns])
        
        logger.info(f"Customer feature engineering completed. Generated {len(feature_df.columns)-1} features for {len(feature_df)} customers")
        
        return feature_df
        
    except Exception as e:
        logger.error(f"Error in create_customer_features: {str(e)}")
        raise


def create_risk_features(customer_features: pd.DataFrame, transaction_features: pd.DataFrame) -> pd.DataFrame:
    """
    Combines customer and transaction features to create comprehensive risk assessment features.
    
    This function creates advanced risk indicators by combining demographic and behavioral data
    for the AI-Powered Risk Assessment Engine (F-002). Features support real-time risk scoring
    with <500ms response time and 95% accuracy requirements.
    
    Args:
        customer_features (pd.DataFrame): Output from create_customer_features()
        transaction_features (pd.DataFrame): Output from create_transaction_features()
    
    Returns:
        pd.DataFrame: Combined risk assessment features including:
            - All customer and transaction features
            - transaction_amount_to_income_ratio: Spending relative to income
            - high_value_transaction_frequency: Frequency of large transactions
            - transaction_diversity_score: Breadth of transaction patterns
            - behavioral_consistency_score: Consistency in transaction behavior
            - risk_velocity_indicator: Combined velocity and risk metrics
            - spending_pattern_stability: Stability of spending patterns
            - account_maturity_risk: Risk based on account age and activity
            - financial_stress_indicator: Signs of financial distress
            - payment_behavior_score: Payment pattern analysis
            - risk_composite_score: Overall risk assessment score
    
    Raises:
        ValueError: If DataFrames cannot be merged or required columns missing
        Exception: For processing errors with detailed logging
    """
    try:
        logger.info("Starting risk feature engineering...")
        
        # Validate input DataFrames
        if 'customer_id' not in customer_features.columns:
            raise ValueError("customer_features missing customer_id column")
        if 'customer_id' not in transaction_features.columns:
            raise ValueError("transaction_features missing customer_id column")
        
        logger.info("Merging customer and transaction feature DataFrames...")
        
        # Merge customer and transaction feature DataFrames
        risk_df = pd.merge(customer_features, transaction_features, on='customer_id', how='inner')
        
        if len(risk_df) == 0:
            raise ValueError("No matching customers found between customer and transaction features")
        
        logger.info(f"Successfully merged features for {len(risk_df)} customers")
        
        logger.info("Creating transaction-to-income ratio features...")
        
        # Create interaction features between customer and transaction data
        # Transaction amount to income ratio (critical risk indicator)
        risk_df['transaction_amount_to_income_ratio'] = (
            risk_df['avg_transaction_amount'] / (np.exp(risk_df['income_log']) / 1000)
        )  # Ratio of avg transaction to income (in thousands)
        
        # High-value transaction frequency relative to income
        risk_df['high_value_transaction_frequency'] = (
            risk_df['large_transaction_ratio'] * risk_df['transaction_frequency_daily'] /
            (risk_df['income_decile'] + 1)  # Adjust by income level
        )
        
        logger.info("Computing behavioral and diversity metrics...")
        
        # Create transaction diversity score (lower diversity = higher risk)
        risk_df['transaction_diversity_score'] = (
            risk_df['unique_merchants'] * 0.4 +
            risk_df['unique_locations'] * 0.3 +
            risk_df['unique_channels'] * 0.3
        ) / 3  # Normalized diversity score
        
        # Behavioral consistency score (inconsistency = higher risk)
        risk_df['behavioral_consistency_score'] = 1 / (
            1 + risk_df['std_transaction_amount'] + 
            risk_df['rolling_std_30d'] + 
            abs(risk_df['transaction_amount_trend'])
        )
        
        logger.info("Creating velocity and temporal risk indicators...")
        
        # Risk velocity indicator combining transaction velocity with risk factors
        risk_df['risk_velocity_indicator'] = (
            risk_df['transaction_velocity'] * 
            (1 + risk_df['night_transaction_ratio'] + risk_df['weekend_transaction_ratio']) *
            (1 + risk_df['large_transaction_ratio'])
        )
        
        # Spending pattern stability
        risk_df['spending_pattern_stability'] = 1 / (
            1 + abs(risk_df['rolling_avg_7d'] - risk_df['rolling_avg_30d']) +
            abs(risk_df['transaction_frequency_trend'])
        )
        
        logger.info("Computing account maturity and financial stress indicators...")
        
        # Account maturity risk (new accounts with high activity = higher risk)
        risk_df['account_maturity_risk'] = (
            (1 / (risk_df['account_tenure_years'] + 0.1)) *  # Inverse of tenure
            risk_df['transaction_frequency_daily'] *  # Activity level
            (1 + risk_df['transaction_amount_to_income_ratio'])  # Spending relative to income
        )
        
        # Financial stress indicator
        # High spending, declining balances, increasing transaction frequency
        risk_df['financial_stress_indicator'] = (
            risk_df['transaction_amount_to_income_ratio'] * 0.4 +
            (risk_df['transaction_frequency_trend'] > 0).astype(int) * 0.3 +  # Increasing frequency
            (risk_df['days_since_last_transaction'] < 1).astype(int) * 0.3  # Very recent activity
        )
        
        logger.info("Creating payment behavior and composite risk scores...")
        
        # Payment behavior score (for credit risk assessment)
        risk_df['payment_behavior_score'] = (
            risk_df['credit_score_normalized'] * 0.4 +
            risk_df['verification_score'] * 0.2 +
            risk_df['spending_pattern_stability'] * 0.2 +
            risk_df['behavioral_consistency_score'] * 0.2
        )
        
        # Create comprehensive risk composite score
        # Higher score = higher risk (0-1 scale)
        risk_df['risk_composite_score'] = (
            risk_df['risk_profile_demographic'] * 0.2 +  # Demographic risk
            risk_df['financial_stress_indicator'] * 0.25 +  # Financial stress
            risk_df['account_maturity_risk'] * 0.15 +  # Account maturity
            (1 - risk_df['payment_behavior_score']) * 0.2 +  # Payment behavior (inverted)
            risk_df['risk_velocity_indicator'] * 0.1 +  # Transaction velocity risk
            (1 - risk_df['transaction_diversity_score']) * 0.1  # Diversity risk (inverted)
        )
        
        # Normalize composite score to 0-1 range
        risk_df['risk_composite_score'] = (
            (risk_df['risk_composite_score'] - risk_df['risk_composite_score'].min()) /
            (risk_df['risk_composite_score'].max() - risk_df['risk_composite_score'].min() + 1e-8)
        )
        
        logger.info("Applying final feature scaling and validation...")
        
        # Handle any infinite or NaN values that might have been created
        risk_df = risk_df.replace([np.inf, -np.inf], np.nan)
        numeric_columns = risk_df.select_dtypes(include=[np.number]).columns
        risk_df[numeric_columns] = risk_df[numeric_columns].fillna(0)
        
        # Apply robust scaling to new risk features
        risk_feature_columns = [
            'transaction_amount_to_income_ratio', 'high_value_transaction_frequency',
            'transaction_diversity_score', 'behavioral_consistency_score',
            'risk_velocity_indicator', 'spending_pattern_stability',
            'account_maturity_risk', 'financial_stress_indicator',
            'payment_behavior_score'
        ]
        
        scaler = RobustScaler()
        risk_df[risk_feature_columns] = scaler.fit_transform(risk_df[risk_feature_columns])
        
        logger.info(f"Risk feature engineering completed. Generated {len(risk_df.columns)} total features for {len(risk_df)} customers")
        
        return risk_df
        
    except Exception as e:
        logger.error(f"Error in create_risk_features: {str(e)}")
        raise


def create_financial_wellness_features(customer_data: pd.DataFrame, transaction_data: pd.DataFrame) -> pd.DataFrame:
    """
    Creates features for the financial wellness recommendation engine.
    
    This function generates features supporting Personalized Financial Recommendations (F-007)
    by analyzing spending patterns, savings behavior, and financial health indicators.
    
    Args:
        customer_data (pd.DataFrame): Raw customer data
        transaction_data (pd.DataFrame): Raw transaction data
    
    Returns:
        pd.DataFrame: Financial wellness features including:
            - customer_id: Customer identifier
            - savings_rate: Income to savings ratio
            - debt_to_income_ratio: Debt obligations relative to income
            - spending_category_ratios: Spending distribution across categories
            - emergency_fund_indicator: Emergency fund adequacy assessment
            - budget_adherence_score: Consistency with spending patterns
            - financial_goal_progress: Progress toward financial milestones
            - cashflow_volatility: Income/expense volatility measure
            - discretionary_spending_ratio: Non-essential spending ratio
            - financial_wellness_score: Overall wellness composite score
    
    Raises:
        ValueError: If required data is missing
        Exception: For processing errors
    """
    try:
        logger.info(f"Starting financial wellness feature engineering...")
        
        # Validate required columns
        required_customer_cols = ['customer_id', 'annual_income']
        required_transaction_cols = ['customer_id', 'transaction_amount', 'transaction_type', 'merchant_category']
        
        missing_customer_cols = [col for col in required_customer_cols if col not in customer_data.columns]
        missing_transaction_cols = [col for col in required_transaction_cols if col not in transaction_data.columns]
        
        if missing_customer_cols:
            raise ValueError(f"Missing customer columns: {missing_customer_cols}")
        if missing_transaction_cols:
            raise ValueError(f"Missing transaction columns: {missing_transaction_cols}")
        
        # Create working copies
        customer_df = customer_data.copy()
        transaction_df = transaction_data.copy()
        
        logger.info("Computing savings rate and income analysis...")
        
        # Calculate monthly income
        customer_df['monthly_income'] = customer_df['annual_income'] / 12
        
        # Calculate monthly spending from transactions
        monthly_spending = transaction_df.groupby('customer_id').agg({
            'transaction_amount': ['sum', 'mean', 'std']
        }).round(2)
        monthly_spending.columns = ['total_monthly_spending', 'avg_transaction', 'spending_volatility']
        monthly_spending = monthly_spending.reset_index()
        
        # Merge customer and spending data
        wellness_df = pd.merge(customer_df[['customer_id', 'monthly_income']], 
                              monthly_spending, on='customer_id', how='inner')
        
        # Calculate savings rate (income - expenses) / income
        wellness_df['monthly_expenses'] = wellness_df['total_monthly_spending']
        wellness_df['monthly_savings'] = wellness_df['monthly_income'] - wellness_df['monthly_expenses']
        wellness_df['savings_rate'] = wellness_df['monthly_savings'] / wellness_df['monthly_income']
        wellness_df['savings_rate'] = wellness_df['savings_rate'].clip(-1, 1)  # Cap at reasonable range
        
        logger.info("Computing debt-to-income and spending category analysis...")
        
        # Estimate debt payments from transaction categories
        debt_categories = ['loan_payment', 'credit_card', 'mortgage', 'debt_payment']
        debt_transactions = transaction_df[
            transaction_df['merchant_category'].str.lower().isin(debt_categories)
        ]
        
        monthly_debt_payments = debt_transactions.groupby('customer_id')['transaction_amount'].sum()
        wellness_df = wellness_df.merge(
            monthly_debt_payments.rename('monthly_debt_payments').reset_index(), 
            on='customer_id', how='left'
        )
        wellness_df['monthly_debt_payments'] = wellness_df['monthly_debt_payments'].fillna(0)
        
        # Calculate debt-to-income ratio
        wellness_df['debt_to_income_ratio'] = (
            wellness_df['monthly_debt_payments'] / wellness_df['monthly_income']
        ).clip(0, 2)  # Cap at 200% for outlier protection
        
        logger.info("Analyzing spending patterns by category...")
        
        # Categorize spending into wellness categories
        essential_categories = ['groceries', 'utilities', 'rent', 'mortgage', 'insurance', 'healthcare']
        discretionary_categories = ['entertainment', 'dining', 'shopping', 'travel', 'hobbies']
        investment_categories = ['investment', 'savings', 'retirement', 'financial_services']
        
        # Calculate spending ratios by category type
        for category_type, categories in [
            ('essential', essential_categories),
            ('discretionary', discretionary_categories), 
            ('investment', investment_categories)
        ]:
            category_spending = transaction_df[
                transaction_df['merchant_category'].str.lower().isin(categories)
            ].groupby('customer_id')['transaction_amount'].sum()
            
            wellness_df = wellness_df.merge(
                category_spending.rename(f'{category_type}_spending').reset_index(),
                on='customer_id', how='left'
            )
            wellness_df[f'{category_type}_spending'] = wellness_df[f'{category_type}_spending'].fillna(0)
            wellness_df[f'{category_type}_spending_ratio'] = (
                wellness_df[f'{category_type}_spending'] / wellness_df['total_monthly_spending']
            ).fillna(0).clip(0, 1)
        
        logger.info("Computing financial wellness indicators...")
        
        # Emergency fund indicator (3-6 months of expenses is healthy)
        wellness_df['emergency_fund_months'] = (
            wellness_df['monthly_savings'].cumsum() / wellness_df['monthly_expenses']
        ).clip(0, 12)  # Cap at 12 months
        
        wellness_df['emergency_fund_indicator'] = np.where(
            wellness_df['emergency_fund_months'] >= 3, 1.0,
            wellness_df['emergency_fund_months'] / 3
        )
        
        # Budget adherence score (consistency in spending)
        wellness_df['budget_adherence_score'] = 1 / (1 + wellness_df['spending_volatility'] / wellness_df['avg_transaction'])
        
        # Financial goal progress (based on savings rate and investment ratio)
        wellness_df['financial_goal_progress'] = (
            wellness_df['savings_rate'] * 0.6 +
            wellness_df['investment_spending_ratio'] * 0.4
        ).clip(0, 1)
        
        # Cashflow volatility (lower is better for financial stability)
        wellness_df['cashflow_volatility'] = (
            wellness_df['spending_volatility'] / (wellness_df['monthly_income'] + 1)
        )
        
        logger.info("Creating composite financial wellness score...")
        
        # Composite financial wellness score (0-1, higher is better)
        wellness_df['financial_wellness_score'] = (
            wellness_df['savings_rate'].clip(0, 1) * 0.25 +  # Positive savings rate
            (1 - wellness_df['debt_to_income_ratio'].clip(0, 1)) * 0.20 +  # Low debt ratio
            wellness_df['emergency_fund_indicator'] * 0.20 +  # Emergency fund
            wellness_df['budget_adherence_score'] * 0.15 +  # Budget adherence
            wellness_df['investment_spending_ratio'] * 0.10 +  # Investment activity
            (1 - wellness_df['discretionary_spending_ratio']) * 0.10  # Controlled discretionary spending
        )
        
        # Normalize wellness score to 0-1 range
        wellness_score_min = wellness_df['financial_wellness_score'].min()
        wellness_score_max = wellness_df['financial_wellness_score'].max()
        wellness_df['financial_wellness_score'] = (
            (wellness_df['financial_wellness_score'] - wellness_score_min) /
            (wellness_score_max - wellness_score_min + 1e-8)
        )
        
        logger.info("Finalizing financial wellness features...")
        
        # Select final feature columns
        feature_columns = [
            'customer_id', 'savings_rate', 'debt_to_income_ratio',
            'essential_spending_ratio', 'discretionary_spending_ratio', 'investment_spending_ratio',
            'emergency_fund_indicator', 'budget_adherence_score', 'financial_goal_progress',
            'cashflow_volatility', 'financial_wellness_score'
        ]
        
        wellness_features = wellness_df[feature_columns].copy()
        
        # Handle missing values and infinite values
        wellness_features = wellness_features.replace([np.inf, -np.inf], np.nan)
        numeric_columns = wellness_features.select_dtypes(include=[np.number]).columns
        wellness_features[numeric_columns] = wellness_features[numeric_columns].fillna(0)
        
        # Apply standard scaling to features (excluding customer_id and composite score)
        scaler = StandardScaler()
        scaling_columns = [col for col in numeric_columns 
                          if col not in ['customer_id', 'financial_wellness_score']]
        wellness_features[scaling_columns] = scaler.fit_transform(wellness_features[scaling_columns])
        
        logger.info(f"Financial wellness feature engineering completed. Generated {len(wellness_features.columns)-1} features for {len(wellness_features)} customers")
        
        return wellness_features
        
    except Exception as e:
        logger.error(f"Error in create_financial_wellness_features: {str(e)}")
        raise


def create_fraud_detection_features(transaction_data: pd.DataFrame) -> pd.DataFrame:
    """
    Creates features specifically for fraud detection models.
    
    This function generates features supporting the Fraud Detection System (F-006)
    by identifying unusual patterns in transaction timing, locations, amounts, and velocity.
    Optimized for real-time fraud scoring with <500ms response requirements.
    
    Args:
        transaction_data (pd.DataFrame): Raw transaction data with columns:
            - customer_id: Customer identifier
            - transaction_amount: Transaction amount
            - transaction_date: Transaction timestamp
            - location: Transaction location
            - merchant_category: Merchant category
            - channel: Transaction channel
    
    Returns:
        pd.DataFrame: Fraud detection features including:
            - customer_id: Customer identifier
            - unusual_time_transactions: Transactions outside normal hours
            - unusual_location_transactions: Transactions from new locations
            - unusual_amount_transactions: Transactions with unusual amounts
            - transaction_velocity_anomaly: Abnormal transaction frequency
            - merchant_risk_score: Risk score based on merchant patterns
            - location_risk_score: Risk score based on location patterns
            - amount_deviation_score: Deviation from normal amounts
            - time_pattern_anomaly: Unusual timing patterns
            - channel_switching_frequency: Frequency of channel changes
            - fraud_composite_score: Overall fraud risk score
    
    Raises:
        ValueError: If required columns are missing
        Exception: For processing errors
    """
    try:
        logger.info(f"Starting fraud detection feature engineering for {len(transaction_data)} transactions")
        
        # Validate required columns
        required_columns = ['customer_id', 'transaction_amount', 'transaction_date', 
                          'location', 'merchant_category', 'channel']
        missing_columns = [col for col in required_columns if col not in transaction_data.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")
        
        # Create working copy and prepare data
        df = transaction_data.copy()
        df['transaction_date'] = pd.to_datetime(df['transaction_date'])
        df = df.sort_values(['customer_id', 'transaction_date'])
        
        # Extract time components for analysis
        df['hour'] = df['transaction_date'].dt.hour
        df['day_of_week'] = df['transaction_date'].dt.dayofweek
        df['is_weekend'] = df['day_of_week'] >= 5
        
        logger.info("Identifying unusual time patterns...")
        
        # Identify transactions at unusual times (late night/early morning)
        df['is_unusual_time'] = ((df['hour'] >= 22) | (df['hour'] <= 5)).astype(int)
        
        # Calculate historical time patterns per customer
        customer_time_patterns = df.groupby('customer_id')['hour'].agg(['mean', 'std']).reset_index()
        customer_time_patterns['std'] = customer_time_patterns['std'].fillna(8)  # Default std for single transactions
        
        df = df.merge(customer_time_patterns, on='customer_id', suffixes=('', '_hist'))
        
        # Calculate time pattern anomaly score
        df['time_deviation'] = abs(df['hour'] - df['mean']) / (df['std'] + 1)
        df['time_pattern_anomaly'] = (df['time_deviation'] > 2).astype(int)
        
        logger.info("Analyzing location-based fraud indicators...")
        
        # Track location changes and unusual locations
        df['location_rank'] = df.groupby('customer_id')['location'].transform(
            lambda x: x.map(x.value_counts(normalize=True))
        )
        
        # Identify transactions from unusual locations (bottom 10% of frequency)
        df['is_unusual_location'] = (df['location_rank'] <= 0.1).astype(int)
        
        # Calculate location switching frequency
        df['location_changed'] = (
            df.groupby('customer_id')['location'].shift() != df['location']
        ).astype(int)
        
        location_switch_freq = df.groupby('customer_id')['location_changed'].mean().reset_index()
        location_switch_freq.columns = ['customer_id', 'location_switching_frequency']
        
        logger.info("Computing amount-based anomaly detection...")
        
        # Calculate customer-specific amount statistics
        customer_amount_stats = df.groupby('customer_id')['transaction_amount'].agg([
            'mean', 'std', 'median', 'max', 'min'
        ]).reset_index()
        customer_amount_stats['std'] = customer_amount_stats['std'].fillna(customer_amount_stats['mean'] * 0.5)
        
        df = df.merge(customer_amount_stats, on='customer_id', suffixes=('', '_hist'))
        
        # Calculate z-score for amount anomaly detection
        df['amount_z_score'] = (df['transaction_amount'] - df['mean_hist']) / (df['std_hist'] + 1)
        df['is_unusual_amount'] = (abs(df['amount_z_score']) > 3).astype(int)  # 3 sigma rule
        
        # Identify unusually large transactions (>2x historical max)
        df['is_large_amount'] = (df['transaction_amount'] > 2 * df['max_hist']).astype(int)
        
        logger.info("Computing transaction velocity anomalies...")
        
        # Calculate time between consecutive transactions
        df['time_since_last'] = df.groupby('customer_id')['transaction_date'].diff().dt.total_seconds() / 3600  # Hours
        df['time_since_last'] = df['time_since_last'].fillna(24)  # Default 24 hours for first transaction
        
        # Identify rapid-fire transactions (velocity anomaly)
        df['is_rapid_transaction'] = (df['time_since_last'] < 0.5).astype(int)  # Less than 30 minutes
        
        # Calculate rolling transaction velocity (transactions per hour over last 24 hours)
        df['transaction_velocity'] = df.groupby('customer_id').apply(
            lambda group: group.set_index('transaction_date').resample('1H')['customer_id'].count().rolling('24H').mean()
        ).reset_index(level=0, drop=True).reindex(df.index, fill_value=0)
        
        # Identify velocity anomalies
        velocity_stats = df.groupby('customer_id')['transaction_velocity'].agg(['mean', 'std']).reset_index()
        velocity_stats['std'] = velocity_stats['std'].fillna(velocity_stats['mean'])
        df = df.merge(velocity_stats, on='customer_id', suffixes=('', '_vel'))
        
        df['velocity_z_score'] = (df['transaction_velocity'] - df['mean_vel']) / (df['std_vel'] + 0.1)
        df['transaction_velocity_anomaly'] = (df['velocity_z_score'] > 2).astype(int)
        
        logger.info("Computing merchant and channel risk scores...")
        
        # Calculate merchant risk score based on fraud frequency
        merchant_transaction_counts = df['merchant_category'].value_counts()
        merchant_fraud_indicators = df.groupby('merchant_category').agg({
            'is_unusual_amount': 'mean',
            'is_unusual_time': 'mean',
            'is_unusual_location': 'mean'
        }).reset_index()
        
        merchant_fraud_indicators['merchant_risk_score'] = (
            merchant_fraud_indicators['is_unusual_amount'] * 0.4 +
            merchant_fraud_indicators['is_unusual_time'] * 0.3 +
            merchant_fraud_indicators['is_unusual_location'] * 0.3
        )
        
        df = df.merge(
            merchant_fraud_indicators[['merchant_category', 'merchant_risk_score']], 
            on='merchant_category', how='left'
        )
        df['merchant_risk_score'] = df['merchant_risk_score'].fillna(0.1)  # Default low risk
        
        # Calculate channel switching frequency
        df['channel_changed'] = (
            df.groupby('customer_id')['channel'].shift() != df['channel']
        ).astype(int)
        
        channel_switch_freq = df.groupby('customer_id')['channel_changed'].mean().reset_index()
        channel_switch_freq.columns = ['customer_id', 'channel_switching_frequency']
        
        logger.info("Aggregating fraud features by customer...")
        
        # Aggregate fraud indicators by customer
        fraud_features = df.groupby('customer_id').agg({
            'is_unusual_time': 'mean',
            'is_unusual_location': 'mean', 
            'is_unusual_amount': 'mean',
            'is_large_amount': 'mean',
            'is_rapid_transaction': 'mean',
            'transaction_velocity_anomaly': 'mean',
            'time_pattern_anomaly': 'mean',
            'merchant_risk_score': 'mean',
            'amount_z_score': lambda x: abs(x).mean(),  # Mean absolute z-score
            'velocity_z_score': lambda x: abs(x).mean()
        }).reset_index()
        
        # Rename columns for clarity
        fraud_features.columns = [
            'customer_id', 'unusual_time_transactions', 'unusual_location_transactions',
            'unusual_amount_transactions', 'large_amount_transactions', 'rapid_transactions',
            'transaction_velocity_anomaly', 'time_pattern_anomaly', 'merchant_risk_score',
            'amount_deviation_score', 'velocity_deviation_score'
        ]
        
        # Merge additional features
        fraud_features = fraud_features.merge(location_switch_freq, on='customer_id', how='left')
        fraud_features = fraud_features.merge(channel_switch_freq, on='customer_id', how='left')
        
        # Fill missing values
        fraud_features['location_switching_frequency'] = fraud_features['location_switching_frequency'].fillna(0)
        fraud_features['channel_switching_frequency'] = fraud_features['channel_switching_frequency'].fillna(0)
        
        logger.info("Computing composite fraud score...")
        
        # Create composite fraud score (0-1, higher = more suspicious)
        fraud_features['fraud_composite_score'] = (
            fraud_features['unusual_time_transactions'] * 0.15 +
            fraud_features['unusual_location_transactions'] * 0.20 +
            fraud_features['unusual_amount_transactions'] * 0.20 +
            fraud_features['large_amount_transactions'] * 0.15 +
            fraud_features['rapid_transactions'] * 0.10 +
            fraud_features['transaction_velocity_anomaly'] * 0.10 +
            fraud_features['merchant_risk_score'] * 0.10
        )
        
        # Normalize composite score
        score_min = fraud_features['fraud_composite_score'].min()
        score_max = fraud_features['fraud_composite_score'].max()
        fraud_features['fraud_composite_score'] = (
            (fraud_features['fraud_composite_score'] - score_min) /
            (score_max - score_min + 1e-8)
        )
        
        logger.info("Finalizing fraud detection features...")
        
        # Handle any remaining missing or infinite values
        fraud_features = fraud_features.replace([np.inf, -np.inf], np.nan)
        numeric_columns = fraud_features.select_dtypes(include=[np.number]).columns
        fraud_features[numeric_columns] = fraud_features[numeric_columns].fillna(0)
        
        # Apply robust scaling to features (excluding customer_id and composite score)
        scaler = RobustScaler()
        scaling_columns = [col for col in numeric_columns 
                          if col not in ['customer_id', 'fraud_composite_score']]
        fraud_features[scaling_columns] = scaler.fit_transform(fraud_features[scaling_columns])
        
        logger.info(f"Fraud detection feature engineering completed. Generated {len(fraud_features.columns)-1} features for {len(fraud_features)} customers")
        
        return fraud_features
        
    except Exception as e:
        logger.error(f"Error in create_fraud_detection_features: {str(e)}")
        raise


# Export all feature engineering functions for use by other services
__all__ = [
    'create_transaction_features',
    'create_customer_features', 
    'create_risk_features',
    'create_financial_wellness_features',
    'create_fraud_detection_features'
]