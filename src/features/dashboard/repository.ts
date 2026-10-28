import 'server-only';

import { createClient } from '@/lib/supabase/server';

import type { DashboardLibraryItem } from './types';

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

type DashboardLibraryItemRow = {
  book: {
    cover_url: string | null;
    page_count: number | null;
    title: string;
  } | null;
  completed_on: string | null;
  current_page: number | null;
  id: string;
  rating: number | string | null;
  status: DashboardLibraryItem['status'];
};

const dashboardLibraryItemSelect = `
  id,
  status,
  rating,
  current_page,
  completed_on,
  book:books!inner(
    title,
    page_count,
    cover_url
  )
`;

function mapDashboardLibraryItem(row: DashboardLibraryItemRow): DashboardLibraryItem {
  if (!row.book) {
    throw new Error('Library item is missing its book record.');
  }

  return {
    book: {
      coverUrl: row.book.cover_url,
      pageCount: row.book.page_count,
      title: row.book.title,
    },
    completedOn: row.completed_on,
    currentPage: row.current_page,
    id: row.id,
    rating: row.rating === null ? null : Number(row.rating),
    status: row.status,
  };
}

/**
 * RLS scopes this single query to the authenticated reader's library items.
 */
export async function listDashboardLibraryItems(
  supabase: ServerSupabaseClient,
): Promise<DashboardLibraryItem[]> {
  const { data, error } = await supabase.from('library_items').select(dashboardLibraryItemSelect);

  if (error) {
    throw new Error('Unable to load dashboard data.');
  }

  return ((data ?? []) as unknown as DashboardLibraryItemRow[]).map(mapDashboardLibraryItem);
}
