// app/api/orders/confirm/route.ts
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmedNotificationEmail } from "@/lib/order-email";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// POST only - this is the endpoint that actually confirms the order.
// It is only ever called from the confirm button on /order-confirm,
// a real user action - never from a plain GET, so email link-scanners
// (Gmail/Outlook safe-links prefetching) can't consume the token.
export async function POST(request: Request) {
  let token: string | undefined;

  try {
    const body = await request.json();
    token = body?.token;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const { data, error } = await supabaseAdmin.rpc("confirm_order", {
    token_hash: tokenHash,
  });

  if (error) {
    console.error("Order confirmation failed:", error.message);
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const result = Array.isArray(data) ? data[0] : data;
  const resultStatus = result.result_status ?? result.status;

  if (resultStatus === "confirmed") {
    try {
      await sendOrderConfirmedNotificationEmail({
        orderNumber: result.order_number,
        customerName: "",
      });
    } catch (e) {
      console.error("Confirmation email to owner failed:", e);
    }
  }

  return NextResponse.json({
    status: resultStatus,
    orderNumber: result.order_number,
  });
}