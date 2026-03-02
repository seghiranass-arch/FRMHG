/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Cache API routes
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_INTERNAL_URL || 'http://localhost:3001'}/:path*`,
      },
    ];
  },
};

export default nextConfig;







