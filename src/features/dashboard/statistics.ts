import { getReadingProgress } from '@/features/library/reading-progress';
import { readingStatusValues } from '@/features/library/reading-status';

import type { DashboardLibraryItem, ReadingDashboard, RecentlyCompletedItem } from './types';

function getCompletionYear(date: string | null): number | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
    return null;
  }

  return parsedDate.getUTCFullYear();
}

function isValidRating(rating: number | null): rating is number {
  return rating !== null && Number.isFinite(rating) && rating >= 0.5 && rating <= 5;
}

/**
 * Derives a dashboard snapshot from the current library state. It deliberately does not infer
 * streaks, pace, or historical pages read because Shelf stores no progress history.
 */
export function getReadingDashboard(
  items: DashboardLibraryItem[],
  currentYear = new Date().getFullYear(),
): ReadingDashboard {
  const statusCounts = Object.fromEntries(
    readingStatusValues.map((status) => [status, 0]),
  ) as ReadingDashboard['statusCounts'];
  const currentlyReading: ReadingDashboard['currentlyReading'] = [];
  const recentlyCompleted: RecentlyCompletedItem[] = [];
  let completedThisYear = 0;
  let ratedBooks = 0;
  let ratingTotal = 0;

  for (const item of items) {
    statusCounts[item.status] += 1;

    if (isValidRating(item.rating)) {
      ratedBooks += 1;
      ratingTotal += item.rating;
    }

    if (item.status === 'reading') {
      currentlyReading.push({
        ...item,
        progress: getReadingProgress({
          currentPage: item.currentPage,
          pageCount: item.book.pageCount,
        }),
      });
    }

    if (item.status !== 'completed') {
      continue;
    }

    const completionYear = getCompletionYear(item.completedOn);

    if (completionYear === null || !item.completedOn) {
      continue;
    }

    if (completionYear === currentYear) {
      completedThisYear += 1;
    }

    recentlyCompleted.push({ ...item, completedOn: item.completedOn });
  }

  currentlyReading.sort((first, second) => first.book.title.localeCompare(second.book.title));
  recentlyCompleted.sort(
    (first, second) =>
      second.completedOn.localeCompare(first.completedOn) ||
      first.book.title.localeCompare(second.book.title),
  );

  return {
    averageRating: ratedBooks === 0 ? null : ratingTotal / ratedBooks,
    completedThisYear,
    currentlyReading,
    ratedBooks,
    recentlyCompleted,
    statusCounts,
    totalBooks: items.length,
  };
}
