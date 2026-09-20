/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.KNOVRA_BUILD_DIR || '.next',
  transpilePackages: ['@knovra/contracts'],
};

module.exports = nextConfig;
