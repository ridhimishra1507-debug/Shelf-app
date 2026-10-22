import 'server-only';

import { z } from 'zod';

import {
  bookSearchUnavailableMessage,
  bookSearchUnexpectedResponseMessage,
  BookSearchProviderError,
} from './errors';
import { normalizeNameList, splitIsbns, toSecureUrl, truncateText } from './normalize';
import { bookSearchResultSchema } from './schemas';
import type { BookSearchResult } from './types';

/**
 * Open Library's search endpoint returns many editions rolled up per work, so the
 * requested fields are narrowed to the ones Shelf stores.
 */
const openLibraryFields = [
  'author_name',
  'cover_i',
  'first_publish_year',
  'isbn',
  'key',
  'language',
  'number_of_pages_median',
  'publish_date',
  'publisher',
  'subtitle',
  'subject',
  'title',
].join(',');

const openLibraryDocSchema = z.object({
  author_name: z.array(z.string()).optional(),
  cover_i: z.number().int().optional(),
  first_publish_year: z.number().int().optional(),
  isbn: z.array(z.string()).optional(),
  key: z.string(),
  language: z.array(z.string()).optional(),
  number_of_pages_median: z.number().int().optional(),
  publish_date: z.array(z.string()).optional(),
  publisher: z.array(z.string()).optional(),
  subtitle: z.string().optional(),
  subject: z.array(z.string()).optional(),
  title: z.string().optional(),
});

const openLibraryResponseSchema = z.object({
  docs: z.array(openLibraryDocSchema).optional(),
});

function toCoverUrl(coverId: number | undefined): string | null {
  if (!coverId) {
    return null;
  }

  return toSecureUrl(`https://covers.openlibrary.org/b/id/${coverId}-L.jpg`);
}

/**
 * Open Library reports the original publication year rather than a full date.
 */
function toPublishedDate(year: number | undefined): string | null {
  return year ? String(year) : null;
}

export function normalizeOpenLibraryDoc(
  doc: z.infer<typeof openLibraryDocSchema>,
): BookSearchResult | null {
  if (!doc.title) {
    return null;
  }

  const authors = normalizeNameList(doc.author_name);

  if (authors.length === 0) {
    return null;
  }

  const { isbn10, isbn13 } = splitIsbns(doc.isbn);

  const candidate = bookSearchResultSchema.safeParse({
    authors,
    categories: normalizeNameList(doc.subject).slice(0, 25),
    coverUrl: toCoverUrl(doc.cover_i),
    description: null,
    isbn10,
    isbn13,
    language:
      doc.language?.[0] && doc.language[0].trim().length >= 2
        ? truncateText(doc.language[0], 32)
        : null,
    pageCount:
      doc.number_of_pages_median && doc.number_of_pages_median > 0
        ? doc.number_of_pages_median
        : null,
    provider: 'open_library',
    providerBookId: doc.key.replace(/^\/works\//, ''),
    publishedDate: toPublishedDate(doc.first_publish_year),
    publisher: truncateText(doc.publisher?.[0], 300),
    subtitle: truncateText(doc.subtitle, 500),
    title: doc.title,
  });

  return candidate.success ? candidate.data : null;
}

export async function searchOpenLibrary(query: string): Promise<BookSearchResult[]> {
  const url = new URL('https://openlibrary.org/search.json');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '12');
  url.searchParams.set('fields', openLibraryFields);

  let response: Response;

  try {
    response = await fetch(url, { cache: 'no-store' });
  } catch {
    throw new BookSearchProviderError(bookSearchUnavailableMessage);
  }

  if (!response.ok) {
    throw new BookSearchProviderError(bookSearchUnavailableMessage);
  }

  const payload = openLibraryResponseSchema.safeParse(await response.json());

  if (!payload.success) {
    throw new BookSearchProviderError(bookSearchUnexpectedResponseMessage);
  }

  return (payload.data.docs ?? []).flatMap((doc) => {
    const normalized = normalizeOpenLibraryDoc(doc);

    return normalized ? [normalized] : [];
  });
}
