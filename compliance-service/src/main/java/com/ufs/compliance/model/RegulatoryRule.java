package com.ufs.compliance.model;

import jakarta.persistence.*; // Jakarta Persistence API 3.1.0
import java.time.LocalDate; // Java 8+ Time API
import java.time.LocalDateTime; // Java 8+ Time API
import lombok.Data; // Lombok 1.18.30
import lombok.NoArgsConstructor; // Lombok 1.18.30
import lombok.AllArgsConstructor; // Lombok 1.18.30

/**
 * Represents a regulatory rule or policy within the compliance framework.
 * This JPA entity maps to the 'regulatory_rules' table and stores details
 * about individual regulations that the system monitors and manages.
 * 
 * This entity is central to the F-003: Regulatory Compliance Automation feature,
 * supporting real-time regulatory change monitoring, automated policy updates,
 * and comprehensive audit trail management.
 * 
 * Key Features:
 * - Supports F-003-RQ-001: Regulatory change monitoring through lastUpdated tracking
 * - Supports F-003-RQ-002: Automated policy updates through version control
 * - Supports F-003-RQ-004: Audit trail management through versioning and timestamps
 * - Enables real-time dashboards with multi-framework mapping
 * - Facilitates 24-hour regulatory update cycle requirement
 * 
 * Database Schema:
 * - Primary table: regulatory_rules
 * - Supports PostgreSQL 16+ for ACID compliance and data integrity
 * - Optimized for high-frequency updates during regulatory changes
 * 
 * @author Unified Financial Services Platform
 * @version 1.0
 * @since 2025
 */
@Entity
@Table(name = "regulatory_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegulatoryRule {

    /**
     * Primary key for the regulatory rule entity.
     * Uses database-generated identity strategy for optimal performance
     * and compatibility with PostgreSQL sequences.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique identifier for the regulatory rule within the system.
     * This field serves as the business key and must be unique across
     * all regulatory frameworks and jurisdictions.
     * 
     * Format typically follows: [FRAMEWORK]-[JURISDICTION]-[RULE_NUMBER]
     * Examples: "BASEL-US-001", "PSD3-EU-042", "MiFID-UK-123"
     * 
     * Used for F-003-RQ-001: Regulatory change monitoring and tracking.
     */
    @Column(nullable = false, unique = true)
    private String ruleId;

    /**
     * Geographic or regulatory jurisdiction where this rule applies.
     * Supports multi-jurisdiction compliance monitoring as required
     * by F-003: Regulatory Compliance Automation.
     * 
     * Common values: "US", "EU", "UK", "APAC", "GLOBAL"
     * Enables jurisdiction-specific compliance reporting and filtering.
     */
    @Column(nullable = false)
    private String jurisdiction;

    /**
     * Regulatory framework or standard that this rule belongs to.
     * Essential for multi-framework mapping and unified risk scoring
     * as specified in F-003-RQ-001.
     * 
     * Examples: "Basel III", "Basel IV", "PSD3", "PSR", "MiFID II",
     * "GDPR", "CCPA", "SOX", "FINRA", "CRR3", "FRTB"
     * 
     * Supports the system's ability to handle complex regulatory
     * environments spanning multiple frameworks simultaneously.
     */
    @Column(nullable = false)
    private String framework;

    /**
     * Detailed description of the regulatory rule or requirement.
     * Stores the complete regulatory text and implementation guidance.
     * 
     * Uses TEXT column type to accommodate lengthy regulatory descriptions
     * and complex compliance requirements. This field supports the
     * system's ability to provide comprehensive regulatory information
     * for compliance officers and automated systems.
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Source of the regulatory rule or official publication reference.
     * Provides traceability to the original regulatory document or
     * authority that issued the rule.
     * 
     * Examples: "Federal Register Vol. 89, No. 123", "EUR-Lex 32024R0001",
     * "FCA Handbook COLL 6.12.3", "Basel Committee Paper 123"
     * 
     * Critical for audit trails and regulatory compliance verification.
     */
    private String source;

    /**
     * Date when the regulatory rule becomes effective and must be
     * implemented by financial institutions.
     * 
     * Supports automated compliance calendar generation and helps
     * identify upcoming regulatory deadlines. Essential for F-003-RQ-002:
     * Automated policy updates within the required timeframes.
     */
    private LocalDate effectiveDate;

    /**
     * Timestamp of the last update to this regulatory rule.
     * Critical for F-003-RQ-001: Regulatory change monitoring and
     * F-003-RQ-002: Automated policy updates.
     * 
     * Automatically updated when regulatory changes are detected
     * and processed by the system. Supports the 24-hour update
     * cycle requirement with 99.9% accuracy in change detection.
     * 
     * Used for:
     * - Change impact analysis
     * - Update notification triggers
     * - Compliance status reporting
     * - Audit trail generation
     */
    private LocalDateTime lastUpdated;

    /**
     * Indicates whether the regulatory rule is currently active
     * and should be enforced by compliance systems.
     * 
     * Supports lifecycle management of regulatory rules:
     * - true: Rule is active and must be monitored/enforced
     * - false: Rule is deprecated, superseded, or scheduled for retirement
     * 
     * Enables efficient filtering in compliance dashboards and
     * automated compliance checks. Critical for maintaining
     * accurate regulatory coverage without performance degradation.
     */
    private boolean isActive;

    /**
     * Version number of the regulatory rule for change tracking
     * and audit purposes. Supports F-003-RQ-004: Audit trail management.
     * 
     * Incremented automatically when regulatory changes are processed:
     * - Initial creation: version = 1
     * - Each regulatory update: version++
     * 
     * Enables:
     * - Historical change tracking
     * - Rollback capabilities for incorrect updates
     * - Compliance audit trails
     * - Impact analysis of regulatory changes
     * 
     * Essential for meeting regulatory audit requirements and
     * demonstrating compliance with change management procedures.
     */
    private int version;

    /**
     * Custom toString method for enhanced logging and debugging.
     * Provides essential information without exposing sensitive data.
     * 
     * @return String representation of the regulatory rule
     */
    @Override
    public String toString() {
        return String.format(
            "RegulatoryRule{id=%d, ruleId='%s', jurisdiction='%s', framework='%s', " +
            "effectiveDate=%s, isActive=%s, version=%d}",
            id, ruleId, jurisdiction, framework, effectiveDate, isActive, version
        );
    }

    /**
     * Determines if this regulatory rule is currently in effect.
     * A rule is considered in effect if it is active and the effective date
     * has passed or is today.
     * 
     * @return true if the rule is active and effective, false otherwise
     */
    public boolean isInEffect() {
        return isActive && effectiveDate != null && 
               (effectiveDate.isBefore(LocalDate.now()) || effectiveDate.isEqual(LocalDate.now()));
    }

    /**
     * Determines if this regulatory rule requires immediate attention
     * based on recent updates. Used by compliance dashboards for
     * highlighting recently changed regulations.
     * 
     * @return true if the rule was updated within the last 24 hours
     */
    public boolean isRecentlyUpdated() {
        return lastUpdated != null && 
               lastUpdated.isAfter(LocalDateTime.now().minusDays(1));
    }

    /**
     * Pre-persist callback to set initial values when creating a new
     * regulatory rule entity.
     */
    @PrePersist
    protected void onCreate() {
        if (lastUpdated == null) {
            lastUpdated = LocalDateTime.now();
        }
        if (version == 0) {
            version = 1;
        }
    }

    /**
     * Pre-update callback to automatically update the lastUpdated timestamp
     * and increment the version when the entity is modified.
     * 
     * This supports F-003-RQ-001 and F-003-RQ-002 by ensuring accurate
     * change tracking for regulatory monitoring and automated updates.
     */
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
        version++;
    }
}