import Link from "next/link";
import { UserForm } from "../user-form";
import { IconChevronLeft } from "@/components/ui/icons";

export default function NuevoUsuarioPage() {
  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/usuarios" className="flex items-center gap-1 font-mono text-xs text-concrete">
        <IconChevronLeft width={16} height={16} />
        Usuarios
      </Link>
      <div>
        <p className="label-plate">Nuevo</p>
        <h1 className="display mt-2 text-3xl">Usuario del equipo</h1>
      </div>
      <UserForm />
    </div>
  );
}
