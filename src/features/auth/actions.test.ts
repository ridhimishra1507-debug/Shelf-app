import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  hasSupabasePublicConfig: vi.fn(),
  isUsernameAvailable: vi.fn(),
  signUp: vi.fn(),
  suggestAvailableUsername: vi.fn(),
}));

vi.mock('@/lib/supabase/config', () => ({
  hasSupabasePublicConfig: mocks.hasSupabasePublicConfig,
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClient,
}));

vi.mock('@/features/profile/username-service', () => ({
  isUsernameAvailable: mocks.isUsernameAvailable,
  suggestAvailableUsername: mocks.suggestAvailableUsername,
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({ get: () => 'http://localhost:3000' }),
}));

import { signUp } from './actions';

function createSignUpFormData() {
  const formData = new FormData();

  formData.set('displayName', 'Ada Lovelace');
  formData.set('email', 'ada@example.com');
  formData.set('password', 'correct-horse-battery-staple');
  formData.set('username', 'ada_reader');

  return formData;
}

describe('signUp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabasePublicConfig.mockReturnValue(true);
    mocks.createClient.mockResolvedValue({ auth: { signUp: mocks.signUp } });
  });

  it('reports a username collision that happens after the initial availability check', async () => {
    mocks.isUsernameAvailable.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    mocks.signUp.mockResolvedValue({
      data: { session: null },
      error: { message: 'signup failed' },
    });

    await expect(signUp({}, createSignUpFormData())).resolves.toEqual({
      error: 'That username is no longer available. Try another one.',
    });

    expect(mocks.isUsernameAvailable).toHaveBeenCalledTimes(2);
    expect(mocks.signUp).toHaveBeenCalledWith({
      email: 'ada@example.com',
      options: {
        data: {
          display_name: 'Ada Lovelace',
          username: 'ada_reader',
        },
        emailRedirectTo: expect.stringMatching(/\/auth\/callback$/),
      },
      password: 'correct-horse-battery-staple',
    });
  });

  it('does not expose an Auth or database error when the failure is unrelated to username availability', async () => {
    mocks.isUsernameAvailable.mockResolvedValue(true);
    mocks.signUp.mockResolvedValue({
      data: { session: null },
      error: { message: 'internal database details' },
    });

    await expect(signUp({}, createSignUpFormData())).resolves.toEqual({
      error: 'Unable to create an account. Try again shortly.',
    });
  });
});
