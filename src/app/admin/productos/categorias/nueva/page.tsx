import Link from "next/link";
import { listColors } from "@/lib/data/colors";
import { CategoryForm } from "../category-form";
import { IconChevronLeft } from "@/components/ui/icons";

export default async function NuevaCategoriaPage() {
  const colors = await listColors();

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/productos/categorias"
        className="flex items-center gap-1 font-mono text-xs text-concrete"
      >
        <IconChevronLeft width={16} height={16} />
        Categorías
      </Link>
      <div>
        <p className="label-plate">Nueva</p>
        <h1 className="display mt-2 text-3xl">Categoría de producto</h1>
      </div>
      <CategoryForm colors={colors} />
    </div>
  );
}
