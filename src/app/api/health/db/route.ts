import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function envMeta() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  return {
    urlType: databaseUrl.startsWith("libsql:")
      ? "libsql"
      : databaseUrl.startsWith("file:")
        ? "file"
        : databaseUrl
          ? "other"
          : "missing",
    hasTursoToken: Boolean(process.env.TURSO_AUTH_TOKEN?.trim()),
    hasJwtSecret: Boolean(process.env.JWT_SECRET?.trim()),
    bootstrapConfigured: Boolean(process.env.SETUP_SECRET?.trim()),
  };
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

  try {
    await prisma.user.count();
    return NextResponse.json({ ok: true, ...meta });
  } catch (e) {
    console.error("db health", e);
    const message = e instanceof Error ? e.message : "";
    const reason =
      /no such table|does not exist|SQLITE_ERROR/i.test(message)
        ? "schema_not_applied"
        : /Unauthorized|401|authentication/i.test(message)
          ? "turso_auth_failed"
          : "db_error";

    const hint =
      reason === "schema_not_applied"
        ? "Run POST /api/setup/bootstrap once (needs SETUP_SECRET) or npm run db:production:setup locally."
        : reason === "turso_auth_failed"
          ? "Regenerate Turso token, update TURSO_AUTH_TOKEN on Vercel, Redeploy."
          : "Check Vercel env vars and function logs.";

    return NextResponse.json(
      { ok: false, reason, hint, ...meta },
      { status: 503 }
    );
  }
}
