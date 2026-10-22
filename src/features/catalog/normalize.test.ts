import { describe, expect, it } from 'vitest';

import {
  isValidIsbn10,
  isValidIsbn13,
  normalizeIsbnDigits,
  normalizeNameList,
  splitIsbns,
  toSecureUrl,
  truncateText,
} from './normalize';

describe('toSecureUrl', () => {
  it('upgrades http links to https', () => {
    expect(toSecureUrl('http://example.com/cover.jpg')).toBe('https://example.com/cover.jpg');
  });

  it('leaves https links untouched', () => {
    expect(toSecureUrl('https://example.com/cover.jpg')).toBe('https://example.com/cover.jpg');
  });

  it('returns null for missing values', () => {
    expect(toSecureUrl(undefined)).toBeNull();
    expect(toSecureUrl(null)).toBeNull();
    expect(toSecureUrl('   ')).toBeNull();
  });
});

describe('normalizeIsbnDigits', () => {
  it('strips spaces and dashes', () => {
    expect(normalizeIsbnDigits('978-0-14-044913-6')).toBe('9780140449136');
  });

  it('uppercases the check character', () => {
    expect(normalizeIsbnDigits('0-8044-2957-x')).toBe('080442957X');
  });

  it('returns null for empty values', () => {
    expect(normalizeIsbnDigits('')).toBeNull();
    expect(normalizeIsbnDigits(undefined)).toBeNull();
  });
});

describe('isbn shape validators', () => {
  it('accepts well-formed identifiers', () => {
    expect(isValidIsbn10('080442957X')).toBe(true);
    expect(isValidIsbn13('9780140449136')).toBe(true);
  });

  it('rejects malformed identifiers', () => {
    expect(isValidIsbn10('08044295')).toBe(false);
    expect(isValidIsbn10('0804429571')).toBe(false);
    expect(isValidIsbn13('978014044913')).toBe(false);
    expect(isValidIsbn13('978014044913X')).toBe(false);
  });
});

describe('splitIsbns', () => {
  it('classifies a mixed list by identifier shape', () => {
    expect(splitIsbns(['080442957X', '9780140449136'])).toEqual({
      isbn10: '080442957X',
      isbn13: '9780140449136',
    });
  });

  it('ignores values that are not isbn shaped', () => {
    expect(splitIsbns(['not-an-isbn', '12345'])).toEqual({
      isbn10: null,
      isbn13: null,
    });
  });

  it('keeps the first match of each kind', () => {
    expect(splitIsbns(['9780140449136', '9780140449128'])).toEqual({
      isbn10: null,
      isbn13: '9780140449136',
    });
  });

  it('handles missing input', () => {
    expect(splitIsbns(undefined)).toEqual({ isbn10: null, isbn13: null });
  });
});

describe('truncateText', () => {
  it('trims whitespace', () => {
    expect(truncateText('  hello  ', 10)).toBe('hello');
  });

  it('truncates to the maximum length', () => {
    expect(truncateText('abcdefghij', 4)).toBe('abcd');
  });

  it('returns null for blank values', () => {
    expect(truncateText('   ', 10)).toBeNull();
    expect(truncateText(null, 10)).toBeNull();
  });
});

describe('normalizeNameList', () => {
  it('removes blanks and duplicates while preserving order', () => {
    expect(
      normalizeNameList(['Octavia Butler', '  ', 'octavia butler', 'Ursula K. Le Guin']),
    ).toEqual(['Octavia Butler', 'Ursula K. Le Guin']);
  });

  it('collapses internal whitespace', () => {
    expect(normalizeNameList(['Octavia   E.  Butler'])).toEqual(['Octavia E. Butler']);
  });

  it('handles missing input', () => {
    expect(normalizeNameList(undefined)).toEqual([]);
  });
});
