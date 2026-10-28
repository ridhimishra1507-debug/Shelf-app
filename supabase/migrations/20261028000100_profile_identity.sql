-- Shelf Identity: a private, case-insensitive username and preferred "Call me" name.
--
-- The foundation migration already introduced profiles and populated new Auth users through
-- handle_new_user(). This migration evolves that table without assigning identity data to
-- existing people. Accounts that somehow predate a profile row get a blank profile instead.

alter table public.profiles
  add column username text,
  add constraint profiles_username_lowercase_check check (
    username is null or username = lower(username)
  ),
  add constraint profiles_username_format_check check (
    username is null or username ~ '^[a-z0-9_]{3,30}$'
  );

create unique index profiles_username_lower_key
  on public.profiles (lower(username))
  where username is not null;

comment on column public.profiles.display_name is
  'The private preferred name shown as "Call me" in Shelf.';
comment on column public.profiles.username is
  'A private account username, normalized to lowercase and unique case-insensitively.';

-- Do not manufacture usernames or overwrite existing profile values. This only repairs missing
-- rows, preserving every existing Auth account and its library records.
insert into public.profiles (id)
select users.id
from auth.users as users
left join public.profiles as profiles on profiles.id = users.id
where profiles.id is null
on conflict (id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text := lower(trim(coalesce(new.raw_user_meta_data ->> 'username', '')));
begin
  -- Auth metadata is untrusted. Keep a missing or malformed username unset instead of allowing
  -- it to make Auth user creation fail; valid values use the same normalization and format that
  -- profiles.username enforces below.
  if v_username = '' or v_username !~ '^[a-z0-9_]{3,30}$' then
    v_username := null;
  end if;

  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    nullif(
      regexp_replace(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '\s+', ' ', 'g'),
      ''
    ),
    v_username
  );

  return new;
end;
$$;

-- This security-definer function exposes only a yes/no availability result. Profile rows remain
-- private under RLS; neither anonymous nor authenticated callers can read another person's data.
create function public.is_username_available(p_username text)
returns boolean
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_username text := lower(trim(coalesce(p_username, '')));
begin
  if v_username !~ '^[a-z0-9_]{3,30}$' then
    return false;
  end if;

  return not exists (
    select 1
    from public.profiles
    where profiles.username = v_username
  );
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;
