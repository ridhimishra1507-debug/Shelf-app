import Link from 'next/link';

import type { LibraryItem } from '../types';
import { BookCover } from './book-cover';
import { StatusBadge } from './status-badge';

type LibraryCardProps = {
  item: LibraryItem;
};

export function LibraryCard({ item }: LibraryCardProps) {
  const progress =
    item.currentPage !== null && item.pageCount !== null
      ? `${item.currentPage.toLocaleString()} / ${item.pageCount.toLocaleString()} pages`
      : item.currentPage !== null
        ? `${item.currentPage.toLocaleString()} pages`
        : null;

  return (
    <article className="grid grid-cols-[5.5rem_1fr] gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[6.5rem_1fr]">
      <BookCover coverUrl={item.coverUrl} title={item.title} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold leading-tight text-stone-950">
              <Link className="hover:underline" href={`/library/${item.id}`}>
                {item.title}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              {item.authors.join(', ') || 'Unknown author'}
            </p>
          </div>
          <StatusBadge status={item.status} />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
          {item.rating !== null ? (
            <span aria-label={`Rated ${item.rating} out of 5`}>★ {item.rating}/5</span>
          ) : null}
          {progress ? <span>{progress}</span> : null}
        </div>
        <Link
          className="mt-4 inline-flex text-sm font-semibold text-stone-800 underline underline-offset-4 hover:text-stone-500"
          href={`/library/${item.id}`}
        >
          View and edit
        </Link>
      </div>
    </article>
  );
}
