import 'server-only';

import { createClient } from '@/lib/supabase/server';

import type { Profile } from './types';

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

type ProfileRow = {
  display_name: string | null;
  username: string | null;
};

export async function getProfile(supabase: ServerSupabaseClient): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, username')
    .maybeSingle();

  if (error) {
    throw new Error('Unable to load your profile.');
  }

  if (!data) {
    return null;
  }

  const profile = data as ProfileRow;

  return {
    displayName: profile.display_name,
    username: profile.username,
  };
}
