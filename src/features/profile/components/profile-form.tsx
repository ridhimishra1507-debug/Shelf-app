'use client';

import { useActionState } from 'react';

import { updateProfile } from '../actions';
import { initialProfileActionState } from '../types';
import { IdentityFields } from './identity-fields';

type ProfileFormProps = {
  displayName: string | null;
  username: string | null;
};

export function ProfileForm({ displayName, username }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialProfileActionState);

  return (
    <form action={formAction} className="mt-8 grid gap-5" noValidate>
      <IdentityFields
        defaultDisplayName={displayName}
        defaultUsername={username}
        disabled={isPending}
      />

      {state.error ? (
        <p aria-live="polite" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p
          aria-live="polite"
          className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        >
          {state.message}
        </p>
      ) : null}

      <button
        className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? 'Saving…' : 'Save identity'}
      </button>
    </form>
  );
}
