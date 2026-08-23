-- Velas: human-friendly sequential order number ("N.º 000001"), assigned
-- automatically at creation. Editable afterward by picking/packing and
-- admin only — sellers can see it but never change it, mirroring the
-- status-field restriction pattern already used on orders.

create sequence public.order_number_seq start with 1 increment by 1;

alter table public.orders
  add column order_number integer not null default nextval('public.order_number_seq') unique;

alter sequence public.order_number_seq owned by public.orders.order_number;

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
    if new.order_number is distinct from old.order_number then
      raise exception 'sellers may not change the order number';
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
      raise exception 'picking/packing staff may only update order status and order number';
    end if;

    if new.status <> old.status and not (new.status = any (forward_path)) then
      raise exception 'invalid status for picking/packing';
    end if;
    return new;
  end if;

  raise exception 'not permitted';
end;
$$;
