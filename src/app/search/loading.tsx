export default function SearchLoading() {
  return (
    <main aria-busy="true" className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-12">
      <div className="h-20 animate-pulse rounded-xl bg-stone-200" />
      <div className="mt-8 h-72 animate-pulse rounded-xl bg-stone-200" />
      <p className="sr-only">Loading book search</p>
    </main>
  );
}
