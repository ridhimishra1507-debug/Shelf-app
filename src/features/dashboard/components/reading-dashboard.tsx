import Link from 'next/link';

import { BookCover } from '@/features/library/components/book-cover';
import {
  getReadingStatusLabel,
  readingStatusValues,
  type ReadingStatus,
} from '@/features/library/reading-status';

import type { CurrentlyReadingItem, ReadingDashboard } from '../types';

type ReadingDashboardProps = {
  dashboard: ReadingDashboard;
  year: number;
};

const statusAccentClasses: Record<ReadingStatus, string> = {
  completed: 'bg-status-completed',
  dnf: 'bg-status-dnf',
  reading: 'bg-status-reading',
  to_read: 'bg-status-to-read',
  wishlist: 'bg-status-wishlist',
};

function formatCompletionDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00.000Z`));
}

function getProgressFallback(item: CurrentlyReadingItem) {
  if (item.currentPage !== null && Number.isFinite(item.currentPage) && item.currentPage >= 0) {
    return `Current page: ${item.currentPage.toLocaleString()} (edition page total unavailable)`;
  }

  if (item.book.pageCount !== null && item.book.pageCount > 0) {
    return 'No current page recorded.';
  }

  return 'Page progress is unavailable.';
}

function SummaryCard({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: string | number;
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5 shadow-theme">
      <p className="text-sm font-medium text-secondary">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-primary">{value}</p>
      <p className="mt-2 text-sm text-secondary">{detail}</p>
    </article>
  );
}

function StatusSummary({ dashboard }: { dashboard: ReadingDashboard }) {
  return (
    <section aria-labelledby="reading-status-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
            Collection
          </p>
          <h2
            className="mt-1 text-2xl font-semibold tracking-tight text-primary"
            id="reading-status-heading"
          >
            Reading status
          </h2>
        </div>
        <p className="text-sm text-secondary">Every book belongs to one reading status.</p>
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {readingStatusValues.map((status) => (
          <div className="rounded-xl border border-border bg-elevated p-4" key={status}>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full ${statusAccentClasses[status]}`}
              />
              <dt className="text-sm font-medium text-secondary">
                {getReadingStatusLabel(status)}
              </dt>
            </div>
            <dd className="mt-3 text-2xl font-semibold text-primary">
              {dashboard.statusCounts[status]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function CurrentlyReading({ items }: { items: ReadingDashboard['currentlyReading'] }) {
  return (
    <section aria-labelledby="currently-reading-heading">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">In progress</p>
        <h2
          className="mt-1 text-2xl font-semibold tracking-tight text-primary"
          id="currently-reading-heading"
        >
          Currently reading
        </h2>
      </div>
      {items.length === 0 ? (
        <p className="mt-5 rounded-xl border border-border bg-surface p-5 text-sm text-secondary">
          Move a book to Currently Reading to see it here.
        </p>
      ) : (
        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {items.map((item) => {
            const { progress } = item;

            return (
              <li
                className="rounded-2xl border border-border bg-surface p-4 shadow-theme"
                key={item.id}
              >
                <div className="grid grid-cols-[4.5rem_1fr] gap-4">
                  <BookCover coverUrl={item.book.coverUrl} title={item.book.title} />
                  <div className="min-w-0">
                    <h3 className="font-semibold leading-snug text-primary">
                      <Link
                        className="hover:text-link hover:underline"
                        href={`/library/${item.id}`}
                      >
                        {item.book.title}
                      </Link>
                    </h3>
                    {progress ? (
                      <div className="mt-4">
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <p className="text-secondary">
                            {progress.currentPage.toLocaleString()} of{' '}
                            {progress.pageCount.toLocaleString()} pages
                          </p>
                          <p className="font-semibold text-primary">{progress.percentage}%</p>
                        </div>
                        <div
                          aria-label={`${item.book.title}: ${progress.percentage}% complete`}
                          aria-valuemax={progress.pageCount}
                          aria-valuemin={0}
                          aria-valuenow={progress.currentPage}
                          aria-valuetext={`${progress.currentPage} of ${progress.pageCount} pages`}
                          className="mt-2 h-2 overflow-hidden rounded-full bg-page"
                          role="progressbar"
                        >
                          <div
                            aria-hidden="true"
                            className="h-full rounded-full bg-progress"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-secondary">
                        {getProgressFallback(item)}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function RecentlyCompleted({
  completedCount,
  items,
}: {
  completedCount: number;
  items: ReadingDashboard['recentlyCompleted'];
}) {
  return (
    <section aria-labelledby="recently-completed-heading">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
          Looking back
        </p>
        <h2
          className="mt-1 text-2xl font-semibold tracking-tight text-primary"
          id="recently-completed-heading"
        >
          Recently completed
        </h2>
      </div>
      {items.length === 0 ? (
        <p className="mt-5 rounded-xl border border-border bg-surface p-5 text-sm text-secondary">
          {completedCount === 0
            ? 'Mark a book Completed to see it here.'
            : 'Add completion dates to completed books to see them here.'}
        </p>
      ) : (
        <ul className="mt-5 grid gap-3">
          {items.slice(0, 5).map((item) => (
            <li
              className="rounded-xl border border-border bg-surface p-3 shadow-theme"
              key={item.id}
            >
              <div className="grid grid-cols-[3.5rem_1fr] items-center gap-4">
                <BookCover coverUrl={item.book.coverUrl} title={item.book.title} />
                <div className="min-w-0">
                  <h3 className="font-semibold text-primary">
                    <Link className="hover:text-link hover:underline" href={`/library/${item.id}`}>
                      {item.book.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-secondary">
                    Completed {formatCompletionDate(item.completedOn)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ReadingDashboard({ dashboard, year }: ReadingDashboardProps) {
  return (
    <main className="library-page min-h-screen px-6 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-border bg-surface p-5 shadow-theme sm:px-7">
          <div>
            <Link className="text-xs font-semibold tracking-[0.2em] text-accent uppercase" href="/">
              Shelf
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
              Reading dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-secondary">
              A snapshot of your current library, not a record of reading history.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded-full border border-border bg-elevated px-3.5 py-2 text-sm font-semibold text-secondary transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-page"
              href="/library"
            >
              My library
            </Link>
            <Link
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-secondary transition hover:bg-elevated hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-page"
              href="/account"
            >
              Account
            </Link>
          </div>
        </header>

        <div className="mt-10 grid gap-10">
          <section aria-labelledby="reading-overview-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
                  Overview
                </p>
                <h2
                  className="mt-1 text-2xl font-semibold tracking-tight text-primary"
                  id="reading-overview-heading"
                >
                  Your reading at a glance
                </h2>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SummaryCard
                detail={
                  dashboard.totalBooks === 1 ? 'book in your library' : 'books in your library'
                }
                label="Total books"
                value={dashboard.totalBooks}
              />
              <SummaryCard
                detail={`completed with a ${year} completion date`}
                label={`Completed in ${year}`}
                value={dashboard.completedThisYear}
              />
              <SummaryCard
                detail={
                  dashboard.ratedBooks === 0
                    ? '0 rated books. Rate a book to see an average.'
                    : `from ${dashboard.ratedBooks} ${dashboard.ratedBooks === 1 ? 'rated book' : 'rated books'}`
                }
                label="Average rating"
                value={
                  dashboard.averageRating === null
                    ? '—'
                    : `${dashboard.averageRating.toFixed(1)} / 5`
                }
              />
            </div>
          </section>

          <StatusSummary dashboard={dashboard} />

          {dashboard.totalBooks === 0 ? (
            <section className="rounded-2xl border border-border bg-surface p-6 text-center shadow-theme sm:p-10">
              <h2 className="text-2xl font-semibold tracking-tight text-primary">
                Your dashboard is ready for your first book
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-secondary">
                Search the catalog to add a book, then Shelf will summarize your reading here.
              </p>
              <Link
                className="mt-6 inline-flex rounded-lg bg-button px-4 py-2.5 text-sm font-semibold text-button-text transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                href="/search"
              >
                Search catalog
              </Link>
            </section>
          ) : (
            <div className="grid gap-10 xl:grid-cols-2">
              <CurrentlyReading items={dashboard.currentlyReading} />
              <RecentlyCompleted
                completedCount={dashboard.statusCounts.completed}
                items={dashboard.recentlyCompleted}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
