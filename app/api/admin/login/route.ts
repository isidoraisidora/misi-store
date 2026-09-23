import { NextResponse } from "next/server";
import { createAdminSession, getAdminSessionCookie, isAdminCredential } from "@/lib/admin-auth";

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (typeof body.email !== "string" || typeof body.password !== "string" || !isAdminCredential(body.email, body.password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const cookie = getAdminSessionCookie();
  response.cookies.set(cookie.name, createAdminSession(), cookie.options);
  return response;
}
