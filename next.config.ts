import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "remaster-storage.s3.ap-south-1.amazonaws.com",
        pathname: "/images/**", // allow only cover art
      },
    ],
  },
};

export default nextConfig;
