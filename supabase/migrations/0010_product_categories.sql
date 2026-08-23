-- Velas: product categories, each owning its own palette of colors. A
-- product's own `colors` stays a subset of its category's palette — the
-- category defines what's possible, the product picks what applies to it.
create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  colors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.product_categories enable row level security;

create policy "product_categories: any authenticated user reads"
  on public.product_categories for select
  using (auth.role() = 'authenticated');

create policy "product_categories: admin inserts"
  on public.product_categories for insert
  with check (public.current_user_role() = 'admin');

create policy "product_categories: admin updates"
  on public.product_categories for update
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "product_categories: admin deletes"
  on public.product_categories for delete
  using (public.current_user_role() = 'admin');
