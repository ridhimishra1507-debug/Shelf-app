import Link from 'next/link';

import { getReadingStatusLabel, type ReadingStatus } from '../reading-status';
import { getReadingProgress } from '../reading-progress';
import type { LibraryItem } from '../types';
import { BookCover } from './book-cover';

type BookshelfProps = {
  items: LibraryItem[];
};

const sectionOrder: ReadingStatus[] = ['reading', 'to_read', 'completed', 'dnf', 'wishlist'];

function BookShelfCard({ item }: { item: LibraryItem }) {
  const progress = getReadingProgress(item);
  const authorText = item.authors.join(', ') || 'Unknown author';

  return (
    <li className="min-w-0">
      <article className="group relative h-full">
        <Link
          aria-label={`View and edit ${item.title}`}
          className="block h-full rounded-[1.15rem] outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-4 focus-visible:ring-offset-stone-50"
          href={`/library/${item.id}`}
        >
          <div className="relative isolate overflow-hidden rounded-[1rem] border border-stone-200/90 bg-stone-100 shadow-[0_0.35rem_0.9rem_rgb(41_37_36_/_0.12)] transition duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_0.75rem_1.4rem_rgb(41_37_36_/_0.18)]">
            <BookCover coverUrl={item.coverUrl} title={item.title} />
            {progress ? (
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-stone-950/20">
                <div
                  aria-hidden="true"
                  className="h-full bg-amber-400"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            ) : null}
          </div>

          <div className="px-1 pt-3">
            <h3 className="line-clamp-2 font-semibold leading-snug text-stone-950 transition-colors group-hover:text-amber-900">
              {item.title}
            </h3>
            <p className="mt-1 truncate text-sm text-stone-600" title={authorText}>
              {authorText}
            </p>
            {progress ? (
              <p className="mt-2 text-xs font-medium text-stone-500">
                <span className="sr-only">Reading progress: </span>
                {progress.percentage}% read <span aria-hidden="true">·</span>{' '}
                {progress.currentPage.toLocaleString()} of {progress.pageCount.toLocaleString()}{' '}
                pages
              </p>
            ) : null}
          </div>
        </Link>
        <div
          aria-hidden="true"
          className="-mt-1.5 h-3 rounded-b-md border-t border-amber-950/30 bg-amber-800 shadow-[0_0.25rem_0.35rem_rgb(120_53_15_/_0.18)]"
        />
      </article>
    </li>
  );
}

export function Bookshelf({ items }: BookshelfProps) {
  const sections = sectionOrder
    .map((status) => ({
      items: items.filter((item) => item.status === status),
      status,
    }))
    .filter((section) => section.items.length > 0);

  return (
    <section aria-labelledby="library-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
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
        <p className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-stone-600 shadow-sm">
          {items.length} {items.length === 1 ? 'book' : 'books'}
        </p>
      </div>

      <div className="mt-6 grid gap-8">
        {sections.map((section) => (
          <section
            aria-labelledby={`${section.status}-bookshelf-heading`}
            className="rounded-2xl border border-stone-200/90 bg-white/75 p-4 shadow-[0_0.5rem_1.8rem_rgb(41_37_36_/_0.05)] sm:p-6"
            key={section.status}
          >
            <header className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <h3
                className="text-lg font-semibold tracking-tight text-stone-900"
                id={`${section.status}-bookshelf-heading`}
              >
                {getReadingStatusLabel(section.status)}
              </h3>
              <span className="text-sm text-stone-500">
                {section.items.length} {section.items.length === 1 ? 'book' : 'books'}
              </span>
            </header>

            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
              {section.items.map((item) => (
                <BookShelfCard item={item} key={item.id} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
