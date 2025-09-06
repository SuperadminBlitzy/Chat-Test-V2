# Unified Financial Services Platform - Developer Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Local Development Setup](#local-development-setup)
4. [Running the Application](#running-the-application)
5. [Development Workflow](#development-workflow)
6. [Testing](#testing)
7. [Building for Production](#building-for-production)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Further Reading](#further-reading)

## Introduction

Welcome to the Unified Financial Services Platform! This comprehensive developer guide will help you quickly become productive on our enterprise-grade financial technology platform that addresses critical fragmentation challenges facing Banking, Financial Services, and Insurance (BFSI) institutions.

### Platform Overview

The Unified Financial Services Platform is a comprehensive solution that integrates:

- **AI-Powered Risk Assessment** - Real-time risk scoring with explainable AI (<500ms response time)
- **Regulatory Compliance Automation** - Real-time regulatory change monitoring across PSD3, Basel III/IV, FINRA
- **Digital Customer Onboarding** - Sub-5 minute KYC/AML compliant onboarding with biometric authentication
- **Personalized Financial Wellness Tools** - Holistic customer profiling and recommendation engines
- **Blockchain Settlement Network** - Hyperledger Fabric-based secure settlement processing
- **Predictive Analytics** - Real-time data processing and business intelligence

### Architecture Overview

Our platform implements a **cloud-native microservices architecture** designed for financial services with:

- **High Performance**: Sub-second response times with 10,000+ TPS capacity
- **Enterprise Security**: SOC2, PCI DSS, GDPR compliance with end-to-end encryption
- **99.99% Availability**: Multi-zone deployment with comprehensive disaster recovery
- **Event-Driven Communication**: Apache Kafka for real-time data processing
- **API-First Design**: Well-defined APIs with comprehensive documentation

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Backend Services** | Java + Spring Boot | 21 LTS / 3.2+ | Core microservices and enterprise integration |
| **API Gateway** | Node.js + Express.js | 20 LTS / 4.18+ | Request routing, authentication, rate limiting |
| **AI/ML Services** | Python + FastAPI | 3.12 / 0.104+ | Risk assessment and predictive analytics |
| **Web Frontend** | React + Next.js + TypeScript | 18.2+ / 14+ / 5.3+ | Modern, responsive user interface |
| **Databases** | PostgreSQL + MongoDB + Redis | 16+ / 7.0+ / 7.2+ | Transactional, document, and caching storage |
| **Message Streaming** | Apache Kafka | 3.6+ | Event streaming and real-time processing |
| **Blockchain** | Hyperledger Fabric | 2.5+ | Secure settlement and audit trails |
| **Containerization** | Docker + Kubernetes | 24.0+ / 1.28+ | Deployment and orchestration |

## Getting Started

### Prerequisites

Before setting up the development environment, ensure your system meets these requirements:

#### Required Software

| Software | Version | Download Link | Verification Command |
|----------|---------|---------------|---------------------|
| **Git** | 2.40+ | [Git Downloads](https://git-scm.com/downloads) | `git --version` |
| **Java JDK** | 21 LTS | [OpenJDK 21](https://openjdk.org/projects/jdk/21/) | `java --version` |
| **Node.js** | 20 LTS | [Node.js Official](https://nodejs.org/) | `node --version` |
| **Docker** | 24.0+ | [Docker Desktop](https://www.docker.com/products/docker-desktop/) | `docker --version` |
| **Maven** | 3.9+ | [Apache Maven](https://maven.apache.org/download.cgi) | `mvn --version` |

#### Development Tools (Recommended)

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **IntelliJ IDEA** | Java development | Install Spring Boot, Docker, and Kubernetes plugins |
| **Visual Studio Code** | Frontend development | Install TypeScript, React, ESLint, and Prettier extensions |

#### System Requirements

- **CPU**: 8+ cores (Intel i7/AMD Ryzen 7 or better)
- **RAM**: 32GB minimum (64GB recommended for optimal performance)
- **Storage**: 500GB+ SSD with fast I/O for Docker images and databases
- **Network**: Stable internet connection for dependency downloads

### Repository Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd unified-financial-platform
   ```

2. **Configure upstream remotes (for contributors):**
   ```bash
   git remote add upstream <upstream-repository-url>
   git fetch upstream
   ```

3. **Verify project structure:**
   ```
   unified-financial-platform/
   ├── src/
   │   ├── backend/                 # Backend microservices
   │   │   ├── docker-compose.yml   # Local development stack
   │   │   ├── scripts/
   │   │   │   └── init-local-env.sh # Environment initialization
   │   │   └── services/            # Individual microservices
   │   └── web/                     # Frontend application
   │       ├── package.json         # Dependencies and scripts
   │       └── src/                 # React application source
   ├── docs/                        # Documentation
   ├── CONTRIBUTING.md              # Contribution guidelines
   └── README.md                    # Project overview
   ```

## Local Development Setup

### Backend Setup

The backend consists of multiple microservices orchestrated with Docker Compose for local development.

1. **Navigate to the backend directory:**
   ```bash
   cd src/backend
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.template .env
   # Edit .env with your local configuration
   ```

3. **Initialize the local development environment:**
   ```bash
   # Make the script executable
   chmod +x scripts/init-local-env.sh
   
   # Run the initialization script
   ./scripts/init-local-env.sh
   ```

   This script will:
   - Start all backing services (PostgreSQL, MongoDB, Redis, Kafka)
   - Create database schemas and apply migrations
   - Seed sample data for development
   - Initialize AI/ML models with test data
   - Configure compliance policies
   - Set up blockchain network

4. **Verify backend services are running:**
   ```bash
   # Check all services status
   docker-compose ps
   
   # Test API Gateway health
   curl http://localhost:8080/actuator/health
   ```

### Frontend Setup

The frontend is built with React 18.2+, TypeScript 5.3+, and Next.js 14+ for modern web development.

1. **Navigate to the frontend directory:**
   ```bash
   cd src/web
   ```

2. **Install npm dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment configuration:**
   ```bash
   cp .env.local.template .env.local
   # Configure your local API endpoints and feature flags
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Main application: http://localhost:3000
   - Component Storybook: http://localhost:6006 (if running `npm run storybook`)

## Running the Application

### Complete Development Stack

To run the entire platform locally with all services:

1. **Start backend services:**
   ```bash
   cd src/backend
   docker-compose up -d
   ```

2. **Start frontend development server:**
   ```bash
   cd src/web
   npm run dev
   ```

3. **Verify the complete stack:**
   
   **Service Health Checks:**
   ```bash
   # API Gateway and routing
   curl http://localhost:8080/actuator/health
   
   # Individual service health
   curl http://localhost:8081/actuator/health  # Customer Service
   curl http://localhost:8082/actuator/health  # Transaction Service
   curl http://localhost:8083/actuator/health  # Risk Assessment Service
   ```

   **Key Service URLs:**
   - **Frontend Application**: http://localhost:3000
   - **API Gateway**: http://localhost:8080
   - **Service Discovery**: http://localhost:8761
   - **Grafana Monitoring**: http://localhost:3002 (admin/grafana_admin_2024)
   - **Prometheus Metrics**: http://localhost:9090
   - **Jaeger Tracing**: http://localhost:16686

### Development Features

The development environment includes:

- **Hot Module Replacement**: Frontend changes reflect instantly
- **Automatic Service Discovery**: Services register and discover each other automatically
- **Comprehensive Monitoring**: Pre-configured dashboards for performance and health
- **Sample Data**: Realistic test data for all financial scenarios
- **Security**: OAuth2 + JWT authentication with role-based access control

## Development Workflow

### Git Workflow

We follow GitFlow-based branching optimized for financial services compliance:

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/payment-dashboard-enhancement
   ```

2. **Make your changes following coding standards:**
   - Java: Google Java Style Guide with Spring Boot best practices
   - TypeScript: Strict TypeScript configuration with React patterns
   - Python: PEP 8 with type hints for AI/ML services

3. **Commit using conventional commits:**
   ```bash
   git commit -m "feat(payments): add real-time transaction monitoring"
   git commit -m "fix(risk): resolve AI model bias in credit scoring"
   git commit -m "docs(api): update customer onboarding endpoints"
   ```

4. **Push and create pull request:**
   ```bash
   git push origin feature/payment-dashboard-enhancement
   # Create PR via GitHub interface
   ```

### Code Quality Standards

#### Backend (Java) Standards

```java
// Example service implementation following our standards
@Service
@Transactional
@Slf4j
public class CustomerServiceImpl implements CustomerService {
    
    private final CustomerRepository customerRepository;
    private final RiskAssessmentService riskService;
    
    public CustomerServiceImpl(CustomerRepository customerRepository,
                               RiskAssessmentService riskService) {
        this.customerRepository = customerRepository;
        this.riskService = riskService;
    }
    
    @Override
    public CustomerProfile createCustomer(CreateCustomerRequest request) {
        log.info("Creating customer with email: {}", request.getEmail());
        
        // Validation with proper error handling
        validateCustomerRequest(request);
        
        // Business logic with risk assessment
        Customer customer = Customer.builder()
            .email(request.getEmail())
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .build();
        
        RiskScore riskScore = riskService.assessCustomerRisk(customer);
        customer.setRiskCategory(riskScore.getCategory());
        
        Customer savedCustomer = customerRepository.save(customer);
        
        log.info("Customer created successfully with ID: {}", savedCustomer.getId());
        return CustomerProfile.from(savedCustomer);
    }
}
```

#### Frontend (TypeScript/React) Standards

```typescript
// Example React component following our standards
interface CustomerCardProps {
  customer: Customer;
  onEdit?: (customer: Customer) => void;
  className?: string;
}

/**
 * CustomerCard displays customer information with editing capabilities
 * Implements accessibility standards for financial services
 */
export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onEdit,
  className
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleEditClick = useCallback(async () => {
    if (onEdit) {
      setIsLoading(true);
      try {
        await onEdit(customer);
      } finally {
        setIsLoading(false);
      }
    }
  }, [customer, onEdit]);
  
  return (
    <Card className={clsx('customer-card', className)}>
      <CardContent>
        <Typography variant="h6">{customer.fullName}</Typography>
        <Typography color="textSecondary">
          Risk Level: {customer.riskCategory}
        </Typography>
        <Typography color="textSecondary">
          Account: {maskAccountNumber(customer.accountNumber)}
        </Typography>
      </CardContent>
      {onEdit && (
        <CardActions>
          <Button 
            onClick={handleEditClick}
            disabled={isLoading}
            aria-label={`Edit customer ${customer.fullName}`}
          >
            {isLoading ? 'Saving...' : 'Edit Customer'}
          </Button>
        </CardActions>
      )}
    </Card>
  );
};
```

### Code Quality Tools

#### Automated Quality Checks

```bash
# Backend quality checks
cd src/backend
mvn clean compile                    # Compilation check
mvn spotbugs:check                   # Static analysis
mvn org.owasp:dependency-check-maven:check  # Security vulnerabilities

# Frontend quality checks
cd src/web
npm run lint                         # ESLint checking
npm run type-check                   # TypeScript compilation
npm run format                       # Prettier formatting
```

## Testing

Our testing strategy follows the test pyramid with comprehensive coverage for financial services compliance.

### Backend Tests

#### Unit Tests (70% of test suite)
```bash
cd src/backend

# Run all unit tests
mvn test

# Run tests with coverage (minimum 85% required)
mvn test jacoco:report

# Run specific service tests
cd customer-service
mvn test -Dtest=CustomerServiceTest
```

#### Integration Tests (20% of test suite)
```bash
# Run integration tests with embedded databases
mvn verify -P integration-tests

# API integration tests using testcontainers
mvn test -P integration-tests -Dspring.profiles.active=test
```

### Frontend Tests

#### Component Tests
```bash
cd src/web

# Run Jest unit tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Generate coverage report (minimum 90% for critical paths)
npm run test:coverage
```

#### End-to-End Tests

Critical user journeys for financial services:

```bash
# Run Cypress tests headlessly
npm run cypress:run

# Open Cypress GUI for interactive testing
npm run cypress:open

# Run specific test suites
npm run e2e:customer-onboarding      # Complete KYC/AML flow
npm run e2e:payment-processing       # Transaction with risk assessment
npm run e2e:compliance-workflows     # Regulatory compliance scenarios
```

### Testing Critical Financial Workflows

Our E2E tests cover these essential financial services scenarios:

1. **Customer Onboarding Flow**
   - Identity verification with KYC/AML compliance
   - Risk assessment integration
   - Account setup and activation

2. **Payment Processing**
   - Transaction validation and authorization
   - Real-time fraud detection
   - Settlement reconciliation

3. **Compliance Monitoring**
   - Regulatory reporting generation
   - Audit trail verification
   - Policy enforcement testing

4. **AI/ML Model Validation**
   - Risk scoring accuracy
   - Bias detection and mitigation
   - Model explainability verification

## Building for Production

### Backend Production Builds

```bash
cd src/backend

# Build all services for production
mvn clean install -DskipTests

# Build Docker images for deployment
docker-compose -f docker-compose.prod.yml build

# Security scanning for container images
./scripts/security-scan.sh
```

### Frontend Production Build

```bash
cd src/web

# Create optimized production build
npm run build

# Analyze bundle size and optimization opportunities
npm run analyze

# Run production server locally for testing
npm run start
```

### Production Optimizations

The production builds include:

- **Java Services**: Multi-stage Docker builds with distroless base images
- **Frontend**: Next.js optimization with automatic code splitting and image optimization
- **Security**: Container security scanning and vulnerability assessment
- **Performance**: Bundle analysis and optimization recommendations

## Deployment

### Local Production Testing

Test production builds locally before deployment:

```bash
# Start production-like environment
docker-compose -f docker-compose.prod.yml up -d

# Verify all services are healthy
./scripts/health-check.sh

# Run performance benchmarks
./scripts/performance-test.sh
```

### Kubernetes Deployment

For production deployments, the platform uses Kubernetes with Helm charts:

```bash
# Deploy to staging environment
helm upgrade --install financial-platform-staging ./helm/financial-platform \
  --namespace financial-platform-staging \
  --values ./helm/values-staging.yaml

# Deploy to production (requires approval)
helm upgrade --install financial-platform ./helm/financial-platform \
  --namespace financial-platform \
  --values ./helm/values-prod.yaml
```

### CI/CD Pipeline

Our GitHub Actions pipeline ensures quality and security:

1. **Security Scan & Compliance Validation**
2. **Code Quality Gates** (85% coverage minimum)
3. **Automated Testing** (Unit, Integration, E2E)
4. **Container Security Scanning**
5. **Performance Baseline Validation**
6. **Staging Deployment**
7. **Production Deployment** (with approval)

## Troubleshooting

### Common Development Issues

#### Docker Service Issues

```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs -f customer-service

# Restart specific service
docker-compose restart customer-service

# Reset entire environment
docker-compose down -v
./scripts/init-local-env.sh
```

#### Database Connection Issues

```bash
# Check PostgreSQL connection
docker exec -it ufs-postgres psql -U admin -d ufs_db

# Check MongoDB connection
docker exec -it ufs-mongodb mongosh --host localhost:27017

# Reset databases with sample data
./scripts/init-local-env.sh --reset
```

#### Port Conflicts

```bash
# Check which process is using a port
lsof -i :8080
netstat -tulpn | grep :8080

# Kill process using port
kill -9 <PID>

# Or modify port in docker-compose.yml
```

#### Frontend Development Issues

```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# TypeScript compilation issues
npx tsc --noEmit

# Dependency issues
rm -rf node_modules package-lock.json
npm install
```

### Performance Debugging

#### API Response Time Issues

```bash
# Monitor API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/api/v1/customers

# Check database query performance
docker exec -it ufs-postgres psql -U admin -d ufs_db -c "
SELECT query, mean_exec_time, total_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;"
```

#### Memory and Resource Issues

```bash
# Monitor Docker resource usage
docker stats

# Check Java heap usage for services
docker exec customer-service jcmd 1 VM.memory_summary

# Monitor frontend bundle size
npm run analyze
```

### Getting Help

#### Internal Resources

- **API Documentation**: http://localhost:8080/swagger-ui.html
- **Service Health Dashboards**: http://localhost:3002 (Grafana)
- **Distributed Tracing**: http://localhost:16686 (Jaeger)
- **Metrics Monitoring**: http://localhost:9090 (Prometheus)

#### Development Team Support

- **Technical Questions**: Create GitHub issue with `question` label
- **Security Concerns**: Contact security team immediately
- **Performance Issues**: Use provided monitoring tools and dashboards
- **Build/Deployment Issues**: Check CI/CD pipeline logs

#### External Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

## Further Reading

### Architecture Documentation

- [System Architecture Overview](../architecture/system-architecture.md)
- [Microservices Design Patterns](../architecture/microservices-patterns.md)
- [Data Model and Relationships](../architecture/data-model.md)
- [Security Architecture](../architecture/security-architecture.md)

### API Documentation

- [REST API Reference](../api/rest-api-documentation.md)
- [GraphQL Schema](../api/graphql-schema.md)
- [WebSocket Events](../api/websocket-events.md)
- [Authentication Guide](../api/authentication-guide.md)

### Development Guidelines

- [Coding Standards](../development/coding-standards.md)
- [Testing Strategy](../development/testing.md)
- [Security Guidelines](../development/security-guidelines.md)
- [Performance Optimization](../development/performance-optimization.md)

### Deployment and Operations

- [Production Deployment Guide](../deployment/production-deployment.md)
- [Monitoring and Observability](../operations/monitoring-setup.md)
- [Disaster Recovery](../operations/disaster-recovery.md)
- [Compliance and Auditing](../operations/compliance-auditing.md)

### Financial Services Context

- [Regulatory Compliance Framework](../compliance/regulatory-framework.md)
- [Risk Management Procedures](../compliance/risk-management.md)
- [Data Privacy and Protection](../compliance/data-privacy.md)
- [Audit Trail Requirements](../compliance/audit-trails.md)

---

**Welcome to the Unified Financial Services Platform development team!** 

This guide provides the foundation for becoming productive on our enterprise-grade financial technology platform. As you work with the codebase, remember that we're building systems that handle sensitive financial data and must meet the highest standards of security, performance, and regulatory compliance.

For additional support or questions, please refer to the troubleshooting section above or contact the development team through the appropriate channels. Happy coding!