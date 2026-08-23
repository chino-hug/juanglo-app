"use client";

import { useMemo } from "react";
import { APIProvider, Map as GoogleMap, Marker, useMap } from "@vis.gl/react-google-maps";
import { MAP_STYLE } from "@/lib/map-style";

export interface MapClient {
  id: string;
  name: string | null;
  lat: number;
  lng: number;
  zoneId: string | null;
}

function pinIcon(color: string): google.maps.Icon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26"><circle cx="13" cy="13" r="8" fill="${color}" stroke="#0d0d0d" stroke-width="2"/></svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: typeof window !== "undefined" ? new window.google.maps.Size(26, 26) : undefined,
    anchor: typeof window !== "undefined" ? new window.google.maps.Point(13, 13) : undefined,
  };
}

function FitBounds({ points }: { points: MapClient[] }) {
  const map = useMap();
  useMemo(() => {
    if (!map || points.length === 0 || typeof window === "undefined") return;
    const bounds = new window.google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
    map.fitBounds(bounds, 48);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, points.length]);
  return null;
}

export function ClientMap({
  clients,
  activeZoneId,
  routeOrder,
}: {
  clients: MapClient[];
  activeZoneId?: string | null;
  routeOrder?: string[];
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-64 flex-col items-center justify-center border border-dashed border-steel px-4 text-center">
        <p className="text-sm text-concrete">
          Falta configurar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para mostrar el mapa.
        </p>
      </div>
    );
  }

  const routeIndex = new Map((routeOrder ?? []).map((id, i) => [id, i]));

  return (
    <APIProvider apiKey={apiKey}>
      <div className="h-72 w-full border border-ink">
        <GoogleMap
          defaultCenter={{ lat: clients[0]?.lat ?? -34.6, lng: clients[0]?.lng ?? -58.4 }}
          defaultZoom={12}
          styles={MAP_STYLE}
          disableDefaultUI
          gestureHandling="greedy"
        >
          <FitBounds points={clients} />
          {clients.map((client) => {
            const isActiveZone = !activeZoneId || client.zoneId === activeZoneId;
            const stopNumber = routeIndex.get(client.id);
            const clientName = client.name ?? "Cliente";
            return (
              <Marker
                key={client.id}
                position={{ lat: client.lat, lng: client.lng }}
                title={stopNumber !== undefined ? `${stopNumber + 1}. ${clientName}` : clientName}
                icon={pinIcon(isActiveZone ? "#ff5a00" : "#bdbdbd")}
              />
            );
          })}
        </GoogleMap>
      </div>
    </APIProvider>
  );
}
