# Coding Conventions

## TypeScript

- `strict: true` is on — don't weaken it or sprinkle `any`/`as any` to silence errors; fix the
  actual type.
- Prefer inferring types from zod schemas (`z.infer<typeof someSchema>`) over hand-writing
  duplicate interfaces, as done in `src/features/auth/schemas/auth.schema.ts`.

## Forms & validation

- Pattern: zod schema in `features/<x>/schemas/`, wired into `react-hook-form` via
  `@hookform/resolvers/zod`. Follow `auth.schema.ts` + `SignInForm.tsx`/`SignUpForm.tsx` as the
  reference implementation for new forms.
- Validate on both client (react-hook-form/zod) and server (re-parse with the same schema in the
  route handler) — don't trust client-side validation alone for API routes.

## Styling

- Tailwind CSS v4 utility classes directly in JSX. Use the `cn()` helper from `src/lib/utils.ts`
  for conditionally joining class names — don't add a new classnames/clsx dependency.
- Generic, reusable primitives go in `src/components/ui/`; keep them unopinionated about specific
  features.

## Database

- Always go through `src/lib/prisma.ts` (`prisma` singleton) — never instantiate a second
  `PrismaClient`.
- Schema changes go in `prisma/schema.prisma`, then run a Prisma migration. Keep `@@map`/snake or
  plural table names consistent with existing models (e.g. `households`, `users`, `records`).
- Money is stored as `Float` (`Record.amount`) — be careful with floating point when doing
  aggregation/sum logic; don't silently switch this to `Decimal` without a migration plan.

## i18n

- Never hardcode user-facing English/Thai strings in components — add the key to **both**
  `dictionaries/en.json` and `dictionaries/th.json` with matching structure, then read it via the
  dictionary object passed down from the page. See
  [`docs/dictionaries.md`](../../docs/dictionaries.md) for the full flow.

## Imports

- Use the `@/` alias (`@/lib/...`, `@/features/...`, `@/auth`) instead of relative path chains
  that cross more than one directory level.

## Linting

- `npm run lint` uses `eslint-config-next` (core-web-vitals + typescript). Fix lint errors instead
  of disabling rules inline unless there's a documented reason.
