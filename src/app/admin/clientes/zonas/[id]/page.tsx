import Link from "next/link";
import { notFound } from "next/navigation";
import { getZone } from "@/lib/data/clients";
import { ZoneForm } from "../zone-form";
import { IconChevronLeft } from "@/components/ui/icons";

export default async function AdminZonaEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const zone = await getZone(id);
  if (!zone) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/clientes/zonas"
        className="flex items-center gap-1 font-mono text-xs text-concrete"
      >
        <IconChevronLeft width={16} height={16} />
        Zonas
      </Link>
      <div>
        <p className="label-plate">Editar</p>
        <h1 className="display mt-2 text-3xl">{zone.name}</h1>
      </div>
      <ZoneForm zone={zone} />
    </div>
  );
}
