import { NextResponse } from "next/server";
import { execSync } from "node:child_process";

export const runtime = "nodejs";
export const maxDuration = 60;

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
      timeout: 120_000,
    });
    execSync("npx tsx prisma/seed.ts", {
      cwd: root,
      env: process.env,
      stdio: "pipe",
      timeout: 120_000,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("bootstrap", e);
    const stderr =
      e && typeof e === "object" && "stderr" in e
        ? String((e as { stderr?: Buffer }).stderr ?? "")
        : "";
    return NextResponse.json(
      { error: "bootstrap_failed", detail: stderr.slice(-500) },
      { status: 500 }
    );
  }
}
