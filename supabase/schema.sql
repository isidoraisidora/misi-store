create extension if not exists pgcrypto;

create table if not exists public.categories (
  slug text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

insert into public.categories (slug, name) values
  ('маица', 'маица'), ('кошула', 'кошула'), ('блуза', 'блуза'),
  ('фармерки', 'фармерки'), ('пантолони', 'пантолони'), ('сукња', 'сукња'),
  ('фустан', 'фустан'), ('додатоци', 'додатоци'), ('чевли', 'чевли')
on conflict (slug) do update set name = excluded.name;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  image_urls jsonb not null default '[]'::jsonb,
  title text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  size text,
  category_id text not null references public.categories(slug),
  is_available boolean not null default true,
  slug text unique,
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists image_urls jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists title text;
alter table public.products add column if not exists description text;
alter table public.products add column if not exists price_cents integer;
alter table public.products add column if not exists size text;
alter table public.products add column if not exists category_id text;
alter table public.products add column if not exists is_available boolean not null default true;
alter table public.products add column if not exists slug text;

do $$ begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'products' and column_name = 'name') then
    execute 'update public.products set title = coalesce(title, name) where title is null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'products' and column_name = 'category') then
    execute $sql$update public.products set category_id = case lower(coalesce(category, '')) when 'shirt' then 'кошула' when 'shoes' then 'чевли' when 'pants' then 'пантолони' when 'accessories' then 'додатоци' else coalesce(category, 'маица') end where category_id is null$sql$;
  else
    update public.products set category_id = 'маица' where category_id is null;
  end if;
  update public.products set slug = coalesce(slug, lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || id::text) where slug is null;
end $$;

alter table public.products alter column title set not null;
alter table public.products alter column price_cents set not null;
alter table public.products alter column category_id set not null;
alter table public.products drop column if exists condition;
alter table public.products drop column if exists tag;
alter table public.products drop column if exists name;
alter table public.products drop column if exists category;
alter table public.products drop column if exists image_url;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'products_category_id_fkey') then
    alter table public.products add constraint products_category_id_fkey foreign key (category_id) references public.categories(slug);
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('misi-store-images', 'misi-store-images', true)
on conflict (id) do update set public = true;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_first_name text not null,
  customer_last_name text not null,
  email text not null,
  phone text not null,
  address_line text not null,
  city text not null,
  postal_code text,
  country text not null default 'North Macedonia',
  total_cents integer not null check (total_cents >= 0),
  status text not null default 'in_progress' check (status in ('in_progress', 'confirmed', 'discarded')),
  confirmation_token_hash text unique not null,
  confirmation_expires_at timestamptz not null,
  confirmed_at timestamptz,
  discarded_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists customer_first_name text;
alter table public.orders add column if not exists customer_last_name text;
alter table public.orders add column if not exists confirmation_token_hash text;
alter table public.orders add column if not exists confirmation_expires_at timestamptz;
alter table public.orders add column if not exists confirmed_at timestamptz;
alter table public.orders add column if not exists discarded_at timestamptz;

do $$ begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'customer_name') then
    execute $sql$update public.orders set customer_first_name = coalesce(customer_first_name, split_part(customer_name, ' ', 1)), customer_last_name = coalesce(customer_last_name, nullif(trim(substr(customer_name, length(split_part(customer_name, ' ', 1)) + 1)), ''), '-') where customer_first_name is null or customer_last_name is null$sql$;
  else
    update public.orders set customer_first_name = coalesce(customer_first_name, '-'), customer_last_name = coalesce(customer_last_name, '-') where customer_first_name is null or customer_last_name is null;
  end if;
end $$;
update public.orders set confirmation_token_hash = coalesce(confirmation_token_hash, encode(digest(gen_random_uuid()::text, 'sha256'), 'hex')) where confirmation_token_hash is null;
update public.orders set confirmation_expires_at = coalesce(confirmation_expires_at, now() + interval '24 hours') where confirmation_expires_at is null;

alter table public.orders alter column customer_first_name set not null;
alter table public.orders alter column customer_last_name set not null;
alter table public.orders alter column confirmation_token_hash set not null;
alter table public.orders alter column confirmation_expires_at set not null;
alter table public.orders drop constraint if exists orders_status_check;
update public.orders set status = case when status in ('confirmed', 'completed', 'packed', 'shipped') then 'confirmed' else 'discarded' end;
alter table public.orders add constraint orders_status_check check (status in ('in_progress', 'confirmed', 'discarded'));
alter table public.orders drop column if exists customer_name;
alter table public.orders drop column if exists notes;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_title text not null,
  price_cents integer not null check (price_cents >= 0),
  quantity integer not null default 1 check (quantity = 1)
);

alter table public.order_items add column if not exists product_title text;
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'order_items' and column_name = 'product_name') then
    execute 'update public.order_items set product_title = coalesce(product_title, product_name) where product_title is null';
  else
    update public.order_items set product_title = coalesce(product_title, '-') where product_title is null;
  end if;
end $$;
alter table public.order_items alter column product_title set not null;
alter table public.order_items drop column if exists product_name;

alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Anyone can view available products" on public.products;
create policy "Anyone can view available products" on public.products for select using (is_available = true);
drop policy if exists "Anyone can view categories" on public.categories;
create policy "Anyone can view categories" on public.categories for select using (true);

create or replace function public.create_order(order_customer jsonb, requested_items jsonb, token_hash text, token_expires_at timestamptz)
returns table(order_id uuid, order_number text, total_cents integer)
language plpgsql security definer set search_path = public
as $$
declare requested jsonb; product_record public.products%rowtype; new_order_id uuid; new_order_number text; calculated_total integer := 0;
begin
  if jsonb_typeof(requested_items) <> 'array' or jsonb_array_length(requested_items) = 0 then raise exception 'At least one item is required'; end if;
  for requested in select value from jsonb_array_elements(requested_items) loop
    if (requested->>'quantity')::integer <> 1 then raise exception 'Each item can only be ordered once'; end if;
    select * into product_record from public.products where id = (requested->>'productId')::uuid and is_available = true;
    if not found then raise exception 'Product is not available'; end if;
    calculated_total := calculated_total + product_record.price_cents;
  end loop;
  if jsonb_array_length(requested_items) <> (select count(distinct value->>'productId') from jsonb_array_elements(requested_items)) then raise exception 'Duplicate products are not allowed'; end if;
  new_order_number := 'MISI-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  insert into public.orders (order_number, customer_first_name, customer_last_name, email, phone, address_line, city, postal_code, country, total_cents, confirmation_token_hash, confirmation_expires_at)
  values (new_order_number, order_customer->>'firstName', order_customer->>'lastName', order_customer->>'email', order_customer->>'phone', order_customer->>'addressLine', order_customer->>'city', order_customer->>'postalCode', coalesce(order_customer->>'country', 'North Macedonia'), calculated_total, token_hash, token_expires_at)
  returning id into new_order_id;
  for requested in select value from jsonb_array_elements(requested_items) loop
    select * into product_record from public.products where id = (requested->>'productId')::uuid;
    insert into public.order_items (order_id, product_id, product_title, price_cents) values (new_order_id, product_record.id, product_record.title, product_record.price_cents);
  end loop;
  return query select new_order_id, new_order_number, calculated_total;
end;
$$;

create or replace function public.confirm_order(token_hash text)
returns table(order_id uuid, order_number text, result_status text)
language plpgsql security definer set search_path = public
as $$
declare target_order public.orders%rowtype; item record; product_available boolean;
begin
  select * into target_order from public.orders where confirmation_token_hash = token_hash and status = 'in_progress' for update;
  if not found then raise exception 'Order is already confirmed, discarded, or invalid'; end if;
  if target_order.confirmation_expires_at < now() then
    update public.orders set status = 'discarded', discarded_at = now() where id = target_order.id;
    return query select target_order.id, target_order.order_number, 'discarded'::text; return;
  end if;
  for item in select product_id from public.order_items where order_id = target_order.id loop
    select is_available into product_available from public.products where id = item.product_id for update;
    if not coalesce(product_available, false) then
      update public.orders set status = 'discarded', discarded_at = now() where id = target_order.id;
      return query select target_order.id, target_order.order_number, 'discarded'::text; return;
    end if;
  end loop;
  update public.products set is_available = false where id in (select product_id from public.order_items where order_id = target_order.id);
  update public.orders set status = 'confirmed', confirmed_at = now() where id = target_order.id;
  return query select target_order.id, target_order.order_number, 'confirmed'::text;
end;
$$;

revoke all on function public.create_order(jsonb, jsonb, text, timestamptz) from public;
revoke all on function public.confirm_order(text) from public;
grant execute on function public.create_order(jsonb, jsonb, text, timestamptz) to service_role;
grant execute on function public.confirm_order(text) to service_role;
