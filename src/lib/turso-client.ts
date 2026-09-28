import { createClient as createNodeClient } from "@libsql/client";
import { createClient as createWebClient } from "@libsql/client/web";
import type { Client } from "@libsql/client";

/** Strip wrapping quotes and whitespace from Vercel env values. */
export function cleanEnv(value: string | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

/** Normalize Turso / libSQL URL from dashboard (libsql:// or https://). */
export function normalizeTursoUrl(raw: string | undefined): string {
  let url = cleanEnv(raw);
  if (url.startsWith("https://")) {
    url = `libsql://${url.slice("https://".length)}`;
  } else if (url.startsWith("http://")) {
    url = `libsql://${url.slice("http://".length)}`;
  }
  return url;
}

export function resolveTursoUrl(): string {
  const databaseUrl = normalizeTursoUrl(process.env.DATABASE_URL);
  const alias = normalizeTursoUrl(process.env.TURSO_DATABASE_URL);
  if (alias.startsWith("libsql:")) return alias;
  if (databaseUrl.startsWith("libsql:")) return databaseUrl;
  return "";
}

/** Remote Turso HTTP API expects https://; libsql:// is for the native driver. */
export function tursoHttpUrl(libsqlUrl: string): string {
  if (libsqlUrl.startsWith("libsql://")) {
    return `https://${libsqlUrl.slice("libsql://".length)}`;
  }
  if (libsqlUrl.startsWith("https://") || libsqlUrl.startsWith("http://")) {
    return libsqlUrl.replace(/^http:\/\//, "https://");
  }
  return libsqlUrl;
}

export function createTursoClient(): Client {
  const libsqlUrl = resolveTursoUrl();
  const authToken = cleanEnv(process.env.TURSO_AUTH_TOKEN);
  if (!libsqlUrl || !authToken) {
    throw new Error("Turso URL and TURSO_AUTH_TOKEN are required");
  }
  if (process.env.VERCEL === "1") {
    return createWebClient({ url: tursoHttpUrl(libsqlUrl), authToken });
  }
  return createNodeClient({ url: libsqlUrl, authToken });
}
