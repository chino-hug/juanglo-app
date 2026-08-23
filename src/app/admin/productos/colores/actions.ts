"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MOCK_MODE } from "@/lib/mock/config";
import { mockCreateColor, mockUpdateColor, mockDeleteColor } from "@/lib/mock/mutations";

function isDuplicateName(message: string): boolean {
  return message.toLowerCase().includes("duplicate");
}

export async function saveColor(_prevState: string | null, formData: FormData): Promise<string | null> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!name) return "El nombre es obligatorio.";

  let colorId = id;

  if (MOCK_MODE) {
    const result = id ? mockUpdateColor(id, name) : mockCreateColor(name);
    if ("error" in result) return result.error;
    colorId = result.id;
  } else {
    const supabase = await createClient();

    if (id) {
      const { data: existing } = await supabase.from("product_colors").select("name").eq("id", id).single();

      const { error } = await supabase.from("product_colors").update({ name }).eq("id", id);
      if (error) {
        return isDuplicateName(error.message) ? "Ya existe un color con ese nombre." : "No se pudo actualizar el color.";
      }

      // Categories and products reference colors by name, not id — keep
      // every palette that includes the old name pointing at the new one.
      if (existing && existing.name !== name) {
        const { data: categories } = await supabase.from("product_categories").select("id, colors");
        for (const category of categories ?? []) {
          const colors = category.colors as string[];
          const index = colors.indexOf(existing.name);
          if (index !== -1) {
            const updated = [...colors];
            updated[index] = name;
            await supabase.from("product_categories").update({ colors: updated }).eq("id", category.id);
          }
        }

        const { data: products } = await supabase.from("products").select("id, colors");
        for (const product of products ?? []) {
          const colors = product.colors as string[];
          const index = colors.indexOf(existing.name);
          if (index !== -1) {
            const updated = [...colors];
            updated[index] = name;
            await supabase.from("products").update({ colors: updated }).eq("id", product.id);
          }
        }
      }
    } else {
      const { data, error } = await supabase.from("product_colors").insert({ name }).select("id").single();
      if (error || !data) {
        return error && isDuplicateName(error.message) ? "Ya existe un color con ese nombre." : "No se pudo crear el color.";
      }
      colorId = data.id;
    }
  }

  revalidatePath("/admin/productos");
  revalidatePath("/admin/productos/todos");
  revalidatePath("/admin/productos/categorias");
  revalidatePath("/admin/productos/colores");
  redirect(`/admin/productos/colores/${colorId}`);
}

export async function deleteColor(id: string): Promise<string | null> {
  await requireAdmin();

  if (MOCK_MODE) {
    const result = mockDeleteColor(id);
    if (result?.error) return result.error;
  } else {
    const supabase = await createClient();
    const { data: color } = await supabase.from("product_colors").select("name").eq("id", id).single();

    // Deleting a color always succeeds — it just disappears from every
    // category and product palette that had it selected.
    if (color) {
      const { data: categories } = await supabase.from("product_categories").select("id, colors");
      for (const category of categories ?? []) {
        const colors = category.colors as string[];
        if (colors.includes(color.name)) {
          await supabase
            .from("product_categories")
            .update({ colors: colors.filter((c) => c !== color.name) })
            .eq("id", category.id);
        }
      }

      const { data: products } = await supabase.from("products").select("id, colors");
      for (const product of products ?? []) {
        const colors = product.colors as string[];
        if (colors.includes(color.name)) {
          await supabase
            .from("products")
            .update({ colors: colors.filter((c) => c !== color.name) })
            .eq("id", product.id);
        }
      }
    }

    const { error } = await supabase.from("product_colors").delete().eq("id", id);
    if (error) return "No se pudo eliminar el color.";
  }

  revalidatePath("/admin/productos");
  revalidatePath("/admin/productos/todos");
  revalidatePath("/admin/productos/categorias");
  revalidatePath("/admin/productos/colores");
  redirect("/admin/productos/colores");
}
