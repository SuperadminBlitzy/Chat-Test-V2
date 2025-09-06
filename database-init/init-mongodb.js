const { MongoClient } = require('mongodb'); // mongodb@6.3.0

// Global configuration
const dbUrl = process.env.MONGO_DB_URL || 'mongodb://localhost:27017';
const dbName = 'ufs_db';
const client = new MongoClient(dbUrl, {
  maxPoolSize: 100,
  minPoolSize: 10,
  maxIdleTimeMS: 300000,
  waitQueueTimeoutMS: 10000,
  serverSelectionTimeoutMS: 30000
});

/**
 * Main function to run the database initialization process.
 * Connects to MongoDB, creates collections with validation schemas, and inserts seed data.
 * @returns {Promise<void>} A promise that resolves when the initialization is complete.
 */
async function main() {
  try {
    console.log('🚀 Starting MongoDB database initialization...');
    
    // Initialize the MongoDB client with the connection URL
    await client.connect();
    console.log('✅ Connected to MongoDB server');
    
    // Select the database
    const db = client.db(dbName);
    console.log(`📂 Using database: ${dbName}`);
    
    // Create and seed collections
    await createCustomerProfilesCollection(db);
    await createWellnessProfilesCollection(db);
    await createFinancialGoalsCollection(db);
    await createRecommendationsCollection(db);
    await createAnalyticsDashboardsCollection(db);
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

/**
 * Creates the 'customer_profiles' collection with a JSON schema validator based on the CustomerProfile model.
 * @param {Db} db - The MongoDB database instance
 * @returns {Promise<void>} A promise that resolves when the collection is created.
 */
async function createCustomerProfilesCollection(db) {
  try {
    console.log('📝 Creating customer_profiles collection...');
    
    // Define the JSON schema for the customer_profiles collection
    const customerProfileSchema = {
      $jsonSchema: {
        bsonType: 'object',
        required: ['_id', 'personalInfo', 'createdAt', 'updatedAt'],
        properties: {
          _id: {
            bsonType: 'objectId',
            description: 'Unique identifier for the customer profile'
          },
          personalInfo: {
            bsonType: 'object',
            required: ['firstName', 'lastName', 'email', 'dateOfBirth'],
            properties: {
              firstName: {
                bsonType: 'string',
                minLength: 1,
                maxLength: 100,
                description: 'Customer first name'
              },
              lastName: {
                bsonType: 'string',
                minLength: 1,
                maxLength: 100,
                description: 'Customer last name'
              },
              email: {
                bsonType: 'string',
                pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                description: 'Customer email address'
              },
              phone: {
                bsonType: 'string',
                pattern: '^\\+?[1-9]\\d{1,14}$',
                description: 'Customer phone number in E.164 format'
              },
              dateOfBirth: {
                bsonType: 'date',
                description: 'Customer date of birth'
              },
              nationality: {
                bsonType: 'string',
                minLength: 2,
                maxLength: 3,
                description: 'Customer nationality (ISO country code)'
              }
            }
          },
          addresses: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              required: ['type', 'street', 'city', 'country'],
              properties: {
                type: {
                  enum: ['PRIMARY', 'SECONDARY', 'BILLING', 'MAILING'],
                  description: 'Address type'
                },
                street: {
                  bsonType: 'string',
                  minLength: 5,
                  maxLength: 200,
                  description: 'Street address'
                },
                city: {
                  bsonType: 'string',
                  minLength: 2,
                  maxLength: 100,
                  description: 'City name'
                },
                state: {
                  bsonType: 'string',
                  maxLength: 100,
                  description: 'State or province'
                },
                zipCode: {
                  bsonType: 'string',
                  maxLength: 20,
                  description: 'Postal code'
                },
                country: {
                  bsonType: 'string',
                  minLength: 2,
                  maxLength: 3,
                  description: 'Country code (ISO 3166)'
                }
              }
            }
          },
          identityVerification: {
            bsonType: 'object',
            properties: {
              status: {
                enum: ['PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'],
                description: 'Identity verification status'
              },
              documents: {
                bsonType: 'array',
                items: {
                  bsonType: 'object',
                  required: ['type', 'number', 'expiryDate'],
                  properties: {
                    type: {
                      enum: ['PASSPORT', 'DRIVERS_LICENSE', 'NATIONAL_ID', 'UTILITY_BILL'],
                      description: 'Document type'
                    },
                    number: {
                      bsonType: 'string',
                      minLength: 5,
                      maxLength: 50,
                      description: 'Document number'
                    },
                    expiryDate: {
                      bsonType: 'date',
                      description: 'Document expiry date'
                    },
                    issuingCountry: {
                      bsonType: 'string',
                      minLength: 2,
                      maxLength: 3,
                      description: 'Issuing country code'
                    },
                    verificationStatus: {
                      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
                      description: 'Document verification status'
                    }
                  }
                }
              },
              biometricData: {
                bsonType: 'object',
                properties: {
                  faceMatch: {
                    bsonType: 'bool',
                    description: 'Face matching verification result'
                  },
                  livenessCheck: {
                    bsonType: 'bool',
                    description: 'Liveness detection result'
                  },
                  verificationDate: {
                    bsonType: 'date',
                    description: 'Biometric verification timestamp'
                  }
                }
              }
            }
          },
          riskProfile: {
            bsonType: 'object',
            properties: {
              riskCategory: {
                enum: ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'],
                description: 'Overall risk category'
              },
              riskScore: {
                bsonType: 'number',
                minimum: 0,
                maximum: 1000,
                description: 'Numerical risk score (0-1000)'
              },
              factors: {
                bsonType: 'array',
                items: {
                  bsonType: 'object',
                  required: ['factor', 'weight', 'value'],
                  properties: {
                    factor: {
                      bsonType: 'string',
                      description: 'Risk factor name'
                    },
                    weight: {
                      bsonType: 'number',
                      minimum: 0,
                      maximum: 1,
                      description: 'Factor weight in overall score'
                    },
                    value: {
                      bsonType: 'number',
                      description: 'Factor value'
                    }
                  }
                }
              },
              lastAssessment: {
                bsonType: 'date',
                description: 'Last risk assessment date'
              }
            }
          },
          preferences: {
            bsonType: 'object',
            properties: {
              language: {
                bsonType: 'string',
                minLength: 2,
                maxLength: 5,
                description: 'Preferred language (ISO 639-1)'
              },
              currency: {
                bsonType: 'string',
                minLength: 3,
                maxLength: 3,
                description: 'Preferred currency (ISO 4217)'
              },
              timezone: {
                bsonType: 'string',
                description: 'Preferred timezone (IANA timezone)'
              },
              notifications: {
                bsonType: 'object',
                properties: {
                  email: {
                    bsonType: 'bool',
                    description: 'Email notifications preference'
                  },
                  sms: {
                    bsonType: 'bool',
                    description: 'SMS notifications preference'
                  },
                  push: {
                    bsonType: 'bool',
                    description: 'Push notifications preference'
                  }
                }
              }
            }
          },
          compliance: {
            bsonType: 'object',
            properties: {
              kycStatus: {
                enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'],
                description: 'Know Your Customer status'
              },
              amlStatus: {
                enum: ['CLEAR', 'FLAGGED', 'UNDER_REVIEW'],
                description: 'Anti-Money Laundering status'
              },
              pepStatus: {
                enum: ['NONE', 'PEP', 'FAMILY_MEMBER', 'CLOSE_ASSOCIATE'],
                description: 'Politically Exposed Person status'
              },
              sanctionsCheck: {
                enum: ['CLEAR', 'FLAGGED', 'PENDING'],
                description: 'Sanctions screening status'
              },
              fatcaStatus: {
                enum: ['EXEMPT', 'PARTICIPATING_FFI', 'NON_PARTICIPATING_FFI'],
                description: 'FATCA classification status'
              }
            }
          },
          createdAt: {
            bsonType: 'date',
            description: 'Profile creation timestamp'
          },
          updatedAt: {
            bsonType: 'date',
            description: 'Profile last update timestamp'
          },
          version: {
            bsonType: 'number',
            minimum: 1,
            description: 'Profile version for optimistic locking'
          }
        }
      }
    };
    
    // Create collection with validator
    await db.createCollection('customer_profiles', {
      validator: customerProfileSchema
    });
    
    // Create indexes on critical fields for performance
    await db.collection('customer_profiles').createIndex(
      { 'personalInfo.email': 1 }, 
      { unique: true, name: 'email_unique_idx' }
    );
    await db.collection('customer_profiles').createIndex(
      { 'riskProfile.riskCategory': 1 }, 
      { name: 'risk_category_idx' }
    );
    await db.collection('customer_profiles').createIndex(
      { 'compliance.kycStatus': 1 }, 
      { name: 'kyc_status_idx' }
    );
    await db.collection('customer_profiles').createIndex(
      { 'createdAt': 1 }, 
      { name: 'created_at_idx' }
    );
    
    // Insert sample customer profile documents
    const sampleCustomerProfiles = [
      {
        personalInfo: {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com',
          phone: '+1234567890',
          dateOfBirth: new Date('1985-06-15'),
          nationality: 'US'
        },
        addresses: [{
          type: 'PRIMARY',
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'US'
        }],
        identityVerification: {
          status: 'VERIFIED',
          documents: [{
            type: 'DRIVERS_LICENSE',
            number: 'DL123456789',
            expiryDate: new Date('2026-06-15'),
            issuingCountry: 'US',
            verificationStatus: 'VERIFIED'
          }],
          biometricData: {
            faceMatch: true,
            livenessCheck: true,
            verificationDate: new Date()
          }
        },
        riskProfile: {
          riskCategory: 'LOW',
          riskScore: 250,
          factors: [{
            factor: 'INCOME_STABILITY',
            weight: 0.3,
            value: 850
          }],
          lastAssessment: new Date()
        },
        preferences: {
          language: 'en',
          currency: 'USD',
          timezone: 'America/New_York',
          notifications: {
            email: true,
            sms: true,
            push: true
          }
        },
        compliance: {
          kycStatus: 'APPROVED',
          amlStatus: 'CLEAR',
          pepStatus: 'NONE',
          sanctionsCheck: 'CLEAR',
          fatcaStatus: 'EXEMPT'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      },
      {
        personalInfo: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+1987654321',
          dateOfBirth: new Date('1990-03-22'),
          nationality: 'US'
        },
        addresses: [{
          type: 'PRIMARY',
          street: '456 Oak Avenue',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'US'
        }],
        identityVerification: {
          status: 'VERIFIED',
          documents: [{
            type: 'PASSPORT',
            number: 'P987654321',
            expiryDate: new Date('2028-03-22'),
            issuingCountry: 'US',
            verificationStatus: 'VERIFIED'
          }]
        },
        riskProfile: {
          riskCategory: 'MEDIUM',
          riskScore: 450,
          factors: [{
            factor: 'TRANSACTION_VOLUME',
            weight: 0.4,
            value: 600
          }],
          lastAssessment: new Date()
        },
        preferences: {
          language: 'en',
          currency: 'USD',
          timezone: 'America/Los_Angeles',
          notifications: {
            email: true,
            sms: false,
            push: true
          }
        },
        compliance: {
          kycStatus: 'APPROVED',
          amlStatus: 'CLEAR',
          pepStatus: 'NONE',
          sanctionsCheck: 'CLEAR',
          fatcaStatus: 'EXEMPT'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    ];
    
    await db.collection('customer_profiles').insertMany(sampleCustomerProfiles);
    console.log('✅ customer_profiles collection created with sample data');
    
  } catch (error) {
    console.error('❌ Error creating customer_profiles collection:', error);
    throw error;
  }
}

/**
 * Creates the 'wellness_profiles' collection with a JSON schema validator.
 * @param {Db} db - The MongoDB database instance
 * @returns {Promise<void>} A promise that resolves when the collection is created.
 */
async function createWellnessProfilesCollection(db) {
  try {
    console.log('📝 Creating wellness_profiles collection...');
    
    // Define the JSON schema for the wellness_profiles collection
    const wellnessProfileSchema = {
      $jsonSchema: {
        bsonType: 'object',
        required: ['_id', 'customerId', 'createdAt', 'updatedAt'],
        properties: {
          _id: {
            bsonType: 'objectId',
            description: 'Unique identifier for the wellness profile'
          },
          customerId: {
            bsonType: 'objectId',
            description: 'Reference to customer profile'
          },
          financialHealthScore: {
            bsonType: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Overall financial health score (0-100)'
          },
          budgetingBehavior: {
            bsonType: 'object',
            properties: {
              budgetAdherence: {
                bsonType: 'number',
                minimum: 0,
                maximum: 100,
                description: 'Budget adherence percentage'
              },
              savingsRate: {
                bsonType: 'number',
                minimum: 0,
                maximum: 100,
                description: 'Savings rate percentage'
              },
              spendingPatterns: {
                bsonType: 'array',
                items: {
                  bsonType: 'object',
                  properties: {
                    category: {
                      bsonType: 'string',
                      description: 'Spending category'
                    },
                    percentage: {
                      bsonType: 'number',
                      minimum: 0,
                      maximum: 100,
                      description: 'Percentage of total spending'
                    },
                    trend: {
                      enum: ['INCREASING', 'STABLE', 'DECREASING'],
                      description: 'Spending trend'
                    }
                  }
                }
              }
            }
          },
          debtManagement: {
            bsonType: 'object',
            properties: {
              debtToIncomeRatio: {
                bsonType: 'number',
                minimum: 0,
                description: 'Debt-to-income ratio'
              },
              creditUtilization: {
                bsonType: 'number',
                minimum: 0,
                maximum: 100,
                description: 'Credit utilization percentage'
              },
              paymentHistory: {
                bsonType: 'object',
                properties: {
                  onTimePayments: {
                    bsonType: 'number',
                    minimum: 0,
                    maximum: 100,
                    description: 'On-time payment percentage'
                  },
                  latePayments: {
                    bsonType: 'number',
                    minimum: 0,
                    description: 'Number of late payments'
                  }
                }
              }
            }
          },
          investmentBehavior: {
            bsonType: 'object',
            properties: {
              riskTolerance: {
                enum: ['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'],
                description: 'Investment risk tolerance'
              },
              portfolioDiversification: {
                bsonType: 'number',
                minimum: 0,
                maximum: 100,
                description: 'Portfolio diversification score'
              },
              investmentKnowledge: {
                enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
                description: 'Investment knowledge level'
              }
            }
          },
          goals: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                type: {
                  enum: ['EMERGENCY_FUND', 'RETIREMENT', 'HOME_PURCHASE', 'EDUCATION', 'VACATION', 'DEBT_PAYOFF'],
                  description: 'Goal type'
                },
                targetAmount: {
                  bsonType: 'number',
                  minimum: 0,
                  description: 'Target amount for the goal'
                },
                currentAmount: {
                  bsonType: 'number',
                  minimum: 0,
                  description: 'Current progress amount'
                },
                targetDate: {
                  bsonType: 'date',
                  description: 'Target achievement date'
                },
                priority: {
                  enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                  description: 'Goal priority level'
                }
              }
            }
          },
          insights: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                category: {
                  enum: ['SPENDING', 'SAVING', 'INVESTING', 'DEBT', 'BUDGETING'],
                  description: 'Insight category'
                },
                message: {
                  bsonType: 'string',
                  maxLength: 500,
                  description: 'Insight message'
                },
                priority: {
                  enum: ['LOW', 'MEDIUM', 'HIGH'],
                  description: 'Insight priority'
                },
                actionRequired: {
                  bsonType: 'bool',
                  description: 'Whether action is required'
                }
              }
            }
          },
          lastAnalysis: {
            bsonType: 'date',
            description: 'Last wellness analysis date'
          },
          createdAt: {
            bsonType: 'date',
            description: 'Wellness profile creation timestamp'
          },
          updatedAt: {
            bsonType: 'date',
            description: 'Wellness profile last update timestamp'
          }
        }
      }
    };
    
    // Create collection with validator
    await db.createCollection('wellness_profiles', {
      validator: wellnessProfileSchema
    });
    
    // Create an index on customerId for efficient lookups
    await db.collection('wellness_profiles').createIndex(
      { 'customerId': 1 }, 
      { unique: true, name: 'customer_id_unique_idx' }
    );
    await db.collection('wellness_profiles').createIndex(
      { 'financialHealthScore': 1 }, 
      { name: 'health_score_idx' }
    );
    await db.collection('wellness_profiles').createIndex(
      { 'lastAnalysis': 1 }, 
      { name: 'last_analysis_idx' }
    );
    
    // Insert sample wellness profile documents
    const customerProfiles = await db.collection('customer_profiles').find({}, { _id: 1 }).toArray();
    if (customerProfiles.length > 0) {
      const sampleWellnessProfiles = customerProfiles.slice(0, 2).map((customer, index) => ({
        customerId: customer._id,
        financialHealthScore: index === 0 ? 78 : 65,
        budgetingBehavior: {
          budgetAdherence: index === 0 ? 85 : 72,
          savingsRate: index === 0 ? 15 : 8,
          spendingPatterns: [
            {
              category: 'HOUSING',
              percentage: 35,
              trend: 'STABLE'
            },
            {
              category: 'TRANSPORTATION',
              percentage: 15,
              trend: 'DECREASING'
            },
            {
              category: 'FOOD',
              percentage: 12,
              trend: 'STABLE'
            }
          ]
        },
        debtManagement: {
          debtToIncomeRatio: index === 0 ? 0.25 : 0.45,
          creditUtilization: index === 0 ? 20 : 35,
          paymentHistory: {
            onTimePayments: index === 0 ? 98 : 92,
            latePayments: index === 0 ? 1 : 3
          }
        },
        investmentBehavior: {
          riskTolerance: index === 0 ? 'MODERATE' : 'CONSERVATIVE',
          portfolioDiversification: index === 0 ? 75 : 45,
          investmentKnowledge: index === 0 ? 'INTERMEDIATE' : 'BEGINNER'
        },
        goals: [
          {
            type: 'EMERGENCY_FUND',
            targetAmount: 10000,
            currentAmount: index === 0 ? 7500 : 3000,
            targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            priority: 'HIGH'
          },
          {
            type: 'RETIREMENT',
            targetAmount: 1000000,
            currentAmount: index === 0 ? 150000 : 50000,
            targetDate: new Date(Date.now() + 30 * 365 * 24 * 60 * 60 * 1000), // 30 years from now
            priority: 'MEDIUM'
          }
        ],
        insights: [
          {
            category: 'SPENDING',
            message: 'Your dining out expenses have increased by 15% this month.',
            priority: 'MEDIUM',
            actionRequired: true
          },
          {
            category: 'SAVING',
            message: 'You\'re on track to meet your emergency fund goal.',
            priority: 'LOW',
            actionRequired: false
          }
        ],
        lastAnalysis: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      await db.collection('wellness_profiles').insertMany(sampleWellnessProfiles);
    }
    
    console.log('✅ wellness_profiles collection created with sample data');
    
  } catch (error) {
    console.error('❌ Error creating wellness_profiles collection:', error);
    throw error;
  }
}

/**
 * Creates the 'financial_goals' collection with a JSON schema validator.
 * @param {Db} db - The MongoDB database instance
 * @returns {Promise<void>} A promise that resolves when the collection is created.
 */
async function createFinancialGoalsCollection(db) {
  try {
    console.log('📝 Creating financial_goals collection...');
    
    // Define the JSON schema for the financial_goals collection
    const financialGoalsSchema = {
      $jsonSchema: {
        bsonType: 'object',
        required: ['_id', 'wellnessProfileId', 'name', 'type', 'targetAmount', 'createdAt', 'updatedAt'],
        properties: {
          _id: {
            bsonType: 'objectId',
            description: 'Unique identifier for the financial goal'
          },
          wellnessProfileId: {
            bsonType: 'objectId',
            description: 'Reference to wellness profile'
          },
          name: {
            bsonType: 'string',
            minLength: 1,
            maxLength: 200,
            description: 'Goal name'
          },
          description: {
            bsonType: 'string',
            maxLength: 1000,
            description: 'Goal description'
          },
          type: {
            enum: ['EMERGENCY_FUND', 'RETIREMENT', 'HOME_PURCHASE', 'EDUCATION', 'VACATION', 'DEBT_PAYOFF', 'INVESTMENT', 'OTHER'],
            description: 'Goal type'
          },
          category: {
            enum: ['SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM'],
            description: 'Goal time category'
          },
          targetAmount: {
            bsonType: 'number',
            minimum: 0,
            description: 'Target amount to achieve'
          },
          currentAmount: {
            bsonType: 'number',
            minimum: 0,
            description: 'Current progress amount'
          },
          monthlyContribution: {
            bsonType: 'number',
            minimum: 0,
            description: 'Monthly contribution amount'
          },
          targetDate: {
            bsonType: 'date',
            description: 'Target achievement date'
          },
          priority: {
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            description: 'Goal priority level'
          },
          status: {
            enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'],
            description: 'Goal status'
          },
          progress: {
            bsonType: 'object',
            properties: {
              percentage: {
                bsonType: 'number',
                minimum: 0,
                maximum: 100,
                description: 'Completion percentage'
              },
              milestones: {
                bsonType: 'array',
                items: {
                  bsonType: 'object',
                  properties: {
                    amount: {
                      bsonType: 'number',
                      minimum: 0,
                      description: 'Milestone amount'
                    },
                    date: {
                      bsonType: 'date',
                      description: 'Milestone achievement date'
                    },
                    achieved: {
                      bsonType: 'bool',
                      description: 'Whether milestone is achieved'
                    },
                    description: {
                      bsonType: 'string',
                      maxLength: 200,
                      description: 'Milestone description'
                    }
                  }
                }
              },
              projectedCompletion: {
                bsonType: 'date',
                description: 'Projected completion date based on current progress'
              }
            }
          },
          strategy: {
            bsonType: 'object',
            properties: {
              autoContribute: {
                bsonType: 'bool',
                description: 'Whether to automatically contribute'
              },
              contributionFrequency: {
                enum: ['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY'],
                description: 'Contribution frequency'
              },
              increasePlan: {
                bsonType: 'object',
                properties: {
                  enabled: {
                    bsonType: 'bool',
                    description: 'Whether contribution increase is enabled'
                  },
                  percentage: {
                    bsonType: 'number',
                    minimum: 0,
                    maximum: 100,
                    description: 'Annual contribution increase percentage'
                  },
                  frequency: {
                    enum: ['ANNUALLY', 'BIANNUALLY'],
                    description: 'Increase frequency'
                  }
                }
              }
            }
          },
          linkedAccounts: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                accountId: {
                  bsonType: 'string',
                  description: 'Account identifier'
                },
                accountType: {
                  enum: ['CHECKING', 'SAVINGS', 'INVESTMENT', 'RETIREMENT'],
                  description: 'Account type'
                },
                contributionType: {
                  enum: ['SOURCE', 'DESTINATION'],
                  description: 'How account is used for the goal'
                }
              }
            }
          },
          tags: {
            bsonType: 'array',
            items: {
              bsonType: 'string',
              maxLength: 50,
              description: 'Goal tags for categorization'
            }
          },
          reminders: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                type: {
                  enum: ['CONTRIBUTION', 'MILESTONE', 'REVIEW'],
                  description: 'Reminder type'
                },
                frequency: {
                  enum: ['DAILY', 'WEEKLY', 'MONTHLY'],
                  description: 'Reminder frequency'
                },
                enabled: {
                  bsonType: 'bool',
                  description: 'Whether reminder is enabled'
                },
                lastSent: {
                  bsonType: 'date',
                  description: 'Last reminder sent date'
                }
              }
            }
          },
          createdAt: {
            bsonType: 'date',
            description: 'Goal creation timestamp'
          },
          updatedAt: {
            bsonType: 'date',
            description: 'Goal last update timestamp'
          },
          completedAt: {
            bsonType: 'date',
            description: 'Goal completion timestamp'
          }
        }
      }
    };
    
    // Create collection with validator
    await db.createCollection('financial_goals', {
      validator: financialGoalsSchema
    });
    
    // Create an index on wellnessProfileId for efficient lookups
    await db.collection('financial_goals').createIndex(
      { 'wellnessProfileId': 1 }, 
      { name: 'wellness_profile_id_idx' }
    );
    await db.collection('financial_goals').createIndex(
      { 'type': 1, 'status': 1 }, 
      { name: 'type_status_idx' }
    );
    await db.collection('financial_goals').createIndex(
      { 'targetDate': 1 }, 
      { name: 'target_date_idx' }
    );
    await db.collection('financial_goals').createIndex(
      { 'priority': 1, 'status': 1 }, 
      { name: 'priority_status_idx' }
    );
    
    // Insert sample financial goal documents
    const wellnessProfiles = await db.collection('wellness_profiles').find({}, { _id: 1 }).toArray();
    if (wellnessProfiles.length > 0) {
      const sampleFinancialGoals = [
        {
          wellnessProfileId: wellnessProfiles[0]._id,
          name: 'Emergency Fund',
          description: 'Build an emergency fund to cover 6 months of expenses',
          type: 'EMERGENCY_FUND',
          category: 'SHORT_TERM',
          targetAmount: 25000,
          currentAmount: 8500,
          monthlyContribution: 1000,
          targetDate: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000), // 18 months from now
          priority: 'HIGH',
          status: 'ACTIVE',
          progress: {
            percentage: 34,
            milestones: [
              {
                amount: 5000,
                date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
                achieved: true,
                description: 'First milestone - $5,000'
              },
              {
                amount: 12500,
                date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 4 months from now
                achieved: false,
                description: 'Halfway point - $12,500'
              }
            ],
            projectedCompletion: new Date(Date.now() + 16 * 30 * 24 * 60 * 60 * 1000)
          },
          strategy: {
            autoContribute: true,
            contributionFrequency: 'MONTHLY',
            increasePlan: {
              enabled: true,
              percentage: 5,
              frequency: 'ANNUALLY'
            }
          },
          linkedAccounts: [
            {
              accountId: 'CHK001',
              accountType: 'CHECKING',
              contributionType: 'SOURCE'
            },
            {
              accountId: 'SAV001',
              accountType: 'SAVINGS',
              contributionType: 'DESTINATION'
            }
          ],
          tags: ['emergency', 'safety', 'priority'],
          reminders: [
            {
              type: 'CONTRIBUTION',
              frequency: 'MONTHLY',
              enabled: true,
              lastSent: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          ],
          createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
          updatedAt: new Date()
        },
        {
          wellnessProfileId: wellnessProfiles[0]._id,
          name: 'Dream Home Down Payment',
          description: 'Save for a 20% down payment on our dream home',
          type: 'HOME_PURCHASE',
          category: 'MEDIUM_TERM',
          targetAmount: 80000,
          currentAmount: 12000,
          monthlyContribution: 2000,
          targetDate: new Date(Date.now() + 36 * 30 * 24 * 60 * 60 * 1000), // 3 years from now
          priority: 'MEDIUM',
          status: 'ACTIVE',
          progress: {
            percentage: 15,
            milestones: [
              {
                amount: 20000,
                date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 4 months from now
                achieved: false,
                description: 'First quarter milestone'
              },
              {
                amount: 40000,
                date: new Date(Date.now() + 14 * 30 * 24 * 60 * 60 * 1000), // 14 months from now
                achieved: false,
                description: 'Halfway point'
              }
            ],
            projectedCompletion: new Date(Date.now() + 34 * 30 * 24 * 60 * 60 * 1000)
          },
          strategy: {
            autoContribute: true,
            contributionFrequency: 'MONTHLY',
            increasePlan: {
              enabled: false,
              percentage: 0,
              frequency: 'ANNUALLY'
            }
          },
          linkedAccounts: [
            {
              accountId: 'CHK001',
              accountType: 'CHECKING',
              contributionType: 'SOURCE'
            },
            {
              accountId: 'SAV002',
              accountType: 'SAVINGS',
              contributionType: 'DESTINATION'
            }
          ],
          tags: ['home', 'real-estate', 'major-purchase'],
          reminders: [
            {
              type: 'CONTRIBUTION',
              frequency: 'MONTHLY',
              enabled: true,
              lastSent: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
            },
            {
              type: 'MILESTONE',
              frequency: 'MONTHLY',
              enabled: true,
              lastSent: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          ],
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
          updatedAt: new Date()
        }
      ];
      
      // Add goals for second wellness profile if it exists
      if (wellnessProfiles.length > 1) {
        sampleFinancialGoals.push({
          wellnessProfileId: wellnessProfiles[1]._id,
          name: 'Retirement Fund',
          description: 'Building a comfortable retirement fund for the future',
          type: 'RETIREMENT',
          category: 'LONG_TERM',
          targetAmount: 1000000,
          currentAmount: 45000,
          monthlyContribution: 800,
          targetDate: new Date(Date.now() + 25 * 365 * 24 * 60 * 60 * 1000), // 25 years from now
          priority: 'MEDIUM',
          status: 'ACTIVE',
          progress: {
            percentage: 4.5,
            milestones: [
              {
                amount: 100000,
                date: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 years from now
                achieved: false,
                description: 'First $100K milestone'
              }
            ],
            projectedCompletion: new Date(Date.now() + 23 * 365 * 24 * 60 * 60 * 1000)
          },
          strategy: {
            autoContribute: true,
            contributionFrequency: 'MONTHLY',
            increasePlan: {
              enabled: true,
              percentage: 3,
              frequency: 'ANNUALLY'
            }
          },
          linkedAccounts: [
            {
              accountId: 'CHK002',
              accountType: 'CHECKING',
              contributionType: 'SOURCE'
            },
            {
              accountId: 'RET001',
              accountType: 'RETIREMENT',
              contributionType: 'DESTINATION'
            }
          ],
          tags: ['retirement', 'long-term', 'future'],
          reminders: [
            {
              type: 'CONTRIBUTION',
              frequency: 'MONTHLY',
              enabled: true,
              lastSent: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
            }
          ],
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
          updatedAt: new Date()
        });
      }
      
      await db.collection('financial_goals').insertMany(sampleFinancialGoals);
    }
    
    console.log('✅ financial_goals collection created with sample data');
    
  } catch (error) {
    console.error('❌ Error creating financial_goals collection:', error);
    throw error;
  }
}

/**
 * Creates the 'recommendations' collection with a JSON schema validator.
 * @param {Db} db - The MongoDB database instance
 * @returns {Promise<void>} A promise that resolves when the collection is created.
 */
async function createRecommendationsCollection(db) {
  try {
    console.log('📝 Creating recommendations collection...');
    
    // Define the JSON schema for the recommendations collection
    const recommendationsSchema = {
      $jsonSchema: {
        bsonType: 'object',
        required: ['_id', 'wellnessProfileId', 'type', 'title', 'priority', 'status', 'createdAt', 'updatedAt'],
        properties: {
          _id: {
            bsonType: 'objectId',
            description: 'Unique identifier for the recommendation'
          },
          wellnessProfileId: {
            bsonType: 'objectId',
            description: 'Reference to wellness profile'
          },
          type: {
            enum: ['BUDGETING', 'SAVINGS', 'INVESTMENT', 'DEBT_MANAGEMENT', 'INSURANCE', 'GOAL_OPTIMIZATION', 'SPENDING_OPTIMIZATION', 'TAX_PLANNING'],
            description: 'Recommendation type'
          },
          category: {
            enum: ['IMMEDIATE', 'SHORT_TERM', 'LONG_TERM', 'EMERGENCY'],
            description: 'Recommendation category'
          },
          title: {
            bsonType: 'string',
            minLength: 5,
            maxLength: 200,
            description: 'Recommendation title'
          },
          description: {
            bsonType: 'string',
            maxLength: 2000,
            description: 'Detailed recommendation description'
          },
          priority: {
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            description: 'Recommendation priority'
          },
          status: {
            enum: ['ACTIVE', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'EXPIRED'],
            description: 'Recommendation status'
          },
          impact: {
            bsonType: 'object',
            properties: {
              financialImpact: {
                bsonType: 'number',
                description: 'Potential financial impact in dollars'
              },
              timeToImpact: {
                bsonType: 'string',
                enum: ['IMMEDIATE', 'DAYS', 'WEEKS', 'MONTHS', 'YEARS'],
                description: 'Time frame for impact realization'
              },
              confidenceScore: {
                bsonType: 'number',
                minimum: 0,
                maximum: 100,
                description: 'Confidence score for the recommendation'
              },
              riskLevel: {
                enum: ['LOW', 'MEDIUM', 'HIGH'],
                description: 'Risk level of implementing the recommendation'
              }
            }
          },
          actionItems: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                step: {
                  bsonType: 'number',
                  minimum: 1,
                  description: 'Step number in the action sequence'
                },
                action: {
                  bsonType: 'string',
                  maxLength: 500,
                  description: 'Action description'
                },
                completed: {
                  bsonType: 'bool',
                  description: 'Whether the action is completed'
                },
                completedAt: {
                  bsonType: 'date',
                  description: 'Action completion timestamp'
                },
                difficulty: {
                  enum: ['EASY', 'MEDIUM', 'HARD'],
                  description: 'Difficulty level of the action'
                },
                estimatedTime: {
                  bsonType: 'string',
                  description: 'Estimated time to complete the action'
                }
              }
            }
          },
          triggers: {
            bsonType: 'object',
            properties: {
              dataPoints: {
                bsonType: 'array',
                items: {
                  bsonType: 'string',
                  description: 'Data points that triggered this recommendation'
                }
              },
              thresholds: {
                bsonType: 'array',
                items: {
                  bsonType: 'object',
                  properties: {
                    metric: {
                      bsonType: 'string',
                      description: 'Metric name'
                    },
                    threshold: {
                      bsonType: 'number',
                      description: 'Threshold value'
                    },
                    actualValue: {
                      bsonType: 'number',
                      description: 'Actual metric value'
                    }
                  }
                }
              },
              algorithm: {
                bsonType: 'string',
                maxLength: 100,
                description: 'Algorithm or model that generated the recommendation'
              }
            }
          },
          personalization: {
            bsonType: 'object',
            properties: {
              riskProfile: {
                enum: ['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'],
                description: 'Customer risk profile consideration'
              },
              timeHorizon: {
                enum: ['SHORT', 'MEDIUM', 'LONG'],
                description: 'Customer time horizon preference'
              },
              preferences: {
                bsonType: 'array',
                items: {
                  bsonType: 'string',
                  description: 'Customer preferences that influenced this recommendation'
                }
              },
              restrictions: {
                bsonType: 'array',
                items: {
                  bsonType: 'string',
                  description: 'Customer restrictions or limitations'
                }
              }
            }
          },
          tracking: {
            bsonType: 'object',
            properties: {
              viewedAt: {
                bsonType: 'date',
                description: 'First time recommendation was viewed'
              },
              viewCount: {
                bsonType: 'number',
                minimum: 0,
                description: 'Number of times recommendation was viewed'
              },
              lastInteraction: {
                bsonType: 'date',
                description: 'Last interaction timestamp'
              },
              interactionType: {
                enum: ['VIEWED', 'CLICKED', 'ACCEPTED', 'REJECTED', 'SHARED'],
                description: 'Last interaction type'
              },
              feedback: {
                bsonType: 'object',
                properties: {
                  rating: {
                    bsonType: 'number',
                    minimum: 1,
                    maximum: 5,
                    description: 'Customer rating (1-5 stars)'
                  },
                  comment: {
                    bsonType: 'string',
                    maxLength: 1000,
                    description: 'Customer feedback comment'
                  },
                  submittedAt: {
                    bsonType: 'date',
                    description: 'Feedback submission timestamp'
                  }
                }
              }
            }
          },
          expiresAt: {
            bsonType: 'date',
            description: 'Recommendation expiration timestamp'
          },
          createdAt: {
            bsonType: 'date',
            description: 'Recommendation creation timestamp'
          },
          updatedAt: {
            bsonType: 'date',
            description: 'Recommendation last update timestamp'
          },
          completedAt: {
            bsonType: 'date',
            description: 'Recommendation completion timestamp'
          }
        }
      }
    };
    
    // Create collection with validator
    await db.createCollection('recommendations', {
      validator: recommendationsSchema
    });
    
    // Create an index on wellnessProfileId for efficient lookups
    await db.collection('recommendations').createIndex(
      { 'wellnessProfileId': 1 }, 
      { name: 'wellness_profile_id_idx' }
    );
    await db.collection('recommendations').createIndex(
      { 'type': 1, 'status': 1 }, 
      { name: 'type_status_idx' }
    );
    await db.collection('recommendations').createIndex(
      { 'priority': 1, 'status': 1 }, 
      { name: 'priority_status_idx' }
    );
    await db.collection('recommendations').createIndex(
      { 'expiresAt': 1 }, 
      { name: 'expires_at_idx' }
    );
    await db.collection('recommendations').createIndex(
      { 'createdAt': 1 }, 
      { name: 'created_at_idx' }
    );
    
    // Insert sample recommendation documents
    const wellnessProfiles = await db.collection('wellness_profiles').find({}, { _id: 1 }).toArray();
    if (wellnessProfiles.length > 0) {
      const sampleRecommendations = [
        {
          wellnessProfileId: wellnessProfiles[0]._id,
          type: 'SPENDING_OPTIMIZATION',
          category: 'IMMEDIATE',
          title: 'Reduce Dining Out Expenses',
          description: 'Your dining out expenses have increased by 25% over the past month, impacting your savings goals. Consider meal planning and cooking at home more frequently to save approximately $300-400 per month.',
          priority: 'HIGH',
          status: 'ACTIVE',
          impact: {
            financialImpact: 350,
            timeToImpact: 'IMMEDIATE',
            confidenceScore: 85,
            riskLevel: 'LOW'
          },
          actionItems: [
            {
              step: 1,
              action: 'Create a weekly meal plan and grocery list',
              completed: false,
              difficulty: 'EASY',
              estimatedTime: '30 minutes'
            },
            {
              step: 2,
              action: 'Set a monthly dining out budget of $200',
              completed: false,
              difficulty: 'EASY',
              estimatedTime: '5 minutes'
            },
            {
              step: 3,
              action: 'Use a meal tracking app to monitor spending',
              completed: false,
              difficulty: 'MEDIUM',
              estimatedTime: '15 minutes setup'
            }
          ],
          triggers: {
            dataPoints: ['dining_expenses_trend', 'monthly_spending_analysis'],
            thresholds: [
              {
                metric: 'dining_expense_increase',
                threshold: 15,
                actualValue: 25
              }
            ],
            algorithm: 'spending_pattern_analyzer_v2.1'
          },
          personalization: {
            riskProfile: 'MODERATE',
            timeHorizon: 'SHORT',
            preferences: ['cooking', 'health_conscious'],
            restrictions: []
          },
          tracking: {
            viewedAt: null,
            viewCount: 0,
            lastInteraction: null,
            interactionType: null
          },
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          wellnessProfileId: wellnessProfiles[0]._id,
          type: 'SAVINGS',
          category: 'SHORT_TERM',
          title: 'Optimize Your Emergency Fund Strategy',
          description: 'Your emergency fund is growing well, but consider moving it to a high-yield savings account to earn an additional $150-200 annually while maintaining liquidity.',
          priority: 'MEDIUM',
          status: 'ACTIVE',
          impact: {
            financialImpact: 175,
            timeToImpact: 'WEEKS',
            confidenceScore: 92,
            riskLevel: 'LOW'
          },
          actionItems: [
            {
              step: 1,
              action: 'Research high-yield savings accounts with rates above 4.5%',
              completed: false,
              difficulty: 'EASY',
              estimatedTime: '1 hour'
            },
            {
              step: 2,
              action: 'Compare account features and minimum balance requirements',
              completed: false,
              difficulty: 'MEDIUM',
              estimatedTime: '30 minutes'
            },
            {
              step: 3,
              action: 'Open new account and transfer emergency funds',
              completed: false,
              difficulty: 'MEDIUM',
              estimatedTime: '45 minutes'
            }
          ],
          triggers: {
            dataPoints: ['emergency_fund_balance', 'current_savings_rate'],
            thresholds: [
              {
                metric: 'potential_earnings_improvement',
                threshold: 100,
                actualValue: 175
              }
            ],
            algorithm: 'savings_optimization_v1.3'
          },
          personalization: {
            riskProfile: 'CONSERVATIVE',
            timeHorizon: 'SHORT',
            preferences: ['safety', 'liquidity'],
            restrictions: ['fdic_insured_only']
          },
          tracking: {
            viewedAt: null,
            viewCount: 0,
            lastInteraction: null,
            interactionType: null
          },
          expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          wellnessProfileId: wellnessProfiles[0]._id,
          type: 'INVESTMENT',
          category: 'LONG_TERM',
          title: 'Consider Low-Cost Index Fund Investment',
          description: 'Based on your moderate risk tolerance and long-term goals, consider investing $500 monthly in a diversified index fund portfolio to potentially grow your wealth over time.',
          priority: 'MEDIUM',
          status: 'ACTIVE',
          impact: {
            financialImpact: 15000,
            timeToImpact: 'YEARS',
            confidenceScore: 75,
            riskLevel: 'MEDIUM'
          },
          actionItems: [
            {
              step: 1,
              action: 'Learn about index fund basics and benefits',
              completed: false,
              difficulty: 'MEDIUM',
              estimatedTime: '2 hours'
            },
            {
              step: 2,
              action: 'Review asset allocation recommendations for your age',
              completed: false,
              difficulty: 'MEDIUM',
              estimatedTime: '1 hour'
            },
            {
              step: 3,
              action: 'Open investment account with a low-cost provider',
              completed: false,
              difficulty: 'HARD',
              estimatedTime: '1.5 hours'
            },
            {
              step: 4,
              action: 'Set up automatic monthly investment transfers',
              completed: false,
              difficulty: 'MEDIUM',
              estimatedTime: '30 minutes'
            }
          ],
          triggers: {
            dataPoints: ['investable_assets', 'risk_tolerance', 'age'],
            thresholds: [
              {
                metric: 'investment_readiness_score',
                threshold: 70,
                actualValue: 78
              }
            ],
            algorithm: 'investment_advisor_v2.0'
          },
          personalization: {
            riskProfile: 'MODERATE',
            timeHorizon: 'LONG',
            preferences: ['low_cost', 'diversification'],
            restrictions: ['no_individual_stocks']
          },
          tracking: {
            viewedAt: null,
            viewCount: 0,
            lastInteraction: null,
            interactionType: null
          },
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      // Add recommendations for second wellness profile if it exists
      if (wellnessProfiles.length > 1) {
        sampleRecommendations.push({
          wellnessProfileId: wellnessProfiles[1]._id,
          type: 'DEBT_MANAGEMENT',
          category: 'IMMEDIATE',
          title: 'Credit Card Debt Consolidation Strategy',
          description: 'Your credit utilization is at 35%. Consider a debt consolidation loan or balance transfer to reduce interest payments and improve your credit score.',
          priority: 'HIGH',
          status: 'ACTIVE',
          impact: {
            financialImpact: 1200,
            timeToImpact: 'MONTHS',
            confidenceScore: 88,
            riskLevel: 'LOW'
          },
          actionItems: [
            {
              step: 1,
              action: 'Calculate total credit card debt and monthly payments',
              completed: false,
              difficulty: 'EASY',
              estimatedTime: '20 minutes'
            },
            {
              step: 2,
              action: 'Research balance transfer credit cards with 0% intro APR',
              completed: false,
              difficulty: 'MEDIUM',
              estimatedTime: '1 hour'
            },
            {
              step: 3,
              action: 'Apply for debt consolidation solution',
              completed: false,
              difficulty: 'MEDIUM',
              estimatedTime: '45 minutes'
            }
          ],
          triggers: {
            dataPoints: ['credit_utilization', 'credit_card_balances'],
            thresholds: [
              {
                metric: 'credit_utilization_ratio',
                threshold: 30,
                actualValue: 35
              }
            ],
            algorithm: 'debt_management_advisor_v1.2'
          },
          personalization: {
            riskProfile: 'CONSERVATIVE',
            timeHorizon: 'SHORT',
            preferences: ['debt_reduction', 'credit_improvement'],
            restrictions: []
          },
          tracking: {
            viewedAt: null,
            viewCount: 0,
            lastInteraction: null,
            interactionType: null
          },
          expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      await db.collection('recommendations').insertMany(sampleRecommendations);
    }
    
    console.log('✅ recommendations collection created with sample data');
    
  } catch (error) {
    console.error('❌ Error creating recommendations collection:', error);
    throw error;
  }
}

/**
 * Creates the 'analytics_dashboards' collection for storing user-defined dashboard configurations.
 * @param {Db} db - The MongoDB database instance
 * @returns {Promise<void>} A promise that resolves when the collection is created.
 */
async function createAnalyticsDashboardsCollection(db) {
  try {
    console.log('📝 Creating analytics_dashboards collection...');
    
    // Define the JSON schema for the analytics_dashboards collection
    const analyticsDashboardsSchema = {
      $jsonSchema: {
        bsonType: 'object',
        required: ['_id', 'userId', 'name', 'type', 'widgets', 'createdAt', 'updatedAt'],
        properties: {
          _id: {
            bsonType: 'objectId',
            description: 'Unique identifier for the dashboard'
          },
          userId: {
            bsonType: 'objectId',
            description: 'Reference to user who owns the dashboard'
          },
          name: {
            bsonType: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'Dashboard name'
          },
          description: {
            bsonType: 'string',
            maxLength: 500,
            description: 'Dashboard description'
          },
          type: {
            enum: ['PERSONAL', 'SHARED', 'TEMPLATE', 'SYSTEM'],
            description: 'Dashboard type'
          },
          category: {
            enum: ['FINANCIAL_OVERVIEW', 'RISK_ANALYSIS', 'COMPLIANCE', 'INVESTMENT', 'BUDGETING', 'GOALS', 'CUSTOM'],
            description: 'Dashboard category'
          },
          layout: {
            bsonType: 'object',
            properties: {
              columns: {
                bsonType: 'number',
                minimum: 1,
                maximum: 12,
                description: 'Number of grid columns'
              },
              theme: {
                enum: ['LIGHT', 'DARK', 'AUTO'],
                description: 'Dashboard theme'
              },
              density: {
                enum: ['COMPACT', 'NORMAL', 'SPACIOUS'],
                description: 'Layout density'
              },
              refreshInterval: {
                bsonType: 'number',
                minimum: 0,
                description: 'Auto-refresh interval in seconds (0 = disabled)'
              }
            }
          },
          widgets: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              required: ['id', 'type', 'position', 'size'],
              properties: {
                id: {
                  bsonType: 'string',
                  description: 'Unique widget identifier within dashboard'
                },
                type: {
                  enum: ['CHART', 'METRIC', 'TABLE', 'ALERT', 'GOAL_PROGRESS', 'SPENDING_BREAKDOWN', 'ACCOUNT_SUMMARY', 'TRANSACTION_FEED', 'RECOMMENDATION_CARD'],
                  description: 'Widget type'
                },
                title: {
                  bsonType: 'string',
                  maxLength: 100,
                  description: 'Widget title'
                },
                position: {
                  bsonType: 'object',
                  required: ['x', 'y'],
                  properties: {
                    x: {
                      bsonType: 'number',
                      minimum: 0,
                      description: 'Horizontal position in grid'
                    },
                    y: {
                      bsonType: 'number',
                      minimum: 0,
                      description: 'Vertical position in grid'
                    }
                  }
                },
                size: {
                  bsonType: 'object',
                  required: ['width', 'height'],
                  properties: {
                    width: {
                      bsonType: 'number',
                      minimum: 1,
                      maximum: 12,
                      description: 'Widget width in grid units'
                    },
                    height: {
                      bsonType: 'number',
                      minimum: 1,
                      description: 'Widget height in grid units'
                    }
                  }
                },
                configuration: {
                  bsonType: 'object',
                  properties: {
                    chartType: {
                      enum: ['LINE', 'BAR', 'PIE', 'DONUT', 'AREA', 'CANDLESTICK'],
                      description: 'Chart type for chart widgets'
                    },
                    dataSource: {
                      bsonType: 'string',
                      description: 'Data source identifier'
                    },
                    timeRange: {
                      enum: ['1D', '7D', '30D', '90D', '1Y', 'ALL', 'CUSTOM'],
                      description: 'Time range for data display'
                    },
                    customTimeRange: {
                      bsonType: 'object',
                      properties: {
                        startDate: {
                          bsonType: 'date',
                          description: 'Custom time range start date'
                        },
                        endDate: {
                          bsonType: 'date',
                          description: 'Custom time range end date'
                        }
                      }
                    },
                    filters: {
                      bsonType: 'array',
                      items: {
                        bsonType: 'object',
                        properties: {
                          field: {
                            bsonType: 'string',
                            description: 'Field to filter on'
                          },
                          operator: {
                            enum: ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'CONTAINS', 'IN', 'NOT_IN'],
                            description: 'Filter operator'
                          },
                          value: {
                            description: 'Filter value (can be various types)'
                          }
                        }
                      }
                    },
                    aggregation: {
                      enum: ['SUM', 'AVERAGE', 'COUNT', 'MIN', 'MAX', 'MEDIAN'],
                      description: 'Data aggregation method'
                    },
                    refreshInterval: {
                      bsonType: 'number',
                      minimum: 0,
                      description: 'Widget-specific refresh interval in seconds'
                    },
                    alertThresholds: {
                      bsonType: 'array',
                      items: {
                        bsonType: 'object',
                        properties: {
                          metric: {
                            bsonType: 'string',
                            description: 'Metric to monitor'
                          },
                          operator: {
                            enum: ['GREATER_THAN', 'LESS_THAN', 'EQUALS'],
                            description: 'Threshold operator'
                          },
                          value: {
                            bsonType: 'number',
                            description: 'Threshold value'
                          },
                          severity: {
                            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                            description: 'Alert severity level'
                          }
                        }
                      }
                    }
                  }
                },
                visibility: {
                  bsonType: 'object',
                  properties: {
                    hidden: {
                      bsonType: 'bool',
                      description: 'Whether widget is hidden'
                    },
                    minimized: {
                      bsonType: 'bool',
                      description: 'Whether widget is minimized'
                    },
                    permissions: {
                      bsonType: 'array',
                      items: {
                        bsonType: 'string',
                        description: 'Required permissions to view widget'
                      }
                    }
                  }
                }
              }
            }
          },
          filters: {
            bsonType: 'object',
            properties: {
              global: {
                bsonType: 'array',
                items: {
                  bsonType: 'object',
                  properties: {
                    field: {
                      bsonType: 'string',
                      description: 'Field to filter on'
                    },
                    operator: {
                      enum: ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'CONTAINS', 'IN', 'NOT_IN'],
                      description: 'Filter operator'
                    },
                    value: {
                      description: 'Filter value'
                    },
                    label: {
                      bsonType: 'string',
                      description: 'Human-readable filter label'
                    }
                  }
                }
              },
              savedFilters: {
                bsonType: 'array',
                items: {
                  bsonType: 'object',
                  properties: {
                    name: {
                      bsonType: 'string',
                      description: 'Saved filter name'
                    },
                    filters: {
                      bsonType: 'array',
                      description: 'Array of filter objects'
                    }
                  }
                }
              }
            }
          },
          sharing: {
            bsonType: 'object',
            properties: {
              isPublic: {
                bsonType: 'bool',
                description: 'Whether dashboard is publicly accessible'
              },
              sharedWith: {
                bsonType: 'array',
                items: {
                  bsonType: 'object',
                  properties: {
                    userId: {
                      bsonType: 'objectId',
                      description: 'User ID with access'
                    },
                    permissions: {
                      enum: ['VIEW', 'EDIT', 'ADMIN'],
                      description: 'Permission level'
                    },
                    sharedAt: {
                      bsonType: 'date',
                      description: 'Sharing timestamp'
                    }
                  }
                }
              },
              shareToken: {
                bsonType: 'string',
                description: 'Token for public sharing'
              },
              expiresAt: {
                bsonType: 'date',
                description: 'Sharing expiration timestamp'
              }
            }
          },
          usage: {
            bsonType: 'object',
            properties: {
              viewCount: {
                bsonType: 'number',
                minimum: 0,
                description: 'Number of times dashboard was viewed'
              },
              lastViewed: {
                bsonType: 'date',
                description: 'Last view timestamp'
              },
              avgViewDuration: {
                bsonType: 'number',
                minimum: 0,
                description: 'Average view duration in seconds'
              },
              favorited: {
                bsonType: 'bool',
                description: 'Whether dashboard is favorited by owner'
              }
            }
          },
          version: {
            bsonType: 'number',
            minimum: 1,
            description: 'Dashboard version for change tracking'
          },
          tags: {
            bsonType: 'array',
            items: {
              bsonType: 'string',
              maxLength: 50,
              description: 'Dashboard tags for categorization'
            }
          },
          isTemplate: {
            bsonType: 'bool',
            description: 'Whether this dashboard can be used as a template'
          },
          templateInfo: {
            bsonType: 'object',
            properties: {
              industry: {
                bsonType: 'string',
                description: 'Target industry for template'
              },
              useCase: {
                bsonType: 'string',
                description: 'Primary use case for template'
              },
              popularity: {
                bsonType: 'number',
                minimum: 0,
                description: 'Template popularity score'
              }
            }
          },
          createdAt: {
            bsonType: 'date',
            description: 'Dashboard creation timestamp'
          },
          updatedAt: {
            bsonType: 'date',
            description: 'Dashboard last update timestamp'
          }
        }
      }
    };
    
    // Create collection with validator
    await db.createCollection('analytics_dashboards', {
      validator: analyticsDashboardsSchema
    });
    
    // Create an index on userId for efficient lookups
    await db.collection('analytics_dashboards').createIndex(
      { 'userId': 1 }, 
      { name: 'user_id_idx' }
    );
    await db.collection('analytics_dashboards').createIndex(
      { 'type': 1, 'category': 1 }, 
      { name: 'type_category_idx' }
    );
    await db.collection('analytics_dashboards').createIndex(
      { 'isTemplate': 1, 'templateInfo.popularity': -1 }, 
      { name: 'template_popularity_idx' }
    );
    await db.collection('analytics_dashboards').createIndex(
      { 'tags': 1 }, 
      { name: 'tags_idx' }
    );
    await db.collection('analytics_dashboards').createIndex(
      { 'createdAt': 1 }, 
      { name: 'created_at_idx' }
    );
    
    // Insert a default dashboard configuration
    const customerProfiles = await db.collection('customer_profiles').find({}, { _id: 1 }).toArray();
    if (customerProfiles.length > 0) {
      const defaultDashboard = {
        userId: customerProfiles[0]._id,
        name: 'Personal Financial Overview',
        description: 'Comprehensive overview of your financial health, goals, and recommendations',
        type: 'PERSONAL',
        category: 'FINANCIAL_OVERVIEW',
        layout: {
          columns: 12,
          theme: 'LIGHT',
          density: 'NORMAL',
          refreshInterval: 300 // 5 minutes
        },
        widgets: [
          {
            id: 'financial-health-score',
            type: 'METRIC',
            title: 'Financial Health Score',
            position: { x: 0, y: 0 },
            size: { width: 3, height: 2 },
            configuration: {
              dataSource: 'wellness_profile.financialHealthScore',
              refreshInterval: 300,
              alertThresholds: [
                {
                  metric: 'health_score',
                  operator: 'LESS_THAN',
                  value: 60,
                  severity: 'HIGH'
                }
              ]
            },
            visibility: {
              hidden: false,
              minimized: false,
              permissions: ['customer:read']
            }
          },
          {
            id: 'account-balances',
            type: 'ACCOUNT_SUMMARY',
            title: 'Account Balances',
            position: { x: 3, y: 0 },
            size: { width: 6, height: 2 },
            configuration: {
              dataSource: 'accounts.balances',
              timeRange: '30D',
              refreshInterval: 60
            },
            visibility: {
              hidden: false,
              minimized: false,
              permissions: ['customer:accounts:read']
            }
          },
          {
            id: 'goal-progress',
            type: 'GOAL_PROGRESS',
            title: 'Financial Goals Progress',
            position: { x: 9, y: 0 },
            size: { width: 3, height: 2 },
            configuration: {
              dataSource: 'financial_goals.progress',
              refreshInterval: 1800 // 30 minutes
            },
            visibility: {
              hidden: false,
              minimized: false,
              permissions: ['customer:goals:read']
            }
          },
          {
            id: 'spending-breakdown',
            type: 'SPENDING_BREAKDOWN',
            title: 'Monthly Spending Breakdown',
            position: { x: 0, y: 2 },
            size: { width: 6, height: 3 },
            configuration: {
              chartType: 'PIE',
              dataSource: 'transactions.categories',
              timeRange: '30D',
              aggregation: 'SUM',
              refreshInterval: 600 // 10 minutes
            },
            visibility: {
              hidden: false,
              minimized: false,
              permissions: ['customer:transactions:read']
            }
          },
          {
            id: 'transaction-feed',
            type: 'TRANSACTION_FEED',
            title: 'Recent Transactions',
            position: { x: 6, y: 2 },
            size: { width: 6, height: 3 },
            configuration: {
              dataSource: 'transactions.recent',
              timeRange: '7D',
              refreshInterval: 120 // 2 minutes
            },
            visibility: {
              hidden: false,
              minimized: false,
              permissions: ['customer:transactions:read']
            }
          },
          {
            id: 'recommendations',
            type: 'RECOMMENDATION_CARD',
            title: 'Personalized Recommendations',
            position: { x: 0, y: 5 },
            size: { width: 12, height: 2 },
            configuration: {
              dataSource: 'recommendations.active',
              filters: [
                {
                  field: 'priority',
                  operator: 'IN',
                  value: ['HIGH', 'CRITICAL']
                }
              ],
              refreshInterval: 3600 // 1 hour
            },
            visibility: {
              hidden: false,
              minimized: false,
              permissions: ['customer:recommendations:read']
            }
          }
        ],
        filters: {
          global: [],
          savedFilters: [
            {
              name: 'Last 30 Days',
              filters: [
                {
                  field: 'date',
                  operator: 'GREATER_THAN',
                  value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  label: 'Last 30 Days'
                }
              ]
            }
          ]
        },
        sharing: {
          isPublic: false,
          sharedWith: [],
          shareToken: null,
          expiresAt: null
        },
        usage: {
          viewCount: 0,
          lastViewed: null,
          avgViewDuration: 0,
          favorited: true
        },
        version: 1,
        tags: ['personal', 'overview', 'default'],
        isTemplate: false,
        templateInfo: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('analytics_dashboards').insertOne(defaultDashboard);
    }
    
    console.log('✅ analytics_dashboards collection created with default configuration');
    
  } catch (error) {
    console.error('❌ Error creating analytics_dashboards collection:', error);
    throw error;
  }
}

// Execute the main function if this script is run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  main,
  createCustomerProfilesCollection,
  createWellnessProfilesCollection,
  createFinancialGoalsCollection,
  createRecommendationsCollection,
  createAnalyticsDashboardsCollection
};