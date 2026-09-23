import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type OrderRequest = {
  customer?: {
    name?: unknown;
    email?: unknown;
    phone?: unknown;
    addressLine?: unknown;
    city?: unknown;
    postalCode?: unknown;
    country?: unknown;
    notes?: unknown;
  };
  items?: unknown;
};

function requiredText(value: unknown, field: string, maxLength = 200) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }

  const text = value.trim();
  if (text.length > maxLength) {
    throw new Error(`${field} is too long`);
  }

  return text;
}

function optionalText(value: unknown, field: string, maxLength = 1000) {
  if (value === undefined || value === null || value === "") return null;
  return requiredText(value, field, maxLength);
}

export async function POST(request: Request) {
  let body: OrderRequest;

  try {
    body = (await request.json()) as OrderRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const customer = body.customer;
    const items = body.items;

    if (!customer || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Customer details and at least one item are required" },
        { status: 400 },
      );
    }

    const normalizedItems = items.map((item) => {
      if (!item || typeof item !== "object") {
        throw new Error("Each item must have a productId and quantity");
      }

      const productId = requiredText(
        (item as { productId?: unknown }).productId,
        "productId",
        100,
      );
      const quantity = (item as { quantity?: unknown }).quantity;

      if (quantity !== 1) {
        throw new Error("Each second-hand item can only be ordered once");
      }

      return { productId, quantity };
    });

    const { data, error } = await getSupabaseAdmin().rpc("create_order", {
      order_customer: {
        name: requiredText(customer.name, "name"),
        email: requiredText(customer.email, "email", 320),
        phone: requiredText(customer.phone, "phone", 40),
        addressLine: requiredText(customer.addressLine, "addressLine"),
        city: requiredText(customer.city, "city"),
        postalCode: requiredText(customer.postalCode, "postalCode", 20),
        country: optionalText(customer.country, "country", 100) ?? "North Macedonia",
        notes: optionalText(customer.notes, "notes"),
      },
      requested_items: normalizedItems,
    });

    if (error) {
      const unavailable = error.message.includes("not available") || error.message.includes("not found");
      return NextResponse.json(
        { error: unavailable ? "One or more items are no longer available" : "Could not create order" },
        { status: unavailable ? 409 : 500 },
      );
    }

    const order = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
