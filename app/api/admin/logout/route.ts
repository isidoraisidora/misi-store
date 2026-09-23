import { NextResponse } from "next/server";
import { getAdminSessionCookie } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const cookie = getAdminSessionCookie();
  response.cookies.set(cookie.name, "", { ...cookie.options, maxAge: 0 });
  return response;
}
