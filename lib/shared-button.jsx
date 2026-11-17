'use client';

import { PAYLOAD } from './payload';

// Used by the page and by every boundary of the root segment.
export function SharedButton({ children }) {
  return (
    <button type="button" onClick={() => console.log(PAYLOAD)}>
      {children}
    </button>
  );
}
