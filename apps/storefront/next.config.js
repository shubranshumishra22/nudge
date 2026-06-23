/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@nudge/ui', '@nudge/db', '@nudge/ai'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i.postimg.cc' },
    ],
  },
}

const sentryWebpackPluginOptions = {
  silent: true,
  hideSourceMaps: true,
}

const hasSentryUploadConfig = process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT

if (hasSentryUploadConfig) {
  const { withSentryConfig } = require('@sentry/nextjs')
  module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
} else {
  module.exports = nextConfig
}
