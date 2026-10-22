import { z } from 'zod';

export const readingStatusValues = ['to_read', 'reading', 'completed', 'dnf', 'wishlist'] as const;

export const readingStatusSchema = z.enum(readingStatusValues);

export type ReadingStatus = z.infer<typeof readingStatusSchema>;

export const readingStatusLabels: Record<ReadingStatus, string> = {
  completed: 'Completed',
  dnf: 'DNF',
  reading: 'Currently Reading',
  to_read: 'To Be Read',
  wishlist: 'Wishlist',
};

export function getReadingStatusLabel(status: ReadingStatus) {
  return readingStatusLabels[status];
}
