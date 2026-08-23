import Link from "next/link";
import { notFound } from "next/navigation";
import { getColor } from "@/lib/data/colors";
import { ColorForm } from "../color-form";
import { DeleteColorButton } from "../delete-color-button";
import { IconChevronLeft } from "@/components/ui/icons";

export default async function EditarColorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const color = await getColor(id);
  if (!color) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/productos/colores"
        className="flex items-center gap-1 font-mono text-xs text-concrete"
      >
        <IconChevronLeft width={16} height={16} />
        Colores
      </Link>

      <div>
        <p className="label-plate">Color</p>
        <h1 className="display mt-2 text-2xl">{color.name}</h1>
      </div>

      <ColorForm initial={color} />

      <div className="mt-2 border-t border-dashed border-steel pt-4">
        <DeleteColorButton colorId={color.id} />
      </div>
    </div>
  );
}
