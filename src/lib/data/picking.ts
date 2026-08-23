import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/supabase/database.types";
import { MOCK_MODE } from "@/lib/mock/config";
import {
  mockListQueueOrders,
  mockListAllOrders,
  mockCountOrdersByStatus,
  mockGetPackingProgress,
  mockListDeliveredMonthsWithOrders,
  mockListDeliveredOrdersForMonth,
  mockCountDeliveredOrdersForYear,
  mockListDeliveredOrdersForClient,
} from "@/lib/mock/queries";

export const QUEUE_STATUSES: OrderStatus[] = ["created", "picking", "packed", "out_for_delivery"];

export interface QueueItem {
  id: string;
  quantity: number;
  productName: string;
}

export interface QueueOrder {
  id: string;
  status: OrderStatus;
  orderNumber: number;
  createdAt: string;
  client: { id: string; name: string | null; address: string | null; zoneName: string | null } | null;
  items: QueueItem[];
}

export async function listQueueOrders(): Promise<QueueOrder[]> {
  if (MOCK_MODE) return mockListQueueOrders();

  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id, status, orderNumber:order_number, created_at, client:clients(id, name, address, zone:zones(id, name)), items:order_items(id, quantity, product:products(id, name))",
    )
    .in("status", QUEUE_STATUSES)
    .order("created_at", { ascending: true });

  return ((data ?? []) as unknown as Array<{
    id: string;
    status: OrderStatus;
    orderNumber: number;
    created_at: string;
    client: { id: string; name: string | null; address: string | null; zone: { id: string; name: string } | null } | null;
    items: Array<{ id: string; quantity: number; product: { id: string; name: string } | null }>;
  }>).map((o) => ({
    id: o.id,
    status: o.status,
    orderNumber: o.orderNumber,
    createdAt: o.created_at,
    client: o.client
      ? {
          id: o.client.id,
          name: o.client.name,
          address: o.client.address,
          zoneName: o.client.zone?.name ?? null,
        }
      : null,
    items: o.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      productName: i.product?.name ?? "Producto",
    })),
  }));
}

export interface OrderRow {
  id: string;
  status: OrderStatus;
  total: number;
  orderNumber: number;
  created_at: string;
  client: { id: string; name: string | null; address: string | null } | null;
}

// Flat list across every seller for one active status, or all four active
// statuses ("todos") when none is given, optionally narrowed to one client.
// Delivered orders never show up here — see listDeliveredOrdersForMonth.
export async function listAllOrders(
  status?: OrderStatus | "todos",
  clientId?: string,
): Promise<OrderRow[]> {
  if (MOCK_MODE) return mockListAllOrders(status, clientId);

  const supabase = await createClient();
  const statuses = status && status !== "todos" ? [status] : QUEUE_STATUSES;
  let query = supabase
    .from("orders")
    .select("id, status, total, orderNumber:order_number, created_at, client:clients(id, name, address)")
    .in("status", statuses)
    .order("created_at", { ascending: false });

  if (clientId) query = query.eq("client_id", clientId);

  const { data } = await query;
  return (data ?? []) as unknown as OrderRow[];
}

export async function countOrdersByStatus(): Promise<Record<OrderStatus, number>> {
  if (MOCK_MODE) return mockCountOrdersByStatus();

  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("status");
  const counts: Record<OrderStatus, number> = {
    created: 0,
    picking: 0,
    packed: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const row of (data ?? []) as Array<{ status: OrderStatus }>) counts[row.status] += 1;
  return counts;
}

// Grey/total = every order currently in the active pipeline; green/packed =
// the ones that have already made it through packing (packed or beyond).
export async function getPackingProgress(): Promise<{ total: number; packed: number }> {
  if (MOCK_MODE) return mockGetPackingProgress();

  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("status").in("status", QUEUE_STATUSES);
  const rows = (data ?? []) as Array<{ status: OrderStatus }>;
  const packed = rows.filter((r) => r.status === "packed" || r.status === "out_for_delivery");
  return { total: rows.length, packed: packed.length };
}

export interface DeliveredOrderRow {
  id: string;
  status: OrderStatus;
  total: number;
  orderNumber: number;
  deliveredAt: string;
  client: { id: string; name: string | null; address: string | null } | null;
}

// Which months (1-indexed) in this year have at least one delivered order —
// used to only show chips worth showing in the histórico view.
export async function listDeliveredMonthsWithOrders(year: number): Promise<number[]> {
  if (MOCK_MODE) return mockListDeliveredMonthsWithOrders(year);

  const supabase = await createClient();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const { data } = await supabase
    .from("orders")
    .select("updated_at")
    .eq("status", "delivered")
    .gte("updated_at", start.toISOString())
    .lt("updated_at", end.toISOString());

  const months = new Set<number>();
  for (const row of (data ?? []) as Array<{ updated_at: string }>) {
    months.add(new Date(row.updated_at).getMonth() + 1);
  }
  return [...months].sort((a, b) => a - b);
}

export async function listDeliveredOrdersForMonth(
  year: number,
  month: number,
  clientId?: string,
): Promise<DeliveredOrderRow[]> {
  if (MOCK_MODE) return mockListDeliveredOrdersForMonth(year, month, clientId);

  const supabase = await createClient();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  let query = supabase
    .from("orders")
    .select("id, status, total, orderNumber:order_number, updated_at, client:clients(id, name, address)")
    .eq("status", "delivered")
    .gte("updated_at", start.toISOString())
    .lt("updated_at", end.toISOString())
    .order("updated_at", { ascending: false });

  if (clientId) query = query.eq("client_id", clientId);

  const { data } = await query;
  return (
    (data ?? []) as unknown as Array<{
      id: string;
      status: OrderStatus;
      total: number;
      orderNumber: number;
      updated_at: string;
      client: { id: string; name: string | null; address: string | null } | null;
    }>
  ).map((o) => ({
    id: o.id,
    status: o.status,
    total: o.total,
    orderNumber: o.orderNumber,
    deliveredAt: o.updated_at,
    client: o.client,
  }));
}

// Total delivered orders anywhere in the given calendar year, regardless of
// which months have chips — the top-line stat for the histórico view.
export async function countDeliveredOrdersForYear(year: number, clientId?: string): Promise<number> {
  if (MOCK_MODE) return mockCountDeliveredOrdersForYear(year, clientId);

  const supabase = await createClient();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  let query = supabase
    .from("orders")
    .select("id")
    .eq("status", "delivered")
    .gte("updated_at", start.toISOString())
    .lt("updated_at", end.toISOString());

  if (clientId) query = query.eq("client_id", clientId);

  const { data } = await query;
  return (data ?? []).length;
}

// Every delivered order for one client, regardless of month/year — the "all
// orders" view histórico switches to once a client is selected.
export async function listDeliveredOrdersForClient(clientId: string): Promise<DeliveredOrderRow[]> {
  if (MOCK_MODE) return mockListDeliveredOrdersForClient(clientId);

  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, status, total, orderNumber:order_number, updated_at")
    .eq("status", "delivered")
    .eq("client_id", clientId)
    .order("updated_at", { ascending: false });

  return (
    (data ?? []) as unknown as Array<{
      id: string;
      status: OrderStatus;
      total: number;
      orderNumber: number;
      updated_at: string;
    }>
  ).map((o) => ({
    id: o.id,
    status: o.status,
    total: o.total,
    orderNumber: o.orderNumber,
    deliveredAt: o.updated_at,
    client: null,
  }));
}
