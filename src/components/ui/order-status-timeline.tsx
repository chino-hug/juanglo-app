import { cn } from "@/lib/cn";
import { ORDER_STATUS_SEQUENCE, ORDER_STATUS_LABEL } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/supabase/database.types";

export function OrderStatusTimeline({
  currentStatus,
  history,
}: {
  currentStatus: OrderStatus;
  history: { status: OrderStatus; changed_at: string }[];
}) {
  const timeByStatus = new Map(history.map((h) => [h.status, h.changed_at]));
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(currentStatus);
  const isCancelled = currentStatus === "cancelled";

  return (
    <ol className="flex flex-col">
      {ORDER_STATUS_SEQUENCE.map((status, i) => {
        const reached = !isCancelled && i <= currentIndex;
        const isCurrent = !isCancelled && i === currentIndex;
        const timestamp = timeByStatus.get(status);

        return (
          <li key={status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "h-3 w-3 rounded-full border border-ink",
                  reached ? "bg-ink" : "bg-base",
                  isCurrent && "bg-safety border-safety",
                )}
              />
              {i < ORDER_STATUS_SEQUENCE.length - 1 && (
                <span className={cn("w-px flex-1", reached ? "bg-ink" : "bg-steel")} />
              )}
            </div>
            <div className="pb-5">
              <p
                className={cn(
                  "font-mono text-sm font-semibold uppercase tracking-wide",
                  reached ? "text-ink" : "text-concrete",
                )}
              >
                {ORDER_STATUS_LABEL[status]}
              </p>
              {timestamp && (
                <p className="tabular text-xs text-concrete">
                  {new Date(timestamp).toLocaleString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </p>
              )}
            </div>
          </li>
        );
      })}
      {isCancelled && (
        <li className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full border border-ink bg-concrete" />
          <p className="font-mono text-sm font-semibold uppercase tracking-wide text-concrete">
            {ORDER_STATUS_LABEL.cancelled}
          </p>
        </li>
      )}
    </ol>
  );
}
