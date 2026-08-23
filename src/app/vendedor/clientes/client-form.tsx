"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { saveClient } from "./actions";
import type { ClientStatus } from "@/lib/supabase/database.types";

const STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: "prospect", label: "Prospecto" },
  { value: "scheduled", label: "Agendado" },
  { value: "client", label: "Cliente" },
];

interface ClientFormProps {
  zones: { id: string; name: string }[];
  initial?: {
    id: string;
    name: string | null;
    business_name: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    notes: string | null;
    status: string;
    zone_id: string | null;
    seller_id?: string;
  };
  // when creating a client from an "agregar parada" flow for a specific
  // date, carry that date through so saving jumps straight into scheduling
  // this client for it instead of landing on the plain client detail page.
  fecha?: string;
  // admin-only: lets the admin pick/reassign which seller this client
  // belongs to. Omitted entirely on the seller side, where it's always the
  // logged-in seller and the form has nothing to show or post for it.
  sellers?: { id: string; full_name: string }[];
  action?: (state: string | null, formData: FormData) => Promise<string | null>;
}

export function ClientForm({ zones, initial, fecha, sellers, action = saveClient }: ClientFormProps) {
  const [error, formAction, pending] = useActionState(action, null);
  const [zoneId, setZoneId] = useState(initial?.zone_id ?? "");
  const [status, setStatus] = useState<string>(initial?.status ?? "prospect");
  const [sellerId, setSellerId] = useState(initial?.seller_id ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      {fecha && <input type="hidden" name="fecha" value={fecha} />}

      {sellers && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="seller_id" className="field-label">
            Vendedor asignado
          </label>
          <Select
            id="seller_id"
            name="seller_id"
            value={sellerId}
            onChange={setSellerId}
            required
            placeholder="Elegí un vendedor…"
            options={sellers.map((s) => ({ value: s.id, label: s.full_name }))}
          />
        </div>
      )}

      <p className="text-xs text-concrete">
        Completá al menos uno: nombre del negocio, nombre de contacto o teléfono.
      </p>
      <Field label="Nombre del negocio" name="business_name" defaultValue={initial?.business_name ?? ""} />
      <Field label="Nombre de contacto" name="name" defaultValue={initial?.name ?? ""} />
      <Field label="Teléfono" name="phone" defaultValue={initial?.phone ?? ""} />
      <Field label="Dirección" name="address" defaultValue={initial?.address ?? ""} />
      <Field label="Correo" name="email" type="email" defaultValue={initial?.email ?? ""} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="zone_id" className="field-label">
          Zona
        </label>
        <Select
          id="zone_id"
          name="zone_id"
          value={zoneId}
          onChange={setZoneId}
          placeholder="Sin asignar"
          options={zones.map((z) => ({ value: z.id, label: z.name }))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="status" className="field-label">
          Estado
        </label>
        <Select id="status" name="status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="field-label">
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={initial?.notes ?? ""}
          className="field-input"
        />
      </div>

      {error && (
        <p role="alert" className="border border-ink bg-steel-light px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Guardando…" : "Guardar cliente"}
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
        className="field-input"
      />
    </div>
  );
}
