"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { completeAppointment } from "@/app/vendedor/citas/actions";
import type { AppointmentStatus } from "@/lib/supabase/database.types";

const STATUS_LABEL: Record<string, string> = {
  done: "Visitada",
  cancelled: "Cancelada",
};

export function StopCardActions({
  appointmentId,
  clientId,
  status,
}: {
  appointmentId: string;
  clientId: string;
  status: AppointmentStatus;
}) {
  const router = useRouter();
  const [choosing, setChoosing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (status !== "scheduled") {
    return (
      <p className="font-mono text-[10px] uppercase tracking-wide text-concrete">
        {STATUS_LABEL[status] ?? status}
      </p>
    );
  }

  function markVisited(withOrder: boolean) {
    startTransition(async () => {
      await completeAppointment(appointmentId, clientId);
      if (withOrder) {
        router.push(`/vendedor/pedidos/nuevo?cliente=${clientId}`);
      } else {
        router.refresh();
      }
    });
  }

  if (choosing) {
    return (
      <div className="flex gap-2">
        <Button
          type="button"
          variant="primary"
          disabled={pending}
          onClick={() => markVisited(true)}
          className="!px-3 !py-1.5 !text-[10px] flex-1"
        >
          Con pedido
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => markVisited(false)}
          className="!px-3 !py-1.5 !text-[10px] flex-1"
        >
          Sin pedido
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => setChoosing(false)}
          className="!px-3 !py-1.5 !text-[10px]"
        >
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={() => setChoosing(true)}
        className="!px-3 !py-1.5 !text-[10px] flex-1"
      >
        Marcar visitado
      </Button>
      <Link href={`/vendedor/citas/${appointmentId}`} className="shrink-0">
        <Button type="button" variant="secondary" className="!px-3 !py-1.5 !text-[10px]">
          Editar
        </Button>
      </Link>
    </div>
  );
}
