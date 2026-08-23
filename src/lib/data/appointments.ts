import { createClient } from "@/lib/supabase/server";
import { MOCK_MODE } from "@/lib/mock/config";
import {
  mockListAppointmentsForMonth,
  mockListMonthsWithAppointments,
  mockGetAppointment,
  mockListBookedTimesForDate,
} from "@/lib/mock/queries";
import type { AppointmentStatus } from "@/lib/supabase/database.types";

export interface AppointmentRow {
  id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  notes: string | null;
  client: { id: string; name: string | null; business_name: string | null; address: string | null } | null;
}

export interface AgendaAppointmentRow {
  id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  client: {
    id: string;
    name: string | null;
    business_name: string | null;
    address: string | null;
    status: string;
    zone: { id: string; name: string } | null;
  } | null;
}

// month is 1-indexed (1 = January), matching how it reads in a query string.
export async function listAppointmentsForMonth(
  sellerId: string,
  year: number,
  month: number,
): Promise<AgendaAppointmentRow[]> {
  if (MOCK_MODE) return mockListAppointmentsForMonth(sellerId, year, month);

  const supabase = await createClient();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const { data } = await supabase
    .from("appointments")
    .select(
      "id, scheduled_at, status, client:clients(id, name, business_name, address, status, zone:zones(id, name))",
    )
    .eq("seller_id", sellerId)
    .gte("scheduled_at", start.toISOString())
    .lt("scheduled_at", end.toISOString())
    .order("scheduled_at", { ascending: true });

  return (data ?? []) as unknown as AgendaAppointmentRow[];
}

// Which months (1-indexed) in this year have at least one appointment for
// this seller — used to only show chips worth showing, instead of all 12.
export async function listMonthsWithAppointments(
  sellerId: string,
  year: number,
): Promise<number[]> {
  if (MOCK_MODE) return mockListMonthsWithAppointments(sellerId, year);

  const supabase = await createClient();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const { data } = await supabase
    .from("appointments")
    .select("scheduled_at")
    .eq("seller_id", sellerId)
    .gte("scheduled_at", start.toISOString())
    .lt("scheduled_at", end.toISOString());

  const months = new Set<number>();
  for (const row of (data ?? []) as Array<{ scheduled_at: string }>) {
    months.add(new Date(row.scheduled_at).getMonth() + 1);
  }
  return [...months].sort((a, b) => a - b);
}

// "HH:MM" slots already taken on this date, so the new-visit form can grey
// them out instead of letting the seller double-book a time.
export async function listBookedTimesForDate(sellerId: string, date: string): Promise<string[]> {
  if (MOCK_MODE) return mockListBookedTimesForDate(sellerId, date);

  const supabase = await createClient();
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59.999`);

  const { data } = await supabase
    .from("appointments")
    .select("scheduled_at, status")
    .eq("seller_id", sellerId)
    .gte("scheduled_at", start.toISOString())
    .lte("scheduled_at", end.toISOString())
    .neq("status", "cancelled");

  return ((data ?? []) as Array<{ scheduled_at: string }>).map((row) => {
    const d = new Date(row.scheduled_at);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
}

export async function getAppointment(id: string) {
  if (MOCK_MODE) return mockGetAppointment(id);

  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select(
      "id, scheduled_at, status, notes, client_id, client:clients(id, name, business_name, address)",
    )
    .eq("id", id)
    .single();
  return data as unknown as (AppointmentRow & { client_id: string }) | null;
}
