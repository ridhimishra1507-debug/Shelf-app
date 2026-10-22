'use server';

import { searchGoogleBooks } from './google-books';
import { bookSearchSchema } from './schemas';
import type { BookSearchState } from './types';

export async function searchBooks(
  _previousState: BookSearchState,
  formData: FormData,
): Promise<BookSearchState> {
  const parsed = bookSearchSchema.safeParse({ query: formData.get('query') });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Enter a book title or author.' };
  }

  try {
    const results = await searchGoogleBooks(parsed.data.query);
    return { query: parsed.data.query, results };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to search for books right now.',
      query: parsed.data.query,
    };
  }
}
