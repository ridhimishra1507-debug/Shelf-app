import Link from 'next/link';
import { notFound } from 'next/navigation';

import { requireUser } from '@/features/auth/require-user';
import { BookCover } from '@/features/library/components/book-cover';
import { LibraryItemEditor } from '@/features/library/components/library-item-editor';
import { StatusBadge } from '@/features/library/components/status-badge';
import { getLibraryItem } from '@/features/library/repository';
import { libraryItemIdSchema } from '@/features/library/schemas';

// This private route reads the authenticated session from request cookies.
export const instant = false;

type LibraryItemPageProps = {
  params: Promise<{ libraryItemId: string }>;
};

export default async function LibraryItemPage({ params }: LibraryItemPageProps) {
  const { libraryItemId } = await params;
  const { supabase } = await requireUser();
  const parsedId = libraryItemIdSchema.safeParse(libraryItemId);

  if (!parsedId.success) {
    notFound();
  }

  const item = await getLibraryItem(supabase, parsedId.data);

  if (!item) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8 sm:py-12">
      <Link
        className="text-sm font-semibold text-stone-700 underline underline-offset-4 hover:text-stone-950"
        href="/library"
      >
        Back to my library
      </Link>

      <article className="mt-6 rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <header className="grid gap-6 sm:grid-cols-[10rem_1fr]">
          <BookCover coverUrl={item.coverUrl} title={item.title} />
          <div>
            <StatusBadge status={item.status} />
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
              {item.title}
            </h1>
            {item.subtitle ? <p className="mt-2 text-lg text-stone-700">{item.subtitle}</p> : null}
            <p className="mt-3 text-sm text-stone-600">
              {item.authors.join(', ') || 'Unknown author'}
            </p>
            {item.publishedDate || item.pageCount ? (
              <p className="mt-3 text-sm text-stone-500">
                {[
                  item.publishedDate,
                  item.pageCount ? `${item.pageCount.toLocaleString()} pages` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            ) : null}
          </div>
        </header>

        <section
          aria-labelledby="reading-details-heading"
          className="mt-8 border-t border-stone-200 pt-8"
        >
          <h2 className="text-xl font-semibold text-stone-950" id="reading-details-heading">
            Reading details
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Update your progress, rating, notes, and reading status.
          </p>
          <div className="mt-6">
            <LibraryItemEditor item={item} />
          </div>
        </section>
      </article>
    </main>
  );
}
