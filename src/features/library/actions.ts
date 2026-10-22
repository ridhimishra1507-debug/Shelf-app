'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireUser } from '@/features/auth/require-user';
import { bookSearchResultSchema } from '@/features/catalog/schemas';

import { parseLibraryItemUpdate, libraryItemIdSchema } from './schemas';
import type { LibraryActionState } from './types';

function getBookPayload(formData: FormData) {
  const rawBook = formData.get('book');

  if (typeof rawBook !== 'string') {
    return null;
  }

  try {
    return bookSearchResultSchema.safeParse(JSON.parse(rawBook));
  } catch {
    return null;
  }
}

export async function addBookToLibrary(
  _previousState: LibraryActionState,
  formData: FormData,
): Promise<LibraryActionState> {
  const parsedBook = getBookPayload(formData);

  if (!parsedBook || !parsedBook.success) {
    return { error: 'The selected book is invalid. Search again and retry.' };
  }

  const { supabase } = await requireUser();
  const { data: existing, error: existingError } = await supabase
    .from('library_items')
    .select('id, book:books!inner(provider, provider_book_id)')
    .eq('book.provider', parsedBook.data.provider)
    .eq('book.provider_book_id', parsedBook.data.providerBookId)
    .maybeSingle();

  if (existingError) {
    return { error: 'Unable to check your library. Please try again.' };
  }

  if (existing) {
    return { error: 'This book is already in your library.' };
  }

  const { error } = await supabase.rpc('add_book_to_library', {
    p_authors: parsedBook.data.authors,
    p_categories: parsedBook.data.categories,
    p_cover_url: parsedBook.data.coverUrl,
    p_description: parsedBook.data.description,
    p_isbn_10: parsedBook.data.isbn10,
    p_isbn_13: parsedBook.data.isbn13,
    p_language: parsedBook.data.language,
    p_page_count: parsedBook.data.pageCount,
    p_publisher: parsedBook.data.publisher,
    p_provider: parsedBook.data.provider,
    p_provider_book_id: parsedBook.data.providerBookId,
    p_published_date: parsedBook.data.publishedDate,
    p_subtitle: parsedBook.data.subtitle,
    p_title: parsedBook.data.title,
  });

  if (error) {
    return { error: 'Unable to add this book to your library. Please try again.' };
  }

  revalidatePath('/library');
  return { message: 'Book added to your library.' };
}

export async function updateLibraryItem(
  _previousState: LibraryActionState,
  formData: FormData,
): Promise<LibraryActionState> {
  const parsed = parseLibraryItemUpdate(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the book details and try again.' };
  }

  const { supabase } = await requireUser();
  const { data: existing, error: existingError } = await supabase
    .from('library_items')
    .select('id, book:books!inner(page_count)')
    .eq('id', parsed.data.libraryItemId)
    .maybeSingle();

  if (existingError || !existing) {
    return { error: 'This book is no longer available in your library.' };
  }

  const pageCount = Number(
    (existing as unknown as { book: { page_count: number | null } | null }).book?.page_count ?? 0,
  );

  if (pageCount > 0 && (parsed.data.currentPage ?? 0) > pageCount) {
    return { error: `Progress cannot exceed this edition's ${pageCount} pages.` };
  }

  const { data: updated, error } = await supabase
    .from('library_items')
    .update({
      completed_on: parsed.data.completedOn ?? null,
      current_page: parsed.data.currentPage ?? null,
      notes: parsed.data.notes,
      rating: parsed.data.rating ?? null,
      started_on: parsed.data.startedOn ?? null,
      status: parsed.data.status,
    })
    .eq('id', parsed.data.libraryItemId)
    .select('id')
    .maybeSingle();

  if (error || !updated) {
    return { error: 'Unable to save this book. Please try again.' };
  }

  revalidatePath('/library');
  revalidatePath(`/library/${parsed.data.libraryItemId}`);
  return { message: 'Book details saved.' };
}

export async function removeLibraryItem(formData: FormData) {
  const parsed = libraryItemIdSchema.safeParse(formData.get('libraryItemId'));

  if (!parsed.success) {
    redirect('/library');
  }

  const { supabase } = await requireUser();
  await supabase.from('library_items').delete().eq('id', parsed.data);

  revalidatePath('/library');
  redirect('/library');
}
