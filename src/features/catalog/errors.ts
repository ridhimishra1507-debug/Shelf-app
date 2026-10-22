export class BookSearchProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookSearchProviderError';
  }
}

export const bookSearchUnavailableMessage =
  'Book search is temporarily unavailable. Please try again.';

export const bookSearchUnexpectedResponseMessage =
  'Book search returned an unexpected response. Please try again.';
