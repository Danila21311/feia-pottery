-- ============================================================
-- Feia Crafts Studio — Initial Supabase Schema
-- Migrated from Express + Sequelize + SQLite
-- ============================================================

-- ==================== CUSTOM TYPES ====================

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

-- ==================== PROFILES ====================
-- Связана с auth.users через id (Supabase Auth)
-- Заменяет таблицу users (email/password теперь в auth.users)

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User profile data linked to Supabase Auth';

-- ==================== USER ROLES ====================

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, role)
);

comment on table public.user_roles is 'Role assignments for users (admin/user)';

-- ==================== PRODUCTS ====================

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

comment on table public.products is 'Product catalog';

-- ==================== WORKSHOPS ====================

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.workshops is 'Workshop schedule and details';

-- ==================== ORDERS ====================

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.orders is 'Customer orders';

-- ==================== INDEXES ====================

create index idx_products_category on public.products(category);
create index idx_products_collection on public.products(collection);
create index idx_products_in_stock on public.products(in_stock);
create index idx_workshops_date on public.workshops(date);
create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_user_roles_user_id on public.user_roles(user_id);

-- ==================== UPDATED_AT TRIGGER ====================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

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

-- ==================== AUTO-CREATE PROFILE ON SIGNUP ====================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', '')
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'user');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
