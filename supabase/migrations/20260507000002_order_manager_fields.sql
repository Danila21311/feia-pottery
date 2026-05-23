alter table public.orders
add column if not exists customer_type text not null default 'individual' check (customer_type in ('individual', 'legal')),
add column if not exists delivery_method text not null default 'pickup_moscow',
add column if not exists delivery_type text not null default 'address' check (delivery_type in ('address', 'pickup_point')),
add column if not exists city text not null default '',
add column if not exists full_address text,
add column if not exists recipient_type text not null default 'self' check (recipient_type in ('self', 'other')),
add column if not exists recipient_name text,
add column if not exists recipient_phone text,
add column if not exists legal_company_name text,
add column if not exists legal_inn text,
add column if not exists contact_method text not null default 'telegram' check (contact_method in ('telegram', 'max', 'phone')),
add column if not exists payment_method text not null default 'manager_confirmation' check (payment_method in ('manager_confirmation'));

create index if not exists idx_orders_payment_method on public.orders(payment_method);
create index if not exists idx_orders_contact_method on public.orders(contact_method);
