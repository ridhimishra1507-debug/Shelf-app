import type { ReadingStatus } from '@/features/library/reading-status';

export type DashboardLibraryItem = {
  book: {
    coverUrl: string | null;
    pageCount: number | null;
    title: string;
  };
  completedOn: string | null;
  currentPage: number | null;
  id: string;
  rating: number | null;
  status: ReadingStatus;
};

export type DashboardReadingProgress = {
  currentPage: number;
  pageCount: number;
  percentage: number;
};

export type CurrentlyReadingItem = DashboardLibraryItem & {
  progress: DashboardReadingProgress | null;
};

export type RecentlyCompletedItem = Omit<DashboardLibraryItem, 'completedOn'> & {
  completedOn: string;
};

export type ReadingDashboard = {
  averageRating: number | null;
  completedThisYear: number;
  currentlyReading: CurrentlyReadingItem[];
  ratedBooks: number;
  recentlyCompleted: RecentlyCompletedItem[];
  statusCounts: Record<ReadingStatus, number>;
  totalBooks: number;
};
