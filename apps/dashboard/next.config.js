/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only use standalone output in Docker/CI (not on Windows local dev)
  ...(process.env.DOCKER_BUILD === 'true' ? { output: 'standalone' } : {}),
  transpilePackages: ['@wikibot/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
