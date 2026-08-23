import { getStore } from "./store";
import type { MockProfile } from "./store";

export const MOCK_SESSION_COOKIE = "velas_mock_session";
// Every seeded demo user shares this password (see supabase/seed.sql).
const MOCK_PASSWORD = "velas1234";

export function mockSignIn(email: string, password: string): MockProfile | null {
  if (password !== MOCK_PASSWORD) return null;
  const store = getStore();
  return store.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function getMockProfileById(id: string | undefined | null): MockProfile | null {
  if (!id) return null;
  const store = getStore();
  return store.profiles.find((p) => p.id === id) ?? null;
}
