import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  allowedDevOrigins: [
    'http://localhost:3001',
    'http://192.168.0.2:3001', // ← 모바일/다른 PC에서 접속할 IP
  ],
};

export default nextConfig;
