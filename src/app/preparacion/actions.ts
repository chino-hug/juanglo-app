"use server";

import { revalidatePath } from "next/cache";
import { requirePicking } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MOCK_MODE } from "@/lib/mock/config";
import {
  mockSetOrderStatus,
  mockUpdateOrderNumber,
  mockSaveItemChanges,
} from "@/lib/mock/mutations";
import type { OrderStatus } from "@/lib/supabase/database.types";

const FULFILLMENT_STATUSES = ["created", "picking", "packed", "out_for_delivery", "delivered"] as const;

function revalidateOrder(orderId: string) {
  revalidatePath("/preparacion");
  revalidatePath(`/preparacion/${orderId}`);
  revalidatePath("/vendedor/pedidos");
  revalidatePath(`/vendedor/pedidos/${orderId}`);
  revalidatePath("/admin");
}

export async function setOrderStatus(orderId: string, status: OrderStatus): Promise<string | null> {
  await requirePicking();

  if (!FULFILLMENT_STATUSES.includes(status as (typeof FULFILLMENT_STATUSES)[number])) {
    return "Estado inválido.";
  }

  if (MOCK_MODE) {
    const result = mockSetOrderStatus(orderId, status as (typeof FULFILLMENT_STATUSES)[number]);
    if (result.error) return result.error;
  } else {
    const supabase = await createClient();
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) return "No se pudo actualizar el pedido.";
  }

  revalidateOrder(orderId);
  return null;
}

export async function updateOrderNumber(orderId: string, orderNumber: number): Promise<string | null> {
  await requirePicking();

  if (!Number.isInteger(orderNumber) || orderNumber < 1) {
    return "El número de orden no es válido.";
  }

  if (MOCK_MODE) {
    const result = mockUpdateOrderNumber(orderId, orderNumber);
    if (result.error) return result.error;
  } else {
    const supabase = await createClient();
    const { error } = await supabase
      .from("orders")
      .update({ order_number: orderNumber })
      .eq("id", orderId);
    if (error) {
      return error.code === "23505" ? "Ese número de orden ya está en uso." : "No se pudo guardar el número.";
    }
  }

  revalidateOrder(orderId);
  return null;
}

export async function saveItemChanges(
  itemId: string,
  orderId: string,
  picked: boolean,
  note: string,
): Promise<string | null> {
  await requirePicking();

  if (MOCK_MODE) {
    const result = mockSaveItemChanges(itemId, picked, note);
    if (result.error) return result.error;
  } else {
    const supabase = await createClient();
    const { error } = await supabase
      .from("order_items")
      .update({ picked, note: note.trim() || null })
      .eq("id", itemId);
    if (error) return "No se pudieron guardar los cambios.";
  }

  revalidateOrder(orderId);
  return null;
}
