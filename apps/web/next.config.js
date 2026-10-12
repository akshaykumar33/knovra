/** Routes from the earlier 17-page preview, mapped onto the workflow workspace. */
const LEGACY_ROUTES = {
  '/projects': '/app',
  '/repository': '/app/explore',
  '/graph': '/app/explore',
  '/impact': '/app/context',
  '/context': '/app/context',
  '/decisions': '/app/memory',
  '/rules': '/app/memory',
  '/sessions': '/app/history',
  '/history': '/app/history',
  '/agents': '/app/connect',
  '/providers': '/app/connect',
  '/settings': '/app/settings',
  '/docs': '/#how',
  '/architecture': '/#how',
  '/local-first': '/#trust',
  '/benchmarks': '/',
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.KNOVRA_BUILD_DIR || '.next',
  transpilePackages: ['@knovra/contracts'],
  poweredByHeader: false,
  async redirects() {
    return Object.entries(LEGACY_ROUTES).map(([source, destination]) => ({ source, destination, permanent: false }));
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'same-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
