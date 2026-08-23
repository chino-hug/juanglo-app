-- Velas: cédula as the business-facing unique ID for staff, separate from
-- the auth.users UUID that profiles.id must stay pinned to for Supabase
-- Auth to keep working.
alter table public.profiles add column cedula text;

-- Backfill first so the NOT NULL/UNIQUE constraints below don't choke on
-- existing rows.
update public.profiles
  set cedula = 'SIN-CEDULA-' || substr(id::text, 1, 8)
  where cedula is null;

-- The signup trigger (0003_auth_trigger.sql) doesn't know about cédula yet —
-- fix it so any auth.users insert from here on (including the seed script's
-- own inserts, which run after this migration) still satisfies NOT NULL.
-- The admin "create user" flow overwrites this placeholder with the real
-- cédula right after createUser() succeeds.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, cedula)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    'seller',
    coalesce(new.raw_user_meta_data ->> 'cedula', 'SIN-CEDULA-' || substr(new.id::text, 1, 8))
  );
  return new;
end;
$$;

alter table public.profiles alter column cedula set not null;
alter table public.profiles add constraint profiles_cedula_key unique (cedula);
