/**
 * Next.js Configuration for Unified Financial Services Platform
 * 
 * This configuration file defines build-time and runtime behaviors for the Next.js 14+ web application,
 * including security headers, performance optimizations, image handling, and custom webpack configurations
 * to support enterprise-grade financial services requirements.
 * 
 * Performance Requirements:
 * - Response time: <2 seconds
 * - Concurrent users: 1,000+
 * - Availability: 99.9%
 * - TPS: 10,000+ (core platform integration)
 * 
 * Security Requirements:
 * - Zero-trust security model
 * - Financial services compliance (PCI-DSS, SOX, GDPR)
 * - Multi-layered security headers
 * - Content Security Policy implementation
 * 
 * @version 1.0.0
 * @compliance PCI-DSS, SOX, GDPR, FINRA, Basel III/IV
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * React Strict Mode Configuration
   * Enables additional checks and warnings for React components during development.
   * Essential for financial applications to catch potential issues early in development.
   */
  reactStrictMode: true,

  /**
   * Image Optimization Configuration
   * Configures Next.js built-in Image Optimization API for enhanced performance.
   * Critical for meeting <2 second response time requirements.
   */
  images: {
    /**
     * Remote Image Patterns
     * Defines allowed external image sources for security and performance.
     * Unsplash.com approved for demo/placeholder content in development.
     */
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.financialservices.com',
        port: '',
        pathname: '/assets/**',
      }
    ],
    /**
     * Image Quality Settings
     * Optimized for financial services where image quality matters for document scanning,
     * user profiles, and compliance documentation.
     */
    quality: 85,
    /**
     * Image Formats
     * Modern formats for better compression and performance.
     */
    formats: ['image/webp', 'image/avif'],
    /**
     * Device Sizes for Responsive Images
     * Optimized for financial services multi-device usage patterns.
     */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    /**
     * Image Sizes for Different Breakpoints
     * Tailored for financial dashboard layouts and mobile banking interfaces.
     */
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  /**
   * Environment Variables Configuration
   * Defines client-side environment variables for the financial services platform.
   * These variables are embedded at build time and available in the browser.
   */
  env: {
    /**
     * API Base URL
     * Primary endpoint for financial services API gateway.
     * Supports microservices architecture with unified data integration.
     */
    API_BASE_URL: process.env.API_BASE_URL || 'https://api.financialservices.com',
    /**
     * Application Environment
     * Used for environment-specific configurations and compliance tracking.
     */
    APP_ENV: process.env.NODE_ENV || 'development',
    /**
     * Feature Flags for Financial Services
     */
    ENABLE_BLOCKCHAIN_FEATURES: process.env.ENABLE_BLOCKCHAIN_FEATURES || 'false',
    ENABLE_AI_RISK_ASSESSMENT: process.env.ENABLE_AI_RISK_ASSESSMENT || 'true',
    ENABLE_REAL_TIME_MONITORING: process.env.ENABLE_REAL_TIME_MONITORING || 'true',
  },

  /**
   * Experimental Features Configuration
   * Enables cutting-edge Next.js features for enhanced performance and capabilities.
   * Carefully selected for production stability in financial services environment.
   */
  experimental: {
    /**
     * Server Components
     * Enables React Server Components for improved performance and reduced client-side JavaScript.
     * Critical for meeting performance requirements in financial applications.
     */
    serverComponentsExternalPackages: ['@financial/core-utils', '@financial/security'],
    /**
     * Optimized Package Imports
     * Reduces bundle size for better performance in financial dashboard applications.
     */
    optimizePackageImports: ['lodash', 'date-fns', '@mui/material', '@financial/ui-components'],
    /**
     * Turbo Mode for Development
     * Faster development builds for financial services development teams.
     */
    turbo: {
      rules: {
        '*.tsx': ['@financial/eslint-config'],
        '*.ts': ['@financial/eslint-config'],
      },
    },
  },

  /**
   * Security Headers Configuration
   * Implements comprehensive security headers following zero-trust security model.
   * Critical for financial services compliance and data protection.
   */
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self), usb=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.financialservices.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://images.unsplash.com https://cdn.financialservices.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://api.financialservices.com wss://realtime.financialservices.com",
              "media-src 'self' https://cdn.financialservices.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          }
        ],
      },
      {
        // API routes specific headers
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGINS || 'https://app.financialservices.com'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With, X-API-Key'
          },
          {
            key: 'X-RateLimit-Limit',
            value: '1000'
          },
          {
            key: 'X-RateLimit-Remaining',
            value: '999'
          }
        ],
      }
    ];
  },

  /**
   * Custom Webpack Configuration
   * Optimizes the build process for financial services requirements including
   * performance, security, and compliance considerations.
   */
  webpack(config, { buildId, dev, isServer, defaultLoaders, webpack }) {
    /**
     * Development-specific optimizations
     */
    if (dev) {
      // Enable source maps for better debugging in financial services development
      config.devtool = 'eval-source-map';
      
      // Fast refresh for React components during development
      config.plugins.push(
        new webpack.DefinePlugin({
          __DEV__: JSON.stringify(true),
          __FINANCIAL_SERVICES_DEBUG__: JSON.stringify(true)
        })
      );
    }

    /**
     * Production optimizations
     */
    if (!dev) {
      // Bundle analyzer for production optimization
      config.plugins.push(
        new webpack.DefinePlugin({
          __DEV__: JSON.stringify(false),
          __FINANCIAL_SERVICES_DEBUG__: JSON.stringify(false)
        })
      );

      // Optimization for financial services bundle size
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          maxAsyncRequests: 25,
          cacheGroups: {
            // Financial services core utilities
            financialCore: {
              test: /[\\/]node_modules[\\/](@financial|financial-).*[\\/]/,
              name: 'financial-core',
              chunks: 'all',
              priority: 30,
            },
            // Third-party UI libraries
            uiLibraries: {
              test: /[\\/]node_modules[\\/](@mui|@emotion|react-hook-form).*[\\/]/,
              name: 'ui-libraries',
              chunks: 'all',
              priority: 20,
            },
            // Charts and visualization libraries
            charts: {
              test: /[\\/]node_modules[\\/](chart\.js|recharts|d3).*[\\/]/,
              name: 'charts',
              chunks: 'all',
              priority: 15,
            },
            // Default vendor chunk
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
    }

    /**
     * Resolve configuration for financial services modules
     */
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@financial/core': path.resolve(__dirname, '../shared/financial-core'),
        '@financial/utils': path.resolve(__dirname, '../shared/utils'),
        '@financial/types': path.resolve(__dirname, '../shared/types'),
        '@financial/components': path.resolve(__dirname, './src/components'),
        '@financial/hooks': path.resolve(__dirname, './src/hooks'),
        '@financial/services': path.resolve(__dirname, './src/services'),
      },
    };

    /**
     * Module rules for specialized financial services file types
     */
    config.module.rules.push(
      {
        test: /\.(pdf|doc|docx)$/,
        use: {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/documents/',
            outputPath: 'static/documents/',
            name: '[name].[hash].[ext]',
          },
        },
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      }
    );

    /**
     * Performance monitoring and optimization plugins
     */
    if (!isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.BUILD_ID': JSON.stringify(buildId),
          'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
        })
      );
    }

    /**
     * Security enhancements for financial services
     */
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.SECURITY_HEADERS_ENABLED': JSON.stringify('true'),
        'process.env.CSP_ENABLED': JSON.stringify('true'),
        'process.env.COMPLIANCE_MODE': JSON.stringify(process.env.COMPLIANCE_MODE || 'strict'),
      })
    );

    return config;
  },

  /**
   * Compiler Configuration
   * Enables optimizations specific to financial services requirements.
   */
  compiler: {
    // Remove console logs in production for security
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
    
    // Enable React compiler optimizations
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    
    // Styled-components support for financial UI components
    styledComponents: true,
  },

  /**
   * Output Configuration
   * Optimizes output for financial services deployment requirements.
   */
  output: 'standalone',
  
  /**
   * Trailing Slash Configuration
   * Ensures consistent URL structure for financial services SEO and routing.
   */
  trailingSlash: false,

  /**
   * Compression Configuration
   * Enables gzip compression for better performance in financial applications.
   */
  compress: true,

  /**
   * Power Management
   * Optimizes for server-side performance in financial services infrastructure.
   */
  poweredByHeader: false,

  /**
   * Asset Prefix for CDN Support
   * Supports CDN deployment for global financial services performance.
   */
  assetPrefix: process.env.CDN_PREFIX || '',

  /**
   * Redirect Configuration
   * Handles legacy URL redirects for financial services migration.
   */
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/app/dashboard',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/auth/signin',
        permanent: true,
      },
    ];
  },

  /**
   * Rewrite Configuration
   * Handles API route rewrites for microservices integration.
   */
  async rewrites() {
    return [
      {
        source: '/api/financial/:path*',
        destination: `${process.env.API_BASE_URL}/api/:path*`,
      },
      {
        source: '/api/blockchain/:path*',
        destination: `${process.env.BLOCKCHAIN_API_URL || process.env.API_BASE_URL}/blockchain/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;