import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanEnv, createTursoClient, resolveTursoUrl } from "@/lib/turso-client";

function envMeta() {
  const databaseUrl = cleanEnv(process.env.DATABASE_URL);
  return {
    urlType: databaseUrl.startsWith("libsql:")
      ? "libsql"
      : databaseUrl.startsWith("file:")
        ? "file"
        : databaseUrl
          ? "other"
          : "missing",
    hasTursoToken: Boolean(cleanEnv(process.env.TURSO_AUTH_TOKEN)),
    tursoHost: (() => {
      try {
        const u = resolveTursoUrl();
        return u ? new URL(u.replace(/^libsql:/, "https:")).hostname : null;
      } catch {
        return null;
      }
    })(),
    hasJwtSecret: Boolean(process.env.JWT_SECRET?.trim()),
    bootstrapConfigured: Boolean(process.env.SETUP_SECRET?.trim()),
  };
}

async function tursoChecks() {
  const url = resolveTursoUrl();
  const authToken = cleanEnv(process.env.TURSO_AUTH_TOKEN);
  if (!url.startsWith("libsql:") || !authToken) {
    return { libsqlReachable: false, userTable: false };
  }
  const client = createTursoClient();
  try {
    await client.execute("SELECT 1");
  } catch {
    return { libsqlReachable: false, userTable: false };
  }
  try {
    const rows = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='User'"
    );
    return { libsqlReachable: true, userTable: rows.rows.length > 0 };
  } catch {
    return { libsqlReachable: true, userTable: false };
  }
}

export async function GET() {
  const meta = envMeta();

  if (meta.urlType === "libsql" && !meta.hasTursoToken) {
    return NextResponse.json(
      {
        ok: false,
        reason: "missing_turso_token",
        hint: "Add TURSO_AUTH_TOKEN on Vercel (Production), then Redeploy.",
        ...meta,
      },
      { status: 503 }
    );
  }

  if (meta.urlType === "missing") {
    return NextResponse.json(
      {
        ok: false,
        reason: "missing_database_url",
        hint: "Add DATABASE_URL (libsql://...) on Vercel, then Redeploy.",
        ...meta,
      },
      { status: 503 }
    );
  }

  const turso = await tursoChecks();

  if (meta.urlType === "libsql" && !turso.libsqlReachable) {
    return NextResponse.json(
      {
        ok: false,
        reason: "turso_unreachable",
        hint: "Check DATABASE_URL and TURSO_AUTH_TOKEN (Turso dashboard → Create Token). Redeploy.",
        ...meta,
        ...turso,
      },
      { status: 503 }
    );
  }

  if (meta.urlType === "libsql" && turso.libsqlReachable && !turso.userTable) {
    return NextResponse.json(
      {
        ok: false,
        reason: "schema_not_applied",
        hint:
          "Run bootstrap once: POST /api/setup/bootstrap with { \"secret\": \"YOUR_SETUP_SECRET\" }.",
        ...meta,
        ...turso,
      },
      { status: 503 }
    );
  }

  try {
    await prisma.user.count();
    return NextResponse.json({ ok: true, ...meta, ...turso });
  } catch (e) {
    console.error("db health", e);
    const message = e instanceof Error ? e.message : "";
    const reason = /Unauthorized|401|authentication/i.test(message)
      ? "turso_auth_failed"
      : "prisma_error";

    const hint =
      reason === "turso_auth_failed"
        ? "Regenerate Turso token, update TURSO_AUTH_TOKEN on Vercel, Redeploy."
        : "Turso is reachable but Prisma failed — redeploy latest commit or check Vercel function logs.";

    return NextResponse.json(
      { ok: false, reason, hint, ...meta, ...turso },
      { status: 503 }
    );
  }
}
