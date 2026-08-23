import { createClient } from "@/lib/supabase/server";
import { MOCK_MODE } from "@/lib/mock/config";
import { mockListGeocodedClients } from "@/lib/mock/queries";

export interface RouteClient {
  id: string;
  name: string | null;
  address: string | null;
  lat: number;
  lng: number;
  zoneId: string | null;
  zoneName: string | null;
}

export async function listGeocodedClients(sellerId: string): Promise<RouteClient[]> {
  if (MOCK_MODE) return mockListGeocodedClients(sellerId);

  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("id, name, address, lat, lng, zone_id, zone:zones(id, name)")
    .eq("seller_id", sellerId)
    .not("lat", "is", null)
    .not("lng", "is", null);

  return ((data ?? []) as unknown as Array<{
    id: string;
    name: string | null;
    address: string | null;
    lat: number;
    lng: number;
    zone_id: string | null;
    zone: { id: string; name: string } | null;
  }>).map((c) => ({
    id: c.id,
    name: c.name,
    address: c.address,
    lat: c.lat,
    lng: c.lng,
    zoneId: c.zone_id,
    zoneName: c.zone?.name ?? null,
  }));
}
