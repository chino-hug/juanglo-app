"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { saveAppointment, getBookedTimes } from "../actions";
import type { ClientListRow } from "@/lib/data/clients";
import { clientDisplayName } from "@/lib/client-display";

// Half-hour slots covering the seller's working day. Offering every minute
// via a native time input is more precision than a route visit ever needs.
const TIME_OPTIONS = (() => {
  const options: { value: string; label: string }[] = [];
  for (let minutes = 7 * 60; minutes <= 20 * 60; minutes += 30) {
    const h24 = Math.floor(minutes / 60);
    const m = minutes % 60;
    const period = h24 < 12 ? "AM" : "PM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    options.push({
      value: `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      label: `${h12}:${String(m).padStart(2, "0")} ${period}`,
    });
  }
  return options;
})();

export function AppointmentForm({
  clients,
  preselectedId,
  initialDate,
}: {
  clients: ClientListRow[];
  preselectedId?: string;
  initialDate?: string;
}) {
  const [error, formAction, pending] = useActionState(saveAppointment, null);
  const [clientId, setClientId] = useState(preselectedId ?? "");
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(initialDate ?? today);
  const [time, setTime] = useState("");
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  // Re-check which slots are already taken every time the date changes, and
  // drop the current selection if it just became one of them.
  useEffect(() => {
    let cancelled = false;
    getBookedTimes(date).then((times) => {
      if (cancelled) return;
      setBookedTimes(times);
      setTime((current) => (current && times.includes(current) ? "" : current));
    });
    return () => {
      cancelled = true;
    };
  }, [date]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="client_id" className="field-label">
          Cliente
        </label>
        <Select
          id="client_id"
          name="client_id"
          required
          value={clientId}
          onChange={setClientId}
          placeholder="Elegí un cliente…"
          options={clients.map((c) => ({ value: c.id, label: clientDisplayName(c) }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="date" className="field-label">
            Fecha
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="field-input"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="time" className="field-label">
            Hora
          </label>
          <Select
            id="time"
            name="time"
            required
            value={time}
            onChange={setTime}
            placeholder="Elegí un horario…"
            options={TIME_OPTIONS.map((o) => ({ ...o, disabled: bookedTimes.includes(o.value) }))}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="field-label">
          Notas
        </label>
        <textarea id="notes" name="notes" rows={3} className="field-input" />
      </div>

      {error && (
        <p role="alert" className="border border-ink bg-steel-light px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending || !clientId || !time} className="mt-2 w-full">
        {pending ? "Agendando…" : "Agendar visita"}
      </Button>
    </form>
  );
}
