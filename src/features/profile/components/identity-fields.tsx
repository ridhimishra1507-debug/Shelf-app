'use client';

import { useRef, useState, useTransition } from 'react';

import { checkUsernameAvailability, suggestUsername } from '../identity-actions';
import { normalizeUsername } from '../schemas';

type UsernameStatus = {
  error?: string;
  message?: string;
  username?: string;
};

type IdentityFieldsProps = {
  defaultDisplayName?: string | null;
  defaultUsername?: string | null;
  disabled?: boolean;
};

export function IdentityFields({
  defaultDisplayName,
  defaultUsername,
  disabled = false,
}: IdentityFieldsProps) {
  const displayNameInput = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(defaultUsername ?? '');
  const [status, setStatus] = useState<UsernameStatus>();
  const [isChecking, startChecking] = useTransition();
  const [isGenerating, startGenerating] = useTransition();

  function handleUsernameBlur() {
    const normalizedUsername = normalizeUsername(username);

    setUsername(normalizedUsername);
    setStatus(undefined);

    if (!normalizedUsername) {
      return;
    }

    if (normalizedUsername === defaultUsername) {
      setStatus({ message: 'This is your current username.', username: normalizedUsername });
      return;
    }

    startChecking(async () => {
      try {
        const result = await checkUsernameAvailability(normalizedUsername);

        setStatus({
          error: result.error ?? (result.available ? undefined : 'Username is already taken.'),
          message: result.available ? 'Username available.' : undefined,
          username: result.username ?? normalizedUsername,
        });
      } catch {
        setStatus({
          error: 'Unable to check username availability. Try again shortly.',
          username: normalizedUsername,
        });
      }
    });
  }

  function handleSuggestion() {
    setStatus(undefined);

    startGenerating(async () => {
      try {
        const result = await suggestUsername(displayNameInput.current?.value ?? '');

        if (result.username) {
          setUsername(result.username);
          setStatus({ message: 'Username available.', username: result.username });
          return;
        }

        setStatus({ error: result.error ?? 'Unable to suggest a username.' });
      } catch {
        setStatus({ error: 'Unable to suggest a username. Try again shortly.' });
      }
    });
  }

  const statusForCurrentUsername =
    !status?.username || status.username === username ? status : undefined;

  return (
    <>
      <label className="grid gap-2 text-sm font-medium text-stone-700" htmlFor="displayName">
        Call me
        <input
          autoComplete="name"
          className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-950 shadow-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-200"
          defaultValue={defaultDisplayName ?? ''}
          disabled={disabled}
          id="displayName"
          maxLength={100}
          name="displayName"
          ref={displayNameInput}
          required
          type="text"
        />
      </label>

      <div className="grid gap-2">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <label
            className="grid min-w-0 flex-1 gap-2 text-sm font-medium text-stone-700"
            htmlFor="username"
          >
            Username
            <input
              autoCapitalize="none"
              autoComplete="username"
              className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base text-stone-950 shadow-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-200"
              disabled={disabled}
              id="username"
              maxLength={30}
              name="username"
              onBlur={handleUsernameBlur}
              onChange={(event) => {
                setUsername(event.target.value);
                setStatus(undefined);
              }}
              pattern="[A-Za-z0-9_]{3,30}"
              spellCheck={false}
              type="text"
              value={username}
            />
          </label>
          <button
            className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled || isGenerating}
            onClick={handleSuggestion}
            type="button"
          >
            {isGenerating ? 'Finding…' : 'Surprise me'}
          </button>
        </div>
        <p className="text-xs leading-5 text-stone-500">
          Use 3–30 letters, numbers, or underscores. Usernames are saved in lowercase; leave this
          blank and Shelf will choose one for you.
        </p>
        {isChecking ? <p className="text-sm text-stone-600">Checking username…</p> : null}
        {statusForCurrentUsername?.error ? (
          <p aria-live="polite" className="text-sm text-red-700">
            {statusForCurrentUsername.error}
          </p>
        ) : null}
        {statusForCurrentUsername?.message ? (
          <p aria-live="polite" className="text-sm text-emerald-700">
            {statusForCurrentUsername.message}
          </p>
        ) : null}
      </div>
    </>
  );
}
