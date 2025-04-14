import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'remaster-storage.s3.amazonaws.com',
        pathname: '**', // allow only cover art
      },
      
    ],
  },
};

export default nextConfig;
