export const SESSION_COOKIE = "invest_session";

function base64UrlToBytes(input: string) {
  const padded = input + "=".repeat((4 - (input.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function getJwtSecret() {
  return process.env.JWT_SECRET || "invest-platform-demo-secret-change-me";
}

async function verifyHs256Jwt(token: string, secret: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  const signingInput = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const signature = base64UrlToBytes(signatureB64);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    signingInput
  );
  if (!valid) return null;

  const payloadJson = new TextDecoder().decode(base64UrlToBytes(payloadB64));
  const payload = JSON.parse(payloadJson) as { sub?: string; exp?: number };
  if (payload.exp && payload.exp * 1000 < Date.now()) return null;
  return payload;
}

export async function hasValidSession(token: string | undefined) {
  if (!token) return false;
  try {
    const payload = await verifyHs256Jwt(token, getJwtSecret());
    return typeof payload?.sub === "string";
  } catch {
    return false;
  }
}
