import Link from "next/link";
import { requireSeller } from "@/lib/auth";
import { listOrders } from "@/lib/data/orders";
import { Card } from "@/components/ui/card";
import { CardGrid } from "@/components/ui/card-grid";
import { FabLink } from "@/components/ui/fab-link";
import { OrderStatusTag } from "@/components/ui/order-status-tag";
import { IconPlus } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { formatOrderNumber } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/supabase/database.types";

const FILTERS: { value: OrderStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "created", label: "Creados" },
  { value: "picking", label: "En preparación" },
  { value: "packed", label: "Empacados" },
  { value: "out_for_delivery", label: "En camino" },
  { value: "delivered", label: "Entregados" },
];

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const profile = await requireSeller();
  const status = (estado as OrderStatus | "todos" | undefined) ?? "todos";
  const orders = await listOrders(profile.id, status);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="label-plate">Pedidos</p>
        <h1 className="display mt-2 text-3xl">Seguimiento</h1>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/vendedor/pedidos?estado=${f.value}`}
            className={cn(
              "label-plate shrink-0",
              status === f.value ? "bg-ink text-base" : "bg-base text-ink",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="border border-dashed border-steel px-4 py-10 text-center">
          <p className="text-sm text-concrete">No hay pedidos con este filtro.</p>
        </div>
      )}

      <CardGrid>
        {orders.map((order) => (
          <li key={order.id}>
            <Link href={`/vendedor/pedidos/${order.id}`}>
              <Card className="flex items-center justify-between gap-3 p-3.5">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-wide text-concrete">
                    N.º {formatOrderNumber(order.orderNumber)}
                  </p>
                  <p className="display truncate text-lg">{order.client?.name ?? "Cliente"}</p>
                  <p className="tabular mt-0.5 text-xs text-concrete">
                    {new Date(order.created_at).toLocaleDateString("es-AR")} · $
                    {order.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <OrderStatusTag status={order.status} />
              </Card>
            </Link>
          </li>
        ))}
      </CardGrid>

      <FabLink
        href="/vendedor/pedidos/nuevo"
        label="Nuevo pedido"
        icon={<IconPlus width={18} height={18} />}
      />
    </div>
  );
}
