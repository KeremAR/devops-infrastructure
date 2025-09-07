/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    USER_SERVICE_URL: process.env.USER_SERVICE_URL || 'http://localhost:8001',
    TODO_SERVICE_URL: process.env.TODO_SERVICE_URL || 'http://localhost:8002',
  },
}

module.exports = nextConfig
