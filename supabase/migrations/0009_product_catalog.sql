-- Velas: product catalog gets a category and a list of available colors —
-- one SKU (e.g. a roll of cellophane at a given size/"reference") can come
-- in several colors, tracked as one stock count, not one row per color.
alter table public.products add column category text not null default 'General';
alter table public.products add column colors jsonb not null default '[]'::jsonb;
