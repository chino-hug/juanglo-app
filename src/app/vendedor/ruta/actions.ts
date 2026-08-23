"use server";

interface RoutePoint {
  id: string;
  lat: number;
  lng: number;
}

export interface OptimizedRoute {
  orderedIds: string[];
  polyline: string | null;
  approximate?: boolean;
}

function haversine(a: RoutePoint, b: RoutePoint) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Nearest-neighbor greedy ordering, used when no Google Maps API key is
// configured — not a true shortest-route solve, but a real, useful ordering
// so the feature is testable and usable without external setup.
function nearestNeighborOrder(points: RoutePoint[]): string[] {
  const remaining = [...points];
  const route = [remaining.shift()!];
  while (remaining.length > 0) {
    const last = route[route.length - 1];
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    remaining.forEach((p, i) => {
      const d = haversine(last, p);
      if (d < nearestDistance) {
        nearestDistance = d;
        nearestIndex = i;
      }
    });
    route.push(remaining.splice(nearestIndex, 1)[0]);
  }
  return route.map((p) => p.id);
}

export async function optimizeRoute(points: RoutePoint[]): Promise<OptimizedRoute | { error: string }> {
  if (points.length < 2) {
    return { orderedIds: points.map((p) => p.id), polyline: null };
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return { orderedIds: nearestNeighborOrder(points), polyline: null, approximate: true };
  }

  const origin = points[0];
  const destination = points[points.length - 1];
  const middle = points.slice(1, -1);

  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set("origin", `${origin.lat},${origin.lng}`);
  url.searchParams.set("destination", `${destination.lat},${destination.lng}`);
  if (middle.length > 0) {
    url.searchParams.set(
      "waypoints",
      `optimize:true|${middle.map((p) => `${p.lat},${p.lng}`).join("|")}`,
    );
  }
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK") {
    return { error: `No se pudo calcular la ruta (${data.status}).` };
  }

  const waypointOrder: number[] = data.routes[0].waypoint_order ?? [];
  const orderedMiddle = waypointOrder.map((i) => middle[i]);
  const orderedIds = [origin, ...orderedMiddle, destination].map((p) => p.id);
  const polyline: string | null = data.routes[0]?.overview_polyline?.points ?? null;

  return { orderedIds, polyline };
}
