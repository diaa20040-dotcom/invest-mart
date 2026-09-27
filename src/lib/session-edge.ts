import { jwtVerify } from "jose";

export const SESSION_COOKIE = "invest_session";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "invest-platform-demo-secret-change-me"
);

export async function hasValidSession(token: string | undefined) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret);
    return typeof payload.sub === "string";
  } catch {
    return false;
  }
}
