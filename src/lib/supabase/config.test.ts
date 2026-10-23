import { afterEach, describe, expect, it } from 'vitest';

import { getSupabasePublicConfig, hasSupabasePublicConfig } from './config';

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalPublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

afterEach(() => {
  if (originalUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  }

  if (originalPublishableKey === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalPublishableKey;
  }
});

describe('Supabase public configuration', () => {
  it('reports unavailable when either required value is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    expect(hasSupabasePublicConfig()).toBe(false);
    expect(() => getSupabasePublicConfig()).toThrow('Supabase is not configured.');
  });

  it('trims and returns configured public values', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = ' https://example.supabase.co ';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = ' example-key ';

    expect(hasSupabasePublicConfig()).toBe(true);
    expect(getSupabasePublicConfig()).toEqual({
      publishableKey: 'example-key',
      url: 'https://example.supabase.co',
    });
  });
});
