import { describe, expect, it } from 'vitest';

import type { DashboardLibraryItem } from './types';
import { getReadingDashboard } from './statistics';

type DashboardLibraryItemOverrides = Omit<Partial<DashboardLibraryItem>, 'book'> & {
  book?: Partial<DashboardLibraryItem['book']>;
};

function createItem({
  book: bookOverrides,
  ...overrides
}: DashboardLibraryItemOverrides = {}): DashboardLibraryItem {
  return {
    book: {
      coverUrl: null,
      pageCount: 300,
      title: 'A Book',
      ...bookOverrides,
    },
    completedOn: null,
    currentPage: null,
    id: 'item-id',
    rating: null,
    status: 'to_read',
    ...overrides,
  };
}

describe('getReadingDashboard', () => {
  it('returns zero-safe statistics for an empty library', () => {
    expect(getReadingDashboard([], 2026)).toEqual({
      averageRating: null,
      completedThisYear: 0,
      currentlyReading: [],
      ratedBooks: 0,
      recentlyCompleted: [],
      statusCounts: {
        completed: 0,
        dnf: 0,
        reading: 0,
        to_read: 0,
        wishlist: 0,
      },
      totalBooks: 0,
    });
  });

  it('counts every reading status and only averages rated books', () => {
    const dashboard = getReadingDashboard(
      [
        createItem({ id: 'to-read', status: 'to_read' }),
        createItem({ id: 'reading', rating: 3.5, status: 'reading' }),
        createItem({
          completedOn: '2026-04-10',
          id: 'completed',
          rating: 4.5,
          status: 'completed',
        }),
        createItem({ id: 'dnf', rating: null, status: 'dnf' }),
        createItem({ id: 'wishlist', status: 'wishlist' }),
      ],
      2026,
    );

    expect(dashboard.totalBooks).toBe(5);
    expect(dashboard.statusCounts).toEqual({
      completed: 1,
      dnf: 1,
      reading: 1,
      to_read: 1,
      wishlist: 1,
    });
    expect(dashboard.ratedBooks).toBe(2);
    expect(dashboard.averageRating).toBe(4);
  });

  it('uses only valid completed dates on currently completed books for the calendar-year count', () => {
    const dashboard = getReadingDashboard(
      [
        createItem({ completedOn: '2026-01-01', id: 'this-year', status: 'completed' }),
        createItem({ completedOn: '2025-12-31', id: 'last-year', status: 'completed' }),
        createItem({ completedOn: '2026-02-30', id: 'invalid-date', status: 'completed' }),
        createItem({ completedOn: '2026-02-01', id: 'dnf', status: 'dnf' }),
        createItem({ completedOn: null, id: 'missing-date', status: 'completed' }),
      ],
      2026,
    );

    expect(dashboard.completedThisYear).toBe(1);
    expect(dashboard.recentlyCompleted.map((item) => item.id)).toEqual(['this-year', 'last-year']);
  });

  it('orders recently completed books by date, then title', () => {
    const dashboard = getReadingDashboard(
      [
        createItem({
          book: { title: 'Zeta' },
          completedOn: '2026-04-10',
          id: 'zeta',
          status: 'completed',
        }),
        createItem({
          book: { title: 'Alpha' },
          completedOn: '2026-04-10',
          id: 'alpha',
          status: 'completed',
        }),
        createItem({
          book: { title: 'Newest' },
          completedOn: '2026-05-01',
          id: 'newest',
          status: 'completed',
        }),
      ],
      2026,
    );

    expect(dashboard.recentlyCompleted.map((item) => item.book.title)).toEqual([
      'Newest',
      'Alpha',
      'Zeta',
    ]);
  });

  it('keeps currently reading books with missing or invalid page metadata while omitting unsafe progress', () => {
    const dashboard = getReadingDashboard(
      [
        createItem({
          book: { pageCount: 200, title: 'Valid progress' },
          currentPage: 50,
          id: 'valid',
          status: 'reading',
        }),
        createItem({
          book: { pageCount: null, title: 'Unknown page total' },
          currentPage: 50,
          id: 'no-total',
          status: 'reading',
        }),
        createItem({
          book: { pageCount: 200, title: 'Beyond end' },
          currentPage: 201,
          id: 'beyond-end',
          status: 'reading',
        }),
        createItem({
          book: { pageCount: 200, title: 'No current page' },
          currentPage: null,
          id: 'no-current-page',
          status: 'reading',
        }),
      ],
      2026,
    );

    expect(dashboard.currentlyReading.map((item) => item.book.title)).toEqual([
      'Beyond end',
      'No current page',
      'Unknown page total',
      'Valid progress',
    ]);
    expect(dashboard.currentlyReading.map((item) => item.progress)).toEqual([
      null,
      null,
      null,
      { currentPage: 50, pageCount: 200, percentage: 25 },
    ]);
  });
});
