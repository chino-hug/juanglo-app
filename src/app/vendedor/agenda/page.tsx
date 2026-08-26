import Link from "next/link";
import { requireSeller } from "@/lib/auth";
import { listAppointmentsForMonth, listMonthsWithAppointments } from "@/lib/data/appointments";
import { StopCard } from "@/components/seller/stop-card";
import { CardGrid } from "@/components/ui/card-grid";
import { AddStopButton } from "@/components/seller/add-stop-button";
import { IconChevronLeft } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const MONTH_LABELS = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
  const profile = await requireSeller();

  const now = new Date();
  const defaultMes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [yearStr, monthStr] = (mes ?? defaultMes).split("-");
  const year = Number(yearStr) || now.getFullYear();
  const month = Number(monthStr) || now.getMonth() + 1;

  const [appointments, filledMonths] = await Promise.all([
    listAppointmentsForMonth(profile.id, year, month),
    listMonthsWithAppointments(profile.id, year),
  ]);

  // Never hide the month you're actually looking at, even if it turns out
  // to be empty (e.g. you just navigated to it to add the first stop).
  const visibleMonths = [...new Set([...filledMonths, month])].sort((a, b) => a - b);

  const groups = new Map<string, typeof appointments>();
  for (const appt of appointments) {
    const dayKey = new Date(appt.scheduled_at).toDateString();
    const list = groups.get(dayKey) ?? [];
    list.push(appt);
    groups.set(dayKey, list);
  }

  const visitCount = appointments.length;
  const visitLabel = visitCount === 1 ? "cliente por visitar este mes" : "clientes por visitar este mes";

  return (
    <div className="flex flex-col gap-6">
      <Link href="/vendedor" className="flex items-center gap-1 font-mono text-xs text-concrete">
        <IconChevronLeft width={16} height={16} />
        Hoy
      </Link>

      <div>
        <p className="label-plate">Agenda</p>
        <h1 className="display mt-2 text-3xl">
          {visitCount} {visitLabel}
        </h1>
        <p className="mt-1 text-xs text-concrete">
          Tu ruta planificada y el registro de lo que ya visitaste.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Link
          href={`/vendedor/agenda?mes=${year - 1}-${String(month).padStart(2, "0")}`}
          className="font-mono text-[10px] uppercase tracking-wide text-concrete underline"
        >
          Año {year - 1}
        </Link>
        <span className="tabular text-sm font-semibold">{year}</span>
        <Link
          href={`/vendedor/agenda?mes=${year + 1}-${String(month).padStart(2, "0")}`}
          className="font-mono text-[10px] uppercase tracking-wide text-concrete underline"
        >
          Año {year + 1}
        </Link>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {visibleMonths.map((m) => (
          <Link
            key={m}
            href={`/vendedor/agenda?mes=${year}-${String(m).padStart(2, "0")}`}
            className={cn(
              "label-plate shrink-0",
              m === month ? "bg-ink text-base" : "bg-base text-ink",
            )}
          >
            {MONTH_LABELS[m - 1]}
          </Link>
        ))}
      </div>

      {groups.size === 0 && (
        <div className="border border-dashed border-steel px-4 py-10 text-center">
          <p className="text-sm text-concrete">No hay paradas registradas este mes.</p>
        </div>
      )}

      {[...groups.entries()].map(([day, appts]) => {
        const dayDate = new Date(appts[0].scheduled_at);
        return (
          <section key={day} className="flex flex-col gap-2.5">
            <h2 className="field-label capitalize">
              {dayDate.toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
              })}
            </h2>

            <CardGrid>
              {appts.map((appt) =>
                appt.client ? (
                  <li key={appt.id}>
                    <StopCard
                      appointmentId={appt.id}
                      appointmentStatus={appt.status}
                      clientId={appt.client.id}
                      clientName={appt.client.name}
                      businessName={appt.client.business_name}
                      address={appt.client.address}
                      zoneName={appt.client.zone?.name}
                      scheduledAt={appt.scheduled_at}
                      clientStatus={appt.client.status}
                    />
                  </li>
                ) : null,
              )}
            </CardGrid>
          </section>
        );
      })}

      <AddStopButton
        fecha={`${year}-${String(month).padStart(2, "0")}-01`}
        label="Agregar parada este mes"
      />
    </div>
  );
}
