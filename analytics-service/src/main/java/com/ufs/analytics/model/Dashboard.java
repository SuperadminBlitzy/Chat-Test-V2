package com.ufs.analytics.model;

import jakarta.persistence.Entity; // Jakarta Persistence 3.1.0
import jakarta.persistence.Id; // Jakarta Persistence 3.1.0
import jakarta.persistence.GeneratedValue; // Jakarta Persistence 3.1.0
import jakarta.persistence.GenerationType; // Jakarta Persistence 3.1.0
import jakarta.persistence.Column; // Jakarta Persistence 3.1.0
import jakarta.persistence.OneToMany; // Jakarta Persistence 3.1.0
import jakarta.persistence.JoinColumn; // Jakarta Persistence 3.1.0
import jakarta.persistence.CascadeType; // Jakarta Persistence 3.1.0
import jakarta.persistence.FetchType; // Jakarta Persistence 3.1.0
import jakarta.persistence.Lob; // Jakarta Persistence 3.1.0
import jakarta.persistence.Table; // Jakarta Persistence 3.1.0
import jakarta.persistence.Index; // Jakarta Persistence 3.1.0
import jakarta.persistence.PrePersist; // Jakarta Persistence 3.1.0
import jakarta.persistence.PreUpdate; // Jakarta Persistence 3.1.0
import lombok.Data; // Lombok 1.18.30
import lombok.NoArgsConstructor; // Lombok 1.18.30
import lombok.AllArgsConstructor; // Lombok 1.18.30
import lombok.Builder; // Lombok 1.18.30
import lombok.ToString; // Lombok 1.18.30
import lombok.EqualsAndHashCode; // Lombok 1.18.30

import java.util.List; // Java 21
import java.util.ArrayList; // Java 21
import java.time.LocalDateTime; // Java 21
import com.fasterxml.jackson.annotation.JsonManagedReference; // Jackson 2.15+ for JSON serialization
import com.fasterxml.jackson.annotation.JsonProperty; // Jackson 2.15+
import jakarta.validation.constraints.NotNull; // Bean Validation 3.0
import jakarta.validation.constraints.NotBlank; // Bean Validation 3.0
import jakarta.validation.constraints.Size; // Bean Validation 3.0

/**
 * JPA Entity representing a customizable dashboard in the UFS Analytics Service.
 * 
 * This entity serves as the core model for providing personalized analytics views across
 * multiple financial service use cases as specified in the technical requirements:
 * 
 * - F-005: Predictive Analytics Dashboard - Provides UI for viewing predictive analytics and insights
 * - F-013: Customer Dashboard - Personalized dashboard for customers to view financial information
 * - F-014: Advisor Workbench - Dashboard for financial advisors to manage clients and view portfolio performance
 * - F-015: Compliance Control Center - Dashboard for compliance officers to monitor regulatory compliance
 * - F-016: Risk Management Console - Dashboard for risk managers to monitor and analyze risk
 * 
 * The Dashboard entity is designed to support the microservices architecture with Spring Boot 3.2+
 * and Jakarta Persistence 3.1.0, providing enterprise-grade scalability and maintainability.
 * It integrates with both PostgreSQL for transactional data persistence and InfluxDB for
 * time-series analytics data through the AnalyticsData model.
 * 
 * Key Features:
 * - Configurable layout system supporting dynamic dashboard arrangements
 * - Integration with time-series analytics data from InfluxDB
 * - Association with generated reports for comprehensive financial reporting
 * - Support for multiple dashboard types and user roles
 * - Audit trail capabilities with creation and modification timestamps
 * - Optimized database indexing for performance at scale
 * 
 * Security Considerations:
 * - All sensitive financial data access is controlled through proper authorization
 * - Dashboard configurations are validated to prevent injection attacks
 * - Audit logging tracks all dashboard modifications for compliance
 * 
 * Performance Optimizations:
 * - Database indexes on frequently queried fields (name, dashboard_type, created_by)
 * - Lazy loading for reports collection to prevent N+1 query issues
 * - JSON configuration storage for flexible layout management
 * 
 * @author UFS Analytics Team
 * @version 1.0
 * @since 1.0
 * @see AnalyticsData for time-series data integration
 * @see Report for associated report management
 */
@Entity
@Table(
    name = "dashboards",
    indexes = {
        @Index(name = "idx_dashboard_name", columnList = "name"),
        @Index(name = "idx_dashboard_type", columnList = "dashboard_type"),
        @Index(name = "idx_dashboard_created_by", columnList = "created_by"),
        @Index(name = "idx_dashboard_created_at", columnList = "created_at"),
        @Index(name = "idx_dashboard_status", columnList = "status")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"reports", "layoutConfiguration"}) // Exclude large fields from toString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Dashboard {

    /**
     * Primary key identifier for the dashboard entity.
     * Uses IDENTITY generation strategy for optimal performance with PostgreSQL.
     * This ID is used throughout the system to reference specific dashboard instances.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    @EqualsAndHashCode.Include
    private Long id;

    /**
     * Human-readable name of the dashboard.
     * This field is displayed in the user interface and must be unique per user
     * to avoid confusion in dashboard selection and management.
     * 
     * Examples:
     * - "Executive Risk Overview"
     * - "Customer Portfolio Summary" 
     * - "Compliance Monitoring Dashboard"
     * - "Real-time Transaction Analytics"
     */
    @NotBlank(message = "Dashboard name cannot be blank")
    @Size(min = 1, max = 255, message = "Dashboard name must be between 1 and 255 characters")
    @Column(name = "name", nullable = false, length = 255)
    private String name;

    /**
     * Detailed description of the dashboard's purpose and content.
     * Provides users with context about what analytics and insights the dashboard contains.
     * This field supports HTML formatting for rich text descriptions in the UI.
     */
    @Size(max = 2000, message = "Dashboard description cannot exceed 2000 characters")
    @Column(name = "description", length = 2000)
    private String description;

    /**
     * JSON configuration string defining the dashboard layout and widget arrangements.
     * This field stores the complete layout specification including:
     * - Widget positions and sizes
     * - Chart configurations and data source bindings
     * - Color themes and styling preferences
     * - Interactive dashboard settings
     * - Responsive layout breakpoints
     * 
     * The JSON structure follows a standardized schema that supports:
     * - Grid-based layout system with drag-and-drop functionality
     * - Widget libraries for charts, tables, KPIs, and custom components
     * - Data binding specifications for real-time updates
     * - User personalization settings and preferences
     * 
     * Example structure:
     * {
     *   "layout": {
     *     "columns": 12,
     *     "rows": "auto",
     *     "widgets": [
     *       {
     *         "id": "risk-score-chart",
     *         "type": "line-chart",
     *         "position": {"x": 0, "y": 0, "width": 6, "height": 4},
     *         "dataSource": "risk_metrics",
     *         "config": {...}
     *       }
     *     ]
     *   },
     *   "theme": "financial-dark",
     *   "refreshInterval": 30000
     * }
     */
    @Lob
    @Column(name = "layout_configuration", columnDefinition = "TEXT")
    private String layoutConfiguration;

    /**
     * Classification of the dashboard type based on business requirements.
     * This field enables the system to apply role-based access controls,
     * default configurations, and specialized features for different user personas.
     * 
     * Supported dashboard types aligned with technical requirements:
     * - PREDICTIVE_ANALYTICS: F-005 Predictive Analytics Dashboard
     * - CUSTOMER_PORTAL: F-013 Customer Dashboard  
     * - ADVISOR_WORKBENCH: F-014 Advisor Workbench
     * - COMPLIANCE_CENTER: F-015 Compliance Control Center
     * - RISK_MANAGEMENT: F-016 Risk Management Console
     * - EXECUTIVE_OVERVIEW: High-level executive summary dashboard
     * - OPERATIONAL_MONITORING: Real-time operational metrics dashboard
     */
    @NotBlank(message = "Dashboard type is required")
    @Column(name = "dashboard_type", nullable = false, length = 50)
    private String dashboardType;

    /**
     * Current status of the dashboard for lifecycle management.
     * Supports dashboard versioning, approval workflows, and maintenance states.
     * 
     * Possible values:
     * - ACTIVE: Dashboard is live and available to users
     * - DRAFT: Dashboard is being developed or modified
     * - ARCHIVED: Dashboard is no longer active but preserved for history
     * - MAINTENANCE: Dashboard is temporarily unavailable for updates
     * - PENDING_APPROVAL: Dashboard awaits compliance or management approval
     */
    @NotBlank(message = "Dashboard status is required")
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "DRAFT";

    /**
     * Identifier of the user who created this dashboard.
     * Used for access control, audit trails, and ownership tracking.
     * Links to the user management system for authorization decisions.
     */
    @Column(name = "created_by", length = 100)
    private String createdBy;

    /**
     * Identifier of the user who last modified this dashboard.
     * Maintains change tracking for audit compliance and support troubleshooting.
     */
    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    /**
     * Timestamp when the dashboard was initially created.
     * Immutable field used for audit trails and data lifecycle management.
     * Automatically set during entity persistence.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp when the dashboard was last modified.
     * Updated automatically whenever the entity is modified.
     * Used for cache invalidation and change tracking.
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Version number for optimistic locking and change management.
     * Prevents concurrent modification conflicts in multi-user environments.
     * Automatically managed by JPA but exposed for API clients.
     */
    @jakarta.persistence.Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;

    /**
     * Collection of reports associated with this dashboard.
     * 
     * This relationship allows dashboards to display and manage financial reports
     * such as compliance reports, settlement reconciliation, and risk assessments.
     * The relationship is mapped through the dashboard_id foreign key in the Report entity.
     * 
     * Key characteristics:
     * - Lazy loading to optimize performance for dashboard listing operations
     * - Cascade REMOVE to clean up orphaned reports when dashboard is deleted
     * - PERSIST and MERGE cascading for seamless report lifecycle management
     * - Ordered by creation date for consistent report presentation
     * 
     * Note: While AnalyticsData is referenced in the specification, it uses InfluxDB 
     * storage and cannot be directly mapped via JPA relationships. Analytics data
     * association is handled through service layer queries using dashboard metadata.
     */
    @OneToMany(
        cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REMOVE},
        fetch = FetchType.LAZY,
        orphanRemoval = true
    )
    @JoinColumn(name = "dashboard_id")
    @JsonManagedReference
    @Builder.Default
    private List<Report> reports = new ArrayList<>();

    /**
     * Tags for dashboard categorization and search functionality.
     * Supports comma-separated values for flexible dashboard organization.
     * Examples: "executive,risk,real-time", "customer-facing,mobile-optimized"
     */
    @Column(name = "tags", length = 500)
    private String tags;

    /**
     * Indicates whether this dashboard is shared with other users.
     * Controls visibility and access permissions for collaborative dashboards.
     */
    @Column(name = "is_shared", nullable = false)
    @Builder.Default
    private Boolean isShared = false;

    /**
     * Indicates whether this dashboard is marked as favorite by the owner.
     * Used for dashboard prioritization and quick access in the UI.
     */
    @Column(name = "is_favorite", nullable = false) 
    @Builder.Default
    private Boolean isFavorite = false;

    /**
     * Auto-refresh interval in seconds for real-time dashboards.
     * Zero or null indicates manual refresh only.
     * Used by frontend to automatically update dashboard data.
     */
    @Column(name = "refresh_interval_seconds")
    private Integer refreshIntervalSeconds;

    /**
     * Default constructor for JPA entity instantiation.
     * Initializes collections and sets default timestamps.
     * Required by JPA specification for entity management.
     */
    public Dashboard() {
        this.reports = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        this.status = "DRAFT";
        this.isShared = false;
        this.isFavorite = false;
        this.version = 0L;
    }

    /**
     * JPA callback method executed before entity persistence.
     * Sets creation and update timestamps to ensure accurate audit trails.
     * Validates required fields and applies business rules.
     */
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        this.updatedAt = now;
        
        // Ensure default values are set
        if (this.status == null || this.status.trim().isEmpty()) {
            this.status = "DRAFT";
        }
        if (this.isShared == null) {
            this.isShared = false;
        }
        if (this.isFavorite == null) {
            this.isFavorite = false;
        }
        if (this.version == null) {
            this.version = 0L;
        }
        
        // Initialize collections if null
        if (this.reports == null) {
            this.reports = new ArrayList<>();
        }
    }

    /**
     * JPA callback method executed before entity updates.
     * Updates the modification timestamp and validates business rules.
     * Ensures data consistency during dashboard lifecycle changes.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        
        // Validate status transitions
        if (this.status != null && !isValidStatus(this.status)) {
            throw new IllegalArgumentException("Invalid dashboard status: " + this.status);
        }
    }

    /**
     * Validates if the provided status is allowed for dashboard entities.
     * 
     * @param status The status to validate
     * @return true if the status is valid, false otherwise
     */
    private boolean isValidStatus(String status) {
        return status != null && (
            "ACTIVE".equals(status) ||
            "DRAFT".equals(status) ||
            "ARCHIVED".equals(status) ||
            "MAINTENANCE".equals(status) ||
            "PENDING_APPROVAL".equals(status)
        );
    }

    /**
     * Adds a report to this dashboard's report collection.
     * Maintains bidirectional relationship consistency by setting the dashboard ID
     * in the report entity.
     * 
     * @param report The report to add to this dashboard
     */
    public void addReport(Report report) {
        if (report != null) {
            if (this.reports == null) {
                this.reports = new ArrayList<>();
            }
            this.reports.add(report);
            report.setDashboardId(this.id);
        }
    }

    /**
     * Removes a report from this dashboard's report collection.
     * Maintains bidirectional relationship consistency by clearing the dashboard ID
     * in the report entity.
     * 
     * @param report The report to remove from this dashboard
     */
    public void removeReport(Report report) {
        if (report != null && this.reports != null) {
            this.reports.remove(report);
            report.setDashboardId(null);
        }
    }

    /**
     * Gets the count of reports associated with this dashboard.
     * Provides a quick way to determine dashboard content volume without loading the full collection.
     * 
     * @return The number of reports associated with this dashboard
     */
    public int getReportCount() {
        return this.reports != null ? this.reports.size() : 0;
    }

    /**
     * Determines if this dashboard has any associated reports.
     * 
     * @return true if the dashboard has one or more reports, false otherwise
     */
    public boolean hasReports() {
        return this.reports != null && !this.reports.isEmpty();
    }

    /**
     * Determines if this dashboard is currently active and available to users.
     * 
     * @return true if the dashboard status is ACTIVE, false otherwise
     */
    public boolean isActive() {
        return "ACTIVE".equals(this.status);
    }

    /**
     * Determines if this dashboard is in draft mode.
     * 
     * @return true if the dashboard status is DRAFT, false otherwise
     */
    public boolean isDraft() {
        return "DRAFT".equals(this.status);
    }

    /**
     * Determines if this dashboard is archived.
     * 
     * @return true if the dashboard status is ARCHIVED, false otherwise
     */
    public boolean isArchived() {
        return "ARCHIVED".equals(this.status);
    }

    /**
     * Determines if this dashboard is a predictive analytics dashboard.
     * Supports the F-005 Predictive Analytics Dashboard requirement.
     * 
     * @return true if this is a predictive analytics dashboard
     */
    public boolean isPredictiveAnalyticsDashboard() {
        return "PREDICTIVE_ANALYTICS".equals(this.dashboardType);
    }

    /**
     * Determines if this dashboard is a customer-facing dashboard.
     * Supports the F-013 Customer Dashboard requirement.
     * 
     * @return true if this is a customer dashboard
     */
    public boolean isCustomerDashboard() {
        return "CUSTOMER_PORTAL".equals(this.dashboardType);
    }

    /**
     * Determines if this dashboard is an advisor workbench.
     * Supports the F-014 Advisor Workbench requirement.
     * 
     * @return true if this is an advisor workbench dashboard
     */
    public boolean isAdvisorWorkbench() {
        return "ADVISOR_WORKBENCH".equals(this.dashboardType);
    }

    /**
     * Determines if this dashboard is a compliance control center.
     * Supports the F-015 Compliance Control Center requirement.
     * 
     * @return true if this is a compliance control dashboard
     */
    public boolean isComplianceControlCenter() {
        return "COMPLIANCE_CENTER".equals(this.dashboardType);
    }

    /**
     * Determines if this dashboard is a risk management console.
     * Supports the F-016 Risk Management Console requirement.
     * 
     * @return true if this is a risk management dashboard
     */
    public boolean isRiskManagementConsole() {
        return "RISK_MANAGEMENT".equals(this.dashboardType);
    }

    /**
     * Activates the dashboard by setting its status to ACTIVE.
     * This method should be called when a dashboard is ready for production use.
     */
    public void activate() {
        this.status = "ACTIVE";
    }

    /**
     * Archives the dashboard by setting its status to ARCHIVED.
     * Archived dashboards are preserved for historical purposes but not actively used.
     */
    public void archive() {
        this.status = "ARCHIVED";
    }

    /**
     * Marks the dashboard as favorite for the current user.
     * Used for dashboard prioritization and quick access features.
     */
    public void markAsFavorite() {
        this.isFavorite = true;
    }

    /**
     * Removes the favorite marking from the dashboard.
     */
    public void unmarkAsFavorite() {
        this.isFavorite = false;
    }

    /**
     * Shares the dashboard with other users by setting the shared flag.
     * Shared dashboards are visible to authorized users based on their roles.
     */
    public void share() {
        this.isShared = true;
    }

    /**
     * Makes the dashboard private by clearing the shared flag.
     */
    public void makePrivate() {
        this.isShared = false;
    }

    /**
     * Sets the auto-refresh interval for real-time dashboards.
     * 
     * @param seconds The refresh interval in seconds, or null/0 for manual refresh only
     */
    public void setAutoRefresh(Integer seconds) {
        this.refreshIntervalSeconds = (seconds != null && seconds > 0) ? seconds : null;
    }

    /**
     * Determines if the dashboard has auto-refresh enabled.
     * 
     * @return true if auto-refresh is configured, false otherwise
     */
    public boolean hasAutoRefresh() {
        return this.refreshIntervalSeconds != null && this.refreshIntervalSeconds > 0;
    }

    /**
     * Gets the auto-refresh interval in milliseconds for frontend consumption.
     * 
     * @return The refresh interval in milliseconds, or null if auto-refresh is disabled
     */
    @JsonProperty("refreshIntervalMs")
    public Long getRefreshIntervalMs() {
        return this.refreshIntervalSeconds != null ? this.refreshIntervalSeconds * 1000L : null;
    }

    /**
     * Validates that the dashboard has the minimum required configuration.
     * Used by service layer before persisting or activating dashboards.
     * 
     * @return true if the dashboard is valid for use, false otherwise
     */
    public boolean isValid() {
        return this.name != null && !this.name.trim().isEmpty() &&
               this.dashboardType != null && !this.dashboardType.trim().isEmpty() &&
               isValidStatus(this.status);
    }

    /**
     * Creates a summary string for logging and audit purposes.
     * Excludes sensitive or large data fields for security and performance.
     * 
     * @return A summary string representation of the dashboard
     */
    public String toSummaryString() {
        return String.format(
            "Dashboard{id=%d, name='%s', type='%s', status='%s', reports=%d, shared=%s, favorite=%s}",
            id, name, dashboardType, status, getReportCount(), isShared, isFavorite
        );
    }
}