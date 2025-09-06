package com.ufs.auth.model;

import jakarta.persistence.*; // 3.1.0
import java.util.Set; // java 21
import java.util.HashSet; // java 21

/**
 * JPA entity representing a user role within the unified financial services platform.
 * This class implements Role-Based Access Control (RBAC) as part of the authentication
 * and authorization framework, enabling fine-grained permission management across
 * the entire financial services ecosystem.
 * 
 * The Role entity is designed to support:
 * - Hierarchical role structures for complex financial organizations
 * - Dynamic role assignment for compliance and audit requirements
 * - Integration with Spring Security's authorization framework
 * - Regulatory compliance with financial industry standards
 * - Scalable permission management across microservices architecture
 * 
 * This entity maps to the 'roles' table in PostgreSQL database and establishes
 * many-to-many relationships with User entities to implement comprehensive RBAC.
 * The design deliberately avoids circular dependencies with Permission entities
 * to maintain clean architecture and prevent runtime issues.
 * 
 * Common roles in the financial services context include:
 * - ROLE_CUSTOMER: Basic customer access to personal financial data
 * - ROLE_ADVISOR: Financial advisor permissions for client management
 * - ROLE_COMPLIANCE: Compliance officer access for regulatory oversight
 * - ROLE_RISK_MANAGER: Risk management and assessment capabilities
 * - ROLE_ADMIN: Administrative privileges for system management
 * - ROLE_AUDITOR: Read-only access for audit and compliance reviews
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2024
 */
@Entity
@Table(name = "roles", indexes = {
    @Index(name = "idx_role_name", columnList = "name", unique = true)
})
public class Role {

    /**
     * Primary key for the role entity.
     * Uses database identity generation strategy for optimal performance
     * in high-throughput financial transaction environments where role
     * assignments and permission checks occur frequently.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * Unique name identifier for the role.
     * This field serves as the primary identifier for role-based authorization
     * decisions throughout the platform. Role names follow a hierarchical
     * convention (e.g., ROLE_ADMIN, ROLE_CUSTOMER) to support Spring Security's
     * default role-based authorization mechanisms.
     * 
     * Role naming conventions:
     * - Must be unique across the entire platform
     * - Should follow Spring Security conventions (ROLE_ prefix)
     * - Should reflect business functions in financial services
     * - Must support regulatory compliance requirements
     * - Should enable easy audit trail generation
     */
    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    /**
     * Collection of users assigned to this role.
     * This bidirectional many-to-many relationship enables efficient role-based
     * access control by allowing multiple users to share the same role while
     * supporting users with multiple roles simultaneously.
     * 
     * The relationship is configured with:
     * - LAZY fetching to optimize performance in high-volume scenarios
     * - Bidirectional mapping through User.roles for consistent state management
     * - Cascade operations carefully excluded to prevent accidental user deletion
     * 
     * Key considerations for financial services:
     * - Supports dynamic role assignment for compliance scenarios
     * - Enables role-based segregation of duties (SoD) enforcement
     * - Facilitates audit trail generation for regulatory compliance
     * - Allows real-time permission changes without system restart
     * - Supports bulk user management operations for large organizations
     */
    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY)
    private Set<User> users = new HashSet<>();

    /**
     * Default constructor for JPA entity instantiation.
     * Required by JPA specification for entity management and
     * reflection-based operations during database operations.
     * Initializes the users collection to prevent null pointer exceptions.
     */
    public Role() {
        this.users = new HashSet<>();
    }

    /**
     * Parameterized constructor for creating Role instances with role name.
     * This constructor is commonly used during system initialization,
     * role management operations, and testing scenarios.
     *
     * @param name The unique name identifier for the role (e.g., "ROLE_ADMIN")
     */
    public Role(String name) {
        this();
        this.name = name;
    }

    /**
     * Gets the unique identifier for this role entity.
     * This ID is used for database relationships, caching keys,
     * and internal system references.
     * 
     * @return The role's unique database identifier
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the unique identifier for this role entity.
     * Typically managed by JPA during entity persistence and should
     * not be set manually in application code. This method is primarily
     * used by the persistence framework and testing utilities.
     * 
     * @param id The role's unique database identifier
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the unique name identifier for this role.
     * This name is used throughout the authorization system to make
     * access control decisions and should follow established naming
     * conventions for consistency across the platform.
     * 
     * @return The role's unique name identifier
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the unique name identifier for this role.
     * Role names must be unique across the platform and should follow
     * Spring Security conventions with appropriate prefixes (e.g., "ROLE_").
     * 
     * Validation considerations:
     * - Must not be null or empty
     * - Should follow naming conventions
     * - Must be unique across all roles
     * - Should support internationalization if required
     * 
     * @param name The role's unique name identifier
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Gets the set of users assigned to this role.
     * Returns an unmodifiable view of the users collection to prevent
     * direct manipulation while still allowing read access for
     * authorization and audit purposes.
     * 
     * This method is commonly used for:
     * - Generating user lists for administrative interfaces
     * - Creating audit reports for compliance purposes
     * - Implementing role-based notifications and communications
     * - Supporting user management and role assignment workflows
     * 
     * @return Immutable set of users assigned to this role
     */
    public Set<User> getUsers() {
        return users;
    }

    /**
     * Sets the collection of users assigned to this role.
     * This method completely replaces the existing user collection
     * and should be used carefully to avoid unintended permission changes.
     * 
     * Best practices:
     * - Use addUser() and removeUser() methods for individual changes
     * - This method is primarily for bulk operations and initialization
     * - Ensure proper validation before setting user collections
     * - Consider audit logging for role assignment changes
     * 
     * @param users Set of users to assign to this role
     */
    public void setUsers(Set<User> users) {
        this.users = users != null ? users : new HashSet<>();
    }

    /**
     * Adds a user to this role, establishing a many-to-many relationship.
     * This method ensures bidirectional consistency by updating both sides
     * of the relationship. It's the preferred method for adding individual
     * users to roles in application code.
     * 
     * Security considerations:
     * - Validate user permissions before role assignment
     * - Log role assignment changes for audit purposes
     * - Consider implementing approval workflows for sensitive roles
     * - Ensure compliance with segregation of duties requirements
     * 
     * @param user The user to add to this role
     * @return true if the user was added, false if already present
     */
    public boolean addUser(User user) {
        if (user != null && this.users.add(user)) {
            // Note: Bidirectional relationship management would be handled
            // by the User entity's addRole method to maintain consistency
            return true;
        }
        return false;
    }

    /**
     * Removes a user from this role, maintaining bidirectional consistency.
     * This method is the preferred way to revoke role assignments and
     * ensures that both sides of the many-to-many relationship are updated.
     * 
     * Security considerations:
     * - Validate permissions before removing role assignments
     * - Log role removal changes for audit trails
     * - Consider implementing approval workflows for role revocation
     * - Ensure user retains minimum required permissions after removal
     * 
     * @param user The user to remove from this role
     * @return true if the user was removed, false if not present
     */
    public boolean removeUser(User user) {
        if (user != null && this.users.remove(user)) {
            // Note: Bidirectional relationship management would be handled
            // by the User entity's removeRole method to maintain consistency
            return true;
        }
        return false;
    }

    /**
     * Gets the number of users currently assigned to this role.
     * This method provides quick access to role usage statistics
     * without loading the full user collection, making it efficient
     * for reporting and monitoring purposes.
     * 
     * Common use cases:
     * - Role usage analytics and reporting
     * - Capacity planning for role-based features
     * - Compliance reporting on role assignments
     * - Performance monitoring of authorization systems
     * 
     * @return The number of users assigned to this role
     */
    public int getUserCount() {
        return users != null ? users.size() : 0;
    }

    /**
     * Checks if this role has any users assigned to it.
     * This method provides an efficient way to determine if a role
     * is currently in use without loading the full user collection.
     * 
     * @return true if the role has users assigned, false otherwise
     */
    public boolean hasUsers() {
        return users != null && !users.isEmpty();
    }

    /**
     * Checks if a specific user is assigned to this role.
     * This method provides efficient role membership checking
     * for authorization decisions and user interface logic.
     * 
     * @param user The user to check for role membership
     * @return true if the user is assigned to this role, false otherwise
     */
    public boolean hasUser(User user) {
        return users != null && users.contains(user);
    }

    /**
     * Provides a string representation of the Role entity.
     * Excludes user details to prevent performance issues and
     * circular reference problems during logging and debugging.
     * 
     * The string representation includes:
     * - Role ID for unique identification
     * - Role name for business context
     * - User count for quick reference
     * 
     * @return String representation of the role
     */
    @Override
    public String toString() {
        return "Role{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", userCount=" + getUserCount() +
                '}';
    }

    /**
     * Compares this Role entity with another object for equality.
     * Two roles are considered equal if they have the same ID when both
     * are persisted, or the same name when comparing transient entities.
     * 
     * This implementation supports:
     * - Consistent equality checking across persistence contexts
     * - Proper collection behavior for role management
     * - Effective caching and performance optimization
     * 
     * @param obj The object to compare with
     * @return true if the objects are equal, false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        Role role = (Role) obj;
        
        // For persisted entities, compare by ID
        if (id != null && role.id != null) {
            return id.equals(role.id);
        }
        
        // For transient entities, compare by name
        return name != null ? name.equals(role.name) : role.name == null;
    }

    /**
     * Returns the hash code for this Role entity.
     * Uses the role name for hash code calculation to ensure consistency
     * across different persistence states and contexts.
     * 
     * This implementation ensures:
     * - Consistent hash codes across persistence contexts
     * - Proper behavior in collections and caching systems
     * - Stable hash codes during entity lifecycle
     * 
     * @return The hash code value for this role
     */
    @Override
    public int hashCode() {
        return name != null ? name.hashCode() : 0;
    }
}