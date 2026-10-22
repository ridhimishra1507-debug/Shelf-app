# Shelf

Shelf is a visual personal book-library application. It will let readers maintain a private
library, organize books by reading status and custom shelves, and browse their collection as a
digital bookshelf or compact list.

This repository currently contains the product foundation only. Authentication, the book library,
book search, imports, OCR, and bookshelf recognition are deliberately out of scope until their
respective implementation phases.

## Tech stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS
- Supabase CLI and PostgreSQL migrations for local database development
- ESLint and Prettier
- Vitest for unit tests

The application will use Supabase Auth, Postgres, and Storage in later phases. No Supabase client
or production credential is included at this stage.

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
2. Private-library MVP: authentication, book search/manual entry, statuses, custom shelves,
   reading metadata, responsive bookshelf and list views.
3. Library quality: filtering, sorting, bulk operations, detail views, account data controls.
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
