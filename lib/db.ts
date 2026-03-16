import { config } from "dotenv";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { join } from "path";

// Load .env file synchronously if DATABASE_URL is not set (needed for `next start`)
if (!process.env.DATABASE_URL) {
  const envPath = join(process.cwd(), ".env");
  config({ path: envPath });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaNeon({ connectionString });

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export default db;
