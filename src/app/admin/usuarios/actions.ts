"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/supabase/database.types";
import { MOCK_MODE } from "@/lib/mock/config";
import { mockCreateUser, mockUpdateUser, mockDeleteUser } from "@/lib/mock/mutations";

const VALID_ROLES: UserRole[] = ["admin", "seller", "picking_packing"];

function isDuplicateError(message: string): boolean {
  return message.toLowerCase().includes("duplicate");
}

export async function saveUser(_prevState: string | null, formData: FormData): Promise<string | null> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const cedula = String(formData.get("cedula") ?? "").trim();
  const role = String(formData.get("role") ?? "") as UserRole;
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !cedula || !role) {
    return "Completá nombre, correo, cédula y cargo.";
  }
  if (!VALID_ROLES.includes(role)) {
    return "Cargo inválido.";
  }
  if (!id && !password) {
    return "La contraseña es obligatoria para un usuario nuevo.";
  }
  if (password && password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }

  let userId = id;

  if (MOCK_MODE) {
    const result = id
      ? mockUpdateUser({ id, fullName, email, cedula, role })
      : mockCreateUser({ fullName, email, cedula, role });
    if ("error" in result) return result.error;
    userId = result.id;
  } else {
    const admin = createAdminClient();

    if (id) {
      const { error } = await admin
        .from("profiles")
        .update({ full_name: fullName, email, cedula, role })
        .eq("id", id);
      if (error) return isDuplicateError(error.message) ? "Ese correo o cédula ya está en uso." : "No se pudo actualizar el usuario.";

      const authUpdate: { email?: string; password?: string } = { email };
      if (password) authUpdate.password = password;
      const { error: authError } = await admin.auth.admin.updateUserById(id, authUpdate);
      if (authError) return "El usuario se actualizó, pero no se pudo sincronizar el acceso.";
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });
      if (error || !data.user) {
        return error && isDuplicateError(error.message)
          ? "Ya existe un usuario con ese correo."
          : "No se pudo crear el usuario.";
      }

      const { error: updateError } = await admin
        .from("profiles")
        .update({ full_name: fullName, cedula, role })
        .eq("id", data.user.id);
      if (updateError) {
        return isDuplicateError(updateError.message)
          ? "El usuario se creó, pero esa cédula ya está en uso por otro usuario."
          : "El usuario se creó, pero no se pudo asignar cargo/cédula.";
      }
      userId = data.user.id;
    }
  }

  revalidatePath("/admin/usuarios");
  redirect(`/admin/usuarios/${userId}`);
}

export async function deleteUser(id: string): Promise<string | null> {
  const profile = await requireAdmin();

  if (id === profile.id) {
    return "No podés eliminar tu propio usuario.";
  }

  if (MOCK_MODE) {
    const result = mockDeleteUser(id);
    if (result?.error) return result.error;
  } else {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return "No se pudo eliminar el usuario.";
  }

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}
