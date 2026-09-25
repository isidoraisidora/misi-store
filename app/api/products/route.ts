import { NextResponse } from "next/server";
import { getAvailableProducts } from "@/lib/products-server";

export const runtime = "nodejs";

export async function GET() {
  const products = await getAvailableProducts();
  return NextResponse.json({ products });
}
