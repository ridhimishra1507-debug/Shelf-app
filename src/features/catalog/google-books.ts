import 'server-only';

import { z } from 'zod';

import {
  bookSearchUnavailableMessage,
  bookSearchUnexpectedResponseMessage,
  BookSearchProviderError,
} from './errors';
import {
  isValidIsbn10,
  isValidIsbn13,
  maxDescriptionLength,
  normalizeIsbnDigits,
  normalizeNameList,
  toSecureUrl,
  truncateText,
} from './normalize';
import { bookSearchResultSchema } from './schemas';
import type { BookSearchResult } from './types';

const googleBooksResponseSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        volumeInfo: z
          .object({
            authors: z.array(z.string()).optional(),
            categories: z.array(z.string()).optional(),
            description: z.string().optional(),
            imageLinks: z
              .object({
                thumbnail: z.string().optional(),
              })
              .optional(),
            industryIdentifiers: z
              .array(
                z.object({
                  identifier: z.string(),
                  type: z.string(),
                }),
              )
              .optional(),
            language: z.string().optional(),
            pageCount: z.number().int().optional(),
            publishedDate: z.string().optional(),
            publisher: z.string().optional(),
            subtitle: z.string().optional(),
            title: z.string().optional(),
          })
          .optional(),
      }),
    )
    .optional(),
});

/**
 * Google Books thumbnail links only render when the `edge=curl` hint is present.
 */
function toCoverUrl(thumbnail: string | undefined): string | null {
  const url = toSecureUrl(thumbnail);

  if (!url) {
    return null;
  }

  return url.includes('edge=curl') ? url : `${url}&edge=curl`;
}

function toIsbns(identifiers: Array<{ identifier: string; type: string }> | undefined): {
  isbn10: string | null;
  isbn13: string | null;
} {
  let isbn10: string | null = null;
  let isbn13: string | null = null;

  for (const entry of identifiers ?? []) {
    const normalized = normalizeIsbnDigits(entry.identifier);

    if (!normalized) {
      continue;
    }

    if (entry.type === 'ISBN_10' && isValidIsbn10(normalized)) {
      isbn10 ??= normalized;
      continue;
    }

    if (entry.type === 'ISBN_13' && isValidIsbn13(normalized)) {
      isbn13 ??= normalized;
    }
  }

  return { isbn10, isbn13 };
}

export function normalizeGoogleBooksVolume(
  volumeId: string,
  volume: NonNullable<z.infer<typeof googleBooksResponseSchema>['items']>[number]['volumeInfo'],
): BookSearchResult | null {
  if (!volume?.title) {
    return null;
  }

  const authors = normalizeNameList(volume.authors);

  if (authors.length === 0) {
    return null;
  }

  const { isbn10, isbn13 } = toIsbns(volume.industryIdentifiers);

  const candidate = bookSearchResultSchema.safeParse({
    authors,
    categories: normalizeNameList(volume.categories),
    coverUrl: toCoverUrl(volume.imageLinks?.thumbnail),
    description: truncateText(volume.description, maxDescriptionLength),
    isbn10,
    isbn13,
    language:
      volume.language && volume.language.trim().length >= 2
        ? truncateText(volume.language, 32)
        : null,
    pageCount: volume.pageCount && volume.pageCount > 0 ? volume.pageCount : null,
    provider: 'google_books',
    providerBookId: volumeId,
    publishedDate: truncateText(volume.publishedDate, 32),
    publisher: truncateText(volume.publisher, 300),
    subtitle: truncateText(volume.subtitle, 500),
    title: volume.title,
  });

  return candidate.success ? candidate.data : null;
}

export async function searchGoogleBooks(query: string): Promise<BookSearchResult[]> {
  const url = new URL('https://www.googleapis.com/books/v1/volumes');
  url.searchParams.set('q', query);
  url.searchParams.set('maxResults', '12');
  url.searchParams.set('printType', 'books');

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  if (apiKey) {
    url.searchParams.set('key', apiKey);
  }

  let response: Response;

  try {
    response = await fetch(url, { cache: 'no-store' });
  } catch {
    throw new BookSearchProviderError(bookSearchUnavailableMessage);
  }

  if (!response.ok) {
    throw new BookSearchProviderError(bookSearchUnavailableMessage);
  }

  const payload = googleBooksResponseSchema.safeParse(await response.json());

  if (!payload.success) {
    throw new BookSearchProviderError(bookSearchUnexpectedResponseMessage);
  }

  return (payload.data.items ?? []).flatMap((item) => {
    const normalized = normalizeGoogleBooksVolume(item.id, item.volumeInfo);

    return normalized ? [normalized] : [];
  });
}
