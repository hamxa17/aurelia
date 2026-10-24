-- Calls the order-alert Edge Function after every new order (sends the owner an email).
-- The anon key is public by design; the function itself only emails about real, recent orders.
create extension if not exists pg_net with schema extensions;

create or replace function public.notify_order_alert() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform net.http_post(
    url     := 'https://wshxztnvgbpjukwgcajx.supabase.co/functions/v1/order-alert',
    body    := jsonb_build_object('type', 'INSERT', 'table', 'orders', 'record', jsonb_build_object('id', new.id)),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaHh6dG52Z2JwanVrd2djYWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NzI2OTYsImV4cCI6MjEwMTM0ODY5Nn0.sMLtEHZBtQYPwLAS15tba0gCqXbDKVbWTc9kwZaqY0o'
    ),
    timeout_milliseconds := 10000
  );
  return new;
end $$;

drop trigger if exists orders_alert on public.orders;
create trigger orders_alert after insert on public.orders
for each row execute function public.notify_order_alert();

select 'order alert trigger ready' as status;
