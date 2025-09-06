/**
 * Common TypeScript type definitions for the Unified Financial Services Platform
 * 
 * This file contains standardized type definitions and interfaces used throughout
 * the web application to ensure type safety, consistent API responses, and 
 * improved developer experience across all financial services components.
 * 
 * @version TypeScript 5.3+
 * @author Financial Services Development Team
 * @since 2025
 */

/**
 * Standardized API response wrapper that provides consistent structure
 * for all API responses across the financial services platform.
 * 
 * Supports both successful and error responses with optional metadata
 * for pagination, request tracking, and additional context.
 * 
 * @template T The type of data being returned in the response
 */
export interface ApiResponse<T = unknown> {
  /** Indicates whether the API request was successful */
  success: boolean;
  
  /** The actual data payload returned by the API */
  data: T;
  
  /** Optional human-readable message providing additional context */
  message: string | null;
  
  /** Array of validation or processing errors, if any occurred */
  errors: ApiError[] | null;
  
  /** Additional metadata such as pagination info, request tracking, etc. */
  metadata: object | null;
}

/**
 * Represents a single error in an API response, providing structured
 * error information for client-side error handling and user feedback.
 * 
 * Used within the ApiResponse.errors array to provide detailed
 * field-level validation errors and processing failures.
 */
export interface ApiError {
  /** The specific field or parameter that caused the error */
  field: string;
  
  /** Human-readable error message describing the issue */
  message: string;
}

/**
 * Pagination metadata structure used for paginated API responses
 * throughout the financial services platform.
 * 
 * Provides comprehensive pagination information including current page,
 * page size, total records, and calculated total pages.
 */
export interface Pagination {
  /** Current page number (1-based) */
  page: number;
  
  /** Number of items per page (page size) */
  limit: number;
  
  /** Total number of items available across all pages */
  total: number;
  
  /** Calculated total number of pages based on total items and limit */
  totalPages: number;
}

/**
 * Generic structure for paginated API responses that combines
 * data items with pagination metadata.
 * 
 * Used for lists of financial data such as transactions, customers,
 * compliance reports, and other paginated content.
 * 
 * @template T The type of items in the paginated list
 */
export interface PaginatedResponse<T = unknown> {
  /** Array of items for the current page */
  items: T[];
  
  /** Pagination metadata for the response */
  pagination: Pagination;
}

/**
 * Enumeration of user roles within the financial services platform.
 * 
 * Defines the different types of users and their access levels,
 * supporting role-based access control (RBAC) and feature gating
 * throughout the application.
 */
export enum UserRole {
  /** End customers using financial services */
  Customer = 'CUSTOMER',
  
  /** Financial advisors providing customer guidance */
  Advisor = 'ADVISOR',
  
  /** Compliance officers ensuring regulatory adherence */
  ComplianceOfficer = 'COMPLIANCE_OFFICER',
  
  /** System administrators with full platform access */
  SystemAdmin = 'SYSTEM_ADMIN'
}

/**
 * Enumeration for data sorting directions used throughout
 * the application for consistent sorting behavior.
 * 
 * Used in table components, API queries, and data display
 * components to maintain consistent sorting semantics.
 */
export enum SortDirection {
  /** Ascending sort order (A-Z, 0-9, oldest to newest) */
  ASC = 'ASC',
  
  /** Descending sort order (Z-A, 9-0, newest to oldest) */
  DESC = 'DESC'
}

/**
 * Structure defining a column in reusable data table components.
 * 
 * Used by table components to render headers, handle sorting,
 * and provide consistent table behavior across the platform
 * for financial data display.
 */
export interface TableColumn {
  /** Unique identifier for the column, used for data mapping */
  key: string;
  
  /** Display label shown in the table header */
  label: string;
  
  /** Whether this column supports sorting functionality */
  sortable: boolean;
}

/**
 * Structure representing a single data point for chart components.
 * 
 * Used by various chart and visualization components throughout
 * the financial platform for displaying time-series data,
 * analytics, and financial metrics.
 */
export interface ChartDataPoint {
  /** Human-readable label for the data point */
  label: string;
  
  /** Numeric value for the data point */
  value: number;
  
  /** Unix timestamp (milliseconds) when this data point was recorded */
  timestamp: number;
}

/**
 * Structure for options in select dropdowns and picker components.
 * 
 * Provides a consistent interface for dropdown options across
 * all form components, supporting both string and numeric values
 * for maximum flexibility.
 */
export interface SelectOption {
  /** The actual value to be used when this option is selected */
  value: string | number;
  
  /** Display text shown to the user for this option */
  label: string;
}

/**
 * Generic state structure for managing asynchronous operations
 * in React components and other UI state management.
 * 
 * Provides a consistent pattern for handling loading states,
 * error conditions, and successful data fetching across the
 * entire financial services application.
 * 
 * @template T The type of data being managed in the async state
 */
export interface AsyncState<T = unknown> {
  /** The data payload, null when loading or on error */
  data: T | null;
  
  /** Indicates whether an async operation is currently in progress */
  loading: boolean;
  
  /** Error object if the async operation failed, null otherwise */
  error: Error | null;
}