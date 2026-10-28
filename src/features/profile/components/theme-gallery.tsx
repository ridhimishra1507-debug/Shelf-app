'use client';

import { useEffect, useState, useTransition } from 'react';

import { getTheme, getThemeStyle, themes, type ThemeId } from '@/features/theme/themes';

import { updateTheme } from '../actions';

type ThemeGalleryProps = {
  initialThemeId: ThemeId;
};

function applyTheme(themeId: ThemeId) {
  const root = document.documentElement;
  const theme = getTheme(themeId);

  root.dataset.theme = theme.id;

  for (const [property, value] of Object.entries(getThemeStyle(theme))) {
    root.style.setProperty(property, String(value));
  }
}

export function ThemeGallery({ initialThemeId }: ThemeGalleryProps) {
  const [selectedThemeId, setSelectedThemeId] = useState(initialThemeId);
  const [status, setStatus] = useState<string>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    applyTheme(initialThemeId);
  }, [initialThemeId]);

  function selectTheme(themeId: ThemeId) {
    const previousThemeId = selectedThemeId;

    if (themeId === previousThemeId) {
      return;
    }

    setSelectedThemeId(themeId);
    setStatus(undefined);
    applyTheme(themeId);

    startTransition(async () => {
      const formData = new FormData();
      formData.set('themeId', themeId);

      try {
        const result = await updateTheme({}, formData);

        if (result.error) {
          setSelectedThemeId(previousThemeId);
          applyTheme(previousThemeId);
          setStatus(result.error);
          return;
        }

        setStatus(result.message);
      } catch {
        setSelectedThemeId(previousThemeId);
        applyTheme(previousThemeId);
        setStatus('Unable to save your theme. Please try again.');
      }
    });
  }

  return (
    <section aria-labelledby="theme-gallery-heading" className="mt-12 border-t border-border pt-10">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Appearance</p>
        <h2
          className="mt-2 text-2xl font-semibold tracking-tight text-primary"
          id="theme-gallery-heading"
        >
          Choose your Shelf
        </h2>
        <p className="mt-2 text-sm leading-6 text-secondary">
          Pick any curated atmosphere. Your choice follows you whenever you sign in.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {themes.map((theme) => {
          const isSelected = selectedThemeId === theme.id;

          return (
            <button
              aria-pressed={isSelected}
              className={`theme-option group text-left ${
                isSelected ? 'theme-option-selected' : ''
              }`}
              disabled={isPending}
              key={theme.id}
              onClick={() => selectTheme(theme.id)}
              type="button"
            >
              <div className="theme-preview" style={getThemeStyle(theme)}>
                <div className="theme-preview-atmosphere" />
                <div className="theme-preview-shelf">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="theme-preview-copy">
                  <span className="theme-preview-kicker">Shelf</span>
                  <span className="theme-preview-title">A reader’s place</span>
                </div>
              </div>
              <span className="mt-4 flex items-start justify-between gap-3">
                <span>
                  <span className="block font-semibold text-primary">{theme.name}</span>
                  <span className="mt-1 block text-sm leading-5 text-secondary">
                    {theme.description}
                  </span>
                </span>
                {isSelected ? <span className="theme-selected-mark">Selected</span> : null}
              </span>
              <span aria-hidden="true" className="mt-4 flex gap-1.5">
                {theme.palette.map((color) => (
                  <span className="theme-swatch" key={color} style={{ backgroundColor: color }} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {status ? (
        <p aria-live="polite" className="mt-5 text-sm text-secondary">
          {status}
        </p>
      ) : null}
    </section>
  );
}
