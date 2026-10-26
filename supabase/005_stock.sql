-- Aurelia store — stock tracking
-- stock = NULL means "not tracked" (always available). 0 = sold out.
alter table public.products add column if not exists stock int check (stock >= 0);

-- Places an order. Prices and delivery fee come from the database; stock is checked and reduced.
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
  v_label    text;
begin
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
    -- lock the row so two customers can't buy the last item at the same time
    select * into v_product from public.products where id = (v_item->>'product_id')::uuid for update;
    if not found then
      raise exception 'A product in your bag is no longer available. Please remove it and try again.';
    end if;
    v_label := trim(coalesce(v_product.brand, '') || ' ' || v_product.name);
    if v_product.stock is not null and v_product.stock < v_qty then
      if v_product.stock = 0 then
        raise exception '% is sold out. Please remove it from your bag.', v_label;
      else
        raise exception 'Only % left of %. Please lower the quantity in your bag.', v_product.stock, v_label;
      end if;
    end if;
    if v_product.stock is not null then
      update public.products set stock = stock - v_qty where id = v_product.id;
    end if;
    insert into public.order_items (order_id, product_id, name, brand, price, qty)
    values (v_order.id, v_product.id, v_product.name, v_product.brand, v_product.price, v_qty);
    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  update public.orders o set subtotal = v_subtotal, total = v_subtotal + v_fee where o.id = v_order.id;
  return query select v_order.id, v_order.order_number, v_subtotal + v_fee;
end $$;

revoke all on function public.place_order(text, text, text, text, text, jsonb) from public;
grant execute on function public.place_order(text, text, text, text, text, jsonb) to anon, authenticated;

-- Put items back on the shelf when an order is cancelled (and take them again if it's un-cancelled)
create or replace function public.restock_on_cancel() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.products p set stock = p.stock + i.qty
    from public.order_items i where i.order_id = new.id and i.product_id = p.id and p.stock is not null;
  elsif old.status = 'cancelled' and new.status <> 'cancelled' then
    update public.products p set stock = greatest(0, p.stock - i.qty)
    from public.order_items i where i.order_id = new.id and i.product_id = p.id and p.stock is not null;
  end if;
  return new;
end $$;

drop trigger if exists orders_restock on public.orders;
create trigger orders_restock after update of status on public.orders
for each row execute function public.restock_on_cancel();
