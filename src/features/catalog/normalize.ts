/**
 * Provider-neutral helpers shared by the book metadata adapters.
 *
 * Adapters translate a provider payload into the normalized `BookSearchResult`
 * shape. These helpers keep the rules that are easy to get subtly wrong
 * (ISBN cleanup, URL hardening, list trimming) in one testable place.
 */

export const maxDescriptionLength = 10_000;

export function toSecureUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/^http:/i, 'https:');
}

export function normalizeIsbnDigits(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const digits = value.replace(/[\s-]/g, '').toUpperCase();

  return digits.length > 0 ? digits : null;
}

export function isValidIsbn10(value: string): boolean {
  if (!/^\d{9}[\dX]$/.test(value)) {
    return false;
  }

  let sum = 0;

  for (let index = 0; index < 9; index += 1) {
    sum += (10 - index) * Number(value[index]);
  }

  const check = value[9] === 'X' ? 10 : Number(value[9]);
  return (sum + check) % 11 === 0;
}

export function isValidIsbn13(value: string): boolean {
  if (!/^\d{13}$/.test(value)) {
    return false;
  }

  let sum = 0;

  for (let index = 0; index < 12; index += 1) {
    const digit = Number(value[index]);
    sum += index % 2 === 0 ? digit : digit * 3;
  }

  const check = (10 - (sum % 10)) % 10;
  return check === Number(value[12]);
}

/**
 * Open Library returns a mixed list of ISBN-10 and ISBN-13 identifiers without
 * labelling them, so both forms have to be detected from their shape.
 */
export function splitIsbns(values: readonly string[] | null | undefined): {
  isbn10: string | null;
  isbn13: string | null;
} {
  let isbn10: string | null = null;
  let isbn13: string | null = null;

  for (const value of values ?? []) {
    const normalized = normalizeIsbnDigits(value);

    if (!normalized) {
      continue;
    }

    if (isValidIsbn13(normalized)) {
      isbn13 ??= normalized;
      continue;
    }

    if (isValidIsbn10(normalized)) {
      isbn10 ??= normalized;
    }
  }

  return { isbn10, isbn13 };
}

export function truncateText(value: string | null | undefined, maxLength: number): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

/**
 * Removes duplicate and blank entries while preserving provider order.
 */
export function normalizeNameList(values: readonly string[] | null | undefined): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const value of values ?? []) {
    const trimmed = value.replace(/\s+/g, ' ').trim();

    if (!trimmed) {
      continue;
    }

    const key = trimmed.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    names.push(trimmed);
  }

  return names;
}
