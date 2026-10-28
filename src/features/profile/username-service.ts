import 'server-only';

import { randomUUID } from 'node:crypto';

import { createClient } from '@/lib/supabase/server';

import { usernamePattern } from './schemas';

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

const generatedUsernameSuffixLength = 8;
const generatedUsernameStemMaximumLength = 30 - generatedUsernameSuffixLength - 1;

export function getGeneratedUsernameStem(displayName: string) {
  const normalized = displayName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return (normalized || 'reader').slice(0, generatedUsernameStemMaximumLength);
}

export function createGeneratedUsername(displayName: string, suffix = randomUUID().slice(0, 8)) {
  return `${getGeneratedUsernameStem(displayName)}_${suffix}`;
}

export async function isUsernameAvailable(supabase: ServerSupabaseClient, username: string) {
  const { data, error } = await supabase.rpc('is_username_available', {
    p_username: username,
  });

  if (error || typeof data !== 'boolean') {
    throw new Error('Unable to check username availability.');
  }

  return data;
}

export async function suggestAvailableUsername(
  supabase: ServerSupabaseClient,
  displayName: string,
) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const username = createGeneratedUsername(displayName);

    if (!usernamePattern.test(username)) {
      throw new Error('Unable to generate a username.');
    }

    if (await isUsernameAvailable(supabase, username)) {
      return username;
    }
  }

  return null;
}
