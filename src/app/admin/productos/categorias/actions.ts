"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MOCK_MODE } from "@/lib/mock/config";
import { mockCreateCategory, mockUpdateCategory, mockDeleteCategory } from "@/lib/mock/mutations";

function isDuplicateName(message: string): boolean {
  return message.toLowerCase().includes("duplicate");
}

export async function saveCategory(_prevState: string | null, formData: FormData): Promise<string | null> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  let colors: string[] = [];
  try {
    colors = JSON.parse(String(formData.get("colors") ?? "[]"));
  } catch {
    return "Los colores no son válidos.";
  }

  if (!name) return "El nombre es obligatorio.";

  let categoryId = id;

  if (MOCK_MODE) {
    const result = id ? mockUpdateCategory(id, { name, colors }) : mockCreateCategory({ name, colors });
    if ("error" in result) return result.error;
    categoryId = result.id;
  } else {
    const supabase = await createClient();

    if (id) {
      const { data: existing } = await supabase
        .from("product_categories")
        .select("name")
        .eq("id", id)
        .single();

      const { error } = await supabase.from("product_categories").update({ name, colors }).eq("id", id);
      if (error) {
        return isDuplicateName(error.message) ? "Ya existe una categoría con ese nombre." : "No se pudo actualizar la categoría.";
      }

      // Products reference categories by name, not id — keep them in sync.
      if (existing && existing.name !== name) {
        await supabase.from("products").update({ category: name }).eq("category", existing.name);
      }
    } else {
      const { data, error } = await supabase
        .from("product_categories")
        .insert({ name, colors })
        .select("id")
        .single();
      if (error || !data) {
        return error && isDuplicateName(error.message)
          ? "Ya existe una categoría con ese nombre."
          : "No se pudo crear la categoría.";
      }
      categoryId = data.id;
    }
  }

  revalidatePath("/admin/productos");
  revalidatePath("/admin/productos/todos");
  revalidatePath("/admin/productos/categorias");
  redirect(`/admin/productos/categorias/${categoryId}`);
}

export async function deleteCategory(id: string): Promise<string | null> {
  await requireAdmin();

  if (MOCK_MODE) {
    const result = mockDeleteCategory(id);
    if (result?.error) return result.error;
  } else {
    const supabase = await createClient();
    const { data: category } = await supabase
      .from("product_categories")
      .select("name")
      .eq("id", id)
      .single();

    if (category) {
      const { count } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("category", category.name);
      if (count && count > 0) return "No se puede eliminar: hay productos usando esta categoría.";
    }

    const { error } = await supabase.from("product_categories").delete().eq("id", id);
    if (error) return "No se pudo eliminar la categoría.";
  }

  revalidatePath("/admin/productos");
  revalidatePath("/admin/productos/todos");
  revalidatePath("/admin/productos/categorias");
  redirect("/admin/productos/categorias");
}
