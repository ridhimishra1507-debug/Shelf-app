import 'server-only';

import { z } from 'zod';

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
            description: z.string().optional(),
            imageLinks: z
              .object({
                thumbnail: z.string().optional(),
              })
              .optional(),
            pageCount: z.number().int().positive().optional(),
            publishedDate: z.string().optional(),
            subtitle: z.string().optional(),
            title: z.string().optional(),
          })
          .optional(),
      }),
    )
    .optional(),
});

function toSecureUrl(url: string | undefined) {
  if (!url) {
    return null;
  }

  return url.replace(/^http:/, 'https:');
}

export class BookSearchProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookSearchProviderError';
  }
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
    throw new BookSearchProviderError('Book search is temporarily unavailable. Please try again.');
  }

  if (!response.ok) {
    throw new BookSearchProviderError('Book search is temporarily unavailable. Please try again.');
  }

  const payload = googleBooksResponseSchema.safeParse(await response.json());

  if (!payload.success) {
    throw new BookSearchProviderError('Book search returned an unexpected response. Please try again.');
  }

  return (payload.data.items ?? []).flatMap((item) => {
    const volume = item.volumeInfo;

    if (!volume?.title || !volume.authors?.length) {
      return [];
    }

    const candidate = bookSearchResultSchema.safeParse({
      authors: volume.authors,
      coverUrl: toSecureUrl(volume.imageLinks?.thumbnail),
      description: volume.description ?? null,
      pageCount: volume.pageCount ?? null,
      provider: 'google_books',
      providerBookId: item.id,
      publishedDate: volume.publishedDate ?? null,
      subtitle: volume.subtitle ?? null,
      title: volume.title,
    });

    return candidate.success ? [candidate.data] : [];
  });
}
