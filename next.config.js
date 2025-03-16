/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
    domains: [
      'image.tmdb.org',
      'lh3.googleusercontent.com', // Para avatares do Google
      'i.ibb.co'
    ],
  },
};

module.exports = nextConfig; 