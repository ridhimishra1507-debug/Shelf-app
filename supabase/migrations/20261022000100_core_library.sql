create type public.reading_status as enum (
  'to_read',
  'reading',
  'completed',
  'dnf',
  'wishlist'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (char_length(provider) between 1 and 50),
  provider_book_id text not null check (char_length(provider_book_id) between 1 and 200),
  title text not null check (char_length(title) between 1 and 500),
  subtitle text check (subtitle is null or char_length(subtitle) <= 500),
  description text check (description is null or char_length(description) <= 10000),
  published_date text check (published_date is null or char_length(published_date) <= 32),
  page_count integer check (page_count is null or page_count > 0),
  cover_url text check (cover_url is null or char_length(cover_url) <= 2048),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint books_provider_book_id_key unique (provider, provider_book_id)
);

create table public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 300),
  normalized_name text not null check (char_length(normalized_name) between 1 and 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint authors_normalized_name_key unique (normalized_name)
);

create table public.book_authors (
  book_id uuid not null references public.books (id) on delete cascade,
  author_id uuid not null references public.authors (id) on delete restrict,
  author_position smallint not null check (author_position >= 0),
  created_at timestamptz not null default now(),
  primary key (book_id, author_id)
);

create table public.library_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete restrict,
  status public.reading_status not null default 'to_read',
  rating numeric(2, 1) check (
    rating is null
    or (
      rating >= 0.5
      and rating <= 5.0
      and rating * 2 = trunc(rating * 2)
    )
  ),
  notes text check (notes is null or char_length(notes) <= 5000),
  current_page integer check (current_page is null or current_page >= 0),
  started_on date,
  completed_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint library_items_user_book_key unique (user_id, book_id),
  constraint library_items_reading_dates_check check (
    completed_on is null
    or started_on is null
    or completed_on >= started_on
  )
);

create index library_items_user_id_idx on public.library_items (user_id);
create index library_items_user_status_idx on public.library_items (user_id, status);
create index library_items_user_created_at_idx on public.library_items (user_id, created_at desc);
create index book_authors_author_id_idx on public.book_authors (author_id);
create index book_authors_book_position_idx on public.book_authors (book_id, author_position);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger books_set_updated_at
before update on public.books
for each row
execute function public.set_updated_at();

create trigger authors_set_updated_at
before update on public.authors
for each row
execute function public.set_updated_at();

create trigger library_items_set_updated_at
before update on public.library_items
for each row
execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

create function public.add_book_to_library(
  p_provider text,
  p_provider_book_id text,
  p_title text,
  p_subtitle text,
  p_description text,
  p_published_date text,
  p_page_count integer,
  p_cover_url text,
  p_authors jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_book_id uuid;
  v_library_item_id uuid;
  v_author_id uuid;
  v_author_name text;
  v_normalized_author_name text;
  v_author_position smallint := 0;
  v_author_count smallint := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if p_provider <> 'google_books' then
    raise exception 'Unsupported book provider.' using errcode = '22023';
  end if;

  if p_provider_book_id is null
    or char_length(trim(p_provider_book_id)) = 0
    or char_length(trim(p_provider_book_id)) > 200
  then
    raise exception 'Invalid provider book identifier.' using errcode = '22023';
  end if;

  if p_title is null or char_length(trim(p_title)) = 0 or char_length(trim(p_title)) > 500 then
    raise exception 'Invalid book title.' using errcode = '22023';
  end if;

  if jsonb_typeof(p_authors) <> 'array' then
    raise exception 'Book authors must be an array.' using errcode = '22023';
  end if;

  insert into public.books (
    provider,
    provider_book_id,
    title,
    subtitle,
    description,
    published_date,
    page_count,
    cover_url
  )
  values (
    trim(p_provider),
    trim(p_provider_book_id),
    trim(p_title),
    nullif(trim(p_subtitle), ''),
    nullif(trim(p_description), ''),
    nullif(trim(p_published_date), ''),
    p_page_count,
    nullif(trim(p_cover_url), '')
  )
  on conflict (provider, provider_book_id) do update
  set
    title = excluded.title,
    subtitle = coalesce(excluded.subtitle, public.books.subtitle),
    description = coalesce(excluded.description, public.books.description),
    published_date = coalesce(excluded.published_date, public.books.published_date),
    page_count = coalesce(excluded.page_count, public.books.page_count),
    cover_url = coalesce(excluded.cover_url, public.books.cover_url)
  returning id into v_book_id;

  for v_author_name in
    select value from jsonb_array_elements_text(p_authors) as authors(value)
  loop
    v_author_name := regexp_replace(trim(v_author_name), '\s+', ' ', 'g');

    if v_author_name = '' then
      continue;
    end if;

    if char_length(v_author_name) > 300 then
      raise exception 'Invalid author name.' using errcode = '22023';
    end if;

    v_normalized_author_name := lower(v_author_name);

    insert into public.authors (name, normalized_name)
    values (v_author_name, v_normalized_author_name)
    on conflict (normalized_name) do update set name = excluded.name
    returning id into v_author_id;

    insert into public.book_authors (book_id, author_id, author_position)
    values (v_book_id, v_author_id, v_author_position)
    on conflict (book_id, author_id) do update
    set author_position = excluded.author_position;

    v_author_position := v_author_position + 1;
    v_author_count := v_author_count + 1;
  end loop;

  if v_author_count = 0 then
    raise exception 'At least one author is required.' using errcode = '22023';
  end if;

  insert into public.library_items (user_id, book_id)
  values (v_user_id, v_book_id)
  on conflict (user_id, book_id) do update
  set updated_at = now()
  returning id into v_library_item_id;

  return v_library_item_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.authors enable row level security;
alter table public.book_authors enable row level security;
alter table public.library_items enable row level security;

revoke all on table public.profiles, public.books, public.authors, public.book_authors, public.library_items from anon;
revoke all on table public.profiles, public.books, public.authors, public.book_authors, public.library_items from authenticated;

grant select, update on table public.profiles to authenticated;
grant select on table public.books, public.authors, public.book_authors to authenticated;
grant select, update, delete on table public.library_items to authenticated;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Authenticated users can view the book catalog"
on public.books
for select
to authenticated
using (true);

create policy "Authenticated users can view catalog authors"
on public.authors
for select
to authenticated
using (true);

create policy "Authenticated users can view catalog book authors"
on public.book_authors
for select
to authenticated
using (true);

create policy "Users can view their own library items"
on public.library_items
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can update their own library items"
on public.library_items
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own library items"
on public.library_items
for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on function public.set_updated_at() from public;
revoke all on function public.handle_new_user() from public;
revoke all on function public.add_book_to_library(text, text, text, text, text, text, integer, text, jsonb) from public;
grant execute on function public.add_book_to_library(text, text, text, text, text, text, integer, text, jsonb) to authenticated;
