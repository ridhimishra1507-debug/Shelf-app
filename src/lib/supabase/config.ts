type SupabasePublicEnvironmentVariable =
  'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY';

export class SupabaseConfigurationError extends Error {
  constructor() {
    super(
      'Supabase is not configured. Copy .env.example to .env.local and set the required values.',
    );
    this.name = 'SupabaseConfigurationError';
  }
}

function getPublicValue(name: SupabasePublicEnvironmentVariable) {
  return process.env[name]?.trim();
}

function getRequiredPublicValue(name: SupabasePublicEnvironmentVariable) {
  const value = getPublicValue(name);

  if (!value) {
    throw new SupabaseConfigurationError();
  }

  return value;
}

/**
 * Lets public routes render useful setup and signed-out states before a
 * Supabase project exists. Database-backed routes still require both values.
 */
export function hasSupabasePublicConfig() {
  return Boolean(
    getPublicValue('NEXT_PUBLIC_SUPABASE_URL') &&
    getPublicValue('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
  );
}

export function getSupabasePublicConfig() {
  return {
    publishableKey: getRequiredPublicValue('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
    url: getRequiredPublicValue('NEXT_PUBLIC_SUPABASE_URL'),
  };
}
