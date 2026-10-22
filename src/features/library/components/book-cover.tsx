type BookCoverProps = {
  coverUrl: string | null;
  title: string;
};

export function BookCover({ coverUrl, title }: BookCoverProps) {
  if (!coverUrl) {
    return (
      <div className="grid aspect-[2/3] w-full place-items-center rounded-md bg-stone-200 p-3 text-center text-xs font-medium text-stone-600">
        No cover
      </div>
    );
  }

  return (
    <img
      alt={`Cover of ${title}`}
      className="aspect-[2/3] w-full rounded-md bg-stone-100 object-cover shadow-sm"
      loading="lazy"
      referrerPolicy="no-referrer"
      src={coverUrl}
    />
  );
}
