import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      // Add your production domain when you deploy
      // {
      //   protocol: 'https',
      //   hostname: 'yourdomain.com',
      //   pathname: '/uploads/**',
      // },
    ],
  },
};

export default nextConfig;