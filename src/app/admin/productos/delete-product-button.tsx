"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "./actions";

export function DeleteProductButton({ productId }: { productId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const err = await deleteProduct(productId);
      if (err) setError(err);
    });
  }

  if (!confirming) {
    return (
      <Button type="button" variant="danger" onClick={() => setConfirming(true)} className="w-full">
        Eliminar producto
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 border border-ink bg-base p-3">
      <p className="field-label">¿Eliminar este producto? No se puede deshacer.</p>
      <div className="flex gap-2">
        <Button type="button" variant="danger" disabled={pending} onClick={handleDelete} className="flex-1">
          {pending ? "Eliminando…" : "Sí, eliminar"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => setConfirming(false)}
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
      {error && <p className="text-sm text-safety">{error}</p>}
    </div>
  );
}
