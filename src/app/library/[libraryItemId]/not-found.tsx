import Link from 'next/link';

export default function LibraryItemNotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <section className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-950">Book not found</h1>
        <p className="mt-2 text-sm text-stone-600">This book is not available in your library.</p>
        <Link
          className="mt-5 inline-flex rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700"
          href="/library"
        >
          Back to my library
        </Link>
      </section>
    </main>
  );
}
