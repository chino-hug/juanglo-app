import Link from "next/link";
import { cn } from "@/lib/cn";

export function PedidosTabs({ active }: { active: "cola" | "todos" }) {
  return (
    <div className="grid grid-cols-2 border border-ink">
      <Link
        href="/admin/pedidos"
        className={cn(
          "py-2 text-center font-mono text-xs font-semibold uppercase tracking-wide",
          active === "cola" ? "bg-ink text-base" : "bg-base text-ink",
        )}
      >
        Cola
      </Link>
      <Link
        href="/admin/pedidos/todos"
        className={cn(
          "border-l border-ink py-2 text-center font-mono text-xs font-semibold uppercase tracking-wide",
          active === "todos" ? "bg-ink text-base" : "bg-base text-ink",
        )}
      >
        Todos los pedidos
      </Link>
    </div>
  );
}
