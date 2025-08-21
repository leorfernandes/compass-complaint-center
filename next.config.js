/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
    // Turbopack configuration
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Conditional webpack config (not used in turbo mode)
  webpack: (config, { dev, isServer }) => {
    // Only apply webpack config when not using turbo
    if (dev && !process.env.TURBOPACK) {
      // Faster rebuilds in development
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      
      // Disable performance hints in development (they slow things down)
      config.performance = {
        hints: false,
      };
      
      // Faster source maps in development
      config.devtool = 'eval-cheap-module-source-map';
    }
    
    return config;
  },

  // Image optimization (unoptimized in dev for speed)
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  async headers() {
    const headers = [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];

    // Add security headers only in production
    if (process.env.NODE_ENV === 'production') {
      headers.push({
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      });
    }

    return headers;
  },
  
  // Enable compression only in production
  compress: process.env.NODE_ENV === 'production',
  
  // Faster compilation
  swcMinify: true,
  
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
