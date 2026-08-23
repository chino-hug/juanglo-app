import Link from "next/link";
import { Card } from "@/components/ui/card";
import { OrderStatusTag } from "@/components/ui/order-status-tag";
import { formatOrderNumber } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/supabase/database.types";

export function OrderSummaryCard({
  href,
  orderNumber,
  clientName,
  address,
  dateLabel,
  dateValue,
  total,
  status,
  compact = false,
}: {
  href: string;
  orderNumber: number;
  clientName: string;
  address: string;
  dateLabel: string;
  dateValue: string;
  total: number;
  status: OrderStatus;
  compact?: boolean;
}) {
  // Compact drops the client (already the whole list's context) and the
  // status tag (histórico is delivered-only by definition) so more rows of
  // a single client's order history fit on screen at once.
  if (compact) {
    return (
      <Link href={href}>
        <Card className="flex items-center justify-between gap-3 p-2.5">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-wide text-concrete">
              N.º {formatOrderNumber(orderNumber)}
            </p>
            <p className="tabular text-sm">
              {dateLabel} {new Date(dateValue).toLocaleDateString("es-AR")}
            </p>
          </div>
          <p className="tabular text-sm font-semibold">
            ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </p>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={href}>
      <Card className="flex items-center justify-between gap-3 p-3.5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-wide text-concrete">
            N.º {formatOrderNumber(orderNumber)}
          </p>
          <p className="display truncate text-lg">{clientName}</p>
          <p className="truncate text-xs text-concrete">{address}</p>
          <p className="tabular mt-0.5 text-xs text-concrete">
            {dateLabel} {new Date(dateValue).toLocaleDateString("es-AR")} · $
            {total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <OrderStatusTag status={status} />
      </Card>
    </Link>
  );
}
