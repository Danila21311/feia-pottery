alter table public.products
  add column if not exists is_published boolean not null default true;

alter table public.workshops
  add column if not exists is_published boolean not null default true;

create index if not exists idx_products_is_published on public.products(is_published);
create index if not exists idx_workshops_is_published on public.workshops(is_published);
