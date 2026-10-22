import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  resolveSearchProviders,
  searchBooksAcrossProviders,
  searchBooksByProvider,
} from './search';

describe('resolveSearchProviders', () => {
  it('returns both providers for "all"', () => {
    expect(resolveSearchProviders('all')).toEqual(['google_books', 'open_library']);
  });

  it('returns a single provider when requested', () => {
    expect(resolveSearchProviders('open_library')).toEqual(['open_library']);
  });

  it('falls back to all providers for an unknown value', () => {
    expect(resolveSearchProviders('not-a-provider')).toEqual(['google_books', 'open_library']);
  });
});

describe('searchBooksAcrossProviders', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('deduplicates results that share a title and author across providers', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes('googleapis.com')) {
        return new Response(
          JSON.stringify({
            items: [
              {
                id: 'google-1',
                volumeInfo: { authors: ['Octavia E. Butler'], title: 'Kindred' },
              },
            ],
          }),
          { status: 200 },
        );
      }

      return new Response(
        JSON.stringify({
          docs: [
            {
              author_name: ['Octavia E. Butler'],
              key: '/works/OL1W',
              title: 'Kindred',
            },
          ],
        }),
        { status: 200 },
      );
    });

    const result = await searchBooksAcrossProviders('kindred', ['google_books', 'open_library']);

    expect(result.errors).toEqual([]);
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.provider).toBe('google_books');
  });

  it('keeps successful results when one provider fails', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes('googleapis.com')) {
        throw new Error('network down');
      }

      return new Response(
        JSON.stringify({
          docs: [
            {
              author_name: ['Ursula K. Le Guin'],
              key: '/works/OL2W',
              title: 'The Left Hand of Darkness',
            },
          ],
        }),
        { status: 200 },
      );
    });

    const result = await searchBooksAcrossProviders('darkness', ['google_books', 'open_library']);

    expect(result.results).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
  });
});

describe('searchBooksByProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns normalized results for a single provider', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: 'google-2',
              volumeInfo: { authors: ['Author'], title: 'A Book' },
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const results = await searchBooksByProvider('book', 'google_books');

    expect(results).toHaveLength(1);
    expect(results[0]?.providerBookId).toBe('google-2');
  });
});
