export default function LibraryLoading() {
  return (
    <main aria-busy="true" className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-12">
      <div className="h-20 animate-pulse rounded-xl bg-stone-200" />
      <div className="mt-8 h-72 animate-pulse rounded-xl bg-stone-200" />
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="h-40 animate-pulse rounded-xl bg-stone-200" />
        <div className="h-40 animate-pulse rounded-xl bg-stone-200" />
      </div>
      <p className="sr-only">Loading your library</p>
    </main>
  );
}
