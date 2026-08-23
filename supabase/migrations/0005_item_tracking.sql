-- Velas: per-line-item picking state (verified/packed checkbox, issue note)
-- plus two rule changes the picking/packing UI needed:
--   1. picking/packing may set an order's status to any non-cancelled
--      fulfillment stage (not just the next one) so a mistaken tap can be
--      corrected, instead of only ever moving forward.
--   2. an issue note on a line item notifies the order's seller and every
--      admin, the same way a new order already notifies picking/packing.

alter table public.order_items
  add column picked boolean not null default false,
  add column note text;

-- ---------------------------------------------------------------------------
-- relax orders.status transition rule for picking/packing: any of the five
-- non-cancelled fulfillment stages, not just old_status + 1. Field-level
-- restriction (status only) and the seller/admin branches are unchanged.
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
begin
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

    if new.status <> old.status and not (new.status = any (forward_path)) then
      raise exception 'invalid status for picking/packing';
    end if;
    return new;
  end if;

  raise exception 'not permitted';
end;
$$;

-- ---------------------------------------------------------------------------
-- order_items: picking/packing (and admin) may update picked/note on any
-- item belonging to an order they can see; nothing else about the row.
-- ---------------------------------------------------------------------------
create policy "order_items: picking/packing and admin update"
  on public.order_items for update
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and public.current_user_role() in ('admin', 'picking_packing')
    )
  )
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and public.current_user_role() in ('admin', 'picking_packing')
    )
  );

create or replace function public.enforce_order_item_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_role public.user_role := public.current_user_role();
begin
  if auth.uid() is null or acting_role = 'admin' then
    return new;
  end if;

  if acting_role = 'picking_packing' then
    if new.order_id is distinct from old.order_id
       or new.product_id is distinct from old.product_id
       or new.quantity is distinct from old.quantity
       or new.unit_price is distinct from old.unit_price then
      raise exception 'picking/packing may only update picked and note';
    end if;
    return new;
  end if;

  raise exception 'not permitted';
end;
$$;

create trigger order_items_enforce_update
  before update on public.order_items
  for each row execute function public.enforce_order_item_update();

-- ---------------------------------------------------------------------------
-- notify the order's seller and every admin when a line item gets a new,
-- non-empty note (an issue report: out of stock, short count, etc).
-- ---------------------------------------------------------------------------
create or replace function public.notify_order_item_note()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  seller uuid;
  product_name text;
begin
  if new.note is null or btrim(new.note) = '' or new.note is not distinct from old.note then
    return new;
  end if;

  select seller_id into seller from public.orders where id = new.order_id;
  select name into product_name from public.products where id = new.product_id;

  insert into public.notifications (user_id, type, title, body, order_id)
  select seller, 'order_item_issue', 'Aviso de preparación',
         coalesce(product_name, 'Un producto') || ': ' || new.note, new.order_id
  where seller is not null;

  insert into public.notifications (user_id, type, title, body, order_id)
  select id, 'order_item_issue', 'Aviso de preparación',
         coalesce(product_name, 'Un producto') || ': ' || new.note, new.order_id
  from public.profiles where role = 'admin';

  return new;
end;
$$;

create trigger order_items_notify_note
  after update on public.order_items
  for each row execute function public.notify_order_item_note();
