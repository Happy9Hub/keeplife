import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/lib/prisma";

const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders: {
    ...(googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : {}),
  },
  user: {
    additionalFields: {
      // Which household is currently in context for this user. Role now lives
      // per-membership on HouseholdMember, so it is no longer a user-level field.
      // Set via app logic (onboarding / household switch), not the auth API.
      activeHouseholdId: {
        type: "string",
        required: false,
        input: false,
      },
      passwordHash: {
        type: "string",
        required: false,
        input: false,
        returned: false,
      },
    },
  },
});
