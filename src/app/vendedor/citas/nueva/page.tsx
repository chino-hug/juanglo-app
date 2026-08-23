import Link from "next/link";
import { requireSeller } from "@/lib/auth";
import { listClients } from "@/lib/data/clients";
import { IconChevronLeft } from "@/components/ui/icons";
import { AppointmentForm } from "./appointment-form";

export default async function NuevaCitaPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; fecha?: string }>;
}) {
  const { cliente, fecha } = await searchParams;
  const profile = await requireSeller();
  const clients = await listClients(profile.id, { status: "todos" });
  const preselected = clients.find((c) => c.id === cliente);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/vendedor/agenda" className="flex items-center gap-1 font-mono text-xs text-concrete">
        <IconChevronLeft width={16} height={16} />
        Agenda
      </Link>
      <div>
        <p className="label-plate">Nueva</p>
        <h1 className="display mt-2 text-3xl">Agendar visita</h1>
      </div>
      <AppointmentForm clients={clients} preselectedId={preselected?.id} initialDate={fecha} />
    </div>
  );
}
