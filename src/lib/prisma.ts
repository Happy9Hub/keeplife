import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prismaAdapter?: PrismaMariaDb;
  prisma?: PrismaClient;
};

const adapter = globalForPrisma.prismaAdapter ?? new PrismaMariaDb(process.env.DATABASE_URL ?? "");

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaAdapter = adapter;
  globalForPrisma.prisma = prisma;
}
