alter table public.workshops
add column if not exists what_you_create text,
add column if not exists take_home text,
add column if not exists result_image text;

create table if not exists public.workshop_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  workshop_id text not null references public.workshops(id) on delete cascade,
  workshop_title text not null,
  workshop_date text not null,
  workshop_time text not null,
  selected_format text not null,
  level text,
  price integer not null check (price >= 0),
  payment_status text not null default 'pending_manager' check (payment_status in ('pending_manager', 'paid', 'cancelled')),
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  comment text,
  created_at timestamptz not null default now()
);

alter table public.workshop_bookings enable row level security;

drop policy if exists "Users can view own workshop bookings" on public.workshop_bookings;
create policy "Users can view own workshop bookings"
on public.workshop_bookings
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create own workshop bookings" on public.workshop_bookings;
create policy "Users can create own workshop bookings"
on public.workshop_bookings
for insert
with check (auth.uid() = user_id);

drop policy if exists "Admins can view workshop bookings" on public.workshop_bookings;
create policy "Admins can view workshop bookings"
on public.workshop_bookings
for select
using (public.is_admin());
