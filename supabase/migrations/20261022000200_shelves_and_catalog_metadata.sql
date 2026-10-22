-- Phase 2: catalog metadata enrichment, custom shelves, and shelf membership.
--
-- The catalog stores only the books Shelf actually needs. External metadata providers supply
-- book information; the tables below keep shared bibliographic data, per-user reading data,
-- and user-defined shelves separate from one another.

alter table public.books
  add column isbn_10 text check (isbn_10 is null or char_length(isbn_10) = 10),
  add column isbn_13 text check (isbn_13 is null or char_length(isbn_13) = 13),
  add column publisher text check (publisher is null or char_length(publisher) <= 300),
  add column categories text[] check (categories is null or array_length(categories, 1) <= 25),
  add column language text check (language is null or char_length(language) <= 32);

create index books_isbn_13_idx on public.books (isbn_13) where isbn_13 is not null;

create table public.shelves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  normalized_name text not null check (char_length(normalized_name) between 1 and 80),
  description text check (description is null or char_length(description) <= 500),
  position smallint not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shelves_user_normalized_name_key unique (user_id, normalized_name)
);

create table public.shelf_books (
  shelf_id uuid not null references public.shelves (id) on delete cascade,
  library_item_id uuid not null references public.library_items (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (shelf_id, library_item_id)
);

create index shelves_user_position_idx on public.shelves (user_id, position, created_at);
create index shelf_books_library_item_id_idx on public.shelf_books (library_item_id);

create trigger shelves_set_updated_at
  before update on public.shelves
  for each row
  execute function public.set_updated_at();

alter table public.shelves enable row level security;
alter table public.shelf_books enable row level security;

revoke all on table public.shelves, public.shelf_books from anon;
revoke all on table public.shelves, public.shelf_books from authenticated;

grant select, insert, update, delete on table public.shelves to authenticated;
grant select, insert, delete on table public.shelf_books to authenticated;

create policy "Users can view their own shelves"
  on public.shelves
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own shelves"
  on public.shelves
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own shelves"
  on public.shelves
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own shelves"
  on public.shelves
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can view their own shelf memberships"
  on public.shelf_books
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.shelves
      where shelves.id = shelf_books.shelf_id
        and shelves.user_id = (select auth.uid())
    )
  );

create policy "Users can add books to their own shelves"
  on public.shelf_books
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.shelves
      where shelves.id = shelf_books.shelf_id
        and shelves.user_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.library_items
      where library_items.id = shelf_books.library_item_id
        and library_items.user_id = (select auth.uid())
    )
  );

create policy "Users can remove books from their own shelves"
  on public.shelf_books
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.shelves
      where shelves.id = shelf_books.shelf_id
        and shelves.user_id = (select auth.uid())
    )
  );

-- Phase 2 supersedes the foundation's add-book function with the richer metadata set.
drop function if exists public.add_book_to_library(text, text, text, text, text, text, integer, text, jsonb);

create function public.add_book_to_library(
  p_provider text,
  p_provider_book_id text,
  p_title text,
  p_subtitle text,
  p_description text,
  p_published_date text,
  p_page_count integer,
  p_cover_url text,
  p_isbn_10 text,
  p_isbn_13 text,
  p_publisher text,
  p_categories text[],
  p_language text,
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

  if p_provider <> 'google_books' and p_provider <> 'open_library' then
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
    cover_url,
    isbn_10,
    isbn_13,
    publisher,
    categories,
    language
  )
  values (
    trim(p_provider),
    trim(p_provider_book_id),
    trim(p_title),
    nullif(trim(p_subtitle), ''),
    nullif(trim(p_description), ''),
    nullif(trim(p_published_date), ''),
    p_page_count,
    nullif(trim(p_cover_url), ''),
    nullif(trim(p_isbn_10), ''),
    nullif(trim(p_isbn_13), ''),
    nullif(trim(p_publisher), ''),
    coalesce(p_categories, '{}'::text[]),
    nullif(trim(p_language), '')
  )
  on conflict (provider, provider_book_id) do update
  set
    title = excluded.title,
    subtitle = coalesce(excluded.subtitle, public.books.subtitle),
    description = coalesce(excluded.description, public.books.description),
    published_date = coalesce(excluded.published_date, public.books.published_date),
    page_count = coalesce(excluded.page_count, public.books.page_count),
    cover_url = coalesce(excluded.cover_url, public.books.cover_url),
    isbn_10 = coalesce(excluded.isbn_10, public.books.isbn_10),
    isbn_13 = coalesce(excluded.isbn_13, public.books.isbn_13),
    publisher = coalesce(excluded.publisher, public.books.publisher),
    categories = coalesce(nullif(excluded.categories, '{}'::text[]), public.books.categories),
    language = coalesce(excluded.language, public.books.language)
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

create function public.create_shelf(p_name text, p_description text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_shelf_id uuid;
  v_name text;
  v_normalized_name text;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  v_name := regexp_replace(trim(coalesce(p_name, '')), '\s+', ' ', 'g');

  if char_length(v_name) = 0 or char_length(v_name) > 80 then
    raise exception 'Invalid shelf name.' using errcode = '22023';
  end if;

  v_normalized_name := lower(v_name);

  insert into public.shelves (user_id, name, normalized_name, description)
  values (v_user_id, v_name, v_normalized_name, nullif(trim(p_description), ''))
  on conflict (user_id, normalized_name) do update
  set description = coalesce(excluded.description, public.shelves.description)
  returning id into v_shelf_id;

  return v_shelf_id;
end;
$$;

revoke all on function public.add_book_to_library(text, text, text, text, text, text, integer, text, text, text, text, text[], text, jsonb) from public;
revoke all on function public.create_shelf(text, text) from public;

grant execute on function public.add_book_to_library(text, text, text, text, text, text, integer, text, text, text, text, text[], text, jsonb) to authenticated;
grant execute on function public.create_shelf(text, text) to authenticated;
