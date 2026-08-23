-- Admins previously received no in-app notifications at all. New orders and
-- status changes (including cancellations, which flow through the same
-- UPDATE branch) now also notify every admin, alongside the existing
-- picking/packing and seller recipients — mirrors the mock-mode fan-out in
-- src/lib/mock/mutations.ts.
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
    from public.profiles where role in ('picking_packing', 'admin');

  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.order_status_history (order_id, status, changed_by)
    values (new.id, new.status, auth.uid());

    insert into public.notifications (user_id, type, title, body, order_id)
    select new.seller_id, 'order_status_changed', 'Pedido actualizado', 'El pedido cambió de estado.', new.id
    union all
    select id, 'order_status_changed', 'Pedido actualizado', 'El pedido cambió de estado.', new.id
    from public.profiles where role = 'admin';
  end if;
  return new;
end;
$$;
