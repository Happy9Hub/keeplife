# Architecture & Folder Structure

## Routing

- `src/app/[lang]/...` — every user-facing page is locale-prefixed (`en` | `th`). Route handlers
  under `src/app/api/**` are NOT locale-prefixed.
- `src/app/[lang]/(auth)/...` — route group for auth pages. Note `signin` currently lives
  *outside* this group at `src/app/[lang]/signin/`, while `signup` is inside
  `(auth)/signup/`. Keep this in mind if you reorganize — prefer making them consistent
  (both in `(auth)`) rather than adding a third pattern.
- `src/app/[lang]/[...missing]/page.tsx` — catch-all/404 for unmatched locale routes.
- `src/auth.ts` (project root, not under `src/lib`) — the better-auth server instance. Import it
  as `@/auth`.

## Feature folders (`src/features/<feature>/`)

Business logic is grouped by feature, not by file type:

```
src/features/auth/
  components/   # feature-specific React components (forms, buttons)
  schemas/      # zod schemas + inferred types for that feature
```

When adding a new domain area (e.g. `records`, `reminders`, `household`), mirror this shape:
`src/features/<name>/components/`, `src/features/<name>/schemas/`, and optionally
`src/features/<name>/actions/` or `hooks/` if needed. Don't put feature-specific logic in
`src/components/` — that directory is for generic/shared UI only.

## Shared layers

- `src/components/ui/` — generic, reusable presentational components (button, card, form, input,
  dropdown-menu). No feature/business logic here.
- `src/components/landing/` — components only used by the marketing/landing page.
- `src/lib/` — cross-cutting utilities: `prisma.ts` (DB client singleton), `i18n.ts` (locale
  list/helpers), `get-dictionary.ts` (dictionary loader), `auth-client.ts` (better-auth React
  client), `utils.ts` (small helpers like `cn`).
- `src/types/` — shared TypeScript types that don't belong to one feature (currently empty).

## Path alias

`@/*` maps to `src/*` (see `tsconfig.json`). Always use `@/` imports instead of relative
`../../../` chains for anything outside the current feature folder.

## Server vs client

- Default to Server Components. Only add `"use client"` when a component needs interactivity,
  browser APIs, or hooks like `useState`/`react-hook-form`.
- `src/lib/get-dictionary.ts` is marked `import 'server-only'` — never import it from a client
  component; pass the resolved dictionary down as props instead.
- `src/lib/auth-client.ts` is `"use client"` — it's the browser-side better-auth client, not the
  server instance (`@/auth`).
