export type BookSearchResult = {
  authors: string[];
  coverUrl: string | null;
  description: string | null;
  pageCount: number | null;
  provider: 'google_books';
  providerBookId: string;
  publishedDate: string | null;
  subtitle: string | null;
  title: string;
};

export type BookSearchState = {
  error?: string;
  query?: string;
  results?: BookSearchResult[];
};

export const initialBookSearchState: BookSearchState = {};
