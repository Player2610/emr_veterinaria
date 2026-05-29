import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Turbopack is enabled via CLI flag (--turbopack); no config needed here
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
};

export default nextConfig;
