import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory } from "@/lib/data/categories";
import { listColors } from "@/lib/data/colors";
import { CategoryForm } from "../category-form";
import { DeleteCategoryButton } from "../delete-category-button";
import { IconChevronLeft } from "@/components/ui/icons";

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, colors] = await Promise.all([getCategory(id), listColors()]);
  if (!category) notFound();

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
        <p className="label-plate">Categoría</p>
        <h1 className="display mt-2 text-2xl">{category.name}</h1>
      </div>

      <CategoryForm colors={colors} initial={category} />

      <div className="mt-2 border-t border-dashed border-steel pt-4">
        <DeleteCategoryButton categoryId={category.id} />
      </div>
    </div>
  );
}
