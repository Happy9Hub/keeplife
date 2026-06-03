import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { UserRole } from "@prisma/client";
import { compare } from "bcryptjs";

import { prisma } from "@/lib/prisma";

const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // JWT is required for Credentials provider
  },
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }
// 1. Find the user in the MariaDB database
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true,
            role: true,
            householdId: true,
          },
        });

        if (!user?.passwordHash) {
          return null;
        }
        // 2. Verify the password
        const isPasswordValid = await compare(password, user.passwordHash);

        if (!isPasswordValid) {
          return null;
        }
// 3. Return the user with our custom fields
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          householdId: user.householdId,
        };
      },
    }),
  ],
  callbacks: {
    // Inject custom data into the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.householdId = user.householdId;
      }

      return token;
    },
    // Extract custom data from the JWT token and inject it into the frontend session
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.id === "string") {
          session.user.id = token.id;
        }

        if (token.role === "admin" || token.role === "member") {
          session.user.role = token.role satisfies UserRole;
        }

        if (typeof token.householdId === "string" || token.householdId === null) {
          session.user.householdId = token.householdId;
        }
      }

      return session;
    },
  },
});
