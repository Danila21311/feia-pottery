-- После записи на МК нужно увеличить current_participants.
-- Прямой UPDATE на workshops разрешён только админам (RLS), поэтому используем SECURITY DEFINER.

create or replace function public.increment_workshop_participants(p_workshop_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  update public.workshops
  set current_participants = current_participants + 1
  where id = p_workshop_id;
end;
$$;

revoke all on function public.increment_workshop_participants(text) from public;
grant execute on function public.increment_workshop_participants(text) to authenticated;
