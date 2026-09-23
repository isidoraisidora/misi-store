import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET() {
  try {
    await requireAdmin();
    const { data, error } = await getSupabaseAdmin().from("products").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ products: data ?? [] });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return unauthorized();
    return NextResponse.json({ error: "Could not load products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const name = typeof formData.get("name") === "string" ? String(formData.get("name")).trim() : "";
    const priceCents = Number(formData.get("priceCents"));
    const category = typeof formData.get("category") === "string" ? String(formData.get("category")).trim() : "";
    const images = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);

    if (!name || !category || images.length === 0 || images.length > 8 || !Number.isInteger(priceCents) || priceCents < 0) {
      return NextResponse.json({ error: "Name, category, at least one image and a valid price are required (maximum 8 images)" }, { status: 400 });
    }
    if (images.some((image) => !image.type.startsWith("image/"))) {
      return NextResponse.json({ error: "The uploaded file must be an image" }, { status: 400 });
    }
    if (images.some((image) => image.size > 8 * 1024 * 1024)) {
      return NextResponse.json({ error: "Each image must be smaller than 8 MB" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const imageUrls: string[] = [];
    for (const image of images) {
      const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";
      const imagePath = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(imagePath, image, { contentType: image.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data: imageData } = supabase.storage.from("product-images").getPublicUrl(imagePath);
      imageUrls.push(imageData.publicUrl);
    }

    const { data, error } = await supabase.from("products").insert({
      name,
      slug: `${slugify(name)}-${Date.now()}`,
      price_cents: priceCents,
      category,
      size: typeof formData.get("size") === "string" ? String(formData.get("size")).trim() : null,
      image_url: imageUrls[0],
      image_urls: imageUrls,
      is_available: true,
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return unauthorized();
    return NextResponse.json({ error: "Could not add product" }, { status: 500 });
  }
}
