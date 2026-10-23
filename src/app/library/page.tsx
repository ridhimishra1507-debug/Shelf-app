import Link from 'next/link';

import { EmptyState } from '@/components/empty-state';
import { signOut } from '@/features/auth/actions';
import { requireUser } from '@/features/auth/require-user';
import { BookSearch } from '@/features/catalog/components/book-search';
import { LibraryCard } from '@/features/library/components/library-card';
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
    <main className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <Link className="text-sm font-medium tracking-[0.2em] text-stone-500 uppercase" href="/">
            Shelf
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">My library</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            className="text-sm font-semibold text-stone-700 underline underline-offset-4 hover:text-stone-950"
            href="/search"
          >
            Search catalog
          </Link>
          <form action={signOut}>
            <button
              className="text-sm font-semibold text-stone-700 underline underline-offset-4 hover:text-stone-950"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mt-8 grid gap-8">
        <BookSearch canAddToLibrary />

        <section aria-labelledby="library-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              className="text-2xl font-semibold tracking-tight text-stone-950"
              id="library-heading"
            >
              Your books
            </h2>
            {items.length > 0 ? (
              <p className="text-sm text-stone-600">
                {items.length} {items.length === 1 ? 'book' : 'books'}
              </p>
            ) : null}
          </div>

          {items.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                description="Search for a book above to add your first one."
                title="Your library is empty"
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {items.map((item) => (
                <LibraryCard item={item} key={item.id} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
