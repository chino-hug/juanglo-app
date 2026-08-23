"use client";

import Link from "next/link";
import { FilterDisclosure } from "@/components/ui/filter-disclosure";
import { ChipToggle } from "@/components/ui/chip-toggle";
import { cn } from "@/lib/cn";
import { ZONE_REGIONS } from "@/lib/zone-region";
import type { ClientStatus, ZoneRegion } from "@/lib/supabase/database.types";

const ESTADO_OPTIONS: { value: ClientStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "client", label: "Clientes" },
  { value: "scheduled", label: "Agendados" },
  { value: "prospect", label: "Prospectos" },
];

interface ZoneFacet {
  id: string;
  city: string | null;
  region: ZoneRegion | null;
}

export function ClientFilters({
  basePath,
  q,
  status,
  city,
  region,
  zones,
  facetZoneIds,
}: {
  basePath: string;
  q?: string;
  status: ClientStatus | "todos";
  city?: string;
  region?: string;
  zones: ZoneFacet[];
  // zone ids of clients matching the current estado/búsqueda filters (not yet
  // narrowed by ciudad/zona) — used to grey out chips that would zero out
  // the list, without an extra round trip per chip.
  facetZoneIds: (string | null)[];
}) {
  function buildHref(params: { estado?: string; ciudad?: string; zona?: string }) {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (params.estado && params.estado !== "todos") sp.set("estado", params.estado);
    if (params.ciudad) sp.set("ciudad", params.ciudad);
    if (params.zona) sp.set("zona", params.zona);
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const zoneById = new Map(zones.map((z) => [z.id, z]));
  const facetZones = facetZoneIds
    .filter((id): id is string => Boolean(id))
    .map((id) => zoneById.get(id))
    .filter((z): z is ZoneFacet => Boolean(z));

  function cityHasMatch(value: string) {
    return facetZones.some((z) => z.city === value && (!region || z.region === region));
  }
  function regionHasMatch(value: ZoneRegion) {
    return facetZones.some((z) => z.region === value && (!city || z.city === city));
  }

  const cities = [...new Set(zones.map((z) => z.city).filter((c): c is string => Boolean(c)))].sort();
  // The Norte/Sur/Centro/Occidente/Oriente chips only mean anything within
  // Valle de Aburrá — hide the whole section once a different city is picked.
  const showZonaSection = !city || city === "Valle de Aburrá";

  const statusLabel = ESTADO_OPTIONS.find((o) => o.value === status)?.label ?? "Todos";

  return (
    <div className="flex flex-col gap-2.5">
      <FilterDisclosure label="Estado" summary={statusLabel} defaultOpen={status !== "todos"}>
        <div className="flex w-full flex-col gap-1">
          {ESTADO_OPTIONS.map((option) => {
            const selected = status === option.value;
            return (
              <Link
                key={option.value}
                href={buildHref({ estado: option.value, ciudad: city, zona: region })}
                aria-pressed={selected}
                className="flex items-center gap-2.5 px-1 py-1.5"
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    selected ? "border-ink" : "border-steel",
                  )}
                >
                  {selected && <span className="h-2 w-2 rounded-full bg-ink" />}
                </span>
                <span className="font-mono text-sm uppercase tracking-wide">{option.label}</span>
              </Link>
            );
          })}
        </div>
      </FilterDisclosure>

      <FilterDisclosure label="Ciudad" summary={city ?? "Todas"} defaultOpen={Boolean(city)}>
        <ChipToggle
          href={buildHref({ estado: status, ciudad: undefined, zona: region })}
          label="Todas"
          selected={!city}
        />
        {cities.map((c) => (
          <ChipToggle
            key={c}
            href={buildHref({
              estado: status,
              ciudad: c,
              zona: c === "Valle de Aburrá" ? region : undefined,
            })}
            label={c}
            selected={city === c}
            disabled={!cityHasMatch(c)}
          />
        ))}
      </FilterDisclosure>

      {showZonaSection && (
        <FilterDisclosure label="Zona" summary={region ?? "Todas"} defaultOpen={Boolean(region)}>
          <ChipToggle
            href={buildHref({ estado: status, ciudad: city, zona: undefined })}
            label="Todas"
            selected={!region}
          />
          {ZONE_REGIONS.map((r) => (
            <ChipToggle
              key={r}
              href={buildHref({ estado: status, ciudad: city, zona: r })}
              label={r}
              selected={region === r}
              disabled={!regionHasMatch(r)}
            />
          ))}
        </FilterDisclosure>
      )}
    </div>
  );
}
