-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.products enable row level security;
alter table public.workshops enable row level security;
alter table public.orders enable row level security;

-- ==================== HELPER: IS ADMIN ====================

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$ language sql security definer stable;

-- ==================== PROFILES ====================

-- Все могут видеть профили (для отображения имён)
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- Пользователь может обновлять только свой профиль
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Вставка через триггер on_auth_user_created (service_role)
-- Пользователям напрямую не нужно делать insert

-- ==================== USER ROLES ====================

-- Пользователь видит свои роли
create policy "Users can view own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

-- Админ видит все роли
create policy "Admins can view all roles"
  on public.user_roles for select
  using (public.is_admin());

-- Только админ может назначать/удалять роли
create policy "Admins can manage roles"
  on public.user_roles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ==================== PRODUCTS ====================

-- Все могут читать продукты (каталог публичный)
create policy "Products are viewable by everyone"
  on public.products for select
  using (true);

-- Только админ может создавать/обновлять/удалять продукты
create policy "Admins can insert products"
  on public.products for insert
  with check (public.is_admin());

create policy "Admins can update products"
  on public.products for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete products"
  on public.products for delete
  using (public.is_admin());

-- ==================== WORKSHOPS ====================

-- Все могут читать мастер-классы
create policy "Workshops are viewable by everyone"
  on public.workshops for select
  using (true);

-- Только админ может управлять мастер-классами
create policy "Admins can insert workshops"
  on public.workshops for insert
  with check (public.is_admin());

create policy "Admins can update workshops"
  on public.workshops for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete workshops"
  on public.workshops for delete
  using (public.is_admin());

-- ==================== ORDERS ====================

-- Пользователь видит свои заказы
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Админ видит все заказы
create policy "Admins can view all orders"
  on public.orders for select
  using (public.is_admin());

-- Любой аутентифицированный пользователь может создать заказ
-- (гостевые заказы создаются через service_role на сервере или Edge Function)
create policy "Authenticated users can create orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Только админ может обновлять статус заказа
create policy "Admins can update orders"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());
