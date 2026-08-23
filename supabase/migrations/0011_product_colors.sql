-- Velas: the global color registry. Categories pick their palette from
-- here (as a jsonb array of names, same pattern as product_categories.colors
-- and products.category — matched by name, not a foreign key), and products
-- pick from their category's palette in turn. Three levels, each a subset
-- of the one above it.
create table public.product_colors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.product_colors enable row level security;

create policy "product_colors: any authenticated user reads"
  on public.product_colors for select
  using (auth.role() = 'authenticated');

create policy "product_colors: admin inserts"
  on public.product_colors for insert
  with check (public.current_user_role() = 'admin');

create policy "product_colors: admin updates"
  on public.product_colors for update
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "product_colors: admin deletes"
  on public.product_colors for delete
  using (public.current_user_role() = 'admin');
