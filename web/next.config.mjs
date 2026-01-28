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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://vercel.live https://*.vercel.live https://js.stripe.com https://m.stripe.network 'sha256-7PZaH7TzFg4JdT5xJguN7Och6VcMcP1LW4N3fQ936Fs=' 'sha256-MqH8JJslY2fF2bGYY1rZlpCNrRCnWKRzrrDefixUJTI=' 'sha256-ZswfTY7H35rbv8WC7NXBoiC7WNu86vSzCDChNWwZZDM=' 'sha256-e357n1PxCJ8d03/QCSKaHFmHF1JADyvSHdSfshxM494=' 'sha256-5DA+a07wxWmEka9IdoWjSPVHb17Cp5284/lJzfbl8KA=' 'sha256-/5Guo2nzv5n/w6ukZpOBZOtTJBJPSkJ6mhHpnBgm3Ls=' 'sha256-n46vPwSWuMC0W703pBofImv82Z26xo4LXymv0E9caPk=' 'sha256-OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo=' 'sha256-bGD16sEDcMz7YsLwirOdrIpO8GImPnyZ9pgPLd9BoOw=' 'sha256-kxaiXqyV/VekRAoS36EaM/jOWmpOtYfscVhWvVKeD70=' 'sha256-+wZjPvQnsa7f7tfyy+vIuVld0j8hGaUSFFAD8DiV8NU=' 'sha256-eNLke58MF3le0iRyyTxTjFwsUKW2BlrXs418x2LniLk=' 'sha256-UcIHlBHEQUDFaIf6Rd8Q4+HtUNdA1x312dQD92iwPG0=' https://*.vercel-scripts.com https://va.vercel-scripts.com;",
              "child-src https://challenges.cloudflare.com https://vercel.live https://*.vercel.live https://js.stripe.com https://hooks.stripe.com;",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' blob: data: https:;",
              "font-src 'self' data:;",
              "connect-src 'self' https://challenges.cloudflare.com https://*.supabase.co wss://*.supabase.co https://vercel.live https://*.vercel.live https://api.stripe.com;",
              "frame-src https://challenges.cloudflare.com https://vercel.live https://*.vercel.live https://js.stripe.com https://hooks.stripe.com;"
            ].join(' ').replace(/\s{2,}/g, ' ').trim()
          }
        ],
      },
    ]
  },
}

export default nextConfig

