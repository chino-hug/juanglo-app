import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/data/products";
import { listCategories } from "@/lib/data/categories";
import { ProductForm } from "../product-form";
import { DeleteProductButton } from "../delete-product-button";
import { IconChevronLeft } from "@/components/ui/icons";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProduct(id), listCategories()]);
  if (!product) notFound();

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
        <p className="label-plate">{product.category}</p>
        <h1 className="display mt-2 text-2xl">{product.name}</h1>
      </div>

      <ProductForm categories={categories} initial={product} />

      <div className="mt-2 border-t border-dashed border-steel pt-4">
        <DeleteProductButton productId={product.id} />
      </div>
    </div>
  );
}
