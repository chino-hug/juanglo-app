"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSeller } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ClientStatus } from "@/lib/supabase/database.types";
import { MOCK_MODE } from "@/lib/mock/config";
import { mockSaveClient, mockConvertToClient } from "@/lib/mock/mutations";

export async function saveClient(_prevState: string | null, formData: FormData): Promise<string | null> {
  const profile = await requireSeller();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim() || null;
  const businessName = String(formData.get("business_name") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const zoneId = String(formData.get("zone_id") ?? "") || null;
  const status = String(formData.get("status") ?? "prospect") as ClientStatus;
  const fecha = String(formData.get("fecha") ?? "").trim() || null;

  if (!name && !businessName && !phone) {
    return "Ingresá al menos el nombre del negocio, el nombre de contacto o el teléfono.";
  }

  const isNewClient = !id;
  let clientId = id;

  if (MOCK_MODE) {
    const result = mockSaveClient({
      id: id || undefined,
      sellerId: profile.id,
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
      seller_id: profile.id,
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

  revalidatePath("/vendedor/clientes");

  if (isNewClient && fecha) {
    redirect(`/vendedor/citas/nueva?cliente=${clientId}&fecha=${fecha}`);
  }
  redirect(`/vendedor/clientes/${clientId}`);
}

export async function convertToClient(clientId: string) {
  await requireSeller();

  if (MOCK_MODE) {
    mockConvertToClient(clientId);
  } else {
    const supabase = await createClient();
    await supabase.from("clients").update({ status: "client" }).eq("id", clientId);
  }

  revalidatePath(`/vendedor/clientes/${clientId}`);
  revalidatePath("/vendedor/clientes");
}
