import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/app/ingresar/actions";
import { NotificationBell } from "./notification-bell";
import { cn } from "@/lib/cn";
import type { NotificationRow } from "@/lib/data/notifications";

export function TopBar({
  personName,
  userId,
  notifications,
  notificationsHref = "/vendedor/notificaciones",
  notificationsOrderHrefPrefix = "/vendedor/pedidos",
  adminReturnHref,
  wide = false,
}: {
  personName: string;
  userId: string;
  notifications: NotificationRow[];
  notificationsHref?: string;
  notificationsOrderHrefPrefix?: string;
  // Set only when an admin is browsing the seller/picking flows — without
  // it they'd land in that role's own nav and have no way back to /admin.
  adminReturnHref?: string;
  // Matches the main content area's breakpoint widening (admin only —
  // seller/picking stay mobile-width by design, see PRODUCT.md).
  wide?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink bg-base">
      <div
        className={cn(
          "mx-auto flex max-w-lg items-center justify-between px-4 py-3",
          wide && "md:max-w-3xl lg:max-w-6xl",
        )}
      >
        <div>
          <p className="flex w-fit items-center gap-1.5">
            <Image src="/logo-mark.png" alt="" width={37} height={60} className="h-[60px] w-auto" aria-hidden />
            <span className="font-mono text-[11px] font-medium uppercase tracking-wide">Juanglo</span>
          </p>
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
