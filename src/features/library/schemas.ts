import { z } from 'zod';

import { readingStatusSchema } from './reading-status';

const emptyStringToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const optionalIsoDateSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date.')
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }, 'Use a valid date.')
    .optional(),
);

const optionalRatingSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .coerce
    .number()
    .min(0.5, 'Rating must be at least 0.5.')
    .max(5, 'Rating cannot exceed 5.')
    .refine((value) => Number.isInteger(value * 2), 'Rating must use half-star increments.')
    .optional(),
);

const optionalPageSchema = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().int('Progress must be a whole number.').min(0).max(100000).optional(),
);

const optionalNotesSchema = z
  .preprocess(emptyStringToUndefined, z.string().trim().max(5000, 'Notes must be 5,000 characters or fewer.').optional())
  .transform((value) => value ?? null);

export const libraryItemIdSchema = z.string().uuid('Invalid library item.');

export const libraryItemUpdateSchema = z
  .object({
    completedOn: optionalIsoDateSchema,
    currentPage: optionalPageSchema,
    libraryItemId: libraryItemIdSchema,
    notes: optionalNotesSchema,
    rating: optionalRatingSchema,
    startedOn: optionalIsoDateSchema,
    status: readingStatusSchema,
  })
  .superRefine((value, context) => {
    if (value.startedOn && value.completedOn && value.completedOn < value.startedOn) {
      context.addIssue({
        code: 'custom',
        message: 'Completion date cannot be before the start date.',
        path: ['completedOn'],
      });
    }
  });

export function parseLibraryItemUpdate(formData: FormData) {
  return libraryItemUpdateSchema.safeParse({
    completedOn: formData.get('completedOn'),
    currentPage: formData.get('currentPage'),
    libraryItemId: formData.get('libraryItemId'),
    notes: formData.get('notes'),
    rating: formData.get('rating'),
    startedOn: formData.get('startedOn'),
    status: formData.get('status'),
  });
}
