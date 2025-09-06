package com.ufs.auth.model;

import jakarta.persistence.*; // 3.1.0
import java.util.Set; // java 17
import java.util.Collection; // java 17
import java.util.stream.Collectors; // java 17
import org.springframework.security.core.userdetails.UserDetails; // spring-security-core 6.2.1
import org.springframework.security.core.GrantedAuthority; // spring-security-core 6.2.1
import org.springframework.security.core.authority.SimpleGrantedAuthority; // spring-security-core 6.2.1

/**
 * JPA entity representing a user of the unified financial services platform.
 * This class implements Spring Security's UserDetails interface to provide
 * seamless integration with the authentication and authorization framework.
 * 
 * The User entity is designed to support:
 * - Digital customer onboarding with KYC/AML compliance
 * - Role-based access control (RBAC) for financial services
 * - Multi-factor authentication and biometric verification
 * - Regulatory compliance including audit trails
 * 
 * This entity maps to the 'users' table in PostgreSQL database and stores
 * core user credentials along with authorities derived from assigned roles.
 * 
 * @author UFS Development Team
 * @version 1.0
 * @since 2024
 */
@Entity
@Table(name = "users")
public class User implements UserDetails {
    
    /**
     * Primary key for the user entity.
     * Uses database identity generation strategy for optimal performance
     * in high-throughput financial transaction environments.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Unique username for the user account.
     * This field is used for authentication and must be unique across
     * the entire platform. Supports both traditional usernames and
     * email-based authentication patterns common in financial services.
     */
    @Column(nullable = false, unique = true)
    private String username;
    
    /**
     * Encrypted password for the user account.
     * Passwords are stored using BCrypt hashing algorithm with salt
     * to meet financial industry security standards. The password
     * field stores the hashed value and is never exposed in plain text.
     */
    @Column(nullable = false)
    private String password;
    
    /**
     * User's email address for communication and secondary authentication.
     * Email addresses must be unique and are used for:
     * - Account recovery and password reset
     * - Multi-factor authentication delivery
     * - Regulatory notifications and compliance communications
     * - KYC/AML verification processes
     */
    @Column(nullable = false, unique = true)
    private String email;
    
    /**
     * Flag indicating whether the user account is enabled.
     * Disabled accounts cannot authenticate or access the platform.
     * This field supports:
     * - Account suspension for compliance violations
     * - Temporary deactivation during KYC review
     * - Administrative control over user access
     */
    private boolean enabled;
    
    /**
     * Collection of authorities (permissions) granted to the user.
     * This field stores role-based permissions as strings and is used
     * to implement fine-grained access control across financial services.
     * 
     * The authorities are stored in a separate table 'user_authorities'
     * with eager fetching to ensure permissions are readily available
     * for authorization decisions in real-time financial operations.
     * 
     * Common authorities include:
     * - ROLE_CUSTOMER: Basic customer access
     * - ROLE_ADVISOR: Financial advisor permissions  
     * - ROLE_COMPLIANCE: Compliance officer access
     * - ROLE_ADMIN: Administrative privileges
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_authorities", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "authority")
    private Set<String> authorities;
    
    /**
     * Default constructor for JPA entity instantiation.
     * Required by JPA specification for entity management and
     * reflection-based operations during database operations.
     */
    public User() {
        // Default constructor for JPA
    }
    
    /**
     * Parameterized constructor for creating User instances with all required fields.
     * This constructor is used during user registration and admin user creation.
     *
     * @param username The unique username for the account
     * @param password The encrypted password (should be pre-hashed)
     * @param email The user's email address
     * @param enabled Whether the account is initially enabled
     * @param authorities Set of granted authorities for the user
     */
    public User(String username, String password, String email, boolean enabled, Set<String> authorities) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.enabled = enabled;
        this.authorities = authorities;
    }
    
    /**
     * Returns the authorities granted to the user as Spring Security GrantedAuthority objects.
     * This method is part of the UserDetails interface implementation and is called
     * by Spring Security during authentication and authorization processes.
     * 
     * The method transforms the stored string authorities into SimpleGrantedAuthority
     * instances that Spring Security can use for access control decisions.
     * 
     * @return Collection of GrantedAuthority objects representing user permissions
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Stream the set of authority strings and map each to SimpleGrantedAuthority
        // This transformation is required by Spring Security's authorization framework
        return authorities.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());
    }
    
    /**
     * Returns the password used to authenticate the user.
     * This method is part of the UserDetails interface and returns the
     * encrypted password for Spring Security's authentication process.
     * 
     * @return The user's encrypted password
     */
    @Override
    public String getPassword() {
        return password;
    }
    
    /**
     * Returns the username used to authenticate the user.
     * This method is part of the UserDetails interface and provides
     * the primary identifier for authentication processes.
     * 
     * @return The user's unique username
     */
    @Override
    public String getUsername() {
        return username;
    }
    
    /**
     * Indicates whether the user's account has expired.
     * In the current implementation, accounts do not expire automatically.
     * This can be extended in future versions to support:
     * - Temporary account access for contractors
     * - Time-limited access for specific compliance scenarios
     * - Automated account lifecycle management
     * 
     * @return true as account expiration is not currently implemented
     */
    @Override
    public boolean isAccountNonExpired() {
        // Account expiration feature not implemented in current version
        // All accounts are considered non-expired by default
        // Future enhancement: implement expiration logic based on business rules
        return true;
    }
    
    /**
     * Indicates whether the user account is locked or unlocked.
     * In the current implementation, accounts are not locked automatically.
     * This can be extended to support:
     * - Failed login attempt lockouts
     * - Administrative account locking
     * - Compliance-driven account restrictions
     * - Fraud prevention measures
     * 
     * @return true as account locking is not currently implemented
     */
    @Override
    public boolean isAccountNonLocked() {
        // Account locking feature not implemented in current version
        // All accounts are considered unlocked by default
        // Future enhancement: implement locking logic for security and compliance
        return true;
    }
    
    /**
     * Indicates whether the user's credentials (password) have expired.
     * In the current implementation, credentials do not expire automatically.
     * This can be extended to support:
     * - Mandatory password rotation policies
     * - Compliance-driven credential expiration
     * - Enhanced security for privileged accounts
     * - Industry-specific password lifecycle requirements
     * 
     * @return true as credential expiration is not currently implemented
     */
    @Override
    public boolean isCredentialsNonExpired() {
        // Credential expiration feature not implemented in current version
        // All credentials are considered non-expired by default
        // Future enhancement: implement password expiration based on security policies
        return true;
    }
    
    /**
     * Indicates whether the user account is enabled or disabled.
     * This method directly returns the value of the enabled field,
     * allowing administrators to control user access to the platform.
     * 
     * Disabled accounts cannot authenticate and are effectively
     * suspended from accessing any financial services or data.
     * 
     * @return true if the user account is enabled, false otherwise
     */
    @Override
    public boolean isEnabled() {
        // Return the current enabled status of the user account
        // This field is directly managed by administrators and compliance systems
        return enabled;
    }
    
    // Standard getters and setters for JPA entity management
    
    /**
     * Gets the unique identifier for this user entity.
     * 
     * @return The user's unique ID
     */
    public Long getId() {
        return id;
    }
    
    /**
     * Sets the unique identifier for this user entity.
     * Typically managed by JPA and should not be set manually.
     * 
     * @param id The user's unique ID
     */
    public void setId(Long id) {
        this.id = id;
    }
    
    /**
     * Sets the username for this user account.
     * Username must be unique across the platform.
     * 
     * @param username The unique username
     */
    public void setUsername(String username) {
        this.username = username;
    }
    
    /**
     * Sets the encrypted password for this user account.
     * Password should be pre-hashed using BCrypt before calling this method.
     * 
     * @param password The encrypted password
     */
    public void setPassword(String password) {
        this.password = password;
    }
    
    /**
     * Gets the user's email address.
     * 
     * @return The user's email address
     */
    public String getEmail() {
        return email;
    }
    
    /**
     * Sets the user's email address.
     * Email must be unique and is used for communication and verification.
     * 
     * @param email The user's email address
     */
    public void setEmail(String email) {
        this.email = email;
    }
    
    /**
     * Sets the enabled status of the user account.
     * 
     * @param enabled true to enable the account, false to disable
     */
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
    
    /**
     * Gets the set of authorities assigned to this user.
     * 
     * @return Set of authority strings
     */
    public Set<String> getAuthoritiesAsStrings() {
        return authorities;
    }
    
    /**
     * Sets the authorities for this user account.
     * Authorities define the permissions and roles assigned to the user.
     * 
     * @param authorities Set of authority strings
     */
    public void setAuthorities(Set<String> authorities) {
        this.authorities = authorities;
    }
    
    /**
     * Provides a string representation of the User entity.
     * Excludes sensitive information like passwords for security.
     * 
     * @return String representation of the user
     */
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", enabled=" + enabled +
                ", authorities=" + authorities +
                '}';
    }
    
    /**
     * Compares this User entity with another object for equality.
     * Two users are considered equal if they have the same ID.
     * 
     * @param obj The object to compare with
     * @return true if the objects are equal, false otherwise
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        User user = (User) obj;
        return id != null ? id.equals(user.id) : user.id == null;
    }
    
    /**
     * Returns the hash code for this User entity.
     * Based on the user ID to ensure consistency with equals method.
     * 
     * @return The hash code value
     */
    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}