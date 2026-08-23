import { createClient } from "@/lib/supabase/server";
import type { ClientStatus, ZoneRegion } from "@/lib/supabase/database.types";
import { MOCK_MODE } from "@/lib/mock/config";
import {
  mockListClients,
  mockGetClient,
  mockListZones,
  mockGetZone,
  mockGetClientOrders,
  mockGetClientAppointments,
  mockListAllClients,
  mockListClientsForAdmin,
} from "@/lib/mock/queries";

export interface ClientListRow {
  id: string;
  name: string | null;
  business_name: string | null;
  address: string | null;
  phone: string | null;
  status: ClientStatus;
  zone: { id: string; name: string } | null;
}

// City/region live on the zone, not the client, so filtering by either one
// means resolving to the set of matching zone ids first. Returns null when
// neither filter is set (meaning "don't narrow by zone at all").
async function resolveZoneIds(filters: { city?: string; region?: string }): Promise<string[] | null> {
  if (!filters.city && !filters.region) return null;

  const supabase = await createClient();
  let query = supabase.from("zones").select("id");
  if (filters.city) query = query.eq("city", filters.city);
  if (filters.region) query = query.eq("region", filters.region);

  const { data } = await query;
  return (data ?? []).map((z) => z.id as string);
}

export async function listClients(
  sellerId: string,
  filters: { q?: string; status?: ClientStatus | "todos"; zoneId?: string; city?: string; region?: string } = {},
) {
  if (MOCK_MODE) return mockListClients(sellerId, filters);

  const supabase = await createClient();
  let query = supabase
    .from("clients")
    .select("id, name, business_name, address, phone, status, zone:zones(id, name)")
    .eq("seller_id", sellerId)
    .order("name", { ascending: true });

  if (filters.status && filters.status !== "todos") {
    query = query.eq("status", filters.status);
  }
  if (filters.zoneId) {
    query = query.eq("zone_id", filters.zoneId);
  }
  const zoneIds = await resolveZoneIds(filters);
  if (zoneIds) {
    query = query.in("zone_id", zoneIds);
  }
  if (filters.q) {
    query = query.or(`name.ilike.%${filters.q}%,business_name.ilike.%${filters.q}%,phone.ilike.%${filters.q}%`);
  }

  const { data } = await query;
  return (data ?? []) as unknown as ClientListRow[];
}

// Every client across every seller, alphabetical — the admin directory.
export async function listClientsForAdmin(
  filters: { q?: string; status?: ClientStatus | "todos"; zoneId?: string; city?: string; region?: string } = {},
): Promise<ClientListRow[]> {
  if (MOCK_MODE) return mockListClientsForAdmin(filters);

  const supabase = await createClient();
  let query = supabase
    .from("clients")
    .select("id, name, business_name, address, phone, status, zone:zones(id, name)")
    .order("name", { ascending: true });

  if (filters.status && filters.status !== "todos") {
    query = query.eq("status", filters.status);
  }
  if (filters.zoneId) {
    query = query.eq("zone_id", filters.zoneId);
  }
  const zoneIds = await resolveZoneIds(filters);
  if (zoneIds) {
    query = query.in("zone_id", zoneIds);
  }
  if (filters.q) {
    query = query.or(`name.ilike.%${filters.q}%,business_name.ilike.%${filters.q}%,phone.ilike.%${filters.q}%`);
  }

  const { data } = await query;
  return (data ?? []) as unknown as ClientListRow[];
}

export interface ClientOption {
  id: string;
  name: string | null;
  business_name: string | null;
  phone: string | null;
}

// Every client across every seller — used by picking/packing's client
// filter, which isn't scoped to a single seller like the seller-side list.
export async function listAllClients(): Promise<ClientOption[]> {
  if (MOCK_MODE) return mockListAllClients();

  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("id, name, business_name, phone")
    .order("name", { ascending: true });
  return (data ?? []) as ClientOption[];
}

export async function getClient(id: string) {
  if (MOCK_MODE) return mockGetClient(id);

  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("*, zone:zones(id, name)")
    .eq("id", id)
    .single();
  return data as
    | (import("@/lib/supabase/database.types").Database["public"]["Tables"]["clients"]["Row"] & {
        zone: { id: string; name: string } | null;
      })
    | null;
}

export interface ZoneRow {
  id: string;
  name: string;
  city: string | null;
  region: ZoneRegion | null;
}

export async function listZones(): Promise<ZoneRow[]> {
  if (MOCK_MODE) return mockListZones();

  const supabase = await createClient();
  const { data } = await supabase.from("zones").select("id, name, city, region").order("name");
  return (data ?? []) as ZoneRow[];
}

export async function getZone(id: string): Promise<ZoneRow | null> {
  if (MOCK_MODE) return mockGetZone(id);

  const supabase = await createClient();
  const { data } = await supabase.from("zones").select("id, name, city, region").eq("id", id).single();
  return data as ZoneRow | null;
}

export async function getClientOrders(clientId: string) {
  if (MOCK_MODE) return mockGetClientOrders(clientId);

  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, status, total, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getClientAppointments(clientId: string) {
  if (MOCK_MODE) return mockGetClientAppointments(clientId);

  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select("id, scheduled_at, status, notes")
    .eq("client_id", clientId)
    .order("scheduled_at", { ascending: false });
  return data ?? [];
}
