/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pixabay.com',
        pathname: '/**',
      },

      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.bing.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.wixstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
        pathname: '/**',
      }
    ],
  },

  // Next.js 16 uses Turbopack by default.
  // An empty turbopack config silences the "webpack config but no turbopack config" error.
  // The white-web-sdk / React 19 compatibility fix lives in scripts/patch-react-dom.cjs
  // (postinstall) and directly patches node_modules/react-dom/index.js — no bundler
  // config required.
  turbopack: {},
};

export default nextConfig;
