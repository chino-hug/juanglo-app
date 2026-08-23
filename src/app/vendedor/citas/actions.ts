"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSeller } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { listBookedTimesForDate } from "@/lib/data/appointments";
import { MOCK_MODE } from "@/lib/mock/config";
import {
  mockSaveAppointment,
  mockCancelAppointment,
  mockCompleteAppointment,
} from "@/lib/mock/mutations";

export async function getBookedTimes(date: string): Promise<string[]> {
  const profile = await requireSeller();
  if (!date) return [];
  return listBookedTimesForDate(profile.id, date);
}

export async function saveAppointment(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const profile = await requireSeller();

  const clientId = String(formData.get("client_id") ?? "");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!clientId || !date || !time) {
    return "Completá el cliente, la fecha y la hora.";
  }

  const scheduledAt = new Date(`${date}T${time}:00`);
  if (Number.isNaN(scheduledAt.getTime())) {
    return "La fecha u hora no son válidas.";
  }

  if (MOCK_MODE) {
    mockSaveAppointment({
      clientId,
      sellerId: profile.id,
      scheduledAt: scheduledAt.toISOString(),
      notes,
    });
  } else {
    const supabase = await createClient();
    const { error } = await supabase.from("appointments").insert({
      client_id: clientId,
      seller_id: profile.id,
      scheduled_at: scheduledAt.toISOString(),
      notes,
      status: "scheduled",
    });
    if (error) return "No se pudo agendar la visita.";
  }

  revalidatePath("/vendedor/citas");
  revalidatePath("/vendedor/agenda");
  revalidatePath("/vendedor");
  revalidatePath("/admin");
  redirect(`/vendedor/clientes/${clientId}`);
}

export async function cancelAppointment(id: string, clientId: string) {
  await requireSeller();

  if (MOCK_MODE) {
    mockCancelAppointment(id);
  } else {
    const supabase = await createClient();
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
  }

  revalidatePath("/vendedor/citas");
  revalidatePath("/vendedor/agenda");
  revalidatePath("/vendedor");
  revalidatePath(`/vendedor/clientes/${clientId}`);
  revalidatePath("/admin");
}

export async function completeAppointment(id: string, clientId: string) {
  await requireSeller();

  if (MOCK_MODE) {
    mockCompleteAppointment(id);
  } else {
    const supabase = await createClient();
    await supabase.from("appointments").update({ status: "done" }).eq("id", id);
  }

  revalidatePath("/vendedor/citas");
  revalidatePath("/vendedor/agenda");
  revalidatePath("/vendedor");
  revalidatePath(`/vendedor/clientes/${clientId}`);
  revalidatePath("/admin");
}
