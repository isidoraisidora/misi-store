import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Product } from "@/lib/products";

export async function getAvailableProducts(limit?: number): Promise<Product[]> {
  const query = getSupabaseAdmin()
    .from("products")
    .select("id, image_urls, title, description, price_cents, size, category_id, is_available, created_at")
    .eq("is_available", true)
    .not("price_cents", "is", null)
    .order("created_at", { ascending: false });

  const { data, error } = limit ? await query.limit(limit) : await query;
  if (error) {
    console.error("Could not load available products:", error);
    return [];
  }

  return (data ?? []) as Product[];
}
