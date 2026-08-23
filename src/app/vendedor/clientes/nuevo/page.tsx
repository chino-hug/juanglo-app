import Link from "next/link";
import { listZones } from "@/lib/data/clients";
import { ClientForm } from "../client-form";
import { IconChevronLeft } from "@/components/ui/icons";

export default async function NuevoClientePage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const { fecha } = await searchParams;
  const zones = await listZones();

  return (
    <div className="flex flex-col gap-5">
      <Link href="/vendedor/clientes" className="flex items-center gap-1 font-mono text-xs text-concrete">
        <IconChevronLeft width={16} height={16} />
        Clientes
      </Link>
      <div>
        <p className="label-plate">Nuevo</p>
        <h1 className="display mt-2 text-3xl">Cliente o prospecto</h1>
        {fecha && (
          <p className="mt-1 text-xs text-concrete">
            Lo vas a agendar para el {fecha} apenas lo guardes.
          </p>
        )}
      </div>
      <ClientForm zones={zones} fecha={fecha} />
    </div>
  );
}
