"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MOCK_MODE } from "@/lib/mock/config";
import { MOCK_SESSION_COOKIE, mockSignIn } from "@/lib/mock/session";

export async function signIn(_prevState: string | null, formData: FormData): Promise<string | null> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  if (!email || !password) {
    return "Ingresá tu correo y contraseña.";
  }

  if (MOCK_MODE) {
    const profile = mockSignIn(email, password);
    if (!profile) return "Correo o contraseña incorrectos.";

    const cookieStore = await cookies();
    cookieStore.set(MOCK_SESSION_COOKIE, profile.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      ...(remember ? { maxAge: 60 * 60 * 24 * 7 } : {}),
    });
    redirect("/");
  }

  const supabase = await createClient({ rememberSession: remember });
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return "Correo o contraseña incorrectos.";
  }

  redirect("/");
}

export async function signOut() {
  if (MOCK_MODE) {
    const cookieStore = await cookies();
    cookieStore.delete(MOCK_SESSION_COOKIE);
  } else {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/ingresar");
}
