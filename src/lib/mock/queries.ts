import { getStore } from "./store";
import type { AppointmentStatus, ClientStatus, OrderStatus } from "@/lib/supabase/database.types";
import { clientDisplayName } from "@/lib/client-display";

function matchesClientQuery(c: { name: string | null; business_name: string | null; phone: string | null }, q: string) {
  return (
    (c.name?.toLowerCase().includes(q) ?? false) ||
    (c.business_name?.toLowerCase().includes(q) ?? false) ||
    (c.phone?.toLowerCase().includes(q) ?? false)
  );
}

function zoneOf(zoneId: string | null) {
  if (!zoneId) return null;
  const zone = getStore().zones.find((z) => z.id === zoneId);
  return zone ? { id: zone.id, name: zone.name } : null;
}

// City/region live on the zone, not the client — matches when either filter
// is unset (no narrowing) or when the client's zone satisfies it.
function matchesZoneFilter(zoneId: string | null, filters: { city?: string; region?: string }): boolean {
  if (!filters.city && !filters.region) return true;
  if (!zoneId) return false;
  const zone = getStore().zones.find((z) => z.id === zoneId);
  if (!zone) return false;
  if (filters.city && zone.city !== filters.city) return false;
  if (filters.region && zone.region !== filters.region) return false;
  return true;
}

function isWithinToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

// ---------------------------------------------------------------------------
// seller.ts
// ---------------------------------------------------------------------------
export function mockGetTodayStops(sellerId: string) {
  const store = getStore();
  return store.appointments
    .filter((a) => a.seller_id === sellerId && isWithinToday(a.scheduled_at))
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
    .map((a) => {
      const client = store.clients.find((c) => c.id === a.client_id) ?? null;
      return {
        id: a.id,
        scheduled_at: a.scheduled_at,
        status: a.status,
        notes: a.notes,
        client: client
          ? {
              id: client.id,
              name: client.name,
              business_name: client.business_name,
              address: client.address,
              status: client.status,
              zone: zoneOf(client.zone_id),
            }
          : null,
      };
    });
}

export function mockGetAdminDashboardStats() {
  const store = getStore();
  const now = new Date();

  const ordersThisMonth = store.orders.filter((o) => {
    const d = new Date(o.created_at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  const ordersToday = store.orders.filter((o) => isWithinToday(o.created_at)).length;

  const storesToVisitToday = store.appointments.filter(
    (a) => a.status === "scheduled" && isWithinToday(a.scheduled_at),
  ).length;

  const storesVisitedToday = store.appointments.filter(
    (a) => a.status === "done" && isWithinToday(a.scheduled_at),
  ).length;

  const packedToday = store.orderStatusHistory.filter(
    (h) => h.status === "packed" && isWithinToday(h.changed_at),
  ).length;

  return { ordersThisMonth, ordersToday, storesToVisitToday, storesVisitedToday, packedToday };
}

export function mockGetSellerDashboardStats(sellerId: string) {
  const store = getStore();
  const stopsToday = store.appointments.filter(
    (a) => a.seller_id === sellerId && a.status === "scheduled" && isWithinToday(a.scheduled_at),
  ).length;
  const pendingOrders = store.orders.filter(
    (o) =>
      o.seller_id === sellerId &&
      ["created", "picking", "packed", "out_for_delivery"].includes(o.status),
  ).length;
  const lowStockAlerts = store.products.filter(
    (p) => p.quantity_on_hand <= p.low_stock_threshold,
  ).length;
  return { stopsToday, pendingOrders, lowStockAlerts };
}

// Team-wide appointments (any seller) for today or the next 7 days — the
// drill-down behind the admin dashboard's "Tiendas por visitar/visitadas".
export function mockListAppointmentsForAdmin(
  filters: { estado?: AppointmentStatus | "todos"; rango?: "hoy" | "semana" } = {},
) {
  const store = getStore();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + (filters.rango === "semana" ? 7 : 1));

  let rows = store.appointments.filter((a) => {
    const d = new Date(a.scheduled_at);
    return d >= start && d < end;
  });
  if (filters.estado && filters.estado !== "todos") {
    rows = rows.filter((a) => a.status === filters.estado);
  }

  return rows
    .slice()
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
    .map((a) => {
      const client = store.clients.find((c) => c.id === a.client_id) ?? null;
      const seller = store.profiles.find((p) => p.id === a.seller_id) ?? null;
      return {
        id: a.id,
        scheduled_at: a.scheduled_at,
        status: a.status,
        client: client
          ? {
              id: client.id,
              name: client.name,
              business_name: client.business_name,
              address: client.address,
              zone: zoneOf(client.zone_id),
            }
          : null,
        seller: seller ? { id: seller.id, full_name: seller.full_name } : null,
      };
    });
}

// ---------------------------------------------------------------------------
// clients.ts
// ---------------------------------------------------------------------------
export function mockListClients(
  sellerId: string,
  filters: { q?: string; status?: ClientStatus | "todos"; zoneId?: string; city?: string; region?: string } = {},
) {
  const store = getStore();
  let rows = store.clients.filter((c) => c.seller_id === sellerId);
  if (filters.status && filters.status !== "todos") {
    rows = rows.filter((c) => c.status === filters.status);
  }
  if (filters.zoneId) {
    rows = rows.filter((c) => c.zone_id === filters.zoneId);
  }
  rows = rows.filter((c) => matchesZoneFilter(c.zone_id, filters));
  if (filters.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter((c) => matchesClientQuery(c, q));
  }
  return rows
    .slice()
    .sort((a, b) => clientDisplayName(a).localeCompare(clientDisplayName(b)))
    .map((c) => ({
      id: c.id,
      name: c.name,
      business_name: c.business_name,
      address: c.address,
      phone: c.phone,
      status: c.status,
      zone: zoneOf(c.zone_id),
    }));
}

// Every client across every seller, alphabetical — the admin directory.
export function mockListClientsForAdmin(
  filters: { q?: string; status?: ClientStatus | "todos"; zoneId?: string; city?: string; region?: string } = {},
) {
  const store = getStore();
  let rows = store.clients.slice();
  if (filters.status && filters.status !== "todos") {
    rows = rows.filter((c) => c.status === filters.status);
  }
  if (filters.zoneId) {
    rows = rows.filter((c) => c.zone_id === filters.zoneId);
  }
  rows = rows.filter((c) => matchesZoneFilter(c.zone_id, filters));
  if (filters.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter((c) => matchesClientQuery(c, q));
  }
  return rows
    .sort((a, b) => clientDisplayName(a).localeCompare(clientDisplayName(b)))
    .map((c) => ({
      id: c.id,
      name: c.name,
      business_name: c.business_name,
      address: c.address,
      phone: c.phone,
      status: c.status,
      zone: zoneOf(c.zone_id),
    }));
}

export function mockGetClient(id: string) {
  const client = getStore().clients.find((c) => c.id === id);
  if (!client) return null;
  return { ...client, zone: zoneOf(client.zone_id) };
}

export function mockListZones() {
  return getStore()
    .zones.slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((z) => ({ id: z.id, name: z.name, city: z.city, region: z.region }));
}

export function mockGetZone(id: string) {
  return getStore().zones.find((z) => z.id === id) ?? null;
}

export function mockGetClientOrders(clientId: string) {
  return getStore()
    .orders.filter((o) => o.client_id === clientId)
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((o) => ({ id: o.id, status: o.status, total: o.total, created_at: o.created_at }));
}

export function mockGetClientAppointments(clientId: string) {
  return getStore()
    .appointments.filter((a) => a.client_id === clientId)
    .slice()
    .sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at))
    .map((a) => ({ id: a.id, scheduled_at: a.scheduled_at, status: a.status, notes: a.notes }));
}

// ---------------------------------------------------------------------------
// appointments.ts
// ---------------------------------------------------------------------------
export function mockListAppointmentsForMonth(sellerId: string, year: number, month: number) {
  const store = getStore();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return store.appointments
    .filter((a) => {
      if (a.seller_id !== sellerId) return false;
      const d = new Date(a.scheduled_at);
      return d >= start && d < end;
    })
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
    .map((a) => {
      const client = store.clients.find((c) => c.id === a.client_id) ?? null;
      return {
        id: a.id,
        scheduled_at: a.scheduled_at,
        status: a.status,
        client: client
          ? {
              id: client.id,
              name: client.name,
              business_name: client.business_name,
              address: client.address,
              status: client.status,
              zone: zoneOf(client.zone_id),
            }
          : null,
      };
    });
}

export function mockListMonthsWithAppointments(sellerId: string, year: number): number[] {
  const store = getStore();
  const months = new Set<number>();
  for (const a of store.appointments) {
    if (a.seller_id !== sellerId) continue;
    const d = new Date(a.scheduled_at);
    if (d.getFullYear() === year) months.add(d.getMonth() + 1);
  }
  return [...months].sort((a, b) => a - b);
}

export function mockListBookedTimesForDate(sellerId: string, date: string): string[] {
  const store = getStore();
  return store.appointments
    .filter((a) => {
      if (a.seller_id !== sellerId || a.status === "cancelled") return false;
      const d = new Date(a.scheduled_at);
      const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return localDate === date;
    })
    .map((a) => {
      const d = new Date(a.scheduled_at);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    });
}

export function mockGetAppointment(id: string) {
  const store = getStore();
  const a = store.appointments.find((x) => x.id === id);
  if (!a) return null;
  const client = store.clients.find((c) => c.id === a.client_id) ?? null;
  return {
    id: a.id,
    scheduled_at: a.scheduled_at,
    status: a.status,
    notes: a.notes,
    client_id: a.client_id,
    client: client
      ? {
          id: client.id,
          name: client.name,
          business_name: client.business_name,
          address: client.address,
        }
      : null,
  };
}

// ---------------------------------------------------------------------------
// orders.ts
// ---------------------------------------------------------------------------
export function mockListOrders(sellerId: string, status?: OrderStatus | "todos") {
  const store = getStore();
  let rows = store.orders.filter((o) => o.seller_id === sellerId);
  if (status && status !== "todos") rows = rows.filter((o) => o.status === status);
  return rows
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((o) => {
      const client = store.clients.find((c) => c.id === o.client_id) ?? null;
      return {
        id: o.id,
        status: o.status,
        total: o.total,
        orderNumber: o.order_number,
        created_at: o.created_at,
        client: client ? { id: client.id, name: client.name } : null,
      };
    });
}

export function mockGetOrder(id: string) {
  const store = getStore();
  const order = store.orders.find((o) => o.id === id);
  if (!order) return null;
  const client = store.clients.find((c) => c.id === order.client_id) ?? null;
  const items = store.orderItems
    .filter((i) => i.order_id === id)
    .map((i) => {
      const product = store.products.find((p) => p.id === i.product_id) ?? null;
      return {
        id: i.id,
        quantity: i.quantity,
        unit_price: i.unit_price,
        picked: i.picked,
        note: i.note,
        product: product
          ? {
              id: product.id,
              name: product.name,
              sku: product.sku,
              quantityOnHand: product.quantity_on_hand,
            }
          : null,
      };
    });
  const history = store.orderStatusHistory
    .filter((h) => h.order_id === id)
    .sort((a, b) => a.changed_at.localeCompare(b.changed_at))
    .map((h) => ({ id: h.id, status: h.status, changed_at: h.changed_at }));

  return {
    id: order.id,
    status: order.status,
    total: order.total,
    orderNumber: order.order_number,
    notes: order.notes,
    created_at: order.created_at,
    client: client
      ? { id: client.id, name: client.name, address: client.address, phone: client.phone }
      : null,
    items,
    history,
  };
}

export function mockListProducts() {
  return getStore()
    .products.slice()
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function mockGetProduct(id: string) {
  return getStore().products.find((p) => p.id === id) ?? null;
}

export function mockListCategories() {
  return getStore()
    .productCategories.slice()
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function mockGetCategory(id: string) {
  return getStore().productCategories.find((c) => c.id === id) ?? null;
}

export function mockListColors() {
  return getStore()
    .productColors.slice()
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function mockGetColor(id: string) {
  return getStore().productColors.find((c) => c.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// route.ts
// ---------------------------------------------------------------------------
export function mockListGeocodedClients(sellerId: string) {
  return getStore()
    .clients.filter((c) => c.seller_id === sellerId && c.lat != null && c.lng != null)
    .map((c) => ({
      id: c.id,
      name: c.name,
      address: c.address,
      lat: c.lat as number,
      lng: c.lng as number,
      zoneId: c.zone_id,
      zoneName: zoneOf(c.zone_id)?.name ?? null,
    }));
}

// ---------------------------------------------------------------------------
// picking.ts
// ---------------------------------------------------------------------------
const QUEUE_STATUSES: OrderStatus[] = ["created", "picking", "packed", "out_for_delivery"];

export function mockListQueueOrders() {
  const store = getStore();
  return store.orders
    .filter((o) => QUEUE_STATUSES.includes(o.status))
    .slice()
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((o) => {
      const client = store.clients.find((c) => c.id === o.client_id) ?? null;
      const items = store.orderItems
        .filter((i) => i.order_id === o.id)
        .map((i) => ({
          id: i.id,
          quantity: i.quantity,
          productName: store.products.find((p) => p.id === i.product_id)?.name ?? "Producto",
        }));
      return {
        id: o.id,
        status: o.status,
        orderNumber: o.order_number,
        createdAt: o.created_at,
        client: client
          ? {
              id: client.id,
              name: client.name,
              address: client.address,
              zoneName: zoneOf(client.zone_id)?.name ?? null,
            }
          : null,
        items,
      };
    });
}

// All orders across every seller for one active status, or all four active
// statuses when none is given. Delivered orders live in the separate
// month/year históric view, not this flat list.
export function mockListAllOrders(status?: OrderStatus | "todos", clientId?: string) {
  const store = getStore();
  const statuses = status && status !== "todos" ? [status] : QUEUE_STATUSES;
  return store.orders
    .filter((o) => statuses.includes(o.status) && (!clientId || o.client_id === clientId))
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((o) => {
      const client = store.clients.find((c) => c.id === o.client_id) ?? null;
      return {
        id: o.id,
        status: o.status,
        total: o.total,
        orderNumber: o.order_number,
        created_at: o.created_at,
        client: client ? { id: client.id, name: client.name, address: client.address } : null,
      };
    });
}

// Every order across every seller and every status — the admin dashboard's
// "resumen de pedidos", scoped to a calendar range by created_at.
export function mockListOrdersForAdmin(
  filters: {
    estado?: OrderStatus | "todos";
    rango?: "todos" | "mes" | "hoy";
    clientId?: string;
  } = {},
) {
  const store = getStore();
  const now = new Date();

  let rows = store.orders.slice();
  if (filters.estado && filters.estado !== "todos") {
    rows = rows.filter((o) => o.status === filters.estado);
  }
  if (filters.clientId) {
    rows = rows.filter((o) => o.client_id === filters.clientId);
  }
  if (filters.rango === "mes") {
    rows = rows.filter((o) => {
      const d = new Date(o.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
  } else if (filters.rango === "hoy") {
    rows = rows.filter((o) => isWithinToday(o.created_at));
  }

  return rows
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((o) => {
      const client = store.clients.find((c) => c.id === o.client_id) ?? null;
      return {
        id: o.id,
        status: o.status,
        total: o.total,
        orderNumber: o.order_number,
        created_at: o.created_at,
        client: client ? { id: client.id, name: client.name, address: client.address } : null,
      };
    });
}

// Orders with a "packed" event logged today, regardless of their current
// status — mirrors mockGetAdminDashboardStats' packedToday count exactly.
export function mockListOrdersPackedToday() {
  const store = getStore();
  const packedOrderIds = new Set(
    store.orderStatusHistory
      .filter((h) => h.status === "packed" && isWithinToday(h.changed_at))
      .map((h) => h.order_id),
  );

  return store.orders
    .filter((o) => packedOrderIds.has(o.id))
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((o) => {
      const client = store.clients.find((c) => c.id === o.client_id) ?? null;
      return {
        id: o.id,
        status: o.status,
        total: o.total,
        orderNumber: o.order_number,
        created_at: o.created_at,
        client: client ? { id: client.id, name: client.name, address: client.address } : null,
      };
    });
}

export function mockCountOrdersByStatus(): Record<OrderStatus, number> {
  const store = getStore();
  const counts: Record<OrderStatus, number> = {
    created: 0,
    picking: 0,
    packed: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const o of store.orders) counts[o.status] += 1;
  return counts;
}

// Grey/total = every order currently in the active pipeline; green/packed =
// the ones that have already made it through packing (packed or beyond).
export function mockGetPackingProgress(): { total: number; packed: number } {
  const store = getStore();
  const active = store.orders.filter((o) => QUEUE_STATUSES.includes(o.status));
  const packed = active.filter((o) => o.status === "packed" || o.status === "out_for_delivery");
  return { total: active.length, packed: packed.length };
}

export function mockListDeliveredMonthsWithOrders(year: number): number[] {
  const store = getStore();
  const months = new Set<number>();
  for (const o of store.orders) {
    if (o.status !== "delivered") continue;
    const d = new Date(o.updated_at);
    if (d.getFullYear() === year) months.add(d.getMonth() + 1);
  }
  return [...months].sort((a, b) => a - b);
}

export function mockListDeliveredOrdersForMonth(year: number, month: number, clientId?: string) {
  const store = getStore();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return store.orders
    .filter((o) => {
      if (o.status !== "delivered") return false;
      if (clientId && o.client_id !== clientId) return false;
      const d = new Date(o.updated_at);
      return d >= start && d < end;
    })
    .slice()
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .map((o) => {
      const client = store.clients.find((c) => c.id === o.client_id) ?? null;
      return {
        id: o.id,
        status: o.status,
        total: o.total,
        orderNumber: o.order_number,
        deliveredAt: o.updated_at,
        client: client ? { id: client.id, name: client.name, address: client.address } : null,
      };
    });
}

export function mockCountDeliveredOrdersForYear(year: number, clientId?: string): number {
  const store = getStore();
  return store.orders.filter((o) => {
    if (o.status !== "delivered") return false;
    if (clientId && o.client_id !== clientId) return false;
    return new Date(o.updated_at).getFullYear() === year;
  }).length;
}

// Every delivered order for one client, regardless of month/year — the
// "all orders" view histórico switches to once a client is selected.
export function mockListDeliveredOrdersForClient(clientId: string) {
  const store = getStore();
  return store.orders
    .filter((o) => o.status === "delivered" && o.client_id === clientId)
    .slice()
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .map((o) => ({
      id: o.id,
      status: o.status,
      total: o.total,
      orderNumber: o.order_number,
      deliveredAt: o.updated_at,
      client: null,
    }));
}

export function mockListAllClients() {
  const store = getStore();
  return store.clients
    .slice()
    .sort((a, b) => clientDisplayName(a).localeCompare(clientDisplayName(b)))
    .map((c) => ({ id: c.id, name: c.name, business_name: c.business_name, phone: c.phone }));
}

// ---------------------------------------------------------------------------
// admin/usuarios/actions.ts
// ---------------------------------------------------------------------------
export function mockListUsers() {
  return getStore()
    .profiles.slice()
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
}

export function mockGetUser(id: string) {
  return getStore().profiles.find((p) => p.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// notifications.ts
// ---------------------------------------------------------------------------
export function mockListNotifications(userId: string) {
  const store = getStore();
  return store.notifications
    .filter((n) => n.user_id === userId)
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 50)
    .map((n) => {
      const order = n.order_id ? store.orders.find((o) => o.id === n.order_id) : null;
      const client = order ? store.clients.find((c) => c.id === order.client_id) : null;
      return {
        ...n,
        clientName: client?.name ?? null,
        orderNumber: order?.order_number ?? null,
      };
    });
}
