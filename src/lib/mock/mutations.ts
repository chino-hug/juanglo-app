import { getStore, nextId } from "./store";
import type { ClientStatus, UserRole, ZoneRegion } from "@/lib/supabase/database.types";

const PICKING_ROLE = "picking_packing";

// ---------------------------------------------------------------------------
// clientes/zonas/actions.ts
// ---------------------------------------------------------------------------
export function mockUpdateZone(
  id: string,
  input: { city: string | null; region: ZoneRegion | null },
): { error: string } | null {
  const zone = getStore().zones.find((z) => z.id === id);
  if (!zone) return { error: "No se encontró la zona." };
  zone.city = input.city;
  zone.region = input.region;
  return null;
}

function notify(userId: string, type: string, title: string, body: string, orderId?: string) {
  getStore().notifications.unshift({
    id: nextId("notif"),
    user_id: userId,
    type,
    title,
    body,
    order_id: orderId ?? null,
    appointment_id: null,
    read: false,
    created_at: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// clientes/actions.ts
// ---------------------------------------------------------------------------
export function mockSaveClient(input: {
  id?: string;
  sellerId: string;
  name: string | null;
  businessName: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  zoneId: string | null;
  status: ClientStatus;
}): { id: string } {
  const store = getStore();
  const now = new Date().toISOString();

  if (input.id) {
    const existing = store.clients.find((c) => c.id === input.id);
    if (existing) {
      existing.seller_id = input.sellerId;
      existing.name = input.name;
      existing.business_name = input.businessName;
      existing.address = input.address;
      existing.phone = input.phone;
      existing.email = input.email;
      existing.notes = input.notes;
      existing.zone_id = input.zoneId;
      existing.status = input.status;
      existing.updated_at = now;
      return { id: existing.id };
    }
  }

  const id = nextId("client");
  store.clients.push({
    id,
    seller_id: input.sellerId,
    zone_id: input.zoneId,
    name: input.name,
    business_name: input.businessName,
    phone: input.phone,
    email: input.email,
    address: input.address,
    lat: null,
    lng: null,
    notes: input.notes,
    status: input.status,
    created_at: now,
    updated_at: now,
  });
  return { id };
}

export function mockConvertToClient(clientId: string) {
  const client = getStore().clients.find((c) => c.id === clientId);
  if (client) client.status = "client";
}

// ---------------------------------------------------------------------------
// citas/actions.ts
// ---------------------------------------------------------------------------
export function mockSaveAppointment(input: {
  clientId: string;
  sellerId: string;
  scheduledAt: string;
  notes: string | null;
}) {
  const now = new Date().toISOString();
  getStore().appointments.push({
    id: nextId("appt"),
    client_id: input.clientId,
    seller_id: input.sellerId,
    scheduled_at: input.scheduledAt,
    status: "scheduled",
    notes: input.notes,
    created_at: now,
    updated_at: now,
  });
}

export function mockCancelAppointment(id: string) {
  const appt = getStore().appointments.find((a) => a.id === id);
  if (appt) appt.status = "cancelled";
}

export function mockCompleteAppointment(id: string) {
  const appt = getStore().appointments.find((a) => a.id === id);
  if (appt) appt.status = "done";
}

// ---------------------------------------------------------------------------
// pedidos/actions.ts
// ---------------------------------------------------------------------------
export function mockCreateOrder(input: {
  clientId: string;
  sellerId: string;
  notes: string | null;
  items: { productId: string; quantity: number }[];
}): { id: string } | { error: string } {
  const store = getStore();

  for (const line of input.items) {
    const product = store.products.find((p) => p.id === line.productId);
    if (!product || line.quantity > product.quantity_on_hand) {
      return { error: "Uno de los productos no tiene stock suficiente." };
    }
  }

  const total = input.items.reduce((sum, line) => {
    const product = store.products.find((p) => p.id === line.productId)!;
    return sum + product.price * line.quantity;
  }, 0);

  const now = new Date().toISOString();
  const orderId = nextId("order");
  const orderNumber = store.nextOrderNumber;
  store.nextOrderNumber += 1;
  store.orders.push({
    id: orderId,
    client_id: input.clientId,
    seller_id: input.sellerId,
    status: "created",
    total,
    order_number: orderNumber,
    notes: input.notes,
    created_at: now,
    updated_at: now,
  });

  for (const line of input.items) {
    const product = store.products.find((p) => p.id === line.productId)!;
    store.orderItems.push({
      id: nextId("item"),
      order_id: orderId,
      product_id: line.productId,
      quantity: line.quantity,
      unit_price: product.price,
      picked: false,
      note: null,
    });
    product.quantity_on_hand -= line.quantity;
  }

  store.orderStatusHistory.push({
    id: nextId("hist"),
    order_id: orderId,
    status: "created",
    changed_at: now,
  });

  for (const recipient of store.profiles.filter(
    (p) => p.role === PICKING_ROLE || p.role === "admin",
  )) {
    notify(
      recipient.id,
      "order_created",
      "Nuevo pedido",
      "Se creó un nuevo pedido para preparar.",
      orderId,
    );
  }

  return { id: orderId };
}

export function mockCancelOrder(orderId: string) {
  const store = getStore();
  const order = store.orders.find((o) => o.id === orderId);
  if (!order || order.status !== "created") return;
  order.status = "cancelled";
  order.updated_at = new Date().toISOString();
  store.orderStatusHistory.push({
    id: nextId("hist"),
    order_id: orderId,
    status: "cancelled",
    changed_at: order.updated_at,
  });

  notify(order.seller_id, "order_status_changed", "Pedido actualizado", "El pedido cambió de estado.", orderId);
  for (const recipient of store.profiles.filter(
    (p) => p.role === "admin" || p.role === PICKING_ROLE,
  )) {
    notify(recipient.id, "order_status_changed", "Pedido actualizado", "El pedido cambió de estado.", orderId);
  }
}

// ---------------------------------------------------------------------------
// preparacion/actions.ts
// ---------------------------------------------------------------------------
const FORWARD_PATH = ["created", "picking", "packed", "out_for_delivery", "delivered"] as const;
type FulfillmentStatus = (typeof FORWARD_PATH)[number];

export function mockSetOrderStatus(orderId: string, status: FulfillmentStatus): { error?: string } {
  const store = getStore();
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) return { error: "No se encontró el pedido." };
  if (!FORWARD_PATH.includes(status)) return { error: "Estado inválido." };
  if (order.status === status) return {};

  order.status = status;
  order.updated_at = new Date().toISOString();
  store.orderStatusHistory.push({
    id: nextId("hist"),
    order_id: orderId,
    status,
    changed_at: order.updated_at,
  });

  notify(order.seller_id, "order_status_changed", "Pedido actualizado", "El pedido cambió de estado.", orderId);
  for (const admin of store.profiles.filter((p) => p.role === "admin")) {
    notify(admin.id, "order_status_changed", "Pedido actualizado", "El pedido cambió de estado.", orderId);
  }

  return {};
}

export function mockUpdateOrderNumber(orderId: string, orderNumber: number): { error?: string } {
  const store = getStore();
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) return { error: "No se encontró el pedido." };
  if (!Number.isInteger(orderNumber) || orderNumber < 1) {
    return { error: "El número de orden no es válido." };
  }
  if (store.orders.some((o) => o.id !== orderId && o.order_number === orderNumber)) {
    return { error: "Ese número de orden ya está en uso." };
  }

  order.order_number = orderNumber;
  order.updated_at = new Date().toISOString();
  return {};
}

export function mockSaveItemChanges(
  itemId: string,
  picked: boolean,
  note: string,
): { error?: string } {
  const store = getStore();
  const item = store.orderItems.find((i) => i.id === itemId);
  if (!item) return { error: "No se encontró el producto." };

  const trimmed = note.trim();
  const noteChanged = trimmed !== "" && trimmed !== (item.note ?? "");

  item.picked = picked;
  item.note = trimmed || null;

  if (noteChanged) {
    const order = store.orders.find((o) => o.id === item.order_id);
    const product = store.products.find((p) => p.id === item.product_id);
    const body = `${product?.name ?? "Un producto"}: ${trimmed}`;

    if (order) {
      notify(order.seller_id, "order_item_issue", "Aviso de preparación", body, order.id);
      for (const admin of store.profiles.filter((p) => p.role === "admin")) {
        notify(admin.id, "order_item_issue", "Aviso de preparación", body, order.id);
      }
    }
  }

  return {};
}

// ---------------------------------------------------------------------------
// notificaciones/actions.ts
// ---------------------------------------------------------------------------
export function mockMarkNotificationRead(id: string) {
  const n = getStore().notifications.find((x) => x.id === id);
  if (n) n.read = true;
}

export function mockMarkAllNotificationsRead(userId: string) {
  for (const n of getStore().notifications) {
    if (n.user_id === userId) n.read = true;
  }
}

// ---------------------------------------------------------------------------
// admin/usuarios/actions.ts
// ---------------------------------------------------------------------------
export function mockCreateUser(input: {
  fullName: string;
  email: string;
  cedula: string;
  role: UserRole;
}): { id: string } | { error: string } {
  const store = getStore();
  const email = input.email.trim().toLowerCase();
  const cedula = input.cedula.trim();

  if (store.profiles.some((p) => p.email.toLowerCase() === email)) {
    return { error: "Ya existe un usuario con ese correo." };
  }
  if (store.profiles.some((p) => p.cedula === cedula)) {
    return { error: "Ya existe un usuario con esa cédula." };
  }

  const id = nextId("profile");
  store.profiles.push({
    id,
    full_name: input.fullName,
    email,
    cedula,
    role: input.role,
    created_at: new Date().toISOString(),
  });
  return { id };
}

export function mockUpdateUser(input: {
  id: string;
  fullName: string;
  email: string;
  cedula: string;
  role: UserRole;
}): { id: string } | { error: string } {
  const store = getStore();
  const email = input.email.trim().toLowerCase();
  const cedula = input.cedula.trim();

  const existing = store.profiles.find((p) => p.id === input.id);
  if (!existing) return { error: "No se encontró el usuario." };

  if (store.profiles.some((p) => p.id !== input.id && p.email.toLowerCase() === email)) {
    return { error: "Ya existe un usuario con ese correo." };
  }
  if (store.profiles.some((p) => p.id !== input.id && p.cedula === cedula)) {
    return { error: "Ya existe un usuario con esa cédula." };
  }

  existing.full_name = input.fullName;
  existing.email = email;
  existing.cedula = cedula;
  existing.role = input.role;
  return { id: existing.id };
}

export function mockDeleteUser(id: string): { error: string } | null {
  const store = getStore();
  const index = store.profiles.findIndex((p) => p.id === id);
  if (index === -1) return { error: "No se encontró el usuario." };
  store.profiles.splice(index, 1);
  return null;
}

// ---------------------------------------------------------------------------
// admin/productos/actions.ts
// ---------------------------------------------------------------------------
export interface ProductInput {
  sku: string;
  name: string;
  description: string | null;
  category: string;
  colors: string[];
  price: number;
  quantityOnHand: number;
  lowStockThreshold: number;
}

// Creates the category if it's new, and folds in any colors the product
// used that the category doesn't already know about — so picking a new
// color on one product makes it available to every other product in that
// category from then on.
function upsertCategoryColors(categoryName: string, colors: string[]) {
  const store = getStore();
  let category = store.productCategories.find((c) => c.name === categoryName);
  if (!category) {
    category = { id: nextId("category"), name: categoryName, colors: [], created_at: new Date().toISOString() };
    store.productCategories.push(category);
  }
  const newColors = colors.filter((c) => !category!.colors.includes(c));
  if (newColors.length > 0) category.colors = [...category.colors, ...newColors];
}

export function mockCreateProduct(input: ProductInput): { id: string } | { error: string } {
  const store = getStore();
  const sku = input.sku.trim();

  if (store.products.some((p) => p.sku.toLowerCase() === sku.toLowerCase())) {
    return { error: "Ya existe un producto con ese SKU." };
  }

  const id = nextId("product");
  store.products.push({
    id,
    sku,
    name: input.name,
    description: input.description,
    category: input.category,
    colors: input.colors,
    price: input.price,
    quantity_on_hand: input.quantityOnHand,
    low_stock_threshold: input.lowStockThreshold,
  });
  upsertCategoryColors(input.category, input.colors);
  return { id };
}

export function mockUpdateProduct(
  id: string,
  input: ProductInput,
): { id: string } | { error: string } {
  const store = getStore();
  const sku = input.sku.trim();

  const existing = store.products.find((p) => p.id === id);
  if (!existing) return { error: "No se encontró el producto." };

  if (store.products.some((p) => p.id !== id && p.sku.toLowerCase() === sku.toLowerCase())) {
    return { error: "Ya existe un producto con ese SKU." };
  }

  existing.sku = sku;
  existing.name = input.name;
  existing.description = input.description;
  existing.category = input.category;
  existing.colors = input.colors;
  existing.price = input.price;
  existing.quantity_on_hand = input.quantityOnHand;
  existing.low_stock_threshold = input.lowStockThreshold;
  upsertCategoryColors(input.category, input.colors);
  return { id: existing.id };
}

export function mockDeleteProduct(id: string): { error: string } | null {
  const store = getStore();
  const index = store.products.findIndex((p) => p.id === id);
  if (index === -1) return { error: "No se encontró el producto." };
  if (store.orderItems.some((i) => i.product_id === id)) {
    return { error: "No se puede eliminar: este producto ya está en pedidos existentes." };
  }
  store.products.splice(index, 1);
  return null;
}

// ---------------------------------------------------------------------------
// admin/productos/categorias/actions.ts
// ---------------------------------------------------------------------------
export interface CategoryInput {
  name: string;
  colors: string[];
}

export function mockCreateCategory(input: CategoryInput): { id: string } | { error: string } {
  const store = getStore();
  const name = input.name.trim();
  if (!name) return { error: "El nombre es obligatorio." };
  if (store.productCategories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
    return { error: "Ya existe una categoría con ese nombre." };
  }

  const id = nextId("category");
  store.productCategories.push({ id, name, colors: input.colors, created_at: new Date().toISOString() });
  return { id };
}

export function mockUpdateCategory(
  id: string,
  input: CategoryInput,
): { id: string } | { error: string } {
  const store = getStore();
  const name = input.name.trim();
  if (!name) return { error: "El nombre es obligatorio." };

  const existing = store.productCategories.find((c) => c.id === id);
  if (!existing) return { error: "No se encontró la categoría." };

  if (store.productCategories.some((c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase())) {
    return { error: "Ya existe una categoría con ese nombre." };
  }

  // Products reference categories by name, not id — keep them in sync.
  const oldName = existing.name;
  existing.name = name;
  existing.colors = input.colors;
  if (oldName !== name) {
    for (const p of store.products) {
      if (p.category === oldName) p.category = name;
    }
  }
  return { id: existing.id };
}

export function mockDeleteCategory(id: string): { error: string } | null {
  const store = getStore();
  const category = store.productCategories.find((c) => c.id === id);
  if (!category) return { error: "No se encontró la categoría." };
  if (store.products.some((p) => p.category === category.name)) {
    return { error: "No se puede eliminar: hay productos usando esta categoría." };
  }
  const index = store.productCategories.findIndex((c) => c.id === id);
  store.productCategories.splice(index, 1);
  return null;
}

// ---------------------------------------------------------------------------
// admin/productos/colores/actions.ts
// ---------------------------------------------------------------------------
export function mockCreateColor(name: string): { id: string } | { error: string } {
  const store = getStore();
  const trimmed = name.trim();
  if (!trimmed) return { error: "El nombre es obligatorio." };
  if (store.productColors.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
    return { error: "Ya existe un color con ese nombre." };
  }

  const id = nextId("color");
  store.productColors.push({ id, name: trimmed, created_at: new Date().toISOString() });
  return { id };
}

export function mockUpdateColor(id: string, name: string): { id: string } | { error: string } {
  const store = getStore();
  const trimmed = name.trim();
  if (!trimmed) return { error: "El nombre es obligatorio." };

  const existing = store.productColors.find((c) => c.id === id);
  if (!existing) return { error: "No se encontró el color." };

  if (store.productColors.some((c) => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase())) {
    return { error: "Ya existe un color con ese nombre." };
  }

  // Categories and products reference colors by name, not id — keep every
  // palette that includes the old name pointing at the new one instead.
  const oldName = existing.name;
  existing.name = trimmed;
  if (oldName !== trimmed) {
    for (const category of store.productCategories) {
      const index = category.colors.indexOf(oldName);
      if (index !== -1) category.colors[index] = trimmed;
    }
    for (const product of store.products) {
      const index = product.colors.indexOf(oldName);
      if (index !== -1) product.colors[index] = trimmed;
    }
  }
  return { id: existing.id };
}

export function mockDeleteColor(id: string): { error: string } | null {
  const store = getStore();
  const color = store.productColors.find((c) => c.id === id);
  if (!color) return { error: "No se encontró el color." };

  // Deleting a color always succeeds — it just disappears from every
  // category and product palette that had it selected, instead of being
  // blocked by whatever happens to be using it right now.
  for (const category of store.productCategories) {
    const index = category.colors.indexOf(color.name);
    if (index !== -1) category.colors.splice(index, 1);
  }
  for (const product of store.products) {
    const index = product.colors.indexOf(color.name);
    if (index !== -1) product.colors.splice(index, 1);
  }

  const index = store.productColors.findIndex((c) => c.id === id);
  store.productColors.splice(index, 1);
  return null;
}
