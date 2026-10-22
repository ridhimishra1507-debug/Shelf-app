import type { ReadingStatus } from './reading-status';

export type LibraryActionState = {
  error?: string;
  message?: string;
};

export const initialLibraryActionState: LibraryActionState = {};

export type LibraryItem = {
  authors: string[];
  bookId: string;
  completedOn: string | null;
  coverUrl: string | null;
  currentPage: number | null;
  id: string;
  notes: string | null;
  pageCount: number | null;
  publishedDate: string | null;
  rating: number | null;
  startedOn: string | null;
  status: ReadingStatus;
  subtitle: string | null;
  title: string;
};
