import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { MOCK_MODE } from "@/lib/mock/config";
import { MOCK_SESSION_COOKIE, getMockProfileById } from "@/lib/mock/session";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getCurrentProfile(): Promise<Profile | null> {
  if (MOCK_MODE) {
    const cookieStore = await cookies();
    const id = cookieStore.get(MOCK_SESSION_COOKIE)?.value;
    return getMockProfileById(id) as Profile | null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/ingresar");
  return profile;
}

export async function requireSeller(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "seller" && profile.role !== "admin") redirect("/");
  return profile;
}

export async function requirePicking(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "picking_packing" && profile.role !== "admin") redirect("/");
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/");
  return profile;
}
