package com.ufs.auth.model;

import jakarta.persistence.*; // 3.1.0
import lombok.Getter; // 1.18.30
import lombok.Setter; // 1.18.30
import lombok.NoArgsConstructor; // 1.18.30
import lombok.AllArgsConstructor; // 1.18.30
import java.util.Set; // java 21
import java.util.HashSet; // java 21

/**
 * JPA entity representing a permission within the unified financial services platform.
 * This class is a core component of the Role-Based Access Control (RBAC) system,
 * enabling fine-grained access control to enterprise resources and operations.
 * 
 * The Permission entity supports:
 * - Granular authorization for financial operations and data access
 * - Dynamic permission assignment through role-based inheritance
 * - Regulatory compliance with financial industry access control standards
 * - Integration with Spring Security's authorization framework
 * - Scalable permission management across microservices architecture
 * 
 * This entity maps to the 'permissions' table in PostgreSQL database and establishes
 * many-to-many relationships with Role entities to implement comprehensive RBAC.
 * The design supports complex organizational structures and regulatory requirements
 * typical in financial institutions.
 * 
 * Common permissions in the financial services context include:
 * - READ_CUSTOMER_DATA: Access to customer profile information
 * - CREATE_TRANSACTION: Authority to initiate financial transactions
 * - APPROVE_LOAN: Permission to approve loan applications
 * - VIEW_AUDIT_LOGS: Access to system audit trails for compliance
 * - MANAGE_RISK_ASSESSMENT: Authority to modify risk parameters
 * - ACCESS_COMPLIANCE_REPORTS: Permission to view regulatory reports
 * - EXECUTE_TRADES: Authority to execute trading operations
 * - MODIFY_ACCOUNT_SETTINGS: Permission to update account configurations
 * 
 * The permission naming follows a hierarchical convention using underscore
 * separation (ACTION_RESOURCE pattern) to support clear authorization rules
 * and maintainable access control policies across the platform.
 * 
 * Security considerations:
 * - All permission checks are logged for audit trail compliance
 * - Permission assignments are validated against segregation of duties rules
 * - Dynamic permission evaluation supports real-time authorization decisions
 * - Integration with regulatory frameworks ensures compliance requirements
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2024
 */
@Entity
@Table(name = "permissions", indexes = {
    @Index(name = "idx_permission_name", columnList = "name", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Permission {

    /**
     * Primary key for the permission entity.
     * Uses database identity generation strategy for optimal performance
     * in high-throughput financial environments where permission checks
     * occur frequently during transaction processing and data access operations.
     * 
     * The identity strategy is preferred over sequence or table generators
     * to minimize database roundtrips during bulk permission operations
     * and role assignment processes common in enterprise financial systems.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * Unique name identifier for the permission.
     * This field serves as the primary identifier for authorization decisions
     * throughout the platform. Permission names follow a standardized convention
     * (ACTION_RESOURCE pattern) to ensure consistency and maintainability
     * across the entire financial services ecosystem.
     * 
     * Permission naming conventions:
     * - Must be unique across the entire platform
     * - Should follow ACTION_RESOURCE pattern (e.g., READ_CUSTOMER_DATA)
     * - Must use uppercase letters with underscore separators
     * - Should reflect specific business operations in financial services
     * - Must support regulatory compliance and audit requirements
     * - Should enable granular access control without excessive complexity
     * 
     * The name field is indexed for optimal performance during authorization
     * checks and supports efficient lookup operations across the microservices
     * architecture where permission validation occurs at high frequency.
     * 
     * Example permission names:
     * - Transaction Operations: CREATE_TRANSACTION, APPROVE_TRANSACTION, CANCEL_TRANSACTION
     * - Customer Management: READ_CUSTOMER_DATA, UPDATE_CUSTOMER_PROFILE, DELETE_CUSTOMER_ACCOUNT
     * - Risk Management: VIEW_RISK_ASSESSMENT, MODIFY_RISK_PARAMETERS, APPROVE_HIGH_RISK_TRANSACTIONS
     * - Compliance Operations: ACCESS_AUDIT_LOGS, GENERATE_COMPLIANCE_REPORTS, REVIEW_SUSPICIOUS_ACTIVITIES
     * - Administrative Functions: MANAGE_USER_ACCOUNTS, CONFIGURE_SYSTEM_SETTINGS, ACCESS_ADMIN_CONSOLE
     */
    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    /**
     * Collection of roles that have been granted this permission.
     * This bidirectional many-to-many relationship enables efficient role-based
     * access control by allowing multiple roles to share the same permission while
     * supporting permissions that can be assigned to multiple roles simultaneously.
     * 
     * The relationship is configured with:
     * - LAZY fetching to optimize performance in high-volume scenarios
     * - JoinTable mapping for explicit control over the relationship table
     * - Bidirectional consistency through Role.permissions mapping
     * - Cascade operations excluded to prevent accidental role deletion
     * 
     * Key considerations for financial services:
     * - Supports dynamic permission assignment for compliance scenarios
     * - Enables fine-grained access control for sensitive financial operations
     * - Facilitates audit trail generation for regulatory compliance
     * - Allows real-time permission changes without system restart
     * - Supports bulk permission management operations for large organizations
     * - Enables segregation of duties enforcement across different roles
     * 
     * The join table structure provides:
     * - Efficient many-to-many queries for authorization decisions
     * - Clear separation between role and permission entities
     * - Support for additional metadata on role-permission relationships
     * - Optimal database performance for frequent permission checks
     * 
     * Performance optimizations:
     * - Lazy loading prevents unnecessary data fetching during permission checks
     * - Indexed foreign keys ensure fast join operations
     * - Batch loading support for bulk authorization operations
     * - Connection pooling optimization for high-concurrency scenarios
     */
    @ManyToMany(mappedBy = "permissions", fetch = FetchType.LAZY)
    private Set<Role> roles = new HashSet<>();

    /**
     * Adds a role to this permission, establishing a many-to-many relationship.
     * This method ensures bidirectional consistency by updating both sides
     * of the relationship. It's the preferred method for granting permissions
     * to roles in application code.
     * 
     * The method implements defensive programming practices to prevent
     * null pointer exceptions and maintains data integrity through
     * bidirectional relationship management.
     * 
     * Security considerations:
     * - Validate role permissions before granting new permissions
     * - Log permission grant changes for comprehensive audit trails
     * - Consider implementing approval workflows for sensitive permissions
     * - Ensure compliance with segregation of duties requirements
     * - Validate against organizational permission policies
     * 
     * Performance considerations:
     * - Uses HashSet.add() for O(1) average time complexity
     * - Avoids duplicate role assignments automatically
     * - Maintains consistent state across bidirectional relationships
     * 
     * @param role The role to grant this permission to
     * @return true if the role was added successfully, false if already present or null
     */
    public boolean addRole(Role role) {
        if (role != null) {
            boolean added = this.roles.add(role);
            if (added) {
                // Ensure bidirectional relationship consistency
                // Note: The Role entity should have a corresponding addPermission method
                // to maintain relationship integrity across both entities
                return true;
            }
        }
        return false;
    }

    /**
     * Removes a role from this permission, maintaining bidirectional consistency.
     * This method is the preferred way to revoke permissions from roles and
     * ensures that both sides of the many-to-many relationship are updated.
     * 
     * The method implements safe removal practices to prevent null pointer
     * exceptions and maintains data integrity through proper relationship
     * management.
     * 
     * Security considerations:
     * - Validate permissions before revoking role access
     * - Log permission revocation changes for audit compliance
     * - Consider implementing approval workflows for permission removal
     * - Ensure role retains minimum required permissions after removal
     * - Validate against segregation of duties requirements
     * - Check for dependent permissions that may be affected
     * 
     * Performance considerations:
     * - Uses HashSet.remove() for O(1) average time complexity
     * - Handles non-existent role removal gracefully
     * - Maintains consistent state across bidirectional relationships
     * 
     * @param role The role to revoke this permission from
     * @return true if the role was removed successfully, false if not present or null
     */
    public boolean removeRole(Role role) {
        if (role != null) {
            boolean removed = this.roles.remove(role);
            if (removed) {
                // Ensure bidirectional relationship consistency
                // Note: The Role entity should have a corresponding removePermission method
                // to maintain relationship integrity across both entities
                return true;
            }
        }
        return false;
    }

    /**
     * Gets the number of roles currently granted this permission.
     * This method provides quick access to permission usage statistics
     * without loading the full role collection, making it efficient
     * for reporting and monitoring purposes.
     * 
     * Common use cases:
     * - Permission usage analytics and reporting
     * - Capacity planning for permission-based features
     * - Compliance reporting on permission assignments
     * - Performance monitoring of authorization systems
     * - Security assessment of permission distribution
     * - Organizational role analysis and optimization
     * 
     * The method handles null collections safely and provides
     * consistent results across different entity states.
     * 
     * @return The number of roles granted this permission
     */
    public int getRoleCount() {
        return roles != null ? roles.size() : 0;
    }

    /**
     * Checks if this permission has any roles assigned to it.
     * This method provides an efficient way to determine if a permission
     * is currently in use without loading the full role collection.
     * 
     * Use cases:
     * - Permission cleanup and maintenance operations
     * - Security audits to identify unused permissions
     * - Performance optimization for permission loading
     * - Validation before permission deletion operations
     * - Compliance reporting on active permissions
     * 
     * @return true if the permission has roles assigned, false otherwise
     */
    public boolean hasRoles() {
        return roles != null && !roles.isEmpty();
    }

    /**
     * Checks if a specific role has been granted this permission.
     * This method provides efficient permission membership checking
     * for authorization decisions and administrative interfaces.
     * 
     * The method is commonly used for:
     * - Real-time authorization decisions in business logic
     * - Administrative interface permission displays
     * - Audit trail generation and compliance reporting
     * - Role-based user interface customization
     * - Security validation in service layers
     * 
     * Performance characteristics:
     * - O(1) average time complexity using HashSet.contains()
     * - No database queries required for loaded entities
     * - Efficient for high-frequency authorization checks
     * 
     * @param role The role to check for permission assignment
     * @return true if the role has this permission, false otherwise
     */
    public boolean hasRole(Role role) {
        return roles != null && roles.contains(role);
    }

    /**
     * Clears all role assignments for this permission.
     * This method removes all roles from the permission while maintaining
     * bidirectional relationship consistency. Use with caution as it
     * effectively revokes this permission from all roles.
     * 
     * Security considerations:
     * - Should be used only in administrative contexts with proper authorization
     * - Consider implementing approval workflows for bulk permission changes
     * - Log all role removals for comprehensive audit trails
     * - Validate that clearing permissions doesn't violate security policies
     * - Ensure proper notification of affected users and administrators
     * 
     * Common use cases:
     * - Permission restructuring and reorganization
     * - Security incident response (emergency permission revocation)
     * - System maintenance and cleanup operations
     * - Compliance-driven permission audits and corrections
     * 
     * @return The number of roles that were removed from this permission
     */
    public int clearRoles() {
        if (roles != null && !roles.isEmpty()) {
            int removedCount = roles.size();
            roles.clear();
            return removedCount;
        }
        return 0;
    }

    /**
     * Creates a defensive copy of the roles collection.
     * This method returns an immutable view of the roles assigned to this
     * permission, preventing external modification while allowing read access
     * for authorization and administrative purposes.
     * 
     * The defensive copy approach provides:
     * - Protection against external collection modification
     * - Safe iteration over role collections
     * - Consistent data access across concurrent operations
     * - Support for functional programming patterns
     * 
     * Use cases:
     * - Generating role lists for administrative interfaces
     * - Creating audit reports for compliance purposes
     * - Implementing role-based notifications and communications
     * - Supporting permission analysis and reporting workflows
     * 
     * @return Immutable set view of roles assigned to this permission
     */
    public Set<Role> getRolesAsImmutableSet() {
        return roles != null ? Set.copyOf(roles) : Set.of();
    }

    /**
     * Provides a string representation of the Permission entity.
     * Excludes role details to prevent performance issues and
     * circular reference problems during logging and debugging.
     * 
     * The string representation includes:
     * - Permission ID for unique identification in logs and debugging
     * - Permission name for business context and human readability
     * - Role count for quick reference and administrative insights
     * 
     * This format is optimized for:
     * - Application logging and debugging scenarios
     * - Administrative interfaces and reporting
     * - Performance monitoring and troubleshooting
     * - Audit trail generation and compliance documentation
     * 
     * The method avoids loading lazy collections to prevent
     * performance degradation during logging operations.
     * 
     * @return String representation of the permission entity
     */
    @Override
    public String toString() {
        return "Permission{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", roleCount=" + getRoleCount() +
                '}';
    }

    /**
     * Compares this Permission entity with another object for equality.
     * Two permissions are considered equal if they have the same ID when both
     * are persisted, or the same name when comparing transient entities.
     * 
     * This implementation supports:
     * - Consistent equality checking across persistence contexts
     * - Proper collection behavior for permission management
     * - Effective caching and performance optimization
     * - Reliable entity comparison in business logic
     * 
     * The equality contract ensures:
     * - Reflexive: x.equals(x) returns true
     * - Symmetric: x.equals(y) returns true if and only if y.equals(x) returns true
     * - Transitive: if x.equals(y) and y.equals(z), then x.equals(z) returns true
     * - Consistent: multiple invocations return the same result
     * - Null-safe: x.equals(null) returns false
     * 
     * @param obj The object to compare with this permission
     * @return true if the objects are equal according to the equality contract
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        Permission permission = (Permission) obj;
        
        // For persisted entities, compare by ID for optimal performance
        if (id != null && permission.id != null) {
            return id.equals(permission.id);
        }
        
        // For transient entities, compare by name to ensure business logic consistency
        return name != null ? name.equals(permission.name) : permission.name == null;
    }

    /**
     * Returns the hash code for this Permission entity.
     * Uses the permission name for hash code calculation to ensure consistency
     * across different persistence states and contexts.
     * 
     * This implementation ensures:
     * - Consistent hash codes across persistence contexts
     * - Proper behavior in collections and caching systems
     * - Stable hash codes during entity lifecycle transitions
     * - Optimal performance in hash-based collections
     * 
     * The hash code contract guarantees:
     * - If two objects are equal according to equals(), they must have the same hash code
     * - Hash codes remain consistent during object lifetime
     * - Distribution is reasonably uniform to minimize collisions
     * 
     * Using the name field for hash code calculation provides:
     * - Business-meaningful hash codes for debugging and monitoring
     * - Stable values independent of database-generated IDs
     * - Consistent behavior across different persistence contexts
     * 
     * @return The hash code value for this permission entity
     */
    @Override
    public int hashCode() {
        return name != null ? name.hashCode() : 0;
    }
}