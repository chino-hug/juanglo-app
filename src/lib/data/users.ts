import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/database.types";
import { MOCK_MODE } from "@/lib/mock/config";
import { mockListUsers, mockGetUser } from "@/lib/mock/queries";

export interface UserRow {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  cedula: string;
  created_at: string;
}

export async function listUsers(): Promise<UserRow[]> {
  if (MOCK_MODE) return mockListUsers();

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, cedula, created_at")
    .order("full_name", { ascending: true });
  return (data ?? []) as UserRow[];
}

export async function getUser(id: string): Promise<UserRow | null> {
  if (MOCK_MODE) return mockGetUser(id);

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, cedula, created_at")
    .eq("id", id)
    .single();
  return data as UserRow | null;
}
