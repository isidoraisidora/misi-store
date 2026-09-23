create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  category text not null default 'маица',
  price_cents integer not null check (price_cents >= 0),
  size text,
  condition text,
  tag text,
  image_url text,
  image_urls jsonb not null default '[]'::jsonb,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists category text not null default 'маица';
alter table public.products add column if not exists image_urls jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  email text not null,
  phone text not null,
  address_line text not null,
  city text not null,
  postal_code text not null,
  country text not null default 'North Macedonia',
  notes text,
  total_cents integer not null check (total_cents >= 0),
  status text not null default 'new' check (status in ('new', 'confirmed', 'packed', 'shipped', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null,
  price_cents integer not null check (price_cents >= 0),
  quantity integer not null default 1 check (quantity = 1)
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Anyone can view available products"
on public.products for select
using (is_available = true);

create or replace function public.create_order(order_customer jsonb, requested_items jsonb)
returns table(order_id uuid, order_number text, total_cents integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  requested jsonb;
  product_record public.products%rowtype;
  new_order_id uuid;
  new_order_number text;
  calculated_total integer := 0;
  item_count integer := 0;
begin
  if jsonb_typeof(requested_items) <> 'array' or jsonb_array_length(requested_items) = 0 then
    raise exception 'At least one item is required';
  end if;

  for requested in select value from jsonb_array_elements(requested_items)
  loop
    item_count := item_count + 1;

    if (requested->>'quantity')::integer <> 1 then
      raise exception 'Each item can only be ordered once';
    end if;

    select * into product_record
    from public.products
    where id = (requested->>'productId')::uuid
    for update;

    if not found or not product_record.is_available then
      raise exception 'Product is not available';
    end if;

    calculated_total := calculated_total + product_record.price_cents;
  end loop;

  if item_count <> (select count(distinct value->>'productId') from jsonb_array_elements(requested_items)) then
    raise exception 'Duplicate products are not allowed';
  end if;

  new_order_number := 'MISI-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.orders (
    order_number, customer_name, email, phone, address_line, city,
    postal_code, country, notes, total_cents
  ) values (
    new_order_number,
    order_customer->>'name',
    order_customer->>'email',
    order_customer->>'phone',
    order_customer->>'addressLine',
    order_customer->>'city',
    order_customer->>'postalCode',
    coalesce(order_customer->>'country', 'North Macedonia'),
    order_customer->>'notes',
    calculated_total
  ) returning id into new_order_id;

  for requested in select value from jsonb_array_elements(requested_items)
  loop
    select * into product_record
    from public.products
    where id = (requested->>'productId')::uuid;

    insert into public.order_items (order_id, product_id, product_name, price_cents)
    values (new_order_id, product_record.id, product_record.name, product_record.price_cents);

    update public.products set is_available = false where id = product_record.id;
  end loop;

  return query select new_order_id, new_order_number, calculated_total;
end;
$$;

revoke all on function public.create_order(jsonb, jsonb) from public;
grant execute on function public.create_order(jsonb, jsonb) to service_role;
