const isDev = process.env.NODE_ENV !== 'production';

const nextConfig = {
  // output: isDev ? undefined : 'export', // Disabled to support dynamic routes via @cloudflare/next-on-pages
  images: { unoptimized: true },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com;",
              "child-src https://challenges.cloudflare.com;",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' blob: data: https:;",
              "font-src 'self' data:;",
              "connect-src 'self' https://challenges.cloudflare.com;",
              "frame-src https://challenges.cloudflare.com;"
            ].join(' ').replace(/\s{2,}/g, ' ').trim()
          }
        ],
      },
    ]
  },
}

export default nextConfig

