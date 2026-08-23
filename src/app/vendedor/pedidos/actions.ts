"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSeller } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MOCK_MODE } from "@/lib/mock/config";
import { mockCreateOrder, mockCancelOrder } from "@/lib/mock/mutations";

interface CartLine {
  productId: string;
  quantity: number;
}

export async function createOrder(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const profile = await requireSeller();

  const clientId = String(formData.get("client_id") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;
  let items: CartLine[] = [];

  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return "El carrito no es válido.";
  }

  if (!clientId) return "Elegí un cliente.";
  if (items.length === 0) return "Agregá al menos un producto.";

  let orderId: string;

  if (MOCK_MODE) {
    const result = mockCreateOrder({
      clientId,
      sellerId: profile.id,
      notes,
      items,
    });
    if ("error" in result) return result.error;
    orderId = result.id;
  } else {
    const supabase = await createClient();
    const { data: products } = await supabase
      .from("products")
      .select("id, price, quantity_on_hand")
      .in(
        "id",
        items.map((i) => i.productId),
      );

    const priceById = new Map((products ?? []).map((p) => [p.id, p.price]));
    const stockById = new Map((products ?? []).map((p) => [p.id, p.quantity_on_hand]));

    for (const line of items) {
      const available = stockById.get(line.productId) ?? 0;
      if (line.quantity > available) {
        return "Uno de los productos no tiene stock suficiente.";
      }
    }

    const total = items.reduce(
      (sum, line) => sum + (priceById.get(line.productId) ?? 0) * line.quantity,
      0,
    );

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ client_id: clientId, seller_id: profile.id, total, notes })
      .select("id")
      .single();

    if (orderError || !order) return "No se pudo crear el pedido.";

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((line) => ({
        order_id: order.id,
        product_id: line.productId,
        quantity: line.quantity,
        unit_price: priceById.get(line.productId) ?? 0,
      })),
    );

    if (itemsError) return "El pedido se creó pero hubo un error al cargar los productos.";
    orderId = order.id;
  }

  revalidatePath("/vendedor/pedidos");
  revalidatePath("/vendedor");
  revalidatePath("/admin");
  redirect(`/vendedor/pedidos/${orderId}`);
}

export async function cancelOrder(orderId: string) {
  await requireSeller();

  if (MOCK_MODE) {
    mockCancelOrder(orderId);
  } else {
    const supabase = await createClient();
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
  }

  revalidatePath(`/vendedor/pedidos/${orderId}`);
  revalidatePath("/vendedor/pedidos");
}
