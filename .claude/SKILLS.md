# Project Playbooks

Step-by-step recipes for the most common changes in this repo. These are project-specific
playbooks (not the Claude Code `/skill` system) — read the linked rule files for the "why" behind
each step.

## Add a new translated string

1. Add the key to `dictionaries/en.json` AND `dictionaries/th.json` with the same nested path.
2. If it's feature-specific, nest it under that feature's key (e.g. `dashboard.title`), matching
   the pattern in `docs/dictionaries.md`.
3. Read it in a Server Component via the `dictionary` object passed down from the page-level
   `getDictionary(locale)` call — don't call `getDictionary` again deeper in the tree.
4. If the consuming component is a Client Component, pass only the slice of the dictionary it
   needs as a prop (see how `HeroSection` receives `dictionary.landing.hero`).

See: `.claude/rules/conventions.md`, `docs/dictionaries.md`.

## Add a new Prisma model / field

1. Edit `prisma/schema.prisma`. Add `@@index`/`@@map` consistent with existing models.
2. Run a migration (`npx prisma migrate dev --name <change>`), then `npx prisma generate`.
3. If the field belongs to `User` and needs to be exposed through better-auth (e.g. read/write via
   sign-up or session), also register it in `auth.user.additionalFields` in `src/auth.ts` — Prisma
   alone won't make better-auth aware of it.

See: `.claude/rules/auth.md`.

## Add a new feature area (e.g. "records", "reminders")

1. Create `src/features/<name>/components/` and `src/features/<name>/schemas/`.
2. Define zod schemas first, infer types from them.
3. Build the form/UI using `react-hook-form` + `@hookform/resolvers/zod`, following
   `SignUpForm.tsx` as the template.
4. Add the route under `src/app/[lang]/<name>/page.tsx` (Server Component by default) and an API
   route under `src/app/api/<name>/route.ts` if it needs its own endpoint — re-validate input with
   the same zod schema server-side.

See: `.claude/rules/architecture.md`.

## Add/modify an auth-related page or flow

1. Check `src/auth.ts` first to see what better-auth already supports before writing custom
   logic.
2. Client-side actions go through `authClient` from `src/lib/auth-client.ts`.
3. The only auth route is `src/app/api/auth/[...all]/route.ts` — the project has been fully
   migrated off NextAuth, so don't recreate `[...nextauth]` or a standalone `signup` API route.

See: `.claude/rules/auth.md`, `.claude/rules/project-overview.md`.

## Before writing any Next.js code

This repo pins a Next.js version newer/different from common training data. Read the relevant
guide under `node_modules/next/dist/docs/` for the API you're about to use (routing, route
handlers, metadata, etc.) before assuming the "classic" Next.js API still applies — this is called
out at the top of `AGENTS.md` for a reason.
