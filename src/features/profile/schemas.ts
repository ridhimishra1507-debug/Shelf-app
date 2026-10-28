import { z } from 'zod';

import { themeIds } from '@/features/theme/themes';

export const usernamePattern = /^[a-z0-9_]{3,30}$/;
export const usernameRequirements = 'Use 3–30 lowercase letters, numbers, or underscores.';

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeDisplayName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export const usernameSchema = z
  .string()
  .transform(normalizeUsername)
  .pipe(z.string().regex(usernamePattern, usernameRequirements));

export const optionalUsernameSchema = z
  .string()
  .transform(normalizeUsername)
  .pipe(z.union([z.literal(''), usernameSchema]));

export const displayNameSchema = z
  .string()
  .transform(normalizeDisplayName)
  .pipe(z.string().min(1, 'Tell us what to call you.').max(100, 'Use 100 characters or fewer.'));

export const profileUpdateSchema = z.object({
  displayName: displayNameSchema,
  username: usernameSchema,
});

export const themeIdSchema = z.enum(themeIds);
