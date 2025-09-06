# Multi-stage build for blockchain service - Builder stage
FROM node:20-alpine AS builder

# Set build arguments for flexibility
ARG NODE_ENV=production
ARG BUILD_DATE
ARG VCS_REF

# Set working directory
WORKDIR /usr/src/app

# Install build dependencies for potential native modules
RUN apk add --no-cache --virtual .gyp \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --include=dev && npm cache clean --force

# Copy application source code
COPY . .

# Compile TypeScript code and run tests
RUN npm run build && \
    npm run test --if-present && \
    npm prune --omit=dev

# Remove build dependencies to keep builder stage clean
RUN apk del .gyp

# Production stage - Final runtime image
FROM node:20-alpine

# Set build arguments for metadata
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION=1.0.0

# Add metadata labels for container management
LABEL maintainer="platform-team@ufs.com" \
      version="${VERSION}" \
      description="Unified Financial Services - Blockchain Service" \
      org.label-schema.build-date="${BUILD_DATE}" \
      org.label-schema.name="ufs-blockchain-service" \
      org.label-schema.description="Hyperledger Fabric blockchain settlement service for financial transactions" \
      org.label-schema.url="https://ufs.com" \
      org.label-schema.vcs-ref="${VCS_REF}" \
      org.label-schema.vcs-url="https://github.com/ufs/blockchain-service" \
      org.label-schema.vendor="Unified Financial Services" \
      org.label-schema.version="${VERSION}" \
      org.label-schema.schema-version="1.0" \
      compliance="PCI-DSS,SOX,GDPR,Basel-III" \
      security.scan="trivy,snyk" \
      blockchain.framework="hyperledger-fabric" \
      service.type="settlement-network"

# Install security updates and runtime dependencies
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    tini \
    curl \
    wget \
    && apk upgrade --no-cache \
    && rm -rf /var/cache/apk/*

# Create non-root user and group for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S blockchain -u 1001 -G nodejs -h /usr/src/app -s /bin/sh

# Set working directory
WORKDIR /usr/src/app

# Copy compiled application from builder stage
COPY --from=builder --chown=blockchain:nodejs /usr/src/app/dist ./dist
COPY --from=builder --chown=blockchain:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=blockchain:nodejs /usr/src/app/package.json ./package.json

# Create necessary directories with proper permissions
RUN mkdir -p /usr/src/app/logs /usr/src/app/tmp /usr/src/app/config && \
    chown -R blockchain:nodejs /usr/src/app && \
    chmod -R 750 /usr/src/app && \
    chmod -R 755 /usr/src/app/dist

# Switch to non-root user
USER blockchain:nodejs

# Set environment variables for production
ENV NODE_ENV=production \
    PORT=3000 \
    LOGGING_LEVEL=info \
    TZ=UTC \
    NODE_OPTIONS="--max-old-space-size=2048 --enable-source-maps" \
    NPM_CONFIG_CACHE=/tmp/.npm \
    NPM_CONFIG_UPDATE_NOTIFIER=false

# Expose application port
EXPOSE 3000

# Add health check for container monitoring
HEALTHCHECK --interval=30s \
           --timeout=10s \
           --start-period=60s \
           --retries=3 \
           CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Use tini as PID 1 for proper signal handling
ENTRYPOINT ["tini", "--"]

# Define the command to run the application
CMD ["npm", "start"]

# Add startup probe configuration for Kubernetes deployment
# This ensures the container is fully ready before receiving traffic
LABEL kubernetes.probe.startup.path="/health" \
      kubernetes.probe.startup.port="3000" \
      kubernetes.probe.startup.scheme="HTTP" \
      kubernetes.probe.liveness.path="/health" \
      kubernetes.probe.liveness.port="3000" \
      kubernetes.probe.readiness.path="/ready" \
      kubernetes.probe.readiness.port="3000"

# Security and compliance metadata for scanning tools
LABEL security.non-root="true" \
      security.user="blockchain:nodejs" \
      security.uid="1001" \
      security.gid="1001" \
      security.capabilities="none" \
      security.selinux="disabled" \
      security.apparmor="unconfined"