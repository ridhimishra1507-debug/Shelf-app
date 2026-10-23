import { describe, expect, it } from 'vitest';

import { parseLibraryItemUpdate } from './schemas';

function createFormData(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

const libraryItemId = '35e3103a-5949-40dd-898c-3d14c19b8af3';

describe('parseLibraryItemUpdate', () => {
  it('converts optional empty fields to null or undefined', () => {
    const result = parseLibraryItemUpdate(
      createFormData({
        completedOn: '',
        currentPage: '',
        libraryItemId,
        notes: '   ',
        rating: '',
        startedOn: '',
        status: 'to_read',
      }),
    );

    expect(result).toMatchObject({
      data: {
        completedOn: undefined,
        currentPage: undefined,
        libraryItemId,
        notes: null,
        rating: undefined,
        startedOn: undefined,
        status: 'to_read',
      },
      success: true,
    });
  });

  it('rejects progress beyond a whole number', () => {
    const result = parseLibraryItemUpdate(
      createFormData({
        completedOn: '',
        currentPage: '12.5',
        libraryItemId,
        notes: '',
        rating: '',
        startedOn: '',
        status: 'reading',
      }),
    );

    expect(result.success).toBe(false);
  });

  it('rejects a completion date before the start date', () => {
    const result = parseLibraryItemUpdate(
      createFormData({
        completedOn: '2026-01-01',
        currentPage: '',
        libraryItemId,
        notes: '',
        rating: '4.5',
        startedOn: '2026-01-02',
        status: 'completed',
      }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Completion date cannot be before the start date.',
      );
    }
  });
});
