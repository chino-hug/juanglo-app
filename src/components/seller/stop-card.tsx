import Link from "next/link";
import { Card } from "@/components/ui/card";
import { LabelPlate } from "@/components/ui/label-plate";
import { IconClock, IconMapPin } from "@/components/ui/icons";
import { StopCardActions } from "./stop-card-actions";
import type { AppointmentStatus } from "@/lib/supabase/database.types";

const CLIENT_STATUS_LABEL: Record<string, string> = {
  prospect: "Prospecto",
  scheduled: "Agendado",
  client: "Cliente",
};

export function StopCard({
  appointmentId,
  appointmentStatus,
  clientId,
  clientName,
  businessName,
  address,
  zoneName,
  scheduledAt,
  clientStatus,
}: {
  appointmentId: string;
  appointmentStatus: AppointmentStatus;
  clientId: string;
  clientName: string | null;
  businessName?: string | null;
  address: string | null;
  zoneName?: string | null;
  scheduledAt: string;
  clientStatus: string;
}) {
  const time = new Date(scheduledAt).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const isFirstVisit = clientStatus === "prospect";

  return (
    <Card attention={isFirstVisit} className="flex flex-col gap-3 p-3">
      <Link href={`/vendedor/clientes/${clientId}`} className="flex items-center gap-3">
        <div className="flex w-14 shrink-0 flex-col items-center border-r border-ink pr-3 font-mono">
          <IconClock width={16} height={16} className="mb-1 text-concrete" />
          <span className="tabular text-sm font-semibold">{time}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="display truncate text-lg">{businessName || clientName || "Cliente"}</p>
          {businessName && clientName && (
            <p className="truncate text-xs font-semibold text-concrete">{clientName}</p>
          )}
          {address && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-concrete">
              <IconMapPin width={13} height={13} className="shrink-0" />
              {address}
            </p>
          )}
          <div className="mt-2 flex items-center gap-1.5">
            {zoneName && <LabelPlate>{zoneName}</LabelPlate>}
            <span className="font-mono text-[10px] uppercase tracking-wide text-concrete">
              {CLIENT_STATUS_LABEL[clientStatus] ?? clientStatus}
            </span>
          </div>
        </div>
      </Link>

      <div className="border-t border-dashed border-steel pt-2 pl-[68px]">
        <StopCardActions
          appointmentId={appointmentId}
          clientId={clientId}
          status={appointmentStatus}
        />
      </div>
    </Card>
  );
}
