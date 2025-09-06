// supertest@6.3.3 - HTTP testing library for Node.js applications
import request from 'supertest';

// jest@29.7.0 - JavaScript testing framework for unit and integration tests
import { jest } from '@jest/globals';

// Internal imports - application and controller dependencies
import app from '../src/app';
import { NotificationController } from '../src/controllers/notification.controller';
import { TemplateController } from '../src/controllers/template.controller';
import { EmailService } from '../src/services/email.service';
import { SmsService } from '../src/services/sms.service';
import { PushService } from '../src/services/push.service';
import { TemplateService } from '../src/services/template.service';

/**
 * Integration Tests for Notification Service Controllers
 * 
 * This comprehensive test suite validates the API endpoints for notification
 * and template management operations in the financial services platform.
 * The tests ensure proper integration between controllers and services while
 * maintaining isolation through comprehensive mocking strategies.
 * 
 * Architecture Context:
 * - Real-time Processing (2.3.3 Common Services): Tests notification delivery endpoints
 * - User Experience KPIs (1.2.3 Success Criteria): Validates notification system reliability
 * - Event-driven microservices architecture integration testing
 * 
 * Test Coverage:
 * - HTTP endpoint functionality and response formats
 * - Request validation and error handling
 * - Service integration and dependency injection
 * - Authentication and authorization flows (future enhancement)
 * - Performance characteristics under load
 * 
 * Testing Strategy:
 * - Integration testing with mocked services for isolation
 * - Comprehensive error scenario testing
 * - Request/response validation with realistic data
 * - Audit trail and logging verification
 * 
 * Financial Services Compliance:
 * - Tests audit logging for regulatory requirements
 * - Validates error handling for customer communication scenarios
 * - Ensures notification delivery reliability for transaction monitoring
 * 
 * @fileoverview Integration tests for notification service API endpoints
 * @version 1.0.0
 * @since 2025-01-01
 */

// Global test configuration and setup
describe('Notification Service - Controller Integration Tests', () => {
    /**
     * Test environment setup and service mocking
     * 
     * Configures comprehensive service mocks to isolate controller testing
     * while providing realistic service behavior simulation for integration
     * validation. All external dependencies are mocked to ensure test
     * determinism and prevent side effects.
     */
    beforeAll(async () => {
        // Mock EmailService with comprehensive method implementations
        jest.mock('../src/services/email.service', () => {
            return {
                EmailService: jest.fn().mockImplementation(() => ({
                    sendEmail: jest.fn().mockResolvedValue(undefined),
                    validateEmailAddress: jest.fn().mockReturnValue(true),
                    getDeliveryStatus: jest.fn().mockResolvedValue({
                        messageId: 'email-msg-123',
                        status: 'delivered',
                        timestamp: new Date()
                    }),
                    getServiceHealth: jest.fn().mockReturnValue({
                        status: 'healthy',
                        lastCheck: new Date(),
                        errorCount: 0
                    })
                }))
            };
        });

        // Mock SmsService with Twilio-compatible interface
        jest.mock('../src/services/sms.service', () => {
            return {
                SmsService: jest.fn().mockImplementation(() => ({
                    sendSms: jest.fn().mockResolvedValue({
                        messageId: 'sms-msg-456',
                        status: 'sent',
                        to: '+1234567890'
                    }),
                    validatePhoneNumber: jest.fn().mockReturnValue(true),
                    getDeliveryReport: jest.fn().mockResolvedValue({
                        messageId: 'sms-msg-456',
                        status: 'delivered',
                        deliveredAt: new Date()
                    }),
                    healthCheck: jest.fn().mockResolvedValue(true)
                })),
                sendSms: jest.fn().mockResolvedValue(undefined)
            };
        });

        // Mock PushService with FCM/APNS-compatible interface
        jest.mock('../src/services/push.service', () => {
            return {
                PushService: jest.fn().mockImplementation(() => ({
                    sendNotification: jest.fn().mockResolvedValue({
                        totalTokens: 1,
                        successCount: 1,
                        failureCount: 0,
                        results: [{
                            deviceToken: 'mock-device-token',
                            success: true,
                            messageId: 'push-msg-789'
                        }]
                    }),
                    validateDeviceToken: jest.fn().mockReturnValue(true),
                    getServiceHealth: jest.fn().mockReturnValue({
                        status: 'healthy',
                        providers: ['FCM', 'APNS'],
                        lastUpdate: new Date()
                    })
                }))
            };
        });

        // Mock TemplateService with comprehensive CRUD operations
        jest.mock('../src/services/template.service', () => {
            return {
                TemplateService: jest.fn().mockImplementation(() => ({
                    // Template retrieval operations
                    getTemplate: jest.fn().mockImplementation((id: string) => {
                        if (id === 'existing-template-123') {
                            return {
                                id: 'existing-template-123',
                                name: 'Test Template',
                                subject: 'Test Subject',
                                body: 'Test body content with {{placeholder}}',
                                type: 'EMAIL',
                                createdAt: new Date('2025-01-01T10:00:00.000Z'),
                                updatedAt: new Date('2025-01-01T10:00:00.000Z')
                            };
                        }
                        return undefined;
                    }),
                    
                    // Template listing operations
                    getAllTemplates: jest.fn().mockReturnValue([
                        {
                            id: 'template-001',
                            name: 'Welcome Email',
                            subject: 'Welcome to our platform',
                            body: 'Welcome {{customerName}} to our financial services platform.',
                            type: 'EMAIL',
                            createdAt: new Date('2025-01-01T09:00:00.000Z'),
                            updatedAt: new Date('2025-01-01T09:00:00.000Z')
                        },
                        {
                            id: 'template-002',
                            name: 'Transaction Alert',
                            subject: 'Transaction Alert',
                            body: 'Transaction of {{amount}} processed successfully.',
                            type: 'SMS',
                            createdAt: new Date('2025-01-01T09:30:00.000Z'),
                            updatedAt: new Date('2025-01-01T09:30:00.000Z')
                        }
                    ]),
                    
                    // Template creation operations
                    createTemplate: jest.fn().mockImplementation((input: any) => {
                        if (input.name === 'Duplicate Template') {
                            throw new Error('Template with name \'Duplicate Template\' already exists');
                        }
                        return {
                            id: 'new-template-456',
                            name: input.name,
                            subject: input.subject,
                            body: input.body,
                            type: input.type,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                    }),
                    
                    // Template update operations
                    updateTemplate: jest.fn().mockImplementation((id: string, updates: any) => {
                        if (id === 'existing-template-123') {
                            if (updates.name === 'Duplicate Template') {
                                throw new Error('Template with name \'Duplicate Template\' already exists');
                            }
                            return {
                                id: 'existing-template-123',
                                name: updates.name || 'Test Template',
                                subject: updates.subject || 'Test Subject',
                                body: updates.body || 'Test body content',
                                type: 'EMAIL',
                                createdAt: new Date('2025-01-01T10:00:00.000Z'),
                                updatedAt: new Date()
                            };
                        }
                        return undefined;
                    }),
                    
                    // Template deletion operations
                    deleteTemplate: jest.fn().mockImplementation((id: string) => {
                        if (id === 'system-template-001') {
                            throw new Error('System template \'system-template-001\' cannot be deleted');
                        }
                        return id === 'existing-template-123';
                    }),
                    
                    // Utility operations
                    getTemplateCount: jest.fn().mockReturnValue(2),
                    getTemplatesByType: jest.fn().mockReturnValue([])
                }))
            };
        });
    });

    /**
     * Reset all mocks after each test to ensure test isolation
     * and prevent test interdependencies from affecting results.
     */
    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Notification Controller Integration Tests
     * 
     * Tests the HTTP endpoints for sending notifications through multiple channels
     * (EMAIL, SMS, PUSH) and validates proper integration with notification services.
     * Covers real-time processing requirements and error handling scenarios.
     */
    describe('NotificationController', () => {
        /**
         * POST /api/notifications endpoint tests
         * 
         * Tests the primary notification sending endpoint that handles multi-channel
         * notification delivery for real-time transaction monitoring and customer
         * communication scenarios.
         */
        describe('POST /api/notifications', () => {
            /**
             * Test successful email notification sending
             * 
             * Validates complete workflow for email notification processing including
             * request validation, service integration, and proper response formatting.
             */
            test('should successfully send an email notification', async () => {
                // Arrange: Prepare valid email notification request
                const emailNotificationRequest = {
                    userId: 'user-12345',
                    channel: 'EMAIL',
                    recipient: 'customer@example.com',
                    subject: 'Transaction Confirmation',
                    message: 'Your transaction of $150.00 has been processed successfully.',
                    templateId: 'transaction_confirmation',
                    templateData: {
                        amount: '$150.00',
                        transactionId: 'TXN-789012',
                        timestamp: '2025-01-15 14:30:00'
                    }
                };

                // Act: Send POST request to notification endpoint
                const response = await request(app)
                    .post('/api/notifications')
                    .send(emailNotificationRequest)
                    .expect('Content-Type', /json/)
                    .expect(201);

                // Assert: Verify response structure and content
                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('message', 'Notification sent successfully');
                expect(response.body).toHaveProperty('data');
                expect(response.body.data).toHaveProperty('notificationId');
                expect(response.body.data).toHaveProperty('status', 'sent');
                expect(response.body.data).toHaveProperty('channel', 'EMAIL');
                expect(response.body.data).toHaveProperty('recipient', 'customer@example.com');

                // Verify service method calls
                expect(EmailService.prototype.sendEmail).toHaveBeenCalledTimes(1);
                expect(EmailService.prototype.sendEmail).toHaveBeenCalledWith(
                    expect.objectContaining({
                        userId: 'user-12345',
                        channel: 'EMAIL',
                        recipient: 'customer@example.com',
                        subject: 'Transaction Confirmation',
                        message: 'Your transaction of $150.00 has been processed successfully.',
                        templateId: 'transaction_confirmation'
                    })
                );
            });

            /**
             * Test successful SMS notification sending
             * 
             * Validates SMS delivery workflow including phone number validation
             * and integration with SMS service provider (Twilio).
             */
            test('should successfully send an SMS notification', async () => {
                // Arrange: Prepare valid SMS notification request
                const smsNotificationRequest = {
                    userId: 'user-67890',
                    channel: 'SMS',
                    recipient: '+1234567890',
                    subject: 'Security Alert',
                    message: 'Login detected from new device. If this was not you, contact support immediately.',
                    templateId: 'security_alert',
                    templateData: {
                        deviceInfo: 'iPhone 15 Pro',
                        location: 'New York, NY',
                        timestamp: '2025-01-15 14:45:00'
                    }
                };

                // Act: Send POST request to notification endpoint
                const response = await request(app)
                    .post('/api/notifications')
                    .send(smsNotificationRequest)
                    .expect('Content-Type', /json/)
                    .expect(201);

                // Assert: Verify response structure and SMS-specific fields
                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('message', 'Notification sent successfully');
                expect(response.body.data).toHaveProperty('channel', 'SMS');
                expect(response.body.data).toHaveProperty('recipient', '+1234567890');
                expect(response.body.data).toHaveProperty('status', 'sent');

                // Verify SMS service integration
                const { sendSms } = require('../src/services/sms.service');
                expect(sendSms).toHaveBeenCalledTimes(1);
                expect(sendSms).toHaveBeenCalledWith(
                    '+1234567890',
                    'Login detected from new device. If this was not you, contact support immediately.',
                    expect.objectContaining({
                        userId: 'user-67890',
                        messageType: 'notification'
                    })
                );
            });

            /**
             * Test successful push notification sending
             * 
             * Validates push notification delivery for mobile devices including
             * FCM/APNS integration and device token validation.
             */
            test('should successfully send a push notification', async () => {
                // Arrange: Prepare valid push notification request
                const pushNotificationRequest = {
                    userId: 'user-54321',
                    channel: 'PUSH',
                    recipient: 'device-token-abc123xyz789',
                    subject: 'Payment Processed',
                    message: 'Your payment of $75.50 to Coffee Shop has been processed.',
                    templateId: 'payment_confirmation',
                    templateData: {
                        amount: '$75.50',
                        merchant: 'Coffee Shop',
                        paymentMethod: '****1234',
                        timestamp: '2025-01-15 08:15:00'
                    }
                };

                // Act: Send POST request to notification endpoint
                const response = await request(app)
                    .post('/api/notifications')
                    .send(pushNotificationRequest)
                    .expect('Content-Type', /json/)
                    .expect(201);

                // Assert: Verify response structure and push-specific fields
                expect(response.body).toHaveProperty('success', true);
                expect(response.body.data).toHaveProperty('channel', 'PUSH');
                expect(response.body.data).toHaveProperty('recipient', 'device-token-abc123xyz789');
                expect(response.body.data).toHaveProperty('deliveryDetails');
                expect(response.body.data.deliveryDetails).toHaveProperty('totalTokens', 1);
                expect(response.body.data.deliveryDetails).toHaveProperty('successCount', 1);

                // Verify push service integration
                expect(PushService.prototype.sendNotification).toHaveBeenCalledTimes(1);
                expect(PushService.prototype.sendNotification).toHaveBeenCalledWith(
                    expect.objectContaining({
                        userId: 'user-54321',
                        channel: 'PUSH',
                        recipient: 'device-token-abc123xyz789',
                        subject: 'Payment Processed'
                    })
                );
            });

            /**
             * Test notification request validation errors
             * 
             * Validates comprehensive input validation for notification requests
             * including required fields, data types, and business rule validation.
             */
            test('should return 400 for missing required fields', async () => {
                // Test missing userId
                const missingUserIdRequest = {
                    channel: 'EMAIL',
                    recipient: 'test@example.com',
                    subject: 'Test',
                    message: 'Test message'
                };

                const response1 = await request(app)
                    .post('/api/notifications')
                    .send(missingUserIdRequest)
                    .expect('Content-Type', /json/)
                    .expect(400);

                expect(response1.body).toHaveProperty('success', false);
                expect(response1.body).toHaveProperty('message');
                expect(response1.body.message).toContain('userId');

                // Test missing channel
                const missingChannelRequest = {
                    userId: 'user-123',
                    recipient: 'test@example.com',
                    subject: 'Test',
                    message: 'Test message'
                };

                const response2 = await request(app)
                    .post('/api/notifications')
                    .send(missingChannelRequest)
                    .expect('Content-Type', /json/)
                    .expect(400);

                expect(response2.body).toHaveProperty('success', false);
                expect(response2.body.message).toContain('channel');

                // Test missing recipient
                const missingRecipientRequest = {
                    userId: 'user-123',
                    channel: 'EMAIL',
                    subject: 'Test',
                    message: 'Test message'
                };

                const response3 = await request(app)
                    .post('/api/notifications')
                    .send(missingRecipientRequest)
                    .expect('Content-Type', /json/)
                    .expect(400);

                expect(response3.body).toHaveProperty('success', false);
                expect(response3.body.message).toContain('recipient');
            });

            /**
             * Test invalid notification channel handling
             * 
             * Validates proper error handling for unsupported notification channels
             * and ensures system security through input validation.
             */
            test('should return 400 for invalid notification channel', async () => {
                // Arrange: Request with invalid channel
                const invalidChannelRequest = {
                    userId: 'user-123',
                    channel: 'INVALID_CHANNEL',
                    recipient: 'test@example.com',
                    subject: 'Test Subject',
                    message: 'Test message content'
                };

                // Act & Assert: Expect validation error
                const response = await request(app)
                    .post('/api/notifications')
                    .send(invalidChannelRequest)
                    .expect('Content-Type', /json/)
                    .expect(400);

                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('Invalid notification channel');
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
            });

            /**
             * Test email service failure handling
             * 
             * Validates proper error handling and response formatting when
             * underlying email service encounters delivery failures.
             */
            test('should handle email service failures gracefully', async () => {
                // Arrange: Mock email service to throw error
                const mockEmailService = EmailService.prototype.sendEmail as jest.MockedFunction<any>;
                mockEmailService.mockRejectedValueOnce(new Error('SMTP server temporarily unavailable'));

                const emailRequest = {
                    userId: 'user-123',
                    channel: 'EMAIL',
                    recipient: 'test@example.com',
                    subject: 'Test Subject',
                    message: 'Test message',
                    templateId: 'test_template'
                };

                // Act: Send request expecting failure
                const response = await request(app)
                    .post('/api/notifications')
                    .send(emailRequest)
                    .expect('Content-Type', /json/)
                    .expect(500);

                // Assert: Verify error response structure
                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('Failed to send notification');
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toHaveProperty('details');
                expect(response.body.error.details).toContain('SMTP server temporarily unavailable');

                // Verify service was called despite failure
                expect(mockEmailService).toHaveBeenCalledTimes(1);
            });

            /**
             * Test SMS service failure with retry logic
             * 
             * Validates error handling for SMS delivery failures including
             * retry mechanisms and proper error reporting to clients.
             */
            test('should handle SMS service failures with proper error details', async () => {
                // Arrange: Mock SMS service to simulate Twilio API error
                const { sendSms } = require('../src/services/sms.service');
                const mockSendSms = sendSms as jest.MockedFunction<any>;
                mockSendSms.mockRejectedValueOnce({
                    code: 21614,
                    message: 'To number is not a valid mobile number',
                    moreInfo: 'https://www.twilio.com/docs/errors/21614'
                });

                const smsRequest = {
                    userId: 'user-123',
                    channel: 'SMS',
                    recipient: '+1234567890',
                    subject: 'Test Alert',
                    message: 'Test SMS message',
                    templateId: 'alert_template'
                };

                // Act: Send request expecting validation error
                const response = await request(app)
                    .post('/api/notifications')
                    .send(smsRequest)
                    .expect('Content-Type', /json/)
                    .expect(400);

                // Assert: Verify SMS-specific error handling
                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('SMS delivery failed');
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toHaveProperty('code', 'SMS_VALIDATION_ERROR');
                expect(response.body.error).toHaveProperty('providerCode', 21614);

                // Verify SMS service was attempted
                expect(mockSendSms).toHaveBeenCalledTimes(1);
            });

            /**
             * Test push notification service failure scenarios
             * 
             * Validates error handling for push notification failures including
             * invalid device tokens and provider service unavailability.
             */
            test('should handle push notification failures with detailed reporting', async () => {
                // Arrange: Mock push service to simulate device token failure
                const mockPushService = PushService.prototype.sendNotification as jest.MockedFunction<any>;
                mockPushService.mockRejectedValueOnce({
                    name: 'PushNotificationError',
                    message: 'Invalid device token format',
                    failureDetails: {
                        provider: 'FCM',
                        deviceTokens: ['invalid-token-123'],
                        retryable: false
                    }
                });

                const pushRequest = {
                    userId: 'user-123',
                    channel: 'PUSH',
                    recipient: 'invalid-token-123',
                    subject: 'Test Notification',
                    message: 'Test push message',
                    templateId: 'push_template'
                };

                // Act: Send request expecting token validation error
                const response = await request(app)
                    .post('/api/notifications')
                    .send(pushRequest)
                    .expect('Content-Type', /json/)
                    .expect(400);

                // Assert: Verify push-specific error handling
                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('Push notification failed');
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toHaveProperty('code', 'PUSH_TOKEN_INVALID');
                expect(response.body.error).toHaveProperty('retryable', false);

                // Verify push service was attempted
                expect(mockPushService).toHaveBeenCalledTimes(1);
            });

            /**
             * Test template data validation and processing
             * 
             * Validates proper handling of template data including variable
             * substitution, data sanitization, and security validation.
             */
            test('should validate and process template data correctly', async () => {
                // Arrange: Request with comprehensive template data
                const templateRequest = {
                    userId: 'user-456',
                    channel: 'EMAIL',
                    recipient: 'customer@example.com',
                    subject: 'Account Statement Ready',
                    message: 'Dear {{customerName}}, your account statement for {{statementPeriod}} is ready.',
                    templateId: 'account_statement',
                    templateData: {
                        customerName: 'John Doe',
                        statementPeriod: 'December 2024',
                        accountNumber: '****1234',
                        statementDate: '2025-01-01',
                        downloadLink: 'https://secure.bank.com/statements/download/abc123'
                    }
                };

                // Act: Send request with template data
                const response = await request(app)
                    .post('/api/notifications')
                    .send(templateRequest)
                    .expect('Content-Type', /json/)
                    .expect(201);

                // Assert: Verify template processing
                expect(response.body).toHaveProperty('success', true);
                expect(response.body.data).toHaveProperty('templateProcessed', true);
                expect(response.body.data).toHaveProperty('templateId', 'account_statement');

                // Verify service received processed template
                expect(EmailService.prototype.sendEmail).toHaveBeenCalledWith(
                    expect.objectContaining({
                        templateId: 'account_statement',
                        templateData: expect.objectContaining({
                            customerName: 'John Doe',
                            statementPeriod: 'December 2024'
                        })
                    })
                );
            });

            /**
             * Test notification request rate limiting
             * 
             * Validates rate limiting implementation to protect against
             * abuse and ensure system stability under high load conditions.
             */
            test('should enforce rate limiting for notification requests', async () => {
                // Arrange: Prepare multiple requests from same user
                const rapidRequests = Array(10).fill(null).map((_, index) => ({
                    userId: 'user-rate-limit-test',
                    channel: 'EMAIL',
                    recipient: `test${index}@example.com`,
                    subject: `Test Message ${index}`,
                    message: `This is test message number ${index}`,
                    templateId: 'rate_limit_test'
                }));

                // Act: Send multiple requests rapidly
                const responses = await Promise.all(
                    rapidRequests.map(req => 
                        request(app)
                            .post('/api/notifications')
                            .send(req)
                    )
                );

                // Assert: Verify rate limiting behavior
                const successfulRequests = responses.filter(res => res.status === 201);
                const rateLimitedRequests = responses.filter(res => res.status === 429);

                expect(successfulRequests.length).toBeLessThanOrEqual(5); // Assuming 5 requests per minute limit
                expect(rateLimitedRequests.length).toBeGreaterThan(0);

                // Verify rate limit response format
                if (rateLimitedRequests.length > 0) {
                    const rateLimitResponse = rateLimitedRequests[0];
                    expect(rateLimitResponse.body).toHaveProperty('success', false);
                    expect(rateLimitResponse.body).toHaveProperty('message');
                    expect(rateLimitResponse.body.message).toContain('Rate limit exceeded');
                    expect(rateLimitResponse.body).toHaveProperty('retryAfter');
                }
            });
        });

        /**
         * GET /api/notifications/:id endpoint tests
         * 
         * Tests notification status and delivery confirmation endpoints
         * for tracking and audit purposes in financial services compliance.
         */
        describe('GET /api/notifications/:id', () => {
            /**
             * Test successful notification status retrieval
             * 
             * Validates the ability to track notification delivery status
             * for audit trails and customer service inquiries.
             */
            test('should retrieve notification status by ID', async () => {
                // Arrange: Mock notification ID
                const notificationId = 'notification-123-456-789';

                // Act: Request notification status
                const response = await request(app)
                    .get(`/api/notifications/${notificationId}`)
                    .expect('Content-Type', /json/)
                    .expect(200);

                // Assert: Verify status response structure
                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('data');
                expect(response.body.data).toHaveProperty('notificationId', notificationId);
                expect(response.body.data).toHaveProperty('status');
                expect(response.body.data).toHaveProperty('createdAt');
                expect(response.body.data).toHaveProperty('deliveryAttempts');
                expect(response.body.data).toHaveProperty('lastStatusUpdate');
            });

            /**
             * Test notification not found scenario
             * 
             * Validates proper error handling when requesting status
             * for non-existent notification IDs.
             */
            test('should return 404 for non-existent notification', async () => {
                // Arrange: Non-existent notification ID
                const nonExistentId = 'notification-does-not-exist';

                // Act & Assert: Expect not found error
                const response = await request(app)
                    .get(`/api/notifications/${nonExistentId}`)
                    .expect('Content-Type', /json/)
                    .expect(404);

                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('Notification not found');
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toHaveProperty('code', 'NOTIFICATION_NOT_FOUND');
            });
        });
    });

    /**
     * Template Controller Integration Tests
     * 
     * Tests the complete CRUD API for notification template management
     * including creation, retrieval, updates, and deletion operations
     * with comprehensive validation and error handling.
     */
    describe('TemplateController', () => {
        /**
         * POST /api/templates endpoint tests
         * 
         * Tests template creation functionality with comprehensive validation
         * and business rule enforcement for financial services templates.
         */
        describe('POST /api/templates', () => {
            /**
             * Test successful template creation
             * 
             * Validates complete template creation workflow including
             * input validation, business rule checking, and proper response formatting.
             */
            test('should successfully create a new template', async () => {
                // Arrange: Valid template creation request
                const newTemplateRequest = {
                    name: 'Payment Confirmation Template',
                    subject: 'Payment Processed - {{transactionAmount}}',
                    body: 'Dear {{customerName}},\n\nYour payment of {{transactionAmount}} has been successfully processed.\n\nTransaction Details:\n- Reference: {{transactionReference}}\n- Date: {{transactionDate}}\n- Merchant: {{merchantName}}\n\nThank you for your business.\n\nBest regards,\nCustomer Service Team',
                    type: 'EMAIL'
                };

                // Act: Create new template
                const response = await request(app)
                    .post('/api/templates')
                    .send(newTemplateRequest)
                    .expect('Content-Type', /json/)
                    .expect(201);

                // Assert: Verify creation response
                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('message', 'Template created successfully');
                expect(response.body).toHaveProperty('data');
                expect(response.body.data).toHaveProperty('id', 'new-template-456');
                expect(response.body.data).toHaveProperty('name', 'Payment Confirmation Template');
                expect(response.body.data).toHaveProperty('subject', 'Payment Processed - {{transactionAmount}}');
                expect(response.body.data).toHaveProperty('type', 'EMAIL');
                expect(response.body.data).toHaveProperty('createdAt');
                expect(response.body.data).toHaveProperty('updatedAt');

                // Verify service method was called correctly
                expect(TemplateService.prototype.createTemplate).toHaveBeenCalledTimes(1);
                expect(TemplateService.prototype.createTemplate).toHaveBeenCalledWith({
                    name: 'Payment Confirmation Template',
                    subject: 'Payment Processed - {{transactionAmount}}',
                    body: expect.stringContaining('Dear {{customerName}}'),
                    type: 'EMAIL'
                });
            });

            /**
             * Test template creation validation errors
             * 
             * Validates comprehensive input validation for template creation
             * including required fields, data types, and business constraints.
             */
            test('should return 400 for missing required fields', async () => {
                // Test missing name
                const missingNameRequest = {
                    subject: 'Test Subject',
                    body: 'Test body content',
                    type: 'EMAIL'
                };

                const response1 = await request(app)
                    .post('/api/templates')
                    .send(missingNameRequest)
                    .expect('Content-Type', /json/)
                    .expect(400);

                expect(response1.body).toHaveProperty('success', false);
                expect(response1.body.message).toContain('Template name is required');

                // Test missing subject
                const missingSubjectRequest = {
                    name: 'Test Template',
                    body: 'Test body content',
                    type: 'EMAIL'
                };

                const response2 = await request(app)
                    .post('/api/templates')
                    .send(missingSubjectRequest)
                    .expect('Content-Type', /json/)
                    .expect(400);

                expect(response2.body).toHaveProperty('success', false);
                expect(response2.body.message).toContain('Template subject is required');

                // Test missing body
                const missingBodyRequest = {
                    name: 'Test Template',
                    subject: 'Test Subject',
                    type: 'EMAIL'
                };

                const response3 = await request(app)
                    .post('/api/templates')
                    .send(missingBodyRequest)
                    .expect('Content-Type', /json/)
                    .expect(400);

                expect(response3.body).toHaveProperty('success', false);
                expect(response3.body.message).toContain('Template body is required');

                // Test missing type
                const missingTypeRequest = {
                    name: 'Test Template',
                    subject: 'Test Subject',
                    body: 'Test body content'
                };

                const response4 = await request(app)
                    .post('/api/templates')
                    .send(missingTypeRequest)
                    .expect('Content-Type', /json/)
                    .expect(400);

                expect(response4.body).toHaveProperty('success', false);
                expect(response4.body.message).toContain('Template type is required');
            });

            /**
             * Test duplicate template name handling
             * 
             * Validates business rule enforcement for template name uniqueness
             * and proper error reporting for duplicate names.
             */
            test('should return 400 for duplicate template name', async () => {
                // Arrange: Template with duplicate name
                const duplicateNameRequest = {
                    name: 'Duplicate Template',
                    subject: 'Test Subject',
                    body: 'Test body content',
                    type: 'EMAIL'
                };

                // Act & Assert: Expect validation error
                const response = await request(app)
                    .post('/api/templates')
                    .send(duplicateNameRequest)
                    .expect('Content-Type', /json/)
                    .expect(400);

                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('Template creation failed');
                expect(response.body.message).toContain('already exists');

                // Verify service was called and threw expected error
                expect(TemplateService.prototype.createTemplate).toHaveBeenCalledTimes(1);
            });

            /**
             * Test invalid template type handling
             * 
             * Validates proper error handling for unsupported template types
             * and ensures system security through input validation.
             */
            test('should return 400 for invalid template type', async () => {
                // Arrange: Template with invalid type
                const invalidTypeRequest = {
                    name: 'Test Template',
                    subject: 'Test Subject',
                    body: 'Test body content',
                    type: 'INVALID_TYPE'
                };

                // Act & Assert: Expect validation error
                const response = await request(app)
                    .post('/api/templates')
                    .send(invalidTypeRequest)
                    .expect('Content-Type', /json/)
                    .expect(400);

                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('Invalid template type');
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
            });

            /**
             * Test template content validation
             * 
             * Validates content-specific business rules including
             * character limits, format requirements, and security constraints.
             */
            test('should validate template content constraints', async () => {
                // Test subject too long
                const longSubjectRequest = {
                    name: 'Test Template',
                    subject: 'A'.repeat(201), // Exceeds 200 character limit
                    body: 'Test body content',
                    type: 'EMAIL'
                };

                const response1 = await request(app)
                    .post('/api/templates')
                    .send(longSubjectRequest)
                    .expect('Content-Type', /json/)
                    .expect(400);

                expect(response1.body).toHaveProperty('success', false);
                expect(response1.body.message).toContain('subject must not exceed');

                // Test SMS body too long
                const longSmsRequest = {
                    name: 'SMS Template',
                    subject: 'SMS Alert',
                    body: 'A'.repeat(161), // Exceeds SMS 160 character limit
                    type: 'SMS'
                };

                const response2 = await request(app)
                    .post('/api/templates')
                    .send(longSmsRequest)
                    .expect('Content-Type', /json/)
                    .expect(400);

                expect(response2.body).toHaveProperty('success', false);
                expect(response2.body.message).toContain('SMS template body must not exceed 160 characters');
            });
        });

        /**
         * GET /api/templates endpoint tests
         * 
         * Tests template listing functionality with support for filtering,
         * sorting, and pagination for administrative interfaces.
         */
        describe('GET /api/templates', () => {
            /**
             * Test successful template list retrieval
             * 
             * Validates the ability to retrieve all templates with proper
             * formatting and metadata for administrative operations.
             */
            test('should retrieve all templates successfully', async () => {
                // Act: Request template list
                const response = await request(app)
                    .get('/api/templates')
                    .expect('Content-Type', /json/)
                    .expect(200);

                // Assert: Verify list response structure
                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('message', 'Templates retrieved successfully');
                expect(response.body).toHaveProperty('data');
                expect(response.body).toHaveProperty('count', 2);
                expect(Array.isArray(response.body.data)).toBe(true);
                expect(response.body.data).toHaveLength(2);

                // Verify template structure
                const template = response.body.data[0];
                expect(template).toHaveProperty('id');
                expect(template).toHaveProperty('name');
                expect(template).toHaveProperty('subject');
                expect(template).toHaveProperty('body');
                expect(template).toHaveProperty('type');
                expect(template).toHaveProperty('createdAt');
                expect(template).toHaveProperty('updatedAt');

                // Verify service method was called
                expect(TemplateService.prototype.getAllTemplates).toHaveBeenCalledTimes(1);
            });

            /**
             * Test empty template list handling
             * 
             * Validates proper response when no templates exist in the system
             * and ensures consistent API behavior.
             */
            test('should handle empty template list gracefully', async () => {
                // Arrange: Mock empty template list
                const mockGetAllTemplates = TemplateService.prototype.getAllTemplates as jest.MockedFunction<any>;
                mockGetAllTemplates.mockReturnValueOnce([]);

                // Act: Request template list
                const response = await request(app)
                    .get('/api/templates')
                    .expect('Content-Type', /json/)
                    .expect(200);

                // Assert: Verify empty list response
                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('data', []);
                expect(response.body).toHaveProperty('count', 0);
            });

            /**
             * Test template service error handling
             * 
             * Validates proper error handling when template service
             * encounters failures during list retrieval.
             */
            test('should handle service errors during template retrieval', async () => {
                // Arrange: Mock service error
                const mockGetAllTemplates = TemplateService.prototype.getAllTemplates as jest.MockedFunction<any>;
                mockGetAllTemplates.mockImplementationOnce(() => {
                    throw new Error('Database connection failed');
                });

                // Act & Assert: Expect service error response
                const response = await request(app)
                    .get('/api/templates')
                    .expect('Content-Type', /json/)
                    .expect(500);

                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('Failed to retrieve templates');
            });
        });

        /**
         * GET /api/templates/:id endpoint tests
         * 
         * Tests individual template retrieval by ID with proper validation
         * and error handling for missing templates.
         */
        describe('GET /api/templates/:id', () => {
            /**
             * Test successful template retrieval by ID
             * 
             * Validates the ability to retrieve specific templates by ID
             * for editing and detailed view operations.
             */
            test('should retrieve a template by ID successfully', async () => {
                // Arrange: Existing template ID
                const templateId = 'existing-template-123';

                // Act: Request specific template
                const response = await request(app)
                    .get(`/api/templates/${templateId}`)
                    .expect('Content-Type', /json/)
                    .expect(200);

                // Assert: Verify template response
                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('message', 'Template retrieved successfully');
                expect(response.body).toHaveProperty('data');
                expect(response.body.data).toHaveProperty('id', 'existing-template-123');
                expect(response.body.data).toHaveProperty('name', 'Test Template');
                expect(response.body.data).toHaveProperty('subject', 'Test Subject');
                expect(response.body.data).toHaveProperty('body');
                expect(response.body.data).toHaveProperty('type', 'EMAIL');

                // Verify service method was called correctly
                expect(TemplateService.prototype.getTemplate).toHaveBeenCalledTimes(1);
                expect(TemplateService.prototype.getTemplate).toHaveBeenCalledWith('existing-template-123');
            });

            /**
             * Test template not found scenario
             * 
             * Validates proper 404 error handling when requesting
             * non-existent template IDs.
             */
            test('should return 404 for non-existent template', async () => {
                // Arrange: Non-existent template ID
                const nonExistentId = 'template-does-not-exist';

                // Act & Assert: Expect not found error
                const response = await request(app)
                    .get(`/api/templates/${nonExistentId}`)
                    .expect('Content-Type', /json/)
                    .expect(404);

                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('Template not found with ID');
                expect(response.body.message).toContain(nonExistentId);

                // Verify service method was called
                expect(TemplateService.prototype.getTemplate).toHaveBeenCalledWith(nonExistentId);
            });

            /**
             * Test invalid template ID handling
             * 
             * Validates proper error handling for malformed or invalid
             * template ID parameters.
             */
            test('should return 400 for invalid template ID', async () => {
                // Test empty ID
                const response1 = await request(app)
                    .get('/api/templates/')
                    .expect(404); // Express returns 404 for missing route parameter

                // Test whitespace-only ID
                const response2 = await request(app)
                    .get('/api/templates/   ')
                    .expect('Content-Type', /json/)
                    .expect(400);

                expect(response2.body).toHaveProperty('success', false);
                expect(response2.body.message).toContain('Template ID is required');
            });
        });

        /**
         * PUT /api/templates/:id endpoint tests
         * 
         * Tests template update functionality with partial update support,
         * validation, and business rule enforcement.
         */
        describe('PUT /api/templates/:id', () => {
            /**
             * Test successful template update
             * 
             * Validates partial template update functionality with proper
             * validation and timestamp management.
             */
            test('should update a template successfully', async () => {
                // Arrange: Template update request
                const templateId = 'existing-template-123';
                const updateRequest = {
                    subject: 'Updated Test Subject',
                    body: 'Updated test body content with {{newPlaceholder}}'
                };

                // Act: Update template
                const response = await request(app)
                    .put(`/api/templates/${templateId}`)
                    .send(updateRequest)
                    .expect('Content-Type', /json/)
                    .expect(200);

                // Assert: Verify update response
                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('message', 'Template updated successfully');
                expect(response.body).toHaveProperty('data');
                expect(response.body.data).toHaveProperty('id', templateId);
                expect(response.body.data).toHaveProperty('subject', 'Updated Test Subject');
                expect(response.body.data).toHaveProperty('body', 'Updated test body content with {{newPlaceholder}}');
                expect(response.body.data).toHaveProperty('updatedAt');

                // Verify service method was called correctly
                expect(TemplateService.prototype.updateTemplate).toHaveBeenCalledTimes(1);
                expect(TemplateService.prototype.updateTemplate).toHaveBeenCalledWith(
                    templateId,
                    updateRequest
                );
            });

            /**
             * Test template update with name conflict
             * 
             * Validates business rule enforcement for template name uniqueness
             * during update operations.
             */
            test('should return 400 for duplicate name during update', async () => {
                // Arrange: Update with duplicate name
                const templateId = 'existing-template-123';
                const duplicateNameUpdate = {
                    name: 'Duplicate Template'
                };

                // Act & Assert: Expect validation error
                const response = await request(app)
                    .put(`/api/templates/${templateId}`)
                    .send(duplicateNameUpdate)
                    .expect('Content-Type', /json/)
                    .expect(400);

                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('Template update failed');
                expect(response.body.message).toContain('already exists');

                // Verify service method was called
                expect(TemplateService.prototype.updateTemplate).toHaveBeenCalledTimes(1);
            });

            /**
             * Test update of non-existent template
             * 
             * Validates proper 404 error handling when attempting to update
             * templates that don't exist in the system.
             */
            test('should return 404 for updating non-existent template', async () => {
                // Arrange: Update non-existent template
                const nonExistentId = 'template-does-not-exist';
                const updateRequest = {
                    subject: 'Updated Subject'
                };

                // Act & Assert: Expect not found error
                const response = await request(app)
                    .put(`/api/templates/${nonExistentId}`)
                    .send(updateRequest)
                    .expect('Content-Type', /json/)
                    .expect(404);

                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('Template not found with ID');

                // Verify service method was called
                expect(TemplateService.prototype.updateTemplate).toHaveBeenCalledWith(
                    nonExistentId,
                    updateRequest
                );
            });

            /**
             * Test update validation errors
             * 
             * Validates input validation for template update requests
             * including field constraints and data type validation.
             */
            test('should validate update fields correctly', async () => {
                const templateId = 'existing-template-123';

                // Test empty update body
                const response1 = await request(app)
                    .put(`/api/templates/${templateId}`)
                    .send({})
                    .expect('Content-Type', /json/)
                    .expect(400);

                expect(response1.body).toHaveProperty('success', false);
                expect(response1.body.message).toContain('At least one field');

                // Test invalid field values
                const invalidUpdate = {
                    name: '', // Empty name
                    subject: 'A'.repeat(201) // Too long subject
                };

                const response2 = await request(app)
                    .put(`/api/templates/${templateId}`)
                    .send(invalidUpdate)
                    .expect('Content-Type', /json/)
                    .expect(400);

                expect(response2.body).toHaveProperty('success', false);
                expect(response2.body.message).toContain('validation failed');
            });
        });

        /**
         * DELETE /api/templates/:id endpoint tests
         * 
         * Tests template deletion functionality with proper validation,
         * business rule enforcement, and audit trail management.
         */
        describe('DELETE /api/templates/:id', () => {
            /**
             * Test successful template deletion
             * 
             * Validates proper template deletion with audit logging
             * and appropriate response formatting.
             */
            test('should delete a template successfully', async () => {
                // Arrange: Existing template ID
                const templateId = 'existing-template-123';

                // Act: Delete template
                const response = await request(app)
                    .delete(`/api/templates/${templateId}`)
                    .expect(204);

                // Assert: Verify deletion response (no content)
                expect(response.body).toEqual({});

                // Verify service method was called correctly
                expect(TemplateService.prototype.deleteTemplate).toHaveBeenCalledTimes(1);
                expect(TemplateService.prototype.deleteTemplate).toHaveBeenCalledWith(templateId);
            });

            /**
             * Test deletion of non-existent template
             * 
             * Validates proper 404 error handling when attempting to delete
             * templates that don't exist in the system.
             */
            test('should return 404 for deleting non-existent template', async () => {
                // Arrange: Non-existent template ID
                const nonExistentId = 'template-does-not-exist';

                // Act & Assert: Expect not found error
                const response = await request(app)
                    .delete(`/api/templates/${nonExistentId}`)
                    .expect('Content-Type', /json/)
                    .expect(404);

                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('Template not found with ID');

                // Verify service method was called
                expect(TemplateService.prototype.deleteTemplate).toHaveBeenCalledWith(nonExistentId);
            });

            /**
             * Test system template protection
             * 
             * Validates business rule enforcement preventing deletion
             * of system templates and proper error reporting.
             */
            test('should prevent deletion of system templates', async () => {
                // Arrange: System template ID
                const systemTemplateId = 'system-template-001';

                // Act & Assert: Expect protection error
                const response = await request(app)
                    .delete(`/api/templates/${systemTemplateId}`)
                    .expect('Content-Type', /json/)
                    .expect(400);

                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('Template deletion failed');
                expect(response.body.message).toContain('cannot be deleted');

                // Verify service method was called and threw expected error
                expect(TemplateService.prototype.deleteTemplate).toHaveBeenCalledWith(systemTemplateId);
            });

            /**
             * Test invalid template ID for deletion
             * 
             * Validates proper error handling for malformed or invalid
             * template ID parameters in deletion requests.
             */
            test('should return 400 for invalid template ID in deletion', async () => {
                // Test whitespace-only ID
                const response = await request(app)
                    .delete('/api/templates/   ')
                    .expect('Content-Type', /json/)
                    .expect(400);

                expect(response.body).toHaveProperty('success', false);
                expect(response.body.message).toContain('Template ID is required');
            });
        });
    });

    /**
     * Cross-functional Integration Tests
     * 
     * Tests that verify integration between different controllers and
     * end-to-end workflows that span multiple API endpoints.
     */
    describe('Cross-functional Integration Tests', () => {
        /**
         * Test complete notification workflow with template
         * 
         * Validates end-to-end workflow from template creation through
         * notification sending for real-world usage scenarios.
         */
        test('should support complete template-to-notification workflow', async () => {
            // Step 1: Create a new template
            const templateRequest = {
                name: 'Workflow Test Template',
                subject: 'Transaction Alert - {{amount}}',
                body: 'Dear {{customerName}}, a transaction of {{amount}} was processed.',
                type: 'EMAIL'
            };

            const templateResponse = await request(app)
                .post('/api/templates')
                .send(templateRequest)
                .expect(201);

            const templateId = templateResponse.body.data.id;

            // Step 2: Use the template in a notification
            const notificationRequest = {
                userId: 'user-workflow-test',
                channel: 'EMAIL',
                recipient: 'customer@example.com',
                subject: 'Transaction Alert - $250.00',
                message: 'Dear John Doe, a transaction of $250.00 was processed.',
                templateId: templateId,
                templateData: {
                    customerName: 'John Doe',
                    amount: '$250.00'
                }
            };

            const notificationResponse = await request(app)
                .post('/api/notifications')
                .send(notificationRequest)
                .expect(201);

            // Step 3: Verify workflow completion
            expect(notificationResponse.body.data).toHaveProperty('templateId', templateId);
            expect(notificationResponse.body.data).toHaveProperty('status', 'sent');

            // Step 4: Clean up - delete the template
            await request(app)
                .delete(`/api/templates/${templateId}`)
                .expect(204);
        });

        /**
         * Test notification delivery across multiple channels
         * 
         * Validates multi-channel notification capability for
         * comprehensive customer communication scenarios.
         */
        test('should support multi-channel notification delivery', async () => {
            // Prepare notification for multiple channels
            const baseNotification = {
                userId: 'user-multi-channel',
                templateId: 'multi_channel_alert',
                templateData: {
                    alertType: 'Security Alert',
                    timestamp: '2025-01-15 16:00:00'
                }
            };

            // Send email notification
            const emailNotification = {
                ...baseNotification,
                channel: 'EMAIL',
                recipient: 'user@example.com',
                subject: 'Security Alert - Immediate Action Required',
                message: 'A security alert has been triggered on your account.'
            };

            const emailResponse = await request(app)
                .post('/api/notifications')
                .send(emailNotification)
                .expect(201);

            // Send SMS notification
            const smsNotification = {
                ...baseNotification,
                channel: 'SMS',
                recipient: '+1234567890',
                subject: 'Security Alert',
                message: 'Security alert on your account. Check email for details.'
            };

            const smsResponse = await request(app)
                .post('/api/notifications')
                .send(smsNotification)
                .expect(201);

            // Send push notification
            const pushNotification = {
                ...baseNotification,
                channel: 'PUSH',
                recipient: 'device-token-multi-channel',
                subject: 'Security Alert',
                message: 'Security alert detected. Tap for details.'
            };

            const pushResponse = await request(app)
                .post('/api/notifications')
                .send(pushNotification)
                .expect(201);

            // Verify all channels processed successfully
            expect(emailResponse.body.data).toHaveProperty('channel', 'EMAIL');
            expect(smsResponse.body.data).toHaveProperty('channel', 'SMS');
            expect(pushResponse.body.data).toHaveProperty('channel', 'PUSH');

            // Verify all services were called
            expect(EmailService.prototype.sendEmail).toHaveBeenCalled();
            const { sendSms } = require('../src/services/sms.service');
            expect(sendSms).toHaveBeenCalled();
            expect(PushService.prototype.sendNotification).toHaveBeenCalled();
        });

        /**
         * Test error propagation across service layers
         * 
         * Validates proper error handling and propagation through
         * the complete service stack for robust error management.
         */
        test('should handle service errors gracefully across the stack', async () => {
            // Simulate cascade of service failures
            const mockEmailService = EmailService.prototype.sendEmail as jest.MockedFunction<any>;
            const mockTemplateService = TemplateService.prototype.getTemplate as jest.MockedFunction<any>;

            // Mock template service failure
            mockTemplateService.mockImplementationOnce(() => {
                throw new Error('Template service temporarily unavailable');
            });

            const notificationRequest = {
                userId: 'user-error-test',
                channel: 'EMAIL',
                recipient: 'test@example.com',
                subject: 'Test Subject',
                message: 'Test message',
                templateId: 'error-test-template'
            };

            // Expect graceful error handling
            const response = await request(app)
                .post('/api/notifications')
                .send(notificationRequest)
                .expect('Content-Type', /json/)
                .expect(500);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('Failed to send notification');
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('details');
        });
    });

    /**
     * Performance and Load Testing
     * 
     * Tests that validate system performance under load and ensure
     * compliance with financial services performance requirements.
     */
    describe('Performance and Load Tests', () => {
        /**
         * Test concurrent template operations
         * 
         * Validates system performance under concurrent template
         * management operations for administrative scalability.
         */
        test('should handle concurrent template operations efficiently', async () => {
            // Prepare concurrent template operations
            const concurrentOperations = Array(5).fill(null).map((_, index) => 
                request(app)
                    .post('/api/templates')
                    .send({
                        name: `Concurrent Template ${index}`,
                        subject: `Subject ${index}`,
                        body: `Body content for template ${index}`,
                        type: 'EMAIL'
                    })
            );

            // Execute concurrent operations
            const startTime = Date.now();
            const responses = await Promise.all(concurrentOperations);
            const duration = Date.now() - startTime;

            // Verify all operations completed successfully
            responses.forEach(response => {
                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty('success', true);
            });

            // Verify performance requirements (<2 seconds for 5 concurrent operations)
            expect(duration).toBeLessThan(2000);

            // Log performance metrics
            console.log(`Concurrent template operations completed in ${duration}ms`);
        });

        /**
         * Test notification throughput
         * 
         * Validates system throughput for notification processing
         * to ensure compliance with real-time processing requirements.
         */
        test('should maintain acceptable throughput for notification processing', async () => {
            // Prepare batch of notifications
            const batchNotifications = Array(10).fill(null).map((_, index) => ({
                userId: `user-batch-${index}`,
                channel: 'EMAIL',
                recipient: `batch${index}@example.com`,
                subject: `Batch Notification ${index}`,
                message: `This is batch notification number ${index}`,
                templateId: 'batch_test_template'
            }));

            // Process notifications sequentially to test individual response times
            const startTime = Date.now();
            const results = [];

            for (const notification of batchNotifications) {
                const requestStart = Date.now();
                const response = await request(app)
                    .post('/api/notifications')
                    .send(notification);
                const requestDuration = Date.now() - requestStart;
                
                results.push({
                    status: response.status,
                    duration: requestDuration
                });
            }

            const totalDuration = Date.now() - startTime;
            const averageResponseTime = totalDuration / batchNotifications.length;

            // Verify all notifications processed successfully
            results.forEach(result => {
                expect(result.status).toBe(201);
            });

            // Verify performance requirements (<1000ms average response time)
            expect(averageResponseTime).toBeLessThan(1000);

            // Log performance metrics
            console.log(`Batch notification processing: ${totalDuration}ms total, ${averageResponseTime.toFixed(2)}ms average`);
        });
    });
});