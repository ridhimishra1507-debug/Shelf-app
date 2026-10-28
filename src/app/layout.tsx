import type { Metadata } from 'next';
import { Suspense, type ReactNode } from 'react';

import { SavedTheme } from '@/features/theme/components/saved-theme';
import { defaultThemeId } from '@/features/theme/themes';

import './globals.css';

export const metadata: Metadata = {
  title: 'Shelf',
  description: 'A visual personal book-library application.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className="h-full antialiased" data-theme={defaultThemeId} lang="en">
      <body className="theme-shell min-h-full flex flex-col">
        <Suspense fallback={null}>
          <SavedTheme />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
