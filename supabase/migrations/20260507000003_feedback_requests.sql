create table if not exists public.feedback_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  message text not null,
  source text not null default 'contacts_form',
  created_at timestamptz not null default now()
);

create index if not exists idx_feedback_created_at on public.feedback_requests(created_at desc);

alter table public.feedback_requests enable row level security;

drop policy if exists "Anyone can create feedback" on public.feedback_requests;
create policy "Anyone can create feedback"
on public.feedback_requests
for insert
with check (true);

drop policy if exists "Admins can view feedback" on public.feedback_requests;
create policy "Admins can view feedback"
on public.feedback_requests
for select
using (public.is_admin());

drop policy if exists "Users can view own feedback" on public.feedback_requests;
create policy "Users can view own feedback"
on public.feedback_requests
for select
using (auth.uid() = user_id);
