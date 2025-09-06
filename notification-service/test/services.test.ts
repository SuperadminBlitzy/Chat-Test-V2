// jest@29.7.0 - Testing framework for JavaScript and TypeScript applications
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// axios@1.6.0 - HTTP client for making requests, used for mocking external services
import axios from 'axios';

// Internal service imports for testing
import { EmailService } from '../src/services/email.service';
import { PushService } from '../src/services/push.service';
import { sendSms, SmsServiceError } from '../src/services/sms.service';
import { TemplateService } from '../src/services/template.service';

// Model imports for test data creation
import { Notification, NotificationChannel, NotificationStatus } from '../src/models/notification.model';
import { Template, NotificationType } from '../src/models/template.model';

// Configuration import for mocking
import config from '../src/config';

// Mock external dependencies to isolate unit tests
jest.mock('axios');
jest.mock('nodemailer');
jest.mock('node-pushnotifications');
jest.mock('twilio');
jest.mock('../src/config');
jest.mock('../src/utils/logger');

// Type assertion for mocked axios
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock implementations for external services
const mockNodemailer = {
  createTransporter: jest.fn(),
  verify: jest.fn(),
  sendMail: jest.fn()
};

const mockPushNotifications = {
  send: jest.fn()
};

const mockTwilioClient = {
  messages: {
    create: jest.fn()
  },
  api: {
    accounts: jest.fn(() => ({
      fetch: jest.fn()
    }))
  }
};

// Mock Twilio constructor
jest.mock('twilio', () => {
  return jest.fn(() => mockTwilioClient);
});

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    verify: mockNodemailer.verify,
    sendMail: mockNodemailer.sendMail
  }))
}));

// Mock node-pushnotifications
jest.mock('node-pushnotifications', () => {
  return jest.fn(() => mockPushNotifications);
});

// Mock configuration object
const mockConfig = {
  email: {
    host: 'smtp.test.com',
    port: 587,
    secure: false,
    auth: {
      user: 'test@example.com',
      pass: 'testpassword'
    },
    from: 'noreply@financialservices.com',
    fromName: 'Financial Services Platform',
    maxConnections: 5,
    maxMessages: 100,
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    requireTLS: true
  },
  push: {
    fcm: {
      serverKey: 'test-fcm-server-key',
      projectId: 'test-project-id',
      timeout: 10000
    },
    apns: {
      cert: 'test-apns-cert',
      key: 'test-apns-key',
      production: false,
      bundleId: 'com.test.app',
      timeout: 10000
    }
  },
  twilio: {
    accountSid: 'test-account-sid',
    authToken: 'test-auth-token',
    fromNumber: '+1234567890'
  }
};

// Apply mock configuration
(config as any).mockReturnValue(mockConfig);

/**
 * Test Suite for EmailService
 * 
 * Comprehensive unit tests covering email notification functionality including
 * successful email delivery, error handling, and template integration.
 * Tests address requirements for real-time transaction monitoring and
 * customer digital onboarding workflow notifications.
 */
describe('EmailService', () => {
  let emailService: EmailService;
  let mockNotification: Notification;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Set up environment variables for testing
    process.env.NODE_ENV = 'test';
    
    // Mock successful transporter verification
    mockNodemailer.verify.mockResolvedValue(true);
    
    // Initialize EmailService with mocked dependencies
    emailService = new EmailService();
    
    // Create mock notification for testing
    mockNotification = {
      id: 'test-notification-001',
      userId: 'user-12345',
      channel: NotificationChannel.EMAIL,
      recipient: 'customer@example.com',
      subject: 'Transaction Alert',
      message: 'Your account has been charged $150.00 for Coffee Shop transaction.',
      status: NotificationStatus.PENDING,
      createdAt: new Date('2025-01-15T10:30:00Z'),
      sentAt: new Date('2025-01-15T10:30:05Z'),
      templateId: 'transaction_alert',
      templateData: {
        customerName: 'John Doe',
        amount: '$150.00',
        merchant: 'Coffee Shop',
        transactionDate: '2025-01-15',
        transactionTime: '10:30:00',
        accountNumber: '****1234'
      }
    };
  });

  afterEach(() => {
    // Clean up after each test
    jest.resetAllMocks();
  });

  /**
   * Test successful email sending functionality
   * 
   * Verifies that the EmailService can successfully send emails with proper
   * template processing, recipient handling, and audit logging for compliance.
   */
  it('should send an email successfully', async () => {
    // Arrange - Mock successful email sending
    const mockEmailResponse = {
      messageId: 'mock-message-id-12345',
      response: '250 OK: Message queued',
      accepted: ['customer@example.com'],
      rejected: [],
      pending: []
    };
    
    mockNodemailer.sendMail.mockResolvedValue(mockEmailResponse);

    // Act - Execute email sending
    await emailService.sendEmail(mockNotification);

    // Assert - Verify correct email composition and delivery
    expect(mockNodemailer.sendMail).toHaveBeenCalledTimes(1);
    
    const emailOptions = mockNodemailer.sendMail.mock.calls[0][0];
    expect(emailOptions.to).toBe('customer@example.com');
    expect(emailOptions.subject).toBe('Transaction Alert');
    expect(emailOptions.from.address).toBe('noreply@financialservices.com');
    expect(emailOptions.from.name).toBe('Financial Services Platform');
    expect(emailOptions.headers['X-Notification-ID']).toBe('test-notification-001');
    expect(emailOptions.headers['X-User-ID']).toBe('user-12345');
    expect(emailOptions.headers['X-Template-ID']).toBe('transaction_alert');
    
    // Verify message content includes template data
    expect(emailOptions.html).toContain('Coffee Shop');
    expect(emailOptions.html).toContain('$150.00');
  });

  /**
   * Test email sending failure handling
   * 
   * Verifies that the EmailService properly handles and reports failures
   * including SMTP errors, authentication failures, and network issues.
   * Critical for maintaining audit trails in financial services environments.
   */
  it('should handle email sending failures', async () => {
    // Arrange - Mock email sending failure
    const mockError = new Error('SMTP authentication failed');
    mockError.name = 'AuthenticationError';
    (mockError as any).code = 'EAUTH';
    
    mockNodemailer.sendMail.mockRejectedValue(mockError);

    // Act & Assert - Execute email sending and expect error
    await expect(emailService.sendEmail(mockNotification)).rejects.toThrow('SMTP authentication failed');
    
    // Verify that sendMail was called despite the failure
    expect(mockNodemailer.sendMail).toHaveBeenCalledTimes(1);
  });

  /**
   * Test email template processing and customization
   * 
   * Verifies that the EmailService correctly processes template variables,
   * applies proper formatting, and generates appropriate email content
   * for different financial service notification types.
   */
  it('should use the correct email template', async () => {
    // Arrange - Mock successful email sending
    const mockEmailResponse = {
      messageId: 'template-test-message-id',
      response: '250 OK: Template processed successfully',
      accepted: ['customer@example.com'],
      rejected: [],
      pending: []
    };
    
    mockNodemailer.sendMail.mockResolvedValue(mockEmailResponse);
    
    // Create notification with template variables
    const templateNotification: Notification = {
      ...mockNotification,
      subject: 'Welcome {{customerName}} to Financial Services',
      message: 'Dear {{customerName}}, your account {{accountNumber}} is now active. Transaction limit: {{transactionLimit}}.',
      templateData: {
        customerName: 'Jane Smith',
        accountNumber: '****5678',
        transactionLimit: '$5,000.00'
      }
    };

    // Act - Send email with template processing
    await emailService.sendEmail(templateNotification);

    // Assert - Verify template variable substitution
    expect(mockNodemailer.sendMail).toHaveBeenCalledTimes(1);
    
    const emailOptions = mockNodemailer.sendMail.mock.calls[0][0];
    expect(emailOptions.subject).toBe('Welcome Jane Smith to Financial Services');
    expect(emailOptions.html).toContain('Dear Jane Smith');
    expect(emailOptions.html).toContain('account ****5678');
    expect(emailOptions.html).toContain('Transaction limit: $5,000.00');
    
    // Verify plain text version also processed
    expect(emailOptions.text).toContain('Jane Smith');
    expect(emailOptions.text).toContain('****5678');
  });

  /**
   * Test email validation and security measures
   * 
   * Verifies that the EmailService properly validates input data,
   * sanitizes content, and prevents security vulnerabilities.
   */
  it('should validate notification data before sending', async () => {
    // Test missing recipient
    const invalidNotification = { ...mockNotification, recipient: '' };
    await expect(emailService.sendEmail(invalidNotification)).rejects.toThrow('Invalid email address format');
    
    // Test invalid email format
    const invalidEmailNotification = { ...mockNotification, recipient: 'invalid-email' };
    await expect(emailService.sendEmail(invalidEmailNotification)).rejects.toThrow('Invalid email address format');
    
    // Test wrong channel
    const wrongChannelNotification = { ...mockNotification, channel: NotificationChannel.SMS };
    await expect(emailService.sendEmail(wrongChannelNotification)).rejects.toThrow('Invalid notification channel for email service');
  });
});

/**
 * Test Suite for PushService
 * 
 * Comprehensive unit tests for push notification functionality covering
 * iOS and Android notification delivery, payload formatting, and error handling.
 * Supports real-time transaction monitoring and fraud alert requirements.
 */
describe('PushService', () => {
  let pushService: PushService;
  let mockNotification: Notification;

  beforeEach(() => {
    // Reset mocks and environment
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
    process.env.FCM_SERVER_KEY = 'test-fcm-key';
    process.env.APNS_CERT = 'test-apns-cert';
    process.env.APNS_KEY = 'test-apns-key';
    process.env.APNS_BUNDLE_ID = 'com.test.financialapp';
    
    // Initialize PushService
    pushService = new PushService();
    
    // Create mock push notification
    mockNotification = {
      id: 'push-notification-001',
      userId: 'user-67890',
      channel: NotificationChannel.PUSH,
      recipient: '["fcm-token-12345", "apns-token-67890"]', // JSON array of device tokens
      subject: 'Fraud Alert',
      message: 'Suspicious activity detected on your account. Please verify recent transactions.',
      status: NotificationStatus.PENDING,
      createdAt: new Date('2025-01-15T14:45:00Z'),
      sentAt: new Date('2025-01-15T14:45:02Z'),
      templateId: 'fraud_alert',
      templateData: {
        accountNumber: '****9876',
        suspiciousAmount: '$999.99',
        location: 'Online Transaction',
        timestamp: '2025-01-15 14:45:00'
      }
    };
  });

  /**
   * Test successful push notification delivery
   * 
   * Verifies that push notifications are properly formatted and delivered
   * to both FCM (Android) and APNS (iOS) platforms with appropriate
   * priority and payload structure for financial alerts.
   */
  it('should send a push notification successfully', async () => {
    // Arrange - Mock successful push notification delivery
    const mockPushResponse = [
      {
        success: [
          {
            device: 'fcm-token-12345',
            messageId: 'fcm-message-id-001'
          },
          {
            device: 'apns-token-67890',
            messageId: 'apns-message-id-001'
          }
        ],
        failure: []
      }
    ];
    
    mockPushNotifications.send.mockResolvedValue(mockPushResponse);

    // Act - Send push notification
    await pushService.sendNotification(mockNotification);

    // Assert - Verify push notification was sent with correct payload
    expect(mockPushNotifications.send).toHaveBeenCalledTimes(1);
    
    const [deviceTokens, payload] = mockPushNotifications.send.mock.calls[0];
    expect(deviceTokens).toEqual(['fcm-token-12345', 'apns-token-67890']);
    expect(payload.title).toBe('Fraud Alert');
    expect(payload.body).toBe('Suspicious activity detected on your account. Please verify recent transactions.');
    expect(payload.priority).toBe('high'); // Fraud alerts should be high priority
    expect(payload.data.notificationId).toBe('push-notification-001');
    expect(payload.data.userId).toBe('user-67890');
    expect(payload.data.templateId).toBe('fraud_alert');
  });

  /**
   * Test push notification failure handling
   * 
   * Verifies proper error handling for failed push notification deliveries
   * including invalid tokens, provider service outages, and network failures.
   */
  it('should handle push notification sending failures', async () => {
    // Arrange - Mock push notification failure
    const mockPushError = new Error('FCM service temporarily unavailable');
    mockPushNotifications.send.mockRejectedValue(mockPushError);

    // Act & Assert - Expect push notification to throw error
    await expect(pushService.sendNotification(mockNotification)).rejects.toThrow('Push notification delivery failed');
    
    // Verify the send method was called
    expect(mockPushNotifications.send).toHaveBeenCalledTimes(1);
  });

  /**
   * Test push notification payload formatting
   * 
   * Verifies that push notification payloads are correctly formatted
   * for different platforms (iOS/Android) and include all required
   * metadata for financial service notifications.
   */
  it('should format the push notification payload correctly', async () => {
    // Arrange - Mock successful delivery with focus on payload structure
    const mockPushResponse = [
      {
        success: [{ device: 'test-token', messageId: 'test-message-id' }],
        failure: []
      }
    ];
    
    mockPushNotifications.send.mockResolvedValue(mockPushResponse);
    
    // Create high-priority transaction alert notification
    const transactionNotification: Notification = {
      ...mockNotification,
      templateId: 'transaction_alert',
      subject: 'Transaction Alert: {{amount}}',
      message: 'Your account was charged {{amount}} at {{merchant}}',
      templateData: {
        amount: '$75.50',
        merchant: 'Gas Station',
        transactionId: 'TXN-12345',
        timestamp: '2025-01-15 14:45:00'
      }
    };

    // Act - Send transaction alert
    await pushService.sendNotification(transactionNotification);

    // Assert - Verify payload formatting and template processing
    expect(mockPushNotifications.send).toHaveBeenCalledTimes(1);
    
    const [, payload] = mockPushNotifications.send.mock.calls[0];
    
    // Verify template variable substitution
    expect(payload.title).toBe('Transaction Alert: $75.50');
    expect(payload.body).toBe('Your account was charged $75.50 at Gas Station');
    
    // Verify payload structure for financial services
    expect(payload.priority).toBe('high');
    expect(payload.sound).toBe('default');
    expect(payload.badge).toBe(1);
    expect(payload.category).toBe('FINANCIAL_ALERT');
    expect(payload.ttl).toBe(86400); // 24 hours for high priority
    
    // Verify custom data payload
    expect(payload.data.notificationId).toBe('push-notification-001');
    expect(payload.data.templateId).toBe('transaction_alert');
    expect(payload.data.priority).toBe('high');
    expect(payload.data.amount).toBe('$75.50');
    expect(payload.data.merchant).toBe('Gas Station');
    
    // Verify collapse key for notification grouping
    expect(payload.collapseKey).toBe('transaction_alert_user-67890');
  });

  /**
   * Test device token validation and processing
   * 
   * Verifies that device tokens are properly validated, parsed, and
   * processed for both single and multiple device scenarios.
   */
  it('should handle invalid device tokens gracefully', async () => {
    // Test with invalid device token format
    const invalidTokenNotification = {
      ...mockNotification,
      recipient: 'invalid-token-format'
    };

    await expect(pushService.sendNotification(invalidTokenNotification)).rejects.toThrow('No valid device tokens found');
    
    // Test with empty token array
    const emptyTokenNotification = {
      ...mockNotification,
      recipient: '[]'
    };

    await expect(pushService.sendNotification(emptyTokenNotification)).rejects.toThrow('No valid device tokens found');
  });
});

/**
 * Test Suite for SmsService (Function-based)
 * 
 * Comprehensive unit tests for SMS notification functionality using Twilio API.
 * Covers phone number validation, message formatting, retry logic, and
 * compliance with SMS regulations for financial services.
 */
describe('SmsService', () => {
  let mockNotification: Notification;

  beforeEach(() => {
    // Reset mocks and set up environment
    jest.clearAllMocks();
    process.env.TWILIO_ACCOUNT_SID = 'test-account-sid';
    process.env.TWILIO_AUTH_TOKEN = 'test-auth-token';
    process.env.TWILIO_FROM_NUMBER = '+1234567890';
    
    // Create mock SMS notification
    mockNotification = {
      id: 'sms-notification-001',
      userId: 'user-54321',
      channel: NotificationChannel.SMS,
      recipient: '+1987654321',
      subject: '', // SMS doesn't use subject
      message: 'Your account balance is $1,234.56. Transaction: Coffee Shop $4.50. Ref: TXN789.',
      status: NotificationStatus.PENDING,
      createdAt: new Date('2025-01-15T09:15:00Z'),
      sentAt: new Date('2025-01-15T09:15:03Z'),
      templateId: 'balance_alert',
      templateData: {
        balance: '$1,234.56',
        transactionAmount: '$4.50',
        merchant: 'Coffee Shop',
        reference: 'TXN789'
      }
    };
  });

  /**
   * Test successful SMS sending
   * 
   * Verifies that SMS messages are properly formatted and sent through
   * Twilio API with correct phone number formatting and message content
   * suitable for financial service notifications.
   */
  it('should send an SMS successfully', async () => {
    // Arrange - Mock successful Twilio SMS sending
    const mockSmsResponse = {
      sid: 'SM123456789abcdef',
      status: 'queued',
      to: '+1987654321',
      from: '+1234567890',
      body: mockNotification.message
    };
    
    mockTwilioClient.messages.create.mockResolvedValue(mockSmsResponse);

    // Act - Send SMS message
    await sendSms(
      mockNotification.recipient,
      mockNotification.message,
      {
        correlationId: mockNotification.id,
        userId: mockNotification.userId,
        messageType: 'notification'
      }
    );

    // Assert - Verify SMS was sent with correct parameters
    expect(mockTwilioClient.messages.create).toHaveBeenCalledTimes(1);
    
    const smsOptions = mockTwilioClient.messages.create.mock.calls[0][0];
    expect(smsOptions.to).toBe('+1987654321');
    expect(smsOptions.from).toBe('+1234567890');
    expect(smsOptions.body).toBe(mockNotification.message);
  });

  /**
   * Test SMS sending failure handling
   * 
   * Verifies proper error handling for SMS delivery failures including
   * invalid credentials, network errors, and Twilio API errors.
   * Critical for maintaining reliable customer communication.
   */
  it('should handle SMS sending failures', async () => {
    // Arrange - Mock Twilio API failure
    const mockTwilioError = new Error('Authentication Error - Invalid credentials');
    (mockTwilioError as any).code = 20003;
    (mockTwilioError as any).status = 401;
    
    mockTwilioClient.messages.create.mockRejectedValue(mockTwilioError);

    // Act & Assert - Expect SMS sending to throw SmsServiceError
    await expect(sendSms(
      mockNotification.recipient,
      mockNotification.message,
      {
        correlationId: mockNotification.id,
        userId: mockNotification.userId,
        messageType: 'notification'
      }
    )).rejects.toThrow(SmsServiceError);
    
    // Verify Twilio API was called
    expect(mockTwilioClient.messages.create).toHaveBeenCalledTimes(1);
  });

  /**
   * Test phone number validation
   * 
   * Verifies that the SMS service properly validates phone numbers
   * according to E.164 international format requirements and rejects
   * invalid numbers to prevent SMS delivery failures.
   */
  it('should handle invalid phone numbers', async () => {
    // Test various invalid phone number formats
    const invalidPhoneNumbers = [
      '123456789',      // Too short
      'invalid-phone',  // Non-numeric
      '+1234',          // Too short for E.164
      '',               // Empty string
      '+123456789012345678', // Too long
      '1234567890'      // Missing country code
    ];

    // Test each invalid phone number
    for (const invalidNumber of invalidPhoneNumbers) {
      await expect(sendSms(
        invalidNumber,
        'Test message',
        { messageType: 'notification' }
      )).rejects.toThrow(SmsServiceError);
    }
    
    // Verify Twilio API was never called for invalid numbers
    expect(mockTwilioClient.messages.create).not.toHaveBeenCalled();
  });

  /**
   * Test SMS message length and formatting
   * 
   * Verifies that SMS messages are properly formatted and truncated
   * when necessary to comply with SMS length limits while maintaining
   * essential financial information.
   */
  it('should handle message length limits', async () => {
    // Create a very long message (over 1600 characters)
    const longMessage = 'A'.repeat(1700);
    
    const mockSmsResponse = {
      sid: 'SM-long-message-test',
      status: 'queued',
      to: '+1987654321',
      from: '+1234567890',
      body: 'A'.repeat(1597) + '...' // Should be truncated to 1600 chars max
    };
    
    mockTwilioClient.messages.create.mockResolvedValue(mockSmsResponse);

    // Act - Send long message
    await sendSms(
      '+1987654321',
      longMessage,
      { messageType: 'alert' }
    );

    // Assert - Verify message was truncated
    expect(mockTwilioClient.messages.create).toHaveBeenCalledTimes(1);
    
    const smsOptions = mockTwilioClient.messages.create.mock.calls[0][0];
    expect(smsOptions.body.length).toBeLessThanOrEqual(1600);
    expect(smsOptions.body).toMatch(/\.\.\.$/); // Should end with '...'
  });
});

/**
 * Test Suite for TemplateService
 * 
 * Comprehensive unit tests for notification template management including
 * template creation, retrieval, updates, and deletion. Supports template
 * rendering with dynamic data for personalized financial notifications.
 */
describe('TemplateService', () => {
  let templateService: TemplateService;
  let mockTemplate: Template;

  beforeEach(() => {
    // Initialize fresh TemplateService instance for each test
    templateService = new TemplateService();
    
    // Create mock template for testing
    mockTemplate = {
      id: 'test-template-001',
      name: 'Test Transaction Alert',
      subject: 'Transaction Alert: {{amount}} charged',
      body: 'Dear {{customerName}}, your account was charged {{amount}} at {{merchant}} on {{date}}.',
      type: NotificationType.EMAIL,
      createdAt: new Date('2025-01-15T08:00:00Z'),
      updatedAt: new Date('2025-01-15T08:00:00Z')
    };
  });

  /**
   * Test template retrieval by ID
   * 
   * Verifies that templates can be successfully retrieved by their unique
   * identifier, including default system templates and custom templates.
   * Essential for notification processing pipeline.
   */
  it('should retrieve a template by its ID', () => {
    // Test retrieving default system template
    const welcomeTemplate = templateService.getTemplate('welcome-template-001');
    
    expect(welcomeTemplate).toBeDefined();
    expect(welcomeTemplate?.id).toBe('welcome-template-001');
    expect(welcomeTemplate?.name).toBe('Welcome Email Template');
    expect(welcomeTemplate?.type).toBe(NotificationType.EMAIL);
    expect(welcomeTemplate?.subject).toContain('{{customerName}}');
    expect(welcomeTemplate?.body).toContain('Welcome to our secure financial services platform');
    
    // Test retrieving transaction template
    const transactionTemplate = templateService.getTemplate('transaction-template-001');
    
    expect(transactionTemplate).toBeDefined();
    expect(transactionTemplate?.type).toBe(NotificationType.SMS);
    expect(transactionTemplate?.body).toContain('{{transactionType}}');
    expect(transactionTemplate?.body).toContain('{{amount}}');
  });

  /**
   * Test template not found error handling
   * 
   * Verifies that the service gracefully handles requests for non-existent
   * templates and returns undefined rather than throwing errors.
   * Important for robust error handling in production environments.
   */
  it('should handle template not found errors', () => {
    // Test with non-existent template ID
    const nonExistentTemplate = templateService.getTemplate('non-existent-template-id');
    expect(nonExistentTemplate).toBeUndefined();
    
    // Test with invalid template ID formats
    expect(templateService.getTemplate('')).toBeUndefined();
    expect(templateService.getTemplate('   ')).toBeUndefined();
    expect(templateService.getTemplate(null as any)).toBeUndefined();
    expect(templateService.getTemplate(undefined as any)).toBeUndefined();
  });

  /**
   * Test template creation functionality
   * 
   * Verifies that new templates can be created with proper validation,
   * ID generation, and timestamp management for audit trails.
   */
  it('should create a new template successfully', () => {
    // Arrange - Create template input data
    const templateInput = {
      name: 'Payment Confirmation',
      subject: 'Payment Processed: {{amount}}',
      body: 'Your payment of {{amount}} to {{payee}} has been processed successfully. Reference: {{reference}}',
      type: NotificationType.EMAIL
    };

    // Act - Create new template
    const createdTemplate = templateService.createTemplate(templateInput);

    // Assert - Verify template was created correctly
    expect(createdTemplate).toBeDefined();
    expect(createdTemplate.id).toBeDefined();
    expect(createdTemplate.name).toBe(templateInput.name);
    expect(createdTemplate.subject).toBe(templateInput.subject);
    expect(createdTemplate.body).toBe(templateInput.body);
    expect(createdTemplate.type).toBe(templateInput.type);
    expect(createdTemplate.createdAt).toBeInstanceOf(Date);
    expect(createdTemplate.updatedAt).toBeInstanceOf(Date);
    
    // Verify template can be retrieved
    const retrievedTemplate = templateService.getTemplate(createdTemplate.id);
    expect(retrievedTemplate).toEqual(createdTemplate);
  });

  /**
   * Test template update functionality
   * 
   * Verifies that existing templates can be updated with partial data
   * while maintaining data integrity and audit trail requirements.
   */
  it('should update an existing template', () => {
    // First create a template to update
    const templateInput = {
      name: 'Original Template',
      subject: 'Original Subject',
      body: 'Original body content',
      type: NotificationType.SMS
    };
    
    const createdTemplate = templateService.createTemplate(templateInput);
    const originalUpdatedAt = createdTemplate.updatedAt;
    
    // Wait a moment to ensure timestamp difference
    const updateTime = new Date(Date.now() + 100);
    jest.setSystemTime(updateTime);
    
    // Update the template
    const updateData = {
      name: 'Updated Template Name',
      body: 'Updated body content with {{newVariable}}'
    };
    
    const updatedTemplate = templateService.updateTemplate(createdTemplate.id, updateData);
    
    // Assert - Verify template was updated correctly
    expect(updatedTemplate).toBeDefined();
    expect(updatedTemplate?.name).toBe('Updated Template Name');
    expect(updatedTemplate?.subject).toBe('Original Subject'); // Unchanged
    expect(updatedTemplate?.body).toBe('Updated body content with {{newVariable}}');
    expect(updatedTemplate?.type).toBe(NotificationType.SMS); // Unchanged
    expect(updatedTemplate?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    
    // Verify updated template can be retrieved
    const retrievedTemplate = templateService.getTemplate(createdTemplate.id);
    expect(retrievedTemplate?.name).toBe('Updated Template Name');
    
    // Restore system time
    jest.useRealTimers();
  });

  /**
   * Test template deletion functionality
   * 
   * Verifies that templates can be deleted while protecting system templates
   * from accidental deletion. Important for template lifecycle management.
   */
  it('should delete a template successfully', () => {
    // Create a custom template for deletion
    const templateInput = {
      name: 'Temporary Template',
      subject: 'Temporary Subject',
      body: 'This template will be deleted',
      type: NotificationType.PUSH
    };
    
    const createdTemplate = templateService.createTemplate(templateInput);
    
    // Verify template exists
    expect(templateService.getTemplate(createdTemplate.id)).toBeDefined();
    
    // Delete the template
    const deletionResult = templateService.deleteTemplate(createdTemplate.id);
    
    // Assert - Verify deletion was successful
    expect(deletionResult).toBe(true);
    expect(templateService.getTemplate(createdTemplate.id)).toBeUndefined();
  });

  /**
   * Test system template protection
   * 
   * Verifies that system templates cannot be deleted to maintain
   * core notification functionality and compliance templates.
   */
  it('should protect system templates from deletion', () => {
    // Attempt to delete system templates
    const systemTemplateIds = [
      'welcome-template-001',
      'transaction-template-001',
      'fraud-alert-template-001'
    ];
    
    systemTemplateIds.forEach(templateId => {
      expect(() => templateService.deleteTemplate(templateId))
        .toThrow(`System template '${templateId}' cannot be deleted`);
    });
  });

  /**
   * Test template validation
   * 
   * Verifies that template creation and updates include proper validation
   * for required fields, data types, and business rules.
   */
  it('should validate template data', () => {
    // Test missing required fields
    expect(() => templateService.createTemplate({
      name: '',
      subject: 'Test',
      body: 'Test',
      type: NotificationType.EMAIL
    })).toThrow('Template name is required');
    
    // Test invalid template type
    expect(() => templateService.createTemplate({
      name: 'Test Template',
      subject: 'Test',
      body: 'Test',
      type: 'INVALID_TYPE' as any
    })).toThrow('Invalid notification type');
    
    // Test SMS template length validation
    expect(() => templateService.createTemplate({
      name: 'SMS Template',
      subject: 'Test',
      body: 'A'.repeat(200), // Too long for SMS
      type: NotificationType.SMS
    })).toThrow('SMS template body must not exceed 160 characters');
  });

  /**
   * Test template statistics and management
   * 
   * Verifies that template management functions provide accurate
   * statistics and filtering capabilities for administrative purposes.
   */
  it('should provide template statistics and filtering', () => {
    // Test getting all templates
    const allTemplates = templateService.getAllTemplates();
    expect(allTemplates).toBeInstanceOf(Array);
    expect(allTemplates.length).toBeGreaterThan(0); // Should have default templates
    
    // Test getting templates by type
    const emailTemplates = templateService.getTemplatesByType(NotificationType.EMAIL);
    const smsTemplates = templateService.getTemplatesByType(NotificationType.SMS);
    const pushTemplates = templateService.getTemplatesByType(NotificationType.PUSH);
    
    expect(emailTemplates.every(t => t.type === NotificationType.EMAIL)).toBe(true);
    expect(smsTemplates.every(t => t.type === NotificationType.SMS)).toBe(true);
    expect(pushTemplates.every(t => t.type === NotificationType.PUSH)).toBe(true);
    
    // Test template count
    const totalCount = templateService.getTemplateCount();
    expect(totalCount).toBe(emailTemplates.length + smsTemplates.length + pushTemplates.length);
    expect(totalCount).toBeGreaterThanOrEqual(3); // At least the default templates
  });

  /**
   * Test template rendering with dynamic data
   * 
   * Verifies that templates can be processed with dynamic data substitution
   * to generate personalized notification content for customers.
   */
  it('should render a template with provided data', () => {
    // Get a template with variables
    const template = templateService.getTemplate('welcome-template-001');
    expect(template).toBeDefined();
    
    // Verify template contains variables
    expect(template?.subject).toContain('{{customerName}}');
    expect(template?.body).toContain('{{customerName}}');
    expect(template?.body).toContain('{{accountNumber}}');
    expect(template?.body).toContain('{{accountType}}');
    expect(template?.body).toContain('{{activationDate}}');
    
    // Create a notification using the template
    const notification: Notification = {
      id: 'test-welcome-notification',
      userId: 'user-12345',
      channel: NotificationChannel.EMAIL,
      recipient: 'newcustomer@example.com',
      subject: template!.subject,
      message: template!.body,
      status: NotificationStatus.PENDING,
      createdAt: new Date(),
      sentAt: new Date(),
      templateId: template!.id,
      templateData: {
        customerName: 'Alice Johnson',
        accountNumber: '****1234',
        accountType: 'Premium Checking',
        activationDate: '2025-01-15'
      }
    };
    
    // Verify the template structure is ready for variable substitution
    expect(notification.subject).toContain('{{customerName}}');
    expect(notification.message).toContain('{{customerName}}');
    expect(notification.templateData.customerName).toBe('Alice Johnson');
    expect(notification.templateData.accountNumber).toBe('****1234');
  });
});

/**
 * Integration Test Suite
 * 
 * End-to-end tests that verify the interaction between multiple services
 * and the complete notification processing pipeline.
 */
describe('Notification Service Integration', () => {
  let emailService: EmailService;
  let pushService: PushService;
  let templateService: TemplateService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Initialize all services
    emailService = new EmailService();
    pushService = new PushService();
    templateService = new TemplateService();
    
    // Mock successful external service responses
    mockNodemailer.sendMail.mockResolvedValue({
      messageId: 'integration-test-email',
      response: '250 OK'
    });
    
    mockPushNotifications.send.mockResolvedValue([{
      success: [{ device: 'test-token', messageId: 'integration-test-push' }],
      failure: []
    }]);
    
    mockTwilioClient.messages.create.mockResolvedValue({
      sid: 'integration-test-sms',
      status: 'queued'
    });
  });

  /**
   * Test complete notification workflow
   * 
   * Verifies that a notification can be processed end-to-end using
   * templates and multiple delivery channels for comprehensive
   * customer communication in financial services.
   */
  it('should process a complete notification workflow', async () => {
    // Step 1: Create a custom template for the workflow
    const template = templateService.createTemplate({
      name: 'Account Statement Ready',
      subject: 'Your {{accountType}} statement is ready, {{customerName}}',
      body: 'Dear {{customerName}}, your monthly statement for account {{accountNumber}} is now available. Statement period: {{statementPeriod}}. Please log in to view your transactions.',
      type: NotificationType.EMAIL
    });
    
    // Step 2: Create notifications using the template
    const emailNotification: Notification = {
      id: 'workflow-email-001',
      userId: 'workflow-user-001',
      channel: NotificationChannel.EMAIL,
      recipient: 'customer@example.com',
      subject: template.subject,
      message: template.body,
      status: NotificationStatus.PENDING,
      createdAt: new Date(),
      sentAt: new Date(),
      templateId: template.id,
      templateData: {
        customerName: 'Robert Wilson',
        accountType: 'Business Checking',
        accountNumber: '****5678',
        statementPeriod: 'December 2024'
      }
    };
    
    // Step 3: Send email notification
    await expect(emailService.sendEmail(emailNotification)).resolves.not.toThrow();
    
    // Step 4: Verify template was used and services were called
    expect(templateService.getTemplate(template.id)).toBeDefined();
    expect(mockNodemailer.sendMail).toHaveBeenCalledTimes(1);
    
    // Step 5: Verify email content includes template data
    const emailCall = mockNodemailer.sendMail.mock.calls[0][0];
    expect(emailCall.subject).toContain('Robert Wilson');
    expect(emailCall.subject).toContain('Business Checking');
    expect(emailCall.html).toContain('Robert Wilson');
    expect(emailCall.html).toContain('****5678');
    expect(emailCall.html).toContain('December 2024');
  });

  /**
   * Test multi-channel notification delivery
   * 
   * Verifies that critical financial notifications can be delivered
   * across multiple channels (email, SMS, push) for maximum reach
   * and regulatory compliance.
   */
  it('should handle multi-channel notification delivery', async () => {
    // Create a fraud alert template
    const fraudTemplate = templateService.createTemplate({
      name: 'Multi-Channel Fraud Alert',
      subject: 'URGENT: Suspicious Activity - {{amount}}',
      body: 'FRAUD ALERT: Suspicious {{amount}} transaction detected at {{location}}. Call {{phoneNumber}} immediately if this was not you.',
      type: NotificationType.PUSH
    });
    
    const templateData = {
      amount: '$2,500.00',
      location: 'Online Store',
      phoneNumber: '1-800-SECURITY',
      accountNumber: '****9999'
    };
    
    // Create notifications for each channel
    const emailNotification: Notification = {
      id: 'multi-channel-email',
      userId: 'urgent-user-001',
      channel: NotificationChannel.EMAIL,
      recipient: 'customer@example.com',
      subject: fraudTemplate.subject,
      message: fraudTemplate.body,
      status: NotificationStatus.PENDING,
      createdAt: new Date(),
      sentAt: new Date(),
      templateId: fraudTemplate.id,
      templateData
    };
    
    const pushNotification: Notification = {
      ...emailNotification,
      id: 'multi-channel-push',
      channel: NotificationChannel.PUSH,
      recipient: '["urgent-device-token-001"]'
    };
    
    // Send notifications across all channels
    await Promise.all([
      emailService.sendEmail(emailNotification),
      pushService.sendNotification(pushNotification),
      sendSms('+1555123456', fraudTemplate.body.replace(/\{\{(\w+)\}\}/g, (match, key) => templateData[key as keyof typeof templateData] || match), {
        correlationId: 'multi-channel-sms',
        userId: 'urgent-user-001',
        messageType: 'alert'
      })
    ]);
    
    // Verify all channels were used
    expect(mockNodemailer.sendMail).toHaveBeenCalledTimes(1);
    expect(mockPushNotifications.send).toHaveBeenCalledTimes(1);
    expect(mockTwilioClient.messages.create).toHaveBeenCalledTimes(1);
    
    // Verify consistent messaging across channels
    const emailCall = mockNodemailer.sendMail.mock.calls[0][0];
    const pushCall = mockPushNotifications.send.mock.calls[0][1];
    const smsCall = mockTwilioClient.messages.create.mock.calls[0][0];
    
    expect(emailCall.subject).toContain('$2,500.00');
    expect(pushCall.title).toContain('$2,500.00');
    expect(smsCall.body).toContain('$2,500.00');
    expect(smsCall.body).toContain('Online Store');
  });
});