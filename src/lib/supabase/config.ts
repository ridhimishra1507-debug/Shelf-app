function getRequiredPublicValue(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured. Copy .env.example to .env.local and set the value.`);
  }

  return value;
}

export function getSupabasePublicConfig() {
  return {
    publishableKey: getRequiredPublicValue('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
    url: getRequiredPublicValue('NEXT_PUBLIC_SUPABASE_URL'),
  };
}
