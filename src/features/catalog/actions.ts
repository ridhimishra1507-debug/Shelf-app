'use server';

import { bookSearchSchema } from './schemas';
import { resolveSearchProviders, searchBooksAcrossProviders } from './search';
import type { BookSearchState } from './types';

export async function searchBooks(
  _previousState: BookSearchState,
  formData: FormData,
): Promise<BookSearchState> {
  const parsed = bookSearchSchema.safeParse({
    provider: formData.get('provider') ?? 'all',
    query: formData.get('query'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Enter a book title or author.' };
  }

  const providers = resolveSearchProviders(parsed.data.provider);

  try {
    const { errors, results } = await searchBooksAcrossProviders(parsed.data.query, providers);

    if (results.length === 0 && errors.length > 0) {
      return { error: errors[0], query: parsed.data.query };
    }

    return {
      error:
        errors.length > 0
          ? 'Some providers could not be reached. Showing available results.'
          : undefined,
      query: parsed.data.query,
      results,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to search for books right now.',
      query: parsed.data.query,
    };
  }
}
