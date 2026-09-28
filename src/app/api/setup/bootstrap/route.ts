import { NextResponse } from "next/server";
import { execSync } from "node:child_process";

export async function POST(req: Request) {
  const setupSecret = process.env.SETUP_SECRET;
  if (!setupSecret) {
    return NextResponse.json({ error: "not_configured" }, { status: 404 });
  }

  let body: { secret?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (body.secret !== setupSecret) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = process.env.DATABASE_URL ?? "";
  if (!url.startsWith("libsql:") || !process.env.TURSO_AUTH_TOKEN) {
    return NextResponse.json({ error: "missing_turso_env" }, { status: 400 });
  }

  const root = process.cwd();
  try {
    execSync("node scripts/apply-turso-schema.mjs", {
      cwd: root,
      env: process.env,
      stdio: "pipe",
    });
    execSync("npx tsx prisma/seed.ts", {
      cwd: root,
      env: process.env,
      stdio: "pipe",
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("bootstrap", e);
    return NextResponse.json({ error: "bootstrap_failed" }, { status: 500 });
  }
}
