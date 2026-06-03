import type { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  // Extending the session object accessible in the frontend
  interface Session {
    user: {
      id: string;
      role: UserRole;
      householdId: string | null;
    } & DefaultSession["user"];
  }

  // Extending the database User object
  interface User {
    role: UserRole;
    householdId: string | null;
  }
}

declare module "next-auth/jwt" {
  // Extending the JWT token to hold our custom data
  interface JWT {
    id: string;
    role: UserRole;
    householdId: string | null;
  }
}
