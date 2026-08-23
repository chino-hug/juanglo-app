"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setOrderStatus } from "@/app/preparacion/actions";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import { Select } from "@/components/ui/select";
import type { OrderStatus } from "@/lib/supabase/database.types";

const FULFILLMENT_STATUSES: OrderStatus[] = [
  "created",
  "picking",
  "packed",
  "out_for_delivery",
  "delivered",
];

export function StatusDropdown({
  orderId,
  status,
  className,
}: {
  orderId: string;
  status: OrderStatus;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(next: string) {
    setError(null);
    startTransition(async () => {
      const err = await setOrderStatus(orderId, next as OrderStatus);
      if (err) setError(err);
      else router.refresh();
    });
  }

  // cancelled orders never reach this queue; the dropdown only ever offers
  // the five fulfillment stages, forward or backward, so a mistaken tap
  // can be corrected without leaving this screen.
  return (
    <div className={className}>
      <Select
        name="status"
        value={status}
        onChange={handleChange}
        disabled={pending}
        ariaLabel="Cambiar estado del pedido"
        options={FULFILLMENT_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABEL[s] }))}
      />
      {error && <p className="mt-1 text-xs text-safety">{error}</p>}
    </div>
  );
}
