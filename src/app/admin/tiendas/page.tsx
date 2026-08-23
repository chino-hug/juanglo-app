import Link from "next/link";
import { listStoresForAdmin } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { LabelPlate } from "@/components/ui/label-plate";
import { IconChevronLeft, IconMapPin } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { clientDisplayName } from "@/lib/client-display";
import type { AppointmentStatus } from "@/lib/supabase/database.types";

const ESTADO_FILTERS: { value: AppointmentStatus | "todos"; label: string }[] = [
  { value: "scheduled", label: "Por visitar" },
  { value: "done", label: "Visitadas" },
  { value: "todos", label: "Todos" },
];

const RANGO_FILTERS: { value: "hoy" | "semana"; label: string }[] = [
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Esta semana" },
];

function buildHref(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `/admin/tiendas?${qs}` : "/admin/tiendas";
}

const APPOINTMENT_LABEL: Record<AppointmentStatus, string> = {
  scheduled: "Agendada",
  done: "Realizada",
  cancelled: "Cancelada",
};

export default async function AdminTiendasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; rango?: string }>;
}) {
  const { estado, rango } = await searchParams;
  const status = (estado as AppointmentStatus | "todos" | undefined) ?? "scheduled";
  const range = (rango as "hoy" | "semana" | undefined) ?? "hoy";

  const stops = await listStoresForAdmin({ estado: status, rango: range });

  const title = status === "scheduled" ? "Por visitar" : status === "done" ? "Visitadas" : "Tiendas";

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin" className="flex items-center gap-1 font-mono text-xs text-concrete">
        <IconChevronLeft width={16} height={16} />
        Resumen
      </Link>

      <div>
        <p className="label-plate">Admin</p>
        <h1 className="display mt-2 text-3xl">{title}</h1>
        <p className="mt-1 text-xs text-concrete">
          {stops.length} tienda{stops.length === 1 ? "" : "s"} · {range === "semana" ? "esta semana" : "hoy"}
        </p>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {ESTADO_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={buildHref({ estado: f.value === "scheduled" ? undefined : f.value, rango })}
            className={cn(
              "label-plate shrink-0",
              status === f.value ? "bg-ink text-base" : "bg-base text-ink",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {RANGO_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={buildHref({ rango: f.value === "hoy" ? undefined : f.value, estado })}
            className={cn(
              "label-plate shrink-0",
              range === f.value ? "bg-ink text-base" : "bg-base text-ink",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {stops.length === 0 && (
        <div className="border border-dashed border-steel px-4 py-10 text-center">
          <p className="text-sm text-concrete">No hay tiendas con este filtro.</p>
        </div>
      )}

      <ul className="flex flex-col gap-2.5">
        {stops.map((stop) => (
          <li key={stop.id}>
            <Link href={stop.client ? `/admin/clientes/${stop.client.id}` : "#"}>
              <Card className="flex items-center justify-between gap-3 p-3.5">
                <div className="min-w-0">
                  <p className="display truncate text-lg">
                    {stop.client ? clientDisplayName(stop.client) : "Cliente"}
                  </p>
                  {stop.client?.address && (
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-concrete">
                      <IconMapPin width={13} height={13} className="shrink-0" />
                      {stop.client.address}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {stop.client?.zone && <LabelPlate>{stop.client.zone.name}</LabelPlate>}
                    <span className="font-mono text-[10px] uppercase tracking-wide text-concrete">
                      {APPOINTMENT_LABEL[stop.status]}
                    </span>
                  </div>
                  {stop.seller && (
                    <p className="mt-1 text-[11px] text-concrete">Vendedor/a: {stop.seller.full_name}</p>
                  )}
                </div>
                <span className="tabular shrink-0 text-xs text-concrete">
                  {new Date(stop.scheduled_at).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
