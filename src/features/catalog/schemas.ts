import { z } from 'zod';

export const bookSearchSchema = z.object({
  query: z.string().trim().min(2, 'Enter at least two characters.').max(100),
});

export const bookSearchResultSchema = z.object({
  authors: z.array(z.string().trim().min(1).max(300)).min(1).max(20),
  coverUrl: z.string().url().max(2048).nullable(),
  description: z.string().max(10000).nullable(),
  pageCount: z.number().int().positive().max(10000).nullable(),
  provider: z.literal('google_books'),
  providerBookId: z.string().min(1).max(200),
  publishedDate: z.string().max(32).nullable(),
  subtitle: z.string().max(500).nullable(),
  title: z.string().trim().min(1).max(500),
});
