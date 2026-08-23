import { createClient } from "@/lib/supabase/server";
import { MOCK_MODE } from "@/lib/mock/config";
import { mockGetTodayStops, mockGetSellerDashboardStats } from "@/lib/mock/queries";

export async function getTodayStops(sellerId: string) {
  if (MOCK_MODE) return mockGetTodayStops(sellerId);

  const supabase = await createClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const { data } = await supabase
    .from("appointments")
    .select(
      "id, scheduled_at, status, notes, client:clients(id, name, business_name, address, status, zone:zones(id, name))",
    )
    .eq("seller_id", sellerId)
    .gte("scheduled_at", startOfDay.toISOString())
    .lte("scheduled_at", endOfDay.toISOString())
    .order("scheduled_at", { ascending: true });

  return data ?? [];
}

export async function getSellerDashboardStats(sellerId: string) {
  if (MOCK_MODE) return mockGetSellerDashboardStats(sellerId);

  const supabase = await createClient();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [{ count: stopsToday }, { count: pendingOrders }, { data: products }] = await Promise.all([
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", sellerId)
      .eq("status", "scheduled")
      .gte("scheduled_at", startOfDay.toISOString())
      .lte("scheduled_at", endOfDay.toISOString()),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", sellerId)
      .in("status", ["created", "picking", "packed", "out_for_delivery"]),
    supabase.from("products").select("id, quantity_on_hand, low_stock_threshold"),
  ]);

  const stockRows = (products ?? []) as Array<{
    quantity_on_hand: number;
    low_stock_threshold: number;
  }>;
  const lowStockAlerts = stockRows.filter(
    (p) => p.quantity_on_hand <= p.low_stock_threshold,
  ).length;

  return {
    stopsToday: stopsToday ?? 0,
    pendingOrders: pendingOrders ?? 0,
    lowStockAlerts,
  };
}
