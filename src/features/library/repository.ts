import 'server-only';

import { createClient } from '@/lib/supabase/server';

import type { LibraryItem } from './types';

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

type LibraryItemRow = {
  book: {
    book_authors: Array<{
      author: { name: string } | null;
      author_position: number;
    }> | null;
    cover_url: string | null;
    id: string;
    page_count: number | null;
    published_date: string | null;
    subtitle: string | null;
    title: string;
  } | null;
  completed_on: string | null;
  current_page: number | null;
  id: string;
  notes: string | null;
  rating: number | string | null;
  started_on: string | null;
  status: LibraryItem['status'];
};

function mapLibraryItem(row: LibraryItemRow): LibraryItem {
  if (!row.book) {
    throw new Error('Library item is missing its book record.');
  }

  return {
    authors: (row.book.book_authors ?? [])
      .sort((first, second) => first.author_position - second.author_position)
      .flatMap((bookAuthor) => (bookAuthor.author?.name ? [bookAuthor.author.name] : [])),
    bookId: row.book.id,
    completedOn: row.completed_on,
    coverUrl: row.book.cover_url,
    currentPage: row.current_page,
    id: row.id,
    notes: row.notes,
    pageCount: row.book.page_count,
    publishedDate: row.book.published_date,
    rating: row.rating === null ? null : Number(row.rating),
    startedOn: row.started_on,
    status: row.status,
    subtitle: row.book.subtitle,
    title: row.book.title,
  };
}

const libraryItemSelect = `
  id,
  status,
  rating,
  notes,
  current_page,
  started_on,
  completed_on,
  book:books!inner(
    id,
    title,
    subtitle,
    page_count,
    cover_url,
    published_date,
    book_authors(author_position, author:authors(name))
  )
`;

export async function listLibraryItems(supabase: ServerSupabaseClient): Promise<LibraryItem[]> {
  const { data, error } = await supabase
    .from('library_items')
    .select(libraryItemSelect)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Unable to load the library.');
  }

  return ((data ?? []) as unknown as LibraryItemRow[]).map(mapLibraryItem);
}

export async function getLibraryItem(
  supabase: ServerSupabaseClient,
  libraryItemId: string,
): Promise<LibraryItem | null> {
  const { data, error } = await supabase
    .from('library_items')
    .select(libraryItemSelect)
    .eq('id', libraryItemId)
    .maybeSingle();

  if (error) {
    throw new Error('Unable to load this book.');
  }

  return data ? mapLibraryItem(data as unknown as LibraryItemRow) : null;
}
