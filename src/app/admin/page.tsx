import { requireAdmin } from "@/lib/auth";
import { listUsers } from "@/lib/data/users";
import { getAdminDashboardStats } from "@/lib/data/admin";
import { getPackingProgress } from "@/lib/data/picking";
import { UtilityTile } from "@/components/ui/utility-tile";
import { PackingProgressBar } from "@/components/shared/packing-progress-bar";

export default async function AdminPage() {
  const profile = await requireAdmin();
  const [users, stats, progress] = await Promise.all([
    listUsers(),
    getAdminDashboardStats(),
    getPackingProgress(),
  ]);

  const sellerCount = users.filter((u) => u.role === "seller").length;
  const pickingCount = users.filter((u) => u.role === "picking_packing").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-plate">Admin</p>
        <h1 className="display mt-2 text-3xl">Hola, {profile.full_name.split(" ")[0]}</h1>
        <p className="mt-1 text-xs text-concrete">
          Vista privilegiada: podés entrar a la operación de ventas, de preparación, y administrar
          el equipo.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="field-label">Este mes</p>
        <UtilityTile
          label="Pedidos del mes"
          value={stats.ordersThisMonth}
          href="/admin/pedidos/todos?rango=mes"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="field-label">Hoy</p>
        <div className="grid grid-cols-2 gap-2">
          <UtilityTile
            label="Tiendas por visitar"
            value={stats.storesToVisitToday}
            href="/admin/tiendas?estado=scheduled"
          />
          <UtilityTile
            label="Tiendas visitadas"
            value={stats.storesVisitedToday}
            href="/admin/tiendas?estado=done"
          />
          <UtilityTile
            label="Pedidos ingresados"
            value={stats.ordersToday}
            href="/admin/pedidos/todos?rango=hoy"
          />
          <UtilityTile
            label="Pedidos empacados"
            value={stats.packedToday}
            href="/admin/pedidos/todos?vista=empacados-hoy"
          />
        </div>
        <PackingProgressBar total={progress.total} packed={progress.packed} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="field-label">Equipo</p>
        <div className="grid grid-cols-3 gap-2">
          <UtilityTile
            label="Vendedoras/es"
            value={sellerCount}
            href="/admin/usuarios?rol=seller"
          />
          <UtilityTile label="Picking" value={pickingCount} href="/admin/usuarios?rol=picking_packing" />
          <UtilityTile label="Admins" value={adminCount} href="/admin/usuarios?rol=admin" />
        </div>
      </div>
    </div>
  );
}
