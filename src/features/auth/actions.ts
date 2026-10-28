'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { hasSupabasePublicConfig } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

import { isUsernameAvailable, suggestAvailableUsername } from '@/features/profile/username-service';

import { authCredentialsSchema, signUpSchema } from './schemas';
import type { AuthActionState } from './types';

function getFormCredentials(formData: FormData) {
  return authCredentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
}

function getSignUpDetails(formData: FormData) {
  return signUpSchema.safeParse({
    displayName: formData.get('displayName'),
    email: formData.get('email'),
    password: formData.get('password'),
    username: formData.get('username'),
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
  if (!hasSupabasePublicConfig()) {
    return { error: 'Shelf is not connected to Supabase yet. Try again after it is configured.' };
  }

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
  if (!hasSupabasePublicConfig()) {
    return { error: 'Shelf is not connected to Supabase yet. Try again after it is configured.' };
  }

  const parsed = getSignUpDetails(formData);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Check your account details and try again.',
    };
  }

  const supabase = await createClient();
  let username: string | null = parsed.data.username || null;

  try {
    if (username) {
      if (!(await isUsernameAvailable(supabase, username))) {
        return { error: 'That username is already taken. Try another one.' };
      }
    } else {
      username = await suggestAvailableUsername(supabase, parsed.data.displayName);

      if (!username) {
        return { error: 'Unable to find an available username. Try again.' };
      }
    }
  } catch {
    return { error: 'Unable to check username availability. Try again shortly.' };
  }

  if (!username) {
    return { error: 'Unable to find an available username. Try again.' };
  }

  const appUrl = await getAppUrl();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName,
        username,
      },
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) {
    try {
      if (!(await isUsernameAvailable(supabase, username))) {
        return { error: 'That username is no longer available. Try another one.' };
      }
    } catch {
      // Return the generic safe fallback if availability cannot be rechecked.
    }

    return {
      error: 'Unable to create an account. Try again shortly.',
    };
  }

  if (data.session) {
    redirect('/library');
  }

  return {
    message: `@${username} is reserved for your Shelf. Check your email to confirm your account, then sign in.`,
  };
}

export async function signOut() {
  if (!hasSupabasePublicConfig()) {
    redirect('/');
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
