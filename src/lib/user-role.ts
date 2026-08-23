import type { UserRole } from "@/lib/supabase/database.types";

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Administrador/a",
  seller: "Vendedor/a",
  picking_packing: "Picking & Packing",
};

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "seller", label: ROLE_LABEL.seller },
  { value: "picking_packing", label: ROLE_LABEL.picking_packing },
  { value: "admin", label: ROLE_LABEL.admin },
];
