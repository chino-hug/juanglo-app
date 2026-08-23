"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@/components/ui/icons";

// fecha is optional — when browsing Hoy, the target date is always today, so
// the create/schedule flows already default to it on their own. Agenda
// passes the specific day being viewed so both paths land on that date.
export function AddStopButton({
  fecha,
  label = "Agregar parada",
}: {
  fecha?: string;
  label?: string;
}) {
  const [choosing, setChoosing] = useState(false);
  const suffix = fecha ? `?fecha=${fecha}` : "";

  if (!choosing) {
    return (
      <Button type="button" variant="secondary" onClick={() => setChoosing(true)} className="w-full">
        <IconPlus width={16} height={16} />
        {label}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 border border-ink bg-base p-3">
      <p className="field-label">¿A quién vas a visitar?</p>
      <div className="flex items-stretch gap-2">
        <Link href={`/vendedor/clientes/nuevo${suffix}`} className="flex-1">
          <Button type="button" variant="primary" className="h-full w-full">
            Cliente nuevo
          </Button>
        </Link>
        <Link href={`/vendedor/citas/nueva${suffix}`} className="flex-1">
          <Button type="button" variant="secondary" className="h-full w-full">
            Cliente existente
          </Button>
        </Link>
      </div>
      <button
        type="button"
        onClick={() => setChoosing(false)}
        className="font-mono text-[10px] uppercase tracking-wide text-concrete underline"
      >
        Cancelar
      </button>
    </div>
  );
}
