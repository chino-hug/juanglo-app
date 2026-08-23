import Link from "next/link";
import { cn } from "@/lib/cn";

export function OrderViewTabs({ active }: { active: "todos" | "historico" }) {
  return (
    <div className="grid grid-cols-2 border border-ink">
      <Link
        href="/preparacion/pedidos"
        className={cn(
          "py-2 text-center font-mono text-xs font-semibold uppercase tracking-wide",
          active === "todos" ? "bg-ink text-base" : "bg-base text-ink",
        )}
      >
        Todos los pedidos
      </Link>
      <Link
        href="/preparacion/pedidos/historico"
        className={cn(
          "border-l border-ink py-2 text-center font-mono text-xs font-semibold uppercase tracking-wide",
          active === "historico" ? "bg-ink text-base" : "bg-base text-ink",
        )}
      >
        Histórico
      </Link>
    </div>
  );
}
