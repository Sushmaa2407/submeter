// ============================================================
// Prisma client singleton.
//
// Why this file exists: in Next.js dev mode, your code hot-reloads
// constantly. If every file did `new PrismaClient()`, you'd open a
// fresh database connection on every single save, and quickly run
// out of allowed connections. This file makes ONE client and reuses
// it everywhere via `globalThis`, which only resets on a full restart.
// ============================================================
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
