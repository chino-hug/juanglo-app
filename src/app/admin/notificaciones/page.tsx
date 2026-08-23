import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { listNotifications } from "@/lib/data/notifications";
import { IconChevronLeft } from "@/components/ui/icons";
import { NotificationList } from "@/components/shared/notification-list";

export default async function AdminNotificacionesPage() {
  const profile = await requireProfile();
  const notifications = await listNotifications(profile.id);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin" className="flex items-center gap-1 font-mono text-xs text-concrete">
        <IconChevronLeft width={16} height={16} />
        Resumen
      </Link>
      <div>
        <p className="label-plate">Admin</p>
        <h1 className="display mt-2 text-3xl">Notificaciones</h1>
      </div>
      <NotificationList userId={profile.id} initial={notifications} orderHrefPrefix="/preparacion" />
    </div>
  );
}
