-- Velas: enable Supabase Realtime on the tables the UI subscribes to
-- (notification bell/list, live order status on order detail pages).
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.orders;
