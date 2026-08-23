import { listAllOrders, countOrdersByStatus, getPackingProgress } from "@/lib/data/picking";
import { listAllClients, getClientOrders } from "@/lib/data/clients";
import { OrderViewTabs } from "@/components/shared/order-view-tabs";
import { PackingProgressBar } from "@/components/shared/packing-progress-bar";
import { OrderSummaryCard } from "@/components/shared/order-summary-card";
import { ClientFilterSelect } from "@/components/shared/client-filter-select";
import { UtilityTile } from "@/components/ui/utility-tile";
import { FilterDisclosure } from "@/components/ui/filter-disclosure";
import { ChipToggle } from "@/components/ui/chip-toggle";
import { clientDisplayName } from "@/lib/client-display";
import { formatOrderNumber } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/supabase/database.types";

const ACTIVE_FILTERS: { value: OrderStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "created", label: "Creado" },
  { value: "picking", label: "En preparación" },
  { value: "packed", label: "Empacado" },
  { value: "out_for_delivery", label: "En camino" },
  { value: "cancelled", label: "Cancelado" },
];

function buildHref(base: string, params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

export default async function TodosLosPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; cliente?: string; orden?: string }>;
}) {
  const { estado, cliente, orden } = await searchParams;
  const status = (estado as OrderStatus | "todos" | undefined) ?? "todos";
  const numberQuery = orden?.trim();

  const [orders, ordersForEstadoFacet, counts, progress, clients] = await Promise.all([
    listAllOrders(status, cliente),
    listAllOrders("todos", cliente),
    countOrdersByStatus(),
    getPackingProgress(),
    listAllClients(),
  ]);

  const filteredOrders = numberQuery
    ? orders.filter((o) => formatOrderNumber(o.orderNumber).includes(numberQuery))
    : orders;

  const selectedClient = cliente ? clients.find((c) => c.id === cliente) : undefined;
  const clientOrderTotal = cliente ? (await getClientOrders(cliente)).length : null;

  const estadoCount = (value: OrderStatus | "todos") => {
    if (value === "todos") return ordersForEstadoFacet.length;
    if (value === "cancelled") return counts.cancelled;
    return ordersForEstadoFacet.filter((o) => o.status === value).length;
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="label-plate">Preparación</p>
        <h1 className="display mt-2 text-3xl">Todos los pedidos</h1>
      </div>

      <OrderViewTabs active="todos" />

      <PackingProgressBar total={progress.total} packed={progress.packed} />

      <form method="get" className="flex flex-col gap-1.5">
        <label htmlFor="orden" className="field-label">
          Buscar por número de pedido
        </label>
        <input
          id="orden"
          name="orden"
          type="search"
          defaultValue={orden}
          placeholder="N.º de pedido…"
          className="field-input"
        />
        {status !== "todos" && <input type="hidden" name="estado" value={status} />}
        {cliente && <input type="hidden" name="cliente" value={cliente} />}
      </form>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cliente" className="field-label">
          Filtrar por cliente
        </label>
        <ClientFilterSelect clients={clients} value={cliente ?? ""} />
      </div>

      {selectedClient && clientOrderTotal !== null && (
        <UtilityTile
          label={`Pedidos totales de ${clientDisplayName(selectedClient)}`}
          value={clientOrderTotal}
        />
      )}

      <FilterDisclosure
        label="Estado"
        summary={ACTIVE_FILTERS.find((f) => f.value === status)?.label ?? "Todos"}
        defaultOpen={status !== "todos"}
      >
        {ACTIVE_FILTERS.map((f) => (
          <ChipToggle
            key={f.value}
            href={buildHref("/preparacion/pedidos", {
              estado: f.value === "todos" ? undefined : f.value,
              cliente,
              orden,
            })}
            label={`${f.label} · ${estadoCount(f.value)}`}
            selected={status === f.value}
            disabled={f.value !== "todos" && estadoCount(f.value) === 0}
          />
        ))}
        <ChipToggle
          href={buildHref("/preparacion/pedidos/historico", { cliente })}
          label={`Entregado · ${counts.delivered}`}
          selected={false}
          disabled={counts.delivered === 0}
        />
      </FilterDisclosure>

      {filteredOrders.length === 0 && (
        <div className="border border-dashed border-steel px-4 py-10 text-center">
          <p className="text-sm text-concrete">No hay pedidos con este filtro.</p>
        </div>
      )}

      <ul className="flex flex-col gap-2.5">
        {filteredOrders.map((order) => (
          <li key={order.id}>
            <OrderSummaryCard
              href={`/preparacion/${order.id}`}
              orderNumber={order.orderNumber}
              clientName={order.client?.name ?? "Cliente"}
              address={order.client?.address ?? ""}
              dateLabel="Creado"
              dateValue={order.created_at}
              total={order.total}
              status={order.status}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
