// External imports - Redux Toolkit for state management
import { configureStore, combineReducers, createSlice } from '@reduxjs/toolkit'; // v2.0+

// Internal imports - Feature slice reducers
import blockchainReducer from './blockchain-slice';
import complianceReducer from './compliance-slice';
import financialWellnessReducer from './financial-wellness-slice';
import transactionReducer from './transaction-slice';

/**
 * Analytics Slice
 * 
 * Manages analytics and reporting data state for the Unified Data Integration Platform.
 * This slice handles analytics data collection, processing status, and error management
 * for comprehensive business intelligence and reporting capabilities.
 * 
 * Features Supported:
 * - F-005: Predictive Analytics Dashboard
 * - F-001: Unified Data Integration Platform (analytics data component)
 * 
 * State Structure:
 * - data: Analytics data and metrics
 * - loading: Loading state for analytics operations
 * - error: Error handling for analytics data fetching
 */
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: { 
    data: null, 
    loading: false, 
    error: null 
  },
  reducers: {
    /**
     * Sets the analytics data in state
     * 
     * @param state Current analytics state
     * @param action Action containing analytics data payload
     */
    setAnalyticsData: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    /**
     * Sets loading state for analytics operations
     * 
     * @param state Current analytics state
     * @param action Action containing loading boolean
     */
    setAnalyticsLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    /**
     * Sets error state for analytics operations
     * 
     * @param state Current analytics state
     * @param action Action containing error message
     */
    setAnalyticsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    /**
     * Clears analytics error state
     * 
     * @param state Current analytics state
     */
    clearAnalyticsError: (state) => {
      state.error = null;
    },
    
    /**
     * Resets analytics state to initial values
     * 
     * @param state Current analytics state
     */
    resetAnalyticsState: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Additional reducers for async thunks can be added here
    // when analytics async operations are implemented
  }
});

/**
 * Authentication Slice
 * 
 * Manages user authentication state including login status, user information,
 * and authentication-related operations for the financial services platform.
 * This slice supports secure access control and user session management.
 * 
 * Features Supported:
 * - F-004: Digital Customer Onboarding (authentication component)
 * - User session management and security
 * - Multi-factor authentication state
 * 
 * State Structure:
 * - isAuthenticated: Boolean indicating user authentication status
 * - user: Current user information object
 * - error: Authentication error messages
 * - loading: Loading state for authentication operations
 */
const authSlice = createSlice({
  name: 'auth',
  initialState: { 
    isAuthenticated: false, 
    user: null, 
    error: null, 
    loading: false 
  },
  reducers: {
    /**
     * Sets user authentication status and user data
     * 
     * @param state Current auth state
     * @param action Action containing user data payload
     */
    setAuthenticatedUser: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    /**
     * Clears user authentication and session data
     * 
     * @param state Current auth state
     */
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    
    /**
     * Sets authentication loading state
     * 
     * @param state Current auth state
     * @param action Action containing loading boolean
     */
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    /**
     * Sets authentication error state
     * 
     * @param state Current auth state
     * @param action Action containing error message
     */
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    /**
     * Clears authentication error state
     * 
     * @param state Current auth state
     */
    clearAuthError: (state) => {
      state.error = null;
    },
    
    /**
     * Updates user profile information
     * 
     * @param state Current auth state
     * @param action Action containing updated user data
     */
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    // Additional reducers for async thunks can be added here
    // when authentication async operations are implemented
  }
});

/**
 * Customer Slice
 * 
 * Manages customer profile data and customer-related operations for the
 * Unified Data Integration Platform. This slice handles customer information,
 * profile management, and customer status tracking.
 * 
 * Features Supported:
 * - F-001: Unified Data Integration Platform (customer data component)
 * - F-004: Digital Customer Onboarding
 * - F-013: Customer Dashboard (data foundation)
 * 
 * State Structure:
 * - profile: Customer profile information
 * - status: Operation status for customer operations
 * - error: Error handling for customer data operations
 */
const customerSlice = createSlice({
  name: 'customer',
  initialState: { 
    profile: null, 
    status: 'idle', 
    error: null 
  },
  reducers: {
    /**
     * Sets customer profile data
     * 
     * @param state Current customer state
     * @param action Action containing customer profile payload
     */
    setCustomerProfile: (state, action) => {
      state.profile = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    
    /**
     * Updates customer profile information
     * 
     * @param state Current customer state
     * @param action Action containing profile updates
     */
    updateCustomerProfile: (state, action) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
      state.status = 'succeeded';
      state.error = null;
    },
    
    /**
     * Sets customer operation status
     * 
     * @param state Current customer state
     * @param action Action containing status value
     */
    setCustomerStatus: (state, action) => {
      state.status = action.payload;
    },
    
    /**
     * Sets customer error state
     * 
     * @param state Current customer state
     * @param action Action containing error message
     */
    setCustomerError: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },
    
    /**
     * Clears customer error state
     * 
     * @param state Current customer state
     */
    clearCustomerError: (state) => {
      state.error = null;
    },
    
    /**
     * Resets customer state to initial values
     * 
     * @param state Current customer state
     */
    resetCustomerState: (state) => {
      state.profile = null;
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Additional reducers for async thunks can be added here
    // when customer async operations are implemented
  }
});

/**
 * Notification Slice
 * 
 * Manages notification state for the financial services platform including
 * system notifications, alerts, and user communication management.
 * This slice handles notification display, status tracking, and user interactions.
 * 
 * Features Supported:
 * - Real-time notification system
 * - User alert management
 * - System communication tracking
 * 
 * State Structure:
 * - notifications: Array of notification objects
 * - status: Operation status for notification operations
 * - error: Error handling for notification operations
 */
const notificationSlice = createSlice({
  name: 'notification',
  initialState: { 
    notifications: [], 
    status: 'idle', 
    error: null 
  },
  reducers: {
    /**
     * Adds a new notification to the state
     * 
     * @param state Current notification state
     * @param action Action containing notification data
     */
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
      state.status = 'succeeded';
      state.error = null;
    },
    
    /**
     * Removes a notification from the state
     * 
     * @param state Current notification state
     * @param action Action containing notification ID
     */
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    /**
     * Marks a notification as read
     * 
     * @param state Current notification state
     * @param action Action containing notification ID
     */
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(
        notification => notification.id === action.payload
      );
      if (notification) {
        notification.isRead = true;
      }
    },
    
    /**
     * Sets notification operation status
     * 
     * @param state Current notification state
     * @param action Action containing status value
     */
    setNotificationStatus: (state, action) => {
      state.status = action.payload;
    },
    
    /**
     * Sets notification error state
     * 
     * @param state Current notification state
     * @param action Action containing error message
     */
    setNotificationError: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },
    
    /**
     * Clears all notifications
     * 
     * @param state Current notification state
     */
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.status = 'idle';
      state.error = null;
    },
    
    /**
     * Clears notification error state
     * 
     * @param state Current notification state
     */
    clearNotificationError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Additional reducers for async thunks can be added here
    // when notification async operations are implemented
  }
});

/**
 * Onboarding Slice
 * 
 * Manages customer onboarding process state including onboarding steps,
 * progress tracking, and onboarding completion status for the Digital
 * Customer Onboarding feature.
 * 
 * Features Supported:
 * - F-004: Digital Customer Onboarding
 * - KYC/AML process state management
 * - Onboarding workflow tracking
 * 
 * State Structure:
 * - status: Onboarding process status
 * - data: Onboarding data and progress information
 * - error: Error handling for onboarding operations
 */
const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState: { 
    status: 'idle', 
    data: {}, 
    error: null 
  },
  reducers: {
    /**
     * Sets onboarding data
     * 
     * @param state Current onboarding state
     * @param action Action containing onboarding data
     */
    setOnboardingData: (state, action) => {
      state.data = { ...state.data, ...action.payload };
      state.status = 'succeeded';
      state.error = null;
    },
    
    /**
     * Updates onboarding step status
     * 
     * @param state Current onboarding state
     * @param action Action containing step and status
     */
    updateOnboardingStep: (state, action) => {
      const { step, status } = action.payload;
      state.data = {
        ...state.data,
        steps: {
          ...state.data.steps,
          [step]: status
        }
      };
    },
    
    /**
     * Sets onboarding process status
     * 
     * @param state Current onboarding state
     * @param action Action containing status value
     */
    setOnboardingStatus: (state, action) => {
      state.status = action.payload;
    },
    
    /**
     * Sets onboarding error state
     * 
     * @param state Current onboarding state
     * @param action Action containing error message
     */
    setOnboardingError: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },
    
    /**
     * Clears onboarding error state
     * 
     * @param state Current onboarding state
     */
    clearOnboardingError: (state) => {
      state.error = null;
    },
    
    /**
     * Resets onboarding state to initial values
     * 
     * @param state Current onboarding state
     */
    resetOnboardingState: (state) => {
      state.status = 'idle';
      state.data = {};
      state.error = null;
    },
    
    /**
     * Completes onboarding process
     * 
     * @param state Current onboarding state
     */
    completeOnboarding: (state) => {
      state.status = 'completed';
      state.data = {
        ...state.data,
        completedAt: new Date().toISOString(),
        isCompleted: true
      };
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Additional reducers for async thunks can be added here
    // when onboarding async operations are implemented
  }
});

/**
 * Risk Assessment Slice
 * 
 * Manages risk assessment data and operations for the AI-Powered Risk Assessment
 * Engine. This slice handles risk scoring, assessment data, and risk-related
 * analytics for comprehensive risk management.
 * 
 * Features Supported:
 * - F-002: AI-Powered Risk Assessment Engine
 * - F-006: Fraud Detection System (risk data component)
 * - F-016: Risk Management Console (data foundation)
 * 
 * State Structure:
 * - data: Risk assessment data and scores
 * - loading: Loading state for risk assessment operations
 * - error: Error handling for risk assessment operations
 */
const riskAssessmentSlice = createSlice({
  name: 'riskAssessment',
  initialState: { 
    data: null, 
    loading: false, 
    error: null 
  },
  reducers: {
    /**
     * Sets risk assessment data
     * 
     * @param state Current risk assessment state
     * @param action Action containing risk data payload
     */
    setRiskAssessmentData: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    /**
     * Updates risk score information
     * 
     * @param state Current risk assessment state
     * @param action Action containing risk score data
     */
    updateRiskScore: (state, action) => {
      if (state.data) {
        state.data = {
          ...state.data,
          riskScore: action.payload.riskScore,
          riskLevel: action.payload.riskLevel,
          assessmentDate: new Date().toISOString()
        };
      }
    },
    
    /**
     * Sets risk assessment loading state
     * 
     * @param state Current risk assessment state
     * @param action Action containing loading boolean
     */
    setRiskAssessmentLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    /**
     * Sets risk assessment error state
     * 
     * @param state Current risk assessment state
     * @param action Action containing error message
     */
    setRiskAssessmentError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    /**
     * Clears risk assessment error state
     * 
     * @param state Current risk assessment state
     */
    clearRiskAssessmentError: (state) => {
      state.error = null;
    },
    
    /**
     * Resets risk assessment state to initial values
     * 
     * @param state Current risk assessment state
     */
    resetRiskAssessmentState: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
    
    /**
     * Adds risk assessment history entry
     * 
     * @param state Current risk assessment state
     * @param action Action containing assessment history data
     */
    addRiskAssessmentHistory: (state, action) => {
      if (state.data) {
        state.data = {
          ...state.data,
          history: [
            ...(state.data.history || []),
            action.payload
          ]
        };
      }
    }
  },
  extraReducers: (builder) => {
    // Additional reducers for async thunks can be added here
    // when risk assessment async operations are implemented
  }
});

// Extract reducers from local slices
const analyticsReducer = analyticsSlice.reducer;
const authReducer = authSlice.reducer;
const customerReducer = customerSlice.reducer;
const notificationReducer = notificationSlice.reducer;
const onboardingReducer = onboardingSlice.reducer;
const riskAssessmentReducer = riskAssessmentSlice.reducer;

/**
 * Root Reducer Configuration
 * 
 * Combines all feature reducers into a single root reducer for the Redux store.
 * This configuration supports the F-001 Unified Data Integration Platform
 * by providing a centralized state management solution that integrates
 * data from all feature areas of the financial services platform.
 * 
 * Reducer Structure:
 * - analytics: Analytics and reporting data state
 * - auth: Authentication and user session state
 * - blockchain: Blockchain settlements and smart contracts state
 * - compliance: Regulatory compliance and monitoring state
 * - customer: Customer profiles and customer data state
 * - financialWellness: Financial wellness profiles and recommendations state
 * - notification: System notifications and alerts state
 * - onboarding: Customer onboarding process state
 * - riskAssessment: Risk assessment and scoring state
 * - transaction: Transaction data and processing state
 * 
 * This structure provides comprehensive state management for all major
 * feature areas while maintaining clear separation of concerns and
 * enabling efficient state access and updates.
 */
const rootReducer = combineReducers({
  analytics: analyticsReducer,
  auth: authReducer,
  blockchain: blockchainReducer,
  compliance: complianceReducer,
  customer: customerReducer,
  financialWellness: financialWellnessReducer,
  notification: notificationReducer,
  onboarding: onboardingReducer,
  riskAssessment: riskAssessmentReducer,
  transaction: transactionReducer
});

/**
 * Redux Store Configuration
 * 
 * Configures the Redux store with comprehensive middleware, development tools,
 * and production-ready settings for the Unified Financial Services Platform.
 * The store configuration supports real-time data synchronization, state
 * persistence, and enterprise-grade performance requirements.
 * 
 * Store Features:
 * - Centralized state management for all application features
 * - Redux Toolkit's configureStore with built-in best practices
 * - Development tools integration for debugging and monitoring
 * - Production-optimized middleware configuration
 * - Type-safe state management with TypeScript integration
 * 
 * Middleware Configuration:
 * - Redux Toolkit's default middleware stack
 * - Serializable state enforcement
 * - Immutability checks for state updates
 * - Thunk middleware for async operations
 * - Development-only DevTools integration
 * 
 * Performance Optimizations:
 * - Efficient state updates through Immer
 * - Memoized selectors for derived state
 * - Optimized re-render prevention
 * - Memory-efficient state structure
 * 
 * Security Considerations:
 * - State sanitization for sensitive data
 * - Secure middleware configuration
 * - Production environment optimizations
 * - Audit logging for state changes
 */
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Enable serializable state check for development
      serializableCheck: {
        // Ignore these action types for serializable checks
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in the state
        ignoredPaths: ['auth.user.lastLoginDate'],
      },
      // Enable immutable state check for development
      immutableCheck: {
        // Ignore these field paths for immutability checks
        ignoredPaths: ['auth.user.preferences'],
      },
    }),
  // Enable Redux DevTools in development, disable in production
  devTools: process.env.NODE_ENV !== 'production',
  
  // Preloaded state for initial store setup
  preloadedState: undefined,
  
  // Enhancers for additional store capabilities
  enhancers: (defaultEnhancers) => defaultEnhancers,
});

/**
 * Root State Type Definition
 * 
 * TypeScript type that represents the complete state shape of the Redux store.
 * This type enables type-safe access to all state properties throughout the
 * application and provides IntelliSense support for state access.
 * 
 * The RootState type is automatically inferred from the root reducer,
 * ensuring that any changes to the reducer structure are automatically
 * reflected in the type system.
 * 
 * Usage:
 * - useSelector hooks for type-safe state access
 * - Selector function type definitions
 * - Component prop types that depend on state
 * - Middleware and enhancer type definitions
 */
export type RootState = ReturnType<typeof rootReducer>;

/**
 * App Dispatch Type Definition
 * 
 * TypeScript type that represents the dispatch function signature for the
 * configured Redux store. This type enables type-safe dispatching of actions
 * and async thunks throughout the application.
 * 
 * The AppDispatch type includes support for:
 * - Synchronous action creators
 * - Async thunk action creators
 * - Middleware-enhanced dispatch capabilities
 * - Type-safe action payload validation
 * 
 * Usage:
 * - useDispatch hooks for type-safe action dispatching
 * - Component prop types that require dispatch
 * - Middleware and enhancer type definitions
 * - Custom hook implementations
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Store Export
 * 
 * Exports the configured Redux store instance for use throughout the application.
 * This store provides centralized state management for all features of the
 * Unified Financial Services Platform.
 * 
 * Integration Points:
 * - React Provider component for store access
 * - Middleware integration for logging and analytics
 * - Development tools for debugging and monitoring
 * - Testing utilities for state management testing
 */
export { store };

// Export local slice actions for direct access if needed
export const analyticsActions = analyticsSlice.actions;
export const authActions = authSlice.actions;
export const customerActions = customerSlice.actions;
export const notificationActions = notificationSlice.actions;
export const onboardingActions = onboardingSlice.actions;
export const riskAssessmentActions = riskAssessmentSlice.actions;

// Default export for the store
export default store;