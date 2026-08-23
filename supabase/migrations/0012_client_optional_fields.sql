-- Client data is hard to come by up front — only one of business_name /
-- name / phone is guaranteed at creation now (enforced in the app, not
-- here), and address is filled in whenever it's actually known.
alter table public.clients alter column name drop not null;
alter table public.clients alter column address drop not null;
