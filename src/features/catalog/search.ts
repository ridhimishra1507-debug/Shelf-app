import 'server-only';

import { searchGoogleBooks } from './google-books';
import { searchOpenLibrary } from './open-library';
import { bookSearchProviderSchema } from './schemas';
import type { BookProvider, BookSearchResult } from './types';

type ProviderSearcher = (query: string) => Promise<BookSearchResult[]>;

const providerSearchers: Record<BookProvider, ProviderSearcher> = {
  google_books: searchGoogleBooks,
  open_library: searchOpenLibrary,
};

/**
 * A result is deduplicated across providers by title + first author so that the
 * same edition listed by both providers is not shown twice.
 */
function resultFingerprint(result: BookSearchResult): string {
  const title = result.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  const author = (result.authors[0] ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  return `${title}::${author}`;
}

function dedupeResults(results: BookSearchResult[]): BookSearchResult[] {
  const seen = new Set<string>();

  return results.filter((result) => {
    const fingerprint = resultFingerprint(result);

    if (!fingerprint || seen.has(fingerprint)) {
      return false;
    }

    seen.add(fingerprint);

    return true;
  });
}

export async function searchBooksByProvider(
  query: string,
  provider: BookProvider,
): Promise<BookSearchResult[]> {
  const results = await providerSearchers[provider](query);

  return dedupeResults(results);
}

/**
 * Runs the requested providers in parallel. A single provider failure does not
 * discard results from the providers that succeeded.
 */
export async function searchBooksAcrossProviders(
  query: string,
  providers: readonly BookProvider[],
): Promise<{ results: BookSearchResult[]; errors: string[] }> {
  const settled = await Promise.allSettled(
    providers.map((provider) => providerSearchers[provider](query)),
  );

  const results: BookSearchResult[] = [];
  const errors: string[] = [];

  for (const outcome of settled) {
    if (outcome.status === 'fulfilled') {
      results.push(...outcome.value);
      continue;
    }

    errors.push(
      outcome.reason instanceof Error
        ? outcome.reason.message
        : 'Book search is temporarily unavailable. Please try again.',
    );
  }

  return { errors, results: dedupeResults(results) };
}

export function resolveSearchProviders(provider: string): BookProvider[] {
  const parsed = bookSearchProviderSchema.safeParse(provider);

  if (parsed.success && parsed.data !== 'all') {
    return [parsed.data];
  }

  return ['google_books', 'open_library'];
}
