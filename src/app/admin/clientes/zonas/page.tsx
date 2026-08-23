import Link from "next/link";
import { listZones } from "@/lib/data/clients";
import { Card } from "@/components/ui/card";
import { LabelPlate } from "@/components/ui/label-plate";
import { IconChevronLeft } from "@/components/ui/icons";

export default async function AdminZonasPage() {
  const zones = await listZones();

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/clientes" className="flex items-center gap-1 font-mono text-xs text-concrete">
        <IconChevronLeft width={16} height={16} />
        Clientes
      </Link>

      <div>
        <p className="label-plate">Admin</p>
        <h1 className="display mt-2 text-3xl">Zonas</h1>
        <p className="mt-1 text-xs text-concrete">
          {zones.length} zonas · asigná ciudad y zona (Norte/Sur/Centro/Occidente/Oriente) para
          agrupar el filtro de clientes
        </p>
      </div>

      <ul className="flex flex-col gap-2.5">
        {zones.map((zone) => (
          <li key={zone.id}>
            <Link href={`/admin/clientes/zonas/${zone.id}`}>
              <Card className="flex items-center justify-between gap-3 p-3.5">
                <p className="display truncate text-lg">{zone.name}</p>
                <div className="flex shrink-0 items-center gap-1.5">
                  {zone.city ? <LabelPlate>{zone.city}</LabelPlate> : null}
                  {zone.region ? (
                    <LabelPlate>{zone.region}</LabelPlate>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-wide text-concrete">
                      Sin asignar
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
