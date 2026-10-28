import Link from 'next/link';

import { ProfileForm } from '@/features/profile/components/profile-form';
import { getProfile } from '@/features/profile/repository';
import { requireUser } from '@/features/auth/require-user';

export const metadata = {
  title: 'Account | Shelf',
};

// This private route reads the authenticated session from request cookies.
export const instant = false;

export default async function AccountPage() {
  const { supabase } = await requireUser();
  const profile = await getProfile(supabase);

  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <section className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <Link
          className="text-sm font-medium tracking-[0.2em] text-stone-500 uppercase"
          href="/library"
        >
          Shelf
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950">Your identity</h1>
        <p className="mt-2 text-sm text-stone-600">
          Your username is reserved for your account. Your library remains private.
        </p>
        <ProfileForm
          displayName={profile?.displayName ?? null}
          username={profile?.username ?? null}
        />
      </section>
    </main>
  );
}
