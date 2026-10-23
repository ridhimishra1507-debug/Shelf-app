import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AuthForm } from '@/features/auth/components/auth-form';
import { getOptionalUser } from '@/features/auth/require-user';
import { hasSupabasePublicConfig } from '@/lib/supabase/config';

export const metadata = {
  title: 'Create an account | Shelf',
};

// Auth state depends on request cookies, so this route renders at request time.
export const instant = false;

export default async function SignUpPage() {
  const user = await getOptionalUser();

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
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950">
          Create your library
        </h1>
        <p className="mt-2 text-sm text-stone-600">Your books and reading notes stay personal.</p>
        {!isSupabaseConfigured ? (
          <p className="mt-5 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
            Account creation will be available after Shelf is connected to Supabase.
          </p>
        ) : null}
        <AuthForm isSupabaseConfigured={isSupabaseConfigured} mode="sign-up" />
        <p className="mt-6 text-sm text-stone-600">
          Already have an account?{' '}
          <Link
            className="font-semibold text-stone-900 underline underline-offset-4"
            href="/sign-in"
          >
            Sign in
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
