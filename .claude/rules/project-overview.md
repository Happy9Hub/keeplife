# Project Overview

KeepLife is a household finance & reminders app: shared expense tracking, bills/subscriptions,
and maintenance/passport-style reminders for a household (multiple users per household).

## Stack

- Next.js 16 (App Router) — see the breaking-changes warning at the top of `AGENTS.md`. This is
  a bleeding-edge version; do not assume training-data Next.js APIs are correct.
- React 19, TypeScript (strict mode), Tailwind CSS v4
- Prisma 7 + `@prisma/adapter-mariadb` against MySQL/MariaDB (see `docker-compose.yml`)
- better-auth (email/password + Google OAuth) — NOT NextAuth, see `.claude/rules/auth.md`
- react-hook-form + zod for forms/validation
- Custom lightweight i18n via JSON dictionaries (no next-intl/i18next) — see
  [`docs/dictionaries.md`](../../docs/dictionaries.md)

## Domain model (`prisma/schema.prisma`)

- `Household` — owns `Category`, `Reminder`, and has many `User`
- `User` — belongs to a `Household`, has a `role` (`admin` | `member`)
- `Category` — `kind`: `fixed` | `variable` | `leisure`, bilingual name (`nameEn`/`nameTh`)
- `Record` — a spend entry (`type`: `expense` | `bill` | `subscription` | `maintenance`)
- `Reminder` — recurring or one-off due dates (`type`: `maintenance` | `passport` | `bill` |
  `subscription`)
- `Account` / `Session` / `Verification` — better-auth's own tables, do not hand-edit their shape

## Migration history

The project migrated from NextAuth to better-auth (see commit `4c79a2e`). The migration is now
complete: the NextAuth package is gone from `package.json`, and the empty leftover directories
(`src/app/api/auth/[...nextauth]/`, `src/app/api/auth/signup/`) have been removed. The only auth
route is `src/app/api/auth/[...all]/route.ts` (better-auth's catch-all handler). Don't recreate
those old paths.
