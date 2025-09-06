import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios'; // axios@1.6+
import { tokenStorage } from './storage';

/**
 * Axios HTTP Client Configuration
 * 
 * This module configures and exports a singleton Axios instance for making HTTP requests 
 * to the backend API. It provides enterprise-grade features including:
 * - Automatic authentication token injection
 * - Token refresh logic on 401 errors
 * - Request/response interceptors for centralized error handling
 * - Production-ready configuration with environment-based settings
 * 
 * The instance is configured to communicate with the unified financial services platform's
 * backend API, supporting features like AI-powered risk assessment, regulatory compliance
 * automation, digital onboarding, and real-time data synchronization.
 */

/**
 * Create and configure the main Axios instance for API communication
 * Base URL is configured from environment variables with localhost fallback for development
 * Content-Type is set to application/json for consistent API communication
 */
export const api: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000, // 30 second timeout for financial services operations
    withCredentials: false // Set to true if using cookies for authentication
});

/**
 * Flag to prevent infinite retry loops during token refresh
 * This is used to track whether a request is already a retry attempt
 */
let isRefreshing = false;

/**
 * Queue to hold requests that are waiting for token refresh to complete
 * This ensures that multiple concurrent requests don't trigger multiple refresh operations
 */
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

/**
 * Process the queue of requests waiting for token refresh
 * @param error - Error object if token refresh failed, null if successful
 * @param token - New token if refresh was successful
 */
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    
    failedQueue = [];
};

/**
 * Request Interceptor
 * 
 * Automatically adds the JWT authentication token to the Authorization header
 * of every outgoing request if a token exists in storage. This ensures that
 * all API requests are properly authenticated without manual token management
 * in individual components.
 * 
 * @param config - The request configuration object
 * @returns Modified request configuration with Authorization header
 */
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        try {
            // Retrieve the authentication token from storage
            const token = tokenStorage.getToken();
            
            // If token exists, add it to the Authorization header as Bearer token
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            
            // Add request timestamp for debugging and monitoring
            config.metadata = {
                ...config.metadata,
                startTime: Date.now()
            };
            
            return config;
        } catch (error) {
            // Log error but don't fail the request if token retrieval fails
            console.error('Error retrieving authentication token:', error);
            return config;
        }
    },
    (error) => {
        // Handle request setup errors
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

/**
 * Response Error Interceptor
 * 
 * Handles API errors with specific focus on token refresh logic for 401 Unauthorized errors.
 * This interceptor implements the following flow:
 * 1. Check if the error is a 401 Unauthorized error
 * 2. Prevent infinite loops by checking if this is already a retry attempt
 * 3. Attempt to refresh the token using the refresh endpoint
 * 4. If refresh succeeds, retry the original request with the new token
 * 5. If refresh fails, redirect to login/logout
 * 
 * @param error - The Axios error object
 * @returns Promise that resolves with the response or rejects with the error
 */
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Add response timing information for performance monitoring
        if (response.config.metadata?.startTime) {
            const duration = Date.now() - response.config.metadata.startTime;
            console.debug(`API Request completed in ${duration}ms:`, {
                method: response.config.method?.toUpperCase(),
                url: response.config.url,
                status: response.status,
                duration
            });
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        // Check if this is a 401 Unauthorized error and not already a retry attempt
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // Prevent infinite retry loops
            if (isRefreshing) {
                // If token refresh is already in progress, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    if (token && originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }
            
            // Mark this request as a retry attempt
            originalRequest._retry = true;
            isRefreshing = true;
            
            try {
                // Attempt to refresh the token
                // Note: This assumes a refresh endpoint exists at /auth/refresh
                const refreshResponse = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/auth/refresh`,
                    {},
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        withCredentials: true // Assumes refresh token is in HTTP-only cookie
                    }
                );
                
                // Extract the new access token from the response
                const newToken = refreshResponse.data.accessToken || refreshResponse.data.token;
                
                if (newToken) {
                    // Store the new token
                    tokenStorage.setToken(newToken);
                    
                    // Update the original request with the new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }
                    
                    // Process the queue of waiting requests
                    processQueue(null, newToken);
                    
                    // Reset the refreshing flag
                    isRefreshing = false;
                    
                    // Retry the original request with the new token
                    return api(originalRequest);
                } else {
                    throw new Error('No token received from refresh endpoint');
                }
                
            } catch (refreshError) {
                // Token refresh failed - user needs to log in again
                console.error('Token refresh failed:', refreshError);
                
                // Process the queue with the error
                processQueue(refreshError, null);
                
                // Reset the refreshing flag
                isRefreshing = false;
                
                // Clear the stored token
                try {
                    tokenStorage.setToken('');
                } catch (clearError) {
                    console.error('Error clearing token:', clearError);
                }
                
                // Redirect to login page or dispatch logout action
                // This could be customized based on your application's routing strategy
                if (typeof window !== 'undefined') {
                    // Client-side redirect
                    window.location.href = '/login';
                } else {
                    // Server-side handling - could dispatch a logout event
                    console.warn('Server-side token refresh failed - user needs to be logged out');
                }
                
                return Promise.reject(refreshError);
            }
        }
        
        // For non-401 errors or already retried requests, log and reject
        console.error('API Request failed:', {
            method: error.config?.method?.toUpperCase(),
            url: error.config?.url,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
        
        // If it's a network error, provide a more user-friendly message
        if (!error.response) {
            const networkError = new Error('Network error - please check your connection');
            networkError.name = 'NetworkError';
            return Promise.reject(networkError);
        }
        
        // For 5xx server errors, provide appropriate error handling
        if (error.response.status >= 500) {
            const serverError = new Error('Server error - please try again later');
            serverError.name = 'ServerError';
            return Promise.reject(serverError);
        }
        
        // For 4xx client errors (except 401 which is handled above), pass through
        return Promise.reject(error);
    }
);

/**
 * Additional utility functions for common API operations
 */

/**
 * Set a default timeout for all requests
 * Can be overridden on a per-request basis
 */
api.defaults.timeout = 30000; // 30 seconds

/**
 * Add common headers that should be included in all requests
 */
api.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
api.defaults.headers.common['Accept'] = 'application/json';

/**
 * Configure request timeout specifically for financial operations
 * Some financial API calls may need longer timeouts for complex calculations
 */
export const createFinancialApiInstance = () => {
    const financialApi = axios.create({
        ...api.defaults,
        timeout: 60000, // 60 seconds for financial operations
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    });
    
    // Apply the same interceptors to the financial API instance
    financialApi.interceptors.request = api.interceptors.request;
    financialApi.interceptors.response = api.interceptors.response;
    
    return financialApi;
};

/**
 * Health check function to verify API connectivity
 * Useful for monitoring and debugging
 */
export const checkApiHealth = async (): Promise<boolean> => {
    try {
        const response = await api.get('/health');
        return response.status === 200;
    } catch (error) {
        console.error('API health check failed:', error);
        return false;
    }
};

/**
 * Export the configured Axios instance as the default export
 * This provides a pre-configured HTTP client for use throughout the application
 * with automatic authentication token management and error handling
 */
export default api;