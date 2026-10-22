'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { addBookToLibrary } from '@/features/library/actions';
import { BookCover } from '@/features/library/components/book-cover';
import { initialLibraryActionState } from '@/features/library/types';

import { searchBooks } from '../actions';
import { initialBookSearchState, type BookSearchResult } from '../types';

function AddBookButton({ book }: { book: BookSearchResult }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    addBookToLibrary,
    initialLibraryActionState,
  );

  useEffect(() => {
    if (state.message) {
      router.refresh();
    }
  }, [router, state.message]);

  return (
    <form action={formAction} className="mt-4">
      <input name="book" type="hidden" value={JSON.stringify(book)} />
      {state.error ? (
        <p aria-live="polite" className="mb-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p aria-live="polite" className="mb-2 text-sm text-emerald-700">
          {state.message}
        </p>
      ) : null}
      <button
        className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? 'Adding…' : 'Add to library'}
      </button>
    </form>
  );
}

export function BookSearch() {
  const [state, formAction, isPending] = useActionState(searchBooks, initialBookSearchState);

  return (
    <section
      aria-labelledby="book-search-heading"
      className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
    >
      <div>
        <h2 className="text-xl font-semibold text-stone-950" id="book-search-heading">
          Add a book
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Search Google Books and Open Library by title or author.
        </p>
      </div>

      <form action={formAction} className="mt-4 flex flex-col gap-3 sm:flex-row" noValidate>
        <label className="sr-only" htmlFor="book-search-query">
          Book title or author
        </label>
        <input
          className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-950 shadow-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-200"
          defaultValue={state.query ?? ''}
          id="book-search-query"
          maxLength={100}
          name="query"
          placeholder="Try “Kindred” or “Octavia Butler”"
          required
          type="search"
        />
        <label className="sr-only" htmlFor="book-search-provider">
          Search provider
        </label>
        <select
          className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-950 shadow-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-200"
          defaultValue="all"
          id="book-search-provider"
          name="provider"
        >
          <option value="all">All providers</option>
          <option value="google_books">Google Books</option>
          <option value="open_library">Open Library</option>
        </select>
        <button
          className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? 'Searching…' : 'Search'}
        </button>
      </form>

      {state.error ? (
        <p aria-live="polite" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}

      {state.results?.length === 0 ? (
        <p className="mt-4 text-sm text-stone-600">
          No books matched that search. Try a different title or author.
        </p>
      ) : null}

      {state.results?.length ? (
        <ul className="mt-5 grid gap-4 lg:grid-cols-2">
          {state.results.map((book) => (
            <li
              className="grid grid-cols-[4.5rem_1fr] gap-4 rounded-lg border border-stone-200 p-4"
              key={`${book.provider}:${book.providerBookId}`}
            >
              <BookCover coverUrl={book.coverUrl} title={book.title} />
              <div className="min-w-0">
                <h3 className="font-semibold leading-tight text-stone-950">{book.title}</h3>
                {book.subtitle ? (
                  <p className="mt-1 text-sm text-stone-700">{book.subtitle}</p>
                ) : null}
                <p className="mt-2 text-sm text-stone-600">{book.authors.join(', ')}</p>
                <p className="mt-2 text-xs text-stone-500">
                  {[
                    book.publishedDate,
                    book.pageCount ? `${book.pageCount.toLocaleString()} pages` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <AddBookButton book={book} />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
