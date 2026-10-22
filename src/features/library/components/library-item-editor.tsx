'use client';

import { useActionState } from 'react';

import { removeLibraryItem, updateLibraryItem } from '../actions';
import { readingStatusLabels, readingStatusValues } from '../reading-status';
import { initialLibraryActionState, type LibraryItem } from '../types';

type LibraryItemEditorProps = {
  item: LibraryItem;
};

export function LibraryItemEditor({ item }: LibraryItemEditorProps) {
  const [state, formAction, isPending] = useActionState(
    updateLibraryItem,
    initialLibraryActionState,
  );

  return (
    <div className="grid gap-6">
      <form action={formAction} className="grid gap-5" noValidate>
        <input name="libraryItemId" type="hidden" value={item.id} />

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-stone-700" htmlFor="status">
            Reading status
            <select
              className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-950 shadow-sm outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200"
              defaultValue={item.status}
              id="status"
              name="status"
            >
              {readingStatusValues.map((status) => (
                <option key={status} value={status}>
                  {readingStatusLabels[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-stone-700" htmlFor="rating">
            Rating (0.5–5)
            <input
              className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-950 shadow-sm outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200"
              defaultValue={item.rating ?? ''}
              id="rating"
              max="5"
              min="0.5"
              name="rating"
              step="0.5"
              type="number"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-stone-700" htmlFor="currentPage">
            Current page{item.pageCount ? ` of ${item.pageCount.toLocaleString()}` : ''}
            <input
              className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-950 shadow-sm outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200"
              defaultValue={item.currentPage ?? ''}
              id="currentPage"
              max={item.pageCount ?? undefined}
              min="0"
              name="currentPage"
              step="1"
              type="number"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-stone-700" htmlFor="startedOn">
            Started on
            <input
              className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-950 shadow-sm outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200"
              defaultValue={item.startedOn ?? ''}
              id="startedOn"
              name="startedOn"
              type="date"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-stone-700" htmlFor="completedOn">
            Completed on
            <input
              className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-950 shadow-sm outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200"
              defaultValue={item.completedOn ?? ''}
              id="completedOn"
              name="completedOn"
              type="date"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-stone-700" htmlFor="notes">
          Notes
          <textarea
            className="min-h-36 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-950 shadow-sm outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200"
            defaultValue={item.notes ?? ''}
            id="notes"
            maxLength={5000}
            name="notes"
          />
        </label>

        {state.error ? (
          <p aria-live="polite" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
            {state.error}
          </p>
        ) : null}
        {state.message ? (
          <p
            aria-live="polite"
            className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
          >
            {state.message}
          </p>
        ) : null}

        <button
          className="w-fit rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <form action={removeLibraryItem}>
        <input name="libraryItemId" type="hidden" value={item.id} />
        <button
          className="text-sm font-semibold text-red-700 underline underline-offset-4 hover:text-red-900"
          type="submit"
        >
          Remove from library
        </button>
      </form>
    </div>
  );
}
