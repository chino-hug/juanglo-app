import { createClient } from "@/lib/supabase/server";
import { MOCK_MODE } from "@/lib/mock/config";
import { mockListCategories, mockGetCategory } from "@/lib/mock/queries";

export interface CategoryRow {
  id: string;
  name: string;
  colors: string[];
}

export async function listCategories(): Promise<CategoryRow[]> {
  if (MOCK_MODE) return mockListCategories();

  const supabase = await createClient();
  const { data } = await supabase
    .from("product_categories")
    .select("id, name, colors")
    .order("name", { ascending: true });
  return (data ?? []) as CategoryRow[];
}

export async function getCategory(id: string): Promise<CategoryRow | null> {
  if (MOCK_MODE) return mockGetCategory(id);

  const supabase = await createClient();
  const { data } = await supabase
    .from("product_categories")
    .select("id, name, colors")
    .eq("id", id)
    .single();
  return data as CategoryRow | null;
}
