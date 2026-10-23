import 'server-only';

import { redirect } from 'next/navigation';

import { hasSupabasePublicConfig } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export async function getOptionalUser() {
  if (!hasSupabasePublicConfig()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || typeof userId !== 'string') {
    return null;
  }

  return { supabase, userId };
}

export async function requireUser() {
  if (!hasSupabasePublicConfig()) {
    redirect('/sign-in?reason=configuration');
  }

  const user = await getOptionalUser();

  if (!user) {
    redirect('/sign-in?reason=sign-in-required');
  }

  return user;
}
