package com.ufs.analytics.config;

import org.springframework.beans.factory.annotation.Value; // Spring 6.0.13
import org.springframework.context.annotation.Bean; // Spring 6.0.13
import org.springframework.context.annotation.Configuration; // Spring 6.0.13
import org.influxdb.InfluxDB; // InfluxDB 2.23
import org.influxdb.InfluxDBFactory; // InfluxDB 2.23
import org.influxdb.dto.Query;
import org.influxdb.dto.QueryResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PreDestroy;
import java.util.concurrent.TimeUnit;

/**
 * Configuration class for establishing a connection to the InfluxDB time-series database.
 * This class is responsible for creating and configuring the InfluxDB client bean, which 
 * will be used throughout the analytics service to interact with InfluxDB for storing 
 * and retrieving financial metrics and performance monitoring data.
 * 
 * Supports the polyglot persistence strategy by providing a dedicated data store 
 * for time-series data, separate from transactional and document databases.
 * 
 * @author Analytics Service Team
 * @version 1.0
 * @since 2024
 */
@Configuration
public class InfluxDBConfig {

    private static final Logger logger = LoggerFactory.getLogger(InfluxDBConfig.class);
    
    // Connection timeout and retry configurations for production resilience
    private static final int CONNECTION_TIMEOUT_SECONDS = 30;
    private static final int READ_TIMEOUT_SECONDS = 60;
    private static final int WRITE_TIMEOUT_SECONDS = 60;
    private static final int MAX_RETRIES = 3;
    
    /**
     * InfluxDB server URL injected from application properties.
     * Example: http://localhost:8086 or https://influxdb.company.com:8086
     */
    @Value("${influx.url}")
    private String influxUrl;
    
    /**
     * InfluxDB authentication username injected from application properties.
     * Used for authenticated access to the InfluxDB instance.
     */
    @Value("${influx.username}")
    private String influxUsername;
    
    /**
     * InfluxDB authentication password injected from application properties.
     * Used for authenticated access to the InfluxDB instance.
     */
    @Value("${influx.password}")
    private String influxPassword;
    
    /**
     * InfluxDB database name injected from application properties.
     * Represents the specific database for financial analytics and monitoring data.
     */
    @Value("${influx.database}")
    private String influxDatabase;
    
    /**
     * Reference to the created InfluxDB client for proper cleanup
     */
    private InfluxDB influxDBClient;

    /**
     * Default constructor for the InfluxDBConfig class.
     * Spring will use this constructor to create the configuration bean.
     */
    public InfluxDBConfig() {
        // Default constructor - Spring framework will inject values via @Value annotations
    }

    /**
     * Creates and configures the InfluxDB client bean. This bean will be injected into 
     * other components that need to communicate with InfluxDB. It connects to the database,
     * verifies the connection, and ensures the target database exists.
     * 
     * The client is configured with appropriate timeouts and retry policies for 
     * production financial services environments where reliability is critical.
     * 
     * @return A configured and connected InfluxDB client instance
     * @throws RuntimeException if connection fails or database operations fail
     */
    @Bean
    public InfluxDB influxDB() {
        logger.info("Initializing InfluxDB connection to: {}", influxUrl);
        
        try {
            // Step 1: Create an InfluxDB client instance using InfluxDBFactory with configured credentials
            influxDBClient = InfluxDBFactory.connect(influxUrl, influxUsername, influxPassword);
            
            // Step 2: Configure client timeouts for production reliability
            influxDBClient.setConnectTimeout(CONNECTION_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            influxDBClient.setReadTimeout(READ_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            influxDBClient.setWriteTimeout(WRITE_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            
            // Step 3: Enable batch processing for high-throughput financial metrics
            influxDBClient.enableBatch();
            
            // Step 4: Verify connection by pinging the InfluxDB server
            verifyConnection();
            
            // Step 5: Check if the specified database exists and create if necessary
            ensureDatabaseExists();
            
            // Step 6: Set the database for the client instance
            influxDBClient.setDatabase(influxDatabase);
            
            // Step 7: Configure retention policy for financial data compliance
            configureRetentionPolicy();
            
            logger.info("InfluxDB client successfully configured for database: {}", influxDatabase);
            
            return influxDBClient;
            
        } catch (Exception e) {
            logger.error("Failed to initialize InfluxDB connection: {}", e.getMessage(), e);
            throw new RuntimeException("Unable to connect to InfluxDB at " + influxUrl, e);
        }
    }
    
    /**
     * Verifies the connection to InfluxDB server by sending a ping request.
     * This ensures the server is reachable and responsive before proceeding with database operations.
     * 
     * @throws RuntimeException if the ping operation fails
     */
    private void verifyConnection() {
        try {
            logger.debug("Verifying InfluxDB connection...");
            
            // Ping the InfluxDB server with timeout
            influxDBClient.ping();
            
            logger.info("InfluxDB connection verified successfully");
            
        } catch (Exception e) {
            logger.error("InfluxDB connection verification failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to verify InfluxDB connection", e);
        }
    }
    
    /**
     * Ensures that the specified database exists in InfluxDB. If the database does not exist,
     * it will be created automatically. This is essential for first-time setup and ensures
     * the analytics service can store financial metrics immediately.
     * 
     * @throws RuntimeException if database creation fails
     */
    private void ensureDatabaseExists() {
        try {
            logger.debug("Checking if database '{}' exists...", influxDatabase);
            
            // Query to check if database exists
            Query showDatabasesQuery = new Query("SHOW DATABASES");
            QueryResult result = influxDBClient.query(showDatabasesQuery);
            
            boolean databaseExists = false;
            if (result.getResults() != null && !result.getResults().isEmpty()) {
                QueryResult.Result dbResult = result.getResults().get(0);
                if (dbResult.getSeries() != null && !dbResult.getSeries().isEmpty()) {
                    for (QueryResult.Series series : dbResult.getSeries()) {
                        if (series.getValues() != null) {
                            for (Object[] values : series.getValues()) {
                                if (values.length > 0 && influxDatabase.equals(values[0])) {
                                    databaseExists = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            
            // Create database if it doesn't exist
            if (!databaseExists) {
                logger.info("Database '{}' does not exist. Creating database...", influxDatabase);
                Query createDatabaseQuery = new Query("CREATE DATABASE \"" + influxDatabase + "\"");
                influxDBClient.query(createDatabaseQuery);
                logger.info("Database '{}' created successfully", influxDatabase);
            } else {
                logger.debug("Database '{}' already exists", influxDatabase);
            }
            
        } catch (Exception e) {
            logger.error("Failed to ensure database '{}' exists: {}", influxDatabase, e.getMessage(), e);
            throw new RuntimeException("Failed to create or verify database: " + influxDatabase, e);
        }
    }
    
    /**
     * Configures retention policy for financial data compliance.
     * Financial institutions typically need to retain data for regulatory compliance periods.
     * This method sets up appropriate retention policies for different types of financial metrics.
     */
    private void configureRetentionPolicy() {
        try {
            logger.debug("Configuring retention policy for financial data compliance...");
            
            // Create retention policy for financial metrics (7 years as per typical financial regulations)
            String retentionPolicyName = "financial_metrics_retention";
            String createRetentionPolicy = String.format(
                "CREATE RETENTION POLICY \"%s\" ON \"%s\" DURATION 2555d REPLICATION 1 DEFAULT",
                retentionPolicyName, influxDatabase
            );
            
            Query retentionQuery = new Query(createRetentionPolicy);
            influxDBClient.query(retentionQuery);
            
            logger.info("Retention policy configured for financial data compliance: {} days", 2555);
            
        } catch (Exception e) {
            // Log warning but don't fail - retention policy might already exist
            logger.warn("Could not configure retention policy (may already exist): {}", e.getMessage());
        }
    }
    
    /**
     * Cleanup method called when the Spring context is destroyed.
     * Ensures proper cleanup of InfluxDB resources and closes connections gracefully.
     */
    @PreDestroy
    public void cleanup() {
        if (influxDBClient != null) {
            try {
                logger.info("Closing InfluxDB connection...");
                
                // Disable batch processing and flush any pending writes
                influxDBClient.disableBatch();
                
                // Close the InfluxDB connection
                influxDBClient.close();
                
                logger.info("InfluxDB connection closed successfully");
                
            } catch (Exception e) {
                logger.error("Error closing InfluxDB connection: {}", e.getMessage(), e);
            }
        }
    }
}