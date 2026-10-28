import type { ThemeId } from '@/features/theme/themes';

export type Profile = {
  displayName: string | null;
  themeId: ThemeId;
  username: string | null;
};

export type ProfileActionState = {
  error?: string;
  message?: string;
};

export type UsernameAvailabilityState = {
  available?: boolean;
  error?: string;
  username?: string;
};

export type UsernameSuggestionState = {
  error?: string;
  username?: string;
};

export const initialProfileActionState: ProfileActionState = {};

export type ThemeActionState = {
  error?: string;
  message?: string;
};

export const initialThemeActionState: ThemeActionState = {};
