import Link from "next/link";
import { listZones } from "@/lib/data/clients";
import { listUsers } from "@/lib/data/users";
import { ClientForm } from "@/app/vendedor/clientes/client-form";
import { IconChevronLeft } from "@/components/ui/icons";
import { saveClientForAdmin } from "../actions";

export default async function NuevoClienteAdminPage() {
  const [zones, users] = await Promise.all([listZones(), listUsers()]);
  const sellers = users.filter((u) => u.role === "seller");

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/clientes" className="flex items-center gap-1 font-mono text-xs text-concrete">
        <IconChevronLeft width={16} height={16} />
        Clientes
      </Link>
      <div>
        <p className="label-plate">Nuevo</p>
        <h1 className="display mt-2 text-3xl">Cliente o prospecto</h1>
      </div>
      <ClientForm zones={zones} sellers={sellers} action={saveClientForAdmin} />
    </div>
  );
}
