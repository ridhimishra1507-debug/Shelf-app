import { z } from 'zod';

export const authCredentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(254),
  password: z.string().min(8, 'Use at least 8 characters.').max(72),
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;
