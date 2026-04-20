import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false as any,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vteamfit-app.b-cdn.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
