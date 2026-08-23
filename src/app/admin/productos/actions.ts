"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MOCK_MODE } from "@/lib/mock/config";
import { mockCreateProduct, mockUpdateProduct, mockDeleteProduct } from "@/lib/mock/mutations";

function isDuplicateSku(message: string): boolean {
  return message.toLowerCase().includes("duplicate");
}

function isForeignKeyViolation(message: string): boolean {
  return message.toLowerCase().includes("foreign key") || message.toLowerCase().includes("violates");
}

// Mirrors mockCreateProduct/mockUpdateProduct's upsertCategoryColors: create
// the category if it's new, fold in any colors it didn't already have.
async function upsertCategoryColors(
  supabase: Awaited<ReturnType<typeof createClient>>,
  categoryName: string,
  colors: string[],
) {
  const { data: existing } = await supabase
    .from("product_categories")
    .select("id, colors")
    .eq("name", categoryName)
    .maybeSingle();

  if (!existing) {
    await supabase.from("product_categories").insert({ name: categoryName, colors });
    return;
  }

  const known = (existing.colors as string[]) ?? [];
  const merged = [...new Set([...known, ...colors])];
  if (merged.length !== known.length) {
    await supabase.from("product_categories").update({ colors: merged }).eq("id", existing.id);
  }
}

export async function saveProduct(_prevState: string | null, formData: FormData): Promise<string | null> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const sku = String(formData.get("sku") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || "General";
  const price = Number(formData.get("price") ?? 0);
  const quantityOnHand = Number(formData.get("quantity_on_hand") ?? 0);
  const lowStockThreshold = Number(formData.get("low_stock_threshold") ?? 0);

  let colors: string[] = [];
  try {
    colors = JSON.parse(String(formData.get("colors") ?? "[]"));
  } catch {
    return "Los colores no son válidos.";
  }

  if (!sku || !name) return "Completá el SKU y el nombre.";
  if (!Number.isFinite(price) || price < 0) return "El precio no es válido.";
  if (!Number.isInteger(quantityOnHand) || quantityOnHand < 0) return "La cantidad no es válida.";
  if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) return "El umbral no es válido.";

  const input = { sku, name, description, category, colors, price, quantityOnHand, lowStockThreshold };

  let productId = id;

  if (MOCK_MODE) {
    const result = id ? mockUpdateProduct(id, input) : mockCreateProduct(input);
    if ("error" in result) return result.error;
    productId = result.id;
  } else {
    const supabase = await createClient();
    const payload = {
      sku,
      name,
      description,
      category,
      colors,
      price,
      quantity_on_hand: quantityOnHand,
      low_stock_threshold: lowStockThreshold,
    };

    if (id) {
      const { error } = await supabase.from("products").update(payload).eq("id", id);
      if (error) return isDuplicateSku(error.message) ? "Ese SKU ya está en uso." : "No se pudo actualizar el producto.";
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error || !data) {
        return error && isDuplicateSku(error.message) ? "Ese SKU ya está en uso." : "No se pudo crear el producto.";
      }
      productId = data.id;
    }

    await upsertCategoryColors(supabase, category, colors);
  }

  revalidatePath("/admin/productos");
  revalidatePath("/admin/productos/todos");
  revalidatePath("/vendedor/pedidos/nuevo");
  redirect(`/admin/productos/${productId}`);
}

export async function deleteProduct(id: string): Promise<string | null> {
  await requireAdmin();

  if (MOCK_MODE) {
    const result = mockDeleteProduct(id);
    if (result?.error) return result.error;
  } else {
    const supabase = await createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      return isForeignKeyViolation(error.message)
        ? "No se puede eliminar: este producto ya está en pedidos existentes."
        : "No se pudo eliminar el producto.";
    }
  }

  revalidatePath("/admin/productos");
  revalidatePath("/admin/productos/todos");
  revalidatePath("/vendedor/pedidos/nuevo");
  redirect("/admin/productos/todos");
}
