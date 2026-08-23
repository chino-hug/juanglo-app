import Link from "next/link";
import { requireSeller } from "@/lib/auth";
import { listClients } from "@/lib/data/clients";
import { listProducts } from "@/lib/data/orders";
import { IconChevronLeft } from "@/components/ui/icons";
import { OrderForm } from "./order-form";

export default async function NuevoPedidoPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>;
}) {
  const { cliente } = await searchParams;
  const profile = await requireSeller();
  const [clients, products] = await Promise.all([
    listClients(profile.id, { status: "todos" }),
    listProducts(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/vendedor/pedidos" className="flex items-center gap-1 font-mono text-xs text-concrete">
        <IconChevronLeft width={16} height={16} />
        Pedidos
      </Link>
      <div>
        <p className="label-plate">Nuevo</p>
        <h1 className="display mt-2 text-3xl">Pedido</h1>
      </div>
      <OrderForm clients={clients} products={products} preselectedClientId={cliente} />
    </div>
  );
}
