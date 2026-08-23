"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { updateZone } from "./actions";
import { ZONE_REGIONS } from "@/lib/zone-region";
import type { ZoneRow } from "@/lib/data/clients";

export function ZoneForm({ zone }: { zone: ZoneRow }) {
  const [error, formAction, pending] = useActionState(updateZone, null);
  const [region, setRegion] = useState<string>(zone.region ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={zone.id} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="city" className="field-label">
          Ciudad
        </label>
        <input
          id="city"
          name="city"
          type="text"
          defaultValue={zone.city ?? ""}
          placeholder="Valle de Aburrá"
          className="field-input"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="region" className="field-label">
          Zona
        </label>
        <Select
          id="region"
          name="region"
          value={region}
          onChange={setRegion}
          placeholder="Sin zona"
          options={ZONE_REGIONS.map((r) => ({ value: r, label: r }))}
        />
        <p className="text-xs text-concrete">
          Solo aplica dentro de Valle de Aburrá — dejala sin asignar para otras ciudades.
        </p>
      </div>

      {error && (
        <p role="alert" className="border border-ink bg-steel-light px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Guardando…" : "Guardar zona"}
      </Button>
    </form>
  );
}
