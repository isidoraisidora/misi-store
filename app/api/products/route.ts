import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await getSupabaseAdmin()
    .from("products")
    .select("id, image_urls, title, description, price_cents, size, category_id, is_available, created_at")
    .eq("is_available", true)
    .not("price_cents", "is", null)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Could not load products" }, { status: 500 });
  return NextResponse.json({ products: data ?? [] });
}
