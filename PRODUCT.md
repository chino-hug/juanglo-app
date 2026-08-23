# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router, TypeScript, Tailwind CSS). Supabase for Postgres, Auth, Storage, and Edge Functions. Deployment via GitHub → Vercel CI/CD. Google Maps (Geocoding + Directions API) for zone mapping and smart-route optimization. SendGrid for transactional email, sent from Supabase Edge Functions.

## Users

Three roles, all confirmed by the brief:

- **Admin** — full access; works from an office context; needs oversight across all clients, orders, stock, and users, plus a privileged/password-gated path for delete/edit of any record and audit log visibility.
- **Seller** — manages their own clients, prospects, appointments, and orders; works in the field visiting zones, so needs mobile-friendly access to plan visits, log prospects, and create orders on site.
- **Picking/Packing staff** — warehouse-based; sees only orders assigned to them and updates fulfillment status only (no client, stock-editing, or admin access).

## Product Purpose

An internal operations tool for a candles company that runs the full sales-to-delivery lifecycle in one place: client and prospect relationship management, zone-based territory organization, appointment scheduling, stock/inventory tracking, order creation, and fulfillment tracking from picking through delivery. Success means each role can do their part of that lifecycle without needing a separate spreadsheet, CRM, or messaging thread, and status changes are visible in real time to whoever needs them.

## Positioning

Not a generic CRM or generic inventory tool. The distinct mechanism is the combination of zone-based territory management with map-based smart route optimization for field sellers, tied directly to real-time order fulfillment tracking (picking → packing → out for delivery → delivered) — built around this specific business's direct-sales, zone-visited, warehouse-fulfilled workflow rather than adapted from a horizontal tool.

## Operating Context

- Sellers work in the field, visiting clients and prospects across assigned zones; they need to schedule/reschedule visits, convert prospects to clients, and create orders from wherever they are.
- Picking/packing staff work in a warehouse/fulfillment setting; they need a focused view limited to their assigned orders and a simple way to advance status.
- Admin works from an office context with full visibility across clients, orders, stock, zones, and users, plus a separate privileged path (password re-confirmation or admin-only route) for destructive or cross-role edits.
- Order status changes and new-order events drive real-time, cross-role notifications (in-app + email): new order → picking/packing; status changes → seller/admin; appointment reminders → seller.

## Capabilities and Constraints

- Auth via Supabase Auth (email/password); role stored in a `profiles` table; role-based data access enforced through Row Level Security policies, not just UI hiding.
- Core data models: `clients` (contact, address, lat/lng, zone_id, notes, seller_id owner, status: client/prospect/scheduled), `zones`, `products`/`stock` (SKU, quantity, low-stock threshold), `appointments`, `orders` (line items, total, status enum `created → picking → packed → out_for_delivery → delivered → cancelled`, per-status timestamps), `order_status_history` (audit trail).
- Real-time order status and notifications via Supabase Realtime.
- Map & zones: plot clients by geocoded address, group/color by zone; admin can draw/edit zone boundaries. Zone boundary representation (polygon vs. list of areas) is an open implementation decision.
- Smart routes: optimized visit sequencing for a seller's day/week across selected clients in a zone, via Google Directions API; sequenced route viewable/exportable on the map.
- Deployment: GitHub repo → Vercel CI/CD; environment variables for Supabase, Google Maps, and SendGrid keys.
- No real business data available — see Evidence on Hand.

## Brand Commitments

None confirmed yet. No existing company name, logo, color palette, or tagline was provided — "velas-web-app" is only the working folder name (Spanish for "candles"), not a confirmed brand name. Do not treat it as one; confirm before it appears as product-facing copy.

## Evidence on Hand

No real client, product, or zone data was provided. Seed data must be synthetic/placeholder (sample clients, zones, products) for testing only — do not fabricate real business data, pricing, or testimonials when building or documenting this product.

## Product Principles

1. Role boundaries are enforced at the data layer (RLS), not just hidden in the UI — picking/packing staff must not be able to reach unassigned orders even if a screen leaked, and sellers must not reach other sellers' clients.
2. Field usability wins for sellers and pickers — mobile-friendly, fast entry, minimal friction on order and status updates; office-grade density is appropriate for admin screens.
3. Every order status change is auditable — `order_status_history` is the source of truth for what happened and when, not the current-state fields alone.
4. Real-time visibility over polling — order status and notifications should feel live to anyone watching a dashboard.
5. Zones are the organizing structure for both sales assignment and route planning — client lists, smart routes, and reporting all key off zone, not just region text.
