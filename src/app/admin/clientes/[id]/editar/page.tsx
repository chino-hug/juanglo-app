import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, listZones } from "@/lib/data/clients";
import { listUsers } from "@/lib/data/users";
import { ClientForm } from "@/app/vendedor/clientes/client-form";
import { IconChevronLeft } from "@/components/ui/icons";
import { clientDisplayName } from "@/lib/client-display";
import { saveClientForAdmin } from "../../actions";

export default async function EditarClienteAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, zones, users] = await Promise.all([getClient(id), listZones(), listUsers()]);
  if (!client) notFound();

  const sellers = users.filter((u) => u.role === "seller");

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={`/admin/clientes/${id}`}
        className="flex items-center gap-1 font-mono text-xs text-concrete"
      >
        <IconChevronLeft width={16} height={16} />
        {clientDisplayName(client)}
      </Link>
      <div>
        <p className="label-plate">Editar</p>
        <h1 className="display mt-2 text-3xl">{clientDisplayName(client)}</h1>
      </div>
      <ClientForm zones={zones} initial={client} sellers={sellers} action={saveClientForAdmin} />
    </div>
  );
}
