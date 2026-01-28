/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Pour Docker
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
