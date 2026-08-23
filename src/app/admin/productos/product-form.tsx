"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ColorSelect } from "./color-select";
import { saveProduct } from "./actions";
import type { CategoryRow } from "@/lib/data/categories";

interface ProductFormProps {
  categories: CategoryRow[];
  initial?: {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    category: string;
    colors: string[];
    price: number;
    quantity_on_hand: number;
    low_stock_threshold: number;
  };
}

export function ProductForm({ categories, initial }: ProductFormProps) {
  const [error, formAction, pending] = useActionState(saveProduct, null);

  const categoryNames = categories.map((c) => c.name);
  const [category, setCategory] = useState(initial?.category ?? categoryNames[0] ?? "");

  // Colors are scoped to the category — only restore the product's saved
  // colors while its own original category is still selected, since those
  // colors belong to that category's palette, not necessarily any other.
  const selectedCategory = categories.find((c) => c.name === category);
  const categoryColors = selectedCategory?.colors ?? [];
  const colorsInitial = category === initial?.category ? (initial?.colors ?? []) : [];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <Field label="Nombre" name="name" required defaultValue={initial?.name} />
      <Field label="SKU" name="sku" required defaultValue={initial?.sku} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="field-label">
          Categoría
        </label>
        <Select
          id="category"
          name="category"
          value={category}
          onChange={setCategory}
          placeholder="Elegí una categoría…"
          options={categoryNames.map((c) => ({ value: c, label: c }))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="colors" className="field-label">
          Colores disponibles
        </label>
        <ColorSelect
          key={category}
          id="colors"
          name="colors"
          availableColors={categoryColors}
          initial={colorsInitial}
          emptyStateHref={selectedCategory ? `/admin/productos/categorias/${selectedCategory.id}` : undefined}
          emptyStateLinkLabel="Cargar colores para esta categoría"
          emptyStateMessage="Esta categoría no tiene colores cargados"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Precio"
          name="price"
          type="number"
          required
          defaultValue={initial ? String(initial.price) : "0"}
        />
        <Field
          label="Cantidad en stock"
          name="quantity_on_hand"
          type="number"
          required
          defaultValue={initial ? String(initial.quantity_on_hand) : "0"}
        />
      </div>

      <Field
        label="Umbral de stock bajo"
        name="low_stock_threshold"
        type="number"
        required
        defaultValue={initial ? String(initial.low_stock_threshold) : "5"}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="field-label">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initial?.description ?? ""}
          className="field-input"
        />
      </div>

      {error && (
        <p role="alert" className="border border-ink bg-steel-light px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Guardando…" : "Guardar producto"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="field-label">
        {label}
        {required && " *"}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? "any" : undefined}
        className="field-input"
      />
    </div>
  );
}
