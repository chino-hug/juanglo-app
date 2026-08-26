import { requireAdmin } from "@/lib/auth";
import { listNotifications } from "@/lib/data/notifications";
import { TopBar } from "@/components/shared/top-bar";
import { TabBar } from "@/components/admin/tab-bar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();
  const notifications = await listNotifications(profile.id);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar
        personName={profile.full_name}
        userId={profile.id}
        notifications={notifications}
        notificationsHref="/admin/notificaciones"
        notificationsOrderHrefPrefix="/preparacion"
        wide
      />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-4 md:max-w-3xl lg:max-w-6xl">
        {children}
      </main>
      <TabBar />
    </div>
  );
}
