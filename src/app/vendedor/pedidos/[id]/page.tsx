import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/data/orders";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusTag } from "@/components/ui/order-status-tag";
import { OrderStatusTimeline } from "@/components/ui/order-status-timeline";
import { LabelPlate } from "@/components/ui/label-plate";
import { IconChevronLeft, IconAlertNote } from "@/components/ui/icons";
import { LiveOrderRefresh } from "@/components/seller/live-order-refresh";
import { formatOrderNumber } from "@/lib/order-status";
import { cancelOrder } from "../actions";

export default async function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  async function cancel() {
    "use server";
    await cancelOrder(id);
  }

  return (
    <div className="flex flex-col gap-6">
      <LiveOrderRefresh orderId={id} />
      <Link href="/vendedor/pedidos" className="flex items-center gap-1 font-mono text-xs text-concrete">
        <IconChevronLeft width={16} height={16} />
        Pedidos
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="label-plate">
              {new Date(order.created_at).toLocaleDateString("es-AR")}
            </p>
            <LabelPlate>N.º {formatOrderNumber(order.orderNumber)}</LabelPlate>
          </div>
          <h1 className="display mt-2 text-3xl">{order.client?.name ?? "Cliente"}</h1>
          {order.client?.address && (
            <p className="mt-1 text-sm text-concrete">{order.client.address}</p>
          )}
        </div>
        <OrderStatusTag status={order.status} />
      </div>

      <Card className="p-3.5">
        <p className="field-label mb-3">Estado del pedido</p>
        <OrderStatusTimeline currentStatus={order.status} history={order.history} />
      </Card>

      <section className="flex flex-col gap-2">
        <h2 className="field-label">Productos</h2>
        <ul className="flex flex-col gap-1.5">
          {order.items.map((item) => (
            <li key={item.id} className="border border-ink bg-base p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{item.product?.name}</p>
                  <p className="tabular text-xs text-concrete">
                    {item.quantity} ×{" "}
                    ${item.unit_price.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <span className="tabular text-sm font-semibold">
                  ${(item.quantity * item.unit_price).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              {item.note && (
                <p className="mt-2 flex items-start gap-1.5 border-t border-dashed border-steel pt-2 text-xs text-safety">
                  <IconAlertNote width={13} height={13} className="mt-0.5 shrink-0" />
                  {item.note}
                </p>
              )}
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-ink pt-2">
          <span className="field-label">Total</span>
          <span className="tabular text-lg font-semibold">
            ${order.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </section>

      {order.notes && (
        <Card className="p-3.5">
          <p className="field-label mb-1">Notas</p>
          <p className="text-sm">{order.notes}</p>
        </Card>
      )}

      {order.client && (
        <Link href={`/vendedor/clientes/${order.client.id}`}>
          <Button variant="secondary" className="w-full">
            Ver cliente
          </Button>
        </Link>
      )}

      {order.status === "created" && (
        <form action={cancel}>
          <Button variant="danger" type="submit" className="w-full">
            Anular pedido
          </Button>
        </form>
      )}
    </div>
  );
}
