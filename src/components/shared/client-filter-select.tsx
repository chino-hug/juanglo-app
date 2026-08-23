"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
import type { ClientOption } from "@/lib/data/clients";
import { clientDisplayName } from "@/lib/client-display";

export function ClientFilterSelect({ clients, value }: { clients: ClientOption[]; value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("cliente", next);
    else params.delete("cliente");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select
      id="cliente"
      name="cliente"
      value={value}
      onChange={handleChange}
      placeholder="Todos los clientes"
      options={[
        { value: "", label: "Todos los clientes" },
        ...clients.map((c) => ({ value: c.id, label: clientDisplayName(c) })),
      ]}
    />
  );
}
