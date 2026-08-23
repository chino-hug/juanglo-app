import { cn } from "@/lib/cn";
import type { ClientStatus } from "@/lib/supabase/database.types";

const LABEL: Record<ClientStatus, string> = {
  prospect: "Prospecto",
  scheduled: "Agendado",
  client: "Cliente",
};

export function ClientStatusTag({ status }: { status: ClientStatus }) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] font-semibold uppercase tracking-wide",
        status === "client" && "text-ink",
        status === "scheduled" && "text-safety",
        status === "prospect" && "text-concrete",
      )}
    >
      {LABEL[status]}
    </span>
  );
}
