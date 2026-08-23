import Link from "next/link";
import { listProducts } from "@/lib/data/orders";
import { listCategories } from "@/lib/data/categories";
import { Card } from "@/components/ui/card";
import { FabLink } from "@/components/ui/fab-link";
import { IconPlus, IconChevronLeft } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export default async function TodosLosProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const [allProducts, categories] = await Promise.all([listProducts(), listCategories()]);

  const categoryNames = categories.map((c) => c.name);
  const activeCategory = categoria && categoryNames.includes(categoria) ? categoria : "todos";
  const products =
    activeCategory === "todos" ? allProducts : allProducts.filter((p) => p.category === activeCategory);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/productos" className="flex items-center gap-1 font-mono text-xs text-concrete">
        <IconChevronLeft width={16} height={16} />
        Productos
      </Link>

      <div>
        <p className="label-plate">Admin</p>
        <h1 className="display mt-2 text-3xl">Productos</h1>
        <p className="mt-1 text-xs text-concrete">{allProducts.length} productos en catálogo</p>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Link
          href="/admin/productos/todos"
          className={cn(
            "label-plate shrink-0",
            activeCategory === "todos" ? "bg-ink text-base" : "bg-base text-ink",
          )}
        >
          Todos
        </Link>
        {categoryNames.map((c) => (
          <Link
            key={c}
            href={`/admin/productos/todos?categoria=${encodeURIComponent(c)}`}
            className={cn(
              "label-plate shrink-0",
              activeCategory === c ? "bg-ink text-base" : "bg-base text-ink",
            )}
          >
            {c}
          </Link>
        ))}
      </div>

      <ul className="flex flex-col gap-2.5">
        {products.map((product) => {
          const lowStock = product.quantity_on_hand <= product.low_stock_threshold;
          return (
            <li key={product.id}>
              <Link href={`/admin/productos/${product.id}`}>
                <Card className="flex flex-col gap-1.5 p-3.5">
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-concrete">
                      {product.category}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wide text-concrete">
                      {product.sku}
                    </p>
                    <p className="display line-clamp-2 text-lg">{product.name}</p>
                  </div>
                  <p className="tabular text-xs text-concrete">
                    ${product.price.toLocaleString("es-AR", { minimumFractionDigits: 2 })} ·{" "}
                    {lowStock ? (
                      <span className="text-safety">
                        quedan {product.quantity_on_hand.toLocaleString("es-AR")}
                      </span>
                    ) : (
                      `stock ${product.quantity_on_hand.toLocaleString("es-AR")}`
                    )}
                  </p>
                  {product.colors.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.colors.map((color) => (
                        <span
                          key={color}
                          className="border border-ink px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-concrete"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>

      <FabLink
        href="/admin/productos/nuevo"
        label="Nuevo producto"
        icon={<IconPlus width={18} height={18} />}
      />
    </div>
  );
}
