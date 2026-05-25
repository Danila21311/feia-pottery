-- Гончарная мастерская «Фея» — PostgreSQL schema (Railway)

create type public.order_status as enum (
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

create type public.user_role as enum (
  'admin',
  'user'
);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password_hash text not null,
  email_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_unique unique (email)
);

create index idx_users_email_lower on public.users (lower(email));

create table public.profiles (
  id uuid primary key references public.users(id) on delete cascade,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, role)
);

create table public.products (
  id text primary key,
  name text not null,
  price integer not null check (price >= 0),
  category text not null,
  images jsonb not null default '[]'::jsonb,
  description text,
  dimensions text,
  care text,
  in_stock boolean not null default true,
  is_new boolean not null default false,
  collection text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workshops (
  id text primary key,
  title text not null,
  date text not null,
  time text not null,
  duration text not null,
  format text not null,
  price integer not null check (price >= 0),
  max_participants integer not null check (max_participants >= 1),
  current_participants integer not null default 0,
  description text,
  includes jsonb not null default '[]'::jsonb,
  level text,
  what_you_create text,
  take_home text,
  result_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  status public.order_status not null default 'pending',
  total integer not null,
  items jsonb not null default '[]'::jsonb,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  comment text,
  customer_type text not null default 'individual' check (customer_type in ('individual', 'legal')),
  delivery_method text not null default 'pickup_moscow',
  delivery_type text not null default 'address' check (delivery_type in ('address', 'pickup_point')),
  city text not null default '',
  full_address text,
  recipient_type text not null default 'self' check (recipient_type in ('self', 'other')),
  recipient_name text,
  recipient_phone text,
  legal_company_name text,
  legal_inn text,
  contact_method text not null default 'telegram' check (contact_method in ('telegram', 'max', 'phone')),
  payment_method text not null default 'manager_confirmation' check (payment_method in ('manager_confirmation')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workshop_bookings (
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

create table public.feedback_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  message text not null,
  source text not null default 'contacts_form',
  created_at timestamptz not null default now()
);

create table public.gift_certificate_orders (
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

create index idx_products_category on public.products(category);
create index idx_products_collection on public.products(collection);
create index idx_products_in_stock on public.products(in_stock);
create index idx_workshops_date on public.workshops(date);
create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_payment_method on public.orders(payment_method);
create index idx_orders_contact_method on public.orders(contact_method);
create index idx_orders_created_at on public.orders(created_at desc);
create index idx_user_roles_user_id on public.user_roles(user_id);
create index idx_feedback_created_at on public.feedback_requests(created_at desc);
create index idx_gift_certificate_orders_user_id on public.gift_certificate_orders(user_id);
create index idx_gift_certificate_orders_created_at on public.gift_certificate_orders(created_at desc);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.users
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.user_roles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.products
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.workshops
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.orders
  for each row execute function public.handle_updated_at();

create table if not exists public.schema_migrations (
  id text primary key,
  applied_at timestamptz not null default now()
);
