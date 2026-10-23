import Link from 'next/link';

import { AuthForm } from '@/features/auth/components/auth-form';

export const metadata = {
  title: 'Sign in | Shelf',
};

export default function SignInPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <section className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <Link className="text-sm font-medium tracking-[0.2em] text-stone-500 uppercase" href="/">
          Shelf
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950">Welcome back</h1>
        <p className="mt-2 text-sm text-stone-600">Sign in to manage your personal library.</p>
        <AuthForm mode="sign-in" />
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
