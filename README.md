# Velas

Internal operations app for a candles company: zones, clients/prospects,
appointments, orders, and fulfillment tracking. Two surfaces are built —
**Seller (vendedora)** and **Picking/Packing (preparación)**, forming the
full create-order → fulfill-order loop. **Admin** is still a placeholder
route, shaped in a later pass.

Stack: Next.js (App Router, TypeScript, Tailwind CSS) · Supabase (Postgres,
Auth, Storage, Edge Functions) · Google Maps (geocoding + route optimization)
· SendGrid (transactional email) · deployed via GitHub → Vercel.

See [`PRODUCT.md`](./PRODUCT.md) for product context and confirmed decisions.

## Try it now, no setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000` — with no `.env.local`, the app automatically
runs in **mock mode**: an in-memory server-side store seeded with the same
synthetic data as `supabase/seed.sql`, standing in for Supabase entirely.
The login screen lists the demo accounts (password `velas1234` for all).
Zone/route optimization falls back to a local nearest-neighbor ordering
instead of the Google Directions API in this mode.

Mock mode has one real limitation: it's a plain in-memory store (see
`src/lib/mock/`), so it resets whenever the dev server restarts, and
Realtime pushes (the notification bell updating live, order status
auto-refreshing) are disabled — the server-rendered data still refreshes
normally on every navigation. It exists purely for trying the UI end to
end with zero setup; connect a real Supabase project (below) for anything
beyond that.

## 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com) (or run the stack
   locally with the [Supabase CLI](https://supabase.com/docs/guides/cli) +
   Docker: `supabase init && supabase start`).
2. Apply the schema, RLS policies, and auth trigger in
   [`supabase/migrations`](./supabase/migrations), in order:
   ```bash
   supabase db push          # against a hosted project
   # or, for local dev:
   supabase db reset         # applies migrations + supabase/seed.sql
   ```
3. `supabase/seed.sql` seeds **synthetic, fictional** placeholder data only
   (see `PRODUCT.md` → Evidence on Hand) — no real business data exists yet.
   It creates four demo logins, password `velas1234` for all:
   - `admin@velas.test` — admin
   - `vendedora1@velas.test`, `vendedora2@velas.test` — seller
   - `preparacion@velas.test` — picking/packing

   Seeding inserts directly into `auth.users`, which only works against the
   full local/dev Postgres stack (`supabase start`), not a hosted project's
   pooler connection. Against a hosted project, create these users instead
   via **Authentication → Users** in the Supabase dashboard, then update
   their `role` in the `profiles` table.

## 2. Configure environment variables

Copy the template and fill in real values:

```bash
cp .env.local.example .env.local
```

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page, `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page, `service_role` key — server-only, never expose to the client |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Cloud Console — enable **Maps JavaScript API** |
| `GOOGLE_MAPS_API_KEY` | Server-side key with **Directions API** enabled (route optimization); can reuse the same key if unrestricted, but a separate server-only key is safer |
| `SENDGRID_API_KEY` | SendGrid dashboard → Settings → API Keys |
| `SENDGRID_FROM_EMAIL` | A verified sender in SendGrid |

## 3. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, sign in with one of the seed accounts above.
Sellers land on `/vendedor` (Hoy / Agenda / Clientes / Ruta / Pedidos —
Agenda is a month-chip planner for scheduling and reviewing visits beyond
today); picking/packing lands on `/preparacion` (the fulfillment queue);
admin lands on a placeholder page for now.

## 4. Deploy

1. Push this repo to GitHub.
2. Import it in [Vercel](https://vercel.com/new).
3. Add the same environment variables from step 2 in the Vercel project
   settings.
4. Deploy. Vercel rebuilds on every push to the connected branch.

## Project structure

```
src/app/vendedor/        seller surface
src/app/preparacion/     picking/packing surface (fulfillment queue)
src/app/ingresar/        login
src/app/admin/           placeholder — not yet built
src/components/ui/       shared visual primitives (button, card, tag, icons…)
src/components/seller/   seller-only composed components (tab bar, stop card…)
src/components/shared/   cross-role composed components (top bar, notifications…)
src/lib/data/            server-side data-fetching functions (Supabase or mock)
src/lib/actions/         cross-role Server Actions
src/lib/mock/            in-memory mock backend, see "Try it now" above
src/lib/supabase/        Supabase client/server/middleware setup + types
supabase/migrations/     schema, RLS policies, auth trigger, realtime config
supabase/seed.sql        synthetic local/dev seed data
```

## Design system

This surface follows a committed visual direction — **Industrial Streetwear
Grammar**, adapted to Velas: zones as stenciled utility labels, clients as
item-cards, order status as a zip-tie tag that stays on through fulfillment
and gets cut at delivered/cancelled. Core tokens and primitives live in
[`src/app/globals.css`](./src/app/globals.css) and
[`src/components/ui`](./src/components/ui). The full direction contract is
recorded as an HTML comment at the top of `<body>` in
[`src/app/layout.tsx`](./src/app/layout.tsx).

## Known open decisions

Carried over from `PRODUCT.md` and the shape brief — a future pass should
resolve these rather than a builder inventing an answer silently:

- Zone boundaries are currently a flat list of area names (`zones.areas`),
  not real polygon geometry — sufficient for the seller flow's zone filter
  and labels, but the admin "draw a zone boundary" feature needs a real
  geometry column (e.g. PostGIS) first.
- Exact Spanish status/label terminology should get a native-speaker pass
  before this ships to real users.
- Admin still needs its own shape + build pass inside this same visual
  world (full oversight, privileged edit/delete, audit log, zone drawing).
