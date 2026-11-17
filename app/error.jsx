'use client';

import { SharedButton } from '../lib/shared-button';

export default function ErrorBoundary({ reset }) {
  return (
    <main>
      <h1>Something went wrong</h1>
      <SharedButton>Try again</SharedButton>
    </main>
  );
}
