"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MOCK_MODE } from "@/lib/mock/config";
import { mockUpdateZone } from "@/lib/mock/mutations";
import type { ZoneRegion } from "@/lib/supabase/database.types";
import { ZONE_REGIONS } from "@/lib/zone-region";

export async function updateZone(_prevState: string | null, formData: FormData): Promise<string | null> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const city = String(formData.get("city") ?? "").trim() || null;
  const regionRaw = String(formData.get("region") ?? "").trim();
  const region = (ZONE_REGIONS as string[]).includes(regionRaw) ? (regionRaw as ZoneRegion) : null;

  if (!id) return "Zona inválida.";

  if (MOCK_MODE) {
    const result = mockUpdateZone(id, { city, region });
    if (result?.error) return result.error;
  } else {
    const supabase = await createClient();
    const { error } = await supabase.from("zones").update({ city, region }).eq("id", id);
    if (error) return "No se pudo guardar la zona.";
  }

  revalidatePath("/admin/clientes/zonas");
  revalidatePath("/admin/clientes");
  revalidatePath("/vendedor/clientes");
  redirect("/admin/clientes/zonas");
}
