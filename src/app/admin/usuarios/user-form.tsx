"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { saveUser } from "./actions";
import { ROLE_OPTIONS } from "@/lib/user-role";
import type { UserRole } from "@/lib/supabase/database.types";

interface UserFormProps {
  initial?: {
    id: string;
    full_name: string;
    email: string;
    cedula: string;
    role: UserRole;
  };
}

export function UserForm({ initial }: UserFormProps) {
  const [error, formAction, pending] = useActionState(saveUser, null);
  const [role, setRole] = useState<string>(initial?.role ?? "seller");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <Field label="Nombre completo" name="full_name" required defaultValue={initial?.full_name} />
      <Field label="Correo" name="email" type="email" required defaultValue={initial?.email} />
      <Field label="Cédula" name="cedula" required defaultValue={initial?.cedula} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="role" className="field-label">
          Cargo
        </label>
        <Select id="role" name="role" value={role} onChange={setRole} options={ROLE_OPTIONS} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="field-label">
          Contraseña{!initial && " *"}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required={!initial}
          minLength={8}
          className="field-input"
          placeholder={initial ? "Dejar vacío para no cambiarla" : "Mínimo 8 caracteres"}
        />
      </div>

      {error && (
        <p role="alert" className="border border-ink bg-steel-light px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Guardando…" : "Guardar usuario"}
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
