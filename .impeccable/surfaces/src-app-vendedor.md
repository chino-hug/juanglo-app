---
version: 1
slug: "src-app-vendedor"
primary_target: "src/app/vendedor"
related_targets: []
---

## Scope & visitor mode

Seller (vendedora) surface, `/vendedor/*`. Mode: Operate. Mobile-first,
phone primary. Covers Home/Today, Clients & Prospects, Appointments, Zone
map + Smart route, Orders (create/detail/status), Notifications.

## Audience, job, action, proof, constraints

Field sellers, checked constantly between client stops. Job: run today's
route, manage clients/prospects, log orders, watch fulfillment status live.
No offline support assumed (reliable connectivity). Scale: ~10-50
clients/prospects per seller, small orders. Spanish UI throughout.

## Direction & memorable moment

Industrial Streetwear Grammar (see DESIGN.md at project root). Memorable
moment: an order's status is a zip-tie tag that stays on through the
pipeline and visibly gets cut at delivered/cancelled — the fulfillment
metaphor is load-bearing, not decorative.

## Unresolved

Real zone polygon geometry, native-speaker Spanish copy pass, Admin and
Picking/Packing surfaces still unbuilt (placeholders only).
