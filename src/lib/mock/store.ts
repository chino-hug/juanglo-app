// In-memory stand-in for Supabase, used only when NEXT_PUBLIC_SUPABASE_URL
// is not configured (see ./config.ts). Mirrors supabase/seed.sql so the app
// behaves the same either way. Server-only: lives for the life of the
// `next dev` process, attached to globalThis so Next's module reloading in
// dev doesn't reset it between requests.
import type {
  UserRole,
  ClientStatus,
  AppointmentStatus,
  OrderStatus,
  ZoneRegion,
} from "@/lib/supabase/database.types";

export interface MockProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  cedula: string;
  created_at: string;
}

export interface MockZone {
  id: string;
  name: string;
  description: string | null;
  areas: string[];
  city: string | null;
  region: ZoneRegion | null;
  created_at: string;
}

export interface MockProduct {
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

export interface MockClient {
  id: string;
  seller_id: string;
  zone_id: string | null;
  // At least one of name / business_name / phone is guaranteed present —
  // enforced in the save actions, not by this type.
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

export interface MockAppointment {
  id: string;
  client_id: string;
  seller_id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  picked: boolean;
  note: string | null;
}

export interface MockOrder {
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

export interface MockOrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  changed_at: string;
}

export interface MockNotification {
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

export interface MockProductCategory {
  id: string;
  name: string;
  colors: string[];
  created_at: string;
}

export interface MockProductColor {
  id: string;
  name: string;
  created_at: string;
}

interface Store {
  profiles: MockProfile[];
  zones: MockZone[];
  products: MockProduct[];
  productCategories: MockProductCategory[];
  productColors: MockProductColor[];
  clients: MockClient[];
  appointments: MockAppointment[];
  orders: MockOrder[];
  orderItems: MockOrderItem[];
  orderStatusHistory: MockOrderStatusHistory[];
  notifications: MockNotification[];
  nextOrderNumber: number;
}

let uid = 0;
export function nextId(prefix: string): string {
  uid += 1;
  return `${prefix}-${uid.toString().padStart(4, "0")}`;
}

const ADMIN_ID = "profile-admin";
export const SELLER_1_ID = "profile-vendedora1";
const SELLER_2_ID = "profile-vendedora2";
const PICKING_ID = "profile-preparacion";


// Papel celofán: ids kept stable across refactors so existing order_items
// below don't need to change when the catalog is re-priced. "Ref. N" is the
// supplier's own reference/size number — colors are tracked per reference,
// not per unit, matching how the physical inventory count works.
const PROD_CEL_REF01 = "product-lavanda";
const PROD_CEL_REF04 = "product-vainilla";
const PROD_CEL_REF08 = "product-citrica";
const PROD_VELA_14 = "product-madera";
const PROD_VELA_2X30 = "product-rosas";
const PROD_PEBETERO = "product-regalo";

const PROD_CEL_REF02 = "product-cel-ref02";
const PROD_CEL_REF03 = "product-cel-ref03";
const PROD_CEL_REF05 = "product-cel-ref05";
const PROD_CEL_REF06 = "product-cel-ref06";
const PROD_CEL_REF07 = "product-cel-ref07";
const PROD_CEL_REF09 = "product-cel-ref09";
const PROD_CEL_REF10 = "product-cel-ref10";
const PROD_CEL_REF11 = "product-cel-ref11";
const PROD_CEL_REF12 = "product-cel-ref12";
const PROD_CEL_REF13 = "product-cel-ref13";
const PROD_CEL_REF14 = "product-cel-ref14";
const PROD_CEL_9840 = "product-cel-9840";
const PROD_CEL_9850 = "product-cel-9850";
const PROD_CEL_EST11 = "product-cel-est11";
const PROD_CEL_EST13 = "product-cel-est13";
const PROD_VELA_NAV = "product-vela-navidena";
const PROD_VELA_18 = "product-vela-18";
const PROD_VELA_2X19 = "product-vela-2x19";

const CEL_SOLIDS = [
  "Blanco",
  "Amarillo",
  "Verde",
  "Azul",
  "Rojo",
  "Rosado",
  "Morado",
  "Naranja",
  "Negro",
  "Dorado",
  "Plateado",
];
const CEL_SIETE_COLORES = "Siete colores";
const CEL_COMBOS_3_5_6_7_8_9 = [
  "Amarillo/Rojo",
  "Amarillo/Verde",
  "Blanco/Rojo",
  "Blanco/Rosado",
  "Blanco/Morado",
  "Rojo/Negro",
  "Azul/Negro",
  "Blanco/Azul",
];
const CEL_COMBO_VERDE_DORADO = "Blanco/Verde/Dorado";
const CEL_COMBOS_8_9 = ["Naranja/Rojo/Dorado", "Amarillo/Naranja/Dorado"];

const CANDLE_ALL_COLORS = [...CEL_SOLIDS.slice(0, 8), "Negro", "Dorado", "Plateado", "Beige", "Surtida 5 colores"];
const CANDLE_NEUTRAL_COLORS = ["Blanco", "Negro", "Dorado", "Plateado", "Beige"];

function seed(): Store {
  const now = () => new Date().toISOString();
  const today = new Date();
  const at = (hours: number, minutes = 0, dayOffset = 0) => {
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  const clients: MockClient[] = [
    { id: "client-1", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "7 POTENCIAS", business_name: null, phone: "3214352597", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-2", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "7 POTENCIAS 2", business_name: null, phone: "3214352597", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-3", seller_id: SELLER_1_ID, zone_id: "zone-poblado", name: "A&C", business_name: null, phone: "3127447049", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-4", seller_id: SELLER_1_ID, zone_id: "zone-la-america", name: "ADELA", business_name: null, phone: "3212359895", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-5", seller_id: SELLER_1_ID, zone_id: "zone-poblado", name: "AGENCIA CORDOBA", business_name: null, phone: "3136957012", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-6", seller_id: SELLER_1_ID, zone_id: "zone-caldas", name: "ALCACHOFA", business_name: null, phone: "3104698155", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-7", seller_id: SELLER_1_ID, zone_id: "zone-belen", name: "ALIADO SUTIMAX", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-8", seller_id: SELLER_1_ID, zone_id: "zone-envigado", name: "ALIRIO EVG", business_name: null, phone: "3168539497", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-9", seller_id: SELLER_1_ID, zone_id: "zone-envigado-plaza", name: "ALL NATURAL", business_name: null, phone: "3125271060", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-10", seller_id: SELLER_1_ID, zone_id: "zone-caldas", name: "AMASTITA 911", business_name: null, phone: "3053896234", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-11", seller_id: SELLER_1_ID, zone_id: "zone-estrella", name: "ANGELA MARIA LOS ALPES", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-12", seller_id: SELLER_1_ID, zone_id: "zone-envigado", name: "ANTILLAS", business_name: null, phone: "3053026272", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-13", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "AROMAS DEL CAMPO", business_name: null, phone: "3155048929", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-14", seller_id: SELLER_1_ID, zone_id: "zone-san-juan", name: "ARTE MODERNO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-15", seller_id: SELLER_1_ID, zone_id: "zone-envigado", name: "AY QUE RICO", business_name: null, phone: "3128597698", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-16", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "BALLENA", business_name: null, phone: "3195983754", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-17", seller_id: SELLER_1_ID, zone_id: "zone-envigado-plaza", name: "BENDICION", business_name: null, phone: "3125271060", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-18", seller_id: SELLER_1_ID, zone_id: "zone-guayabal", name: "BETTEL", business_name: null, phone: "3234713068", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-19", seller_id: SELLER_1_ID, zone_id: "zone-envigado-plaza", name: "BOTON DE ORO", business_name: null, phone: "3104035738", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-20", seller_id: SELLER_1_ID, zone_id: "zone-belen", name: "CACHARRERIA BELEN RINCON", business_name: null, phone: "3122265838", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-21", seller_id: SELLER_1_ID, zone_id: "zone-envigado", name: "CAFETAL", business_name: null, phone: "3194509665", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-22", seller_id: SELLER_1_ID, zone_id: "zone-la-america", name: "CARLOS GAVIRIA", business_name: null, phone: "3016088944", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-23", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "CARMELO", business_name: null, phone: "3192397485", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-24", seller_id: SELLER_1_ID, zone_id: "zone-san-pio", name: "CARVEL", business_name: null, phone: "3052361647", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-25", seller_id: SELLER_1_ID, zone_id: "zone-belen", name: "CASA BLANCA", business_name: null, phone: "3218731657", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-26", seller_id: SELLER_1_ID, zone_id: "zone-poblado", name: "CASA RAMAL", business_name: null, phone: "3127447049", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-27", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "CASA VELON", business_name: null, phone: "3135466551", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-28", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "CENTRO 3", business_name: null, phone: "3005949499", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-29", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "CESAR PLANTAS", business_name: null, phone: "3155292530", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-30", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "CHASOY", business_name: null, phone: "3114322621", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-31", seller_id: SELLER_1_ID, zone_id: "zone-envigado", name: "CHINGUI", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-32", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "CID", business_name: null, phone: "3212571468", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-33", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "COLTEJER", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-34", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "COLTEJER 2", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-35", seller_id: SELLER_1_ID, zone_id: "zone-copacabana", name: "COPACABANA", business_name: null, phone: "3217356549", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-36", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "CRISTINA LA GRUTA", business_name: null, phone: "3206123956", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-37", seller_id: SELLER_1_ID, zone_id: "zone-belen", name: "DAVID WEDDING", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-38", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "DETODITO 2", business_name: null, phone: "3147958214", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-39", seller_id: SELLER_1_ID, zone_id: "zone-estrella", name: "DIEGO CUÑADO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-40", seller_id: SELLER_1_ID, zone_id: "zone-poblado", name: "DIEGO DHARMA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-41", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "DISTRI ITAGUI", business_name: null, phone: "3017734547", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-42", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "DOLLAR", business_name: null, phone: "3147701907", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-43", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "DRAGON 1", business_name: null, phone: "3107897434", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-44", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "DRAGON 2", business_name: null, phone: "3127243618", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-45", seller_id: SELLER_1_ID, zone_id: "zone-campo-valdez", name: "EDITH YULIETH", business_name: null, phone: "3144184931", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-46", seller_id: SELLER_1_ID, zone_id: "zone-poblado", name: "EL CIELO BASICO", business_name: null, phone: "3007798400", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-47", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "EL EDEN", business_name: null, phone: "3148190057", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-48", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "ELKIN CENTRO", business_name: null, phone: "3218275249", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-49", seller_id: SELLER_1_ID, zone_id: "zone-barrio-antioquia", name: "ESQUINA REDONDA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-50", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "FAMIMAX", business_name: null, phone: "3005457317", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-51", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "FELIPE RIEGOS", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-52", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "FINCA SAN MIGUEL", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-53", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "FLACO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-54", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "FLOR CANELA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-55", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "FRUVER CALATRAVA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-56", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "FUENTE AZUL", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-57", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "GAIA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-58", seller_id: SELLER_1_ID, zone_id: "zone-envigado", name: "GALILEA", business_name: null, phone: "3113277312", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-59", seller_id: SELLER_1_ID, zone_id: "zone-envigado", name: "GIORGIO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-60", seller_id: SELLER_1_ID, zone_id: "zone-envigado", name: "GLORIA ENVIGADO", business_name: null, phone: "3505893288", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-61", seller_id: SELLER_1_ID, zone_id: "zone-envigado", name: "HERIBERTO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-62", seller_id: SELLER_1_ID, zone_id: "zone-belencito", name: "HERMANA CLARA EDILMA", business_name: null, phone: "3234504796", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-63", seller_id: SELLER_1_ID, zone_id: "zone-san-juan", name: "HOJAS BLANCAS", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-64", seller_id: SELLER_1_ID, zone_id: "zone-belen", name: "HOLISTICO Y ESOTERICO VILMONS", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-65", seller_id: SELLER_1_ID, zone_id: "zone-poblado", name: "HOTELES 23", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-66", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "HUECO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-67", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "HUGO SABANETA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-68", seller_id: SELLER_1_ID, zone_id: "zone-palmas", name: "INV VALIRA", business_name: null, phone: "3173410487", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-69", seller_id: SELLER_1_ID, zone_id: "zone-estrella", name: "ISOLDA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-70", seller_id: SELLER_1_ID, zone_id: "zone-envigado", name: "IVAN MAZO MEJIA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-71", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "J.O", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-72", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "JORGE MONTOYA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-73", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "JORGE PARAFIN", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-74", seller_id: SELLER_1_ID, zone_id: "zone-prado", name: "JULIAN TOPACIO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-75", seller_id: SELLER_1_ID, zone_id: "zone-pasto", name: "KANJI SUR", business_name: null, phone: "3186044601", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-76", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "KOSMOS", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-77", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "LA CAMPIÑITA", business_name: null, phone: "3148860398", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-78", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "LA CRUZ", business_name: null, phone: "3206876258", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-79", seller_id: SELLER_1_ID, zone_id: "zone-san-pio", name: "LA FINKITA RAMIRO", business_name: null, phone: "3148154844", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-80", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "LA HUERTA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-81", seller_id: SELLER_1_ID, zone_id: "zone-prado", name: "LEGUMBRE MONO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-82", seller_id: SELLER_1_ID, zone_id: "zone-envigado", name: "LEGUMBRES", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-83", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "LIBRERÍA SEMONARIO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-84", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "LIGIA ELENA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-85", seller_id: SELLER_1_ID, zone_id: "zone-robledo", name: "LILIANA TRUJILLO", business_name: null, phone: "3016575681", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-86", seller_id: SELLER_1_ID, zone_id: "zone-belen", name: "LOS CUÑADOS", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-87", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "LOS NIÑOS", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-88", seller_id: SELLER_1_ID, zone_id: "zone-san-lucas", name: "MANUELA UNITY", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-89", seller_id: SELLER_1_ID, zone_id: "zone-belen", name: "MARGARITA ESOTERICA BELEN", business_name: null, phone: "3219178723", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-90", seller_id: SELLER_1_ID, zone_id: "zone-belen", name: "MARIA ALEJANDRA BR", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-91", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "MARIA CAMILA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-92", seller_id: SELLER_1_ID, zone_id: "zone-envigado-plaza", name: "MARIA EUGENIA PARAISO", business_name: null, phone: "3135114464", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-93", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "MARIA JULIANA BOTERO", business_name: null, phone: "3045888740", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-94", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "MARIA ORIENTAL", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-95", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "MARIA PALO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-96", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "MARIANITO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-97", seller_id: SELLER_1_ID, zone_id: "zone-la-america", name: "MARIELA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-98", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "MARINITA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-99", seller_id: SELLER_1_ID, zone_id: null, name: "MARIO CARDONA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-100", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "MARIO SABANETA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-101", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "MARTHA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-102", seller_id: SELLER_1_ID, zone_id: "zone-bello", name: "MARTHA BELLO", business_name: null, phone: "3105324905", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-103", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "MAURO LA CEJA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-104", seller_id: SELLER_1_ID, zone_id: "zone-prado", name: "ME RINDE", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-105", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "MEDINATURAL", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-106", seller_id: SELLER_1_ID, zone_id: "zone-envigado-plaza", name: "MEJORANA", business_name: null, phone: "3127965394", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-107", seller_id: SELLER_1_ID, zone_id: "zone-poblado", name: "MONKEY", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-108", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "MOROCHO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-109", seller_id: SELLER_1_ID, zone_id: "zone-caldas", name: "NAILAH", business_name: null, phone: "3137505598", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-110", seller_id: SELLER_1_ID, zone_id: "zone-envigado-plaza", name: "NATUAROMA", business_name: null, phone: "3233944210", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-111", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "NATURAL SEX", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-112", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "NATURISTA PAOLA", business_name: null, phone: "3147576260", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-113", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "NATURISTA PLATINO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-114", seller_id: SELLER_1_ID, zone_id: "zone-envigado", name: "NICHES", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-115", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "NIÑOS", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-116", seller_id: SELLER_1_ID, zone_id: "zone-poblado", name: "NOHELIA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-117", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "NUEVO HORIZONTE", business_name: null, phone: "3116468816", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-118", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "NUEVO UNIVERSO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-119", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "ODEON", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-120", seller_id: SELLER_1_ID, zone_id: "zone-poblado", name: "PABILO HOME", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-121", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "PADRE PIO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-122", seller_id: SELLER_1_ID, zone_id: "zone-termianl-sur", name: "PADRE SANTIAGO BEDOYA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-123", seller_id: SELLER_1_ID, zone_id: "zone-guayabal", name: "PANADERIA CAMPO AMOR", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-124", seller_id: SELLER_1_ID, zone_id: "zone-poblado", name: "PANKA NIKKEI", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-125", seller_id: SELLER_1_ID, zone_id: "zone-termianl-sur", name: "PARROQUIA INMACULADA CONCEPCION", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-126", seller_id: SELLER_1_ID, zone_id: "zone-prado", name: "PARROQUIA JESUS EUCARISTIA MEDELLIN", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-127", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "PARROQUIA NIÑO JESUS DE CALATRAVA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-128", seller_id: SELLER_1_ID, zone_id: "zone-pedregal", name: "PEDREGAL", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-129", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "PETHET", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-130", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "PIETRA SANTA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-131", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "PLACITA", business_name: null, phone: "3023077405", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-132", seller_id: SELLER_1_ID, zone_id: "zone-la-america", name: "PRECIOS LOCOS", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-133", seller_id: SELLER_1_ID, zone_id: "zone-envigado", name: "RAPISAVI", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-134", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "REFLEJO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-135", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "ROCIO NOTARIA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-136", seller_id: SELLER_1_ID, zone_id: "zone-envigado", name: "RUISEÑOR", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-137", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "SAN JUDAS", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-138", seller_id: SELLER_1_ID, zone_id: "zone-belen", name: "SANTO CURA DE ARS", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-139", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "SEBASTIAN 7 POTENCIAS", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-140", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "SHADAY", business_name: null, phone: "3127015359", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-141", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "SHADDAY 2", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-142", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "SHADDAY CENTRO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-143", seller_id: SELLER_1_ID, zone_id: "zone-poblado", name: "SHIBARI", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-144", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "SOPLO DE FE LINA BETANCUR", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-145", seller_id: SELLER_1_ID, zone_id: "zone-san-cristobal", name: "STEFANIA INSTAGRAM", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-146", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "STEVEN", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-147", seller_id: SELLER_1_ID, zone_id: "zone-poblado", name: "TALLER DE LAS FLORES", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-148", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "TIA ROSA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-149", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "TROPICO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-150", seller_id: SELLER_1_ID, zone_id: "zone-centro", name: "VATICANO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-151", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "VIVIENDAS DEL SUR", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-152", seller_id: SELLER_1_ID, zone_id: "zone-palmas", name: "VOLVER SIEMPRE VOLVER", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-153", seller_id: SELLER_1_ID, zone_id: "zone-prado", name: "WILTON", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-154", seller_id: SELLER_1_ID, zone_id: "zone-san-pio", name: "X FLACA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-155", seller_id: SELLER_1_ID, zone_id: "zone-bello", name: "CHAMAN", business_name: null, phone: "3105281717", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-156", seller_id: SELLER_1_ID, zone_id: "zone-caldas", name: "BARATON", business_name: null, phone: "3127447049", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-157", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "CAÑA", business_name: null, phone: "3104473569", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-158", seller_id: SELLER_1_ID, zone_id: "zone-poblado", name: "LA REVUELTA", business_name: null, phone: "3245939178", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-159", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "MERCAREMOS", business_name: null, phone: "3007333501", email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-160", seller_id: SELLER_1_ID, zone_id: "zone-sabaneta", name: "LA SABANA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-161", seller_id: SELLER_1_ID, zone_id: "zone-estrella", name: "BUEN SERVICIO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-162", seller_id: SELLER_1_ID, zone_id: "zone-la-america", name: "YOYITO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-163", seller_id: SELLER_1_ID, zone_id: "zone-itagui", name: "CIRCULO ESOTERICO", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
    { id: "client-164", seller_id: SELLER_1_ID, zone_id: "zone-prado", name: "SANDALO VAINILLA", business_name: null, phone: null, email: null, address: null, lat: null, lng: null, notes: null, status: "client", created_at: now(), updated_at: now() },
  ];

  const orders: MockOrder[] = [
    { id: "order-1", client_id: "client-1", seller_id: SELLER_1_ID, status: "delivered", total: 17000, order_number: 1, notes: null, created_at: at(9, 0, -1), updated_at: at(16, 0, -1) },
    { id: "order-2", client_id: "client-5", seller_id: SELLER_1_ID, status: "created", total: 11800, order_number: 2, notes: null, created_at: now(), updated_at: now() },
    { id: "order-3", client_id: "client-6", seller_id: SELLER_2_ID, status: "packed", total: 15900, order_number: 3, notes: null, created_at: now(), updated_at: now() },
    { id: "order-4", client_id: "client-2", seller_id: SELLER_1_ID, status: "cancelled", total: 8500, order_number: 4, notes: null, created_at: at(9, 0, -2), updated_at: at(9, 30, -2) },
    { id: "order-5", client_id: "client-7", seller_id: SELLER_2_ID, status: "picking", total: 5900, order_number: 5, notes: null, created_at: at(8, 30, 0), updated_at: at(9, 0, 0) },
    { id: "order-6", client_id: "client-8", seller_id: SELLER_2_ID, status: "out_for_delivery", total: 8500, order_number: 6, notes: null, created_at: at(9, 0, -1), updated_at: at(14, 0, -1) },
    { id: "order-7", client_id: "client-3", seller_id: SELLER_1_ID, status: "delivered", total: 8500, order_number: 7, notes: null, created_at: at(9, 0, -35), updated_at: at(16, 0, -35) },
    { id: "order-8", client_id: "client-4", seller_id: SELLER_1_ID, status: "delivered", total: 15900, order_number: 8, notes: null, created_at: at(9, 0, -65), updated_at: at(16, 0, -65) },
    { id: "order-9", client_id: "client-4", seller_id: SELLER_1_ID, status: "delivered", total: 8500, order_number: 9, notes: null, created_at: at(9, 0, -35), updated_at: at(15, 0, -35) },
    { id: "order-10", client_id: "client-4", seller_id: SELLER_1_ID, status: "delivered", total: 5900, order_number: 10, notes: null, created_at: at(9, 0, -2), updated_at: at(15, 0, -2) },
  ];

  const orderItems: MockOrderItem[] = [
    { id: "item-1", order_id: "order-1", product_id: PROD_CEL_REF01, quantity: 2, unit_price: 1030, picked: true, note: null },
    { id: "item-2", order_id: "order-2", product_id: PROD_VELA_14, quantity: 2, unit_price: 2890, picked: false, note: null },
    { id: "item-3", order_id: "order-3", product_id: PROD_PEBETERO, quantity: 1, unit_price: 46000, picked: true, note: null },
    { id: "item-4", order_id: "order-4", product_id: PROD_CEL_REF01, quantity: 1, unit_price: 1030, picked: false, note: null },
    { id: "item-5", order_id: "order-5", product_id: PROD_CEL_REF04, quantity: 1, unit_price: 3060, picked: false, note: null },
    { id: "item-6", order_id: "order-6", product_id: PROD_VELA_18, quantity: 1, unit_price: 3720, picked: true, note: null },
    { id: "item-7", order_id: "order-7", product_id: PROD_CEL_REF01, quantity: 1, unit_price: 1030, picked: true, note: null },
    { id: "item-8", order_id: "order-8", product_id: PROD_VELA_2X30, quantity: 1, unit_price: 4810, picked: true, note: null },
    { id: "item-9", order_id: "order-9", product_id: PROD_CEL_REF01, quantity: 1, unit_price: 1030, picked: true, note: null },
    { id: "item-10", order_id: "order-10", product_id: PROD_CEL_REF04, quantity: 1, unit_price: 3060, picked: true, note: null },
  ];

  const orderStatusHistory: MockOrderStatusHistory[] = [
    { id: "hist-1", order_id: "order-1", status: "created", changed_at: at(9, 0, -1) },
    { id: "hist-2", order_id: "order-1", status: "picking", changed_at: at(10, 0, -1) },
    { id: "hist-3", order_id: "order-1", status: "packed", changed_at: at(11, 0, -1) },
    { id: "hist-4", order_id: "order-1", status: "out_for_delivery", changed_at: at(13, 0, -1) },
    { id: "hist-5", order_id: "order-1", status: "delivered", changed_at: at(16, 0, -1) },
    { id: "hist-6", order_id: "order-2", status: "created", changed_at: at(9, 30) },
    { id: "hist-7", order_id: "order-3", status: "created", changed_at: at(8, 0) },
    { id: "hist-8", order_id: "order-3", status: "picking", changed_at: at(9, 0) },
    { id: "hist-9", order_id: "order-3", status: "packed", changed_at: at(10, 0) },
    { id: "hist-10", order_id: "order-4", status: "created", changed_at: at(9, 0, -2) },
    { id: "hist-11", order_id: "order-4", status: "cancelled", changed_at: at(9, 30, -2) },
    { id: "hist-12", order_id: "order-5", status: "created", changed_at: at(8, 30, 0) },
    { id: "hist-13", order_id: "order-5", status: "picking", changed_at: at(9, 0, 0) },
    { id: "hist-14", order_id: "order-6", status: "created", changed_at: at(9, 0, -1) },
    { id: "hist-15", order_id: "order-6", status: "picking", changed_at: at(10, 0, -1) },
    { id: "hist-16", order_id: "order-6", status: "packed", changed_at: at(12, 0, -1) },
    { id: "hist-17", order_id: "order-6", status: "out_for_delivery", changed_at: at(14, 0, -1) },
    { id: "hist-18", order_id: "order-7", status: "created", changed_at: at(9, 0, -35) },
    { id: "hist-19", order_id: "order-7", status: "picking", changed_at: at(10, 0, -35) },
    { id: "hist-20", order_id: "order-7", status: "packed", changed_at: at(11, 0, -35) },
    { id: "hist-21", order_id: "order-7", status: "out_for_delivery", changed_at: at(13, 0, -35) },
    { id: "hist-22", order_id: "order-7", status: "delivered", changed_at: at(16, 0, -35) },
    { id: "hist-23", order_id: "order-8", status: "created", changed_at: at(9, 0, -65) },
    { id: "hist-24", order_id: "order-8", status: "picking", changed_at: at(10, 0, -65) },
    { id: "hist-25", order_id: "order-8", status: "packed", changed_at: at(11, 0, -65) },
    { id: "hist-26", order_id: "order-8", status: "out_for_delivery", changed_at: at(13, 0, -65) },
    { id: "hist-27", order_id: "order-8", status: "delivered", changed_at: at(16, 0, -65) },
    { id: "hist-28", order_id: "order-9", status: "created", changed_at: at(9, 0, -35) },
    { id: "hist-29", order_id: "order-9", status: "picking", changed_at: at(10, 0, -35) },
    { id: "hist-30", order_id: "order-9", status: "packed", changed_at: at(11, 0, -35) },
    { id: "hist-31", order_id: "order-9", status: "out_for_delivery", changed_at: at(13, 0, -35) },
    { id: "hist-32", order_id: "order-9", status: "delivered", changed_at: at(15, 0, -35) },
    { id: "hist-33", order_id: "order-10", status: "created", changed_at: at(9, 0, -2) },
    { id: "hist-34", order_id: "order-10", status: "picking", changed_at: at(10, 0, -2) },
    { id: "hist-35", order_id: "order-10", status: "packed", changed_at: at(11, 0, -2) },
    { id: "hist-36", order_id: "order-10", status: "out_for_delivery", changed_at: at(13, 0, -2) },
    { id: "hist-37", order_id: "order-10", status: "delivered", changed_at: at(15, 0, -2) },
  ];

  const notifications: MockNotification[] = [
    { id: "notif-1", user_id: PICKING_ID, type: "order_created", title: "Nuevo pedido", body: "Se creó un nuevo pedido para preparar.", order_id: "order-2", appointment_id: null, read: false, created_at: at(9, 30) },
    { id: "notif-2", user_id: SELLER_2_ID, type: "order_status_changed", title: "Pedido actualizado", body: "El pedido cambió de estado.", order_id: "order-3", appointment_id: null, read: false, created_at: at(10, 0) },
    { id: "notif-3", user_id: SELLER_1_ID, type: "order_status_changed", title: "Pedido actualizado", body: "El pedido cambió de estado.", order_id: "order-1", appointment_id: null, read: true, created_at: at(16, 0, -1) },
  ];

  return {
    profiles: [
      { id: ADMIN_ID, full_name: "Marisol Admin", email: "admin@velas.test", role: "admin", cedula: "10111213", created_at: now() },
      { id: SELLER_1_ID, full_name: "Camila Rojas", email: "vendedora1@velas.test", role: "seller", cedula: "20212223", created_at: now() },
      { id: SELLER_2_ID, full_name: "Luciana Fernandez", email: "vendedora2@velas.test", role: "seller", cedula: "30313233", created_at: now() },
      { id: PICKING_ID, full_name: "Diego Paredes", email: "preparacion@velas.test", role: "picking_packing", cedula: "40414243", created_at: now() },
    ],
    // city/region are a best-effort classification of real Medellín/Valle de
    // Aburrá geography (Pasto is a different city entirely — confirmed by
    // the user) — editable per-zone from /admin/clientes/zonas since several
    // of these (San Juan, San Pío, Campo Valdez, Barrio Antioquia,
    // Belencito, Robledo, San Lucas, Pedregal, Belén, Guayabal) are genuine
    // judgment calls, not certainties.
    zones: [
      { id: "zone-centro", name: "Zona Centro", description: null, areas: [], city: "Valle de Aburrá", region: "Centro", created_at: now() },
      { id: "zone-poblado", name: "Zona Poblado", description: null, areas: [], city: "Valle de Aburrá", region: "Oriente", created_at: now() },
      { id: "zone-la-america", name: "Zona La America", description: null, areas: [], city: "Valle de Aburrá", region: "Occidente", created_at: now() },
      { id: "zone-caldas", name: "Zona Caldas", description: null, areas: [], city: "Valle de Aburrá", region: "Sur", created_at: now() },
      { id: "zone-belen", name: "Zona Belen", description: null, areas: [], city: "Valle de Aburrá", region: "Occidente", created_at: now() },
      { id: "zone-envigado", name: "Zona Envigado", description: null, areas: [], city: "Valle de Aburrá", region: "Sur", created_at: now() },
      { id: "zone-envigado-plaza", name: "Zona Envigado Plaza", description: null, areas: [], city: "Valle de Aburrá", region: "Sur", created_at: now() },
      { id: "zone-estrella", name: "Zona Estrella", description: null, areas: [], city: "Valle de Aburrá", region: "Sur", created_at: now() },
      { id: "zone-san-juan", name: "Zona San Juan", description: null, areas: [], city: "Valle de Aburrá", region: "Centro", created_at: now() },
      { id: "zone-itagui", name: "Zona Itagui", description: null, areas: [], city: "Valle de Aburrá", region: "Sur", created_at: now() },
      { id: "zone-guayabal", name: "Zona Guayabal", description: null, areas: [], city: "Valle de Aburrá", region: "Sur", created_at: now() },
      { id: "zone-san-pio", name: "Zona San Pio", description: null, areas: [], city: "Valle de Aburrá", region: "Oriente", created_at: now() },
      { id: "zone-copacabana", name: "Zona Copacabana", description: null, areas: [], city: "Valle de Aburrá", region: "Norte", created_at: now() },
      { id: "zone-sabaneta", name: "Zona Sabaneta", description: null, areas: [], city: "Valle de Aburrá", region: "Sur", created_at: now() },
      { id: "zone-campo-valdez", name: "Zona Campo Valdez", description: null, areas: [], city: "Valle de Aburrá", region: "Oriente", created_at: now() },
      { id: "zone-barrio-antioquia", name: "Zona Barrio Antioquia", description: null, areas: [], city: "Valle de Aburrá", region: "Occidente", created_at: now() },
      { id: "zone-belencito", name: "Zona Belencito", description: null, areas: [], city: "Valle de Aburrá", region: "Occidente", created_at: now() },
      { id: "zone-palmas", name: "Zona Palmas", description: null, areas: [], city: "Valle de Aburrá", region: "Oriente", created_at: now() },
      { id: "zone-prado", name: "Zona Prado", description: null, areas: [], city: "Valle de Aburrá", region: "Centro", created_at: now() },
      { id: "zone-pasto", name: "Zona Pasto", description: null, areas: [], city: "Pasto", region: null, created_at: now() },
      { id: "zone-robledo", name: "Zona Robledo", description: null, areas: [], city: "Valle de Aburrá", region: "Occidente", created_at: now() },
      { id: "zone-san-lucas", name: "Zona San Lucas", description: null, areas: [], city: "Valle de Aburrá", region: "Oriente", created_at: now() },
      { id: "zone-bello", name: "Zona Bello", description: null, areas: [], city: "Valle de Aburrá", region: "Norte", created_at: now() },
      { id: "zone-termianl-sur", name: "Zona Termianl Sur", description: null, areas: [], city: "Valle de Aburrá", region: "Sur", created_at: now() },
      { id: "zone-pedregal", name: "Zona Pedregal", description: null, areas: [], city: "Valle de Aburrá", region: "Occidente", created_at: now() },
      { id: "zone-san-cristobal", name: "Zona San Cristobal", description: null, areas: [], city: "Valle de Aburrá", region: "Occidente", created_at: now() },
    ],
    products: [
      { id: PROD_CEL_REF01, sku: "CEL-REF01", name: "Papel Celofán Ref. 1", description: null, category: "Papel celofán", colors: CEL_SOLIDS, price: 1030, quantity_on_hand: 17817, low_stock_threshold: 1500 },
      { id: PROD_CEL_REF02, sku: "CEL-REF02", name: "Papel Celofán Ref. 2", description: null, category: "Papel celofán", colors: [...CEL_SOLIDS, CEL_SIETE_COLORES], price: 1930, quantity_on_hand: 12928, low_stock_threshold: 1500 },
      { id: PROD_CEL_REF03, sku: "CEL-REF03", name: "Papel Celofán Ref. 3", description: null, category: "Papel celofán", colors: [...CEL_SOLIDS, CEL_SIETE_COLORES, ...CEL_COMBOS_3_5_6_7_8_9], price: 2650, quantity_on_hand: 7884, low_stock_threshold: 1500 },
      { id: PROD_CEL_REF04, sku: "CEL-REF04", name: "Papel Celofán Ref. 4", description: null, category: "Papel celofán", colors: CEL_SOLIDS, price: 3060, quantity_on_hand: 5081, low_stock_threshold: 1000 },
      { id: PROD_CEL_REF05, sku: "CEL-REF05", name: "Papel Celofán Ref. 5", description: null, category: "Papel celofán", colors: [...CEL_SOLIDS, ...CEL_COMBOS_3_5_6_7_8_9], price: 3650, quantity_on_hand: 6240, low_stock_threshold: 1000 },
      { id: PROD_CEL_REF06, sku: "CEL-REF06", name: "Papel Celofán Ref. 6", description: null, category: "Papel celofán", colors: [...CEL_SOLIDS, CEL_SIETE_COLORES, ...CEL_COMBOS_3_5_6_7_8_9, CEL_COMBO_VERDE_DORADO], price: 4810, quantity_on_hand: 6812, low_stock_threshold: 1000 },
      { id: PROD_CEL_REF07, sku: "CEL-REF07", name: "Papel Celofán Ref. 7", description: null, category: "Papel celofán", colors: [...CEL_SOLIDS, CEL_SIETE_COLORES, ...CEL_COMBOS_3_5_6_7_8_9, CEL_COMBO_VERDE_DORADO], price: 6180, quantity_on_hand: 5889, low_stock_threshold: 1000 },
      { id: PROD_CEL_REF08, sku: "CEL-REF08", name: "Papel Celofán Ref. 8", description: null, category: "Papel celofán", colors: [...CEL_SOLIDS, CEL_SIETE_COLORES, ...CEL_COMBOS_3_5_6_7_8_9, CEL_COMBO_VERDE_DORADO, ...CEL_COMBOS_8_9], price: 8460, quantity_on_hand: 2866, low_stock_threshold: 600 },
      { id: PROD_CEL_REF09, sku: "CEL-REF09", name: "Papel Celofán Ref. 9", description: null, category: "Papel celofán", colors: [...CEL_SOLIDS, CEL_SIETE_COLORES, ...CEL_COMBOS_3_5_6_7_8_9, CEL_COMBO_VERDE_DORADO, ...CEL_COMBOS_8_9], price: 11570, quantity_on_hand: 2801, low_stock_threshold: 600 },
      { id: PROD_CEL_REF10, sku: "CEL-REF10", name: "Papel Celofán Ref. 10", description: null, category: "Papel celofán", colors: CEL_SOLIDS, price: 9010, quantity_on_hand: 883, low_stock_threshold: 200 },
      { id: PROD_CEL_REF11, sku: "CEL-REF11", name: "Papel Celofán Ref. 11", description: null, category: "Papel celofán", colors: CEL_SOLIDS, price: 15320, quantity_on_hand: 950, low_stock_threshold: 200 },
      { id: PROD_CEL_REF12, sku: "CEL-REF12", name: "Papel Celofán Ref. 12", description: null, category: "Papel celofán", colors: [...CEL_SOLIDS, CEL_SIETE_COLORES], price: 18550, quantity_on_hand: 613, low_stock_threshold: 150 },
      { id: PROD_CEL_REF13, sku: "CEL-REF13", name: "Papel Celofán Ref. 13", description: null, category: "Papel celofán", colors: CEL_SOLIDS, price: 23320, quantity_on_hand: 701, low_stock_threshold: 150 },
      { id: PROD_CEL_REF14, sku: "CEL-REF14", name: "Papel Celofán Ref. 14", description: null, category: "Papel celofán", colors: [...CEL_SOLIDS, CEL_SIETE_COLORES], price: 28410, quantity_on_hand: 726, low_stock_threshold: 150 },
      { id: PROD_CEL_9840, sku: "CEL-9840", name: "Papel Celofán 9.8×40", description: null, category: "Papel celofán", colors: ["Blanco"], price: 34980, quantity_on_hand: 16, low_stock_threshold: 5 },
      { id: PROD_CEL_9850, sku: "CEL-9850", name: "Papel Celofán 9.8×50", description: null, category: "Papel celofán", colors: ["Blanco"], price: 44520, quantity_on_hand: 9, low_stock_threshold: 3 },
      { id: PROD_CEL_EST11, sku: "CEL-EST11", name: "Papel Celofán Estuches Ref. 11", description: null, category: "Papel celofán", colors: [], price: 0, quantity_on_hand: 1000, low_stock_threshold: 200 },
      { id: PROD_CEL_EST13, sku: "CEL-EST13", name: "Papel Celofán Estuches Ref. 13", description: null, category: "Papel celofán", colors: [], price: 0, quantity_on_hand: 1000, low_stock_threshold: 200 },
      { id: PROD_VELA_NAV, sku: "VEL-NAV", name: "Vela Navideña", description: null, category: "Velas", colors: ["Surtida 5 colores"], price: 2700, quantity_on_hand: 3360, low_stock_threshold: 500 },
      { id: PROD_VELA_14, sku: "VEL-14CM", name: "Paquete Vela 14cm (10 unid)", description: null, category: "Velas", colors: CANDLE_ALL_COLORS, price: 2890, quantity_on_hand: 2400, low_stock_threshold: 500 },
      { id: PROD_VELA_18, sku: "VEL-18CM", name: "Paquete Vela 18cm (10 unid)", description: null, category: "Velas", colors: CANDLE_ALL_COLORS, price: 3720, quantity_on_hand: 3400, low_stock_threshold: 500 },
      { id: PROD_VELA_2X19, sku: "VEL-2X19", name: "Paquete Vela 2×19 (10 unid)", description: null, category: "Velas", colors: CANDLE_ALL_COLORS, price: 6470, quantity_on_hand: 2440, low_stock_threshold: 500 },
      { id: PROD_VELA_2X30, sku: "VEL-2X30", name: "Paquete Vela 2×30 (4 unid)", description: null, category: "Velas", colors: CANDLE_NEUTRAL_COLORS, price: 4810, quantity_on_hand: 150, low_stock_threshold: 30 },
      { id: PROD_PEBETERO, sku: "PEB-BLA", name: "Pebeteros Blancos", description: null, category: "Pebeteros", colors: ["Blanco"], price: 46000, quantity_on_hand: 3, low_stock_threshold: 5 },
    ],
    // The union of every color used by any product already seeded in that
    // category — each product's own `colors` is a subset of this palette.
    productCategories: [
      {
        id: "category-papel-celofan",
        name: "Papel celofán",
        colors: [
          ...CEL_SOLIDS,
          CEL_SIETE_COLORES,
          ...CEL_COMBOS_3_5_6_7_8_9,
          CEL_COMBO_VERDE_DORADO,
          ...CEL_COMBOS_8_9,
        ],
        created_at: now(),
      },
      { id: "category-velas", name: "Velas", colors: CANDLE_ALL_COLORS, created_at: now() },
      { id: "category-pebeteros", name: "Pebeteros", colors: ["Blanco"], created_at: now() },
    ],
    // The global color registry — every category's palette is a subset of
    // this list. Seeded as the union of colors already in use above.
    productColors: [
      ...new Set([
        ...CEL_SOLIDS,
        CEL_SIETE_COLORES,
        ...CEL_COMBOS_3_5_6_7_8_9,
        CEL_COMBO_VERDE_DORADO,
        ...CEL_COMBOS_8_9,
        ...CANDLE_ALL_COLORS,
      ]),
    ].map((name) => ({ id: nextId("color"), name, created_at: now() })),
    clients,
    appointments: [
      { id: "appt-1", client_id: "client-1", seller_id: SELLER_1_ID, scheduled_at: at(10, 0), status: "scheduled", notes: "Reposición mensual", created_at: now(), updated_at: now() },
      { id: "appt-2", client_id: "client-3", seller_id: SELLER_1_ID, scheduled_at: at(12, 30), status: "scheduled", notes: "Primera visita, mostrar catálogo regalo", created_at: now(), updated_at: now() },
      { id: "appt-3", client_id: "client-4", seller_id: SELLER_1_ID, scheduled_at: at(15, 0), status: "scheduled", notes: "Visita de prospección agendada", created_at: now(), updated_at: now() },
      { id: "appt-4", client_id: "client-5", seller_id: SELLER_1_ID, scheduled_at: at(11, 0, -2), status: "done", notes: "Compró 3 unidades", created_at: now(), updated_at: now() },
    ],
    orders,
    orderItems,
    orderStatusHistory,
    notifications,
    nextOrderNumber: orders.length + 1,
  };
}

declare global {
  var __velasMockStore: Store | undefined;
}

export function getStore(): Store {
  if (!globalThis.__velasMockStore) {
    globalThis.__velasMockStore = seed();
  }
  return globalThis.__velasMockStore;
}
