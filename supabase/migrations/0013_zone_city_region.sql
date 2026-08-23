-- A zone's `city` and `region` group it geographically for filtering — most
-- zones are Valle de Aburrá sectors (city "Medellín", region one of Norte /
-- Sur / Centro / Occidente / Oriente), but a client can be in an entirely
-- different city (e.g. Pasto), where region doesn't apply.
alter table public.zones add column city text;
alter table public.zones add column region text;
