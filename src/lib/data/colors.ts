import { createClient } from "@/lib/supabase/server";
import { MOCK_MODE } from "@/lib/mock/config";
import { mockListColors, mockGetColor } from "@/lib/mock/queries";

export interface ColorRow {
  id: string;
  name: string;
}

export async function listColors(): Promise<ColorRow[]> {
  if (MOCK_MODE) return mockListColors();

  const supabase = await createClient();
  const { data } = await supabase
    .from("product_colors")
    .select("id, name")
    .order("name", { ascending: true });
  return (data ?? []) as ColorRow[];
}

export async function getColor(id: string): Promise<ColorRow | null> {
  if (MOCK_MODE) return mockGetColor(id);

  const supabase = await createClient();
  const { data } = await supabase.from("product_colors").select("id, name").eq("id", id).single();
  return data as ColorRow | null;
}
