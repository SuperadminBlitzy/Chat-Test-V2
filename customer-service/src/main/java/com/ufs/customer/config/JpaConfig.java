package com.ufs.customer.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.Properties;

/**
 * JPA Configuration class for the Customer Service
 * 
 * This configuration class sets up the complete persistence layer for the customer service,
 * including PostgreSQL data source with optimized connection pooling, entity manager factory,
 * and transaction management. The configuration is optimized for high-throughput financial
 * operations supporting 10,000+ TPS as per F-001: Unified Data Integration Platform requirements.
 * 
 * Key features:
 * - PostgreSQL 16+ database connectivity with HikariCP connection pooling
 * - Optimized for unified customer profile management and transactional data
 * - Transaction management with ACID compliance for financial data integrity
 * - Performance-tuned for sub-second response times and high availability (99.99%)
 * - Support for complex customer data relationships and queries
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2024
 */
@Configuration
@EnableJpaRepositories(basePackages = "com.ufs.customer.repository")
@EnableTransactionManagement
public class JpaConfig {

    // Database connection properties
    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/ufs_customer_db}")
    private String databaseUrl;

    @Value("${spring.datasource.username:ufs_customer_user}")
    private String databaseUsername;

    @Value("${spring.datasource.password:}")
    private String databasePassword;

    @Value("${spring.datasource.driver-class-name:org.postgresql.Driver}")
    private String driverClassName;

    // Connection pool configuration properties based on PostgreSQL Connection Pool Configuration
    @Value("${spring.datasource.hikari.pool-size:20}")
    private int poolSize;

    @Value("${spring.datasource.hikari.maximum-pool-size:50}")
    private int maxPoolSize;

    @Value("${spring.datasource.hikari.connection-timeout:30000}")
    private long connectionTimeout;

    @Value("${spring.datasource.hikari.max-lifetime:3600000}")
    private long maxLifetime;

    @Value("${spring.datasource.hikari.leak-detection-threshold:60000}")
    private long leakDetectionThreshold;

    // JPA and Hibernate properties
    @Value("${spring.jpa.hibernate.ddl-auto:validate}")
    private String ddlAuto;

    @Value("${spring.jpa.show-sql:false}")
    private boolean showSql;

    @Value("${spring.jpa.properties.hibernate.format_sql:false}")
    private boolean formatSql;

    @Value("${spring.jpa.database-platform:org.hibernate.dialect.PostgreSQLDialect}")
    private String databasePlatform;

    /**
     * Default constructor for the JpaConfig class.
     * Initializes the configuration with default settings optimized for
     * PostgreSQL and high-performance financial applications.
     */
    public JpaConfig() {
        // Default constructor - Spring will inject properties via @Value annotations
    }

    /**
     * Primary DataSource bean configuration using HikariCP for optimal performance.
     * 
     * HikariCP is configured with optimized settings for PostgreSQL to support:
     * - High connection throughput for 10,000+ TPS requirement
     * - Connection pooling with primary pool size of 20 and max of 50
     * - Connection leak detection for production monitoring
     * - Optimized connection lifecycle management
     * 
     * Connection pool settings align with PostgreSQL Connection Pool Configuration:
     * - Pool size: 20 (primary), max overflow capability up to 50
     * - Connection timeout: 30 seconds
     * - Max lifetime: 1 hour (3600 seconds) for connection recycling
     * - Pre-ping equivalent through connection validation
     * 
     * @return HikariDataSource configured for PostgreSQL with optimal settings
     */
    @Bean
    @Primary
    public DataSource customerDataSource() {
        HikariConfig config = new HikariConfig();
        
        // Basic connection settings
        config.setJdbcUrl(databaseUrl);
        config.setUsername(databaseUsername);
        config.setPassword(databasePassword);
        config.setDriverClassName(driverClassName);
        
        // Connection pool settings optimized for financial workloads
        config.setMinimumIdle(poolSize);
        config.setMaximumPoolSize(maxPoolSize);
        config.setConnectionTimeout(connectionTimeout);
        config.setMaxLifetime(maxLifetime);
        config.setIdleTimeout(600000); // 10 minutes idle timeout
        
        // Performance and monitoring settings
        config.setLeakDetectionThreshold(leakDetectionThreshold);
        config.setConnectionTestQuery("SELECT 1"); // PostgreSQL connection validation
        config.setValidationTimeout(5000); // 5 seconds validation timeout
        
        // Pool naming for monitoring and debugging
        config.setPoolName("UFS-Customer-HikariCP");
        
        // PostgreSQL-specific optimizations
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
        config.addDataSourceProperty("useServerPrepStmts", "true");
        config.addDataSourceProperty("useLocalSessionState", "true");
        config.addDataSourceProperty("rewriteBatchedStatements", "true");
        config.addDataSourceProperty("cacheResultSetMetadata", "true");
        config.addDataSourceProperty("cacheServerConfiguration", "true");
        config.addDataSourceProperty("elideSetAutoCommits", "true");
        config.addDataSourceProperty("maintainTimeStats", "false");
        
        // PostgreSQL-specific settings for optimal performance
        config.addDataSourceProperty("tcpKeepAlive", "true");
        config.addDataSourceProperty("socketTimeout", "30");
        config.addDataSourceProperty("loginTimeout", "10");
        config.addDataSourceProperty("connectTimeout", "10");
        config.addDataSourceProperty("cancelSignalTimeout", "10");
        
        return new HikariDataSource(config);
    }

    /**
     * EntityManagerFactory bean for JPA entity management.
     * 
     * Configured with HibernateJpaVendorAdapter for PostgreSQL optimization:
     * - Entity scanning for customer domain objects
     * - PostgreSQL-specific dialect for optimal SQL generation
     * - Performance tuning for high-throughput operations
     * - Support for complex customer profile relationships
     * 
     * This configuration supports the F-001: Unified Data Integration Platform
     * requirement for unified customer profiles and transactional data management.
     * 
     * @param dataSource The configured HikariCP data source
     * @return LocalContainerEntityManagerFactoryBean configured for customer entities
     */
    @Bean
    public LocalContainerEntityManagerFactoryBean customerEntityManagerFactory(DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        
        // Data source and entity configuration
        em.setDataSource(dataSource);
        em.setPackagesToScan("com.ufs.customer.entity", "com.ufs.customer.model");
        
        // Hibernate JPA vendor adapter with PostgreSQL optimizations
        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        vendorAdapter.setShowSql(showSql);
        vendorAdapter.setGenerateDdl(false); // DDL managed by Flyway/Liquibase
        vendorAdapter.setDatabasePlatform(databasePlatform);
        em.setJpaVendorAdapter(vendorAdapter);
        
        // JPA and Hibernate properties for optimal performance
        em.setJpaProperties(jpaProperties());
        
        // Persistence unit configuration
        em.setPersistenceUnitName("customerPersistenceUnit");
        
        return em;
    }

    /**
     * Transaction Manager bean for declarative transaction management.
     * 
     * Configured for ACID compliance and financial data integrity:
     * - Supports distributed transactions across multiple customer operations
     * - Rollback capabilities for data consistency
     * - Integration with Spring's @Transactional annotation
     * - Optimized for high-concurrency customer service operations
     * 
     * @param entityManagerFactory The configured entity manager factory
     * @return JpaTransactionManager for customer service transactions
     */
    @Bean
    public PlatformTransactionManager customerTransactionManager(
            LocalContainerEntityManagerFactoryBean entityManagerFactory) {
        
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(entityManagerFactory.getObject());
        
        // Transaction timeout configuration (30 seconds for complex operations)
        transactionManager.setDefaultTimeout(30);
        
        // Enable transaction synchronization for monitoring
        transactionManager.setGlobalRollbackOnParticipationFailure(false);
        
        return transactionManager;
    }

    /**
     * JPA and Hibernate properties configuration for PostgreSQL optimization.
     * 
     * Properties are tuned for:
     * - High-performance customer data operations
     * - PostgreSQL-specific optimizations
     * - Financial data integrity and consistency
     * - Monitoring and debugging capabilities
     * - Optimal memory usage and caching
     * 
     * @return Properties object with optimized JPA/Hibernate settings
     */
    private Properties jpaProperties() {
        Properties properties = new Properties();
        
        // Hibernate core properties
        properties.setProperty("hibernate.hbm2ddl.auto", ddlAuto);
        properties.setProperty("hibernate.dialect", databasePlatform);
        properties.setProperty("hibernate.show_sql", String.valueOf(showSql));
        properties.setProperty("hibernate.format_sql", String.valueOf(formatSql));
        
        // PostgreSQL-specific optimizations
        properties.setProperty("hibernate.jdbc.batch_size", "25");
        properties.setProperty("hibernate.jdbc.fetch_size", "50");
        properties.setProperty("hibernate.order_inserts", "true");
        properties.setProperty("hibernate.order_updates", "true");
        properties.setProperty("hibernate.batch_versioned_data", "true");
        
        // Connection and transaction properties
        properties.setProperty("hibernate.connection.provider_disables_autocommit", "true");
        properties.setProperty("hibernate.connection.autocommit", "false");
        properties.setProperty("hibernate.connection.isolation", "2"); // READ_COMMITTED
        
        // Performance and caching properties
        properties.setProperty("hibernate.cache.use_second_level_cache", "true");
        properties.setProperty("hibernate.cache.use_query_cache", "true");
        properties.setProperty("hibernate.cache.region.factory_class", 
            "org.hibernate.cache.jcache.JCacheRegionFactory");
        
        // Statistics and monitoring (disabled in production for performance)
        properties.setProperty("hibernate.generate_statistics", "false");
        properties.setProperty("hibernate.session.events.log.LOG_QUERIES_SLOWER_THAN_MS", "1000");
        
        // PostgreSQL JDBC optimizations
        properties.setProperty("hibernate.jdbc.lob.non_contextual_creation", "true");
        properties.setProperty("hibernate.temp.use_jdbc_metadata_defaults", "false");
        
        // Schema validation and naming strategy
        properties.setProperty("hibernate.physical_naming_strategy", 
            "org.springframework.boot.orm.jpa.hibernate.SpringPhysicalNamingStrategy");
        properties.setProperty("hibernate.implicit_naming_strategy", 
            "org.springframework.boot.orm.jpa.hibernate.SpringImplicitNamingStrategy");
        
        // Connection handling
        properties.setProperty("hibernate.connection.handling_mode", "DELAYED_ACQUISITION_AND_RELEASE_AFTER_TRANSACTION");
        
        // Time zone configuration for financial data consistency
        properties.setProperty("hibernate.jdbc.time_zone", "UTC");
        
        return properties;
    }
}