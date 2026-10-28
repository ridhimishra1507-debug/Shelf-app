'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@/features/auth/require-user';

import { profileUpdateSchema } from './schemas';
import type { ProfileActionState } from './types';

export async function updateProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = profileUpdateSchema.safeParse({
    displayName: formData.get('displayName'),
    username: formData.get('username'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Check your profile details and try again.',
    };
  }

  const { supabase, userId } = await requireUser();
  const { data, error } = await supabase
    .from('profiles')
    .update({
      display_name: parsed.data.displayName,
      username: parsed.data.username,
    })
    .eq('id', userId)
    .select('id')
    .maybeSingle();

  if (error?.code === '23505') {
    return { error: 'That username is no longer available. Try another one.' };
  }

  if (error || !data) {
    return { error: 'Unable to save your profile. Please try again.' };
  }

  revalidatePath('/account');
  return { message: 'Your Shelf identity has been saved.' };
}
