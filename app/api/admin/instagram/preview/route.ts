import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { fetchInstagramCandidates } from "@/lib/instagram-import";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? "25");
    const candidates = await fetchInstagramCandidates(Number.isFinite(limit) ? limit : 25);
    return NextResponse.json({ candidates });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load Instagram posts" }, { status: 500 });
  }
}
