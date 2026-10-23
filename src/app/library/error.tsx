'use client';

type LibraryErrorProps = {
  reset: () => void;
};

export default function LibraryError({ reset }: LibraryErrorProps) {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <section className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="text-xl font-semibold text-red-950">We could not load your library</h1>
        <p className="mt-2 text-sm text-red-800">Please try again in a moment.</p>
        <button
          className="mt-5 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
