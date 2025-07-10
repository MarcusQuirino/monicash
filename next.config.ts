import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Skip lint and typecheck during Vercel builds since they run in CI
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
