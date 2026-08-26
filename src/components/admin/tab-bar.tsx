"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useAnyDropdownOpen } from "@/lib/dropdown-overlay";
import { IconHome, IconUsers, IconMapPin, IconPackage, IconList } from "@/components/ui/icons";

const TABS = [
  { href: "/admin", label: "Resumen", Icon: IconHome, exact: true },
  { href: "/admin/usuarios", label: "Usuarios", Icon: IconUsers, exact: false },
  { href: "/admin/productos", label: "Productos", Icon: IconList, exact: false },
  { href: "/admin/clientes", label: "Clientes", Icon: IconMapPin, exact: false },
  { href: "/admin/pedidos", label: "Pedidos", Icon: IconPackage, exact: false },
];

export function TabBar() {
  const pathname = usePathname();
  const hidden = useAnyDropdownOpen();

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-ink bg-base transition-transform duration-150",
        hidden && "translate-y-full",
      )}
    >
      <ul className="mx-auto flex max-w-lg">
        {TABS.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
                  active ? "bg-ink text-base" : "text-ink",
                )}
              >
                <Icon width={18} height={18} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
