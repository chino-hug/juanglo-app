"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateOrderNumber } from "@/app/preparacion/actions";
import { formatOrderNumber } from "@/lib/order-status";

export function OrderNumberField({ orderId, orderNumber }: { orderId: string; orderNumber: number }) {
  const router = useRouter();
  const [value, setValue] = useState(formatOrderNumber(orderNumber));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Adjust state during render (React's documented pattern) rather than in
  // an effect: after a successful save the server round-trip re-renders
  // this component with the new orderNumber, and the input should pick up
  // the zero-padded formatting without an extra effect-triggered render.
  const [renderedOrderNumber, setRenderedOrderNumber] = useState(orderNumber);
  if (orderNumber !== renderedOrderNumber) {
    setRenderedOrderNumber(orderNumber);
    setValue(formatOrderNumber(orderNumber));
  }

  const parsed = Number(value);
  const dirty = value.trim() !== formatOrderNumber(orderNumber);
  const invalid = value.trim() === "" || !Number.isInteger(parsed) || parsed < 1;

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const err = await updateOrderNumber(orderId, parsed);
      if (err) setError(err);
      else router.refresh();
    });
  }

  return (
    <div>
      <label htmlFor="order-number" className="field-label mb-1 block">
        N.º de orden
      </label>
      <div className="flex items-center gap-2">
        <input
          id="order-number"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric"
          className="field-input tabular w-32 py-1.5 text-sm"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={handleSave}
          disabled={!dirty || invalid || pending}
          className="!px-3 !py-1.5 !text-[10px]"
        >
          {pending ? "…" : "Guardar"}
        </Button>
      </div>
      {error && <p className="mt-1 text-[11px] text-safety">{error}</p>}
    </div>
  );
}
