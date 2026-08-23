import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppointment } from "@/lib/data/appointments";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconChevronLeft, IconMapPin } from "@/components/ui/icons";
import { clientDisplayName } from "@/lib/client-display";
import { cancelAppointment, completeAppointment } from "../actions";

const STATUS_LABEL = { scheduled: "Agendada", done: "Realizada", cancelled: "Cancelada" };

export default async function CitaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appointment = await getAppointment(id);
  if (!appointment) notFound();

  const clientId = appointment.client_id;

  async function markDone() {
    "use server";
    await completeAppointment(id, clientId);
  }

  async function cancel() {
    "use server";
    await cancelAppointment(id, clientId);
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/vendedor/agenda" className="flex items-center gap-1 font-mono text-xs text-concrete">
        <IconChevronLeft width={16} height={16} />
        Agenda
      </Link>

      <div>
        <p className="label-plate">{STATUS_LABEL[appointment.status]}</p>
        <h1 className="display mt-2 text-3xl">
          {appointment.client ? clientDisplayName(appointment.client) : "Cliente"}
        </h1>
        {appointment.client?.business_name && appointment.client?.name && (
          <p className="text-sm font-semibold text-concrete">Contacto: {appointment.client.name}</p>
        )}
        {appointment.client?.address && (
          <p className="mt-1 flex items-center gap-1 text-sm text-concrete">
            <IconMapPin width={14} height={14} />
            {appointment.client.address}
          </p>
        )}
      </div>

      <Card className="p-3.5">
        <p className="field-label mb-1">Cuándo</p>
        <p className="tabular text-lg">
          {new Date(appointment.scheduled_at).toLocaleString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </p>
      </Card>

      {appointment.notes && (
        <Card className="p-3.5">
          <p className="field-label mb-1">Notas</p>
          <p className="text-sm">{appointment.notes}</p>
        </Card>
      )}

      {appointment.client_id && (
        <Link href={`/vendedor/clientes/${appointment.client_id}`}>
          <Button variant="secondary" className="w-full">
            Ver cliente
          </Button>
        </Link>
      )}

      {appointment.status === "scheduled" && (
        <div className="flex gap-2">
          <form action={markDone} className="flex-1">
            <Button variant="primary" className="w-full" type="submit">
              Marcar realizada
            </Button>
          </form>
          <form action={cancel} className="flex-1">
            <Button variant="danger" className="w-full" type="submit">
              Cancelar
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
