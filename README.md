# VALENOR — Digital Fashion House

Valenor is a category-defining premium digital fashion house. This repository contains the complete frontend, backend, and operational dashboard for the brand.

## Architecture

The project is structured as an npm workspace monorepo:

- `apps/web`: The Next.js 15 App Router application (Landing, Storefront, Admin).
- `packages/db`: Prisma ORM, PostgreSQL schema, and generated client.
- `packages/design-system`: The strict UI primitives and Tailwind config enforcing the VALENOR visual language.

## Core Directives

1. **The Interface Must Disappear**: Every interaction reduces cognitive effort. The design uses 0px border radius, strict typography limits, and the custom `valenor-ease` transition curve.
2. **Architecture**: Landing Page First. We validate demand before heavy backend execution.
3. **Reservation Engine**: We utilize Vercel KV (Upstash Redis) to lock inventory *before* hitting PostgreSQL, ensuring we never oversell during high-traffic drops.

## Development

```bash
# Install dependencies
npm install

# Start local environment (requires Docker for Postgres/Redis)
npm run dev
```

## Standard Operating Procedure (SOP) - Drop Day
1. **T-24 Hours**: Verify Vercel KV memory limits. Ensure `DATABASE_URL` is pointing to the production read-replica.
2. **T-1 Hour**: Clear Next.js Data Cache for the `/(storefront)/pieces` route group.
3. **T-0**: Traffic spike hits edge network. Redis handles the reservation queues. Postgres handles the finalized `CONFIRMED` writes.
4. **T+1 Hour**: Run the cron job to clean up any abandoned `HELD` locks in Redis that were never paid for.

---
*Est. Himalayan Atelier — Timeless, by design.*
