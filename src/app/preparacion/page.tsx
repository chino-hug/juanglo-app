import Link from "next/link";
import { listQueueOrders, QUEUE_STATUSES } from "@/lib/data/picking";
import { Card } from "@/components/ui/card";
import { LabelPlate } from "@/components/ui/label-plate";
import { OrderStatusTag } from "@/components/ui/order-status-tag";
import { StatusDropdown } from "@/components/shared/status-dropdown";
import { ItemListPreview } from "@/components/shared/item-list-preview";
import { IconMapPin } from "@/components/ui/icons";
import { QUEUE_SECTION_LABEL, formatOrderNumber } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/supabase/database.types";

export default async function PreparacionPage() {
  const orders = await listQueueOrders();

  const sections = QUEUE_STATUSES.map((status) => ({
    status,
    label: QUEUE_SECTION_LABEL[status],
    orders: orders.filter((o) => o.status === status),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-plate">Preparación</p>
        <h1 className="display mt-2 text-3xl">Cola de pedidos</h1>
      </div>

      {orders.length === 0 && (
        <div className="border border-dashed border-steel px-4 py-10 text-center">
          <p className="text-sm text-concrete">No hay pedidos pendientes ahora mismo.</p>
        </div>
      )}

      {sections.map(
        (section) =>
          section.orders.length > 0 && (
            <section key={section.status} className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h2 className="field-label">{section.label}</h2>
                <span className="utility-tile-value text-base leading-none">
                  {section.orders.length}
                </span>
              </div>

              <ul className="flex flex-col gap-2.5">
                {section.orders.map((order) => (
                  <li key={order.id}>
                    <Card className="flex flex-col gap-3 p-3.5">
                      <Link href={`/preparacion/${order.id}`} className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-mono text-[10px] uppercase tracking-wide text-concrete">
                              N.º {formatOrderNumber(order.orderNumber)}
                            </p>
                            <p className="display truncate text-lg">{order.client?.name ?? "Cliente"}</p>
                            {order.client?.address && (
                              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-concrete">
                                <IconMapPin width={13} height={13} className="shrink-0" />
                                {order.client.address}
                              </p>
                            )}
                          </div>
                          <OrderStatusTag status={order.status as OrderStatus} />
                        </div>

                        {order.client?.zoneName && <LabelPlate>{order.client.zoneName}</LabelPlate>}
                      </Link>

                      <ItemListPreview items={order.items} />

                      <StatusDropdown orderId={order.id} status={order.status as OrderStatus} />
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          ),
      )}
    </div>
  );
}
