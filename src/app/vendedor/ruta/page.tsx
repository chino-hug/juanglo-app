import { requireSeller } from "@/lib/auth";
import { listGeocodedClients } from "@/lib/data/route";
import { listZones } from "@/lib/data/clients";
import { getTodayStops } from "@/lib/data/seller";
import { RouteBuilder } from "./route-builder";

interface StopRow {
  client: { id: string } | null;
}

export default async function RutaPage() {
  const profile = await requireSeller();
  const [clients, zones, stops] = await Promise.all([
    listGeocodedClients(profile.id),
    listZones(),
    getTodayStops(profile.id),
  ]);

  const preselectedIds = (stops as unknown as StopRow[])
    .map((s) => s.client?.id)
    .filter((id): id is string => Boolean(id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-plate">Ruta</p>
        <h1 className="display mt-2 text-3xl">Zonas y ruta óptima</h1>
      </div>

      {clients.length === 0 ? (
        <div className="border border-dashed border-steel px-4 py-10 text-center">
          <p className="text-sm text-concrete">
            Todavía no hay clientes con dirección geolocalizada para mostrar en el mapa.
          </p>
        </div>
      ) : (
        <RouteBuilder clients={clients} zones={zones} preselectedIds={preselectedIds} />
      )}
    </div>
  );
}
