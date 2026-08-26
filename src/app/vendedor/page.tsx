import Link from "next/link";
import { requireSeller } from "@/lib/auth";
import { getTodayStops, getSellerDashboardStats } from "@/lib/data/seller";
import { UtilityTile } from "@/components/ui/utility-tile";
import { StopCard } from "@/components/seller/stop-card";
import { CardGrid } from "@/components/ui/card-grid";
import { AddStopButton } from "@/components/seller/add-stop-button";
import { FabLink } from "@/components/ui/fab-link";
import { IconPlus } from "@/components/ui/icons";
import type { AppointmentStatus } from "@/lib/supabase/database.types";

const TODAY_LABEL = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date());

interface StopRow {
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

export default async function HoyPage() {
  const profile = await requireSeller();
  const [stops, stats] = await Promise.all([
    getTodayStops(profile.id),
    getSellerDashboardStats(profile.id),
  ]);

  const rows = stops as unknown as StopRow[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-plate">Hoy</p>
        <h1 className="display mt-2 text-3xl capitalize">{TODAY_LABEL}</h1>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <UtilityTile label="Paradas" value={stats.stopsToday} />
        <UtilityTile label="Pendientes" value={stats.pendingOrders} />
        <UtilityTile label="Alertas" value={stats.lowStockAlerts} alert={stats.lowStockAlerts > 0} />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="field-label">Ruta de hoy</h2>
          <Link href="/vendedor/agenda" className="font-mono text-xs text-concrete underline">
            Ver agenda completa
          </Link>
        </div>

        {rows.length === 0 && (
          <div className="border border-dashed border-steel px-4 py-10 text-center">
            <p className="text-sm text-concrete">Todavía no tenés paradas agendadas para hoy.</p>
          </div>
        )}

        <CardGrid>
          {rows.map((stop) =>
            stop.client ? (
              <li key={stop.id}>
                <StopCard
                  appointmentId={stop.id}
                  appointmentStatus={stop.status}
                  clientId={stop.client.id}
                  clientName={stop.client.name}
                  businessName={stop.client.business_name}
                  address={stop.client.address}
                  zoneName={stop.client.zone?.name}
                  scheduledAt={stop.scheduled_at}
                  clientStatus={stop.client.status}
                />
              </li>
            ) : null,
          )}
        </CardGrid>

        <AddStopButton />
      </section>

      <FabLink
        href="/vendedor/pedidos/nuevo"
        label="Nuevo pedido"
        icon={<IconPlus width={18} height={18} />}
      />
    </div>
  );
}
