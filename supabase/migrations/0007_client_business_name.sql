-- Velas: business name on clients — the contact person and the business
-- they represent aren't always the same name (many sellers work with
-- small shops), so record both. Optional: not every client is a business.
alter table public.clients
  add column business_name text;
