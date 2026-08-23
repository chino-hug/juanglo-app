import { requireSeller } from "@/lib/auth";
import { listNotifications } from "@/lib/data/notifications";
import { TopBar } from "@/components/shared/top-bar";
import { TabBar } from "@/components/seller/tab-bar";

export default async function VendedorLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireSeller();
  const notifications = await listNotifications(profile.id);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar
        personName={profile.full_name}
        userId={profile.id}
        notifications={notifications}
        adminReturnHref={profile.role === "admin" ? "/admin" : undefined}
      />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-4">{children}</main>
      <TabBar />
    </div>
  );
}
