const isDev = process.env.NODE_ENV !== "production";

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
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self';",
              "script-src 'self' https://challenges.cloudflare.com https://vercel.live https://*.vercel.live https://js.stripe.com https://m.stripe.network https://*.vercel-scripts.com https://va.vercel-scripts.com 'unsafe-inline' 'unsafe-eval';",
              "child-src https://challenges.cloudflare.com https://vercel.live https://*.vercel.live https://js.stripe.com https://hooks.stripe.com;",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' blob: data: https:;",
              "font-src 'self' data:;",
              "connect-src 'self' https://challenges.cloudflare.com https://*.supabase.co wss://*.supabase.co https://vercel.live https://*.vercel.live https://api.stripe.com;",
              "frame-src https://challenges.cloudflare.com https://vercel.live https://*.vercel.live https://js.stripe.com https://hooks.stripe.com;",
            ]
              .join(" ")
              .replace(/\s{2,}/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
