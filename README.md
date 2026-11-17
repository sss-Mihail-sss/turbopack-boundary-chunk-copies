# Turbopack: a module shared by a page and its boundaries is downloaded once per boundary chunk

```sh
npm install
npm run build
npm run check
```

- `app/page.jsx`, `app/not-found.jsx`, `app/forbidden.jsx`, `app/unauthorized.jsx` (server components) and
  `app/error.jsx` (a client component) all render `SharedButton` from `lib/shared-button.jsx`, a `'use client'`
  component. It imports `lib/payload.js`: 12 KB of incompressible data, a stand-in for a design system's button and
  its dependencies. The string starts with `SHARED_MODULE_MARKER`.
- `app/unauthorized.jsx` also renders `SignInLink` (`lib/sign-in-link.jsx`), a client component that nothing else
  renders.
- `experimental.authInterrupts` is on, so `forbidden.jsx` and `unauthorized.jsx` take effect.
- `check.mjs` reads the prerendered `.next/server/app/index.html` and lists the JS chunks it makes the browser load:
  the script tags, plus the chunk lists of the client references in the inlined RSC payload. It flags every chunk
  that contains the marker. `npm start`, then the browser's network panel on `/`, shows the same chunks.

Expected: `OK: / downloads lib/payload.js once.` Current: three times, in the chunks of `app/error`,
`app/unauthorized` and the page's.

To see the expected result, render `<SharedButton />` in `app/layout.jsx`, or set
`experimental.turbopackChunking.minChunkSize` to `0`.
