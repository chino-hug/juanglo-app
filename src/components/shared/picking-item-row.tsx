"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconAlertNote } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { saveItemChanges } from "@/app/preparacion/actions";
import type { OrderItemRow } from "@/lib/data/orders";

export function PickingItemRow({ item, orderId }: { item: OrderItemRow; orderId: string }) {
  const router = useRouter();
  const [picked, setPicked] = useState(item.picked);
  const [note, setNote] = useState(item.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const stock = item.product?.quantityOnHand ?? 0;
  const outOfStock = stock <= 0;
  const short = !outOfStock && stock < item.quantity;
  const dirty = picked !== item.picked || note.trim() !== (item.note ?? "").trim();

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const err = await saveItemChanges(item.id, orderId, picked, note);
      if (err) setError(err);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <li className="flex flex-col gap-2 border border-ink bg-base p-3">
      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={picked}
          onChange={(e) => {
            setPicked(e.target.checked);
            setSaved(false);
          }}
          className="h-4 w-4 shrink-0 accent-safety"
        />
        <span
          className={cn(
            "flex-1 text-sm font-semibold",
            picked && "text-concrete line-through decoration-1",
          )}
        >
          {item.product?.name}
        </span>
        <span className="tabular text-sm">×{item.quantity}</span>
      </label>

      <div className="pl-6 flex items-center gap-1.5">
        {outOfStock ? (
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-safety">
            Sin stock
          </span>
        ) : short ? (
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-safety">
            Solo quedan {stock} — pediste {item.quantity}
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-wide text-concrete">
            Stock disponible: {stock}
          </span>
        )}
      </div>

      <div className="pl-6 flex items-start gap-2">
        <div className="flex-1">
          <input
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setSaved(false);
            }}
            placeholder="Avisar un problema con este producto…"
            className="field-input py-1.5 text-xs"
          />
          {saved && !dirty && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-safety">
              <IconAlertNote width={12} height={12} />
              Guardado{note.trim() ? " — aviso enviado a la vendedora y a administración" : ""}
            </p>
          )}
          {error && <p className="mt-1 text-[11px] text-safety">{error}</p>}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleSave}
          disabled={!dirty || pending}
          className="!px-3 !py-1.5 !text-[10px]"
        >
          {pending ? "…" : "Guardar"}
        </Button>
      </div>
    </li>
  );
}
