import Link from "next/link";
import { requireSeller } from "@/lib/auth";
import { listClients, listZones } from "@/lib/data/clients";
import { Card } from "@/components/ui/card";
import { LabelPlate } from "@/components/ui/label-plate";
import { FabLink } from "@/components/ui/fab-link";
import { ClientStatusTag } from "@/components/seller/client-status-tag";
import { ClientFilters } from "@/components/shared/client-filters";
import { IconPlus, IconMapPin } from "@/components/ui/icons";
import { clientDisplayName } from "@/lib/client-display";
import type { ClientStatus } from "@/lib/supabase/database.types";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; ciudad?: string; zona?: string }>;
}) {
  const params = await searchParams;
  const profile = await requireSeller();
  const status = (params.estado as ClientStatus | "todos" | undefined) ?? "todos";
  const city = params.ciudad;
  const region = params.zona;
  const [clients, facetClients, zones] = await Promise.all([
    listClients(profile.id, { q: params.q, status, city, region }),
    listClients(profile.id, { q: params.q, status }),
    listZones(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="label-plate">Clientes</p>
        <h1 className="display mt-2 text-3xl">Tu cartera</h1>
        <p className="mt-1 text-xs text-concrete">
          {clients.length} cliente{clients.length === 1 ? "" : "s"}
        </p>
      </div>

      <form method="get" className="flex flex-col gap-1.5">
        <label htmlFor="q" className="field-label">
          Buscar
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={params.q}
          placeholder="Nombre del cliente…"
          className="field-input"
        />
        {status !== "todos" && <input type="hidden" name="estado" value={status} />}
        {city && <input type="hidden" name="ciudad" value={city} />}
        {region && <input type="hidden" name="zona" value={region} />}
      </form>

      <ClientFilters
        basePath="/vendedor/clientes"
        q={params.q}
        status={status}
        city={city}
        region={region}
        zones={zones}
        facetZoneIds={facetClients.map((c) => c.zone?.id ?? null)}
      />

      {clients.length === 0 && (
        <div className="border border-dashed border-steel px-4 py-10 text-center">
          <p className="text-sm text-concrete">No encontramos clientes con este filtro.</p>
        </div>
      )}

      <ul className="flex flex-col gap-2.5">
        {clients.map((client) => (
          <li key={client.id}>
            <Link href={`/vendedor/clientes/${client.id}`}>
              <Card className="flex items-center justify-between gap-3 p-3.5">
                <div className="min-w-0">
                  <p className="display truncate text-lg">{clientDisplayName(client)}</p>
                  {client.business_name && client.name && (
                    <p className="truncate text-xs font-semibold text-concrete">{client.name}</p>
                  )}
                  {client.address && (
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-concrete">
                      <IconMapPin width={13} height={13} className="shrink-0" />
                      {client.address}
                    </p>
                  )}
                  {client.phone && (client.business_name || client.name) && (
                    <p className="mt-0.5 truncate text-xs text-concrete">{client.phone}</p>
                  )}
                  <div className="mt-2 flex items-center gap-1.5">
                    {client.zone && <LabelPlate>{client.zone.name}</LabelPlate>}
                    <ClientStatusTag status={client.status} />
                  </div>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      <FabLink
        href="/vendedor/clientes/nuevo"
        label="Nuevo cliente"
        icon={<IconPlus width={18} height={18} />}
      />
    </div>
  );
}
