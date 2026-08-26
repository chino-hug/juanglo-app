import Link from "next/link";
import {
  listDeliveredOrdersForMonth,
  listDeliveredMonthsWithOrders,
  countDeliveredOrdersForYear,
  listDeliveredOrdersForClient,
} from "@/lib/data/picking";
import { listAllClients, getClientOrders } from "@/lib/data/clients";
import { OrderViewTabs } from "@/components/shared/order-view-tabs";
import { OrderSummaryCard } from "@/components/shared/order-summary-card";
import { CardGrid } from "@/components/ui/card-grid";
import { ClientFilterSelect } from "@/components/shared/client-filter-select";
import { UtilityTile } from "@/components/ui/utility-tile";
import { cn } from "@/lib/cn";
import { clientDisplayName } from "@/lib/client-display";

const MONTH_LABELS = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

function buildHref(base: string, params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

export default async function HistoricoDePedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; cliente?: string }>;
}) {
  const { mes, cliente } = await searchParams;

  const now = new Date();
  const defaultMes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [yearStr, monthStr] = (mes ?? defaultMes).split("-");
  const year = Number(yearStr) || now.getFullYear();
  const month = Number(monthStr) || now.getMonth() + 1;

  const clients = await listAllClients();
  const selectedClient = cliente ? clients.find((c) => c.id === cliente) : undefined;
  const clientOrderTotal = cliente ? (await getClientOrders(cliente)).length : null;

  // Selecting a client swaps the month-scoped browser for a flat "all of
  // this client's delivered orders" list — no point paging through months
  // one at a time when you're already looking at a single client.
  let orders;
  let filledMonths: number[] = [];
  let yearTotal = 0;
  if (cliente) {
    orders = await listDeliveredOrdersForClient(cliente);
  } else {
    [orders, filledMonths, yearTotal] = await Promise.all([
      listDeliveredOrdersForMonth(year, month),
      listDeliveredMonthsWithOrders(year),
      countDeliveredOrdersForYear(year),
    ]);
  }

  // Never hide the month you're actually looking at, even if it turns out
  // to be empty (e.g. no orders were delivered that month).
  const visibleMonths = [...new Set([...filledMonths, month])].sort((a, b) => a - b);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="label-plate">Preparación</p>
        <h1 className="display mt-2 text-3xl">Histórico de pedidos</h1>
      </div>

      <OrderViewTabs active="historico" />

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

      {!cliente && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <UtilityTile label={`Entregados en ${year}`} value={yearTotal} />
            <UtilityTile label={`Entregados en ${MONTH_LABELS[month - 1]}`} value={orders.length} />
          </div>

          <div className="flex items-center justify-between">
            <Link
              href={buildHref("/preparacion/pedidos/historico", {
                mes: `${year - 1}-${String(month).padStart(2, "0")}`,
              })}
              className="font-mono text-[10px] uppercase tracking-wide text-concrete underline"
            >
              Año {year - 1}
            </Link>
            <span className="tabular text-sm font-semibold">{year}</span>
            <Link
              href={buildHref("/preparacion/pedidos/historico", {
                mes: `${year + 1}-${String(month).padStart(2, "0")}`,
              })}
              className="font-mono text-[10px] uppercase tracking-wide text-concrete underline"
            >
              Año {year + 1}
            </Link>
          </div>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {visibleMonths.map((m) => (
              <Link
                key={m}
                href={buildHref("/preparacion/pedidos/historico", {
                  mes: `${year}-${String(m).padStart(2, "0")}`,
                })}
                className={cn(
                  "label-plate shrink-0",
                  m === month ? "bg-ink text-base" : "bg-base text-ink",
                )}
              >
                {MONTH_LABELS[m - 1]}
              </Link>
            ))}
          </div>
        </>
      )}

      {orders.length === 0 && (
        <div className="border border-dashed border-steel px-4 py-10 text-center">
          <p className="text-sm text-concrete">
            {cliente ? "Este cliente no tiene pedidos entregados." : "No hay pedidos entregados este mes."}
          </p>
        </div>
      )}

      <CardGrid>
        {orders.map((order) => (
          <li key={order.id}>
            <OrderSummaryCard
              href={`/preparacion/${order.id}`}
              orderNumber={order.orderNumber}
              clientName={order.client?.name ?? "Cliente"}
              address={order.client?.address ?? ""}
              dateLabel="Entregado"
              dateValue={order.deliveredAt}
              total={order.total}
              status={order.status}
              compact={!!cliente}
            />
          </li>
        ))}
      </CardGrid>
    </div>
  );
}
