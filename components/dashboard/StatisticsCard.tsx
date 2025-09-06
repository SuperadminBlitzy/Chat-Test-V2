import React from 'react'; // react@18.2.0
import { Loading } from '../common/Loading';
import { formatCurrency } from '../../utils/format-currency';

/**
 * Props interface for the StatisticsCard component
 * Defines the structure for displaying statistical data with trend indicators
 */
interface StatisticsCardProps {
  /** The title of the statistic to be displayed at the top of the card */
  title: string;
  
  /** The main numerical value of the statistic */
  value: number;
  
  /** The previous value of the statistic, used to calculate the trend */
  previousValue: number;
  
  /** Specifies how the main value should be formatted */
  formatAs: 'currency' | 'number' | 'percentage';
  
  /** The currency code to use when formatAs is 'currency'. Defaults to 'USD' */
  currencyCode?: string;
  
  /** A boolean to indicate if the data for the card is currently loading */
  isLoading: boolean;
}

/**
 * Trend type for determining the visual representation of the trend
 */
type TrendType = 'positive' | 'negative' | 'neutral';

/**
 * Arrow Up Icon Component
 * SVG icon indicating a positive trend in statistics
 */
const ArrowUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Positive trend"
      {...props}
    >
      <path d="M7 14l5-5 5 5z" />
    </svg>
  );
};

/**
 * Arrow Down Icon Component
 * SVG icon indicating a negative trend in statistics
 */
const ArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Negative trend"
      {...props}
    >
      <path d="M7 10l5 5 5-5z" />
    </svg>
  );
};

/**
 * StatisticsCard Component
 * 
 * A reusable card component to display a single statistic, including a title, value, 
 * and trend indicator. It is used across various dashboards to provide at-a-glance 
 * insights into key metrics.
 * 
 * This component supports the following features from the technical specification:
 * - F-013: Customer Dashboard - Displays summary statistics like total balance, 
 *   recent spending, or progress towards financial goals
 * - F-014: Advisor Workbench - Shows client portfolio performance, risk levels, 
 *   and other key indicators for advisors
 * - F-015: Compliance Control Center - Displays metrics like number of open cases, 
 *   compliance status percentages, and pending alerts
 * - F-016: Risk Management Console - Shows critical risk metrics such as overall 
 *   portfolio risk, fraud detection rates, and credit risk exposure
 * 
 * Features:
 * - Responsive design with enterprise-grade styling
 * - Loading state management with skeleton UI
 * - Multiple value formatting options (currency, number, percentage) 
 * - Automatic trend calculation and visual indicators
 * - Accessibility compliant with proper ARIA attributes
 * - TypeScript support for type safety
 * - Tailwind CSS integration for consistent design system
 * 
 * @param props - The component props conforming to StatisticsCardProps interface
 * @returns JSX.Element representing the statistics card, or a loading skeleton if isLoading is true
 */
const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  previousValue,
  formatAs,
  currencyCode = 'USD',
  isLoading
}) => {
  // If data is loading, return the Loading component with appropriate styling
  if (isLoading) {
    return (
      <div 
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
        role="status"
        aria-label={`Loading ${title} statistic`}
      >
        <div className="animate-pulse">
          {/* Loading skeleton for title */}
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          
          {/* Loading skeleton for main value */}
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-3"></div>
          
          {/* Loading skeleton for trend indicator */}
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        
        {/* Centered loading spinner */}
        <div className="flex justify-center mt-4">
          <Loading size="sm" />
        </div>
      </div>
    );
  }

  /**
   * Calculate the percentage change between current and previous values
   * Handles edge cases like division by zero and invalid inputs
   */
  const calculatePercentageChange = (): number => {
    // Handle edge case where previous value is zero
    if (previousValue === 0) {
      return value === 0 ? 0 : 100;
    }
    
    // Calculate percentage change: ((new - old) / old) * 100
    const change = ((value - previousValue) / Math.abs(previousValue)) * 100;
    
    // Round to 1 decimal place for display purposes
    return Math.round(change * 10) / 10;
  };

  /**
   * Determine the trend type based on percentage change
   * Used for styling and icon selection
   */
  const determineTrend = (percentageChange: number): TrendType => {
    if (percentageChange > 0.1) return 'positive';
    if (percentageChange < -0.1) return 'negative';
    return 'neutral';
  };

  /**
   * Format the main value based on the formatAs prop
   * Supports currency, number, and percentage formatting
   */
  const formatValue = (): string => {
    try {
      switch (formatAs) {
        case 'currency':
          return formatCurrency(value, currencyCode);
        case 'percentage':
          return `${value.toFixed(1)}%`;
        case 'number':
        default:
          // Format number with commas for thousands separator
          return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          }).format(value);
      }
    } catch (error) {
      // Fallback formatting in case of errors
      console.error('Error formatting value:', error);
      return value.toString();
    }
  };

  // Calculate percentage change and determine trend
  const percentageChange = calculatePercentageChange();
  const trend = determineTrend(percentageChange);

  /**
   * Get trend-specific styling classes
   * Returns appropriate colors and styles based on trend direction
   */
  const getTrendClasses = (): {
    textColor: string;
    bgColor: string;
    iconColor: string;
  } => {
    switch (trend) {
      case 'positive':
        return {
          textColor: 'text-green-600',
          bgColor: 'bg-green-50',
          iconColor: 'text-green-500'
        };
      case 'negative':
        return {
          textColor: 'text-red-600',
          bgColor: 'bg-red-50',
          iconColor: 'text-red-500'
        };
      case 'neutral':
      default:
        return {
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-500'
        };
    }
  };

  /**
   * Render the appropriate trend icon based on the trend direction
   */
  const renderTrendIcon = () => {
    const { iconColor } = getTrendClasses();
    
    if (trend === 'positive') {
      return <ArrowUpIcon className={`w-4 h-4 ${iconColor}`} />;
    } else if (trend === 'negative') {
      return <ArrowDownIcon className={`w-4 h-4 ${iconColor}`} />;
    }
    
    // For neutral trend, show a dash/neutral indicator
    return (
      <div className={`w-4 h-1 ${iconColor.replace('text-', 'bg-')} rounded`} />
    );
  };

  const { textColor, bgColor } = getTrendClasses();
  const formattedValue = formatValue();
  const absolutePercentageChange = Math.abs(percentageChange);

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      role="region"
      aria-labelledby={`${title.replace(/\s+/g, '-').toLowerCase()}-title`}
      tabIndex={0}
    >
      {/* Card Title */}
      <h3 
        id={`${title.replace(/\s+/g, '-').toLowerCase()}-title`}
        className="text-sm font-medium text-gray-600 mb-2 truncate"
        title={title}
      >
        {title}
      </h3>
      
      {/* Main Value Display */}
      <div className="mb-3">
        <p 
          className="text-2xl font-bold text-gray-900 leading-tight"
          aria-label={`Current value: ${formattedValue}`}
        >
          {formattedValue}
        </p>
      </div>
      
      {/* Trend Indicator Section */}
      <div 
        className={`inline-flex items-center space-x-2 px-2 py-1 rounded-md ${bgColor}`}
        aria-label={`Trend: ${trend} change of ${absolutePercentageChange}% from previous period`}
      >
        {/* Trend Icon */}
        <div className="flex-shrink-0">
          {renderTrendIcon()}
        </div>
        
        {/* Percentage Change Text */}
        <span className={`text-sm font-medium ${textColor}`}>
          {absolutePercentageChange.toFixed(1)}%
        </span>
        
        {/* Trend Description */}
        <span className="text-xs text-gray-500">
          {trend === 'positive' ? 'increase' : trend === 'negative' ? 'decrease' : 'no change'}
        </span>
      </div>

      {/* Screen Reader Only Context */}
      <div className="sr-only">
        <p>
          {title}: {formattedValue}. 
          {trend === 'positive' ? 'Increased' : trend === 'negative' ? 'Decreased' : 'No change'} 
          by {absolutePercentageChange.toFixed(1)} percent from previous period.
        </p>
      </div>
    </div>
  );
};

export { StatisticsCard };