"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MOCK_MODE } from "@/lib/mock/config";
import { mockMarkNotificationRead, mockMarkAllNotificationsRead } from "@/lib/mock/mutations";

function revalidateNotifications() {
  revalidatePath("/vendedor/notificaciones");
  revalidatePath("/preparacion/notificaciones");
}

export async function markNotificationRead(id: string) {
  await requireProfile();

  if (MOCK_MODE) {
    mockMarkNotificationRead(id);
  } else {
    const supabase = await createClient();
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }

  revalidateNotifications();
}

export async function markAllNotificationsRead() {
  const profile = await requireProfile();

  if (MOCK_MODE) {
    mockMarkAllNotificationsRead(profile.id);
  } else {
    const supabase = await createClient();
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", profile.id)
      .eq("read", false);
  }

  revalidateNotifications();
}
