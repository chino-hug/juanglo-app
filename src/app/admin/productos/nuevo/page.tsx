import Link from "next/link";
import { listCategories } from "@/lib/data/categories";
import { ProductForm } from "../product-form";
import { IconChevronLeft } from "@/components/ui/icons";

export default async function NuevoProductoPage() {
  const categories = await listCategories();

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/productos/todos"
        className="flex items-center gap-1 font-mono text-xs text-concrete"
      >
        <IconChevronLeft width={16} height={16} />
        Productos
      </Link>
      <div>
        <p className="label-plate">Nuevo</p>
        <h1 className="display mt-2 text-3xl">Producto del catálogo</h1>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
