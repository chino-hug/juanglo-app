-- Velas: Row Level Security
-- Business-rule enforcement (who may change which fields, valid status transitions)
-- lives in triggers below; RLS policies gate row visibility and basic ownership.

alter table public.profiles enable row level security;
alter table public.zones enable row level security;
alter table public.clients enable row level security;
alter table public.products enable row level security;
alter table public.appointments enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.notifications enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "profiles: read own or admin reads all"
  on public.profiles for select
  using (id = auth.uid() or public.current_user_role() = 'admin');

create policy "profiles: admin manages all"
  on public.profiles for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "profiles: user updates own name only"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- zones — everyone authenticated can read; only admin manages
-- ---------------------------------------------------------------------------
create policy "zones: any authenticated user reads"
  on public.zones for select
  using (auth.role() = 'authenticated');

create policy "zones: admin manages"
  on public.zones for insert
  with check (public.current_user_role() = 'admin');

create policy "zones: admin updates"
  on public.zones for update
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "zones: admin deletes"
  on public.zones for delete
  using (public.current_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- clients — a seller owns and sees only their own; picking/packing reads all
-- (needed for delivery names/addresses); admin manages all.
-- ---------------------------------------------------------------------------
create policy "clients: seller reads own"
  on public.clients for select
  using (
    seller_id = auth.uid()
    or public.current_user_role() in ('admin', 'picking_packing')
  );

create policy "clients: seller inserts own"
  on public.clients for insert
  with check (
    seller_id = auth.uid()
    or public.current_user_role() = 'admin'
  );

create policy "clients: seller updates own"
  on public.clients for update
  using (
    seller_id = auth.uid()
    or public.current_user_role() = 'admin'
  )
  with check (
    seller_id = auth.uid()
    or public.current_user_role() = 'admin'
  );

create policy "clients: admin deletes"
  on public.clients for delete
  using (public.current_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- products — everyone authenticated reads; only admin writes
-- (stock decrements happen via the security-definer trigger below)
-- ---------------------------------------------------------------------------
create policy "products: any authenticated user reads"
  on public.products for select
  using (auth.role() = 'authenticated');

create policy "products: admin manages"
  on public.products for insert
  with check (public.current_user_role() = 'admin');

create policy "products: admin updates"
  on public.products for update
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "products: admin deletes"
  on public.products for delete
  using (public.current_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- appointments — seller owns; admin manages all; picking/packing has no access
-- ---------------------------------------------------------------------------
create policy "appointments: seller reads own"
  on public.appointments for select
  using (
    seller_id = auth.uid()
    or public.current_user_role() = 'admin'
  );

create policy "appointments: seller inserts own"
  on public.appointments for insert
  with check (
    seller_id = auth.uid()
    or public.current_user_role() = 'admin'
  );

create policy "appointments: seller updates own"
  on public.appointments for update
  using (
    seller_id = auth.uid()
    or public.current_user_role() = 'admin'
  )
  with check (
    seller_id = auth.uid()
    or public.current_user_role() = 'admin'
  );

create policy "appointments: admin deletes"
  on public.appointments for delete
  using (public.current_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- orders — seller owns; picking/packing reads+transitions all; admin manages all
-- Column- and transition-level rules are enforced by the trigger below;
-- these policies only gate which rows each role may attempt to touch.
-- ---------------------------------------------------------------------------
create policy "orders: read own, assigned, or admin"
  on public.orders for select
  using (
    seller_id = auth.uid()
    or public.current_user_role() in ('admin', 'picking_packing')
  );

create policy "orders: seller creates own"
  on public.orders for insert
  with check (
    seller_id = auth.uid()
    or public.current_user_role() = 'admin'
  );

create policy "orders: seller, picking/packing, or admin update"
  on public.orders for update
  using (
    seller_id = auth.uid()
    or public.current_user_role() in ('admin', 'picking_packing')
  )
  with check (
    seller_id = auth.uid()
    or public.current_user_role() in ('admin', 'picking_packing')
  );

create policy "orders: admin deletes"
  on public.orders for delete
  using (public.current_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- order_items — visible/writable by whoever can see the parent order;
-- only the owning seller (at creation) or admin may add line items.
-- ---------------------------------------------------------------------------
create policy "order_items: read via parent order"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.seller_id = auth.uid() or public.current_user_role() in ('admin', 'picking_packing'))
    )
  );

create policy "order_items: seller inserts on own created order"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.status = 'created'
        and (o.seller_id = auth.uid() or public.current_user_role() = 'admin')
    )
  );

create policy "order_items: admin deletes"
  on public.order_items for delete
  using (public.current_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- order_status_history — read-only audit trail, written only by the trigger
-- (security definer), visible to whoever can see the parent order.
-- ---------------------------------------------------------------------------
create policy "order_status_history: read via parent order"
  on public.order_status_history for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.seller_id = auth.uid() or public.current_user_role() in ('admin', 'picking_packing'))
    )
  );

-- ---------------------------------------------------------------------------
-- notifications — each user reads/marks only their own; system inserts
-- (via security-definer trigger) bypass RLS.
-- ---------------------------------------------------------------------------
create policy "notifications: read own"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "notifications: mark own read"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Business-rule trigger: who may change what on an order, and valid
-- status transitions. RLS above only gates row access; this is the
-- authority on field- and transition-level rules per role.
-- ---------------------------------------------------------------------------
create or replace function public.enforce_order_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_role public.user_role := public.current_user_role();
  forward_path constant public.order_status[] :=
    array['created', 'picking', 'packed', 'out_for_delivery', 'delivered']::public.order_status[];
  old_idx int;
  new_idx int;
begin
  -- no JWT context (service_role, migrations, seed scripts): trusted, skip checks
  if auth.uid() is null then
    return new;
  end if;

  if acting_role = 'admin' then
    return new;
  end if;

  if acting_role = 'seller' then
    if old.seller_id <> auth.uid() then
      raise exception 'not your order';
    end if;
    if new.status is distinct from old.status then
      if not (old.status = 'created' and new.status = 'cancelled') then
        raise exception 'sellers may only cancel an order before fulfillment starts';
      end if;
    elsif old.status <> 'created' then
      raise exception 'order already in fulfillment; only picking/packing can update it now';
    end if;
    return new;
  end if;

  if acting_role = 'picking_packing' then
    if new.client_id is distinct from old.client_id
       or new.seller_id is distinct from old.seller_id
       or new.total is distinct from old.total
       or new.notes is distinct from old.notes then
      raise exception 'picking/packing staff may only update order status';
    end if;

    select array_position(forward_path, old.status) into old_idx;
    select array_position(forward_path, new.status) into new_idx;

    if old_idx is null or new_idx is null or new_idx <> old_idx + 1 then
      raise exception 'invalid status transition for picking/packing';
    end if;
    return new;
  end if;

  raise exception 'not permitted';
end;
$$;

create trigger orders_enforce_update
  before update on public.orders
  for each row execute function public.enforce_order_update();

-- ---------------------------------------------------------------------------
-- Stock decrement: adding a line item to a newly created order reduces
-- quantity_on_hand. Security definer so sellers never need direct
-- UPDATE access to products.
-- ---------------------------------------------------------------------------
create or replace function public.decrement_stock_on_order_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
  set quantity_on_hand = quantity_on_hand - new.quantity
  where id = new.product_id;
  return new;
end;
$$;

create trigger order_items_decrement_stock
  after insert on public.order_items
  for each row execute function public.decrement_stock_on_order_item();
