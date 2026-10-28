# Shelf

Shelf is a visual personal book-library application. It will let readers maintain a private
library, organize books by reading status and custom shelves, and browse their collection as a
digital bookshelf or compact list.

Shelf currently supports email/password authentication and a private personal library. Signed-in
readers can search Google Books and Open Library, add results to their library, update reading
status, rating, notes, and page progress, and remove books. Imports, OCR, and bookshelf
recognition remain out of scope.

## Tech stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS
- Supabase CLI and PostgreSQL migrations for local database development
- ESLint and Prettier
- Vitest for unit tests

The application uses Supabase Auth and Postgres for the private library. No production credentials
are included in this repository.

Each account also has a private Shelf identity: a case-insensitive, lowercase username and a
preferred “Call me” name. Apply the committed migrations before testing sign-up or account
settings. Existing Auth accounts receive an empty private profile record during the identity
migration; no username is invented and they can choose one later from **Account** without affecting
their existing library.

Until a Supabase project is available, the catalog search page remains usable without credentials.
Account, private-library, and editing workflows stay disabled or redirect to sign-in until the
required environment variables are configured; Shelf does not use a mocked production backend.

## Prerequisites

- Node.js 22.12 or newer (Node 24 is used in this workspace)
- npm
- Docker Desktop or another Docker-compatible runtime for the local Supabase stack

## Local development

Install dependencies and start the web application:

```bash
npm install
npm run dev
```

The app is available at [http://localhost:3000](http://localhost:3000).

### Local Supabase

The versioned `supabase/config.toml` is safe to commit and contains no credentials. Start the
local stack only after Docker is running:

```bash
npm run supabase:start
npm run supabase:status
```

Copy `.env.example` to `.env.local`, then set the local API URL and publishable key emitted by
`npm run supabase:status`. Stop the stack with `npm run supabase:stop`. Apply every committed
migration and seed file from a clean local database with:

```bash
npm run db:reset
```

Never run a reset against a linked production project.

For an existing hosted Supabase project, apply the new migration through the normal deployment
workflow before deploying this application change. The migration adds the username constraints,
backfills only missing profile rows, and exposes a boolean-only username-availability function; it
does not require a service-role key or any manual changes in the Supabase Dashboard.

## Environment variables

| Variable                               | Required when                                 | Description                      |
| -------------------------------------- | --------------------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | A Supabase-backed feature is implemented      | Local or hosted Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | A browser-safe Supabase client is implemented | Supabase publishable key         |

Do not create or commit `.env.local`. Server-only secrets—such as a Supabase service-role key or
third-party provider credentials—will be introduced only with a specific server-side need.

## Commands

```bash
npm run dev            # Start Next.js in development mode
npm run lint           # Run ESLint
npm run format:check   # Check Prettier formatting
npm run format         # Apply Prettier formatting
npm run typecheck      # Run TypeScript without emitting files
npm run test           # Run the Vitest suite
npm run build          # Create the production build
```

## Planned phases

1. Foundation: project setup, local Supabase configuration, migrations, quality tooling.
2. Core personal library: authentication, catalog search, private library items, statuses, reading
   metadata, and detail views.
3. Library quality: filtering, sorting, custom shelves, bulk operations, and account data controls.
4. Structured imports: plain text, CSV/XLSX parsing, catalog matching, and review/confirm flow.
5. Image imports: private uploads, asynchronous OCR, candidate matching, and review.
6. Physical-bookshelf recognition and optional product expansion.

## Architecture

Shelf is a modular monolith. Route composition lives in `src/app`; product capabilities live in
`src/features`; reusable presentation components live in `src/components`; shared infrastructure
lives in `src/lib`. The database schema is represented exclusively by version-controlled SQL
migrations in `supabase/migrations`.

Read [AGENTS.md](AGENTS.md) before contributing. It defines the architectural, database, security,
and workflow conventions for this repository.
