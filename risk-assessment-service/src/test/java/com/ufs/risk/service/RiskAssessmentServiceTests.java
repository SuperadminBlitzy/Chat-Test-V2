package com.ufs.risk.service;

import static org.assertj.core.api.Assertions.assertThat; // version 3.25.3
import static org.mockito.ArgumentMatchers.any; // version 5.7.0
import static org.mockito.ArgumentMatchers.anyString; // version 5.7.0
import static org.mockito.ArgumentMatchers.eq; // version 5.7.0
import static org.mockito.Mockito.verify; // version 5.7.0
import static org.mockito.Mockito.when; // version 5.7.0
import static org.mockito.Mockito.times; // version 5.7.0
import static org.mockito.Mockito.never; // version 5.7.0
import static org.mockito.Mockito.doNothing; // version 5.7.0
import static org.mockito.Mockito.doThrow; // version 5.7.0
import static org.mockito.Mockito.verifyNoInteractions; // version 5.7.0
import static org.mockito.Mockito.verifyNoMoreInteractions; // version 5.7.0

import org.junit.jupiter.api.Test; // version 5.10.2
import org.junit.jupiter.api.BeforeEach; // version 5.10.2
import org.junit.jupiter.api.DisplayName; // version 5.10.2
import org.junit.jupiter.api.Nested; // version 5.10.2
import org.junit.jupiter.api.extension.ExtendWith; // version 5.10.2
import org.mockito.InjectMocks; // version 5.7.0
import org.mockito.Mock; // version 5.7.0
import org.mockito.junit.jupiter.MockitoExtension; // version 5.7.0
import org.mockito.ArgumentCaptor; // version 5.7.0
import org.mockito.Captor; // version 5.7.0
import org.springframework.kafka.core.KafkaTemplate; // version 3.2.0
import org.springframework.kafka.support.SendResult; // version 3.2.0

import com.ufs.risk.service.impl.RiskAssessmentServiceImpl;
import com.ufs.risk.dto.RiskAssessmentRequest;
import com.ufs.risk.dto.RiskAssessmentResponse;
import com.ufs.risk.dto.FraudDetectionRequest;
import com.ufs.risk.dto.FraudDetectionResponse;
import com.ufs.risk.model.RiskProfile;
import com.ufs.risk.model.RiskScore;
import com.ufs.risk.model.RiskFactor;
import com.ufs.risk.repository.RiskProfileRepository;
import com.ufs.risk.repository.RiskScoreRepository;
import com.ufs.risk.repository.RiskFactorRepository;
import com.ufs.risk.service.FraudDetectionService;
import com.ufs.risk.event.RiskAssessmentEvent;
import com.ufs.risk.exception.RiskAssessmentException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * Comprehensive unit tests for the RiskAssessmentServiceImpl class.
 * 
 * This test suite validates the AI-Powered Risk Assessment Engine (F-002) implementation,
 * ensuring compliance with all functional requirements including real-time risk scoring,
 * predictive risk modeling, and explainable AI capabilities.
 * 
 * Test Coverage Areas:
 * - Real-time risk scoring with sub-500ms response time validation
 * - Predictive risk modeling for different customer risk profiles
 * - AI model integration and fraud detection service integration
 * - Event-driven architecture with Kafka message publishing
 * - Data persistence and repository interaction patterns
 * - Error handling and exception management scenarios
 * - Business logic validation for risk categorization
 * - Comprehensive audit trail and compliance requirements
 * 
 * Performance Requirements Tested:
 * - F-002-RQ-001: Real-time risk scoring (<500ms response time)
 * - F-002-RQ-002: Predictive risk modeling accuracy and effectiveness
 * - F-002-RQ-003: Model explainability and transparency features
 * - F-002-RQ-004: Bias detection and algorithmic fairness validation
 * 
 * Technical Architecture Validation:
 * - Microservices architecture with proper dependency injection
 * - Event-driven processing through Kafka integration
 * - Database persistence layer with transactional consistency
 * - External service integration with fault tolerance
 * - Security and compliance with audit trail generation
 * 
 * @author UFS Risk Assessment Team
 * @version 1.0
 * @since 2025-01-01
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Risk Assessment Service Implementation Tests")
class RiskAssessmentServiceTests {

    // Service under test with dependency injection
    @InjectMocks
    private RiskAssessmentServiceImpl riskAssessmentService;

    // Repository dependencies for data access layer
    @Mock
    private RiskProfileRepository riskProfileRepository;

    @Mock
    private RiskScoreRepository riskScoreRepository;

    @Mock
    private RiskFactorRepository riskFactorRepository;

    // External service dependencies
    @Mock
    private FraudDetectionService fraudDetectionService;

    // Event streaming infrastructure
    @Mock
    private KafkaTemplate<String, RiskAssessmentEvent> kafkaTemplate;

    // Argument captors for verification of method calls
    @Captor
    private ArgumentCaptor<RiskProfile> riskProfileCaptor;

    @Captor
    private ArgumentCaptor<RiskScore> riskScoreCaptor;

    @Captor
    private ArgumentCaptor<List<RiskFactor>> riskFactorListCaptor;

    @Captor
    private ArgumentCaptor<RiskAssessmentEvent> riskAssessmentEventCaptor;

    @Captor
    private ArgumentCaptor<String> kafkaTopicCaptor;

    @Captor
    private ArgumentCaptor<String> kafkaKeyCaptor;

    // Test data constants and configuration
    private static final String TEST_CUSTOMER_ID = "CUST-12345678";
    private static final String TEST_ASSESSMENT_ID = "ASSESS-87654321";
    private static final String KAFKA_TOPIC_RISK_EVENTS = "risk-assessment-events";
    private static final Long TEST_RISK_PROFILE_ID = 1L;
    private static final Long TEST_RISK_SCORE_ID = 100L;

    // Risk score thresholds for testing different scenarios
    private static final double LOW_RISK_SCORE = 150.0;
    private static final double MEDIUM_RISK_SCORE = 400.0;
    private static final double HIGH_RISK_SCORE = 800.0;

    // Test data setup and initialization
    private RiskAssessmentRequest testRequest;
    private RiskProfile existingLowRiskProfile;
    private RiskProfile existingMediumRiskProfile;
    private RiskProfile existingHighRiskProfile;
    private List<RiskFactor> existingRiskFactors;

    /**
     * Initialize test data and common mock configurations before each test.
     * 
     * This setup method prepares comprehensive test data that represents realistic
     * scenarios for the AI-Powered Risk Assessment Engine, including customer profiles
     * with different risk levels, transaction histories, and external risk factors.
     */
    @BeforeEach
    void setUp() {
        // Initialize comprehensive test request with realistic transaction data
        testRequest = createTestRiskAssessmentRequest();
        
        // Create test risk profiles for different risk scenarios
        existingLowRiskProfile = createTestRiskProfile(TEST_CUSTOMER_ID, LOW_RISK_SCORE, "LOW");
        existingMediumRiskProfile = createTestRiskProfile(TEST_CUSTOMER_ID, MEDIUM_RISK_SCORE, "MEDIUM");
        existingHighRiskProfile = createTestRiskProfile(TEST_CUSTOMER_ID, HIGH_RISK_SCORE, "HIGH");
        
        // Initialize existing risk factors for comprehensive analysis
        existingRiskFactors = createTestRiskFactors();
        
        // Configure common Kafka template behavior for event publishing
        when(kafkaTemplate.send(anyString(), anyString(), any(RiskAssessmentEvent.class)))
            .thenReturn(CompletableFuture.completedFuture(null));
    }

    /**
     * Test suite for low-risk customer profile scenarios.
     * 
     * Validates the AI-Powered Risk Assessment Engine's ability to correctly
     * identify and process low-risk customers, ensuring appropriate risk scores,
     * categories, and mitigation recommendations are generated.
     */
    @Nested
    @DisplayName("Low Risk Profile Assessment Tests")
    class LowRiskProfileTests {

        /**
         * Test the risk assessment for a low-risk customer profile.
         * 
         * This test validates F-002-RQ-001 (real-time risk scoring) and F-002-RQ-002
         * (predictive risk modeling) by ensuring the AI engine correctly identifies
         * low-risk customers and generates appropriate assessment results.
         * 
         * Expected Behavior:
         * - Retrieve existing low-risk customer profile from repository
         * - Perform AI analysis with behavioral pattern recognition
         * - Execute fraud detection integration for comprehensive assessment
         * - Calculate risk score within LOW category range (0-200)
         * - Generate appropriate mitigation recommendations for low-risk scenario
         * - Persist risk assessment results to database
         * - Publish risk assessment event to Kafka for downstream processing
         * 
         * Performance Validation:
         * - Ensure sub-500ms response time for real-time assessment requirements
         * - Validate efficient repository access patterns
         * - Confirm optimal AI model inference execution
         */
        @Test
        @DisplayName("Should return low risk score for low-risk customer profile")
        void testAssessRisk_whenLowRiskProfile_shouldReturnLowRiskScore() {
            // Arrange: Set up low-risk scenario with comprehensive test data
            when(riskProfileRepository.findByCustomerId(TEST_CUSTOMER_ID))
                .thenReturn(Optional.of(existingLowRiskProfile));
            
            when(riskFactorRepository.findByRiskProfile(existingLowRiskProfile))
                .thenReturn(existingRiskFactors);
            
            // Configure fraud detection service to return low-risk response
            FraudDetectionResponse lowRiskFraudResponse = createFraudDetectionResponse(
                BigDecimal.valueOf(100), "LOW", "APPROVE", BigDecimal.valueOf(0.85),
                Arrays.asList("Transaction pattern consistent with customer history", 
                             "Low-risk merchant category", "Recognized device and location"));
            when(fraudDetectionService.detectFraud(any(FraudDetectionRequest.class)))
                .thenReturn(lowRiskFraudResponse);
            
            // Configure repository save operations for result persistence
            RiskScore savedRiskScore = createTestRiskScore(LOW_RISK_SCORE, "LOW");
            when(riskScoreRepository.save(any(RiskScore.class))).thenReturn(savedRiskScore);
            when(riskProfileRepository.save(any(RiskProfile.class))).thenReturn(existingLowRiskProfile);
            when(riskFactorRepository.save(any(RiskFactor.class))).thenReturn(new RiskFactor());

            // Act: Execute risk assessment with performance timing
            long startTime = System.currentTimeMillis();
            RiskAssessmentResponse response = riskAssessmentService.assessRisk(testRequest);
            long executionTime = System.currentTimeMillis() - startTime;

            // Assert: Validate comprehensive risk assessment results
            assertThat(response).isNotNull();
            assertThat(response.getAssessmentId()).isNotBlank();
            assertThat(response.getRiskScore()).isNotNull();
            assertThat(response.getRiskScore().doubleValue()).isBetween(0.0, 200.0);
            assertThat(response.getRiskCategory()).isEqualTo("LOW");
            assertThat(response.getConfidenceInterval()).isNotNull();
            assertThat(response.getConfidenceInterval().doubleValue()).isGreaterThan(60.0);
            assertThat(response.getMitigationRecommendations()).isNotEmpty();
            assertThat(response.getMitigationRecommendations()).contains("Continue standard monitoring procedures");
            assertThat(response.getAssessmentTimestamp()).isNotNull();
            assertThat(response.isHighRisk()).isFalse();
            assertThat(response.requiresManualReview()).isFalse();

            // Validate performance requirements (F-002-RQ-001: <500ms response time)
            assertThat(executionTime).isLessThan(500L);

            // Verify repository interactions for data consistency
            verify(riskProfileRepository).findByCustomerId(TEST_CUSTOMER_ID);
            verify(riskFactorRepository).findByRiskProfile(existingLowRiskProfile);
            verify(riskScoreRepository).save(riskScoreCaptor.capture());
            verify(riskProfileRepository).save(riskProfileCaptor.capture());
            verify(fraudDetectionService).detectFraud(any(FraudDetectionRequest.class));

            // Validate saved risk score data integrity
            RiskScore capturedRiskScore = riskScoreCaptor.getValue();
            assertThat(capturedRiskScore.getScore()).isBetween(0, 200);
            assertThat(capturedRiskScore.getCategory()).isEqualTo("LOW");
            assertThat(capturedRiskScore.getRiskProfileId()).isEqualTo(TEST_RISK_PROFILE_ID);

            // Validate updated risk profile information
            RiskProfile capturedProfile = riskProfileCaptor.getValue();
            assertThat(capturedProfile.getCurrentRiskScore()).isBetween(0.0, 200.0);
            assertThat(capturedProfile.getRiskCategory()).isEqualTo("LOW");
            assertThat(capturedProfile.getLastAssessedAt()).isNotNull();

            // Verify Kafka event publication for downstream processing
            verify(kafkaTemplate).send(eq(KAFKA_TOPIC_RISK_EVENTS), anyString(), riskAssessmentEventCaptor.capture());
            
            RiskAssessmentEvent capturedEvent = riskAssessmentEventCaptor.getValue();
            assertThat(capturedEvent.getEventId()).isNotNull();
            assertThat(capturedEvent.getTimestamp()).isNotNull();
            assertThat(capturedEvent.getRiskAssessmentRequest()).isEqualTo(testRequest);
            assertThat(capturedEvent.getCustomerId()).isEqualTo(TEST_CUSTOMER_ID);
            assertThat(capturedEvent.getPriorityLevel()).isEqualTo("NORMAL");
            assertThat(capturedEvent.hasValidDataQuality()).isTrue();
        }
    }

    /**
     * Test suite for medium-risk customer profile scenarios.
     * 
     * Validates the AI engine's capability to identify moderate risk scenarios
     * and apply appropriate risk management strategies including enhanced monitoring
     * and additional verification requirements.
     */
    @Nested
    @DisplayName("Medium Risk Profile Assessment Tests")
    class MediumRiskProfileTests {

        /**
         * Test the risk assessment for a medium-risk customer profile.
         * 
         * This test ensures the AI-Powered Risk Assessment Engine correctly handles
         * medium-risk scenarios with appropriate escalation procedures and enhanced
         * monitoring recommendations as required by business risk management policies.
         * 
         * Expected Behavior:
         * - Identify medium-risk customer profile characteristics
         * - Apply enhanced AI analysis with additional risk factor evaluation
         * - Generate risk score within MEDIUM category range (201-500)
         * - Recommend enhanced monitoring and periodic reassessment
         * - Trigger appropriate workflow escalations for risk management
         */
        @Test
        @DisplayName("Should return medium risk score for medium-risk customer profile")
        void testAssessRisk_whenMediumRiskProfile_shouldReturnMediumRiskScore() {
            // Arrange: Configure medium-risk scenario with enhanced risk factors
            when(riskProfileRepository.findByCustomerId(TEST_CUSTOMER_ID))
                .thenReturn(Optional.of(existingMediumRiskProfile));
            
            when(riskFactorRepository.findByRiskProfile(existingMediumRiskProfile))
                .thenReturn(createMediumRiskFactors());
            
            // Configure fraud detection for medium-risk assessment
            FraudDetectionResponse mediumRiskFraudResponse = createFraudDetectionResponse(
                BigDecimal.valueOf(350), "MEDIUM", "REVIEW", BigDecimal.valueOf(0.72),
                Arrays.asList("Moderate transaction velocity increase detected",
                             "Transaction amount above customer average",
                             "New merchant interaction requiring verification"));
            when(fraudDetectionService.detectFraud(any(FraudDetectionRequest.class)))
                .thenReturn(mediumRiskFraudResponse);
            
            // Configure repository operations for medium-risk persistence
            RiskScore savedRiskScore = createTestRiskScore(MEDIUM_RISK_SCORE, "MEDIUM");
            when(riskScoreRepository.save(any(RiskScore.class))).thenReturn(savedRiskScore);
            when(riskProfileRepository.save(any(RiskProfile.class))).thenReturn(existingMediumRiskProfile);
            when(riskFactorRepository.save(any(RiskFactor.class))).thenReturn(new RiskFactor());

            // Act: Execute medium-risk assessment
            RiskAssessmentResponse response = riskAssessmentService.assessRisk(testRequest);

            // Assert: Validate medium-risk assessment results
            assertThat(response).isNotNull();
            assertThat(response.getRiskScore().doubleValue()).isBetween(201.0, 500.0);
            assertThat(response.getRiskCategory()).isEqualTo("MEDIUM");
            assertThat(response.getMitigationRecommendations()).isNotEmpty();
            assertThat(response.getMitigationRecommendations())
                .contains("Apply enhanced transaction monitoring")
                .contains("Consider periodic risk reassessment");
            assertThat(response.isHighRisk()).isFalse();
            assertThat(response.requiresManualReview()).isFalse();

            // Verify enhanced risk factor processing for medium-risk scenarios
            verify(riskFactorRepository, times(4)).save(any(RiskFactor.class));
            
            // Validate Kafka event priority for medium-risk processing
            verify(kafkaTemplate).send(eq(KAFKA_TOPIC_RISK_EVENTS), anyString(), riskAssessmentEventCaptor.capture());
            RiskAssessmentEvent event = riskAssessmentEventCaptor.getValue();
            assertThat(event.getPriorityLevel()).isEqualTo("NORMAL");
        }
    }

    /**
     * Test suite for high-risk customer profile scenarios.
     * 
     * Validates the AI engine's ability to identify high-risk situations and
     * trigger appropriate escalation procedures including manual review requirements
     * and enhanced due diligence processes.
     */
    @Nested
    @DisplayName("High Risk Profile Assessment Tests")
    class HighRiskProfileTests {

        /**
         * Test the risk assessment for a high-risk customer profile.
         * 
         * This test validates the AI engine's capability to handle high-risk scenarios
         * with appropriate escalation to manual review processes and implementation
         * of enhanced due diligence procedures as required by regulatory compliance.
         * 
         * Expected Behavior:
         * - Detect high-risk customer profile characteristics
         * - Trigger enhanced AI analysis with comprehensive risk factor evaluation
         * - Generate risk score within HIGH category range (501-750) or CRITICAL (751-1000)
         * - Recommend manual review and enhanced due diligence procedures
         * - Publish high-priority events for immediate risk management attention
         */
        @Test
        @DisplayName("Should return high risk score for high-risk customer profile")
        void testAssessRisk_whenHighRiskProfile_shouldReturnHighRiskScore() {
            // Arrange: Configure high-risk scenario with comprehensive risk factors
            when(riskProfileRepository.findByCustomerId(TEST_CUSTOMER_ID))
                .thenReturn(Optional.of(existingHighRiskProfile));
            
            when(riskFactorRepository.findByRiskProfile(existingHighRiskProfile))
                .thenReturn(createHighRiskFactors());
            
            // Configure fraud detection for high-risk assessment
            FraudDetectionResponse highRiskFraudResponse = createFraudDetectionResponse(
                BigDecimal.valueOf(750), "HIGH", "BLOCK", BigDecimal.valueOf(0.91),
                Arrays.asList("Suspicious transaction pattern detected",
                             "High-velocity transaction activity",
                             "Geographic anomaly - transaction from unusual location",
                             "Device fingerprint not recognized",
                             "Amount significantly exceeds customer profile"));
            when(fraudDetectionService.detectFraud(any(FraudDetectionRequest.class)))
                .thenReturn(highRiskFraudResponse);
            
            // Configure repository operations for high-risk persistence
            RiskScore savedRiskScore = createTestRiskScore(HIGH_RISK_SCORE, "HIGH");
            when(riskScoreRepository.save(any(RiskScore.class))).thenReturn(savedRiskScore);
            when(riskProfileRepository.save(any(RiskProfile.class))).thenReturn(existingHighRiskProfile);
            when(riskFactorRepository.save(any(RiskFactor.class))).thenReturn(new RiskFactor());

            // Act: Execute high-risk assessment
            RiskAssessmentResponse response = riskAssessmentService.assessRisk(testRequest);

            // Assert: Validate high-risk assessment results and escalation procedures
            assertThat(response).isNotNull();
            assertThat(response.getRiskScore().doubleValue()).isGreaterThan(500.0);
            assertThat(response.getRiskCategory()).isIn("HIGH", "CRITICAL");
            assertThat(response.getMitigationRecommendations()).isNotEmpty();
            assertThat(response.getMitigationRecommendations())
                .contains("Implement enhanced due diligence procedures")
                .contains("Require manual review for high-value transactions");
            assertThat(response.isHighRisk()).isTrue();
            
            // Validate manual review requirement for high-risk scenarios
            if (response.getRiskScore().doubleValue() > 750.0) {
                assertThat(response.requiresManualReview()).isTrue();
                assertThat(response.getRiskCategory()).isEqualTo("CRITICAL");
                assertThat(response.getMitigationRecommendations())
                    .contains("Consider additional identity verification measures");
            }

            // Verify comprehensive risk factor analysis for high-risk scenarios
            verify(riskFactorRepository, times(4)).save(any(RiskFactor.class));
            
            // Validate high-priority Kafka event publication
            verify(kafkaTemplate).send(eq(KAFKA_TOPIC_RISK_EVENTS), anyString(), riskAssessmentEventCaptor.capture());
            RiskAssessmentEvent event = riskAssessmentEventCaptor.getValue();
            assertThat(event.getPriorityLevel()).isEqualTo("HIGH");
            assertThat(event.getMetadata()).containsKeys(
                "final_risk_score", "risk_category", "confidence_level", 
                "requires_manual_review", "recommendation_count");
        }
    }

    /**
     * Test suite for new customer onboarding scenarios.
     * 
     * Validates the AI engine's capability to handle new customers without existing
     * risk profiles, including profile creation, initial risk assessment, and
     * integration with customer onboarding workflows.
     */
    @Nested
    @DisplayName("New Customer Assessment Tests")
    class NewCustomerTests {

        /**
         * Test the risk assessment for a new customer without existing profile.
         * 
         * This test validates F-004 (Digital Customer Onboarding) integration and
         * ensures new customers receive appropriate risk assessment during the
         * onboarding process without existing historical data.
         * 
         * Expected Behavior:
         * - Detect absence of existing risk profile for customer
         * - Create new risk profile with default initialization
         * - Perform initial AI risk assessment with available data
         * - Generate baseline risk score and category assignment
         * - Establish initial monitoring and assessment schedule
         * - Persist new customer risk profile and initial assessment
         */
        @Test
        @DisplayName("Should create profile and return risk score for new customer")
        void testAssessRisk_whenNewCustomer_shouldCreateProfileAndReturnScore() {
            // Arrange: Configure new customer scenario with no existing profile
            when(riskProfileRepository.findByCustomerId(TEST_CUSTOMER_ID))
                .thenReturn(Optional.empty());
            
            // Configure repository to simulate new profile creation
            RiskProfile newRiskProfile = RiskProfile.builder()
                .id(TEST_RISK_PROFILE_ID)
                .customerId(TEST_CUSTOMER_ID)
                .currentRiskScore(0.0)
                .riskCategory("UNKNOWN")
                .riskScores(new ArrayList<>())
                .createdAt(new Date())
                .build();
            
            when(riskProfileRepository.save(any(RiskProfile.class))).thenReturn(newRiskProfile);
            when(riskFactorRepository.findByRiskProfile(any(RiskProfile.class))).thenReturn(new ArrayList<>());
            
            // Configure fraud detection for new customer assessment
            FraudDetectionResponse newCustomerFraudResponse = createFraudDetectionResponse(
                BigDecimal.valueOf(250), "MEDIUM", "REVIEW", BigDecimal.valueOf(0.65),
                Arrays.asList("New customer profile - limited transaction history",
                             "Initial identity verification completed",
                             "Baseline behavioral pattern establishment required"));
            when(fraudDetectionService.detectFraud(any(FraudDetectionRequest.class)))
                .thenReturn(newCustomerFraudResponse);
            
            // Configure risk score persistence for new customer
            RiskScore newCustomerRiskScore = createTestRiskScore(MEDIUM_RISK_SCORE, "MEDIUM");
            when(riskScoreRepository.save(any(RiskScore.class))).thenReturn(newCustomerRiskScore);
            when(riskFactorRepository.save(any(RiskFactor.class))).thenReturn(new RiskFactor());

            // Act: Execute new customer risk assessment
            RiskAssessmentResponse response = riskAssessmentService.assessRisk(testRequest);

            // Assert: Validate new customer assessment results and profile creation
            assertThat(response).isNotNull();
            assertThat(response.getAssessmentId()).isNotBlank();
            assertThat(response.getRiskScore()).isNotNull();
            assertThat(response.getRiskScore().doubleValue()).isBetween(0.0, 1000.0);
            assertThat(response.getRiskCategory()).isIn("LOW", "MEDIUM", "HIGH", "CRITICAL");
            assertThat(response.getConfidenceInterval()).isNotNull();
            assertThat(response.getMitigationRecommendations()).isNotEmpty();
            assertThat(response.getAssessmentTimestamp()).isNotNull();

            // Verify new risk profile creation process
            verify(riskProfileRepository).findByCustomerId(TEST_CUSTOMER_ID);
            verify(riskProfileRepository, times(2)).save(riskProfileCaptor.capture());
            
            // Validate initial profile creation with proper defaults
            List<RiskProfile> savedProfiles = riskProfileCaptor.getAllValues();
            RiskProfile initialProfile = savedProfiles.get(0);
            assertThat(initialProfile.getCustomerId()).isEqualTo(TEST_CUSTOMER_ID);
            assertThat(initialProfile.getCurrentRiskScore()).isEqualTo(0.0);
            assertThat(initialProfile.getRiskCategory()).isEqualTo("UNKNOWN");
            
            // Validate updated profile after assessment
            RiskProfile updatedProfile = savedProfiles.get(1);
            assertThat(updatedProfile.getCurrentRiskScore()).isGreaterThan(0.0);
            assertThat(updatedProfile.getRiskCategory()).isNotEqualTo("UNKNOWN");
            assertThat(updatedProfile.getLastAssessedAt()).isNotNull();

            // Verify risk score persistence for new customer
            verify(riskScoreRepository).save(riskScoreCaptor.capture());
            RiskScore savedScore = riskScoreCaptor.getValue();
            assertThat(savedScore.getRiskProfileId()).isEqualTo(TEST_RISK_PROFILE_ID);
            assertThat(savedScore.getScore()).isGreaterThan(0);
            assertThat(savedScore.getCategory()).isNotBlank();
            assertThat(savedScore.getAssessmentDate()).isNotNull();

            // Verify fraud detection integration for new customer
            verify(fraudDetectionService).detectFraud(any(FraudDetectionRequest.class));

            // Verify risk factor creation for new customer baseline
            verify(riskFactorRepository, times(4)).save(any(RiskFactor.class));

            // Verify Kafka event publication for new customer onboarding
            verify(kafkaTemplate).send(eq(KAFKA_TOPIC_RISK_EVENTS), anyString(), riskAssessmentEventCaptor.capture());
            
            RiskAssessmentEvent capturedEvent = riskAssessmentEventCaptor.getValue();
            assertThat(capturedEvent.getCustomerId()).isEqualTo(TEST_CUSTOMER_ID);
            assertThat(capturedEvent.getMetadata()).containsKey("customer_id_hash");
            assertThat(capturedEvent.hasValidDataQuality()).isTrue();
        }
    }

    /**
     * Test suite for error handling and exception scenarios.
     * 
     * Validates the service's resilience and proper error handling when facing
     * various failure conditions including external service unavailability,
     * data quality issues, and system resource constraints.
     */
    @Nested
    @DisplayName("Error Handling and Exception Tests")
    class ErrorHandlingTests {

        /**
         * Test error handling when fraud detection service is unavailable.
         * 
         * Validates the service's resilience to external service failures and
         * ensures proper exception handling with meaningful error messages.
         */
        @Test
        @DisplayName("Should handle fraud detection service failure gracefully")
        void testAssessRisk_whenFraudDetectionServiceFails_shouldThrowRiskAssessmentException() {
            // Arrange: Configure scenario with fraud detection service failure
            when(riskProfileRepository.findByCustomerId(TEST_CUSTOMER_ID))
                .thenReturn(Optional.of(existingLowRiskProfile));
            when(riskFactorRepository.findByRiskProfile(existingLowRiskProfile))
                .thenReturn(existingRiskFactors);
            
            // Simulate fraud detection service failure
            when(fraudDetectionService.detectFraud(any(FraudDetectionRequest.class)))
                .thenThrow(new RuntimeException("Fraud detection service temporarily unavailable"));

            // Act & Assert: Validate proper exception handling
            try {
                riskAssessmentService.assessRisk(testRequest);
            } catch (RiskAssessmentException e) {
                assertThat(e.getMessage()).contains("Risk assessment failed for customer");
                assertThat(e.getCause()).isInstanceOf(RuntimeException.class);
                assertThat(e.getCause().getMessage()).contains("Fraud detection service temporarily unavailable");
            }

            // Verify that repository interactions occurred before failure
            verify(riskProfileRepository).findByCustomerId(TEST_CUSTOMER_ID);
            verify(riskFactorRepository).findByRiskProfile(existingLowRiskProfile);
            verify(fraudDetectionService).detectFraud(any(FraudDetectionRequest.class));
            
            // Verify that no persistence operations occurred after failure
            verify(riskScoreRepository, never()).save(any(RiskScore.class));
            verify(kafkaTemplate, never()).send(anyString(), anyString(), any(RiskAssessmentEvent.class));
        }

        /**
         * Test error handling for invalid request data.
         * 
         * Validates input validation and proper exception handling for
         * malformed or incomplete risk assessment requests.
         */
        @Test
        @DisplayName("Should handle invalid request data appropriately")
        void testAssessRisk_whenInvalidRequestData_shouldHandleGracefully() {
            // Arrange: Create invalid request with missing required data
            RiskAssessmentRequest invalidRequest = new RiskAssessmentRequest();
            invalidRequest.setCustomerId(""); // Invalid empty customer ID
            invalidRequest.setTransactionHistory(new ArrayList<>()); // Empty transaction history

            // Act & Assert: Validate proper handling of invalid request
            try {
                riskAssessmentService.assessRisk(invalidRequest);
            } catch (RiskAssessmentException e) {
                assertThat(e.getMessage()).contains("Risk assessment failed");
            }

            // Verify no repository interactions for invalid request
            verifyNoInteractions(riskProfileRepository);
            verifyNoInteractions(riskFactorRepository);
            verifyNoInteractions(riskScoreRepository);
            verifyNoInteractions(fraudDetectionService);
        }

        /**
         * Test error handling for database persistence failures.
         * 
         * Validates proper exception handling when database operations fail
         * and ensures data consistency is maintained.
         */
        @Test
        @DisplayName("Should handle database persistence failures appropriately")
        void testAssessRisk_whenDatabasePersistenceFails_shouldThrowRiskAssessmentException() {
            // Arrange: Configure scenario with database persistence failure
            when(riskProfileRepository.findByCustomerId(TEST_CUSTOMER_ID))
                .thenReturn(Optional.of(existingLowRiskProfile));
            when(riskFactorRepository.findByRiskProfile(existingLowRiskProfile))
                .thenReturn(existingRiskFactors);
            
            FraudDetectionResponse fraudResponse = createFraudDetectionResponse(
                BigDecimal.valueOf(100), "LOW", "APPROVE", BigDecimal.valueOf(0.85),
                Arrays.asList("Normal transaction pattern"));
            when(fraudDetectionService.detectFraud(any(FraudDetectionRequest.class)))
                .thenReturn(fraudResponse);
            
            // Simulate database persistence failure
            when(riskScoreRepository.save(any(RiskScore.class)))
                .thenThrow(new RuntimeException("Database connection lost"));

            // Act & Assert: Validate proper exception handling for persistence failure
            try {
                riskAssessmentService.assessRisk(testRequest);
            } catch (RiskAssessmentException e) {
                assertThat(e.getMessage()).contains("Risk assessment failed for customer");
                assertThat(e.getCause()).isInstanceOf(RuntimeException.class);
            }

            // Verify that analysis operations completed before persistence failure
            verify(riskProfileRepository).findByCustomerId(TEST_CUSTOMER_ID);
            verify(fraudDetectionService).detectFraud(any(FraudDetectionRequest.class));
            verify(riskScoreRepository).save(any(RiskScore.class));
        }
    }

    /**
     * Test suite for Kafka event publishing functionality.
     * 
     * Validates the event-driven architecture integration and ensures proper
     * event publishing for downstream processing systems.
     */
    @Nested
    @DisplayName("Kafka Event Publishing Tests")
    class KafkaEventPublishingTests {

        /**
         * Test successful Kafka event publishing for risk assessment events.
         * 
         * Validates that risk assessment events are properly formatted and
         * published to the correct Kafka topic for downstream processing.
         */
        @Test
        @DisplayName("Should publish risk assessment event to Kafka successfully")
        void testAssessRisk_shouldPublishKafkaEventSuccessfully() {
            // Arrange: Configure successful assessment scenario
            when(riskProfileRepository.findByCustomerId(TEST_CUSTOMER_ID))
                .thenReturn(Optional.of(existingLowRiskProfile));
            when(riskFactorRepository.findByRiskProfile(existingLowRiskProfile))
                .thenReturn(existingRiskFactors);
            
            FraudDetectionResponse fraudResponse = createFraudDetectionResponse(
                BigDecimal.valueOf(150), "LOW", "APPROVE", BigDecimal.valueOf(0.88),
                Arrays.asList("Standard transaction pattern"));
            when(fraudDetectionService.detectFraud(any(FraudDetectionRequest.class)))
                .thenReturn(fraudResponse);
            
            when(riskScoreRepository.save(any(RiskScore.class)))
                .thenReturn(createTestRiskScore(LOW_RISK_SCORE, "LOW"));
            when(riskProfileRepository.save(any(RiskProfile.class)))
                .thenReturn(existingLowRiskProfile);
            when(riskFactorRepository.save(any(RiskFactor.class)))
                .thenReturn(new RiskFactor());
            
            // Configure successful Kafka publishing
            CompletableFuture<SendResult<String, RiskAssessmentEvent>> futureResult = 
                CompletableFuture.completedFuture(null);
            when(kafkaTemplate.send(anyString(), anyString(), any(RiskAssessmentEvent.class)))
                .thenReturn(futureResult);

            // Act: Execute assessment with Kafka event publishing
            RiskAssessmentResponse response = riskAssessmentService.assessRisk(testRequest);

            // Assert: Validate Kafka event publishing
            assertThat(response).isNotNull();
            
            verify(kafkaTemplate).send(kafkaTopicCaptor.capture(), kafkaKeyCaptor.capture(), 
                                     riskAssessmentEventCaptor.capture());
            
            // Validate Kafka topic and message key
            assertThat(kafkaTopicCaptor.getValue()).isEqualTo(KAFKA_TOPIC_RISK_EVENTS);
            assertThat(kafkaKeyCaptor.getValue()).contains("customer:");
            
            // Validate Kafka event content and structure
            RiskAssessmentEvent publishedEvent = riskAssessmentEventCaptor.getValue();
            assertThat(publishedEvent.getEventId()).isNotNull();
            assertThat(publishedEvent.getTimestamp()).isNotNull();
            assertThat(publishedEvent.getRiskAssessmentRequest()).isEqualTo(testRequest);
            assertThat(publishedEvent.getCustomerId()).isEqualTo(TEST_CUSTOMER_ID);
            assertThat(publishedEvent.getCorrelationId()).isNotNull();
            assertThat(publishedEvent.getPriorityLevel()).isIn("LOW", "NORMAL", "HIGH", "CRITICAL");
            assertThat(publishedEvent.hasValidDataQuality()).isTrue();
            
            // Validate event metadata for downstream processing
            assertThat(publishedEvent.getMetadata()).isNotEmpty();
            assertThat(publishedEvent.getMetadata()).containsKeys(
                "final_risk_score", "risk_category", "confidence_level");
        }

        /**
         * Test Kafka event publishing failure handling.
         * 
         * Validates that Kafka publishing failures don't affect the main
         * risk assessment process and are handled gracefully.
         */
        @Test
        @DisplayName("Should handle Kafka publishing failure gracefully")
        void testAssessRisk_whenKafkaPublishingFails_shouldNotAffectAssessment() {
            // Arrange: Configure assessment with Kafka publishing failure
            when(riskProfileRepository.findByCustomerId(TEST_CUSTOMER_ID))
                .thenReturn(Optional.of(existingLowRiskProfile));
            when(riskFactorRepository.findByRiskProfile(existingLowRiskProfile))
                .thenReturn(existingRiskFactors);
            
            FraudDetectionResponse fraudResponse = createFraudDetectionResponse(
                BigDecimal.valueOf(180), "LOW", "APPROVE", BigDecimal.valueOf(0.82),
                Arrays.asList("Normal pattern"));
            when(fraudDetectionService.detectFraud(any(FraudDetectionRequest.class)))
                .thenReturn(fraudResponse);
            
            when(riskScoreRepository.save(any(RiskScore.class)))
                .thenReturn(createTestRiskScore(LOW_RISK_SCORE, "LOW"));
            when(riskProfileRepository.save(any(RiskProfile.class)))
                .thenReturn(existingLowRiskProfile);
            when(riskFactorRepository.save(any(RiskFactor.class)))
                .thenReturn(new RiskFactor());
            
            // Simulate Kafka publishing failure
            CompletableFuture<SendResult<String, RiskAssessmentEvent>> failedFuture = 
                CompletableFuture.failedFuture(new RuntimeException("Kafka broker unavailable"));
            when(kafkaTemplate.send(anyString(), anyString(), any(RiskAssessmentEvent.class)))
                .thenReturn(failedFuture);

            // Act: Execute assessment despite Kafka failure
            RiskAssessmentResponse response = riskAssessmentService.assessRisk(testRequest);

            // Assert: Validate that assessment completed successfully despite Kafka failure
            assertThat(response).isNotNull();
            assertThat(response.getRiskScore()).isNotNull();
            assertThat(response.getRiskCategory()).isEqualTo("LOW");
            
            // Verify that all core operations completed successfully
            verify(riskProfileRepository).findByCustomerId(TEST_CUSTOMER_ID);
            verify(fraudDetectionService).detectFraud(any(FraudDetectionRequest.class));
            verify(riskScoreRepository).save(any(RiskScore.class));
            verify(riskProfileRepository).save(any(RiskProfile.class));
            
            // Verify Kafka publishing was attempted but failure didn't propagate
            verify(kafkaTemplate).send(anyString(), anyString(), any(RiskAssessmentEvent.class));
        }
    }

    // ==================== Helper Methods for Test Data Creation ====================

    /**
     * Creates a comprehensive test risk assessment request with realistic data.
     * 
     * @return Fully populated RiskAssessmentRequest for testing scenarios
     */
    private RiskAssessmentRequest createTestRiskAssessmentRequest() {
        RiskAssessmentRequest request = new RiskAssessmentRequest();
        request.setCustomerId(TEST_CUSTOMER_ID);
        request.setTransactionHistory(createTestTransactionHistory());
        request.setMarketData(createTestMarketData());
        request.setExternalRiskFactors(createTestExternalRiskFactors());
        request.setRequestTimestamp(LocalDateTime.now());
        request.setMetadata(createTestMetadata());
        request.setExplainabilityConfig(createTestExplainabilityConfig());
        return request;
    }

    /**
     * Creates realistic transaction history data for testing.
     * 
     * @return List of transaction maps with comprehensive transaction data
     */
    private List<Map<String, Object>> createTestTransactionHistory() {
        List<Map<String, Object>> transactions = new ArrayList<>();
        
        // Create diverse transaction patterns for comprehensive AI analysis
        for (int i = 0; i < 25; i++) {
            Map<String, Object> transaction = new HashMap<>();
            transaction.put("transaction_id", "TXN-" + (1000 + i));
            transaction.put("amount", 100.0 + (i * 15.5)); // Varying amounts
            transaction.put("currency", "USD");
            transaction.put("timestamp", LocalDateTime.now().minusDays(i).toString());
            transaction.put("category", i % 3 == 0 ? "groceries" : i % 3 == 1 ? "utilities" : "entertainment");
            transaction.put("merchant", "Merchant-" + (i % 5));
            transaction.put("payment_method", i % 2 == 0 ? "credit_card" : "debit_card");
            transaction.put("account_type", "checking");
            transaction.put("location", "US-" + (i % 10));
            transaction.put("risk_flags", new ArrayList<>());
            transactions.add(transaction);
        }
        
        return transactions;
    }

    /**
     * Creates test market data for risk assessment context.
     * 
     * @return Map containing market indicators and economic data
     */
    private Map<String, Object> createTestMarketData() {
        Map<String, Object> marketData = new HashMap<>();
        marketData.put("market_volatility", 15.5);
        marketData.put("interest_rates", 3.25);
        marketData.put("sp500_index", 4200.5);
        marketData.put("vix_index", 18.2);
        marketData.put("currency_rates", Map.of("EUR/USD", 1.08, "GBP/USD", 1.25));
        return marketData;
    }

    /**
     * Creates test external risk factors for comprehensive assessment.
     * 
     * @return Map containing external risk indicators
     */
    private Map<String, Object> createTestExternalRiskFactors() {
        Map<String, Object> externalFactors = new HashMap<>();
        externalFactors.put("credit_score", 720);
        externalFactors.put("watchlist_matches", 0);
        externalFactors.put("sanctions_check", "CLEAR");
        externalFactors.put("identity_verification_status", "VERIFIED");
        externalFactors.put("device_risk_score", 25.0);
        return externalFactors;
    }

    /**
     * Creates test metadata for request processing context.
     * 
     * @return Map containing request metadata
     */
    private Map<String, Object> createTestMetadata() {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("assessment_type", "comprehensive");
        metadata.put("model_version", "v2.1");
        metadata.put("customer_segment", "retail");
        metadata.put("correlation_id", UUID.randomUUID().toString());
        return metadata;
    }

    /**
     * Creates test explainability configuration for AI transparency.
     * 
     * @return Map containing explainability settings
     */
    private Map<String, Object> createTestExplainabilityConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("explanation_depth", "detailed");
        config.put("target_audience", "expert");
        config.put("feature_importance", true);
        config.put("model_confidence", true);
        config.put("bias_reporting", true);
        return config;
    }

    /**
     * Creates a test risk profile for different risk scenarios.
     * 
     * @param customerId Customer identifier
     * @param riskScore Current risk score
     * @param riskCategory Risk category classification
     * @return Configured RiskProfile entity
     */
    private RiskProfile createTestRiskProfile(String customerId, double riskScore, String riskCategory) {
        return RiskProfile.builder()
            .id(TEST_RISK_PROFILE_ID)
            .customerId(customerId)
            .currentRiskScore(riskScore)
            .riskCategory(riskCategory)
            .lastAssessedAt(new Date())
            .riskScores(new ArrayList<>())
            .createdAt(new Date())
            .updatedAt(new Date())
            .build();
    }

    /**
     * Creates test risk factors for scenario testing.
     * 
     * @return List of RiskFactor entities
     */
    private List<RiskFactor> createTestRiskFactors() {
        List<RiskFactor> factors = new ArrayList<>();
        
        RiskFactor transactionFactor = RiskFactor.builder()
            .factorName("TRANSACTION_PATTERNS")
            .score(0.3)
            .weight(0.4)
            .description("Historical transaction pattern analysis")
            .dataSource("TRANSACTION_HISTORY")
            .build();
        factors.add(transactionFactor);
        
        return factors;
    }

    /**
     * Creates medium-risk factors for testing medium-risk scenarios.
     * 
     * @return List of RiskFactor entities for medium risk
     */
    private List<RiskFactor> createMediumRiskFactors() {
        List<RiskFactor> factors = new ArrayList<>();
        
        RiskFactor velocityFactor = RiskFactor.builder()
            .factorName("TRANSACTION_VELOCITY")
            .score(0.5)
            .weight(0.3)
            .description("Moderate increase in transaction velocity")
            .dataSource("BEHAVIORAL_ANALYSIS")
            .build();
        factors.add(velocityFactor);
        
        return factors;
    }

    /**
     * Creates high-risk factors for testing high-risk scenarios.
     * 
     * @return List of RiskFactor entities for high risk
     */
    private List<RiskFactor> createHighRiskFactors() {
        List<RiskFactor> factors = new ArrayList<>();
        
        RiskFactor suspiciousFactor = RiskFactor.builder()
            .factorName("SUSPICIOUS_PATTERNS")
            .score(0.9)
            .weight(0.5)
            .description("Multiple high-risk patterns detected")
            .dataSource("AI_ANOMALY_DETECTION")
            .build();
        factors.add(suspiciousFactor);
        
        return factors;
    }

    /**
     * Creates a test risk score entity.
     * 
     * @param score Numerical risk score
     * @param category Risk category
     * @return Configured RiskScore entity
     */
    private RiskScore createTestRiskScore(double score, String category) {
        RiskScore riskScore = new RiskScore();
        riskScore.setId(TEST_RISK_SCORE_ID);
        riskScore.setScore((int) score);
        riskScore.setCategory(category);
        riskScore.setAssessmentDate(LocalDateTime.now());
        riskScore.setRiskProfileId(TEST_RISK_PROFILE_ID);
        return riskScore;
    }

    /**
     * Creates a test fraud detection response for different scenarios.
     * 
     * @param fraudScore Fraud score value
     * @param riskLevel Risk level classification
     * @param recommendation Action recommendation
     * @param confidence Confidence score
     * @param reasons List of assessment reasons
     * @return Configured FraudDetectionResponse
     */
    private FraudDetectionResponse createFraudDetectionResponse(BigDecimal fraudScore, String riskLevel, 
                                                               String recommendation, BigDecimal confidence, 
                                                               List<String> reasons) {
        FraudDetectionResponse response = new FraudDetectionResponse();
        response.setTransactionId("TXN-TEST-12345");
        response.setFraudScore(fraudScore.intValue());
        response.setRiskLevel(riskLevel);
        response.setRecommendation(recommendation);
        response.setConfidenceScore(confidence);
        response.setReasons(reasons);
        return response;
    }
}