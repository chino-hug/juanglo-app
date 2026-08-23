import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/data/orders";
import { Card } from "@/components/ui/card";
import { OrderStatusTag } from "@/components/ui/order-status-tag";
import { OrderStatusTimeline } from "@/components/ui/order-status-timeline";
import { StatusDropdown } from "@/components/shared/status-dropdown";
import { PickingItemRow } from "@/components/shared/picking-item-row";
import { OrderNumberField } from "@/components/shared/order-number-field";
import { IconChevronLeft, IconMapPin } from "@/components/ui/icons";

export default async function PreparacionOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/preparacion" className="flex items-center gap-1 font-mono text-xs text-concrete">
        <IconChevronLeft width={16} height={16} />
        Cola
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-plate">{new Date(order.created_at).toLocaleDateString("es-AR")}</p>
          <h1 className="display mt-2 text-3xl">{order.client?.name ?? "Cliente"}</h1>
          {order.client?.address && (
            <p className="mt-1 flex items-center gap-1 text-sm text-concrete">
              <IconMapPin width={14} height={14} />
              {order.client.address}
            </p>
          )}
          {order.client?.phone && <p className="text-sm text-concrete">{order.client.phone}</p>}
        </div>
        <OrderStatusTag status={order.status} />
      </div>

      <Card className="p-3.5">
        <OrderNumberField orderId={order.id} orderNumber={order.orderNumber} />
      </Card>

      <Card className="p-3.5">
        <p className="field-label mb-3">Estado del pedido</p>
        <OrderStatusTimeline currentStatus={order.status} history={order.history} />
      </Card>

      <section className="flex flex-col gap-2">
        <h2 className="field-label">Productos a preparar</h2>
        <ul className="flex flex-col gap-1.5">
          {order.items.map((item) => (
            <PickingItemRow key={item.id} item={item} orderId={order.id} />
          ))}
        </ul>
      </section>

      {order.notes && (
        <Card className="p-3.5">
          <p className="field-label mb-1">Notas del pedido</p>
          <p className="text-sm">{order.notes}</p>
        </Card>
      )}

      <div>
        <p className="field-label mb-1.5">Cambiar el estado del pedido</p>
        <StatusDropdown orderId={order.id} status={order.status} />
      </div>
    </div>
  );
}
