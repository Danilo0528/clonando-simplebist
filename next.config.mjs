/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    turbopack: {
      root: process.cwd(),
    }
  }
};

// Force restart
export default nextConfig;
