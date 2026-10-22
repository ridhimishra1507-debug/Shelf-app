# Shelf development guide

## Project intent

Shelf is a responsive, private personal book-library application. Build it as a maintainable
product, not a prototype. Prefer small, understandable changes and well-supported platform
features over clever abstractions or speculative dependencies.

## Stack and boundaries

- Use Next.js App Router and TypeScript with strict type checking.
- Use Tailwind CSS for styling. Keep tokens and global styles in `src/app/globals.css`; avoid
  ad-hoc inline styles except for genuinely dynamic values.
- `src/app` owns routes, layouts, and route-level composition.
- `src/features/<feature>` owns feature-specific UI, validation, use cases, and types.
- `src/components` is only for reusable presentation components with no feature business logic.
- `src/lib` is only for genuinely shared infrastructure or utilities. Do not make it a dumping
  ground or deep-import private feature internals.
- Keep server-only concerns, credentials, and third-party integrations out of client components.

## Data and Supabase

- Supabase configuration and SQL migrations are version-controlled under `supabase/`.
- Make schema changes through a new timestamped SQL migration. Never rely on unrecorded Dashboard
  changes, and do not rewrite a migration that has been applied outside local development.
- Treat the database as the authorization boundary. Every user-owned table must have Row-Level
  Security enabled, explicit policies, foreign keys, constraints, and query-supporting indexes.
- Use the authenticated user's ID from the database/session; never trust a client-provided user ID.
- Keep service-role credentials server-only. Do not put secrets, keys, tokens, or real URLs in
  source code, documentation examples, test snapshots, or commits.
- The local Supabase stack is development-only and must not be exposed to a public network.

## Product modeling rules

- Built-in reading states are exclusive status values on a library item: `to_read`, `reading`,
  `completed`, `dnf`, and `wishlist`.
- Custom shelves are optional many-to-many collections and are not substitutes for status.
- Shared bibliographic metadata and private per-user reading data must remain separate.
- Hide metadata-provider details behind adapters. Do not couple UI or domain logic directly to one
  provider's response shape.
- Imports and future image recognition must produce reviewable candidates; they must not silently
  add uncertain books to a library.

## Security and quality

- Validate all external input at server boundaries and enforce important invariants in SQL too.
- Render user and provider text safely; never treat it as trusted HTML.
- Apply rate limits and file-size/type controls to externally reachable operations when those
  features are introduced.
- Treat uploaded media and OCR/model output as untrusted input. Keep uploads private by default.
- Keep client components minimal. Prefer Server Components and server-side data access unless
  browser interaction is required.

## Workflow

- Before adding a dependency, document the concrete need and choose the smallest maintained option.
- Update the README and this guide when an architectural convention changes.
- Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test`, and
  `npm run build` for changes that can affect them.
- Do not implement authentication, library CRUD, bookshelf UI, imports, OCR, or image recognition
  until their implementation phase is explicitly requested.
