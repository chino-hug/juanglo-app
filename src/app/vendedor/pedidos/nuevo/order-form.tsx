"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { createOrder } from "../actions";
import type { ClientListRow } from "@/lib/data/clients";
import type { ProductRow } from "@/lib/data/orders";
import { clientDisplayName } from "@/lib/client-display";

export function OrderForm({
  clients,
  products,
  preselectedClientId,
}: {
  clients: ClientListRow[];
  products: ProductRow[];
  preselectedClientId?: string;
}) {
  const [error, formAction, pending] = useActionState(createOrder, null);
  const [clientId, setClientId] = useState(preselectedClientId ?? "");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const items = useMemo(
    () =>
      Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([productId, quantity]) => ({ productId, quantity })),
    [quantities],
  );

  const total = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

  function setQty(productId: string, qty: number, max: number) {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(0, Math.min(qty, max)) }));
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 pb-20">
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="client_id_select" className="field-label">
          Cliente
        </label>
        <Select
          id="client_id_select"
          name="client_id"
          required
          value={clientId}
          onChange={setClientId}
          placeholder="Elegí un cliente…"
          options={clients.map((c) => ({ value: c.id, label: clientDisplayName(c) }))}
        />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="field-label">Productos</h2>
        <ul className="flex flex-col gap-2">
          {products.map((product) => {
            const qty = quantities[product.id] ?? 0;
            const lowStock = product.quantity_on_hand <= product.low_stock_threshold;
            return (
              <li
                key={product.id}
                className="flex items-center gap-3 border border-ink bg-base p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{product.name}</p>
                  <p className="tabular text-xs text-concrete">
                    ${product.price.toLocaleString("es-AR", { minimumFractionDigits: 2 })} ·{" "}
                    {lowStock ? (
                      <span className="text-safety">quedan {product.quantity_on_hand}</span>
                    ) : (
                      `stock ${product.quantity_on_hand}`
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQty(product.id, qty - 1, product.quantity_on_hand)}
                    className="flex h-8 w-8 items-center justify-center border border-ink font-mono text-lg"
                    aria-label={`Quitar ${product.name}`}
                  >
                    −
                  </button>
                  <span className="tabular w-6 text-center text-sm font-semibold">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(product.id, qty + 1, product.quantity_on_hand)}
                    disabled={qty >= product.quantity_on_hand}
                    className="flex h-8 w-8 items-center justify-center border border-ink font-mono text-lg disabled:opacity-30"
                    aria-label={`Agregar ${product.name}`}
                  >
                    +
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="field-label">
          Notas
        </label>
        <textarea id="notes" name="notes" rows={2} className="field-input" />
      </div>

      {error && (
        <p role="alert" className="border border-ink bg-steel-light px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-ink bg-base px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <p className="field-label">Total</p>
            <p className="tabular text-xl font-semibold">
              ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Button type="submit" disabled={pending || !clientId || items.length === 0}>
            {pending ? "Creando…" : "Crear pedido"}
          </Button>
        </div>
      </div>
    </form>
  );
}
