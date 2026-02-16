import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    domains: [
      'res.cloudinary.com',
      'tribeme-bucket.s3.us-east-2.amazonaws.com',
    ],
  },
  
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint warnings during builds
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable error overlay
      config.devServer = config.devServer || {};
      config.devServer.client = config.devServer.client || {};
      config.devServer.client.overlay = false;
    }
    return config;
  },
  devIndicators: {
    buildActivity: false, // Disable the "static" route indicator
    buildActivityPosition: 'bottom-left', // Optional: Change position (irrelevant if disabled)
    appIsrStatus: false, // Disable the "ISR" route indicator
  },
};

export default nextConfig;
