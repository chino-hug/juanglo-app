import Link from "next/link";
import { listColors } from "@/lib/data/colors";
import { ColorListItem } from "./color-list-item";
import { FabLink } from "@/components/ui/fab-link";
import { IconPlus, IconChevronLeft } from "@/components/ui/icons";

export default async function ColoresPage() {
  const colors = await listColors();

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/productos" className="flex items-center gap-1 font-mono text-xs text-concrete">
        <IconChevronLeft width={16} height={16} />
        Productos
      </Link>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="label-plate">Admin</p>
          <h1 className="display mt-2 text-3xl">Colores</h1>
          <p className="mt-1 text-xs text-concrete">
            El registro global de colores. Cada categoría elige los suyos de acá.
          </p>
        </div>
        <Link
          href="/admin/productos/categorias"
          className="mt-1 shrink-0 font-mono text-[10px] uppercase tracking-wide text-concrete underline"
        >
          Categorías
        </Link>
      </div>

      {colors.length === 0 && (
        <div className="border border-dashed border-steel px-4 py-10 text-center">
          <p className="text-sm text-concrete">Todavía no hay colores.</p>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {colors.map((c) => (
          <li key={c.id}>
            <ColorListItem id={c.id} name={c.name} />
          </li>
        ))}
      </ul>

      <FabLink
        href="/admin/productos/colores/nuevo"
        label="Nuevo color"
        icon={<IconPlus width={18} height={18} />}
      />
    </div>
  );
}
