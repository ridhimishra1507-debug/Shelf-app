import { describe, expect, it } from 'vitest';

import {
  displayNameSchema,
  normalizeDisplayName,
  normalizeUsername,
  optionalUsernameSchema,
  usernameSchema,
} from './schemas';
import { createGeneratedUsername, getGeneratedUsernameStem } from './username-service';

describe('profile identity validation', () => {
  it('normalizes usernames to trimmed lowercase values', () => {
    expect(normalizeUsername('  Shelf_Reader42  ')).toBe('shelf_reader42');
    expect(usernameSchema.parse('  Shelf_Reader42  ')).toBe('shelf_reader42');
  });

  it.each(['ab', 'a'.repeat(31), 'reader-name', 'reader name', 'rêader'])(
    'rejects an invalid username: %s',
    (username) => {
      expect(usernameSchema.safeParse(username).success).toBe(false);
    },
  );

  it('allows an omitted username so signup can generate one', () => {
    expect(optionalUsernameSchema.parse('   ')).toBe('');
  });

  it('normalizes and limits the preferred display name', () => {
    expect(normalizeDisplayName('  Ada   Lovelace  ')).toBe('Ada Lovelace');
    expect(displayNameSchema.parse('  Ada   Lovelace  ')).toBe('Ada Lovelace');
    expect(displayNameSchema.safeParse('   ').success).toBe(false);
    expect(displayNameSchema.safeParse('a'.repeat(101)).success).toBe(false);
  });

  it('builds a valid, readable username suggestion', () => {
    expect(getGeneratedUsernameStem('Éowyn of Rohan')).toBe('eowyn_of_rohan');
    expect(createGeneratedUsername('Éowyn of Rohan', 'a1b2c3d4')).toBe('eowyn_of_rohan_a1b2c3d4');
  });
});
