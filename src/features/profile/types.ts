export type Profile = {
  displayName: string | null;
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
