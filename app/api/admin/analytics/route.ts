import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  try {
    await requireAdmin();

    const { data, error } = await getSupabaseAdmin()
      .from("orders")
      .select("id, order_number, customer_first_name, customer_last_name, email, total_cents, status, created_at, confirmed_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const orders = data ?? [];
    const confirmedOrders = orders.filter((order) => order.status === "confirmed");
    const pendingOrders = orders.filter((order) => order.status === "in_progress");
    const discardedOrders = orders.filter((order) => order.status === "discarded");

    return NextResponse.json({
      orders,
      analytics: {
        totalOrders: orders.length,
        confirmedOrders: confirmedOrders.length,
        pendingOrders: pendingOrders.length,
        discardedOrders: discardedOrders.length,
        confirmedRevenueCents: confirmedOrders.reduce((total, order) => total + order.total_cents, 0),
        pendingValueCents: pendingOrders.reduce((total, order) => total + order.total_cents, 0),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return unauthorized();
    console.error("Admin analytics failed:", error);
    return NextResponse.json({ error: "Could not load analytics" }, { status: 500 });
  }
}