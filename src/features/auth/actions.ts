'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

import { authCredentialsSchema } from './schemas';
import type { AuthActionState } from './types';

function getFormCredentials(formData: FormData) {
  return authCredentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
}

async function getAppUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get('origin');

  if (origin) {
    return origin;
  }

  const host = requestHeaders.get('host') ?? 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

  return `${protocol}://${host}`;
}

export async function signIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = getFormCredentials(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check your email and password.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: 'Email or password did not match.' };
  }

  redirect('/library');
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = getFormCredentials(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check your email and password.' };
  }

  const supabase = await createClient();
  const appUrl = await getAppUrl();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: 'Unable to create an account. Try a different email or try again shortly.' };
  }

  if (data.session) {
    redirect('/library');
  }

  return { message: 'Check your email to confirm your account, then sign in.' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
