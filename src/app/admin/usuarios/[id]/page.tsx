import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/data/users";
import { UserForm } from "../user-form";
import { DeleteUserButton } from "../delete-user-button";
import { Avatar } from "@/components/ui/avatar";
import { IconChevronLeft } from "@/components/ui/icons";
import { ROLE_LABEL } from "@/lib/user-role";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);
  if (!user) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/usuarios" className="flex items-center gap-1 font-mono text-xs text-concrete">
        <IconChevronLeft width={16} height={16} />
        Usuarios
      </Link>

      <div className="flex items-center gap-3">
        <Avatar name={user.full_name} role={user.role} size={48} />
        <div>
          <p className="label-plate">{ROLE_LABEL[user.role]}</p>
          <h1 className="display mt-1 text-2xl">{user.full_name}</h1>
        </div>
      </div>

      <UserForm initial={user} />

      <div className="mt-2 border-t border-dashed border-steel pt-4">
        <DeleteUserButton userId={user.id} />
      </div>
    </div>
  );
}
