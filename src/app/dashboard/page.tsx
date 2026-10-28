import { ReadingDashboard } from '@/features/dashboard/components/reading-dashboard';
import { listDashboardLibraryItems } from '@/features/dashboard/repository';
import { getReadingDashboard } from '@/features/dashboard/statistics';
import { requireUser } from '@/features/auth/require-user';

export const metadata = {
  title: 'Reading dashboard | Shelf',
};

// This private route reads the authenticated session from request cookies.
export const instant = false;

export default async function DashboardPage() {
  const { supabase } = await requireUser();
  const year = new Date().getFullYear();
  const items = await listDashboardLibraryItems(supabase);

  return <ReadingDashboard dashboard={getReadingDashboard(items, year)} year={year} />;
}
