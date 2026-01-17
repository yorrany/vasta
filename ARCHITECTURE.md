# Vasta Architecture Manifesto 🏗️

> "Frontend for Experience, Backend for Truth."

## Core Principle

We follow a strict **"Smart Backend, Dumb Frontend"** architecture.
The Frontend should be a lightweight presentation layer, while the Backend owns all business logic, data integrity, and third-party integrations (Stripe, etc.).

## Responsibilities

### ✅ Backend (Ruby on Rails)

- **Source of Truth**: Manages the database and ensures data consistency.
- **Business Logic**: Calculates prices, validates rules, transitions states.
- **Integrations**: Holds all secret API keys (Stripe Secret Key, etc.).
- **Webhooks**: Listens to external events (e.g., Payment Succeeded) and updates local state.
- **API**: Exposes clear, intent-based endpoints (e.g., `POST /subscriptions/checkout`) rather than generic CRUD where possible.

### ✅ Frontend (Next.js)

- **Presentation**: Renders the UI and manages client-side state (loading, modal open/close).
- **User Intent**: Captures user actions and sends them to the Backend.
- **Routing**: Handles client-side navigation and initial page rendering (SSR).
- **Proxy**: Delegates complicated or secure requests to the Backend via `netlify.toml`.

## Rules of Thumb

1.  **No Secrets in Frontend**: Never use `STRIPE_SECRET_KEY` or `SERVICE_ROLE_KEY` in Next.js.
2.  **No Logic duplication**: If a rule exists in Ruby (e.g., "Pro Plan has 5 users"), do not hardcode it in TypeScript. Fetch it or ask the backend to validate.
3.  **Routes are for Users**: Next.js API Routes (`/api/*`) should be avoided unless strictly necessary for UI-specific needs (e.g., revalidating ISR). Business actions go to Rails.
