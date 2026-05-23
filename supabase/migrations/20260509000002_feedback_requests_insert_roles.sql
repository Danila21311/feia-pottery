-- Серверная форма обратной связи ходит с anon-ключом без JWT (гости).
-- Явно разрешаем вставку ролям anon и authenticated, чтобы не было отказа RLS.

drop policy if exists "Anyone can create feedback" on public.feedback_requests;

create policy "Anyone can create feedback"
on public.feedback_requests
as permissive
for insert
to anon, authenticated
with check (true);

grant insert on table public.feedback_requests to anon, authenticated;
