"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { IconHome, IconCalendar, IconUsers, IconRoute, IconPackage } from "@/components/ui/icons";

const TABS = [
  { href: "/vendedor", label: "Hoy", Icon: IconHome, exact: true },
  { href: "/vendedor/agenda", label: "Agenda", Icon: IconCalendar, exact: false },
  { href: "/vendedor/clientes", label: "Clientes", Icon: IconUsers, exact: false },
  { href: "/vendedor/ruta", label: "Ruta", Icon: IconRoute, exact: false },
  { href: "/vendedor/pedidos", label: "Pedidos", Icon: IconPackage, exact: false },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink bg-base">
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
