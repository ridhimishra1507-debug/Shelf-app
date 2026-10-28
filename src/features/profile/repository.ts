import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { defaultThemeId, isThemeId } from '@/features/theme/themes';

import type { Profile } from './types';

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

type ProfileRow = {
  display_name: string | null;
  theme_id: string | null;
  username: string | null;
};

export async function getProfile(supabase: ServerSupabaseClient): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, theme_id, username')
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
    themeId: isThemeId(profile.theme_id) ? profile.theme_id : defaultThemeId,
    username: profile.username,
  };
}
