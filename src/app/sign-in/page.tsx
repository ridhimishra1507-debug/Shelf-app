import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AuthForm } from '@/features/auth/components/auth-form';
import { getOptionalUser } from '@/features/auth/require-user';
import { hasSupabasePublicConfig } from '@/lib/supabase/config';

export const metadata = {
  title: 'Sign in | Shelf',
};

// Auth state depends on request cookies, so this route renders at request time.
export const instant = false;

type SignInPageProps = {
  searchParams: Promise<{ reason?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const [user, { reason }] = await Promise.all([getOptionalUser(), searchParams]);

  if (user) {
    redirect('/library');
  }

  const isSupabaseConfigured = hasSupabasePublicConfig();

  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <section className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <Link className="text-sm font-medium tracking-[0.2em] text-stone-500 uppercase" href="/">
          Shelf
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950">Welcome back</h1>
        <p className="mt-2 text-sm text-stone-600">Sign in to manage your personal library.</p>
        {!isSupabaseConfigured ? (
          <p className="mt-5 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
            Account access will be available after Shelf is connected to Supabase.
          </p>
        ) : null}
        {reason === 'sign-in-required' ? (
          <p
            className="mt-5 rounded-md bg-stone-100 px-3 py-2 text-sm text-stone-700"
            role="status"
          >
            Sign in to view your private library.
          </p>
        ) : null}
        <AuthForm isSupabaseConfigured={isSupabaseConfigured} mode="sign-in" />
        <p className="mt-6 text-sm text-stone-600">
          New to Shelf?{' '}
          <Link
            className="font-semibold text-stone-900 underline underline-offset-4"
            href="/sign-up"
          >
            Create an account
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
