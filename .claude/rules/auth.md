# Authentication (better-auth)

This project uses **better-auth**, not NextAuth/Auth.js. The earlier NextAuth implementation has
been fully removed (package, routes, leftover dirs) — see `.claude/rules/project-overview.md`.

## Where things live

- `src/auth.ts` — server-side `betterAuth(...)` instance. Configures:
  - `emailAndPassword` (min length 8)
  - Google OAuth (`socialProviders.google`), only enabled if `AUTH_GOOGLE_ID` /
    `AUTH_GOOGLE_SECRET` env vars are set
  - `prismaAdapter(prisma, { provider: "mysql" })` against the `User`/`Account`/`Session`/
    `Verification` models in `prisma/schema.prisma`
  - Additional user fields: `role` (default `"member"`), `householdId`, `passwordHash` — all
    `input: false`, so they can't be set directly via the auth API; set them via
    `databaseHooks.user.create.before` or your own app logic.
- `src/app/api/auth/[...all]/route.ts` — the single catch-all route handler
  (`toNextJsHandler(auth)`). All auth HTTP traffic goes through this one file.
- `src/lib/auth-client.ts` — `"use client"` browser client (`createAuthClient()`), used by
  components like `SignInForm`/`SignOutButton`/`SignUpForm`.
- `src/features/auth/schemas/auth.schema.ts` — zod schemas (`signUpSchema`, `signInSchema`) used
  with react-hook-form via `@hookform/resolvers`.

## Rules

- Never re-introduce NextAuth packages or `getServerSession`-style patterns.
- Don't add new fields directly to the `User` Prisma model for auth-derived data without also
  registering them in `auth.user.additionalFields` in `src/auth.ts` — better-auth needs to know
  about them to read/write them through its own API.
- Env vars used: `AUTH_SECRET` / `BETTER_AUTH_SECRET` (secret falls back to `AUTH_SECRET` if
  `BETTER_AUTH_SECRET` is unset), `BETTER_AUTH_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`. Check
  `.env` for the full list before assuming a var doesn't exist.
- `role` and `householdId` are intentionally not user-settable through sign-up — a new user always
  lands with `role: "member"` and `householdId: null`, then goes through `/onboarding`
  (`src/app/[lang]/onboarding/page.tsx` + `POST /api/user/onboarding`) to join/create a household.
