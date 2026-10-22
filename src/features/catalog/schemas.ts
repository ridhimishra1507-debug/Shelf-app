import { z } from 'zod';

import { bookProviders } from './types';

export const bookSearchProviderSchema = z.enum(['all', ...bookProviders]);

export const bookSearchSchema = z.object({
  provider: bookSearchProviderSchema.default('all'),
  query: z.string().trim().min(2, 'Enter at least two characters.').max(100),
});

export const bookSearchResultSchema = z.object({
  authors: z.array(z.string().trim().min(1).max(300)).min(1).max(20),
  categories: z.array(z.string().trim().min(1).max(120)).max(25),
  coverUrl: z.string().url().max(2048).nullable(),
  description: z.string().max(10000).nullable(),
  isbn10: z
    .string()
    .trim()
    .regex(/^\d{9}[\dX]$/, 'Enter a valid ISBN-10.')
    .nullable(),
  isbn13: z
    .string()
    .trim()
    .regex(/^\d{13}$/, 'Enter a valid ISBN-13.')
    .nullable(),
  language: z.string().trim().min(2).max(32).nullable(),
  pageCount: z.number().int().positive().max(10000).nullable(),
  provider: z.enum(bookProviders),
  providerBookId: z.string().min(1).max(200),
  publishedDate: z.string().max(32).nullable(),
  publisher: z.string().trim().max(300).nullable(),
  subtitle: z.string().max(500).nullable(),
  title: z.string().trim().min(1).max(500),
});
