# Design

<!-- impeccable:design-schema 1 -->

## World

**Industrial Streetwear Grammar**, adapted to Velas. Chosen over a dealt hand
(Darkroom Safelight, Crouwel Grid Specimen) and the grounded roll (Territory
Binder, Digitized) via `concept-seed.mjs` (seed key `763ffd2a`) — the user
picked this challenger directly from the decision page.

**Thesis:** zones are stenciled utility labels, clients are item-cards, and
every order carries a zip-tie tag that stays ON through fulfillment and gets
cut at delivered/cancelled — refusing the generic stat-card CRM dashboard
this category always ships.

**Story:** a seller opens the app between stops, sees today's route as
stamped stops, logs an order with one tag-shaped action, and trusts
picking/packing sees it the instant it's placed.

Full direction contract lives as an HTML comment at the top of `<body>` in
[`src/app/layout.tsx`](./src/app/layout.tsx).

## Surfaces built

- **Seller (`/vendedor`)** — five-tab shell (Hoy / Agenda / Clientes / Ruta /
  Pedidos). Today dashboard, multi-week agenda (month-chip planner doubling
  as a visit repository), clients/prospects, zone map + smart route, orders,
  notifications. Full detail in `.impeccable/surfaces/src-app-vendedor.md`.
- **Picking/Packing (`/preparacion`)** — a single fulfillment queue grouped
  into sections by status (Para preparar / En preparación / Empacado / En
  camino), each order a card with client, zone, and the exact items to pick.
  No tab bar — the role has one real destination, so the established
  multi-tab shell would be empty chrome. Reuses every core component below
  unchanged; the new pieces are `StatusDropdown`, `PickingItemRow`, and
  `OrderNumberField` (`src/components/shared/`).
- **Admin** — still a placeholder page (`src/app/admin/page.tsx`).

`TopBar`, `NotificationBell`, and `NotificationList` moved to
`src/components/shared/` and take a `notificationsHref` /
`orderHrefPrefix` prop so both roles share one implementation instead of
forking it.

## Mode

**Operate.** The visitor completes a task (plan a route, log an order,
advance fulfillment); scanability and native mobile expectations outrank
expression. Brand lives in precise, load-bearing details — the zip-tie tag
and utility label aren't decoration, they're the actual status/zone system.

## Color

**Strategy: Restrained** (neutrals plus one accent) — the default for
Operate, and matches the source system exactly rather than inventing a
softer or warmer rendition.

| Token | Value | Use |
| --- | --- | --- |
| `--color-base` | `#F5F5F5` | page ground |
| `--color-ink` | `#0D0D0D` | text, borders, structural fills |
| `--color-steel` | `#BDBDBD` | secondary borders, dashed empty-states |
| `--color-steel-light` | `#E2E2E2` | secondary fills (inputs, delivered tag) |
| `--color-concrete` | `#6B6B6B` | secondary text |
| `--color-safety` | `#FF5A00` | the one accent — primary actions, active status dot, alert tiles only |

Hazard stripe (`.hazard-stripe`, 45° repeating ink/base, and
`.hazard-stripe-safety` for the safety/ink variant) is reserved for
**attention states only** — a card corner flagging a first-time visit, a
cancelled order's tag, a danger-variant button's underline. It never
decorates a neutral element.

## Type

- **Display** — Oswald (condensed, uppercase, weight 600), self-hosted via
  `next/font/google`. Headings and section kickers.
- **Data / labels** — IBM Plex Mono. Every utility label, stat tile, order
  status tag, timestamp, and price is monospace — reserved for data and
  measurement per the craft floor, never used as a "technical" costume.
- **Body** — IBM Plex Sans. Prose, form labels, card copy.

## Core components

| Component | File | Notes |
| --- | --- | --- |
| `LabelPlate` | `src/components/ui/label-plate.tsx` | quoted utility label ("ZONA CENTRO"), CSS-generated curly quotes |
| `UtilityTile` | `src/components/ui/utility-tile.tsx` | bordered stat box; `alert` prop switches border/value to safety orange |
| `Card` | `src/components/ui/card.tsx` | bordered container; `attention` prop renders a hazard-stripe corner triangle |
| `Button` | `src/components/ui/button.tsx` | tag-notch clip-path on every variant; `primary` / `secondary` / `danger` (danger = hazard-stripe underline, not a color swap, to protect contrast) |
| `OrderStatusTag` | `src/components/ui/order-status-tag.tsx` | the zip-tie: notched tag shape, ink fill + safety dot while active, steel fill at delivered, struck-through + diagonal cut at cancelled |
| `OrderStatusTimeline` | `src/components/ui/order-status-timeline.tsx` | vertical stepper reusing the same reached/current/future language as the tag |
| `FabLink` | `src/components/ui/fab-link.tsx` | primary list-page action — **in document flow, not `fixed`**, see Known deviations |
| `StatusDropdown` | `src/components/shared/status-dropdown.tsx` | tag-notched `<select>` over all five fulfillment stages — forward or backward, so picking/packing can correct a mistaken tap without leaving the screen |
| `ItemListPreview` | `src/components/shared/item-list-preview.tsx` | queue-card item list; collapses after 2 items behind a "Ver los N productos" toggle |
| `PickingItemRow` | `src/components/shared/picking-item-row.tsx` | per-line-item picked checkbox + live stock-vs-ordered indicator + issue-note field, all under one explicit "Guardar" (no auto-save); saving a note notifies the order's seller and every admin |
| `OrderNumberField` | `src/components/shared/order-number-field.tsx` | editable "N.º de orden" — picking/packing and admin only; sellers see it read-only |
| `StopCard` / `StopCardActions` | `src/components/seller/stop-card*.tsx` | shared by Hoy and Agenda; "Marcar visitado" expands to Con pedido (→ new order) / Sin pedido (marks the visit done in place) |
| Icons | `src/components/ui/icons.tsx` | hand-authored single-stroke (1.75) SVGs; no icon font, no emoji |

## Layout & interaction

- Mobile-first, single-column card lists throughout — no data tables.
- Bottom tab bar (`TabBar`) with quoted labels (`"HOY"` · `"CLIENTES"` ·
  `"RUTA"` · `"PEDIDOS"`), active tab inverts to ink fill.
- Top bar (`TopBar`) carries the brand label-plate and a live notification
  bell (Realtime-driven unread badge).
- 24-hour time everywhere (`hour12: false`) — deliberate: es-AR's 12-hour
  format ("a. m.") wrapped inside the compact mono time column used on
  stop/appointment cards; 24-hour also reads as more field-tool-utilitarian.

## Known deviations from the original direction contract

- **Primary list actions ("+ Nuevo cliente/pedido") render in normal
  document flow, not `position: fixed`.** The contract's FIRST VIEWPORT
  line describes a "fixed" action; during the finish pass this produced a
  real defect — at this app's realistic list lengths (a handful of items up
  to ~50), content height regularly lands close to viewport height, so a
  viewport-pinned button overlapped the last card at rest, not just
  mid-scroll. Padding-bottom cannot fix this (padding only reserves space
  *after* content, and the overlap happens *before* any padding is
  scrolled into view). Keeping the action a normal block element after the
  list — still orange, still tag-shaped, still the clear next step — trades
  persistent mid-scroll visibility for guaranteed non-overlap. The Home
  ("HOY") dashboard keeps this same in-flow treatment for consistency.

## Open decisions (do not invent silently)

Carried from `PRODUCT.md` and the shape brief:

- Zone boundaries are a flat area-name list (`zones.areas`), not polygon
  geometry — fine for filtering/labels, insufficient for an admin
  "draw a zone" feature.
- Spanish status/label copy needs a native-speaker pass before real users
  see it.
- Admin and Picking/Packing surfaces are unbuilt placeholders
  (`src/app/admin`, `src/app/preparacion`) — they should extend this same
  world, not invent a new one, when shaped.
