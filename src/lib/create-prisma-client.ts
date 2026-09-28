import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { cleanEnv, createTursoClient, resolveTursoUrl } from "./turso-client";

const log: Prisma.LogLevel[] =
  process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];

export function createPrismaClient(): PrismaClient {
  const databaseUrl = cleanEnv(process.env.DATABASE_URL);
  const tursoUrl = resolveTursoUrl();
  const authToken = cleanEnv(process.env.TURSO_AUTH_TOKEN);

  if (databaseUrl.startsWith("libsql:") && !authToken) {
    throw new Error(
      "TURSO_AUTH_TOKEN is required when DATABASE_URL uses libsql://"
    );
  }

  if (tursoUrl && authToken) {
    const libsql = createTursoClient();
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter, log });
  }

  return new PrismaClient({ log });
}
