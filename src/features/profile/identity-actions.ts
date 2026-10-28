'use server';

import { hasSupabasePublicConfig } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

import { displayNameSchema, usernameSchema } from './schemas';
import type { UsernameAvailabilityState, UsernameSuggestionState } from './types';
import { isUsernameAvailable, suggestAvailableUsername } from './username-service';

export async function checkUsernameAvailability(
  rawUsername: string,
): Promise<UsernameAvailabilityState> {
  const parsed = usernameSchema.safeParse(rawUsername);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Enter a valid username.' };
  }

  if (!hasSupabasePublicConfig()) {
    return { error: 'Shelf is not connected to Supabase yet.' };
  }

  try {
    const supabase = await createClient();
    const available = await isUsernameAvailable(supabase, parsed.data);

    return { available, username: parsed.data };
  } catch {
    return { error: 'Unable to check username availability. Try again shortly.' };
  }
}

export async function suggestUsername(rawDisplayName: string): Promise<UsernameSuggestionState> {
  const parsed = displayNameSchema.safeParse(rawDisplayName);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Tell us what to call you first.' };
  }

  if (!hasSupabasePublicConfig()) {
    return { error: 'Shelf is not connected to Supabase yet.' };
  }

  try {
    const supabase = await createClient();
    const username = await suggestAvailableUsername(supabase, parsed.data);

    if (!username) {
      return { error: 'Unable to find an available username. Try again.' };
    }

    return { username };
  } catch {
    return { error: 'Unable to find an available username. Try again shortly.' };
  }
}
