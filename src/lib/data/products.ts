import { createClient } from "@/lib/supabase/server";
import { MOCK_MODE } from "@/lib/mock/config";
import { mockGetProduct } from "@/lib/mock/queries";

export interface ProductDetail {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string;
  colors: string[];
  price: number;
  quantity_on_hand: number;
  low_stock_threshold: number;
}

export async function getProduct(id: string): Promise<ProductDetail | null> {
  if (MOCK_MODE) return mockGetProduct(id);

  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).single();
  return data as ProductDetail | null;
}
