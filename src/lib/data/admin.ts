import { createClient } from "@/lib/supabase/server";
import type { AppointmentStatus } from "@/lib/supabase/database.types";
import { MOCK_MODE } from "@/lib/mock/config";
import { mockGetAdminDashboardStats, mockListAppointmentsForAdmin } from "@/lib/mock/queries";

export interface AdminDashboardStats {
  ordersThisMonth: number;
  ordersToday: number;
  storesToVisitToday: number;
  storesVisitedToday: number;
  packedToday: number;
}

// Team-wide, not scoped to one seller — the admin dashboard's whole point is
// to see everything at once. Each count feeds off a mutation that already
// revalidates "/admin" (order creation, status changes, appointment
// completion), so this stays live without any extra plumbing.
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  if (MOCK_MODE) return mockGetAdminDashboardStats();

  const supabase = await createClient();

  const now = new Date();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    { count: ordersThisMonth },
    { count: ordersToday },
    { count: storesToVisitToday },
    { count: storesVisitedToday },
    { count: packedToday },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString())
      .lt("created_at", startOfNextMonth.toISOString()),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString()),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("status", "scheduled")
      .gte("scheduled_at", startOfDay.toISOString())
      .lte("scheduled_at", endOfDay.toISOString()),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("status", "done")
      .gte("scheduled_at", startOfDay.toISOString())
      .lte("scheduled_at", endOfDay.toISOString()),
    supabase
      .from("order_status_history")
      .select("id", { count: "exact", head: true })
      .eq("status", "packed")
      .gte("changed_at", startOfDay.toISOString())
      .lte("changed_at", endOfDay.toISOString()),
  ]);

  return {
    ordersThisMonth: ordersThisMonth ?? 0,
    ordersToday: ordersToday ?? 0,
    storesToVisitToday: storesToVisitToday ?? 0,
    storesVisitedToday: storesVisitedToday ?? 0,
    packedToday: packedToday ?? 0,
  };
}

export interface AdminStopRow {
  id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  client: {
    id: string;
    name: string | null;
    business_name: string | null;
    address: string | null;
    zone: { id: string; name: string } | null;
  } | null;
  seller: { id: string; full_name: string } | null;
}

// Team-wide appointments for today or the next 7 days — the drill-down
// behind "Tiendas por visitar" / "Tiendas visitadas" on the admin dashboard.
export async function listStoresForAdmin(
  filters: { estado?: AppointmentStatus | "todos"; rango?: "hoy" | "semana" } = {},
): Promise<AdminStopRow[]> {
  if (MOCK_MODE) return mockListAppointmentsForAdmin(filters) as AdminStopRow[];

  const supabase = await createClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + (filters.rango === "semana" ? 7 : 1));

  let query = supabase
    .from("appointments")
    .select(
      "id, scheduled_at, status, client:clients(id, name, business_name, address, zone:zones(id, name)), seller:profiles(id, full_name)",
    )
    .gte("scheduled_at", start.toISOString())
    .lt("scheduled_at", end.toISOString())
    .order("scheduled_at", { ascending: true });

  if (filters.estado && filters.estado !== "todos") {
    query = query.eq("status", filters.estado);
  }

  const { data } = await query;
  return (data ?? []) as unknown as AdminStopRow[];
}
