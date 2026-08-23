import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, getClientOrders, getClientAppointments } from "@/lib/data/clients";
import { LabelPlate } from "@/components/ui/label-plate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusTag } from "@/components/ui/order-status-tag";
import { ClientStatusTag } from "@/components/seller/client-status-tag";
import { IconChevronLeft } from "@/components/ui/icons";
import { clientDisplayName } from "@/lib/client-display";
import { convertToClient } from "../actions";
import type { OrderStatus, AppointmentStatus } from "@/lib/supabase/database.types";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const [orders, appointments] = await Promise.all([
    getClientOrders(id),
    getClientAppointments(id),
  ]);

  async function convert() {
    "use server";
    await convertToClient(id);
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/vendedor/clientes"
        className="flex items-center gap-1 font-mono text-xs text-concrete"
      >
        <IconChevronLeft width={16} height={16} />
        Clientes
      </Link>

      <div>
        <div className="flex items-center gap-2">
          {client.zone && <LabelPlate>{client.zone.name}</LabelPlate>}
          <ClientStatusTag status={client.status} />
        </div>
        <h1 className="display mt-2 text-3xl">{clientDisplayName(client)}</h1>
        {client.business_name && client.name && (
          <p className="text-sm font-semibold text-concrete">Contacto: {client.name}</p>
        )}
        {client.address && <p className="mt-1 text-sm text-concrete">{client.address}</p>}
        {client.phone && (client.business_name || client.name) && (
          <p className="text-sm text-concrete">{client.phone}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`/vendedor/pedidos/nuevo?cliente=${client.id}`}>
          <Button variant="primary">Nuevo pedido</Button>
        </Link>
        <Link href={`/vendedor/citas/nueva?cliente=${client.id}`}>
          <Button variant="secondary">Agendar visita</Button>
        </Link>
        <Link href={`/vendedor/clientes/${client.id}/editar`}>
          <Button variant="secondary">Editar</Button>
        </Link>
        {client.status !== "client" && (
          <form action={convert}>
            <Button variant="secondary" type="submit">
              Marcar como cliente
            </Button>
          </form>
        )}
      </div>

      {client.notes && (
        <Card className="p-3.5">
          <p className="field-label mb-1">Notas</p>
          <p className="text-sm">{client.notes}</p>
        </Card>
      )}

      <section className="flex flex-col gap-2.5">
        <h2 className="field-label">Pedidos</h2>
        {orders.length === 0 && <p className="text-sm text-concrete">Sin pedidos todavía.</p>}
        {orders.map((order) => (
          <Link key={order.id} href={`/vendedor/pedidos/${order.id}`}>
            <Card className="flex items-center justify-between p-3">
              <span className="tabular text-sm">
                {new Date(order.created_at).toLocaleDateString("es-AR")}
              </span>
              <div className="flex items-center gap-3">
                <span className="tabular text-sm font-semibold">
                  ${order.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
                <OrderStatusTag status={order.status as OrderStatus} />
              </div>
            </Card>
          </Link>
        ))}
      </section>

      <section className="flex flex-col gap-2.5">
        <h2 className="field-label">Visitas</h2>
        {appointments.length === 0 && (
          <p className="text-sm text-concrete">Sin visitas registradas.</p>
        )}
        {appointments.map((appt) => (
          <Card key={appt.id} className="flex items-center justify-between p-3">
            <span className="tabular text-sm">
              {new Date(appt.scheduled_at).toLocaleString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>
            <AppointmentStatusLabel status={appt.status as AppointmentStatus} />
          </Card>
        ))}
      </section>
    </div>
  );
}

function AppointmentStatusLabel({ status }: { status: AppointmentStatus }) {
  const label = { scheduled: "Agendada", done: "Realizada", cancelled: "Cancelada" }[status];
  return <span className="font-mono text-[10px] uppercase tracking-wide text-concrete">{label}</span>;
}
