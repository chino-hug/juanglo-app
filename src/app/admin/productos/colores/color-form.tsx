"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { saveColor } from "./actions";

interface ColorFormProps {
  initial?: {
    id: string;
    name: string;
  };
}

export function ColorForm({ initial }: ColorFormProps) {
  const [error, formAction, pending] = useActionState(saveColor, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="field-label">
          Nombre *
        </label>
        <input id="name" name="name" required defaultValue={initial?.name} className="field-input" />
      </div>

      {error && (
        <p role="alert" className="border border-ink bg-steel-light px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Guardando…" : "Guardar color"}
      </Button>
    </form>
  );
}
