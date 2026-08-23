"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { ColorSelect } from "../color-select";
import { saveCategory } from "./actions";

interface CategoryFormProps {
  colors: { id: string; name: string }[];
  initial?: {
    id: string;
    name: string;
    colors: string[];
  };
}

export function CategoryForm({ colors, initial }: CategoryFormProps) {
  const [error, formAction, pending] = useActionState(saveCategory, null);
  const colorNames = colors.map((c) => c.name);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="field-label">
          Nombre *
        </label>
        <input id="name" name="name" required defaultValue={initial?.name} className="field-input" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="colors" className="field-label">
          Colores de esta categoría
        </label>
        <ColorSelect
          id="colors"
          name="colors"
          availableColors={colorNames}
          initial={initial?.colors}
          emptyStateHref="/admin/productos/colores"
          emptyStateLinkLabel="Cargar colores del sistema"
          emptyStateMessage="Todavía no hay colores cargados en el sistema"
        />
      </div>

      {error && (
        <p role="alert" className="border border-ink bg-steel-light px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Guardando…" : "Guardar categoría"}
      </Button>
    </form>
  );
}
