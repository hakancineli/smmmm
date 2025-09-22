/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'smmmmukellef.com.tr'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
