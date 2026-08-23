"use client";

import { useState, useTransition } from "react";
import { ClientMap } from "@/components/seller/client-map";
import { LabelPlate } from "@/components/ui/label-plate";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { optimizeRoute } from "./actions";
import type { RouteClient } from "@/lib/data/route";
import { clientDisplayName } from "@/lib/client-display";

export function RouteBuilder({
  clients,
  zones,
  preselectedIds,
}: {
  clients: RouteClient[];
  zones: { id: string; name: string }[];
  preselectedIds: string[];
}) {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>(preselectedIds);
  const [result, setResult] = useState<{
    orderedIds: string[];
    error?: string;
    approximate?: boolean;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  const visibleClients = activeZone ? clients.filter((c) => c.zoneId === activeZone) : clients;

  function toggle(id: string) {
    setResult(null);
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function generate() {
    const points = selected
      .map((id) => clients.find((c) => c.id === id))
      .filter((c): c is RouteClient => Boolean(c))
      .map((c) => ({ id: c.id, lat: c.lat, lng: c.lng }));

    startTransition(async () => {
      const res = await optimizeRoute(points);
      if ("error" in res) {
        setResult({ orderedIds: selected, error: res.error });
      } else {
        setResult({ orderedIds: res.orderedIds, approximate: res.approximate });
      }
    });
  }

  const orderedClients = (result?.orderedIds ?? selected)
    .map((id) => clients.find((c) => c.id === id))
    .filter((c): c is RouteClient => Boolean(c));

  return (
    <div className="flex flex-col gap-5">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button
          onClick={() => setActiveZone(null)}
          className={cn("label-plate shrink-0", !activeZone ? "bg-ink text-base" : "bg-base text-ink")}
        >
          Todas las zonas
        </button>
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => setActiveZone(z.id)}
            className={cn(
              "label-plate shrink-0",
              activeZone === z.id ? "bg-ink text-base" : "bg-base text-ink",
            )}
          >
            {z.name}
          </button>
        ))}
      </div>

      <ClientMap
        clients={visibleClients.map((c) => ({ id: c.id, name: c.name, lat: c.lat, lng: c.lng, zoneId: c.zoneId }))}
        activeZoneId={activeZone}
        routeOrder={result?.orderedIds}
      />

      <section className="flex flex-col gap-2">
        <h2 className="field-label">Seleccioná las paradas ({selected.length})</h2>
        <ul className="flex flex-col gap-1.5">
          {visibleClients.map((client) => (
            <li key={client.id}>
              <label className="flex items-center gap-2.5 border border-ink bg-base px-3 py-2">
                <input
                  type="checkbox"
                  checked={selected.includes(client.id)}
                  onChange={() => toggle(client.id)}
                  className="h-4 w-4 accent-safety"
                />
                <span className="min-w-0 flex-1 truncate text-sm">{clientDisplayName(client)}</span>
                {client.zoneName && <LabelPlate className="shrink-0">{client.zoneName}</LabelPlate>}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <Button variant="primary" disabled={selected.length < 2 || pending} onClick={generate}>
        {pending ? "Calculando…" : "Generar ruta óptima"}
      </Button>

      {result?.error && (
        <p role="alert" className="border border-ink bg-steel-light px-3 py-2 text-sm">
          {result.error}
        </p>
      )}

      {result && !result.error && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="field-label">Orden sugerido</h2>
            {result.approximate && (
              <span className="font-mono text-[10px] uppercase tracking-wide text-safety">
                Aproximado — sin API de Google Maps
              </span>
            )}
          </div>
          <ol className="flex flex-col gap-1.5">
            {orderedClients.map((client, i) => (
              <li
                key={client.id}
                className="flex items-center gap-3 border border-ink bg-base px-3 py-2"
              >
                <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center bg-ink text-xs font-semibold text-base">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{clientDisplayName(client)}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
