// app/api/orders/route.ts
import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNewOrderNotificationEmail, sendOrderConfirmationEmail } from "@/lib/order-email";

export const runtime = "nodejs";

// Server-only client using the service role key - bypasses RLS.
// Never import this file or expose these env vars to client-side code.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type OrderRequest = {
  customer?: {
    firstName?: unknown;
    lastName?: unknown;
    email?: unknown;
    phone?: unknown;
    addressLine?: unknown;
    city?: unknown;
    postalCode?: unknown;
    country?: unknown;
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

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
      const productId = requiredText((item as { productId?: unknown }).productId, "productId", 100);
      const quantity = (item as { quantity?: unknown }).quantity;
      if (quantity !== 1) {
        throw new Error("Each second-hand item can only be ordered once");
      }
      return { productId, quantity };
    });

    const firstName = requiredText(customer.firstName, "firstName");
    const lastName = requiredText(customer.lastName, "lastName");
    const email = requiredText(customer.email, "email", 320);
    if (!isEmail(email)) throw new Error("email is invalid");
    const phone = requiredText(customer.phone, "phone", 40);
    const addressLine = requiredText(customer.addressLine, "addressLine");
    const city = requiredText(customer.city, "city");
    const postalCode = requiredText(customer.postalCode, "postalCode", 20);
    const country = typeof customer.country === "string" && customer.country.trim() ? customer.country.trim() : "North Macedonia";

    const confirmationToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(confirmationToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const appUrl = process.env.APP_URL;
    if (!appUrl) throw new Error("Missing APP_URL");

    const { data, error } = await supabaseAdmin.rpc("create_order", {
      order_customer: {
        firstName,
        lastName,
        email,
        phone,
        addressLine,
        city,
        postalCode,
        country,
      },
      requested_items: normalizedItems,
      token_hash: tokenHash,
      token_expires_at: expiresAt,
    });

    if (error) {
      const unavailable = error.message.includes("not available") || error.message.includes("not found");
      return NextResponse.json(
        { error: unavailable ? "One or more items are no longer available" : "Could not create order" },
        { status: unavailable ? 409 : 500 },
      );
    }

    const order = Array.isArray(data) ? data[0] : data;
    const { data: orderItems, error: orderItemsError } = await supabaseAdmin
      .from("order_items")
      .select("product_title, price_cents, quantity")
      .eq("order_id", order.order_id);
    if (orderItemsError) console.error("Order created but items could not be loaded for email:", orderItemsError);
    const emailItems = (orderItems ?? []).map((item) => ({
      title: item.product_title,
      priceCents: item.price_cents,
      quantity: item.quantity,
    }));

    // Order is already created at this point - email failures should NOT
    // fail the request or the customer might retry and duplicate the order.
    const emailDetails = {
      orderNumber: order.order_number,
      firstName,
      lastName,
      email,
      phone,
      addressLine,
      city,
      postalCode,
      country,
      totalCents: order.total_cents,
      items: emailItems,
    };
    const emailResults = await Promise.allSettled([
      sendOrderConfirmationEmail({
        email,
        firstName,
        orderNumber: order.order_number,
        confirmationUrl: `${appUrl}/order-confirm?token=${confirmationToken}`,
      }),
      sendNewOrderNotificationEmail(emailDetails),
    ]);
    emailResults.forEach((result) => {
      if (result.status === "rejected") console.error("Order created but email failed:", result.reason);
    });

    return NextResponse.json({ order: { orderNumber: order.order_number, status: "in_progress" } }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}