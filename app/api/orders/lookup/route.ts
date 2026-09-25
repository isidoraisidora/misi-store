// app/api/orders/lookup/route.ts
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");

  // Read-only - does NOT call confirm_order, does NOT mutate anything.
  // Safe for email clients that auto-fetch links for security scanning.
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("order_number, status, confirmation_expires_at, total_cents")
    .eq("confirmation_token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }

  const expired = new Date(data.confirmation_expires_at) < new Date();

  return NextResponse.json({
    orderNumber: data.order_number,
    status: expired && data.status === "in_progress" ? "expired" : data.status,
    totalCents: data.total_cents,
  });
}