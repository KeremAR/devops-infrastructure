/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_USER_SERVICE_URL: process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8001',
    NEXT_PUBLIC_TODO_SERVICE_URL: process.env.NEXT_PUBLIC_TODO_SERVICE_URL || 'http://localhost:8002',
  },
}

module.exports = nextConfig
