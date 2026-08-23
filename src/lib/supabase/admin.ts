import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for privileged operations the anon/authenticated
// client can never do — creating or deleting auth.users rows. Only ever
// imported from admin server actions; the key must never reach the browser.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Falta configurar SUPABASE_SERVICE_ROLE_KEY para crear o eliminar usuarios.",
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
