import { describe, expect, it } from 'vitest';

import { normalizeOpenLibraryDoc } from './open-library';

describe('normalizeOpenLibraryDoc', () => {
  it('maps a complete document to the normalized shape', () => {
    const result = normalizeOpenLibraryDoc({
      author_name: ['Ursula K. Le Guin'],
      cover_i: 12345,
      first_publish_year: 1969,
      isbn: ['0441007317', '9780441007318'],
      key: '/works/OL45883W',
      language: ['eng'],
      number_of_pages_median: 336,
      publish_date: ['1969'],
      publisher: ['Ace Books'],
      subject: ['Science fiction', 'Fiction'],
      subtitle: 'A Novel',
      title: 'The Left Hand of Darkness',
    });

    expect(result).toEqual({
      authors: ['Ursula K. Le Guin'],
      categories: ['Science fiction', 'Fiction'],
      coverUrl: 'https://covers.openlibrary.org/b/id/12345-L.jpg',
      description: null,
      isbn10: '0441007317',
      isbn13: '9780441007318',
      language: 'eng',
      pageCount: 336,
      provider: 'open_library',
      providerBookId: 'OL45883W',
      publishedDate: '1969',
      publisher: 'Ace Books',
      subtitle: 'A Novel',
      title: 'The Left Hand of Darkness',
    });
  });

  it('rejects documents without a title', () => {
    expect(normalizeOpenLibraryDoc({ author_name: ['Someone'], key: '/works/OL1W' })).toBeNull();
  });

  it('rejects documents without an author', () => {
    expect(normalizeOpenLibraryDoc({ key: '/works/OL1W', title: 'Untitled' })).toBeNull();
  });

  it('limits subjects to 25 entries', () => {
    const subjects = Array.from({ length: 30 }, (_, index) => `Subject ${index}`);

    const result = normalizeOpenLibraryDoc({
      author_name: ['Author'],
      key: '/works/OL2W',
      subject: subjects,
      title: 'Book',
    });

    expect(result?.categories).toHaveLength(25);
  });

  it('returns null fields when the provider omits metadata', () => {
    const result = normalizeOpenLibraryDoc({
      author_name: ['Author'],
      key: '/works/OL3W',
      title: 'Book',
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

  it('keeps a work key that is not under /works/', () => {
    const result = normalizeOpenLibraryDoc({
      author_name: ['Author'],
      key: '/books/OL4B',
      title: 'Book',
    });

    expect(result?.providerBookId).toBe('/books/OL4B');
  });
});
