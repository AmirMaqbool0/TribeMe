// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   experimental: {
//     serverActions: {

//     },
//   },
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: '',
//       },
//       {
//         protocol: 'https',
//         hostname: '*.google.com',
//       },
//     ]
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Add any necessary configurations here or remove if unused
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.google.com', // ✅ Ensure all entries have valid hostnames
      },
    ],
  },
};

export default nextConfig;
