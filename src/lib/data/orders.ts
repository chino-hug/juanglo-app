import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/supabase/database.types";
import { MOCK_MODE } from "@/lib/mock/config";
import {
  mockListOrders,
  mockGetOrder,
  mockListProducts,
  mockListOrdersForAdmin,
  mockListOrdersPackedToday,
} from "@/lib/mock/queries";

export interface OrderListRow {
  id: string;
  status: OrderStatus;
  total: number;
  orderNumber: number;
  created_at: string;
  client: { id: string; name: string | null } | null;
}

export async function listOrders(sellerId: string, status?: OrderStatus | "todos") {
  if (MOCK_MODE) return mockListOrders(sellerId, status) as OrderListRow[];

  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("id, status, total, orderNumber:order_number, created_at, client:clients(id, name)")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (status && status !== "todos") {
    query = query.eq("status", status);
  }

  const { data } = await query;
  return (data ?? []) as unknown as OrderListRow[];
}

export interface AdminOrderRow {
  id: string;
  status: OrderStatus;
  total: number;
  orderNumber: number;
  created_at: string;
  client: { id: string; name: string | null; address: string | null } | null;
}

// Every order across every seller and every status — feeds both the admin
// "Todos los pedidos" view and the dashboard's drill-down tiles ("Pedidos del
// mes" / "Pedidos ingresados"), scoped to a calendar range by created_at.
export async function listOrdersForAdmin(
  filters: {
    estado?: OrderStatus | "todos";
    rango?: "todos" | "mes" | "hoy";
    clientId?: string;
  } = {},
): Promise<AdminOrderRow[]> {
  if (MOCK_MODE) return mockListOrdersForAdmin(filters) as AdminOrderRow[];

  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("id, status, total, orderNumber:order_number, created_at, client:clients(id, name, address)")
    .order("created_at", { ascending: false });

  if (filters.estado && filters.estado !== "todos") {
    query = query.eq("status", filters.estado);
  }
  if (filters.clientId) {
    query = query.eq("client_id", filters.clientId);
  }

  const now = new Date();
  if (filters.rango === "mes") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    query = query.gte("created_at", startOfMonth.toISOString()).lt("created_at", startOfNextMonth.toISOString());
  } else if (filters.rango === "hoy") {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    query = query.gte("created_at", startOfDay.toISOString()).lte("created_at", endOfDay.toISOString());
  }

  const { data } = await query;
  return (data ?? []) as unknown as AdminOrderRow[];
}

// Orders with a "packed" event logged today, regardless of their current
// status — mirrors getAdminDashboardStats' packedToday count exactly.
export async function listOrdersPackedToday(): Promise<AdminOrderRow[]> {
  if (MOCK_MODE) return mockListOrdersPackedToday() as AdminOrderRow[];

  const supabase = await createClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const { data: history } = await supabase
    .from("order_status_history")
    .select("order_id")
    .eq("status", "packed")
    .gte("changed_at", startOfDay.toISOString())
    .lte("changed_at", endOfDay.toISOString());

  const orderIds = [...new Set((history ?? []).map((h) => h.order_id as string))];
  if (orderIds.length === 0) return [];

  const { data } = await supabase
    .from("orders")
    .select("id, status, total, orderNumber:order_number, created_at, client:clients(id, name, address)")
    .in("id", orderIds)
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as AdminOrderRow[];
}

export interface OrderItemRow {
  id: string;
  quantity: number;
  unit_price: number;
  picked: boolean;
  note: string | null;
  product: { id: string; name: string; sku: string; quantityOnHand: number } | null;
}

export interface OrderStatusHistoryRow {
  id: string;
  status: OrderStatus;
  changed_at: string;
}

export interface OrderDetail {
  id: string;
  status: OrderStatus;
  total: number;
  orderNumber: number;
  notes: string | null;
  created_at: string;
  client: { id: string; name: string | null; address: string | null; phone: string | null } | null;
  items: OrderItemRow[];
  history: OrderStatusHistoryRow[];
}

export async function getOrder(id: string): Promise<OrderDetail | null> {
  if (MOCK_MODE) return mockGetOrder(id) as OrderDetail | null;

  const supabase = await createClient();
  const [{ data: order }, { data: items }, { data: history }] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id, status, total, orderNumber:order_number, notes, created_at, client:clients(id, name, address, phone)",
      )
      .eq("id", id)
      .single(),
    supabase
      .from("order_items")
      .select(
        "id, quantity, unit_price, picked, note, product:products(id, name, sku, quantityOnHand:quantity_on_hand)",
      )
      .eq("order_id", id),
    supabase
      .from("order_status_history")
      .select("id, status, changed_at")
      .eq("order_id", id)
      .order("changed_at", { ascending: true }),
  ]);

  if (!order) return null;

  return {
    ...(order as unknown as Omit<OrderDetail, "items" | "history">),
    items: (items ?? []) as unknown as OrderItemRow[],
    history: (history ?? []) as unknown as OrderStatusHistoryRow[],
  };
}

export interface ProductRow {
  id: string;
  sku: string;
  name: string;
  category: string;
  colors: string[];
  price: number;
  quantity_on_hand: number;
  low_stock_threshold: number;
}

export async function listProducts(): Promise<ProductRow[]> {
  if (MOCK_MODE) return mockListProducts();

  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").order("name");
  return (data ?? []) as ProductRow[];
}
