import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Not parameterized with Database — see the note in ./client.ts.
// rememberSession: false drops maxAge/expires from the auth cookies Supabase
// writes so the session ends with the browser, instead of persisting — used
// by the "Recordarme" checkbox on sign-in.
export async function createClient(options?: { rememberSession?: boolean }) {
  const cookieStore = await cookies();
  const rememberSession = options?.rememberSession ?? true;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
              const finalOptions = { ...cookieOptions };
              if (!rememberSession) {
                delete finalOptions.maxAge;
                delete finalOptions.expires;
              }
              cookieStore.set(name, value, finalOptions);
            });
          } catch {
            // called from a Server Component; middleware refreshes the session instead
          }
        },
      },
    },
  );
}
