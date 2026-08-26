"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MOCK_MODE } from "@/lib/mock/config";
import { LabelPlate } from "@/components/ui/label-plate";
import { IconBell, IconAlertNote } from "@/components/ui/icons";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import { formatOrderNumber } from "@/lib/order-status";
import { NOTIFICATION_TYPE_LABEL } from "@/lib/notification-copy";
import { cn } from "@/lib/cn";
import type { NotificationRow } from "@/lib/data/notifications";

const DROPDOWN_LIMIT = 8;

export function NotificationBell({
  userId,
  initialNotifications,
  href = "/vendedor/notificaciones",
  orderHrefPrefix = "/vendedor/pedidos",
}: {
  userId: string;
  initialNotifications: NotificationRow[];
  href?: string;
  orderHrefPrefix?: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialNotifications);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((n) => !n.read).length;

  useEffect(() => {
    if (MOCK_MODE) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`notification-bell-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => setItems((prev) => [payload.new as NotificationRow, ...prev]),
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

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

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

  const visible = items.slice(0, DROPDOWN_LIMIT);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : "Notificaciones"}
        className="relative flex h-10 w-10 items-center justify-center border border-ink"
      >
        <IconBell />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center bg-safety px-1 font-mono text-[10px] font-bold text-ink">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 flex max-h-[min(70vh,calc(100vh-11rem))] w-80 max-w-[calc(100vw-2rem)] flex-col border border-ink bg-base shadow-card">
          <div className="flex items-center justify-between gap-2 border-b border-ink px-3.5 py-2.5">
            <span className="field-label">Notificaciones</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="font-mono text-[11px] text-concrete underline decoration-dotted hover:text-ink"
              >
                Marcar todo como leído
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <p className="px-3.5 py-8 text-center text-sm text-concrete">
              No tenés notificaciones todavía.
            </p>
          ) : (
            <ul className="flex flex-col overflow-y-auto">
              {visible.map((notification) => {
                const isIssue = notification.type === "order_item_issue";
                const content = (
                  <div className="flex flex-col gap-1 border-b border-steel-light px-3.5 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide",
                          isIssue ? "text-safety" : "text-concrete",
                        )}
                      >
                        {isIssue && <IconAlertNote width={11} height={11} />}
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
                  </div>
                );

                return (
                  <li key={notification.id}>
                    {notification.order_id ? (
                      <Link
                        href={`${orderHrefPrefix}/${notification.order_id}`}
                        onClick={() => {
                          if (!notification.read) markRead(notification.id);
                          setOpen(false);
                        }}
                        className="block hover:bg-steel-light"
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="block w-full text-left hover:bg-steel-light"
                        onClick={() => !notification.read && markRead(notification.id)}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href={href}
            onClick={() => setOpen(false)}
            className="border-t border-ink px-3.5 py-2.5 text-center font-mono text-xs uppercase tracking-wide hover:bg-steel-light"
          >
            Ver todas
          </Link>
        </div>
      )}
    </div>
  );
}
