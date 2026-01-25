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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://vercel.live https://*.vercel.live;",
              "child-src https://challenges.cloudflare.com https://vercel.live https://*.vercel.live;",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' blob: data: https:;",
              "font-src 'self' data:;",
              "connect-src 'self' https://challenges.cloudflare.com https://fwonowsvrbrgeaahoekk.supabase.co wss://fwonowsvrbrgeaahoekk.supabase.co https://vercel.live https://*.vercel.live;",
              "frame-src https://challenges.cloudflare.com https://vercel.live https://*.vercel.live;"
            ].join(' ').replace(/\s{2,}/g, ' ').trim()
          }
        ],
      },
    ]
  },
}

export default nextConfig

