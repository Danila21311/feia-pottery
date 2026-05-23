-- Явная проверка занятости email перед регистрацией.
-- GoTrue при повторной регистрации может не вернуть понятную ошибку (в т.ч. при настройках подтверждения почты).

create or replace function public.auth_email_is_taken(p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text;
begin
  normalized := lower(trim(coalesce(p_email, '')));
  if normalized = '' then
    return false;
  end if;
  return exists (
    select 1
    from auth.users u
    where lower(u.email) = normalized
  );
end;
$$;

comment on function public.auth_email_is_taken(text) is
  'true, если в auth.users уже есть пользователь с таким email (сравнение без учёта регистра).';

revoke all on function public.auth_email_is_taken(text) from public;
grant execute on function public.auth_email_is_taken(text) to anon, authenticated;
