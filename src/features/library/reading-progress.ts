import type { LibraryItem } from './types';

export type ReadingProgress = {
  currentPage: number;
  pageCount: number;
  percentage: number;
};

/**
 * Returns progress only when both page values describe a meaningful, valid range.
 * Invalid legacy data is deliberately omitted rather than presented as a misleading bar.
 */
export function getReadingProgress(
  item: Pick<LibraryItem, 'currentPage' | 'pageCount'>,
): ReadingProgress | null {
  const { currentPage, pageCount } = item;

  if (
    currentPage === null ||
    pageCount === null ||
    !Number.isFinite(currentPage) ||
    !Number.isFinite(pageCount) ||
    currentPage < 0 ||
    pageCount <= 0 ||
    currentPage > pageCount
  ) {
    return null;
  }

  return {
    currentPage,
    pageCount,
    percentage: Math.round((currentPage / pageCount) * 100),
  };
}
