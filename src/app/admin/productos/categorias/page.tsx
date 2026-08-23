import Link from "next/link";
import { listCategories } from "@/lib/data/categories";
import { Card } from "@/components/ui/card";
import { FabLink } from "@/components/ui/fab-link";
import { IconPlus, IconChevronLeft } from "@/components/ui/icons";

export default async function CategoriasPage() {
  const categories = await listCategories();

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/productos" className="flex items-center gap-1 font-mono text-xs text-concrete">
        <IconChevronLeft width={16} height={16} />
        Productos
      </Link>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="label-plate">Admin</p>
          <h1 className="display mt-2 text-3xl">Categorías</h1>
          <p className="mt-1 text-xs text-concrete">
            Elegí los colores de cada categoría desde la lista de Colores.
          </p>
        </div>
        <Link
          href="/admin/productos/colores"
          className="mt-1 shrink-0 font-mono text-[10px] uppercase tracking-wide text-concrete underline"
        >
          Colores
        </Link>
      </div>

      {categories.length === 0 && (
        <div className="border border-dashed border-steel px-4 py-10 text-center">
          <p className="text-sm text-concrete">Todavía no hay categorías.</p>
        </div>
      )}

      <ul className="flex flex-col gap-2.5">
        {categories.map((c) => (
          <li key={c.id}>
            <Link href={`/admin/productos/categorias/${c.id}`}>
              <Card className="flex items-center justify-between gap-3 p-3.5">
                <p className="display text-lg">{c.name}</p>
                <span className="label-plate shrink-0">
                  {c.colors.length} {c.colors.length === 1 ? "color" : "colores"}
                </span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      <FabLink
        href="/admin/productos/categorias/nueva"
        label="Nueva categoría"
        icon={<IconPlus width={18} height={18} />}
      />
    </div>
  );
}
