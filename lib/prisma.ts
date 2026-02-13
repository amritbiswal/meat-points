import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

// Get connection strings
const accelerateUrl = process.env.PRISMA_DATABASE_URL;
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// Use direct connection in development, Accelerate in production
const useAccelerate =
  process.env.NODE_ENV === "production" &&
  accelerateUrl?.startsWith("prisma+postgres://");

let prismaClient: PrismaClient;

if (useAccelerate && accelerateUrl) {
  // Use Accelerate URL for production/Vercel
  prismaClient = new PrismaClient({
    accelerateUrl: accelerateUrl,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
} else if (databaseUrl) {
  // Use direct database connection with adapter for local dev
  const pool =
    globalForPrisma.pool ?? new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);

  prismaClient = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }
} else {
  throw new Error(
    "PRISMA_DATABASE_URL or DATABASE_URL environment variable is required",
  );
}

export const prisma = globalForPrisma.prisma ?? prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
