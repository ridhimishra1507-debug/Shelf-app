import { getReadingStatusLabel, type ReadingStatus } from '../reading-status';

type StatusBadgeProps = {
  status: ReadingStatus;
};

const statusClassNames: Record<ReadingStatus, string> = {
  completed: 'bg-emerald-100 text-emerald-800',
  dnf: 'bg-rose-100 text-rose-800',
  reading: 'bg-sky-100 text-sky-800',
  to_read: 'bg-amber-100 text-amber-800',
  wishlist: 'bg-violet-100 text-violet-800',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassNames[status]}`}>
      {getReadingStatusLabel(status)}
    </span>
  );
}
