import Link from "next/link";
import { listProducts } from "@/lib/data/orders";
import { listCategories } from "@/lib/data/categories";
import { listColors } from "@/lib/data/colors";
import { Card } from "@/components/ui/card";
import { IconPackage, IconList, IconPalette } from "@/components/ui/icons";

export default async function ProductosHubPage() {
  const [products, categories, colors] = await Promise.all([
    listProducts(),
    listCategories(),
    listColors(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-plate">Admin</p>
        <h1 className="display mt-2 text-3xl">Productos</h1>
        <p className="mt-1 text-xs text-concrete">Catálogo, categorías y colores del sistema.</p>
      </div>

      <div className="flex flex-col gap-2.5">
        <Link href="/admin/productos/todos">
          <Card className="flex items-center gap-3 p-3.5">
            <IconPackage width={22} height={22} />
            <div className="min-w-0 flex-1">
              <p className="display text-lg">Productos</p>
              <p className="text-xs text-concrete">{products.length} productos en catálogo</p>
            </div>
          </Card>
        </Link>

        <Link href="/admin/productos/categorias">
          <Card className="flex items-center gap-3 p-3.5">
            <IconList width={22} height={22} />
            <div className="min-w-0 flex-1">
              <p className="display text-lg">Categorías</p>
              <p className="text-xs text-concrete">
                {categories.length} {categories.length === 1 ? "categoría" : "categorías"}
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/admin/productos/colores">
          <Card className="flex items-center gap-3 p-3.5">
            <IconPalette width={22} height={22} />
            <div className="min-w-0 flex-1">
              <p className="display text-lg">Colores</p>
              <p className="text-xs text-concrete">
                {colors.length} {colors.length === 1 ? "color" : "colores"} en el registro global
              </p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
