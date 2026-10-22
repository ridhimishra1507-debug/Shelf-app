import { describe, expect, it } from 'vitest';

import { normalizeGoogleBooksVolume } from './google-books';

describe('normalizeGoogleBooksVolume', () => {
  it('maps a complete volume to the normalized shape', () => {
    const result = normalizeGoogleBooksVolume('vol-1', {
      authors: ['Octavia E. Butler'],
      categories: ['Fiction', 'Science Fiction'],
      description: 'A novel about time travel.',
      imageLinks: { thumbnail: 'http://example.com/cover.jpg' },
      industryIdentifiers: [
        { identifier: '978-0-8044-4913-7', type: 'ISBN_13' },
        { identifier: '080442957X', type: 'ISBN_10' },
      ],
      language: 'en',
      pageCount: 264,
      publishedDate: '1979',
      publisher: 'Doubleday',
      subtitle: 'A Novel',
      title: 'Kindred',
    });

    expect(result).toEqual({
      authors: ['Octavia E. Butler'],
      categories: ['Fiction', 'Science Fiction'],
      coverUrl: 'https://example.com/cover.jpg&edge=curl',
      description: 'A novel about time travel.',
      isbn10: '080442957X',
      isbn13: '9780804449137',
      language: 'en',
      pageCount: 264,
      provider: 'google_books',
      providerBookId: 'vol-1',
      publishedDate: '1979',
      publisher: 'Doubleday',
      subtitle: 'A Novel',
      title: 'Kindred',
    });
  });

  it('rejects volumes without a title', () => {
    expect(normalizeGoogleBooksVolume('vol-1', { authors: ['Someone'] })).toBeNull();
  });

  it('rejects volumes without an author', () => {
    expect(normalizeGoogleBooksVolume('vol-1', { title: 'Untitled' })).toBeNull();
  });

  it('drops identifiers that are not valid isbns', () => {
    const result = normalizeGoogleBooksVolume('vol-1', {
      authors: ['Octavia E. Butler'],
      industryIdentifiers: [
        { identifier: '12345', type: 'ISBN_10' },
        { identifier: '978-0-8044-4913-7', type: 'ISBN_13' },
      ],
      title: 'Kindred',
    });

    expect(result?.isbn10).toBeNull();
    expect(result?.isbn13).toBe('9780804449137');
  });

  it('keeps the edge hint only once', () => {
    const result = normalizeGoogleBooksVolume('vol-1', {
      authors: ['Octavia E. Butler'],
      imageLinks: { thumbnail: 'https://example.com/cover.jpg?edge=curl' },
      title: 'Kindred',
    });

    expect(result?.coverUrl).toBe('https://example.com/cover.jpg?edge=curl');
  });

  it('returns null fields when the provider omits metadata', () => {
    const result = normalizeGoogleBooksVolume('vol-1', {
      authors: ['Octavia E. Butler'],
      title: 'Kindred',
    });

    expect(result).toMatchObject({
      coverUrl: null,
      description: null,
      isbn10: null,
      isbn13: null,
      language: null,
      pageCount: null,
      publishedDate: null,
      publisher: null,
      subtitle: null,
    });
  });
});
