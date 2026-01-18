# Vasta Project

## Architecture: Free Tier Safe Mode

This project is configured to run strictly within the Free Tier limits of Render and Cloudflare Pages.

### Frontend (Cloudflare Pages)

- **Mode**: 100% Static SPA (`output: 'export'`).
- **Routing**: All routing is client-side.
- **Forbidden**:
  - Server Side Rendering (SSR)
  - Middleware (`middleware.ts`)
  - Cloudflare Workers / Server Functions (`@opennextjs`)
  - API Routes (`app/api/*`) - Use pure client calls to Backend.

### Backend (Render Free Tier)

- **Type**: Ruby on Rails API.
- **Workers**: No background workers allowed (Sidekiq/Redis disabled).
- **Jobs**: Configured to `:async` (in-memory execution).
- **Hibernation**: Service sleeps after 15 mins of inactivity. First request latency ~50s.

### Guardrails

1.  **Do not add** `middleware.ts` to `web/`.
2.  **Do not change** `next.config.mjs` output mode.
3.  **Do not use** `getServerSideProps` or `cookies()`/`headers()` in logic impacting build.
