import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const sessionCookie = "misi_admin_session";
const sessionLifetime = 60 * 60 * 24 * 7;

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Missing ADMIN_SESSION_SECRET");
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

export function isAdminCredential(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  return Boolean(adminEmail && adminPassword && email === adminEmail && password === adminPassword);
}

export function createAdminSession() {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  return `${timestamp}.${sign(timestamp)}`;
}

export function isValidAdminSession(value: string | undefined) {
  if (!value) return false;
  const [timestamp, signature] = value.split(".");
  if (!timestamp || !signature || Number.isNaN(Number(timestamp))) return false;
  if (Math.floor(Date.now() / 1000) - Number(timestamp) > sessionLifetime) return false;

  const expected = sign(timestamp);
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  if (!isValidAdminSession(cookieStore.get(sessionCookie)?.value)) {
    throw new Error("Unauthorized");
  }
}

export function getAdminSessionCookie() {
  return {
    name: sessionCookie,
    options: {
      httpOnly: true,
      maxAge: sessionLifetime,
      path: "/",
      sameSite: "strict" as const,
      secure: process.env.NODE_ENV === "production",
    },
  };
}
