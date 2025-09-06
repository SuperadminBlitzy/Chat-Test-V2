// PostCSS Configuration for Financial Services Platform
// This configuration file sets up the CSS processing pipeline for the frontend application
// Built with React 18.2+ and Next.js 14+ as specified in the technical architecture

module.exports = {
  // PostCSS plugins configuration
  // These plugins are processed in the order specified below
  plugins: {
    // Tailwind CSS - Utility-first CSS framework
    // Version: ^3.4.1
    // Purpose: Provides utility classes for rapid UI development and consistent design system
    // Used for building responsive financial dashboards and user interfaces
    tailwindcss: {},

    // Autoprefixer - PostCSS plugin to parse CSS and add vendor prefixes
    // Version: ^10.4.1  
    // Purpose: Automatically adds vendor prefixes to CSS rules using values from Can I Use
    // Ensures cross-browser compatibility for the financial services platform
    // Critical for supporting enterprise browser requirements and legacy browser support
    autoprefixer: {},
  },
};