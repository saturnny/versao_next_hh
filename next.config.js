/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@azure/msal-node', '@microsoft/microsoft-graph-client'],
}

module.exports = nextConfig
