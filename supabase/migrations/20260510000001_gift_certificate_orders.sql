-- Заявки на электронные подарочные сертификаты (отдельно от заказов товаров с доставкой)

create table if not exists public.gift_certificate_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null check (amount >= 500),
  recipient_name text not null,
  message text,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  contact_method text not null default 'telegram' check (contact_method in ('telegram', 'max', 'phone')),
  payment_status text not null default 'pending_manager' check (payment_status in ('pending_manager', 'paid', 'cancelled')),
  comment text,
  created_at timestamptz not null default now()
);

comment on table public.gift_certificate_orders is 'Заявки на подарочные сертификаты (без доставки, отдельный процесс от orders)';

create index if not exists idx_gift_certificate_orders_user_id on public.gift_certificate_orders(user_id);
create index if not exists idx_gift_certificate_orders_created_at on public.gift_certificate_orders(created_at desc);

alter table public.gift_certificate_orders enable row level security;

drop policy if exists "Users can view own gift certificate orders" on public.gift_certificate_orders;
create policy "Users can view own gift certificate orders"
on public.gift_certificate_orders
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create own gift certificate orders" on public.gift_certificate_orders;
create policy "Users can create own gift certificate orders"
on public.gift_certificate_orders
for insert
with check (auth.uid() = user_id);

drop policy if exists "Admins can view gift certificate orders" on public.gift_certificate_orders;
create policy "Admins can view gift certificate orders"
on public.gift_certificate_orders
for select
using (public.is_admin());
