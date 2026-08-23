import { cn } from "@/lib/cn";
import { ORDER_STATUS_SHORT } from "@/lib/order-status";
import {
  IconPlus,
  IconClock,
  IconPackage,
  IconTruck,
  IconCheckCircle,
  IconTrash,
} from "@/components/ui/icons";
import type { OrderStatus } from "@/lib/supabase/database.types";
import type { ComponentType, SVGProps } from "react";

const STATUS_STYLE: Record<
  OrderStatus,
  { bg: string; ink: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }
> = {
  created: { bg: "bg-status-created", ink: "text-status-created-ink", Icon: IconPlus },
  picking: { bg: "bg-status-picking", ink: "text-status-picking-ink", Icon: IconClock },
  packed: { bg: "bg-status-packed", ink: "text-status-packed-ink", Icon: IconPackage },
  out_for_delivery: {
    bg: "bg-status-out-for-delivery",
    ink: "text-status-out-for-delivery-ink",
    Icon: IconTruck,
  },
  delivered: { bg: "bg-status-delivered", ink: "text-status-delivered-ink", Icon: IconCheckCircle },
  cancelled: { bg: "bg-status-cancelled", ink: "text-status-cancelled-ink", Icon: IconTrash },
};

export function OrderStatusTag({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const { bg, ink, Icon } = STATUS_STYLE[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide",
        bg,
        ink,
        className,
      )}
    >
      <Icon width={12} height={12} className="shrink-0" />
      {ORDER_STATUS_SHORT[status]}
    </span>
  );
}
