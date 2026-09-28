/**
 * Apply Prisma schema to Turso (Prisma CLI sqlite provider only accepts file: URLs).
 * Usage: DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node scripts/apply-turso-schema.mjs
 */
import { createClient } from "@libsql/client";
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url?.startsWith("libsql:") || !authToken) {
  console.error("Set DATABASE_URL (libsql://) and TURSO_AUTH_TOKEN");
  process.exit(1);
}

const tmpSql = path.join(os.tmpdir(), "invest-mart-schema.sql");
execSync(
  `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script -o "${tmpSql}"`,
  { stdio: "inherit", cwd: projectRoot }
);

const sql = fs.readFileSync(tmpSql, "utf8");
const client = createClient({ url, authToken });
await client.executeMultiple(sql);
console.log("Turso schema applied.");
