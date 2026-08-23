"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ClientStatus } from "@/lib/supabase/database.types";
import { MOCK_MODE } from "@/lib/mock/config";
import { mockSaveClient, mockConvertToClient } from "@/lib/mock/mutations";

function revalidateClientPaths() {
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/tiendas");
  revalidatePath("/vendedor/clientes");
}

export async function saveClientForAdmin(_prevState: string | null, formData: FormData): Promise<string | null> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const sellerId = String(formData.get("seller_id") ?? "");
  const name = String(formData.get("name") ?? "").trim() || null;
  const businessName = String(formData.get("business_name") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const zoneId = String(formData.get("zone_id") ?? "") || null;
  const status = String(formData.get("status") ?? "prospect") as ClientStatus;

  if (!sellerId) return "Elegí a qué vendedor pertenece este cliente.";
  if (!name && !businessName && !phone) {
    return "Ingresá al menos el nombre del negocio, el nombre de contacto o el teléfono.";
  }

  let clientId = id;

  if (MOCK_MODE) {
    const result = mockSaveClient({
      id: id || undefined,
      sellerId,
      name,
      businessName,
      address,
      phone,
      email,
      notes,
      zoneId,
      status,
    });
    clientId = result.id;
  } else {
    const supabase = await createClient();
    const payload = {
      name,
      business_name: businessName,
      address,
      phone,
      email,
      notes,
      zone_id: zoneId,
      status,
      seller_id: sellerId,
    };

    if (id) {
      const { error } = await supabase.from("clients").update(payload).eq("id", id);
      if (error) return "No se pudo guardar el cliente.";
    } else {
      const { data, error } = await supabase.from("clients").insert(payload).select("id").single();
      if (error || !data) return "No se pudo crear el cliente.";
      clientId = data.id;
    }
  }

  revalidateClientPaths();
  redirect(`/admin/clientes/${clientId}`);
}

export async function convertToClientAdmin(clientId: string) {
  await requireAdmin();

  if (MOCK_MODE) {
    mockConvertToClient(clientId);
  } else {
    const supabase = await createClient();
    await supabase.from("clients").update({ status: "client" }).eq("id", clientId);
  }

  revalidatePath(`/admin/clientes/${clientId}`);
  revalidatePath("/admin/clientes");
}
