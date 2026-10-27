import { describe, expect, it } from 'vitest';

import { getReadingProgress } from './reading-progress';

describe('getReadingProgress', () => {
  it('returns a rounded percentage for valid page progress', () => {
    expect(getReadingProgress({ currentPage: 53, pageCount: 212 })).toEqual({
      currentPage: 53,
      pageCount: 212,
      percentage: 25,
    });
  });

  it.each([
    { currentPage: null, pageCount: 212 },
    { currentPage: 53, pageCount: null },
    { currentPage: 53, pageCount: 0 },
    { currentPage: -1, pageCount: 212 },
    { currentPage: 213, pageCount: 212 },
  ])('does not represent incomplete or invalid page data: %o', (item) => {
    expect(getReadingProgress(item)).toBeNull();
  });
});
