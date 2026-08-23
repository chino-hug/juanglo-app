-- Velas: core schema
-- Roles: admin, seller, picking_packing (stored in profiles.role, backed by Supabase Auth users)

create type public.user_role as enum ('admin', 'seller', 'picking_packing');
create type public.client_status as enum ('prospect', 'scheduled', 'client');
create type public.appointment_status as enum ('scheduled', 'done', 'cancelled');
create type public.order_status as enum ('created', 'picking', 'packed', 'out_for_delivery', 'delivered', 'cancelled');

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  role public.user_role not null default 'seller',
  created_at timestamptz not null default now()
);

-- security definer so RLS on profiles never recurses into itself
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- zones
-- ---------------------------------------------------------------------------
create table public.zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  areas jsonb not null default '[]'::jsonb, -- list of area names; polygon geometry is a later, open decision (see PRODUCT.md)
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- clients (clients + prospects)
-- ---------------------------------------------------------------------------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id),
  zone_id uuid references public.zones (id),
  name text not null,
  phone text,
  email text,
  address text not null,
  lat double precision,
  lng double precision,
  notes text,
  status public.client_status not null default 'prospect',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_seller_id_idx on public.clients (seller_id);
create index clients_zone_id_idx on public.clients (zone_id);

-- ---------------------------------------------------------------------------
-- products / stock
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  description text,
  price numeric(10, 2) not null default 0,
  quantity_on_hand integer not null default 0,
  low_stock_threshold integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  seller_id uuid not null references public.profiles (id),
  scheduled_at timestamptz not null,
  status public.appointment_status not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index appointments_seller_id_idx on public.appointments (seller_id);
create index appointments_client_id_idx on public.appointments (client_id);
create index appointments_scheduled_at_idx on public.appointments (scheduled_at);

-- ---------------------------------------------------------------------------
-- orders + line items + audit trail
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id),
  seller_id uuid not null references public.profiles (id),
  status public.order_status not null default 'created',
  total numeric(10, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_seller_id_idx on public.orders (seller_id);
create index orders_client_id_idx on public.orders (client_id);
create index orders_status_idx on public.orders (status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null
);

create index order_items_order_id_idx on public.order_items (order_id);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status public.order_status not null,
  changed_by uuid references public.profiles (id),
  changed_at timestamptz not null default now(),
  notes text
);

create index order_status_history_order_id_idx on public.order_status_history (order_id);

-- ---------------------------------------------------------------------------
-- notifications (in-app notification center)
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null, -- 'order_created' | 'order_status_changed' | 'appointment_reminder'
  title text not null,
  body text,
  order_id uuid references public.orders (id) on delete cascade,
  appointment_id uuid references public.appointments (id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id);
create index notifications_unread_idx on public.notifications (user_id) where read = false;

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_set_updated_at before update on public.clients
  for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger appointments_set_updated_at before update on public.appointments
  for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- order status history: auto-record every status change, and notify
-- ---------------------------------------------------------------------------
create or replace function public.record_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_status_history (order_id, status, changed_by)
    values (new.id, new.status, auth.uid());

    insert into public.notifications (user_id, type, title, body, order_id)
    select id, 'order_created', 'Nuevo pedido', 'Se creó un nuevo pedido para preparar.', new.id
    from public.profiles where role = 'picking_packing';

  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.order_status_history (order_id, status, changed_by)
    values (new.id, new.status, auth.uid());

    insert into public.notifications (user_id, type, title, body, order_id)
    values (new.seller_id, 'order_status_changed', 'Pedido actualizado', 'El pedido cambió de estado.', new.id);
  end if;
  return new;
end;
$$;

create trigger orders_record_status_change
  after insert or update on public.orders
  for each row execute function public.record_order_status_change();
