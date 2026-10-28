-- Shelf appearance is a private account preference. Theme IDs are stable values from the
-- application registry; the default preserves a complete profile for existing users.

alter table public.profiles
  add column theme_id text not null default 'old-library',
  add constraint profiles_theme_id_check check (
    theme_id in (
      'old-library',
      'blood-parchment',
      'nocturne-bloom',
      'astral-lagoon',
      'sage-oak',
      'velvet-twilight',
      'amber-mirage',
      'midnight-sakura',
      'dark-academia',
      'enchanted-garden',
      'linen-amethyst',
      'neon-reverie',
      'frost-fairy',
      'cosmic-reverie',
      'autumn-ember',
      'pastel-daydream'
    )
  );

comment on column public.profiles.theme_id is
  'The authenticated user’s private Shelf appearance preference.';
