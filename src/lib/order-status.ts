import type { OrderStatus } from "@/lib/supabase/database.types";

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "created",
  "picking",
  "packed",
  "out_for_delivery",
  "delivered",
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  created: "Creado",
  picking: "En preparación",
  packed: "Empacado",
  out_for_delivery: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const ORDER_STATUS_SHORT: Record<OrderStatus, string> = {
  created: "Creado",
  picking: "Preparando",
  packed: "Empacado",
  out_for_delivery: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const QUEUE_SECTION_LABEL: Record<string, string> = {
  created: "Para preparar",
  picking: "En preparación",
  packed: "Empacado",
  out_for_delivery: "En camino",
};

export function formatOrderNumber(n: number): string {
  return n.toString().padStart(6, "0");
}
