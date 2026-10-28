'use client';

import { useActionState } from 'react';

import { IdentityFields } from '@/features/profile/components/identity-fields';

import { signIn, signUp } from '../actions';
import { initialAuthActionState } from '../types';

type AuthFormProps = {
  isSupabaseConfigured: boolean;
  mode: 'sign-in' | 'sign-up';
};

export function AuthForm({ isSupabaseConfigured, mode }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(
    mode === 'sign-in' ? signIn : signUp,
    initialAuthActionState,
  );
  const isSignIn = mode === 'sign-in';

  return (
    <form action={formAction} className="mt-8 grid gap-5" noValidate>
      <label className="grid gap-2 text-sm font-medium text-stone-700" htmlFor="email">
        Email
        <input
          autoComplete="email"
          className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-950 shadow-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-200"
          id="email"
          name="email"
          required
          disabled={!isSupabaseConfigured}
          type="email"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-stone-700" htmlFor="password">
        Password
        <input
          autoComplete={isSignIn ? 'current-password' : 'new-password'}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-950 shadow-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-200"
          id="password"
          minLength={8}
          name="password"
          required
          disabled={!isSupabaseConfigured}
          type="password"
        />
      </label>

      {!isSignIn ? <IdentityFields disabled={!isSupabaseConfigured || isPending} /> : null}

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
        disabled={isPending || !isSupabaseConfigured}
        type="submit"
      >
        {isPending ? 'Please wait…' : isSignIn ? 'Sign in' : 'Create account'}
      </button>
    </form>
  );
}
