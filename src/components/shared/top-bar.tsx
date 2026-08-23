import Link from "next/link";
import { signOut } from "@/app/ingresar/actions";
import { NotificationBell } from "./notification-bell";
import type { NotificationRow } from "@/lib/data/notifications";

export function TopBar({
  personName,
  userId,
  notifications,
  notificationsHref = "/vendedor/notificaciones",
  notificationsOrderHrefPrefix = "/vendedor/pedidos",
  adminReturnHref,
}: {
  personName: string;
  userId: string;
  notifications: NotificationRow[];
  notificationsHref?: string;
  notificationsOrderHrefPrefix?: string;
  // Set only when an admin is browsing the seller/picking flows — without
  // it they'd land in that role's own nav and have no way back to /admin.
  adminReturnHref?: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink bg-base">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div>
          <p className="label-plate">Velas</p>
          <form action={signOut}>
            <button
              type="submit"
              className="mt-1 font-mono text-[11px] text-concrete underline decoration-dotted"
            >
              {personName} · salir
            </button>
          </form>
          {adminReturnHref && (
            <Link
              href={adminReturnHref}
              className="mt-0.5 block font-mono text-[11px] text-safety underline decoration-dotted"
            >
              ← Volver a Admin
            </Link>
          )}
        </div>
        <NotificationBell
          userId={userId}
          initialNotifications={notifications}
          href={notificationsHref}
          orderHrefPrefix={notificationsOrderHrefPrefix}
        />
      </div>
    </header>
  );
}
