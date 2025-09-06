# Development Environment Setup Guide

## Introduction

This document provides comprehensive instructions for setting up the local development environment for the Unified Financial Services Platform. The platform is a comprehensive solution that integrates AI-powered risk assessment, regulatory compliance automation, digital onboarding, personalized financial wellness tools, blockchain-based settlements, and predictive analytics into a unified ecosystem.

The development environment uses a microservices architecture with containerization, enabling developers to work on individual services while maintaining integration with the complete system. This guide covers both backend services and frontend applications, ensuring consistency across all development workflows.

## Prerequisites

Before setting up the project, ensure your development machine meets the following requirements:

### Required Software

| Software | Version | Download Link | Purpose |
|----------|---------|---------------|---------|
| **Java** | 21 LTS | [OpenJDK 21](https://openjdk.org/projects/jdk/21/) | Backend microservices development |
| **Node.js** | 20 LTS | [Node.js Official](https://nodejs.org/) | Frontend development and API services |
| **Docker** | 24.0+ | [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Containerization and local orchestration |
| **Docker Compose** | 2.23+ | Included with Docker Desktop | Multi-container orchestration |
| **Maven** | 3.9+ | [Apache Maven](https://maven.apache.org/download.cgi) | Java dependency management and build |
| **Git** | 2.40+ | [Git SCM](https://git-scm.com/downloads) | Version control |

### Development Tools

| Tool | Version | Purpose | Configuration |
|------|---------|---------|---------------|
| **IntelliJ IDEA** | 2023.3+ | Java development IDE | Install Spring Boot, Docker, and Kubernetes plugins |
| **Visual Studio Code** | 1.85+ | Frontend development | Install TypeScript, React, ESLint, and Prettier extensions |
| **Postman** | Latest | API testing | Import provided collection for testing endpoints |
| **pgAdmin** | 4.x+ | PostgreSQL administration | Optional but recommended for database management |

### System Requirements

| Component | Minimum | Recommended | Notes |
|-----------|---------|-------------|-------|
| **RAM** | 16GB | 32GB | Multiple services and containers |
| **CPU** | 4 cores | 8+ cores | Parallel build and container execution |
| **Storage** | 100GB free | 250GB+ SSD | Docker images, databases, and logs |
| **Operating System** | Windows 10, macOS 10.15, Ubuntu 20.04 | Latest versions | Cross-platform compatibility |

### Network Requirements

- Internet connection for dependency downloads
- Ability to bind to localhost ports 3000-9999
- Corporate firewall allowing Docker Hub and npm registry access
- Access to external APIs for development (credit bureaus, payment networks)

## Backend Setup

The backend consists of multiple microservices built with Spring Boot 3.2+ and Java 21 LTS. Each service is containerized and can be developed independently while maintaining integration capabilities.

### Repository Setup

1. **Clone the main repository:**
   ```bash
   git clone https://github.com/unified-financial-platform/platform.git
   cd platform
   ```

2. **Navigate to the backend directory:**
   ```bash
   cd src/backend
   ```

3. **Verify the project structure:**
   ```
   src/backend/
   ├── docker-compose.yml          # Complete environment orchestration
   ├── init-local-env.sh           # Environment initialization script
   ├── shared/                     # Shared libraries and configurations
   ├── customer-service/           # Customer management microservice
   ├── transaction-service/        # Transaction processing microservice
   ├── risk-service/              # AI-powered risk assessment
   ├── compliance-service/        # Regulatory compliance automation
   ├── notification-service/      # Real-time notifications
   ├── api-gateway/              # API Gateway and routing
   ├── auth-service/             # Authentication and authorization
   └── blockchain-service/       # Blockchain settlement processing
   ```

### Building the Services

1. **Install dependencies and build all services:**
   ```bash
   mvn clean install -DskipTests
   ```

2. **Build individual services (optional):**
   ```bash
   # Example: Build customer service only
   cd customer-service
   mvn clean compile
   cd ..
   ```

3. **Run tests to verify build:**
   ```bash
   mvn test
   ```

### Database Setup

The platform uses PostgreSQL for transactional data and MongoDB for document storage. Redis provides caching and session management.

1. **Start database services:**
   ```bash
   docker-compose up -d postgres mongodb redis
   ```

2. **Verify database connectivity:**
   ```bash
   # PostgreSQL
   docker exec -it platform-postgres psql -U platform_user -d platform_db

   # MongoDB
   docker exec -it platform-mongodb mongosh --host localhost:27017
   ```

3. **Initialize database schemas:**
   ```bash
   ./init-local-env.sh --databases-only
   ```

### Environment Configuration

1. **Copy environment template:**
   ```bash
   cp .env.template .env
   ```

2. **Configure environment variables:**
   ```bash
   # Database Configuration
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=platform_db
   POSTGRES_USER=platform_user
   POSTGRES_PASSWORD=platform_password

   # MongoDB Configuration
   MONGODB_HOST=localhost
   MONGODB_PORT=27017
   MONGODB_DATABASE=platform_documents

   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # Security Configuration
   JWT_SECRET=your-256-bit-secret-key-here
   ENCRYPTION_KEY=your-encryption-key-here

   # External API Configuration (Development)
   CREDIT_BUREAU_API_URL=https://sandbox.experian.com/api
   PAYMENT_GATEWAY_URL=https://sandbox.stripe.com/api
   ```

### Running Backend Services

1. **Start all services using Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **Monitor service startup:**
   ```bash
   docker-compose logs -f
   ```

3. **Verify service health:**
   ```bash
   # Check all services are running
   docker-compose ps

   # Test API Gateway health
   curl http://localhost:8080/health

   # Test individual service health
   curl http://localhost:8081/actuator/health  # Customer Service
   curl http://localhost:8082/actuator/health  # Transaction Service
   ```

### Initialize Local Environment

The `init-local-env.sh` script sets up the complete development environment with sample data:

```bash
# Full environment setup with sample data
./init-local-env.sh

# Options:
./init-local-env.sh --help                    # Show available options
./init-local-env.sh --databases-only          # Initialize databases only
./init-local-env.sh --sample-data             # Load sample customer and transaction data
./init-local-env.sh --reset                   # Reset environment to clean state
```

The script performs:
- Database schema creation and migration
- Sample customer profiles and accounts creation
- Test transaction data loading
- Compliance policy configuration
- AI/ML model initialization with test data

## Frontend Setup

The frontend is built with React 18.2+, TypeScript 5.3+, and Next.js 14+ for a modern, type-safe development experience.

### Frontend Repository Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd src/web
   ```

2. **Verify project structure:**
   ```
   src/web/
   ├── package.json                # Dependencies and scripts
   ├── next.config.js             # Next.js configuration
   ├── tailwind.config.js         # Tailwind CSS configuration
   ├── tsconfig.json              # TypeScript configuration
   ├── src/
   │   ├── app/                   # Next.js app directory
   │   ├── components/            # Reusable UI components
   │   ├── hooks/                 # Custom React hooks
   │   ├── services/              # API service layer
   │   ├── store/                 # Redux store configuration
   │   └── types/                 # TypeScript type definitions
   ├── public/                    # Static assets
   └── cypress/                   # End-to-end tests
   ```

### Install Dependencies

1. **Install npm dependencies:**
   ```bash
   npm install
   ```

2. **Verify dependency installation:**
   ```bash
   npm audit
   npm list --depth=0
   ```

### Frontend Environment Configuration

1. **Copy environment template:**
   ```bash
   cp .env.local.template .env.local
   ```

2. **Configure frontend environment variables:**
   ```bash
   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
   NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws

   # Authentication Configuration
   NEXT_PUBLIC_AUTH_DOMAIN=dev.platform.local
   NEXT_PUBLIC_CLIENT_ID=dev-client-id

   # Feature Flags
   NEXT_PUBLIC_ENABLE_DARK_MODE=true
   NEXT_PUBLIC_ENABLE_ANALYTICS=false
   NEXT_PUBLIC_ENABLE_DEBUG=true

   # External Services (Development)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
   ```

### Development Server

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Access the application:**
   - Main application: http://localhost:3000
   - API documentation: http://localhost:3000/api-docs
   - Component Storybook: http://localhost:6006 (if running)

3. **Development server features:**
   - Hot module replacement for instant updates
   - TypeScript compilation and error checking
   - ESLint and Prettier automatic formatting
   - Real-time API connection to backend services

### Frontend Docker Development

For consistent development environments, you can also run the frontend in Docker:

1. **Build the development Docker image:**
   ```bash
   docker build -f Dockerfile.dev -t platform-web-dev .
   ```

2. **Run in Docker with volume mounting:**
   ```bash
   docker run -p 3000:3000 -v $(pwd):/app platform-web-dev
   ```

## Running the Full Stack

The complete platform includes backend microservices, frontend application, databases, and supporting services orchestrated through Docker Compose.

### Complete Environment Startup

1. **Start the entire platform:**
   ```bash
   # From the src/backend directory
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
   ```

2. **Verify all services are running:**
   ```bash
   docker-compose ps
   ```

   Expected services:
   - postgres (Database)
   - mongodb (Document store)
   - redis (Cache/sessions)
   - api-gateway (Port 8080)
   - customer-service (Port 8081)
   - transaction-service (Port 8082)
   - risk-service (Port 8083)
   - compliance-service (Port 8084)
   - auth-service (Port 8085)
   - blockchain-service (Port 8086)
   - notification-service (Port 8087)

3. **Start the frontend development server:**
   ```bash
   cd src/web
   npm run dev
   ```

### Service Communication Verification

1. **Test API Gateway routing:**
   ```bash
   # Health check through gateway
   curl http://localhost:8080/health

   # Customer service through gateway
   curl http://localhost:8080/api/v1/customers/health

   # Transaction service through gateway
   curl http://localhost:8080/api/v1/transactions/health
   ```

2. **Test authentication flow:**
   ```bash
   # Get authentication token
   curl -X POST http://localhost:8080/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"demo@platform.local","password":"demo123"}'
   ```

3. **Test real-time WebSocket connections:**
   ```bash
   # Using wscat (install with: npm install -g wscat)
   wscat -c ws://localhost:8080/ws/customer/demo-customer-id
   ```

### Development Workflow

1. **Backend development workflow:**
   ```bash
   # Make changes to Java code
   # Rebuild specific service
   cd customer-service
   mvn clean compile
   
   # Restart specific service
   docker-compose restart customer-service
   
   # View service logs
   docker-compose logs -f customer-service
   ```

2. **Frontend development workflow:**
   ```bash
   # Frontend changes are automatically reloaded
   # For type checking
   npm run type-check
   
   # For linting
   npm run lint
   
   # For formatting
   npm run format
   ```

## Running Tests

The platform implements comprehensive testing strategies including unit tests, integration tests, and end-to-end tests.

### Backend Unit Tests

1. **Run all backend unit tests:**
   ```bash
   cd src/backend
   mvn test
   ```

2. **Run tests for specific service:**
   ```bash
   cd customer-service
   mvn test
   ```

3. **Run tests with coverage report:**
   ```bash
   mvn test jacoco:report
   # Coverage reports available in target/site/jacoco/
   ```

4. **Run specific test classes:**
   ```bash
   mvn test -Dtest=CustomerServiceTest
   mvn test -Dtest=RiskAssessmentServiceTest
   ```

### Frontend Unit Tests

1. **Run React component tests:**
   ```bash
   cd src/web
   npm test
   ```

2. **Run tests in watch mode:**
   ```bash
   npm run test:watch
   ```

3. **Run tests with coverage:**
   ```bash
   npm run test:coverage
   # Coverage report available in coverage/ directory
   ```

4. **TypeScript type checking:**
   ```bash
   npm run type-check
   ```

### Integration Tests

1. **Backend integration tests:**
   ```bash
   cd src/backend
   mvn verify -P integration-tests
   ```

2. **API integration tests:**
   ```bash
   # Using newman (Postman CLI)
   npm install -g newman
   newman run tests/postman/Platform-API-Tests.json \
     --environment tests/postman/Local-Environment.json
   ```

3. **Database integration tests:**
   ```bash
   # Tests with embedded databases
   mvn test -P integration-tests -Dspring.profiles.active=test
   ```

### End-to-End Tests

1. **Setup E2E test environment:**
   ```bash
   cd src/web
   npm run cypress:install
   ```

2. **Run E2E tests headlessly:**
   ```bash
   npm run e2e:headless
   ```

3. **Run E2E tests interactively:**
   ```bash
   npm run cypress:open
   ```

4. **E2E test scenarios:**
   - Customer onboarding flow (complete KYC process)
   - Payment processing with risk assessment
   - Advisor dashboard functionality
   - Compliance monitoring workflows
   - Real-time notification systems

### Performance Tests

1. **Load testing with JMeter:**
   ```bash
   # Install JMeter
   # Run performance test suite
   jmeter -n -t tests/performance/LoadTest.jmx \
     -l results/load-test-results.jtl \
     -e -o results/html-report/
   ```

2. **Frontend performance testing:**
   ```bash
   # Lighthouse CI for performance metrics
   npm run lighthouse:ci
   ```

### Test Data Management

1. **Reset test databases:**
   ```bash
   ./init-local-env.sh --reset
   ```

2. **Load specific test datasets:**
   ```bash
   ./scripts/load-test-data.sh --scenario customer-onboarding
   ./scripts/load-test-data.sh --scenario high-volume-transactions
   ./scripts/load-test-data.sh --scenario compliance-scenarios
   ```

## Coding Standards

The platform follows strict coding standards to ensure maintainability, security, and compliance with financial services regulations.

### Backend Coding Standards

1. **Java Code Style:**
   - Follow Google Java Style Guide
   - Use Java 21 features (records, pattern matching, text blocks)
   - Implement comprehensive error handling
   - Include detailed JavaDoc for public APIs

2. **Spring Boot Best Practices:**
   ```java
   // Example service implementation
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
           
           // Validation
           validateCustomerRequest(request);
           
           // Business logic
           Customer customer = Customer.builder()
               .email(request.getEmail())
               .firstName(request.getFirstName())
               .lastName(request.getLastName())
               .build();
           
           // Risk assessment
           RiskScore riskScore = riskService.assessCustomerRisk(customer);
           customer.setRiskCategory(riskScore.getCategory());
           
           // Persistence
           Customer savedCustomer = customerRepository.save(customer);
           
           log.info("Customer created successfully with ID: {}", savedCustomer.getId());
           return CustomerProfile.from(savedCustomer);
       }
   }
   ```

3. **Error Handling:**
   ```java
   @RestControllerAdvice
   public class GlobalExceptionHandler {
       
       @ExceptionHandler(CustomerNotFoundException.class)
       public ResponseEntity<ErrorResponse> handleCustomerNotFound(
           CustomerNotFoundException ex) {
           
           ErrorResponse error = ErrorResponse.builder()
               .code("CUSTOMER_NOT_FOUND")
               .message("Customer not found")
               .timestamp(Instant.now())
               .build();
           
           return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
       }
   }
   ```

### Frontend Coding Standards

1. **TypeScript Configuration:**
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true,
       "exactOptionalPropertyTypes": true,
       "noImplicitReturns": true,
       "noUncheckedIndexedAccess": true
     }
   }
   ```

2. **React Component Standards:**
   ```typescript
   // Functional component with proper typing
   interface CustomerCardProps {
     customer: Customer;
     onEdit?: (customer: Customer) => void;
     className?: string;
   }
   
   export const CustomerCard: React.FC<CustomerCardProps> = ({
     customer,
     onEdit,
     className
   }) => {
     const [isLoading, setIsLoading] = useState(false);
     
     const handleEditClick = useCallback(() => {
       if (onEdit) {
         onEdit(customer);
       }
     }, [customer, onEdit]);
     
     return (
       <div className={clsx('customer-card', className)}>
         <h3>{customer.fullName}</h3>
         <p>Risk Level: {customer.riskCategory}</p>
         {onEdit && (
           <button 
             onClick={handleEditClick}
             disabled={isLoading}
             aria-label={`Edit customer ${customer.fullName}`}
           >
             Edit Customer
           </button>
         )}
       </div>
     );
   };
   ```

3. **Custom Hooks:**
   ```typescript
   // Data fetching hook with error handling
   export const useCustomerData = (customerId: string) => {
     const [data, setData] = useState<Customer | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<Error | null>(null);
     
     useEffect(() => {
       const fetchCustomer = async () => {
         try {
           setLoading(true);
           setError(null);
           const customer = await customerAPI.getById(customerId);
           setData(customer);
         } catch (err) {
           setError(err as Error);
         } finally {
           setLoading(false);
         }
       };
       
       fetchCustomer();
     }, [customerId]);
     
     return { data, loading, error };
   };
   ```

### Code Quality Tools

1. **Backend Quality Tools:**
   ```bash
   # SonarQube analysis
   mvn sonar:sonar
   
   # SpotBugs static analysis
   mvn spotbugs:check
   
   # Dependency vulnerability check
   mvn org.owasp:dependency-check-maven:check
   ```

2. **Frontend Quality Tools:**
   ```bash
   # ESLint for code quality
   npm run lint
   
   # Prettier for formatting
   npm run format
   
   # Type checking
   npm run type-check
   
   # Bundle analysis
   npm run analyze
   ```

### Documentation Standards

- All public APIs must include comprehensive documentation
- Use OpenAPI 3.0 specifications for REST endpoints
- Include JSDoc for TypeScript functions and components
- Maintain up-to-date README files for each service
- Document configuration options and environment variables

For detailed coding standards, refer to:
- `docs/development/coding-standards.md`
- `CONTRIBUTING.md` in the project root

## Troubleshooting

### Common Setup Issues

1. **Docker Permission Issues (Linux/macOS):**
   ```bash
   # Add user to docker group
   sudo usermod -aG docker $USER
   # Logout and login again
   
   # Or run with sudo (not recommended for development)
   sudo docker-compose up -d
   ```

2. **Port Conflicts:**
   ```bash
   # Check which process is using a port
   lsof -i :8080
   netstat -tulpn | grep :8080
   
   # Kill process using port
   kill -9 <PID>
   
   # Or modify port in docker-compose.yml
   ```

3. **Java Version Issues:**
   ```bash
   # Check Java version
   java -version
   javac -version
   
   # Set JAVA_HOME (macOS)
   export JAVA_HOME=$(/usr/libexec/java_home -v 21)
   
   # Set JAVA_HOME (Linux)
   export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
   ```

4. **Node.js Version Issues:**
   ```bash
   # Use nvm to manage Node versions
   nvm install 20
   nvm use 20
   
   # Verify version
   node --version
   npm --version
   ```

### Database Connection Issues

1. **PostgreSQL Connection Problems:**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # Check logs
   docker-compose logs postgres
   
   # Connect to database manually
   docker exec -it platform-postgres psql -U platform_user -d platform_db
   
   # Reset database
   docker-compose down -v
   docker-compose up -d postgres
   ./init-local-env.sh --databases-only
   ```

2. **MongoDB Connection Issues:**
   ```bash
   # Check MongoDB status
   docker-compose ps mongodb
   
   # Connect to MongoDB
   docker exec -it platform-mongodb mongosh
   
   # Check MongoDB logs
   docker-compose logs mongodb
   ```

### Build and Compilation Issues

1. **Maven Build Failures:**
   ```bash
   # Clean and rebuild
   mvn clean install -DskipTests
   
   # Force update dependencies
   mvn clean install -U
   
   # Check for dependency conflicts
   mvn dependency:tree
   
   # Skip tests if they're failing
   mvn clean install -DskipTests
   ```

2. **npm Installation Issues:**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Use specific registry
   npm install --registry https://registry.npmjs.org/
   ```

### Service Communication Issues

1. **API Gateway Not Routing:**
   ```bash
   # Check gateway logs
   docker-compose logs api-gateway
   
   # Test direct service access
   curl http://localhost:8081/actuator/health
   
   # Check service registration
   curl http://localhost:8080/actuator/gateway/routes
   ```

2. **Authentication Issues:**
   ```bash
   # Check auth service logs
   docker-compose logs auth-service
   
   # Verify JWT configuration
   curl -X POST http://localhost:8085/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

### Performance Issues

1. **Slow Startup Times:**
   ```bash
   # Increase Docker memory allocation
   # Docker Desktop -> Settings -> Resources -> Memory: 8GB+
   
   # Disable unnecessary services
   docker-compose up -d postgres mongodb redis api-gateway customer-service
   ```

2. **High Memory Usage:**
   ```bash
   # Monitor resource usage
   docker stats
   
   # Limit service memory in docker-compose.yml
   mem_limit: 512m
   ```

### Frontend Development Issues

1. **Hot Reload Not Working:**
   ```bash
   # Check if files are being watched
   npm run dev -- --verbose
   
   # Clear Next.js cache
   rm -rf .next
   npm run dev
   ```

2. **TypeScript Compilation Errors:**
   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit
   
   # Restart TypeScript server in VS Code
   # Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
   ```

### Getting Help

1. **Internal Documentation:**
   - `docs/` directory in the repository
   - Service-specific README files
   - API documentation at `/api-docs` endpoints

2. **Development Team Support:**
   - Slack channel: #platform-development
   - Email: dev-support@platform.local
   - Weekly office hours: Wednesdays 2-3 PM

3. **External Resources:**
   - Spring Boot Documentation: https://spring.io/projects/spring-boot
   - React Documentation: https://react.dev/
   - Docker Documentation: https://docs.docker.com/
   - Financial Services APIs: Internal confluence wiki

4. **Debugging Tools:**
   ```bash
   # Enable debug logging
   export SPRING_PROFILES_ACTIVE=debug
   export DEBUG=*
   
   # Use remote debugging for Java services
   # Add to JVM args: -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005
   ```

This setup guide provides a comprehensive foundation for developing on the Unified Financial Services Platform. For additional support or clarification on any aspect of the development environment, please refer to the troubleshooting section or contact the development team.