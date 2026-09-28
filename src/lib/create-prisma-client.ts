import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const log: Prisma.LogLevel[] =
  process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];

export function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const tursoUrl =
    process.env.TURSO_DATABASE_URL ??
    (databaseUrl.startsWith("libsql:") ? databaseUrl : "");
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && authToken) {
    const libsql = createClient({ url: tursoUrl, authToken });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter, log });
  }

  return new PrismaClient({ log });
}
