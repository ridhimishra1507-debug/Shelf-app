import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  requireUser: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock('@/features/auth/require-user', () => ({
  requireUser: mocks.requireUser,
}));

import { updateProfile } from './actions';

function createProfileFormData() {
  const formData = new FormData();

  formData.set('displayName', 'Ada Lovelace');
  formData.set('username', 'ada_reader');

  return formData;
}

describe('updateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles a duplicate username without exposing the database error', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: {
        code: '23505',
        message: 'duplicate key value violates unique constraint "profiles_username_lower_key"',
      },
    });
    const select = vi.fn().mockReturnValue({ maybeSingle });
    const eq = vi.fn().mockReturnValue({ select });
    const update = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ update });

    mocks.requireUser.mockResolvedValue({ supabase: { from }, userId: 'user-id' });

    await expect(updateProfile({}, createProfileFormData())).resolves.toEqual({
      error: 'That username is no longer available. Try another one.',
    });

    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
