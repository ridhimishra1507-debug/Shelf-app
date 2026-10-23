import Link from 'next/link';

export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-12 text-foreground">
      <section className="max-w-xl text-center">
        <p className="text-sm font-medium tracking-[0.2em] text-neutral-500 uppercase">Shelf</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Your private reading library</h1>
        <p className="mt-3 text-pretty text-neutral-600">
          Keep the books you want to read, are reading, and have finished in one personal place.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700"
            href="/search"
          >
            Search books
          </Link>
          <Link
            className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-stone-500"
            href="/sign-in"
          >
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
