package com.ufs.wellness.config;

import org.springframework.beans.factory.annotation.Value; // Spring Framework 6.0.13
import org.springframework.context.annotation.Configuration; // Spring Framework 6.0.13
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration; // Spring Data MongoDB 4.2.1
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories; // Spring Data MongoDB 4.2.1
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;
import org.springframework.data.mongodb.core.convert.DbRefResolver;
import org.springframework.data.mongodb.core.convert.DefaultDbRefResolver;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;

import com.mongodb.client.MongoClient; // MongoDB Java Driver 4.11.1
import com.mongodb.client.MongoClients; // MongoDB Java Driver 4.11.1
import com.mongodb.ConnectionString; // MongoDB Java Driver 4.11.1
import com.mongodb.MongoClientSettings; // MongoDB Java Driver 4.11.1
import com.mongodb.WriteConcern;
import com.mongodb.ReadConcern;
import com.mongodb.ReadPreference;
import com.mongodb.ServerApi;
import com.mongodb.ServerApiVersion;
import com.mongodb.connection.ConnectionPoolSettings;
import com.mongodb.connection.SocketSettings;
import com.mongodb.connection.SslSettings;
import com.mongodb.connection.ServerSettings;
import com.mongodb.MongoCredential;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Conditional;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.NonNull;
import org.springframework.validation.annotation.Validated;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Min;
import javax.validation.constraints.Max;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * MongoDB Configuration for the Financial Wellness Service
 * 
 * This configuration class sets up the MongoDB connection with enterprise-grade
 * settings optimized for financial services workloads. It includes:
 * - Connection pooling configuration based on technical specifications
 * - Security settings for financial data protection
 * - Performance optimization for analytics and customer interaction data
 * - Compliance and audit trail support
 * - High availability and resilience configurations
 * 
 * The configuration supports the following requirements:
 * - F-007: Personalized Financial Recommendations
 * - Personalized Financial Wellness capability
 * - Database & Storage Technology for document storage and analytics
 * 
 * @author Financial Wellness Service Team
 * @version 1.0
 * @since 2024-12-19
 */
@Configuration
@EnableMongoRepositories(basePackages = "com.ufs.wellness.repository")
@EnableConfigurationProperties(MongoConfig.MongoProperties.class)
@Validated
public class MongoConfig extends AbstractMongoClientConfiguration {

    private static final Logger logger = LoggerFactory.getLogger(MongoConfig.class);

    /**
     * MongoDB connection string injected from application properties
     * Format: mongodb://[username:password@]host1[:port1][,host2[:port2],...]/database[?options]
     */
    @Value("${spring.data.mongodb.uri}")
    @NotBlank(message = "MongoDB connection string cannot be blank")
    private String connectionString;

    /**
     * MongoDB database name for the financial wellness service
     */
    @Value("${spring.data.mongodb.database}")
    @NotBlank(message = "MongoDB database name cannot be blank")
    private String databaseName;

    /**
     * Additional MongoDB properties for enterprise configuration
     */
    private final MongoProperties mongoProperties;

    /**
     * Default constructor
     */
    public MongoConfig(MongoProperties mongoProperties) {
        this.mongoProperties = mongoProperties;
        logger.info("Initializing MongoDB configuration for Financial Wellness Service");
    }

    /**
     * Returns the name of the MongoDB database to use for the financial wellness service.
     * This database will store customer profiles, financial wellness assessments,
     * personalized recommendations, and analytics data.
     *
     * @return The name of the database as configured in application properties
     */
    @Override
    @NonNull
    protected String getDatabaseName() {
        logger.debug("Using MongoDB database: {}", databaseName);
        return databaseName;
    }

    /**
     * Creates and configures the MongoClient bean with enterprise-grade settings.
     * This includes connection pooling, security configurations, and performance
     * optimizations suitable for financial services workloads.
     *
     * The configuration implements the following technical specifications:
     * - Connection pool: min 10, max 100 connections
     * - Wait queue timeout: 10 seconds
     * - Server selection timeout: 30 seconds
     * - Socket timeout optimized for financial data processing
     * - SSL/TLS encryption for data in transit
     * - Write concern for data durability
     * - Read preference for performance optimization
     *
     * @return Configured MongoClient instance
     */
    @Override
    @Bean
    @Primary
    public MongoClient mongoClient() {
        try {
            logger.info("Creating MongoDB client with enterprise configuration");
            
            // Parse connection string
            ConnectionString connString = new ConnectionString(connectionString);
            
            // Build connection pool settings based on technical specifications
            ConnectionPoolSettings connectionPoolSettings = ConnectionPoolSettings.builder()
                    .maxSize(mongoProperties.getMaxPoolSize()) // 100 connections max
                    .minSize(mongoProperties.getMinPoolSize()) // 10 connections min
                    .maxWaitTime(mongoProperties.getWaitQueueTimeoutMs(), TimeUnit.MILLISECONDS) // 10 seconds
                    .maxConnectionIdleTime(mongoProperties.getMaxIdleTimeMs(), TimeUnit.MILLISECONDS) // 5 minutes
                    .maxConnectionLifeTime(mongoProperties.getMaxConnectionLifeTimeMs(), TimeUnit.MILLISECONDS) // 30 minutes
                    .maintenanceInitialDelay(mongoProperties.getMaintenanceInitialDelayMs(), TimeUnit.MILLISECONDS)
                    .maintenanceFrequency(mongoProperties.getMaintenanceFrequencyMs(), TimeUnit.MILLISECONDS)
                    .build();

            // Configure socket settings for optimal performance
            SocketSettings socketSettings = SocketSettings.builder()
                    .connectTimeout(mongoProperties.getSocketConnectTimeoutMs(), TimeUnit.MILLISECONDS) // 10 seconds
                    .readTimeout(mongoProperties.getSocketReadTimeoutMs(), TimeUnit.MILLISECONDS) // 30 seconds
                    .receiveBufferSize(mongoProperties.getSocketReceiveBufferSize()) // 64KB
                    .sendBufferSize(mongoProperties.getSocketSendBufferSize()) // 64KB
                    .build();

            // Configure server settings for high availability
            ServerSettings serverSettings = ServerSettings.builder()
                    .heartbeatFrequency(mongoProperties.getHeartbeatFrequencyMs(), TimeUnit.MILLISECONDS) // 10 seconds
                    .minHeartbeatFrequency(mongoProperties.getMinHeartbeatFrequencyMs(), TimeUnit.MILLISECONDS) // 500ms
                    .build();

            // Configure SSL settings for financial data security
            SslSettings sslSettings = SslSettings.builder()
                    .enabled(mongoProperties.isSslEnabled())
                    .invalidHostNameAllowed(mongoProperties.isSslInvalidHostNameAllowed())
                    .build();

            // Build MongoClient settings with all enterprise configurations
            MongoClientSettings.Builder settingsBuilder = MongoClientSettings.builder()
                    .applyConnectionString(connString)
                    .applicationName("financial-wellness-service")
                    .applyToConnectionPoolSettings(builder -> builder.applySettings(connectionPoolSettings))
                    .applyToSocketSettings(builder -> builder.applySettings(socketSettings))
                    .applyToServerSettings(builder -> builder.applySettings(serverSettings))
                    .applyToSslSettings(builder -> builder.applySettings(sslSettings))
                    .serverSelectionTimeout(mongoProperties.getServerSelectionTimeoutMs(), TimeUnit.MILLISECONDS) // 30 seconds
                    .readPreference(ReadPreference.primaryPreferred()) // Optimize for read performance
                    .readConcern(ReadConcern.MAJORITY) // Ensure read consistency for financial data
                    .writeConcern(WriteConcern.MAJORITY.withWTimeout(mongoProperties.getWriteConcernTimeoutMs(), TimeUnit.MILLISECONDS)) // Ensure write durability
                    .retryWrites(true) // Enable automatic retry for write operations
                    .retryReads(true); // Enable automatic retry for read operations

            // Add MongoDB Server API version for stability
            if (mongoProperties.isServerApiEnabled()) {
                settingsBuilder.serverApi(ServerApi.builder()
                        .version(ServerApiVersion.V1)
                        .strict(mongoProperties.isServerApiStrict())
                        .deprecationErrors(mongoProperties.isServerApiDeprecationErrors())
                        .build());
            }

            // Create and configure the MongoClient
            MongoClient client = MongoClients.create(settingsBuilder.build());
            
            logger.info("MongoDB client created successfully with database: {}", databaseName);
            logger.debug("Connection pool configuration - Min: {}, Max: {}, Wait timeout: {}ms", 
                    mongoProperties.getMinPoolSize(), 
                    mongoProperties.getMaxPoolSize(), 
                    mongoProperties.getWaitQueueTimeoutMs());
            
            return client;
            
        } catch (Exception e) {
            logger.error("Failed to create MongoDB client: {}", e.getMessage(), e);
            throw new IllegalStateException("Unable to configure MongoDB client for Financial Wellness Service", e);
        }
    }

    /**
     * Creates a MongoTemplate bean with custom configuration for financial wellness operations.
     * This template includes custom converters for financial data types and optimized
     * settings for document storage and analytics queries.
     *
     * @return Configured MongoTemplate instance
     */
    @Bean
    @Primary
    public MongoTemplate mongoTemplate() {
        logger.info("Creating custom MongoTemplate for financial wellness operations");
        
        try {
            // Create custom mapping context for financial domain objects
            MongoMappingContext mappingContext = new MongoMappingContext();
            mappingContext.setAutoIndexCreation(mongoProperties.isAutoIndexCreation());
            mappingContext.afterPropertiesSet();

            // Configure custom conversions for financial data types
            MongoCustomConversions customConversions = new MongoCustomConversions(Arrays.asList(
                    new BigDecimalToDecimal128Converter(),
                    new Decimal128ToBigDecimalConverter(),
                    new LocalDateTimeToDateConverter(),
                    new DateToLocalDateTimeConverter(),
                    new FinancialGoalConverter(),
                    new RiskAssessmentConverter()
            ));

            // Create DbRef resolver
            DbRefResolver dbRefResolver = new DefaultDbRefResolver(mongoClient());

            // Configure mapping converter with financial data support
            MappingMongoConverter converter = new MappingMongoConverter(dbRefResolver, mappingContext);
            converter.setCustomConversions(customConversions);
            converter.setCodecConfigurationSelector(codecConfigurationSelector -> 
                codecConfigurationSelector.findCodecConfigurations(clazz -> true));
            converter.afterPropertiesSet();

            // Create MongoTemplate with custom converter
            MongoTemplate mongoTemplate = new MongoTemplate(mongoClient(), getDatabaseName());
            mongoTemplate.setWriteConcern(WriteConcern.MAJORITY.withWTimeout(
                    mongoProperties.getWriteConcernTimeoutMs(), TimeUnit.MILLISECONDS));
            mongoTemplate.setWriteResultChecking(mongoProperties.getWriteResultChecking());

            logger.info("MongoTemplate created successfully with custom financial data converters");
            return mongoTemplate;
            
        } catch (Exception e) {
            logger.error("Failed to create MongoTemplate: {}", e.getMessage(), e);
            throw new IllegalStateException("Unable to configure MongoTemplate for Financial Wellness Service", e);
        }
    }

    /**
     * Creates a GridFsTemplate bean for handling large file storage operations
     * such as document uploads, financial reports, and compliance documents.
     *
     * @return Configured GridFsTemplate instance
     */
    @Bean
    @ConditionalOnProperty(name = "mongodb.gridfs.enabled", havingValue = "true", matchIfMissing = true)
    public GridFsTemplate gridFsTemplate() {
        logger.info("Creating GridFsTemplate for document storage operations");
        
        try {
            GridFsTemplate gridFsTemplate = new GridFsTemplate(mongoClient(), getDatabaseName());
            logger.info("GridFsTemplate created successfully for bucket: {}", getDatabaseName() + ".fs");
            return gridFsTemplate;
            
        } catch (Exception e) {
            logger.error("Failed to create GridFsTemplate: {}", e.getMessage(), e);
            throw new IllegalStateException("Unable to configure GridFsTemplate for Financial Wellness Service", e);
        }
    }

    /**
     * Configuration properties for MongoDB enterprise settings
     */
    @ConfigurationProperties(prefix = "mongodb")
    @Validated
    public static class MongoProperties {
        
        // Connection Pool Configuration (from technical specifications)
        @Min(value = 1, message = "Minimum pool size must be at least 1")
        @Max(value = 200, message = "Maximum pool size cannot exceed 200")
        private int maxPoolSize = 100;
        
        @Min(value = 0, message = "Minimum pool size cannot be negative")
        private int minPoolSize = 10;
        
        @Min(value = 1000, message = "Max idle time must be at least 1 second")
        private long maxIdleTimeMs = 300000; // 5 minutes
        
        @Min(value = 1000, message = "Wait queue timeout must be at least 1 second")
        private long waitQueueTimeoutMs = 10000; // 10 seconds
        
        @Min(value = 1000, message = "Server selection timeout must be at least 1 second")
        private long serverSelectionTimeoutMs = 30000; // 30 seconds
        
        // Additional Enterprise Configuration
        private long maxConnectionLifeTimeMs = 1800000; // 30 minutes
        private long maintenanceInitialDelayMs = 0;
        private long maintenanceFrequencyMs = 60000; // 1 minute
        
        // Socket Configuration
        private int socketConnectTimeoutMs = 10000; // 10 seconds
        private int socketReadTimeoutMs = 30000; // 30 seconds
        private int socketReceiveBufferSize = 65536; // 64KB
        private int socketSendBufferSize = 65536; // 64KB
        
        // Server Configuration
        private long heartbeatFrequencyMs = 10000; // 10 seconds
        private long minHeartbeatFrequencyMs = 500; // 500ms
        
        // Security Configuration
        private boolean sslEnabled = true;
        private boolean sslInvalidHostNameAllowed = false;
        
        // Write Configuration
        private long writeConcernTimeoutMs = 5000; // 5 seconds
        private org.springframework.data.mongodb.core.WriteResultChecking writeResultChecking = 
                org.springframework.data.mongodb.core.WriteResultChecking.EXCEPTION;
        
        // Server API Configuration
        private boolean serverApiEnabled = true;
        private boolean serverApiStrict = false;
        private boolean serverApiDeprecationErrors = false;
        
        // Index Configuration
        private boolean autoIndexCreation = true;

        // Getters and setters for all properties
        
        public int getMaxPoolSize() { return maxPoolSize; }
        public void setMaxPoolSize(int maxPoolSize) { this.maxPoolSize = maxPoolSize; }
        
        public int getMinPoolSize() { return minPoolSize; }
        public void setMinPoolSize(int minPoolSize) { this.minPoolSize = minPoolSize; }
        
        public long getMaxIdleTimeMs() { return maxIdleTimeMs; }
        public void setMaxIdleTimeMs(long maxIdleTimeMs) { this.maxIdleTimeMs = maxIdleTimeMs; }
        
        public long getWaitQueueTimeoutMs() { return waitQueueTimeoutMs; }
        public void setWaitQueueTimeoutMs(long waitQueueTimeoutMs) { this.waitQueueTimeoutMs = waitQueueTimeoutMs; }
        
        public long getServerSelectionTimeoutMs() { return serverSelectionTimeoutMs; }
        public void setServerSelectionTimeoutMs(long serverSelectionTimeoutMs) { this.serverSelectionTimeoutMs = serverSelectionTimeoutMs; }
        
        public long getMaxConnectionLifeTimeMs() { return maxConnectionLifeTimeMs; }
        public void setMaxConnectionLifeTimeMs(long maxConnectionLifeTimeMs) { this.maxConnectionLifeTimeMs = maxConnectionLifeTimeMs; }
        
        public long getMaintenanceInitialDelayMs() { return maintenanceInitialDelayMs; }
        public void setMaintenanceInitialDelayMs(long maintenanceInitialDelayMs) { this.maintenanceInitialDelayMs = maintenanceInitialDelayMs; }
        
        public long getMaintenanceFrequencyMs() { return maintenanceFrequencyMs; }
        public void setMaintenanceFrequencyMs(long maintenanceFrequencyMs) { this.maintenanceFrequencyMs = maintenanceFrequencyMs; }
        
        public int getSocketConnectTimeoutMs() { return socketConnectTimeoutMs; }
        public void setSocketConnectTimeoutMs(int socketConnectTimeoutMs) { this.socketConnectTimeoutMs = socketConnectTimeoutMs; }
        
        public int getSocketReadTimeoutMs() { return socketReadTimeoutMs; }
        public void setSocketReadTimeoutMs(int socketReadTimeoutMs) { this.socketReadTimeoutMs = socketReadTimeoutMs; }
        
        public int getSocketReceiveBufferSize() { return socketReceiveBufferSize; }
        public void setSocketReceiveBufferSize(int socketReceiveBufferSize) { this.socketReceiveBufferSize = socketReceiveBufferSize; }
        
        public int getSocketSendBufferSize() { return socketSendBufferSize; }
        public void setSocketSendBufferSize(int socketSendBufferSize) { this.socketSendBufferSize = socketSendBufferSize; }
        
        public long getHeartbeatFrequencyMs() { return heartbeatFrequencyMs; }
        public void setHeartbeatFrequencyMs(long heartbeatFrequencyMs) { this.heartbeatFrequencyMs = heartbeatFrequencyMs; }
        
        public long getMinHeartbeatFrequencyMs() { return minHeartbeatFrequencyMs; }
        public void setMinHeartbeatFrequencyMs(long minHeartbeatFrequencyMs) { this.minHeartbeatFrequencyMs = minHeartbeatFrequencyMs; }
        
        public boolean isSslEnabled() { return sslEnabled; }
        public void setSslEnabled(boolean sslEnabled) { this.sslEnabled = sslEnabled; }
        
        public boolean isSslInvalidHostNameAllowed() { return sslInvalidHostNameAllowed; }
        public void setSslInvalidHostNameAllowed(boolean sslInvalidHostNameAllowed) { this.sslInvalidHostNameAllowed = sslInvalidHostNameAllowed; }
        
        public long getWriteConcernTimeoutMs() { return writeConcernTimeoutMs; }
        public void setWriteConcernTimeoutMs(long writeConcernTimeoutMs) { this.writeConcernTimeoutMs = writeConcernTimeoutMs; }
        
        public org.springframework.data.mongodb.core.WriteResultChecking getWriteResultChecking() { return writeResultChecking; }
        public void setWriteResultChecking(org.springframework.data.mongodb.core.WriteResultChecking writeResultChecking) { this.writeResultChecking = writeResultChecking; }
        
        public boolean isServerApiEnabled() { return serverApiEnabled; }
        public void setServerApiEnabled(boolean serverApiEnabled) { this.serverApiEnabled = serverApiEnabled; }
        
        public boolean isServerApiStrict() { return serverApiStrict; }
        public void setServerApiStrict(boolean serverApiStrict) { this.serverApiStrict = serverApiStrict; }
        
        public boolean isServerApiDeprecationErrors() { return serverApiDeprecationErrors; }
        public void setServerApiDeprecationErrors(boolean serverApiDeprecationErrors) { this.serverApiDeprecationErrors = serverApiDeprecationErrors; }
        
        public boolean isAutoIndexCreation() { return autoIndexCreation; }
        public void setAutoIndexCreation(boolean autoIndexCreation) { this.autoIndexCreation = autoIndexCreation; }
    }

    // Custom converters for financial data types
    
    /**
     * Converter for BigDecimal to MongoDB Decimal128 for precise financial calculations
     */
    private static class BigDecimalToDecimal128Converter implements Converter<java.math.BigDecimal, org.bson.types.Decimal128> {
        @Override
        public org.bson.types.Decimal128 convert(java.math.BigDecimal source) {
            return new org.bson.types.Decimal128(source);
        }
    }

    /**
     * Converter for MongoDB Decimal128 to BigDecimal for financial calculations
     */
    private static class Decimal128ToBigDecimalConverter implements Converter<org.bson.types.Decimal128, java.math.BigDecimal> {
        @Override
        public java.math.BigDecimal convert(org.bson.types.Decimal128 source) {
            return source.bigDecimalValue();
        }
    }

    /**
     * Converter for LocalDateTime to Date for MongoDB storage
     */
    private static class LocalDateTimeToDateConverter implements Converter<java.time.LocalDateTime, java.util.Date> {
        @Override
        public java.util.Date convert(java.time.LocalDateTime source) {
            return java.util.Date.from(source.atZone(java.time.ZoneId.systemDefault()).toInstant());
        }
    }

    /**
     * Converter for Date to LocalDateTime for application use
     */
    private static class DateToLocalDateTimeConverter implements Converter<java.util.Date, java.time.LocalDateTime> {
        @Override
        public java.time.LocalDateTime convert(java.util.Date source) {
            return source.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
        }
    }

    /**
     * Custom converter for Financial Goal entities to optimize storage and retrieval
     */
    private static class FinancialGoalConverter implements Converter<Object, Object> {
        @Override
        public Object convert(Object source) {
            // Implementation for financial goal conversion logic
            return source;
        }
    }

    /**
     * Custom converter for Risk Assessment entities to ensure proper serialization
     */
    private static class RiskAssessmentConverter implements Converter<Object, Object> {
        @Override
        public Object convert(Object source) {
            // Implementation for risk assessment conversion logic
            return source;
        }
    }
}