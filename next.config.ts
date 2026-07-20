import type { NextConfig } from "next";

let bunnyHost = 'vteamfitjuly2026.b-cdn.net';
const bunnyUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL;
if (bunnyUrl) {
  try {
    const formattedUrl = bunnyUrl.startsWith('http') ? bunnyUrl : `https://${bunnyUrl}`;
    bunnyHost = new URL(formattedUrl).hostname;
  } catch (e) {
    console.error('Error parsing NEXT_PUBLIC_BUNNY_CDN_URL in next.config.ts:', e);
  }
}

const nextConfig: NextConfig = {
  devIndicators: false as any,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: bunnyHost,
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
