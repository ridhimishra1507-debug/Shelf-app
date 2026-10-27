export default function LibraryLoading() {
  return (
    <main aria-busy="true" className="library-page min-h-screen px-6 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="h-28 animate-pulse rounded-2xl bg-stone-200/80" />
        <div className="mt-10">
          <div className="h-16 w-56 animate-pulse rounded-xl bg-stone-200/80" />
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white/60 p-5 sm:p-6">
            <div className="h-6 w-40 animate-pulse rounded bg-stone-200/80" />
            <div className="mt-6 grid grid-cols-2 gap-x-4 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 5 }, (_, index) => (
                <div className="animate-pulse" key={index}>
                  <div className="aspect-[2/3] rounded-xl bg-stone-200/80" />
                  <div className="mt-3 h-4 rounded bg-stone-200/80" />
                  <div className="mt-2 h-3 w-2/3 rounded bg-stone-200/80" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only">Loading your library</p>
    </main>
  );
}
