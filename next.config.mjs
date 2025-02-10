/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'books.google.com',
        port: '',
        pathname: '/books/**',
      },
      {
        protocol: 'https',
        hostname: 'books.google.com',
        port: '',
        pathname: '/books/**',
      },
      {
        protocol: 'https',
        hostname: 'sfaudiourlbucket.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/story-images/**', // Adjust the pathname as needed
      },
      {
        protocol: 'https',
        hostname: 'sfaudiourlbucket.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/achievement-badge/**', // Adjust the pathname as needed
      },
      {
        protocol: 'https',
        hostname: 'sfaudiourlbucket.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/lessons/**', // Adjust the pathname as needed
      }
    ],
  },
};

export default nextConfig;
