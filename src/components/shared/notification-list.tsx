"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MOCK_MODE } from "@/lib/mock/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LabelPlate } from "@/components/ui/label-plate";
import { IconAlertNote } from "@/components/ui/icons";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import { formatOrderNumber } from "@/lib/order-status";
import { NOTIFICATION_TYPE_LABEL } from "@/lib/notification-copy";
import { cn } from "@/lib/cn";
import type { NotificationRow } from "@/lib/data/notifications";

export function NotificationList({
  userId,
  initial,
  orderHrefPrefix = "/vendedor/pedidos",
}: {
  userId: string;
  initial: NotificationRow[];
  orderHrefPrefix?: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (MOCK_MODE) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          setItems((prev) => [payload.new as NotificationRow, ...prev]);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const updated = payload.new as NotificationRow;
          setItems((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = items.filter((n) => !n.read).length;

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    startTransition(async () => {
      await markNotificationRead(id);
      router.refresh();
    });
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {unreadCount > 0 && (
        <Button variant="secondary" onClick={markAllRead} className="self-start">
          Marcar todo como leído
        </Button>
      )}

      {items.length === 0 && (
        <div className="border border-dashed border-steel px-4 py-10 text-center">
          <p className="text-sm text-concrete">No tenés notificaciones todavía.</p>
        </div>
      )}

      <ul className="flex flex-col gap-2.5">
        {items.map((notification) => {
          const isIssue = notification.type === "order_item_issue";
          const content = (
            <Card attention={!notification.read} className="flex flex-col gap-1 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide",
                    isIssue ? "text-safety" : "text-concrete",
                  )}
                >
                  {isIssue && <IconAlertNote width={12} height={12} />}
                  {NOTIFICATION_TYPE_LABEL[notification.type] ?? notification.type}
                </span>
                <span className="tabular text-[10px] text-concrete">
                  {new Date(notification.created_at).toLocaleString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </span>
              </div>

              {(notification.clientName || notification.orderNumber) && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {notification.clientName && (
                    <span className="text-xs font-semibold">{notification.clientName}</span>
                  )}
                  {notification.orderNumber && (
                    <LabelPlate className="text-[9px]">
                      N.º {formatOrderNumber(notification.orderNumber)}
                    </LabelPlate>
                  )}
                </div>
              )}

              <p className={notification.read ? "text-sm text-concrete" : "text-sm font-semibold"}>
                {notification.title}
              </p>
              {notification.body && <p className="text-xs text-concrete">{notification.body}</p>}
            </Card>
          );

          return (
            <li key={notification.id}>
              {notification.order_id ? (
                <Link
                  href={`${orderHrefPrefix}/${notification.order_id}`}
                  onClick={() => !notification.read && markRead(notification.id)}
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => !notification.read && markRead(notification.id)}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
