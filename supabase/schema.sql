-- Aurelia store — database setup
-- Run this ONCE in Supabase: Dashboard → SQL Editor → New query → paste → Run.

-- ─────────────────────────────────────────────
-- 1. Products table (one row per product)
-- ─────────────────────────────────────────────
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 1 and 120),
  price        numeric(10,2) not null check (price >= 0),
  note         text check (char_length(note) <= 200),
  accent       text not null default 'rose'
               check (accent in ('rose','gold','berry','sage','clay')),
  badge        text check (char_length(badge) <= 30),
  image_url    text,
  description  text check (char_length(description) <= 4000),
  section      text not null
               check (section in ('newArrivals','skincare','haircare','supplements','lipbalm')),
  subcategory  text,           -- only used by skincare / haircare (e.g. 'Facewash')
  sort_order   int  not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists products_section_idx on public.products (section, subcategory);

-- keep updated_at fresh
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────
-- 2. Admins table — only users listed here can change products
-- ─────────────────────────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ─────────────────────────────────────────────
-- 3. Row Level Security — the actual lock on the door
-- ─────────────────────────────────────────────
alter table public.products enable row level security;
alter table public.admins   enable row level security;

drop policy if exists "Anyone can view products" on public.products;
create policy "Anyone can view products" on public.products
  for select using (true);

drop policy if exists "Admins can add products" on public.products;
create policy "Admins can add products" on public.products
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can edit products" on public.products;
create policy "Admins can edit products" on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products
  for delete to authenticated using (public.is_admin());

-- A signed-in user may only check whether THEY are an admin. Nobody can add admins from the website.
drop policy if exists "Users can see their own admin row" on public.admins;
create policy "Users can see their own admin row" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- 4. Image storage bucket (public to view, admin-only to upload)
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 3145728,
        array['image/jpeg','image/png','image/webp','image/gif','image/avif'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view product images" on storage.objects;
create policy "Anyone can view product images" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
