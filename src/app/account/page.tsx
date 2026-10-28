import Link from 'next/link';

import { ProfileForm } from '@/features/profile/components/profile-form';
import { ThemeGallery } from '@/features/profile/components/theme-gallery';
import { getProfile } from '@/features/profile/repository';
import { requireUser } from '@/features/auth/require-user';
import { defaultThemeId } from '@/features/theme/themes';

export const metadata = {
  title: 'Account | Shelf',
};

// This private route reads the authenticated session from request cookies.
export const instant = false;

export default async function AccountPage() {
  const { supabase } = await requireUser();
  const profile = await getProfile(supabase);

  return (
    <main className="min-h-screen px-6 py-12">
      <section className="mx-auto w-full max-w-6xl rounded-xl border border-border bg-surface p-6 shadow-theme sm:p-8">
        <Link
          className="text-sm font-medium tracking-[0.2em] text-stone-500 uppercase"
          href="/library"
        >
          Shelf
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-primary">Your identity</h1>
        <p className="mt-2 text-sm text-secondary">
          Your username is reserved for your account. Your library remains private.
        </p>
        <div className="max-w-md">
          <ProfileForm
            displayName={profile?.displayName ?? null}
            username={profile?.username ?? null}
          />
        </div>
        <ThemeGallery initialThemeId={profile?.themeId ?? defaultThemeId} />
      </section>
    </main>
  );
}
