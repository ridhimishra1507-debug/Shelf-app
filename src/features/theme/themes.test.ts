import { describe, expect, it } from 'vitest';

import { defaultThemeId, getTheme, getThemeStyle, isThemeId, themeIds, themes } from './themes';

describe('Shelf themes', () => {
  it('keeps a resolved theme and CSS custom properties for each saved theme preference', () => {
    expect(themeIds).toHaveLength(16);
    expect(themes.map((theme) => theme.id)).toEqual(themeIds);

    for (const themeId of themeIds) {
      const theme = getTheme(themeId);

      expect(theme.id).toBe(themeId);
      expect(getThemeStyle(theme)).toMatchObject({
        '--theme-accent': theme.colors.accent,
        '--theme-page': theme.colors.page,
        '--theme-text': theme.colors.text,
      });
    }
  });

  it('uses the default theme for an absent or invalid saved preference', () => {
    expect(getTheme(undefined)).toHaveProperty('id', defaultThemeId);
    expect(isThemeId('not-a-theme')).toBe(false);
  });
});
