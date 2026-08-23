import { createBrowserClient } from "@supabase/ssr";

// Not parameterized with Database: hand-written types in ./database.types
// don't match supabase-js's current generated-schema generic shape closely
// enough for insert/update inference (no live project to run codegen
// against yet). Data-fetching functions cast reads to those types instead;
// see database.types.ts.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
