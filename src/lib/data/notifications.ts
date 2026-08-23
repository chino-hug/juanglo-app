import { createClient } from "@/lib/supabase/server";
import { MOCK_MODE } from "@/lib/mock/config";
import { mockListNotifications } from "@/lib/mock/queries";

export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  order_id: string | null;
  appointment_id: string | null;
  read: boolean;
  created_at: string;
  clientName: string | null;
  orderNumber: number | null;
}

export async function listNotifications(userId: string): Promise<NotificationRow[]> {
  if (MOCK_MODE) return mockListNotifications(userId);

  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*, order:orders(order_number, client:clients(name))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return ((data ?? []) as unknown as Array<
    Omit<NotificationRow, "clientName" | "orderNumber"> & {
      order: { order_number: number; client: { name: string | null } | null } | null;
    }
  >).map((n) => ({
    ...n,
    clientName: n.order?.client?.name ?? null,
    orderNumber: n.order?.order_number ?? null,
  }));
}
