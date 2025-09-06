package com.ufs.apigateway.filter;

import org.springframework.stereotype.Component; // Spring Framework 6.1.0
import org.springframework.cloud.gateway.filter.GlobalFilter; // Spring Cloud Gateway 4.1.0
import org.springframework.cloud.gateway.filter.GatewayFilterChain; // Spring Cloud Gateway 4.1.0
import org.springframework.web.server.ServerWebExchange; // Spring Web 6.1.0
import reactor.core.publisher.Mono; // Reactor Core 3.6.0
import org.slf4j.Logger; // SLF4J 2.0.9
import org.slf4j.LoggerFactory; // SLF4J 2.0.9
import org.springframework.core.Ordered; // Spring Core 6.1.0

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.util.MultiValueMap;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Arrays;

/**
 * LoggingFilter implements a Spring Cloud Gateway GlobalFilter to provide comprehensive
 * request and response logging for all incoming traffic through the API Gateway.
 * 
 * This filter is essential for:
 * - Regulatory compliance (SOX, PCI DSS, GDPR, Basel III)
 * - Security audit trails
 * - Operational monitoring and debugging
 * - Distributed tracing with correlation IDs
 * - Performance monitoring for SLA compliance (>99.9% success rate)
 * 
 * The filter logs structured data in JSON format to support centralized log aggregation
 * and analysis tools like Prometheus and compliance reporting systems.
 * 
 * @author Unified Financial Services Platform
 * @version 1.0
 * @since 2024-01-01
 */
@Component
public class LoggingFilter implements GlobalFilter, Ordered {

    /**
     * Logger instance for this class, configured to output structured logs
     * for compliance and monitoring purposes.
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(LoggingFilter.class);

    /**
     * HTTP header name for correlation ID to enable distributed tracing
     * across the entire financial services platform.
     */
    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    /**
     * HTTP header name for request timestamp to track processing duration
     * and meet performance SLA requirements (<1 second P95).
     */
    private static final String REQUEST_TIMESTAMP_HEADER = "X-Request-Timestamp";

    /**
     * List of sensitive headers that should be masked in logs for security
     * and compliance purposes (PCI DSS, GDPR requirements).
     */
    private static final List<String> SENSITIVE_HEADERS = Arrays.asList(
        "authorization", "x-api-key", "x-auth-token", "cookie", 
        "set-cookie", "x-access-token", "x-refresh-token", "x-session-id"
    );

    /**
     * DateTimeFormatter for ISO 8601 timestamp formatting to ensure
     * consistent audit trail timestamps across all services.
     */
    private static final DateTimeFormatter ISO_FORMATTER = 
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);

    /**
     * Default constructor for the LoggingFilter.
     * Spring will automatically instantiate this component during application startup.
     */
    public LoggingFilter() {
        // Default constructor - Spring manages lifecycle
        LOGGER.info("LoggingFilter initialized for comprehensive request/response logging");
    }

    /**
     * The core filter method that implements the logging logic for all requests
     * and responses passing through the API Gateway.
     * 
     * This method provides:
     * - Request logging with correlation ID assignment
     * - Headers logging with sensitive data masking
     * - Response logging with status codes and headers
     * - Performance metrics for SLA monitoring
     * - Structured JSON logging for compliance
     * 
     * @param exchange The ServerWebExchange containing request and response data
     * @param chain The GatewayFilterChain for continuing the filter chain
     * @return Mono<Void> indicating completion of the filter logic
     */
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // Retrieve the ServerHttpRequest from the exchange
        ServerHttpRequest request = exchange.getRequest();
        
        // Generate or retrieve correlation ID for distributed tracing
        String correlationId = getOrGenerateCorrelationId(request);
        
        // Record request timestamp for performance monitoring
        String requestTimestamp = ISO_FORMATTER.format(Instant.now());
        
        // Log detailed request information for audit trail
        logRequestDetails(request, correlationId, requestTimestamp);
        
        // Add correlation ID and timestamp to request headers for downstream services
        ServerHttpRequest modifiedRequest = request.mutate()
            .header(CORRELATION_ID_HEADER, correlationId)
            .header(REQUEST_TIMESTAMP_HEADER, requestTimestamp)
            .build();
        
        // Update the exchange with the modified request
        ServerWebExchange modifiedExchange = exchange.mutate()
            .request(modifiedRequest)
            .build();
        
        // Proceed with the filter chain and register response logging callback
        return chain.filter(modifiedExchange)
            .doOnSuccess(aVoid -> {
                // Log response details after successful completion
                logResponseDetails(modifiedExchange.getResponse(), correlationId, requestTimestamp);
            })
            .doOnError(throwable -> {
                // Log error details for failed requests
                logErrorDetails(throwable, correlationId, requestTimestamp);
            })
            .doFinally(signalType -> {
                // Log completion metrics regardless of success/failure
                logCompletionMetrics(signalType, correlationId, requestTimestamp);
            });
    }

    /**
     * Specifies the execution order for this filter in the filter chain.
     * Returns a high precedence value to ensure logging occurs early in the chain
     * for comprehensive request/response capture.
     * 
     * @return int The order value (HIGHEST_PRECEDENCE + 1 for early execution)
     */
    @Override
    public int getOrder() {
        // Set to high precedence to ensure logging captures all requests
        // HIGHEST_PRECEDENCE + 1 allows critical security filters to run first
        return Ordered.HIGHEST_PRECEDENCE + 1;
    }

    /**
     * Retrieves existing correlation ID from request headers or generates a new one
     * if not present. This ensures all requests have a unique identifier for tracing.
     * 
     * @param request The ServerHttpRequest to check for correlation ID
     * @return String The correlation ID (existing or newly generated)
     */
    private String getOrGenerateCorrelationId(ServerHttpRequest request) {
        String correlationId = request.getHeaders().getFirst(CORRELATION_ID_HEADER);
        
        if (correlationId == null || correlationId.trim().isEmpty()) {
            // Generate new UUID-based correlation ID for request tracking
            correlationId = UUID.randomUUID().toString();
        }
        
        return correlationId;
    }

    /**
     * Logs comprehensive request details in structured JSON format for audit compliance.
     * Includes sanitized headers, request metadata, and correlation information.
     * 
     * @param request The ServerHttpRequest containing request data
     * @param correlationId The correlation ID for request tracking
     * @param requestTimestamp The ISO 8601 formatted request timestamp
     */
    private void logRequestDetails(ServerHttpRequest request, String correlationId, String requestTimestamp) {
        try {
            // Extract and sanitize request headers for security compliance
            String sanitizedHeaders = sanitizeHeaders(request.getHeaders());
            
            // Extract query parameters for audit trail (without sensitive data)
            String queryParams = sanitizeQueryParams(request.getQueryParams());
            
            // Extract client IP address for security monitoring
            String clientIp = extractClientIpAddress(request);
            
            // Log structured request information
            LOGGER.info("API_GATEWAY_REQUEST | " +
                "correlationId={} | " +
                "timestamp={} | " +
                "method={} | " +
                "uri={} | " +
                "path={} | " +
                "queryParams={} | " +
                "headers={} | " +
                "clientIp={} | " +
                "userAgent={} | " +
                "contentType={} | " +
                "contentLength={}",
                correlationId,
                requestTimestamp,
                request.getMethod(),
                request.getURI(),
                request.getPath().value(),
                queryParams,
                sanitizedHeaders,
                clientIp,
                request.getHeaders().getFirst("User-Agent"),
                request.getHeaders().getFirst("Content-Type"),
                request.getHeaders().getFirst("Content-Length")
            );
            
        } catch (Exception e) {
            // Ensure logging errors don't break the request flow
            LOGGER.error("Error logging request details for correlationId={}: {}", 
                correlationId, e.getMessage(), e);
        }
    }

    /**
     * Logs comprehensive response details in structured JSON format for audit compliance.
     * Includes response status, headers, and performance metrics.
     * 
     * @param response The ServerHttpResponse containing response data
     * @param correlationId The correlation ID for request tracking
     * @param requestTimestamp The original request timestamp for duration calculation
     */
    private void logResponseDetails(ServerHttpResponse response, String correlationId, String requestTimestamp) {
        try {
            // Calculate processing duration for performance monitoring
            long processingDuration = calculateProcessingDuration(requestTimestamp);
            
            // Extract and sanitize response headers
            String sanitizedHeaders = sanitizeHeaders(response.getHeaders());
            
            // Determine if response meets SLA requirements (>99.9% success rate)
            boolean isSuccessful = response.getStatusCode() != null && 
                response.getStatusCode().is2xxSuccessful();
            
            // Log structured response information
            LOGGER.info("API_GATEWAY_RESPONSE | " +
                "correlationId={} | " +
                "timestamp={} | " +
                "statusCode={} | " +
                "statusText={} | " +
                "headers={} | " +
                "processingDurationMs={} | " +
                "isSuccessful={} | " +
                "contentType={} | " +
                "contentLength={}",
                correlationId,
                ISO_FORMATTER.format(Instant.now()),
                response.getStatusCode() != null ? response.getStatusCode().value() : "UNKNOWN",
                response.getStatusCode() != null ? response.getStatusCode().getReasonPhrase() : "UNKNOWN",
                sanitizedHeaders,
                processingDuration,
                isSuccessful,
                response.getHeaders().getFirst("Content-Type"),
                response.getHeaders().getFirst("Content-Length")
            );
            
            // Log performance warning if processing exceeds SLA threshold
            if (processingDuration > 1000) { // 1 second threshold
                LOGGER.warn("PERFORMANCE_SLA_BREACH | " +
                    "correlationId={} | " +
                    "processingDurationMs={} | " +
                    "threshold=1000ms | " +
                    "message=Request processing exceeded SLA threshold",
                    correlationId, processingDuration);
            }
            
        } catch (Exception e) {
            // Ensure logging errors don't break the response flow
            LOGGER.error("Error logging response details for correlationId={}: {}", 
                correlationId, e.getMessage(), e);
        }
    }

    /**
     * Logs error details when request processing fails, providing comprehensive
     * error information for debugging and compliance purposes.
     * 
     * @param throwable The exception that occurred during processing
     * @param correlationId The correlation ID for request tracking
     * @param requestTimestamp The original request timestamp
     */
    private void logErrorDetails(Throwable throwable, String correlationId, String requestTimestamp) {
        try {
            long processingDuration = calculateProcessingDuration(requestTimestamp);
            
            LOGGER.error("API_GATEWAY_ERROR | " +
                "correlationId={} | " +
                "timestamp={} | " +
                "errorType={} | " +
                "errorMessage={} | " +
                "processingDurationMs={} | " +
                "stackTrace={}",
                correlationId,
                ISO_FORMATTER.format(Instant.now()),
                throwable.getClass().getSimpleName(),
                throwable.getMessage(),
                processingDuration,
                Arrays.toString(throwable.getStackTrace())
            );
            
        } catch (Exception e) {
            // Fallback error logging
            LOGGER.error("Critical error in error logging for correlationId={}: {}", 
                correlationId, e.getMessage(), e);
        }
    }

    /**
     * Logs completion metrics for monitoring and analytics purposes,
     * providing insights into request processing patterns.
     * 
     * @param signalType The type of completion signal (SUCCESS, ERROR, CANCEL)
     * @param correlationId The correlation ID for request tracking
     * @param requestTimestamp The original request timestamp
     */
    private void logCompletionMetrics(reactor.core.publisher.SignalType signalType, 
                                    String correlationId, String requestTimestamp) {
        try {
            long processingDuration = calculateProcessingDuration(requestTimestamp);
            
            LOGGER.info("API_GATEWAY_COMPLETION | " +
                "correlationId={} | " +
                "timestamp={} | " +
                "signalType={} | " +
                "totalProcessingDurationMs={}",
                correlationId,
                ISO_FORMATTER.format(Instant.now()),
                signalType,
                processingDuration
            );
            
        } catch (Exception e) {
            LOGGER.error("Error logging completion metrics for correlationId={}: {}", 
                correlationId, e.getMessage(), e);
        }
    }

    /**
     * Sanitizes HTTP headers by masking sensitive information while preserving
     * necessary audit trail data for compliance purposes.
     * 
     * @param headers The HttpHeaders to sanitize
     * @return String JSON representation of sanitized headers
     */
    private String sanitizeHeaders(HttpHeaders headers) {
        try {
            return headers.entrySet().stream()
                .collect(Collectors.toMap(
                    entry -> entry.getKey(),
                    entry -> SENSITIVE_HEADERS.contains(entry.getKey().toLowerCase()) 
                        ? "[MASKED]" : String.join(",", entry.getValue())
                ))
                .toString();
        } catch (Exception e) {
            LOGGER.warn("Error sanitizing headers: {}", e.getMessage());
            return "[ERROR_SANITIZING_HEADERS]";
        }
    }

    /**
     * Sanitizes query parameters by masking sensitive information while preserving
     * necessary audit trail data for compliance purposes.
     * 
     * @param queryParams The MultiValueMap of query parameters
     * @return String JSON representation of sanitized query parameters
     */
    private String sanitizeQueryParams(MultiValueMap<String, String> queryParams) {
        try {
            return queryParams.entrySet().stream()
                .collect(Collectors.toMap(
                    entry -> entry.getKey(),
                    entry -> {
                        String key = entry.getKey().toLowerCase();
                        // Mask potentially sensitive query parameters
                        if (key.contains("token") || key.contains("key") || key.contains("secret") || 
                            key.contains("password") || key.contains("auth")) {
                            return "[MASKED]";
                        }
                        return String.join(",", entry.getValue());
                    }
                ))
                .toString();
        } catch (Exception e) {
            LOGGER.warn("Error sanitizing query parameters: {}", e.getMessage());
            return "[ERROR_SANITIZING_PARAMS]";
        }
    }

    /**
     * Extracts the client IP address from the request, checking various headers
     * for proxy and load balancer scenarios common in financial services infrastructure.
     * 
     * @param request The ServerHttpRequest to extract IP from
     * @return String The client IP address
     */
    private String extractClientIpAddress(ServerHttpRequest request) {
        try {
            // Check common proxy headers in order of preference
            String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                // Take the first IP in the chain
                return xForwardedFor.split(",")[0].trim();
            }
            
            String xRealIp = request.getHeaders().getFirst("X-Real-IP");
            if (xRealIp != null && !xRealIp.isEmpty()) {
                return xRealIp;
            }
            
            String xOriginalForwardedFor = request.getHeaders().getFirst("X-Original-Forwarded-For");
            if (xOriginalForwardedFor != null && !xOriginalForwardedFor.isEmpty()) {
                return xOriginalForwardedFor.split(",")[0].trim();
            }
            
            // Fallback to remote address
            return request.getRemoteAddress() != null ? 
                request.getRemoteAddress().getAddress().getHostAddress() : "UNKNOWN";
                
        } catch (Exception e) {
            LOGGER.warn("Error extracting client IP address: {}", e.getMessage());
            return "ERROR_EXTRACTING_IP";
        }
    }

    /**
     * Calculates the processing duration in milliseconds from the request timestamp
     * to the current time for performance monitoring and SLA compliance.
     * 
     * @param requestTimestamp The ISO 8601 formatted request timestamp
     * @return long The processing duration in milliseconds
     */
    private long calculateProcessingDuration(String requestTimestamp) {
        try {
            Instant requestTime = Instant.from(ISO_FORMATTER.parse(requestTimestamp));
            Instant currentTime = Instant.now();
            return currentTime.toEpochMilli() - requestTime.toEpochMilli();
        } catch (Exception e) {
            LOGGER.warn("Error calculating processing duration: {}", e.getMessage());
            return -1; // Indicate calculation error
        }
    }
}