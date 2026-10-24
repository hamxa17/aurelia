-- Aurelia store — orders, reviews, saved carts, store settings, brands
-- Run AFTER schema.sql. Safe to run more than once.

-- ─────────────────────────────────────────────
-- 1. Brand name on products (shown above the product name)
-- ─────────────────────────────────────────────
alter table public.products add column if not exists brand text check (char_length(brand) <= 40);

-- ─────────────────────────────────────────────
-- 2. Store settings (one row) — delivery fees + contact details, editable in the admin panel
-- ─────────────────────────────────────────────
create table if not exists public.store_settings (
  id                     int primary key default 1 check (id = 1),
  delivery_inside_dhaka  numeric(10,2) not null default 70  check (delivery_inside_dhaka  >= 0),
  delivery_outside_dhaka numeric(10,2) not null default 130 check (delivery_outside_dhaka >= 0),
  whatsapp               text check (char_length(whatsapp) <= 20),
  phone                  text check (char_length(phone) <= 20),
  email                  text check (char_length(email) <= 120),
  facebook_url           text check (char_length(facebook_url) <= 300),
  updated_at             timestamptz not null default now()
);
insert into public.store_settings (id) values (1) on conflict (id) do nothing;

alter table public.store_settings enable row level security;
drop policy if exists "Anyone can read store settings" on public.store_settings;
create policy "Anyone can read store settings" on public.store_settings for select using (true);
drop policy if exists "Admins can edit store settings" on public.store_settings;
create policy "Admins can edit store settings" on public.store_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────
-- 3. Orders (cash on delivery)
-- ─────────────────────────────────────────────
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   bigint generated always as identity (start with 1001) unique,
  user_id        uuid references auth.users(id) on delete set null,
  customer_name  text not null check (char_length(customer_name) between 2 and 80),
  phone          text not null check (phone ~ '^01[3-9][0-9]{8}$'),
  address        text not null check (char_length(address) between 8 and 300),
  area           text not null check (area in ('inside_dhaka', 'outside_dhaka')),
  note           text check (char_length(note) <= 500),
  subtotal       numeric(10,2) not null,
  delivery_fee   numeric(10,2) not null,
  total          numeric(10,2) not null,
  payment_method text not null default 'cod' check (payment_method = 'cod'),
  status         text not null default 'pending'
                 check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status, created_at desc);

create table if not exists public.order_items (
  id          bigint generated always as identity primary key,
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  name        text not null,
  brand       text,
  price       numeric(10,2) not null,
  qty         int not null check (qty between 1 and 50)
);
create index if not exists order_items_order_idx on public.order_items (order_id);

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
for each row execute function public.touch_updated_at();

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Nobody inserts orders directly — only through place_order() below, which sets the prices itself.
drop policy if exists "Customers see own orders, admins see all" on public.orders;
create policy "Customers see own orders, admins see all" on public.orders
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins delete orders" on public.orders;
create policy "Admins delete orders" on public.orders
  for delete to authenticated using (public.is_admin());

drop policy if exists "Customers see own order items, admins see all" on public.order_items;
create policy "Customers see own order items, admins see all" on public.order_items
  for select to authenticated using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- Places an order. Prices and delivery fee come from the database, never from the browser.
create or replace function public.place_order(
  p_name text, p_phone text, p_address text, p_area text, p_note text, p_items jsonb
) returns table (order_id uuid, order_number bigint, total numeric)
language plpgsql security definer set search_path = public as $$
declare
  v_phone    text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_fee      numeric;
  v_subtotal numeric := 0;
  v_order    public.orders;
  v_item     jsonb;
  v_product  public.products;
  v_qty      int;
begin
  -- accept 8801XXXXXXXXX / 01XXXXXXXXX
  if v_phone like '880%' then v_phone := substr(v_phone, 3); end if;

  if v_phone !~ '^01[3-9][0-9]{8}$' then
    raise exception 'Please enter a valid Bangladeshi mobile number, like 01712345678.';
  end if;
  if p_area not in ('inside_dhaka', 'outside_dhaka') then
    raise exception 'Please choose a delivery area.';
  end if;
  if char_length(trim(coalesce(p_name, ''))) < 2 then
    raise exception 'Please enter your name.';
  end if;
  if char_length(trim(coalesce(p_address, ''))) < 8 then
    raise exception 'Please enter your full delivery address.';
  end if;

  if jsonb_typeof(p_items) is distinct from 'array'
     or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 30 then
    raise exception 'Your bag is empty or too large.';
  end if;

  -- simple spam guard: max 5 orders per phone number per hour
  if (select count(*) from public.orders o
      where o.phone = v_phone and o.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many orders from this phone number. Please try again later.';
  end if;

  select case when p_area = 'inside_dhaka' then s.delivery_inside_dhaka else s.delivery_outside_dhaka end
    into v_fee from public.store_settings s where s.id = 1;

  insert into public.orders (user_id, customer_name, phone, address, area, note, subtotal, delivery_fee, total)
  values (auth.uid(), trim(p_name), v_phone, trim(p_address), p_area, nullif(trim(coalesce(p_note, '')), ''), 0, v_fee, 0)
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'qty')::int;
    if v_qty is null or v_qty < 1 or v_qty > 50 then
      raise exception 'Invalid quantity.';
    end if;
    select * into v_product from public.products where id = (v_item->>'product_id')::uuid;
    if not found then
      raise exception 'A product in your bag is no longer available. Please remove it and try again.';
    end if;
    insert into public.order_items (order_id, product_id, name, brand, price, qty)
    values (v_order.id, v_product.id, v_product.name, v_product.brand, v_product.price, v_qty);
    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  update public.orders o set subtotal = v_subtotal, total = v_subtotal + v_fee
  where o.id = v_order.id;

  return query select v_order.id, v_order.order_number, v_subtotal + v_fee;
end $$;

revoke all on function public.place_order(text, text, text, text, text, jsonb) from public;
grant execute on function public.place_order(text, text, text, text, text, jsonb) to anon, authenticated;

-- ─────────────────────────────────────────────
-- 4. Saved carts for signed-in customers
-- ─────────────────────────────────────────────
create table if not exists public.carts (
  user_id    uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  items      jsonb not null default '[]'::jsonb
             check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 50),
  updated_at timestamptz not null default now()
);
alter table public.carts enable row level security;
drop policy if exists "Customers manage their own cart" on public.carts;
create policy "Customers manage their own cart" on public.carts
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- 5. Product reviews (signed-in customers, one per product)
-- ─────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade default auth.uid(),
  author_name text not null check (char_length(author_name) between 1 and 40),
  rating      int  not null check (rating between 1 and 5),
  comment     text not null check (char_length(comment) between 2 and 1000),
  created_at  timestamptz not null default now(),
  unique (product_id, user_id)
);
create index if not exists reviews_product_idx on public.reviews (product_id, created_at desc);

alter table public.reviews enable row level security;
drop policy if exists "Anyone can read reviews" on public.reviews;
create policy "Anyone can read reviews" on public.reviews for select using (true);
drop policy if exists "Signed-in customers write their own review" on public.reviews;
create policy "Signed-in customers write their own review" on public.reviews
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Customers edit their own review" on public.reviews;
create policy "Customers edit their own review" on public.reviews
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Customers or admins delete reviews" on public.reviews;
create policy "Customers or admins delete reviews" on public.reviews
  for delete to authenticated using (user_id = auth.uid() or public.is_admin());
