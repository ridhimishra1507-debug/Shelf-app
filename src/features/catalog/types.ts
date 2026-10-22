export const bookProviders = ['google_books', 'open_library'] as const;

export type BookProvider = (typeof bookProviders)[number];

export type BookSearchResult = {
  authors: string[];
  categories: string[];
  coverUrl: string | null;
  description: string | null;
  isbn10: string | null;
  isbn13: string | null;
  language: string | null;
  pageCount: number | null;
  provider: BookProvider;
  providerBookId: string;
  publishedDate: string | null;
  publisher: string | null;
  subtitle: string | null;
  title: string;
};

export type BookSearchState = {
  error?: string;
  query?: string;
  results?: BookSearchResult[];
};

export const initialBookSearchState: BookSearchState = {};
