import 'server-only';

import { getOptionalUser } from '@/features/auth/require-user';
import { getProfile } from '@/features/profile/repository';

import { getTheme, getThemeStyle } from '../themes';

function getThemeCss(themeId: Parameters<typeof getTheme>[0]) {
  const declarations = Object.entries(getThemeStyle(getTheme(themeId)))
    .map(([property, value]) => `${property}: ${value};`)
    .join('');

  return `:root { ${declarations} }`;
}

/**
 * Applies the signed-in reader's persisted theme after the static application shell.
 * This component must stay beneath a Suspense boundary because authentication reads
 * request cookies.
 */
export async function SavedTheme() {
  const user = await getOptionalUser();
  const profile = user ? await getProfile(user.supabase) : null;

  if (!profile) {
    return null;
  }

  return <style>{getThemeCss(profile.themeId)}</style>;
}
