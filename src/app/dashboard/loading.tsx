export default function DashboardLoading() {
  return (
    <main aria-busy="true" className="library-page min-h-screen px-6 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="h-36 animate-pulse rounded-2xl bg-surface" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="h-36 animate-pulse rounded-2xl bg-surface" key={index} />
          ))}
        </div>
        <div className="mt-10 h-52 animate-pulse rounded-2xl bg-surface" />
      </div>
      <p className="sr-only">Loading your reading dashboard</p>
    </main>
  );
}
