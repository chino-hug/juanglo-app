export type UserRole = "admin" | "seller" | "picking_packing";
export type ClientStatus = "prospect" | "scheduled" | "client";
export type AppointmentStatus = "scheduled" | "done" | "cancelled";
export type ZoneRegion = "Norte" | "Sur" | "Centro" | "Occidente" | "Oriente";
export type OrderStatus =
  | "created"
  | "picking"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

interface ProfilesRow {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  cedula: string;
  created_at: string;
}

interface ZonesRow {
  id: string;
  name: string;
  description: string | null;
  areas: string[];
  // Geographic grouping for the client filter — city is free text (most
  // zones are "Medellín", but a client can be in another city entirely,
  // like Pasto); region only applies within Medellín/Valle de Aburrá.
  city: string | null;
  region: ZoneRegion | null;
  created_by: string | null;
  created_at: string;
}

interface ClientsRow {
  id: string;
  seller_id: string;
  zone_id: string | null;
  // At least one of name / business_name / phone is guaranteed present —
  // enforced in the save actions, not by the schema (any single one of the
  // three can be missing on its own).
  name: string | null;
  business_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  notes: string | null;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
}

interface ProductsRow {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string;
  colors: string[];
  price: number;
  quantity_on_hand: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

interface ProductCategoriesRow {
  id: string;
  name: string;
  colors: string[];
  created_at: string;
}

interface ProductColorsRow {
  id: string;
  name: string;
  created_at: string;
}

interface AppointmentsRow {
  id: string;
  client_id: string;
  seller_id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface OrdersRow {
  id: string;
  client_id: string;
  seller_id: string;
  status: OrderStatus;
  total: number;
  order_number: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItemsRow {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  picked: boolean;
  note: string | null;
}

interface OrderStatusHistoryRow {
  id: string;
  order_id: string;
  status: OrderStatus;
  changed_by: string | null;
  changed_at: string;
  notes: string | null;
}

interface NotificationsRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  order_id: string | null;
  appointment_id: string | null;
  read: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfilesRow;
        Insert: Partial<ProfilesRow> & Pick<ProfilesRow, "id" | "full_name" | "email">;
        Update: Partial<ProfilesRow>;
        Relationships: [];
      };
      zones: {
        Row: ZonesRow;
        Insert: Partial<ZonesRow> & Pick<ZonesRow, "name">;
        Update: Partial<ZonesRow>;
        Relationships: [];
      };
      clients: {
        Row: ClientsRow;
        Insert: Partial<ClientsRow> & Pick<ClientsRow, "seller_id">;
        Update: Partial<ClientsRow>;
        Relationships: [];
      };
      products: {
        Row: ProductsRow;
        Insert: Partial<ProductsRow> & Pick<ProductsRow, "sku" | "name">;
        Update: Partial<ProductsRow>;
        Relationships: [];
      };
      product_categories: {
        Row: ProductCategoriesRow;
        Insert: Partial<ProductCategoriesRow> & Pick<ProductCategoriesRow, "name">;
        Update: Partial<ProductCategoriesRow>;
        Relationships: [];
      };
      product_colors: {
        Row: ProductColorsRow;
        Insert: Partial<ProductColorsRow> & Pick<ProductColorsRow, "name">;
        Update: Partial<ProductColorsRow>;
        Relationships: [];
      };
      appointments: {
        Row: AppointmentsRow;
        Insert: Partial<AppointmentsRow> &
          Pick<AppointmentsRow, "client_id" | "seller_id" | "scheduled_at">;
        Update: Partial<AppointmentsRow>;
        Relationships: [];
      };
      orders: {
        Row: OrdersRow;
        Insert: Partial<OrdersRow> & Pick<OrdersRow, "client_id" | "seller_id">;
        Update: Partial<OrdersRow>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItemsRow;
        Insert: Partial<OrderItemsRow> &
          Pick<OrderItemsRow, "order_id" | "product_id" | "quantity" | "unit_price">;
        Update: Partial<OrderItemsRow>;
        Relationships: [];
      };
      order_status_history: {
        Row: OrderStatusHistoryRow;
        Insert: Partial<OrderStatusHistoryRow> & Pick<OrderStatusHistoryRow, "order_id" | "status">;
        Update: Partial<OrderStatusHistoryRow>;
        Relationships: [];
      };
      notifications: {
        Row: NotificationsRow;
        Insert: Partial<NotificationsRow> &
          Pick<NotificationsRow, "user_id" | "type" | "title">;
        Update: Partial<Pick<NotificationsRow, "read">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
