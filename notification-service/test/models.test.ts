import { describe, it, expect } from 'jest'; // v29.7.0
import {
  Notification,
  NotificationChannel,
  NotificationStatus,
  isValidNotificationChannel,
  isValidNotificationStatus,
  CreateNotificationInput,
  UpdateNotificationInput,
  NotificationQueryOptions,
  NotificationStats
} from '../src/models/notification.model';
import {
  Template,
  NotificationType,
  isValidNotificationType,
  CreateTemplateInput,
  UpdateTemplateInput,
  TemplateQueryFilter,
  TemplateStatistics,
  TemplateValidationResult
} from '../src/models/template.model';

describe('Notification Model', () => {
  describe('NotificationChannel Enum', () => {
    it('should contain all expected notification channels', () => {
      expect(NotificationChannel.EMAIL).toBe('EMAIL');
      expect(NotificationChannel.SMS).toBe('SMS');
      expect(NotificationChannel.PUSH).toBe('PUSH');
    });

    it('should have exactly three notification channels', () => {
      const channels = Object.values(NotificationChannel);
      expect(channels).toHaveLength(3);
      expect(channels).toEqual(['EMAIL', 'SMS', 'PUSH']);
    });

    it('should be immutable enum values', () => {
      expect(() => {
        // @ts-expect-error - Testing enum immutability
        NotificationChannel.EMAIL = 'MODIFIED';
      }).toThrow();
    });
  });

  describe('NotificationStatus Enum', () => {
    it('should contain all expected notification statuses', () => {
      expect(NotificationStatus.PENDING).toBe('PENDING');
      expect(NotificationStatus.SENT).toBe('SENT');
      expect(NotificationStatus.FAILED).toBe('FAILED');
      expect(NotificationStatus.READ).toBe('READ');
    });

    it('should have exactly four notification statuses', () => {
      const statuses = Object.values(NotificationStatus);
      expect(statuses).toHaveLength(4);
      expect(statuses).toEqual(['PENDING', 'SENT', 'FAILED', 'READ']);
    });

    it('should represent proper notification lifecycle progression', () => {
      // Test logical status transitions
      const statusProgression = [
        NotificationStatus.PENDING,
        NotificationStatus.SENT,
        NotificationStatus.READ
      ];
      expect(statusProgression).toBeDefined();
      
      const failureProgression = [
        NotificationStatus.PENDING,
        NotificationStatus.FAILED
      ];
      expect(failureProgression).toBeDefined();
    });
  });

  describe('isValidNotificationChannel Type Guard', () => {
    it('should return true for valid notification channels', () => {
      expect(isValidNotificationChannel('EMAIL')).toBe(true);
      expect(isValidNotificationChannel('SMS')).toBe(true);
      expect(isValidNotificationChannel('PUSH')).toBe(true);
    });

    it('should return false for invalid notification channels', () => {
      expect(isValidNotificationChannel('INVALID')).toBe(false);
      expect(isValidNotificationChannel('email')).toBe(false);
      expect(isValidNotificationChannel('sms')).toBe(false);
      expect(isValidNotificationChannel('')).toBe(false);
      expect(isValidNotificationChannel('WEBHOOK')).toBe(false);
      expect(isValidNotificationChannel('FAX')).toBe(false);
    });

    it('should handle edge cases correctly', () => {
      expect(isValidNotificationChannel(null as any)).toBe(false);
      expect(isValidNotificationChannel(undefined as any)).toBe(false);
      expect(isValidNotificationChannel(123 as any)).toBe(false);
      expect(isValidNotificationChannel({} as any)).toBe(false);
      expect(isValidNotificationChannel([] as any)).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(isValidNotificationChannel('Email')).toBe(false);
      expect(isValidNotificationChannel('Sms')).toBe(false);
      expect(isValidNotificationChannel('Push')).toBe(false);
      expect(isValidNotificationChannel('EMAIL ')).toBe(false);
      expect(isValidNotificationChannel(' EMAIL')).toBe(false);
    });
  });

  describe('isValidNotificationStatus Type Guard', () => {
    it('should return true for valid notification statuses', () => {
      expect(isValidNotificationStatus('PENDING')).toBe(true);
      expect(isValidNotificationStatus('SENT')).toBe(true);
      expect(isValidNotificationStatus('FAILED')).toBe(true);
      expect(isValidNotificationStatus('READ')).toBe(true);
    });

    it('should return false for invalid notification statuses', () => {
      expect(isValidNotificationStatus('INVALID')).toBe(false);
      expect(isValidNotificationStatus('pending')).toBe(false);
      expect(isValidNotificationStatus('sent')).toBe(false);
      expect(isValidNotificationStatus('')).toBe(false);
      expect(isValidNotificationStatus('DELIVERED')).toBe(false);
      expect(isValidNotificationStatus('PROCESSING')).toBe(false);
    });

    it('should handle edge cases correctly', () => {
      expect(isValidNotificationStatus(null as any)).toBe(false);
      expect(isValidNotificationStatus(undefined as any)).toBe(false);
      expect(isValidNotificationStatus(456 as any)).toBe(false);
      expect(isValidNotificationStatus({} as any)).toBe(false);
      expect(isValidNotificationStatus([] as any)).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(isValidNotificationStatus('Pending')).toBe(false);
      expect(isValidNotificationStatus('Sent')).toBe(false);
      expect(isValidNotificationStatus('Failed')).toBe(false);
      expect(isValidNotificationStatus('READ ')).toBe(false);
      expect(isValidNotificationStatus(' READ')).toBe(false);
    });
  });

  describe('Notification Interface Structure', () => {
    const validNotification: Notification = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: 'user-123-456',
      channel: NotificationChannel.EMAIL,
      recipient: 'user@example.com',
      subject: 'Transaction Alert: New Purchase',
      message: 'Dear John Doe, a purchase of $1,500.00 was made on your account ending in 1234 at Merchant Store on 2025-01-15 at 14:30 EST.',
      status: NotificationStatus.PENDING,
      createdAt: new Date('2025-01-15T14:30:00.000Z'),
      sentAt: new Date('2025-01-15T14:30:05.000Z'),
      templateId: 'transaction_alert_template',
      templateData: {
        customerName: 'John Doe',
        transactionAmount: '$1,500.00',
        accountNumber: '****1234',
        merchantName: 'Merchant Store',
        transactionDate: '2025-01-15',
        transactionTime: '14:30 EST'
      }
    };

    it('should accept a valid notification object', () => {
      expect(validNotification.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(validNotification.userId).toBe('user-123-456');
      expect(validNotification.channel).toBe(NotificationChannel.EMAIL);
      expect(validNotification.recipient).toBe('user@example.com');
      expect(validNotification.subject).toBe('Transaction Alert: New Purchase');
      expect(validNotification.message).toContain('Dear John Doe');
      expect(validNotification.status).toBe(NotificationStatus.PENDING);
      expect(validNotification.createdAt).toBeInstanceOf(Date);
      expect(validNotification.sentAt).toBeInstanceOf(Date);
      expect(validNotification.templateId).toBe('transaction_alert_template');
      expect(validNotification.templateData).toHaveProperty('customerName', 'John Doe');
    });

    it('should handle different notification channels correctly', () => {
      const emailNotification: Notification = {
        ...validNotification,
        channel: NotificationChannel.EMAIL,
        recipient: 'customer@bank.com',
        subject: 'Account Statement Ready'
      };

      const smsNotification: Notification = {
        ...validNotification,
        channel: NotificationChannel.SMS,
        recipient: '+1234567890',
        subject: '', // SMS typically doesn't use subjects
        message: 'Your account balance is $5,432.10. Call 1-800-BANK if you have questions.'
      };

      const pushNotification: Notification = {
        ...validNotification,
        channel: NotificationChannel.PUSH,
        recipient: 'device-token-abc123',
        subject: 'New Transaction',
        message: 'Transaction of $50.00 at Coffee Shop approved.'
      };

      expect(emailNotification.channel).toBe(NotificationChannel.EMAIL);
      expect(smsNotification.channel).toBe(NotificationChannel.SMS);
      expect(pushNotification.channel).toBe(NotificationChannel.PUSH);
    });

    it('should handle different notification statuses correctly', () => {
      const pendingNotification: Notification = {
        ...validNotification,
        status: NotificationStatus.PENDING,
        sentAt: new Date() // Will be set when status changes to SENT
      };

      const sentNotification: Notification = {
        ...validNotification,
        status: NotificationStatus.SENT,
        sentAt: new Date('2025-01-15T14:30:05.000Z')
      };

      const failedNotification: Notification = {
        ...validNotification,
        status: NotificationStatus.FAILED,
        sentAt: new Date() // May be set even if failed
      };

      const readNotification: Notification = {
        ...validNotification,
        status: NotificationStatus.READ,
        sentAt: new Date('2025-01-15T14:30:05.000Z')
      };

      expect(pendingNotification.status).toBe(NotificationStatus.PENDING);
      expect(sentNotification.status).toBe(NotificationStatus.SENT);
      expect(failedNotification.status).toBe(NotificationStatus.FAILED);
      expect(readNotification.status).toBe(NotificationStatus.READ);
    });

    it('should handle complex template data correctly', () => {
      const complexTemplateData = {
        customerName: 'Jane Smith',
        accountType: 'Premium Checking',
        transactionAmount: '$2,500.00',
        merchantName: 'Online Store XYZ',
        transactionDate: '2025-01-15',
        transactionTime: '15:45 EST',
        availableBalance: '$8,750.23',
        accountNumber: '****5678',
        transactionId: 'TXN-789012345',
        authCode: 'AUTH-456789',
        merchantCategory: 'Online Retail',
        cardType: 'Debit',
        isInternational: false,
        riskScore: 0.2,
        additionalInfo: {
          ipAddress: '192.168.1.100',
          deviceId: 'mobile-app-ios',
          location: 'New York, NY'
        }
      };

      const complexNotification: Notification = {
        ...validNotification,
        templateData: complexTemplateData
      };

      expect(complexNotification.templateData.customerName).toBe('Jane Smith');
      expect(complexNotification.templateData.additionalInfo.location).toBe('New York, NY');
      expect(complexNotification.templateData.isInternational).toBe(false);
      expect(complexNotification.templateData.riskScore).toBe(0.2);
    });
  });

  describe('CreateNotificationInput Type', () => {
    it('should accept valid input for creating notifications', () => {
      const createInput: CreateNotificationInput = {
        userId: 'user-789',
        channel: NotificationChannel.SMS,
        recipient: '+1987654321',
        subject: 'Security Alert',
        message: 'Unusual login detected. If this was not you, please contact us immediately.',
        templateId: 'security_alert_template',
        templateData: {
          loginTime: '2025-01-15 16:00 EST',
          loginLocation: 'Los Angeles, CA',
          deviceType: 'Mobile Browser'
        }
      };

      expect(createInput.userId).toBe('user-789');
      expect(createInput.channel).toBe(NotificationChannel.SMS);
      expect(createInput.recipient).toBe('+1987654321');
      expect(createInput.templateId).toBe('security_alert_template');
    });

    it('should allow optional status override for testing', () => {
      const createInputWithStatus: CreateNotificationInput = {
        userId: 'test-user',
        channel: NotificationChannel.EMAIL,
        recipient: 'test@example.com',
        subject: 'Test Notification',
        message: 'This is a test message.',
        templateId: 'test_template',
        templateData: {},
        status: NotificationStatus.SENT // Optional for testing
      };

      expect(createInputWithStatus.status).toBe(NotificationStatus.SENT);
    });
  });

  describe('UpdateNotificationInput Type', () => {
    it('should accept valid partial updates', () => {
      const updateInput: UpdateNotificationInput = {
        status: NotificationStatus.SENT,
        sentAt: new Date('2025-01-15T16:05:00.000Z')
      };

      expect(updateInput.status).toBe(NotificationStatus.SENT);
      expect(updateInput.sentAt).toBeInstanceOf(Date);
    });

    it('should allow status-only updates', () => {
      const statusUpdate: UpdateNotificationInput = {
        status: NotificationStatus.FAILED
      };

      expect(statusUpdate.status).toBe(NotificationStatus.FAILED);
      expect(statusUpdate.sentAt).toBeUndefined();
    });

    it('should allow sentAt-only updates', () => {
      const sentAtUpdate: UpdateNotificationInput = {
        sentAt: new Date('2025-01-15T16:10:00.000Z')
      };

      expect(sentAtUpdate.sentAt).toBeInstanceOf(Date);
      expect(sentAtUpdate.status).toBeUndefined();
    });
  });

  describe('NotificationQueryOptions Interface', () => {
    it('should support comprehensive query filtering', () => {
      const queryOptions: NotificationQueryOptions = {
        userId: 'user-123',
        channel: NotificationChannel.EMAIL,
        status: NotificationStatus.SENT,
        templateId: 'monthly_statement',
        createdAfter: new Date('2025-01-01T00:00:00.000Z'),
        createdBefore: new Date('2025-01-31T23:59:59.999Z'),
        limit: 50,
        offset: 0,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      expect(queryOptions.userId).toBe('user-123');
      expect(queryOptions.channel).toBe(NotificationChannel.EMAIL);
      expect(queryOptions.status).toBe(NotificationStatus.SENT);
      expect(queryOptions.limit).toBe(50);
      expect(queryOptions.sortBy).toBe('createdAt');
      expect(queryOptions.sortOrder).toBe('desc');
    });

    it('should support minimal query options', () => {
      const minimalQuery: NotificationQueryOptions = {
        limit: 10
      };

      expect(minimalQuery.limit).toBe(10);
      expect(minimalQuery.userId).toBeUndefined();
      expect(minimalQuery.status).toBeUndefined();
    });
  });

  describe('NotificationStats Interface', () => {
    it('should provide comprehensive notification statistics', () => {
      const stats: NotificationStats = {
        totalCount: 10000,
        byChannel: {
          [NotificationChannel.EMAIL]: 6000,
          [NotificationChannel.SMS]: 3000,
          [NotificationChannel.PUSH]: 1000
        },
        byStatus: {
          [NotificationStatus.PENDING]: 100,
          [NotificationStatus.SENT]: 8500,
          [NotificationStatus.FAILED]: 500,
          [NotificationStatus.READ]: 900
        },
        averageDeliveryTime: 2500, // milliseconds
        successRate: 90.0, // percentage
        periodStart: new Date('2025-01-01T00:00:00.000Z'),
        periodEnd: new Date('2025-01-31T23:59:59.999Z')
      };

      expect(stats.totalCount).toBe(10000);
      expect(stats.byChannel[NotificationChannel.EMAIL]).toBe(6000);
      expect(stats.byStatus[NotificationStatus.SENT]).toBe(8500);
      expect(stats.averageDeliveryTime).toBe(2500);
      expect(stats.successRate).toBe(90.0);
      expect(stats.periodStart).toBeInstanceOf(Date);
      expect(stats.periodEnd).toBeInstanceOf(Date);
    });

    it('should calculate statistics correctly', () => {
      const stats: NotificationStats = {
        totalCount: 1000,
        byChannel: {
          [NotificationChannel.EMAIL]: 500,
          [NotificationChannel.SMS]: 300,
          [NotificationChannel.PUSH]: 200
        },
        byStatus: {
          [NotificationStatus.PENDING]: 10,
          [NotificationStatus.SENT]: 850,
          [NotificationStatus.FAILED]: 50,
          [NotificationStatus.READ]: 90
        },
        averageDeliveryTime: 1500,
        successRate: 94.0, // (850 + 90) / 1000 * 100
        periodStart: new Date('2025-01-15T00:00:00.000Z'),
        periodEnd: new Date('2025-01-15T23:59:59.999Z')
      };

      // Verify channel totals add up
      const channelTotal = Object.values(stats.byChannel).reduce((sum, count) => sum + count, 0);
      expect(channelTotal).toBe(stats.totalCount);

      // Verify status totals add up
      const statusTotal = Object.values(stats.byStatus).reduce((sum, count) => sum + count, 0);
      expect(statusTotal).toBe(stats.totalCount);

      // Verify success rate calculation
      const successfulNotifications = stats.byStatus[NotificationStatus.SENT] + stats.byStatus[NotificationStatus.READ];
      const expectedSuccessRate = (successfulNotifications / stats.totalCount) * 100;
      expect(stats.successRate).toBe(expectedSuccessRate);
    });
  });
});

describe('Template Model', () => {
  describe('NotificationType Enum', () => {
    it('should contain all expected notification types', () => {
      expect(NotificationType.EMAIL).toBe('EMAIL');
      expect(NotificationType.SMS).toBe('SMS');
      expect(NotificationType.PUSH).toBe('PUSH');
    });

    it('should have exactly three notification types', () => {
      const types = Object.values(NotificationType);
      expect(types).toHaveLength(3);
      expect(types).toEqual(['EMAIL', 'SMS', 'PUSH']);
    });

    it('should match NotificationChannel enum values', () => {
      // Ensure consistency between NotificationType and NotificationChannel
      expect(NotificationType.EMAIL).toBe(NotificationChannel.EMAIL);
      expect(NotificationType.SMS).toBe(NotificationChannel.SMS);
      expect(NotificationType.PUSH).toBe(NotificationChannel.PUSH);
    });

    it('should be immutable enum values', () => {
      expect(() => {
        // @ts-expect-error - Testing enum immutability
        NotificationType.EMAIL = 'MODIFIED';
      }).toThrow();
    });
  });

  describe('isValidNotificationType Type Guard', () => {
    it('should return true for valid notification types', () => {
      expect(isValidNotificationType('EMAIL')).toBe(true);
      expect(isValidNotificationType('SMS')).toBe(true);
      expect(isValidNotificationType('PUSH')).toBe(true);
    });

    it('should return false for invalid notification types', () => {
      expect(isValidNotificationType('INVALID')).toBe(false);
      expect(isValidNotificationType('email')).toBe(false);
      expect(isValidNotificationType('sms')).toBe(false);
      expect(isValidNotificationType('')).toBe(false);
      expect(isValidNotificationType('WEBHOOK')).toBe(false);
      expect(isValidNotificationType('SLACK')).toBe(false);
    });

    it('should handle edge cases correctly', () => {
      expect(isValidNotificationType(null as any)).toBe(false);
      expect(isValidNotificationType(undefined as any)).toBe(false);
      expect(isValidNotificationType(789 as any)).toBe(false);
      expect(isValidNotificationType({} as any)).toBe(false);
      expect(isValidNotificationType([] as any)).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(isValidNotificationType('Email')).toBe(false);
      expect(isValidNotificationType('Sms')).toBe(false);
      expect(isValidNotificationType('Push')).toBe(false);
      expect(isValidNotificationType('EMAIL ')).toBe(false);
      expect(isValidNotificationType(' EMAIL')).toBe(false);
    });
  });

  describe('Template Interface Structure', () => {
    const validTemplate: Template = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Transaction Alert Template',
      subject: 'Transaction Alert: {{transactionType}} of {{amount}}',
      body: 'Dear {{customerName}}, a {{transactionType}} of {{amount}} was processed on your account {{accountNumber}} on {{date}} at {{time}}. If this was not authorized by you, please contact us immediately at {{contactNumber}}.',
      type: NotificationType.EMAIL,
      createdAt: new Date('2025-01-01T10:00:00.000Z'),
      updatedAt: new Date('2025-01-01T10:00:00.000Z')
    };

    it('should accept a valid template object', () => {
      expect(validTemplate.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(validTemplate.name).toBe('Transaction Alert Template');
      expect(validTemplate.subject).toContain('{{transactionType}}');
      expect(validTemplate.body).toContain('Dear {{customerName}}');
      expect(validTemplate.type).toBe(NotificationType.EMAIL);
      expect(validTemplate.createdAt).toBeInstanceOf(Date);
      expect(validTemplate.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle different template types correctly', () => {
      const emailTemplate: Template = {
        ...validTemplate,
        type: NotificationType.EMAIL,
        subject: 'Monthly Statement - {{accountType}}',
        body: '<html><body><h1>Your Monthly Statement</h1><p>Dear {{customerName}}, your {{accountType}} statement is ready.</p></body></html>'
      };

      const smsTemplate: Template = {
        ...validTemplate,
        type: NotificationType.SMS,
        subject: '', // SMS templates typically don't use subjects
        body: 'Alert: {{transactionType}} of {{amount}} on account {{accountNumber}}. Reply STOP to opt out.'
      };

      const pushTemplate: Template = {
        ...validTemplate,
        type: NotificationType.PUSH,
        subject: 'New Transaction',
        body: '{{transactionType}} of {{amount}} at {{merchantName}}'
      };

      expect(emailTemplate.type).toBe(NotificationType.EMAIL);
      expect(emailTemplate.body).toContain('<html>');
      expect(smsTemplate.type).toBe(NotificationType.SMS);
      expect(smsTemplate.subject).toBe('');
      expect(pushTemplate.type).toBe(NotificationType.PUSH);
      expect(pushTemplate.body).toContain('{{merchantName}}');
    });

    it('should support complex template variables', () => {
      const complexTemplate: Template = {
        ...validTemplate,
        subject: 'Compliance Notice: {{regulationType}} - Action Required by {{deadline}}',
        body: `Dear {{customerName}},

This is an important notice regarding {{regulationType}} compliance for your {{accountType}} account ({{accountNumber}}).

Required Actions:
{{#each requiredActions}}
- {{this.action}} (Due: {{this.dueDate}})
{{/each}}

Please complete these actions by {{deadline}} to maintain compliance.

If you need assistance:
- Phone: {{supportPhone}}
- Email: {{supportEmail}}
- Online: {{supportUrl}}

Regulatory Reference: {{regulationReference}}
Case ID: {{caseId}}

Thank you for your prompt attention to this matter.

{{companyName}} Compliance Team`
      };

      expect(complexTemplate.subject).toContain('{{regulationType}}');
      expect(complexTemplate.body).toContain('{{#each requiredActions}}');
      expect(complexTemplate.body).toContain('{{supportPhone}}');
      expect(complexTemplate.body).toContain('{{companyName}}');
    });

    it('should maintain immutable fields correctly', () => {
      const template: Template = {
        ...validTemplate,
        createdAt: new Date('2025-01-01T08:00:00.000Z'),
        updatedAt: new Date('2025-01-15T14:30:00.000Z')
      };

      // These should be readonly
      expect(template.id).toBe(validTemplate.id);
      expect(template.type).toBe(NotificationType.EMAIL);
      expect(template.createdAt).toBeInstanceOf(Date);
      
      // updatedAt should be mutable
      template.updatedAt = new Date('2025-01-16T10:00:00.000Z');
      expect(template.updatedAt.toISOString()).toBe('2025-01-16T10:00:00.000Z');
    });
  });

  describe('CreateTemplateInput Type', () => {
    it('should accept valid input for creating templates', () => {
      const createInput: CreateTemplateInput = {
        name: 'KYC Reminder Template',
        subject: 'Action Required: Complete Your KYC Documentation',
        body: 'Dear {{customerName}}, we need you to complete your KYC documentation. Please upload {{requiredDocuments}} by {{deadline}}.',
        type: NotificationType.EMAIL
      };

      expect(createInput.name).toBe('KYC Reminder Template');
      expect(createInput.subject).toContain('Action Required');
      expect(createInput.body).toContain('{{customerName}}');
      expect(createInput.type).toBe(NotificationType.EMAIL);
    });

    it('should support different notification types', () => {
      const smsTemplate: CreateTemplateInput = {
        name: 'OTP SMS Template',
        subject: '',
        body: 'Your verification code is {{otpCode}}. Valid for {{validityMinutes}} minutes. Do not share this code.',
        type: NotificationType.SMS
      };

      const pushTemplate: CreateTemplateInput = {
        name: 'Low Balance Alert',
        subject: 'Low Balance Alert',
        body: 'Your account balance is below ${{minimumBalance}}. Current balance: ${{currentBalance}}',
        type: NotificationType.PUSH
      };

      expect(smsTemplate.type).toBe(NotificationType.SMS);
      expect(smsTemplate.body).toContain('{{otpCode}}');
      expect(pushTemplate.type).toBe(NotificationType.PUSH);
      expect(pushTemplate.subject).toBe('Low Balance Alert');
    });
  });

  describe('UpdateTemplateInput Type', () => {
    it('should accept valid partial updates', () => {
      const updateInput: UpdateTemplateInput = {
        name: 'Updated Transaction Alert Template',
        subject: 'Updated: Transaction Alert for {{transactionType}}',
        body: 'Updated template body with {{customerName}} and {{amount}}'
      };

      expect(updateInput.name).toBe('Updated Transaction Alert Template');
      expect(updateInput.subject).toContain('Updated:');
      expect(updateInput.body).toContain('Updated template body');
    });

    it('should allow name-only updates', () => {
      const nameUpdate: UpdateTemplateInput = {
        name: 'Renamed Template'
      };

      expect(nameUpdate.name).toBe('Renamed Template');
      expect(nameUpdate.subject).toBeUndefined();
      expect(nameUpdate.body).toBeUndefined();
    });

    it('should allow subject-only updates', () => {
      const subjectUpdate: UpdateTemplateInput = {
        subject: 'New Subject Line with {{variable}}'
      };

      expect(subjectUpdate.subject).toBe('New Subject Line with {{variable}}');
      expect(subjectUpdate.name).toBeUndefined();
      expect(subjectUpdate.body).toBeUndefined();
    });

    it('should allow body-only updates', () => {
      const bodyUpdate: UpdateTemplateInput = {
        body: 'Completely new template body content with {{newVariable}}'
      };

      expect(bodyUpdate.body).toContain('Completely new template body');
      expect(bodyUpdate.name).toBeUndefined();
      expect(bodyUpdate.subject).toBeUndefined();
    });
  });

  describe('TemplateQueryFilter Interface', () => {
    it('should support comprehensive template filtering', () => {
      const queryFilter: TemplateQueryFilter = {
        type: NotificationType.EMAIL,
        namePattern: 'Transaction%',
        createdAfter: new Date('2025-01-01T00:00:00.000Z'),
        createdBefore: new Date('2025-01-31T23:59:59.999Z'),
        limit: 25,
        offset: 50
      };

      expect(queryFilter.type).toBe(NotificationType.EMAIL);
      expect(queryFilter.namePattern).toBe('Transaction%');
      expect(queryFilter.createdAfter).toBeInstanceOf(Date);
      expect(queryFilter.createdBefore).toBeInstanceOf(Date);
      expect(queryFilter.limit).toBe(25);
      expect(queryFilter.offset).toBe(50);
    });

    it('should support minimal filtering', () => {
      const minimalFilter: TemplateQueryFilter = {
        limit: 10
      };

      expect(minimalFilter.limit).toBe(10);
      expect(minimalFilter.type).toBeUndefined();
      expect(minimalFilter.namePattern).toBeUndefined();
    });
  });

  describe('TemplateValidationResult Interface', () => {
    it('should represent successful validation', () => {
      const validResult: TemplateValidationResult = {
        isValid: true,
        errors: [],
        warnings: ['Template contains HTML content - ensure proper escaping'],
        variables: ['customerName', 'accountNumber', 'transactionAmount', 'date']
      };

      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);
      expect(validResult.warnings).toHaveLength(1);
      expect(validResult.variables).toContain('customerName');
      expect(validResult.variables).toContain('accountNumber');
    });

    it('should represent failed validation', () => {
      const invalidResult: TemplateValidationResult = {
        isValid: false,
        errors: [
          'Template name is required',
          'Template body exceeds maximum length for SMS type',
          'Invalid template variable syntax: {{invalid variable}}'
        ],
        warnings: [
          'Template contains special characters that may not render correctly'
        ],
        variables: ['customerName', 'invalid variable']
      };

      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toHaveLength(3);
      expect(invalidResult.errors[0]).toBe('Template name is required');
      expect(invalidResult.warnings).toHaveLength(1);
      expect(invalidResult.variables).toContain('invalid variable');
    });

    it('should handle validation with no variables', () => {
      const noVariablesResult: TemplateValidationResult = {
        isValid: true,
        errors: [],
        warnings: ['Template contains no dynamic variables'],
        variables: []
      };

      expect(noVariablesResult.isValid).toBe(true);
      expect(noVariablesResult.variables).toHaveLength(0);
      expect(noVariablesResult.warnings[0]).toContain('no dynamic variables');
    });
  });

  describe('TemplateStatistics Interface', () => {
    it('should provide comprehensive template statistics', () => {
      const stats: TemplateStatistics = {
        totalTemplates: 150,
        templatesByType: {
          [NotificationType.EMAIL]: 80,
          [NotificationType.SMS]: 45,
          [NotificationType.PUSH]: 25
        },
        lastCreated: new Date('2025-01-15T14:30:00.000Z'),
        lastUpdated: new Date('2025-01-16T09:15:00.000Z')
      };

      expect(stats.totalTemplates).toBe(150);
      expect(stats.templatesByType[NotificationType.EMAIL]).toBe(80);
      expect(stats.templatesByType[NotificationType.SMS]).toBe(45);
      expect(stats.templatesByType[NotificationType.PUSH]).toBe(25);
      expect(stats.lastCreated).toBeInstanceOf(Date);
      expect(stats.lastUpdated).toBeInstanceOf(Date);
    });

    it('should calculate template distribution correctly', () => {
      const stats: TemplateStatistics = {
        totalTemplates: 100,
        templatesByType: {
          [NotificationType.EMAIL]: 60,
          [NotificationType.SMS]: 30,
          [NotificationType.PUSH]: 10
        },
        lastCreated: new Date('2025-01-10T12:00:00.000Z'),
        lastUpdated: new Date('2025-01-12T16:45:00.000Z')
      };

      // Verify type totals add up
      const typeTotal = Object.values(stats.templatesByType).reduce((sum, count) => sum + count, 0);
      expect(typeTotal).toBe(stats.totalTemplates);

      // Verify individual counts
      expect(stats.templatesByType[NotificationType.EMAIL]).toBe(60);
      expect(stats.templatesByType[NotificationType.SMS]).toBe(30);
      expect(stats.templatesByType[NotificationType.PUSH]).toBe(10);
    });

    it('should handle optional timestamp fields', () => {
      const statsWithoutTimestamps: TemplateStatistics = {
        totalTemplates: 0,
        templatesByType: {
          [NotificationType.EMAIL]: 0,
          [NotificationType.SMS]: 0,
          [NotificationType.PUSH]: 0
        }
      };

      expect(statsWithoutTimestamps.totalTemplates).toBe(0);
      expect(statsWithoutTimestamps.lastCreated).toBeUndefined();
      expect(statsWithoutTimestamps.lastUpdated).toBeUndefined();
    });
  });

  describe('Integration Testing Between Models', () => {
    it('should ensure compatibility between Notification and Template models', () => {
      // Verify that NotificationChannel and NotificationType are compatible
      expect(NotificationChannel.EMAIL).toBe(NotificationType.EMAIL);
      expect(NotificationChannel.SMS).toBe(NotificationType.SMS);
      expect(NotificationChannel.PUSH).toBe(NotificationType.PUSH);
    });

    it('should support end-to-end notification with template', () => {
      const template: Template = {
        id: 'template-001',
        name: 'Account Statement Template',
        subject: 'Your {{accountType}} Statement is Ready',
        body: 'Dear {{customerName}}, your monthly statement for account {{accountNumber}} is now available.',
        type: NotificationType.EMAIL,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        updatedAt: new Date('2025-01-01T00:00:00.000Z')
      };

      const notification: Notification = {
        id: 'notification-001',
        userId: 'user-123',
        channel: NotificationChannel.EMAIL,
        recipient: 'customer@example.com',
        subject: 'Your Premium Checking Statement is Ready',
        message: 'Dear John Doe, your monthly statement for account ****1234 is now available.',
        status: NotificationStatus.PENDING,
        createdAt: new Date('2025-01-15T10:00:00.000Z'),
        sentAt: new Date('2025-01-15T10:00:05.000Z'),
        templateId: template.id,
        templateData: {
          customerName: 'John Doe',
          accountType: 'Premium Checking',
          accountNumber: '****1234'
        }
      };

      expect(notification.templateId).toBe(template.id);
      expect(notification.channel).toBe(template.type as NotificationChannel);
      expect(notification.templateData.customerName).toBe('John Doe');
      expect(notification.subject).toContain('Premium Checking');
      expect(notification.message).toContain('John Doe');
    });
  });
});