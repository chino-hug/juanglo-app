import Link from "next/link";
import { listOrdersForAdmin, listOrdersPackedToday } from "@/lib/data/orders";
import { getPackingProgress } from "@/lib/data/picking";
import { listAllClients, getClientOrders } from "@/lib/data/clients";
import { OrderSummaryCard } from "@/components/shared/order-summary-card";
import { PackingProgressBar } from "@/components/shared/packing-progress-bar";
import { ClientFilterSelect } from "@/components/shared/client-filter-select";
import { UtilityTile } from "@/components/ui/utility-tile";
import { FilterDisclosure } from "@/components/ui/filter-disclosure";
import { ChipToggle } from "@/components/ui/chip-toggle";
import { PedidosTabs } from "@/components/admin/pedidos-tabs";
import { IconChevronLeft } from "@/components/ui/icons";
import { clientDisplayName } from "@/lib/client-display";
import { formatOrderNumber } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/supabase/database.types";

const ESTADO_FILTERS: { value: OrderStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "created", label: "Creados" },
  { value: "picking", label: "En preparación" },
  { value: "packed", label: "Empacados" },
  { value: "out_for_delivery", label: "En camino" },
  { value: "delivered", label: "Entregados" },
  { value: "cancelled", label: "Cancelados" },
];

const RANGO_FILTERS: { value: "todos" | "mes" | "hoy"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "mes", label: "Este mes" },
  { value: "hoy", label: "Hoy" },
];

function buildHref(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `/admin/pedidos/todos?${qs}` : "/admin/pedidos/todos";
}

function isThisMonth(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default async function AdminPedidosTodosPage({
  searchParams,
}: {
  searchParams: Promise<{
    estado?: string;
    rango?: string;
    vista?: string;
    cliente?: string;
    orden?: string;
  }>;
}) {
  const { estado, rango, vista, cliente, orden } = await searchParams;
  const empacadosHoy = vista === "empacados-hoy";
  const status = (estado as OrderStatus | "todos" | undefined) ?? "todos";
  const range = (rango as "todos" | "mes" | "hoy" | undefined) ?? "todos";
  const numberQuery = orden?.trim();

  const [orders, ordersForEstadoFacet, ordersForRangoFacet, progress, clients] = await Promise.all([
    empacadosHoy
      ? listOrdersPackedToday()
      : listOrdersForAdmin({ estado: status, rango: range, clientId: cliente }),
    empacadosHoy
      ? Promise.resolve([])
      : listOrdersForAdmin({ rango: range, clientId: cliente }),
    empacadosHoy ? Promise.resolve([]) : listOrdersForAdmin({ estado: status, clientId: cliente }),
    getPackingProgress(),
    listAllClients(),
  ]);

  const filteredOrders = numberQuery
    ? orders.filter((o) => formatOrderNumber(o.orderNumber).includes(numberQuery))
    : orders;

  const selectedClient = !empacadosHoy && cliente ? clients.find((c) => c.id === cliente) : undefined;
  const clientOrderTotal = selectedClient ? (await getClientOrders(selectedClient.id)).length : null;

  const estadoCount = (value: OrderStatus | "todos") =>
    value === "todos"
      ? ordersForEstadoFacet.length
      : ordersForEstadoFacet.filter((o) => o.status === value).length;

  const rangoHasMatch = (value: "todos" | "mes" | "hoy") => {
    if (value === "todos") return ordersForRangoFacet.length > 0;
    if (value === "mes") return ordersForRangoFacet.some((o) => isThisMonth(o.created_at));
    return ordersForRangoFacet.some((o) => isToday(o.created_at));
  };

  const title = empacadosHoy
    ? "Empacados hoy"
    : range === "mes"
      ? "Pedidos de este mes"
      : range === "hoy"
        ? "Pedidos de hoy"
        : "Todos los pedidos";

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin" className="flex items-center gap-1 font-mono text-xs text-concrete">
        <IconChevronLeft width={16} height={16} />
        Resumen
      </Link>

      <div>
        <p className="label-plate">Admin</p>
        <h1 className="display mt-2 text-3xl">{title}</h1>
        <p className="mt-1 text-xs text-concrete">
          {filteredOrders.length} pedido{filteredOrders.length === 1 ? "" : "s"}
        </p>
      </div>

      <PedidosTabs active="todos" />

      <PackingProgressBar total={progress.total} packed={progress.packed} />

      {empacadosHoy ? (
        <Link href="/admin/pedidos/todos" className="label-plate w-fit bg-base text-ink">
          Ver todos los pedidos
        </Link>
      ) : (
        <>
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
            {range !== "todos" && <input type="hidden" name="rango" value={range} />}
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
            label="Rango"
            summary={RANGO_FILTERS.find((f) => f.value === range)?.label ?? "Todos"}
            defaultOpen={range !== "todos"}
          >
            {RANGO_FILTERS.map((f) => (
              <ChipToggle
                key={f.value}
                href={buildHref({
                  rango: f.value === "todos" ? undefined : f.value,
                  estado,
                  cliente,
                  orden,
                })}
                label={f.label}
                selected={range === f.value}
                disabled={f.value !== "todos" && !rangoHasMatch(f.value)}
              />
            ))}
          </FilterDisclosure>

          <FilterDisclosure
            label="Estado"
            summary={ESTADO_FILTERS.find((f) => f.value === status)?.label ?? "Todos"}
            defaultOpen={status !== "todos"}
          >
            {ESTADO_FILTERS.map((f) => (
              <ChipToggle
                key={f.value}
                href={buildHref({
                  estado: f.value === "todos" ? undefined : f.value,
                  rango,
                  cliente,
                  orden,
                })}
                label={`${f.label} · ${estadoCount(f.value)}`}
                selected={status === f.value}
                disabled={f.value !== "todos" && estadoCount(f.value) === 0}
              />
            ))}
          </FilterDisclosure>
        </>
      )}

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
