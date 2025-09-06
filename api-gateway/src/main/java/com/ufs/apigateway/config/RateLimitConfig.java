package com.ufs.apigateway.config;

import org.springframework.cloud.gateway.filter.ratelimiter.KeyResolver; // v3.1.0
import org.springframework.context.annotation.Bean; // v5.3.23
import org.springframework.context.annotation.Configuration; // v5.3.23
import org.springframework.context.annotation.Primary; // v5.3.23
import reactor.core.publisher.Mono; // v3.4.24

import org.springframework.cloud.gateway.filter.ratelimiter.RedisRateLimiter; // v3.1.0
import org.springframework.data.redis.connection.RedisConnectionFactory; // v3.2.0
import org.springframework.data.redis.core.ReactiveStringRedisTemplate; // v3.2.0
import org.springframework.beans.factory.annotation.Value; // v5.3.23
import org.springframework.security.core.Authentication; // v5.8.0
import org.springframework.security.core.context.ReactiveSecurityContextHolder; // v5.8.0
import org.springframework.web.server.ServerWebExchange; // v5.3.23

import java.security.Principal;
import java.util.Objects;

/**
 * Rate Limiting Configuration for API Gateway
 * 
 * This configuration class provides comprehensive rate limiting capabilities for the API Gateway
 * using Redis as a distributed store to ensure consistent rate limiting across multiple instances.
 * The implementation uses a token bucket algorithm to handle burst traffic while maintaining
 * strict rate limits to protect backend services from being overwhelmed.
 * 
 * Key Features:
 * - Distributed rate limiting using Redis
 * - Per-user rate limiting based on authentication principal
 * - Token bucket algorithm for burst handling
 * - Fallback to anonymous limiting for unauthenticated requests
 * - Integration with Spring Cloud Gateway
 * 
 * Performance Requirements:
 * - Supports 10,000+ TPS as specified in system requirements
 * - Sub-second response times for rate limit checks
 * - High availability with Redis clustering support
 * 
 * Security Considerations:
 * - Prevents DDoS attacks through configurable rate limits
 * - Protects backend microservices from abuse
 * - Implements tiered rate limiting based on user authentication status
 * 
 * @author UFS Engineering Team
 * @version 1.0
 * @since 2024
 */
@Configuration
public class RateLimitConfig {

    /**
     * Redis replenish rate (tokens per second) for authenticated users
     * Default: 100 requests per second for premium tier users
     */
    @Value("${api.rate-limit.authenticated.replenish-rate:100}")
    private int authenticatedReplenishRate;

    /**
     * Redis burst capacity (maximum tokens) for authenticated users
     * Default: 200 tokens for handling burst traffic
     */
    @Value("${api.rate-limit.authenticated.burst-capacity:200}")
    private int authenticatedBurstCapacity;

    /**
     * Redis replenish rate for anonymous users
     * Default: 10 requests per second for unauthenticated users
     */
    @Value("${api.rate-limit.anonymous.replenish-rate:10}")
    private int anonymousReplenishRate;

    /**
     * Redis burst capacity for anonymous users
     * Default: 20 tokens for limited burst capability
     */
    @Value("${api.rate-limit.anonymous.burst-capacity:20}")
    private int anonymousBurstCapacity;

    /**
     * Redis requested tokens per request
     * Default: 1 token per request
     */
    @Value("${api.rate-limit.requested-tokens:1}")
    private int requestedTokens;

    /**
     * Creates a KeyResolver bean that extracts the user's principal name for rate limiting.
     * 
     * This resolver implements a sophisticated key resolution strategy:
     * 1. First attempts to extract the authenticated user's principal name
     * 2. Falls back to extracting the principal from the ServerWebExchange
     * 3. Defaults to 'anonymous' for unauthenticated requests
     * 4. Ensures consistent key generation for distributed rate limiting
     * 
     * The key resolution is crucial for:
     * - Per-user rate limiting enforcement
     * - Distributed consistency across gateway instances
     * - Proper isolation between authenticated and anonymous users
     * - Support for various authentication mechanisms (JWT, OAuth2, etc.)
     * 
     * @return KeyResolver that extracts user identification for rate limiting
     */
    @Bean
    @Primary
    public KeyResolver userKeyResolver() {
        return (ServerWebExchange exchange) -> {
            // Step 1: Attempt to get the authenticated principal from security context
            return ReactiveSecurityContextHolder.getContext()
                .cast(org.springframework.security.core.context.SecurityContext.class)
                .map(securityContext -> securityContext.getAuthentication())
                .filter(Objects::nonNull)
                .filter(Authentication::isAuthenticated)
                .map(Authentication::getName)
                .cast(String.class)
                .switchIfEmpty(
                    // Step 2: Fallback to extracting principal from ServerWebExchange
                    exchange.getPrincipal()
                        .cast(Principal.class)
                        .map(Principal::getName)
                        .cast(String.class)
                )
                .switchIfEmpty(
                    // Step 3: Extract from request headers if available
                    Mono.fromCallable(() -> {
                        String userId = exchange.getRequest().getHeaders().getFirst("X-User-ID");
                        if (userId != null && !userId.trim().isEmpty()) {
                            return userId;
                        }
                        
                        // Check for API key in header
                        String apiKey = exchange.getRequest().getHeaders().getFirst("X-API-Key");
                        if (apiKey != null && !apiKey.trim().isEmpty()) {
                            return "api-key:" + apiKey;
                        }
                        
                        // Step 4: Default to anonymous for unauthenticated requests
                        return "anonymous";
                    })
                )
                .onErrorReturn("anonymous") // Handle any errors gracefully
                .doOnNext(key -> {
                    // Log the resolved key for monitoring and debugging
                    if (!"anonymous".equals(key)) {
                        // Avoid logging anonymous requests to reduce noise
                        exchange.getAttributes().put("rate.limit.key", key);
                    }
                })
                .cast(String.class);
        };
    }

    /**
     * Creates a RedisRateLimiter bean for authenticated users with higher rate limits.
     * 
     * This rate limiter is configured for premium tier users with:
     * - Higher replenish rate for better performance
     * - Increased burst capacity for handling traffic spikes
     * - Optimized for authenticated user experience
     * 
     * Token Bucket Algorithm Parameters:
     * - replenishRate: Tokens added per second to the bucket
     * - burstCapacity: Maximum tokens the bucket can hold
     * - requestedTokens: Tokens consumed per request
     * 
     * @return RedisRateLimiter configured for authenticated users
     */
    @Bean("authenticatedRateLimiter")
    public RedisRateLimiter authenticatedRateLimiter() {
        return new RedisRateLimiter(
            authenticatedReplenishRate,
            authenticatedBurstCapacity,
            requestedTokens
        );
    }

    /**
     * Creates a RedisRateLimiter bean for anonymous users with restrictive rate limits.
     * 
     * This rate limiter provides basic protection against abuse while allowing
     * legitimate anonymous access:
     * - Lower replenish rate to prevent abuse
     * - Limited burst capacity
     * - Sufficient for basic API exploration
     * 
     * @return RedisRateLimiter configured for anonymous users
     */
    @Bean("anonymousRateLimiter")
    public RedisRateLimiter anonymousRateLimiter() {
        return new RedisRateLimiter(
            anonymousReplenishRate,
            anonymousBurstCapacity,
            requestedTokens
        );
    }

    /**
     * Creates a reactive Redis template for rate limiting operations.
     * 
     * This template is specifically configured for:
     * - High-performance rate limiting operations
     * - Consistent serialization across gateway instances
     * - Optimized for the token bucket algorithm
     * - Connection pooling for better performance
     * 
     * @param redisConnectionFactory Redis connection factory
     * @return ReactiveStringRedisTemplate for rate limiting operations
     */
    @Bean("rateLimitRedisTemplate")
    public ReactiveStringRedisTemplate rateLimitRedisTemplate(
            RedisConnectionFactory redisConnectionFactory) {
        ReactiveStringRedisTemplate template = new ReactiveStringRedisTemplate(redisConnectionFactory);
        
        // Configure for optimal rate limiting performance
        template.setEnableTransactionSupport(false); // Not needed for rate limiting
        template.setExposeConnection(false); // Security best practice
        
        return template;
    }

    /**
     * Creates a KeyResolver specifically for API key-based rate limiting.
     * 
     * This resolver handles API key authentication scenarios:
     * - Extracts API keys from request headers
     * - Provides consistent key format for rate limiting
     * - Supports multiple API key header formats
     * - Falls back to IP-based limiting if no API key present
     * 
     * @return KeyResolver for API key-based rate limiting
     */
    @Bean("apiKeyResolver")
    public KeyResolver apiKeyResolver() {
        return (ServerWebExchange exchange) -> {
            return Mono.fromCallable(() -> {
                // Check standard API key headers
                String apiKey = exchange.getRequest().getHeaders().getFirst("X-API-Key");
                if (apiKey != null && !apiKey.trim().isEmpty()) {
                    return "api:" + apiKey;
                }
                
                // Check alternative API key header
                apiKey = exchange.getRequest().getHeaders().getFirst("Authorization");
                if (apiKey != null && apiKey.startsWith("Bearer ")) {
                    return "bearer:" + apiKey.substring(7);
                }
                
                // Fallback to client IP for basic rate limiting
                String clientIp = exchange.getRequest().getRemoteAddress() != null ?
                    exchange.getRequest().getRemoteAddress().getAddress().getHostAddress() : "unknown";
                return "ip:" + clientIp;
            })
            .onErrorReturn("ip:unknown")
            .cast(String.class);
        };
    }

    /**
     * Default constructor for RateLimitConfig.
     * 
     * Initializes the rate limiting configuration with default values
     * that can be overridden through application properties.
     */
    public RateLimitConfig() {
        // Constructor body intentionally left empty
        // All initialization handled through @Value annotations and Spring dependency injection
    }
}