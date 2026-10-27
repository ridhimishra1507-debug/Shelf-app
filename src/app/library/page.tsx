import Link from 'next/link';

import { EmptyState } from '@/components/empty-state';
import { signOut } from '@/features/auth/actions';
import { requireUser } from '@/features/auth/require-user';
import { BookSearch } from '@/features/catalog/components/book-search';
import { Bookshelf } from '@/features/library/components/bookshelf';
import { listLibraryItems } from '@/features/library/repository';

export const metadata = {
  title: 'My library | Shelf',
};

// This private route reads the authenticated session from request cookies.
export const instant = false;

export default async function LibraryPage() {
  const { supabase } = await requireUser();
  const items = await listLibraryItems(supabase);

  return (
    <main className="library-page min-h-screen px-6 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-stone-200/90 bg-white/90 px-5 py-5 shadow-sm sm:px-7">
          <div>
            <Link
              className="text-xs font-semibold tracking-[0.2em] text-amber-900 uppercase outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2"
              href="/"
            >
              Shelf
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
              My library
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              className="rounded-full border border-stone-300 bg-white px-3.5 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2"
              href="/search"
            >
              Search catalog
            </Link>
            <form action={signOut}>
              <button
                className="rounded-full px-3.5 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="mt-10 grid gap-12">
          {items.length === 0 ? (
            <section aria-labelledby="library-heading">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-amber-900 uppercase">
                  Your collection
                </p>
                <h2
                  className="mt-1 text-2xl font-semibold tracking-tight text-stone-950"
                  id="library-heading"
                >
                  Your bookshelf
                </h2>
              </div>
              <div className="mt-5">
                <EmptyState
                  description="Search for a book below to add your first one."
                  title="Your library is empty"
                />
              </div>
            </section>
          ) : (
            <Bookshelf items={items} />
          )}

          <section aria-label="Add a book" className="border-t border-stone-300/80 pt-10">
            <BookSearch canAddToLibrary />
          </section>
        </div>
      </div>
    </main>
  );
}
