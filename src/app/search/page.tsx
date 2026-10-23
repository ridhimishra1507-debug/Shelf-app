import Link from 'next/link';

import { BookSearch } from '@/features/catalog/components/book-search';
import { getOptionalUser } from '@/features/auth/require-user';
import { hasSupabasePublicConfig } from '@/lib/supabase/config';

export const metadata = {
  title: 'Search books | Shelf',
};

// The header reflects the authenticated session from request cookies.
export const instant = false;

export default async function SearchPage() {
  const user = await getOptionalUser();
  const isSupabaseConfigured = hasSupabasePublicConfig();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <Link className="text-sm font-medium tracking-[0.2em] text-stone-500 uppercase" href="/">
            Shelf
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
            Search books
          </h1>
        </div>
        {user ? (
          <Link
            className="text-sm font-semibold text-stone-700 underline underline-offset-4 hover:text-stone-950"
            href="/library"
          >
            My library
          </Link>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              className="text-sm font-semibold text-stone-700 underline underline-offset-4 hover:text-stone-950"
              href="/sign-in"
            >
              Sign in
            </Link>
            <Link
              className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700"
              href="/sign-up"
            >
              Create account
            </Link>
          </div>
        )}
      </header>

      {!isSupabaseConfigured ? (
        <p className="mt-6 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
          Catalog search is available while account and library features await Supabase setup.
        </p>
      ) : null}

      <div className="mt-8">
        <BookSearch canAddToLibrary={Boolean(user)} />
      </div>
    </main>
  );
}
