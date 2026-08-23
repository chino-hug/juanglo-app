import Link from "next/link";
import { listUsers } from "@/lib/data/users";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { FabLink } from "@/components/ui/fab-link";
import { IconPlus } from "@/components/ui/icons";
import { ROLE_LABEL } from "@/lib/user-role";
import { cn } from "@/lib/cn";
import type { UserRole } from "@/lib/supabase/database.types";

const ROL_FILTERS: { value: UserRole | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "seller", label: "Vendedoras/es" },
  { value: "picking_packing", label: "Picking" },
  { value: "admin", label: "Admins" },
];

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string }>;
}) {
  const { rol } = await searchParams;
  const role = (rol as UserRole | "todos" | undefined) ?? "todos";
  const allUsers = await listUsers();
  const users = role === "todos" ? allUsers : allUsers.filter((u) => u.role === role);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="label-plate">Admin</p>
        <h1 className="display mt-2 text-3xl">Usuarios</h1>
        <p className="mt-1 text-xs text-concrete">{users.length} cuentas del equipo</p>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {ROL_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "todos" ? "/admin/usuarios" : `/admin/usuarios?rol=${f.value}`}
            className={cn(
              "label-plate shrink-0",
              role === f.value ? "bg-ink text-base" : "bg-base text-ink",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <ul className="flex flex-col gap-2.5">
        {users.map((user) => (
          <li key={user.id}>
            <Link href={`/admin/usuarios/${user.id}`}>
              <Card className="flex items-center gap-3 p-3.5">
                <Avatar name={user.full_name} role={user.role} />
                <div className="min-w-0 flex-1">
                  <p className="display truncate text-lg">{user.full_name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-concrete">
                    {ROLE_LABEL[user.role]}
                  </p>
                  <p className="truncate text-xs text-concrete">{user.email}</p>
                  <p className="tabular text-xs text-concrete">
                    Cédula {user.cedula} · Desde{" "}
                    {new Date(user.created_at).toLocaleDateString("es-AR")}
                  </p>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      <FabLink
        href="/admin/usuarios/nuevo"
        label="Nuevo usuario"
        icon={<IconPlus width={18} height={18} />}
      />
    </div>
  );
}
