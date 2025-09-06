/**
 * Financial Wellness Data Models for Unified Financial Services Platform
 * 
 * This module defines comprehensive data structures for the financial wellness feature,
 * supporting the platform's Personalized Financial Wellness capability as outlined in
 * the technical specification (F-007: Personalized Financial Recommendations).
 * 
 * Core Capabilities Supported:
 * - Holistic Financial Profiling: Comprehensive user financial health assessment
 * - Recommendation Engine: AI-powered personalized financial recommendations
 * - Goal Tracking: Financial goal setting, monitoring, and achievement tracking
 * - Financial Health Assessment: Snapshot creation and progress tracking
 * 
 * Primary User Workflows Supported:
 * - Financial Health Assessment: Snapshot Creation → Goal Setting → Recommendation Generation → Action Planning → Progress Tracking
 * - Personalized Financial Wellness: Holistic profiling → Recommendation engine → Goal tracking
 * 
 * Integration Points:
 * - Unified Data Integration Platform (F-001): Leverages consolidated customer data
 * - AI-Powered Risk Assessment Engine (F-002): Uses risk analytics for recommendations
 * - Customer Dashboard (F-013): Provides visualization of wellness data
 * 
 * Technical Foundation:
 * - MongoDB: Customer profiles and wellness data storage
 * - PostgreSQL: Transactional data and goal tracking
 * - AI/ML Engine: Recommendation generation and risk assessment
 * 
 * Compliance and Security:
 * - GDPR compliant data handling with user consent management
 * - PCI-DSS compliant financial data processing
 * - SOC2 compliant audit trails and data protection
 * - Financial data encryption at rest and in transit
 * 
 * Performance Requirements:
 * - Sub-second response times for wellness data retrieval
 * - Real-time recommendation updates based on user behavior
 * - Scalable architecture supporting 10,000+ concurrent users
 * 
 * @version 1.0.0
 * @author Financial Services Platform Team
 * @compliance SOC2, PCI-DSS, GDPR, Basel IV
 * @security All financial wellness data must be encrypted at rest and in transit
 */

// Internal imports for user authentication and customer profile integration
import { User } from './user';

/**
 * Financial Goal Interface
 * 
 * Represents a user's financial goal within the goal tracking system, supporting
 * the comprehensive goal management workflow from creation to completion.
 * 
 * This interface is central to the Financial Health Assessment workflow,
 * enabling users to set specific, measurable financial objectives and track
 * their progress over time. Goals can range from short-term savings targets
 * to long-term investment objectives.
 * 
 * Key Features:
 * - Unique identification for goal tracking across the platform
 * - User association for personalized goal management
 * - Progress tracking with current vs target amounts
 * - Timeline management with target date tracking
 * - Status management throughout the goal lifecycle
 * 
 * Business Value:
 * - Enables personalized financial planning and advisory services
 * - Supports customer engagement through goal achievement gamification
 * - Provides data for AI-powered recommendation generation
 * - Facilitates financial advisor relationship management
 * 
 * Integration Context:
 * - Links to User model for authentication and personalization
 * - Connects with AI engine for recommendation generation
 * - Integrates with transaction data for automatic progress updates
 * - Supports dashboard visualization and reporting
 * 
 * Data Privacy and Security:
 * - Goal data is encrypted at rest and in transit
 * - Access controlled through role-based permissions
 * - Audit trail maintained for all goal modifications
 * - Compliance with financial data protection regulations
 * 
 * @interface FinancialGoal
 * @version 1.0.0
 * @compliance Financial data protection regulations apply
 * @security Goal data must be encrypted and access-controlled
 */
export interface FinancialGoal {
  /**
   * Unique identifier for the financial goal (UUID v4 format).
   * 
   * This identifier serves as the primary key for goal tracking and referencing
   * across the platform. It ensures each goal can be uniquely identified and
   * linked to related financial activities, recommendations, and progress updates.
   * 
   * The UUID format provides:
   * - Guaranteed uniqueness across distributed systems
   * - Security through unpredictable identifier generation
   * - Compatibility with RESTful API design patterns
   * - Support for database indexing and foreign key relationships
   * 
   * Usage Context:
   * - Referenced in recommendation generation algorithms
   * - Used for goal progress tracking and updates
   * - Linked to transaction analysis for automatic progress calculation
   * - Supports audit trail and compliance reporting
   * 
   * @example "f47ac10b-58cc-4372-a567-0e02b2c3d479"
   * @format UUID v4
   * @immutable This value should never be modified after creation
   * @indexed Database index recommended for query performance
   * @required Essential for goal identification and tracking
   */
  id: string;

  /**
   * User identifier linking the goal to its owner.
   * 
   * Establishes the relationship between the financial goal and the user who
   * created it, enabling personalized goal management and ensuring data privacy
   * through proper access control. This foreign key relationship is critical
   * for maintaining data integrity and supporting user-specific financial planning.
   * 
   * Data Relationships:
   * - Foreign key reference to User.id
   * - Enables user-specific goal filtering and management
   * - Supports role-based access control for goal data
   * - Links goals to comprehensive user financial profiles
   * 
   * Security and Privacy:
   * - Ensures users can only access their own goals
   * - Supports GDPR compliance for user data management
   * - Enables proper data deletion for user right-to-be-forgotten requests
   * - Maintains audit trail for compliance and security monitoring
   * 
   * @example "user-123e4567-e89b-12d3-a456-426614174000"
   * @format UUID v4 (matching User.id format)
   * @required Essential for establishing goal ownership
   * @indexed Database index recommended for user-specific queries
   * @relationship Foreign key to User.id
   */
  userId: string;

  /**
   * Human-readable name or title for the financial goal.
   * 
   * Provides a clear, descriptive identifier that users can easily recognize
   * and understand. This name is displayed in user interfaces, reports, and
   * communications, making it essential for user experience and goal management.
   * 
   * Naming Guidelines:
   * - Should be specific and descriptive (e.g., "Emergency Fund - 6 months expenses")
   * - Avoid generic names that could cause confusion
   * - Length should be appropriate for UI display (recommended 5-100 characters)
   * - Should reflect the goal's purpose and timeline
   * 
   * Examples of Good Goal Names:
   * - "Down Payment for First Home"
   * - "Children's College Education Fund"
   * - "Retirement Savings - Early Retirement"
   * - "Emergency Fund - 6 months expenses"
   * - "Vacation to Europe - Summer 2025"
   * 
   * User Experience Considerations:
   * - Displayed prominently in goal tracking interfaces
   * - Used in progress notifications and alerts
   * - Included in financial advisor communications
   * - Referenced in recommendation explanations
   * 
   * @example "Emergency Fund - 6 months expenses"
   * @minLength 5
   * @maxLength 100
   * @required Essential for goal identification and user experience
   * @displayName Primary label for goal display
   */
  name: string;

  /**
   * Target amount the user aims to achieve for this goal.
   * 
   * Represents the monetary value that defines successful completion of the
   * financial goal. This amount is used for progress calculation, recommendation
   * generation, and achievement tracking throughout the goal lifecycle.
   * 
   * Financial Planning Context:
   * - Basis for calculating monthly/weekly contribution requirements
   * - Used by AI engine for personalized saving recommendations
   * - Enables progress percentage calculations for user motivation
   * - Supports goal feasibility analysis and timeline adjustments
   * 
   * Calculation Support:
   * - Progress percentage: (currentAmount / targetAmount) * 100
   * - Remaining amount: targetAmount - currentAmount
   * - Required monthly savings: remaining / months_to_target
   * - Goal achievement projections based on current savings rate
   * 
   * Validation Rules:
   * - Must be a positive number greater than 0
   * - Should be realistic and achievable given user's financial profile
   * - Can be adjusted during goal lifecycle if circumstances change
   * - Precision should match currency requirements (typically 2 decimal places)
   * 
   * @example 25000.00
   * @minimum 0.01
   * @maximum 999999999.99
   * @precision 2 decimal places
   * @currency Platform base currency (USD by default)
   * @required Essential for goal tracking and progress calculation
   */
  targetAmount: number;

  /**
   * Current amount saved or accumulated toward the goal.
   * 
   * Tracks the user's progress toward achieving their financial goal, updated
   * automatically through transaction analysis or manually by the user. This
   * value is central to progress tracking, motivation, and recommendation generation.
   * 
   * Progress Tracking Features:
   * - Real-time updates from linked savings accounts
   * - Manual adjustment capability for offline contributions
   * - Historical progress tracking for trend analysis
   * - Integration with transaction categorization for automatic updates
   * 
   * Update Mechanisms:
   * - Automatic: Linked account balance monitoring
   * - Manual: User-initiated progress updates
   * - Transaction-based: Automatic updates from categorized transactions
   * - Bulk import: Integration with external financial data sources
   * 
   * Validation and Business Rules:
   * - Cannot be negative (minimum value: 0)
   * - Can exceed target amount (goal overachievement)
   * - Updates must be audited for compliance and security
   * - Changes should trigger progress notifications
   * 
   * Performance Considerations:
   * - Frequently accessed for dashboard displays
   * - Cached for quick progress calculation
   * - Indexed for efficient query performance
   * - Optimized for real-time update scenarios
   * 
   * @example 12500.00
   * @minimum 0.00
   * @maximum 999999999.99
   * @precision 2 decimal places
   * @currency Platform base currency (USD by default)
   * @required Essential for progress tracking
   * @updatable Frequently updated through various mechanisms
   */
  currentAmount: number;

  /**
   * Target date for achieving the financial goal.
   * 
   * Defines the timeline for goal completion, enabling time-based progress
   * tracking, urgency assessment, and recommendation generation. The target
   * date is crucial for calculating required savings rates and generating
   * realistic action plans.
   * 
   * Timeline Management:
   * - Enables calculation of required monthly/weekly savings
   * - Supports goal prioritization based on urgency
   * - Used for progress trajectory analysis and projections
   * - Triggers time-based notifications and reminders
   * 
   * Date Format and Validation:
   * - ISO 8601 format for consistent date handling
   * - Should be in the future (later than current date)
   * - Can be adjusted if goal circumstances change
   * - Supports timezone-aware date calculations
   * 
   * Business Logic Applications:
   * - Savings rate calculation: (targetAmount - currentAmount) / months_remaining
   * - Goal urgency scoring for recommendation prioritization
   * - Achievement probability assessment based on current progress
   * - Deadline reminder and notification scheduling
   * 
   * User Experience Integration:
   * - Countdown displays in user interfaces
   * - Progress bar calculations based on time elapsed
   * - Milestone notifications as deadlines approach
   * - Goal reassessment triggers for unrealistic timelines
   * 
   * @example "2025-12-31T23:59:59Z"
   * @format ISO 8601 date string
   * @timezone UTC recommended for consistency
   * @validation Must be a future date
   * @required Essential for timeline-based goal management
   * @updatable Can be modified if goal circumstances change
   */
  targetDate: string;

  /**
   * Current status of the financial goal throughout its lifecycle.
   * 
   * Tracks the goal's progress through various states, enabling proper workflow
   * management, status-based filtering, and appropriate user experience handling.
   * Status transitions are logged for audit purposes and compliance tracking.
   * 
   * Status Definitions:
   * - IN_PROGRESS: Goal is active and user is working toward achievement
   * - COMPLETED: Target amount has been reached or exceeded
   * - CANCELLED: Goal has been abandoned or is no longer relevant
   * 
   * State Transition Rules:
   * - New goals start in IN_PROGRESS status
   * - Automatic transition to COMPLETED when currentAmount >= targetAmount
   * - Manual transition to CANCELLED by user action
   * - Completed goals cannot be reverted to IN_PROGRESS
   * - Cancelled goals can be reactivated if business rules allow
   * 
   * Business Impact:
   * - IN_PROGRESS goals receive active recommendations and tracking
   * - COMPLETED goals trigger achievement notifications and celebrations
   * - CANCELLED goals are excluded from active recommendations
   * - Status changes affect dashboard displays and user metrics
   * 
   * Audit and Compliance:
   * - All status changes are logged with timestamps
   * - User actions triggering status changes are recorded
   * - Status history maintained for compliance and analytics
   * - Automated status changes include system reasoning
   * 
   * @example "IN_PROGRESS"
   * @enum 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
   * @required Essential for goal lifecycle management
   * @auditable Status changes must be logged
   * @workflow Supports goal management workflows
   */
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

  /**
   * Optional goal category for enhanced organization and reporting.
   * 
   * Enables categorization of goals for better organization, targeted
   * recommendations, and comprehensive financial planning. Categories
   * help users organize their goals and enable category-specific analytics.
   * 
   * Supported Categories:
   * - SAVINGS: Emergency funds, general savings, short-term goals
   * - INVESTMENT: Long-term wealth building, retirement planning
   * - DEBT_PAYOFF: Credit card payoff, loan repayment goals
   * - MAJOR_PURCHASE: Home, car, large appliances
   * - EDUCATION: College funds, professional development
   * - TRAVEL: Vacation funds, travel experiences
   * - OTHER: Miscellaneous or custom goals
   * 
   * @example "SAVINGS"
   * @enum 'SAVINGS' | 'INVESTMENT' | 'DEBT_PAYOFF' | 'MAJOR_PURCHASE' | 'EDUCATION' | 'TRAVEL' | 'OTHER'
   * @optional Defaults to 'OTHER' if not specified
   * @analytics Used for goal categorization and reporting
   */
  category?: 'SAVINGS' | 'INVESTMENT' | 'DEBT_PAYOFF' | 'MAJOR_PURCHASE' | 'EDUCATION' | 'TRAVEL' | 'OTHER';

  /**
   * Optional detailed description of the goal's purpose and context.
   * 
   * Provides additional context and motivation for the financial goal,
   * helping users maintain focus and enabling more personalized recommendations.
   * 
   * @example "Building an emergency fund to cover 6 months of living expenses for financial security"
   * @maxLength 500
   * @optional Additional context for the goal
   */
  description?: string;

  /**
   * Optional priority level for goal ranking and recommendation focus.
   * 
   * Enables users to prioritize their goals and helps the recommendation
   * engine focus on the most important objectives first.
   * 
   * @example "HIGH"
   * @enum 'LOW' | 'MEDIUM' | 'HIGH'
   * @optional Defaults to 'MEDIUM' if not specified
   * @recommendations Influences recommendation prioritization
   */
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';

  /**
   * Goal creation timestamp for audit trails and analytics.
   * 
   * Records when the goal was initially created, supporting audit requirements
   * and enabling time-based analytics on goal creation patterns.
   * 
   * @example new Date("2024-01-15T10:00:00Z")
   * @format Date object
   * @immutable Set once during goal creation
   * @audit Required for compliance audit trails
   */
  createdAt: Date;

  /**
   * Last modification timestamp for change tracking.
   * 
   * Tracks when any aspect of the goal was last modified, supporting
   * audit requirements and enabling synchronization across devices.
   * 
   * @example new Date("2024-01-20T14:30:00Z")
   * @format Date object
   * @automatic Updated automatically on any goal modification
   * @audit Required for compliance audit trails
   */
  updatedAt: Date;
}

/**
 * Financial Recommendation Interface
 * 
 * Represents AI-powered financial recommendations generated by the platform's
 * recommendation engine to help users improve their financial wellness and
 * achieve their goals more effectively.
 * 
 * This interface is central to the Personalized Financial Wellness capability,
 * providing users with actionable insights and recommendations based on their
 * financial profile, goals, and behavioral patterns.
 * 
 * AI-Powered Features:
 * - Machine learning-based recommendation generation
 * - Personalization based on user financial profile and behavior
 * - Real-time updates based on changing financial circumstances
 * - Category-specific recommendations for targeted financial improvement
 * 
 * Business Value:
 * - Increases user engagement through personalized financial guidance
 * - Drives financial product adoption through targeted recommendations
 * - Improves customer financial outcomes and satisfaction
 * - Enables financial advisors to provide more effective guidance
 * 
 * Integration Context:
 * - Generated by AI-Powered Risk Assessment Engine (F-002)
 * - Displayed in Customer Dashboard (F-013) and Advisor Workbench (F-014)
 * - Links to financial goals for goal-specific recommendations
 * - Integrates with user transaction data for contextual recommendations
 * 
 * Privacy and Security:
 * - Recommendation data is encrypted and access-controlled
 * - User consent required for AI-powered recommendation generation
 * - Audit trail maintained for all recommendation interactions
 * - Compliance with AI ethics and transparency requirements
 * 
 * @interface Recommendation
 * @version 1.0.0
 * @ai Generated by AI/ML recommendation engine
 * @personalization Tailored to individual user profiles
 * @compliance AI ethics and transparency requirements apply
 */
export interface Recommendation {
  /**
   * Unique identifier for the recommendation (UUID v4 format).
   * 
   * Enables tracking of recommendation effectiveness, user interactions,
   * and recommendation lifecycle management. Essential for analytics and
   * continuous improvement of the recommendation engine.
   * 
   * Analytics Applications:
   * - Tracks recommendation click-through rates
   * - Measures recommendation effectiveness and user adoption
   * - Enables A/B testing of recommendation strategies
   * - Supports recommendation attribution for business impact analysis
   * 
   * @example "rec-f47ac10b-58cc-4372-a567-0e02b2c3d479"
   * @format UUID v4 with 'rec-' prefix for identification
   * @immutable This value should never be modified after creation
   * @indexed Database index recommended for analytics queries
   * @required Essential for recommendation tracking and analytics
   */
  id: string;

  /**
   * User identifier for whom the recommendation is generated.
   * 
   * Links the recommendation to the specific user, enabling personalized
   * recommendation delivery and ensuring proper access control. This
   * relationship is crucial for maintaining user privacy and enabling
   * user-specific recommendation management.
   * 
   * Personalization Context:
   * - Ensures recommendations are relevant to user's financial situation
   * - Enables user-specific recommendation history tracking
   * - Supports recommendation delivery through multiple channels
   * - Links to user preferences for recommendation frequency and types
   * 
   * @example "user-123e4567-e89b-12d3-a456-426614174000"
   * @format UUID v4 (matching User.id format)
   * @required Essential for personalized recommendation delivery
   * @indexed Database index recommended for user-specific queries
   * @relationship Foreign key to User.id
   */
  userId: string;

  /**
   * Concise title summarizing the recommendation.
   * 
   * Provides a clear, action-oriented headline that immediately communicates
   * the recommendation's value proposition to the user. This title is
   * prominently displayed in user interfaces and notifications.
   * 
   * Title Guidelines:
   * - Should be action-oriented and specific
   * - Clear value proposition within 50-100 characters
   * - Avoid jargon and use plain language
   * - Include specific benefits or outcomes when possible
   * 
   * Examples of Effective Titles:
   * - "Increase Your Emergency Fund by $200/month"
   * - "Reduce Credit Card Interest with Balance Transfer"
   * - "Invest in Low-Cost Index Funds for Long-term Growth"
   * - "Automate Your Savings to Reach Goals Faster"
   * - "Refinance Your Mortgage to Save $300/month"
   * 
   * @example "Increase Your Emergency Fund by $200/month"
   * @minLength 10
   * @maxLength 100
   * @required Essential for recommendation communication
   * @actionOriented Should suggest specific actions
   */
  title: string;

  /**
   * Detailed explanation of the recommendation and its benefits.
   * 
   * Provides comprehensive information about the recommendation, including
   * why it's relevant, how to implement it, and what benefits the user
   * can expect. This description builds trust and encourages action.
   * 
   * Content Structure:
   * - Problem identification: Why this recommendation matters
   * - Solution explanation: What action to take
   * - Benefit quantification: Expected outcomes and value
   * - Implementation guidance: How to get started
   * 
   * Writing Guidelines:
   * - Use clear, jargon-free language
   * - Include specific numbers and timeframes
   * - Address potential user concerns or objections
   * - Provide actionable next steps
   * 
   * Example Description:
   * "Based on your current spending patterns, increasing your emergency fund
   * contribution by $200 per month would help you reach your 6-month expense
   * goal 8 months faster. This would provide better financial security and
   * reduce stress during unexpected situations. Consider setting up an
   * automatic transfer to your high-yield savings account."
   * 
   * @example "Based on your current spending patterns, increasing your emergency fund contribution by $200 per month would help you reach your 6-month expense goal 8 months faster."
   * @minLength 50
   * @maxLength 1000
   * @required Essential for recommendation explanation and user education
   * @educational Should educate users about financial benefits
   */
  description: string;

  /**
   * Category classification for recommendation organization and filtering.
   * 
   * Enables users to filter recommendations by type and helps the system
   * organize recommendations for better user experience. Categories align
   * with major financial wellness areas.
   * 
   * Category Definitions:
   * - SAVINGS: Emergency funds, savings account optimization, automated savings
   * - INVESTMENT: Portfolio diversification, retirement planning, asset allocation
   * - DEBT_MANAGEMENT: Debt consolidation, payment strategies, interest reduction
   * - INSURANCE: Coverage gaps, policy optimization, risk protection
   * 
   * Category-Specific Features:
   * - Specialized recommendation algorithms per category
   * - Category-specific success metrics and tracking
   * - Targeted educational content and resources
   * - Category-based notification preferences
   * 
   * Analytics and Reporting:
   * - Category-specific adoption rates and effectiveness
   * - User preference analysis by recommendation category
   * - Cross-category recommendation impact assessment
   * - Financial advisor insights by category performance
   * 
   * @example "SAVINGS"
   * @enum 'SAVINGS' | 'INVESTMENT' | 'DEBT_MANAGEMENT' | 'INSURANCE'
   * @required Essential for recommendation organization
   * @analytics Used for category-specific performance analysis
   * @filtering Enables user filtering and preference management
   */
  category: 'SAVINGS' | 'INVESTMENT' | 'DEBT_MANAGEMENT' | 'INSURANCE';

  /**
   * Specific action or next step the user should take.
   * 
   * Provides clear, actionable guidance that transforms the recommendation
   * from information into implementable action. This field bridges the
   * gap between recommendation and execution.
   * 
   * Action Characteristics:
   * - Specific: Clearly defined steps
   * - Measurable: Quantifiable outcomes
   * - Achievable: Realistic for the user's situation
   * - Relevant: Aligned with user's goals and capabilities
   * - Time-bound: Include timeframes when appropriate
   * 
   * Examples of Effective Actions:
   * - "Set up automatic transfer of $200 to savings account on the 1st of each month"
   * - "Research and apply for balance transfer credit card with 0% intro APR"
   * - "Increase 401(k) contribution by 2% starting next pay period"
   * - "Contact insurance agent to review homeowner's policy coverage"
   * - "Open high-yield savings account with 4.5% APY"
   * 
   * Implementation Support:
   * - Links to relevant tools and resources
   * - Integration with platform functionality when available
   * - Progress tracking for recommended actions
   * - Follow-up recommendations based on action completion
   * 
   * @example "Set up automatic transfer of $200 to your high-yield savings account on the 1st of each month"
   * @minLength 20
   * @maxLength 500
   * @required Essential for actionable recommendations
   * @actionable Should provide specific, implementable steps
   * @measurable Should include quantifiable elements when possible
   */
  action: string;

  /**
   * Optional priority level indicating recommendation importance.
   * 
   * Helps users prioritize multiple recommendations and guides the order
   * of presentation in user interfaces. Priority is determined by the
   * AI engine based on user profile and potential impact.
   * 
   * Priority Determination Factors:
   * - Financial impact potential
   * - User goal alignment
   * - Urgency of financial situation
   * - Implementation difficulty
   * - User's historical preferences
   * 
   * @example "HIGH"
   * @enum 'LOW' | 'MEDIUM' | 'HIGH'
   * @optional Defaults to 'MEDIUM' if not specified
   * @ai Determined by AI recommendation engine
   */
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';

  /**
   * Optional estimated financial impact of implementing the recommendation.
   * 
   * Quantifies the potential benefit to help users understand the value
   * of taking action. Expressed as monthly or annual dollar amounts.
   * 
   * @example 2400.00
   * @currency Platform base currency (USD by default)
   * @optional Provided when impact can be quantified
   * @precision 2 decimal places
   */
  estimatedImpact?: number;

  /**
   * Optional difficulty level for implementing the recommendation.
   * 
   * Helps users understand the effort required and choose recommendations
   * that match their comfort level and available time.
   * 
   * @example "MEDIUM"
   * @enum 'EASY' | 'MEDIUM' | 'HARD'
   * @optional Defaults to 'MEDIUM' if not specified
   * @user Helps users select appropriate recommendations
   */
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';

  /**
   * Optional expiration date for time-sensitive recommendations.
   * 
   * Indicates when the recommendation is no longer valid or relevant,
   * such as limited-time offers or time-sensitive financial opportunities.
   * 
   * @example "2024-12-31T23:59:59Z"
   * @format ISO 8601 date string
   * @optional Only set for time-sensitive recommendations
   * @automation Expired recommendations are automatically archived
   */
  expiresAt?: string;

  /**
   * Recommendation generation timestamp for audit and analytics.
   * 
   * Records when the recommendation was generated by the AI engine,
   * supporting audit requirements and enabling recommendation freshness tracking.
   * 
   * @example new Date("2024-01-15T10:00:00Z")
   * @format Date object
   * @immutable Set once during recommendation generation
   * @audit Required for compliance audit trails
   */
  createdAt: Date;

  /**
   * Last update timestamp for recommendation modification tracking.
   * 
   * Tracks when any aspect of the recommendation was last modified,
   * supporting change management and synchronization requirements.
   * 
   * @example new Date("2024-01-20T14:30:00Z")
   * @format Date object
   * @automatic Updated automatically on any recommendation modification
   * @audit Required for compliance audit trails
   */
  updatedAt: Date;
}

/**
 * Financial Wellness Profile Interface
 * 
 * Represents a comprehensive financial wellness profile that provides a holistic
 * view of a user's financial health, supporting the platform's personalized
 * financial wellness and recommendation capabilities.
 * 
 * This interface serves as the foundation for holistic financial profiling,
 * combining quantitative financial metrics with qualitative assessments to
 * create a complete picture of the user's financial wellness.
 * 
 * Holistic Profiling Features:
 * - Comprehensive financial health scoring
 * - Risk tolerance assessment for investment recommendations
 * - Income and expense analysis for cash flow optimization
 * - Savings rate calculation for goal achievement projections
 * - Multi-dimensional wellness assessment
 * 
 * Business Value:
 * - Enables personalized financial product recommendations
 * - Supports risk-appropriate investment advisory services
 * - Provides baseline for measuring financial improvement
 * - Facilitates advisor-client relationship management
 * 
 * Integration Context:
 * - Links to User model for comprehensive customer profile
 * - Feeds AI-Powered Risk Assessment Engine for recommendation generation
 * - Integrates with transaction data for automatic profile updates
 * - Supports Financial Health Assessment workflow
 * 
 * Privacy and Compliance:
 * - Sensitive financial data requiring highest security standards
 * - User consent required for profile creation and updates
 * - Audit trail maintained for all profile modifications
 * - Compliance with financial privacy regulations
 * 
 * @interface WellnessProfile
 * @version 1.0.0
 * @holistic Comprehensive financial health assessment
 * @personalization Foundation for personalized financial services
 * @compliance Financial privacy regulations apply
 */
export interface WellnessProfile {
  /**
   * User identifier linking the wellness profile to its owner.
   * 
   * Establishes the one-to-one relationship between a user and their
   * financial wellness profile, ensuring data privacy and enabling
   * personalized financial services delivery.
   * 
   * Profile Relationship:
   * - Each user has exactly one wellness profile
   * - Profile data is user-specific and access-controlled
   * - Enables comprehensive customer view across all touchpoints
   * - Supports advisor-client relationship management
   * 
   * Data Integration:
   * - Links to user's transaction history for automatic updates
   * - Connects to user's financial goals for goal-aligned recommendations
   * - Integrates with user's risk assessment data
   * - Supports cross-platform data synchronization
   * 
   * Security and Privacy:
   * - Ensures profile data can only be accessed by authorized users
   * - Supports GDPR compliance for financial data management
   * - Enables proper data deletion for user privacy requests
   * - Maintains audit trail for regulatory compliance
   * 
   * @example "user-123e4567-e89b-12d3-a456-426614174000"
   * @format UUID v4 (matching User.id format)
   * @required Essential for establishing profile ownership
   * @unique One wellness profile per user
   * @relationship Foreign key to User.id
   */
  userId: string;

  /**
   * Comprehensive financial wellness score (0-100 scale).
   * 
   * Provides a single, easy-to-understand metric that summarizes the user's
   * overall financial health. This score is calculated using multiple financial
   * indicators and serves as a benchmark for improvement over time.
   * 
   * Score Calculation Factors:
   * - Debt-to-income ratio (25% weight)
   * - Emergency fund adequacy (20% weight)
   * - Savings rate (20% weight)
   * - Credit utilization (15% weight)
   * - Investment diversification (10% weight)
   * - Insurance coverage adequacy (10% weight)
   * 
   * Score Ranges and Classifications:
   * - 0-30: Poor financial health, requires immediate attention
   * - 31-50: Below average, significant improvement needed
   * - 51-70: Average financial health, some areas for improvement
   * - 71-85: Good financial health, minor optimizations recommended
   * - 86-100: Excellent financial health, maintain current practices
   * 
   * Business Applications:
   * - Baseline for measuring financial improvement over time
   * - Trigger for personalized recommendations and interventions
   * - Segmentation for targeted financial product marketing
   * - Advisor conversation starter and progress tracking
   * 
   * User Experience:
   * - Prominently displayed in dashboard with progress tracking
   * - Historical trending to show improvement over time
   * - Benchmarking against peer groups and industry standards
   * - Achievement recognition for score improvements
   * 
   * @example 72.5
   * @range 0-100
   * @precision 1 decimal place
   * @required Essential for financial wellness assessment
   * @calculated Computed based on multiple financial indicators
   * @trending Tracked over time for progress measurement
   */
  wellnessScore: number;

  /**
   * User's risk tolerance level for investment and financial planning.
   * 
   * Determines the user's comfort level with financial risk, influencing
   * investment recommendations, portfolio allocation, and financial planning
   * strategies. This assessment is crucial for providing appropriate
   * risk-adjusted financial advice.
   * 
   * Risk Tolerance Definitions:
   * - LOW: Conservative approach, prioritizes capital preservation
   *   - Prefers guaranteed returns even if lower
   *   - Uncomfortable with market volatility
   *   - Suitable for high-yield savings, CDs, government bonds
   * 
   * - MEDIUM: Balanced approach, accepts moderate risk for higher returns
   *   - Comfortable with some market fluctuations
   *   - Willing to accept short-term losses for long-term gains
   *   - Suitable for balanced portfolios, target-date funds
   * 
   * - HIGH: Aggressive approach, comfortable with significant risk
   *   - Comfortable with high market volatility
   *   - Seeks maximum long-term growth potential
   *   - Suitable for growth stocks, emerging markets, alternatives
   * 
   * Assessment Methodology:
   * - Questionnaire-based assessment with scenario analysis
   * - Behavioral analysis based on past financial decisions
   * - Periodic reassessment to account for changing circumstances
   * - Professional advisor validation when available
   * 
   * Application in Recommendations:
   * - Investment product recommendations aligned with risk tolerance
   * - Portfolio allocation suggestions
   * - Risk-appropriate goal setting and timeline recommendations
   * - Insurance coverage recommendations based on risk comfort
   * 
   * @example "MEDIUM"
   * @enum 'LOW' | 'MEDIUM' | 'HIGH'
   * @required Essential for risk-appropriate financial planning
   * @assessment Based on user questionnaire and behavioral analysis
   * @advisory Influences all investment and financial planning recommendations
   */
  riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';

  /**
   * User's monthly gross income in platform base currency.
   * 
   * Represents the user's total monthly income before taxes and deductions,
   * serving as a fundamental metric for financial planning, budgeting
   * recommendations, and goal feasibility analysis.
   * 
   * Income Considerations:
   * - Includes all sources: salary, bonuses, investment income, side income
   * - Gross amount before taxes and deductions
   * - Monthly normalization for consistent comparison
   * - Regular updates recommended for accuracy
   * 
   * Financial Planning Applications:
   * - Debt-to-income ratio calculations for lending recommendations
   * - Savings rate analysis and optimization
   * - Goal feasibility assessment and timeline projections
   * - Budget allocation recommendations
   * 
   * Privacy and Security:
   * - Highly sensitive financial information
   * - Encrypted storage and transmission required
   * - Access logged for audit purposes
   * - User consent required for sharing with advisors
   * 
   * Validation Rules:
   * - Must be positive number
   * - Reasonable range validation to prevent data entry errors
   * - Regular updates encouraged for accuracy
   * - Historical tracking for trend analysis
   * 
   * @example 8500.00
   * @minimum 0.01
   * @maximum 999999.99
   * @precision 2 decimal places
   * @currency Platform base currency (USD by default)
   * @required Essential for financial planning and recommendations
   * @sensitive Highly sensitive financial data requiring encryption
   */
  income: number;

  /**
   * User's monthly total expenses in platform base currency.
   * 
   * Represents the user's total monthly spending across all categories,
   * providing insights into spending patterns and cash flow management.
   * Used for budgeting recommendations and financial health assessment.
   * 
   * Expense Categories Included:
   * - Fixed expenses: Rent/mortgage, insurance, loan payments
   * - Variable expenses: Food, utilities, transportation
   * - Discretionary expenses: Entertainment, dining out, hobbies
   * - Debt payments: Credit cards, loans, other debts
   * 
   * Data Sources:
   * - Automated categorization from linked accounts
   * - Manual expense tracking and entry
   * - Receipt scanning and processing
   * - Budget planning and forecasting
   * 
   * Financial Analysis Applications:
   * - Cash flow analysis and optimization
   * - Spending pattern identification
   * - Budget variance analysis
   * - Expense reduction recommendations
   * 
   * Accuracy Considerations:
   * - Regular reconciliation with actual spending
   * - Seasonal adjustment for variable expenses
   * - Inclusion of irregular expenses (annual, quarterly)
   * - Updating for lifestyle changes
   * 
   * @example 6200.00
   * @minimum 0.00
   * @maximum 999999.99
   * @precision 2 decimal places
   * @currency Platform base currency (USD by default)
   * @required Essential for cash flow analysis and budgeting
   * @automated Can be calculated from transaction data
   */
  expenses: number;

  /**
   * User's savings rate as a percentage of income.
   * 
   * Calculated as (income - expenses) / income * 100, representing the
   * percentage of income that the user saves each month. This metric is
   * crucial for financial health assessment and goal achievement projections.
   * 
   * Savings Rate Calculation:
   * - Formula: ((income - expenses) / income) * 100
   * - Represents percentage of income saved monthly
   * - Positive values indicate surplus, negative values indicate deficit
   * - Benchmarked against recommended savings rates
   * 
   * Savings Rate Benchmarks:
   * - Emergency fund building: 10-15% minimum recommended
   * - Retirement planning: 15-20% including employer contributions
   * - Aggressive wealth building: 20%+ for early retirement goals
   * - Financial stress indicator: <5% may indicate financial stress
   * 
   * Business Applications:
   * - Goal achievement timeline calculations
   * - Financial stress identification and intervention
   * - Personalized savings recommendations
   * - Retirement planning projections
   * 
   * Improvement Strategies:
   * - Income optimization recommendations
   * - Expense reduction suggestions
   * - Automated savings programs
   * - Debt management for improved cash flow
   * 
   * Validation and Calculation:
   * - Automatically calculated from income and expenses
   * - Validation against reasonable ranges (-50% to 90%)
   * - Historical tracking for trend analysis
   * - Peer benchmarking for context
   * 
   * @example 27.06
   * @range -100 to 100 (percentage)
   * @precision 2 decimal places
   * @unit Percentage
   * @calculated Automatically computed as ((income - expenses) / income) * 100
   * @benchmark Compared against recommended savings rates
   */
  savingsRate: number;

  /**
   * Optional credit score for comprehensive financial assessment.
   * 
   * Provides additional context for creditworthiness and financial health,
   * enabling more accurate risk assessment and lending recommendations.
   * 
   * @example 750
   * @range 300-850 (FICO score range)
   * @optional Not all users may provide credit score information
   * @source User-provided or third-party credit monitoring integration
   */
  creditScore?: number;

  /**
   * Optional total debt amount for debt-to-income analysis.
   * 
   * Includes all outstanding debts for comprehensive financial health
   * assessment and debt management recommendations.
   * 
   * @example 45000.00
   * @minimum 0.00
   * @currency Platform base currency (USD by default)
   * @optional Helpful for comprehensive financial analysis
   * @includes Credit cards, loans, mortgages, other debts
   */
  totalDebt?: number;

  /**
   * Optional emergency fund amount for financial security assessment.
   * 
   * Tracks the user's emergency fund balance for financial security
   * evaluation and emergency fund building recommendations.
   * 
   * @example 25000.00
   * @minimum 0.00
   * @currency Platform base currency (USD by default)
   * @optional Important for financial security assessment
   * @benchmark Compared against 3-6 months of expenses
   */
  emergencyFund?: number;

  /**
   * Optional investment portfolio value for wealth assessment.
   * 
   * Tracks the user's total investment portfolio value for comprehensive
   * wealth assessment and investment recommendations.
   * 
   * @example 125000.00
   * @minimum 0.00
   * @currency Platform base currency (USD by default)
   * @optional Helpful for wealth management and retirement planning
   * @includes All investment accounts and portfolios
   */
  investmentPortfolio?: number;

  /**
   * Profile creation timestamp for audit trails and analytics.
   * 
   * Records when the wellness profile was initially created, supporting
   * audit requirements and enabling profile lifecycle analysis.
   * 
   * @example new Date("2024-01-15T10:00:00Z")
   * @format Date object
   * @immutable Set once during profile creation
   * @audit Required for compliance audit trails
   */
  createdAt: Date;

  /**
   * Last modification timestamp for change tracking.
   * 
   * Tracks when any aspect of the wellness profile was last modified,
   * supporting audit requirements and enabling data freshness tracking.
   * 
   * @example new Date("2024-01-20T14:30:00Z")
   * @format Date object
   * @automatic Updated automatically on any profile modification
   * @audit Required for compliance audit trails
   */
  updatedAt: Date;

  /**
   * Optional last assessment date for profile freshness tracking.
   * 
   * Tracks when the wellness profile was last comprehensively assessed
   * or updated, helping determine when reassessment is needed.
   * 
   * @example new Date("2024-01-15T10:00:00Z")
   * @format Date object
   * @optional Tracks assessment freshness
   * @reminder Triggers reassessment reminders
   */
  lastAssessmentDate?: Date;
}

/**
 * Financial Wellness Snapshot Interface
 * 
 * Represents a point-in-time snapshot of a user's financial wellness profile,
 * enabling historical tracking and progress measurement over time.
 * 
 * @interface WellnessSnapshot
 * @version 1.0.0
 * @historical Enables historical tracking and progress measurement
 * @analytics Supports trend analysis and progress reporting
 */
export interface WellnessSnapshot {
  /**
   * Unique identifier for the wellness snapshot.
   * 
   * @example "snap-f47ac10b-58cc-4372-a567-0e02b2c3d479"
   * @format UUID v4 with 'snap-' prefix
   * @required Essential for snapshot identification
   */
  id: string;

  /**
   * User identifier for the snapshot owner.
   * 
   * @example "user-123e4567-e89b-12d3-a456-426614174000"
   * @format UUID v4 (matching User.id format)
   * @required Essential for establishing snapshot ownership
   */
  userId: string;

  /**
   * Wellness score at the time of snapshot.
   * 
   * @example 72.5
   * @range 0-100
   * @required Essential for progress tracking
   */
  wellnessScore: number;

  /**
   * Risk tolerance at the time of snapshot.
   * 
   * @example "MEDIUM"
   * @enum 'LOW' | 'MEDIUM' | 'HIGH'
   * @required Essential for risk assessment tracking
   */
  riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';

  /**
   * Income at the time of snapshot.
   * 
   * @example 8500.00
   * @currency Platform base currency
   * @required Essential for financial tracking
   */
  income: number;

  /**
   * Expenses at the time of snapshot.
   * 
   * @example 6200.00
   * @currency Platform base currency
   * @required Essential for financial tracking
   */
  expenses: number;

  /**
   * Savings rate at the time of snapshot.
   * 
   * @example 27.06
   * @range -100 to 100
   * @required Essential for savings tracking
   */
  savingsRate: number;

  /**
   * Snapshot creation timestamp.
   * 
   * @example new Date("2024-01-15T10:00:00Z")
   * @format Date object
   * @required Essential for chronological ordering
   */
  createdAt: Date;

  /**
   * Optional reason for snapshot creation.
   * 
   * @example "Monthly assessment"
   * @enum 'MONTHLY_ASSESSMENT' | 'GOAL_ACHIEVEMENT' | 'MAJOR_LIFE_EVENT' | 'ADVISOR_REVIEW' | 'USER_REQUEST'
   * @optional Provides context for snapshot creation
   */
  reason?: 'MONTHLY_ASSESSMENT' | 'GOAL_ACHIEVEMENT' | 'MAJOR_LIFE_EVENT' | 'ADVISOR_REVIEW' | 'USER_REQUEST';
}

/**
 * Goal Progress Tracking Interface
 * 
 * Represents detailed progress tracking for financial goals, including
 * milestone achievements and historical progress data.
 * 
 * @interface GoalProgress
 * @version 1.0.0
 * @tracking Detailed progress monitoring for financial goals
 * @milestones Tracks achievement milestones and celebrations
 */
export interface GoalProgress {
  /**
   * Unique identifier for the progress record.
   * 
   * @example "prog-f47ac10b-58cc-4372-a567-0e02b2c3d479"
   * @format UUID v4 with 'prog-' prefix
   * @required Essential for progress tracking
   */
  id: string;

  /**
   * Financial goal identifier being tracked.
   * 
   * @example "f47ac10b-58cc-4372-a567-0e02b2c3d479"
   * @format UUID v4 (matching FinancialGoal.id format)
   * @required Essential for linking progress to goals
   */
  goalId: string;

  /**
   * Progress percentage (0-100+).
   * 
   * @example 62.5
   * @range 0-100+ (can exceed 100% for overachievement)
   * @required Essential for progress visualization
   */
  progressPercentage: number;

  /**
   * Amount contributed in this progress update.
   * 
   * @example 500.00
   * @currency Platform base currency
   * @required Essential for contribution tracking
   */
  contributionAmount: number;

  /**
   * Source of the contribution.
   * 
   * @example "AUTOMATIC_TRANSFER"
   * @enum 'AUTOMATIC_TRANSFER' | 'MANUAL_DEPOSIT' | 'INVESTMENT_RETURN' | 'BONUS' | 'OTHER'
   * @required Essential for understanding contribution sources
   */
  contributionSource: 'AUTOMATIC_TRANSFER' | 'MANUAL_DEPOSIT' | 'INVESTMENT_RETURN' | 'BONUS' | 'OTHER';

  /**
   * Progress update timestamp.
   * 
   * @example new Date("2024-01-15T10:00:00Z")
   * @format Date object
   * @required Essential for chronological tracking
   */
  createdAt: Date;

  /**
   * Optional milestone achieved with this progress update.
   * 
   * @example "25_PERCENT_COMPLETE"
   * @enum '10_PERCENT_COMPLETE' | '25_PERCENT_COMPLETE' | '50_PERCENT_COMPLETE' | '75_PERCENT_COMPLETE' | '100_PERCENT_COMPLETE'
   * @optional Tracks significant progress milestones
   */
  milestoneAchieved?: '10_PERCENT_COMPLETE' | '25_PERCENT_COMPLETE' | '50_PERCENT_COMPLETE' | '75_PERCENT_COMPLETE' | '100_PERCENT_COMPLETE';

  /**
   * Optional notes about the progress update.
   * 
   * @example "Extra contribution from tax refund"
   * @maxLength 500
   * @optional Additional context for progress updates
   */
  notes?: string;
}

/**
 * Recommendation Interaction Interface
 * 
 * Tracks user interactions with financial recommendations to measure
 * effectiveness and improve the recommendation engine.
 * 
 * @interface RecommendationInteraction
 * @version 1.0.0
 * @analytics Tracks recommendation effectiveness and user engagement
 * @ml Provides feedback for machine learning improvement
 */
export interface RecommendationInteraction {
  /**
   * Unique identifier for the interaction record.
   * 
   * @example "int-f47ac10b-58cc-4372-a567-0e02b2c3d479"
   * @format UUID v4 with 'int-' prefix
   * @required Essential for interaction tracking
   */
  id: string;

  /**
   * Recommendation identifier being tracked.
   * 
   * @example "rec-f47ac10b-58cc-4372-a567-0e02b2c3d479"
   * @format UUID v4 (matching Recommendation.id format)
   * @required Essential for linking interactions to recommendations
   */
  recommendationId: string;

  /**
   * User identifier who interacted with the recommendation.
   * 
   * @example "user-123e4567-e89b-12d3-a456-426614174000"
   * @format UUID v4 (matching User.id format)
   * @required Essential for user-specific analytics
   */
  userId: string;

  /**
   * Type of interaction performed.
   * 
   * @example "CLICKED"
   * @enum 'VIEWED' | 'CLICKED' | 'DISMISSED' | 'IMPLEMENTED' | 'SAVED' | 'SHARED'
   * @required Essential for understanding user engagement
   */
  interactionType: 'VIEWED' | 'CLICKED' | 'DISMISSED' | 'IMPLEMENTED' | 'SAVED' | 'SHARED';

  /**
   * Interaction timestamp.
   * 
   * @example new Date("2024-01-15T10:00:00Z")
   * @format Date object
   * @required Essential for temporal analysis
   */
  createdAt: Date;

  /**
   * Optional user feedback rating (1-5 stars).
   * 
   * @example 4
   * @range 1-5
   * @optional User satisfaction rating
   */
  rating?: number;

  /**
   * Optional user feedback comments.
   * 
   * @example "Very helpful recommendation, implemented immediately"
   * @maxLength 1000
   * @optional Qualitative feedback for improvement
   */
  feedback?: string;

  /**
   * Optional device/platform where interaction occurred.
   * 
   * @example "mobile_app"
   * @enum 'web_app' | 'mobile_app' | 'advisor_portal' | 'email' | 'sms'
   * @optional Helps understand channel effectiveness
   */
  platform?: 'web_app' | 'mobile_app' | 'advisor_portal' | 'email' | 'sms';
}

// Type definitions for financial wellness metrics and calculations

/**
 * Financial wellness metrics calculation utilities.
 * 
 * @namespace WellnessMetrics
 * @version 1.0.0
 * @utilities Helper functions for wellness calculations
 */
export namespace WellnessMetrics {
  /**
   * Calculate wellness score based on financial indicators.
   * 
   * @param profile WellnessProfile to calculate score for
   * @returns Calculated wellness score (0-100)
   */
  export function calculateWellnessScore(profile: WellnessProfile): number {
    // Implementation would include sophisticated scoring algorithm
    // This is a placeholder for the actual calculation logic
    return profile.wellnessScore;
  }

  /**
   * Calculate savings rate from income and expenses.
   * 
   * @param income Monthly gross income
   * @param expenses Monthly total expenses
   * @returns Savings rate as percentage
   */
  export function calculateSavingsRate(income: number, expenses: number): number {
    if (income <= 0) return 0;
    return ((income - expenses) / income) * 100;
  }

  /**
   * Calculate goal progress percentage.
   * 
   * @param currentAmount Current amount saved
   * @param targetAmount Target amount for goal
   * @returns Progress percentage (0-100+)
   */
  export function calculateGoalProgress(currentAmount: number, targetAmount: number): number {
    if (targetAmount <= 0) return 0;
    return (currentAmount / targetAmount) * 100;
  }

  /**
   * Calculate required monthly savings for goal achievement.
   * 
   * @param remainingAmount Amount still needed
   * @param monthsRemaining Months until target date
   * @returns Required monthly savings amount
   */
  export function calculateRequiredMonthlySavings(remainingAmount: number, monthsRemaining: number): number {
    if (monthsRemaining <= 0) return remainingAmount;
    return remainingAmount / monthsRemaining;
  }
}

// Export all interfaces and types for external use
export type {
  WellnessSnapshot,
  GoalProgress,
  RecommendationInteraction
};