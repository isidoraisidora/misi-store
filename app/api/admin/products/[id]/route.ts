import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const formData = await request.formData();
    const title = typeof formData.get("name") === "string" ? String(formData.get("name")).trim() : "";
    const priceCents = Number(formData.get("priceCents"));
    const category = typeof formData.get("category") === "string" ? String(formData.get("category")).trim() : "";
    const size = typeof formData.get("size") === "string" ? String(formData.get("size")).trim() : "";
    const images = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);

    if (!title || !category || !Number.isInteger(priceCents) || priceCents < 0 || images.length > 8) {
      return NextResponse.json({ error: "Name, category and a valid price are required (maximum 8 images)" }, { status: 400 });
    }
    if (images.some((image) => !image.type.startsWith("image/"))) {
      return NextResponse.json({ error: "The uploaded file must be an image" }, { status: 400 });
    }
    if (images.some((image) => image.size > 8 * 1024 * 1024)) {
      return NextResponse.json({ error: "Each image must be smaller than 8 MB" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const update: { title: string; slug: string; price_cents: number; category_id: string; size: string | null; image_urls?: string[] } = {
      title,
      slug: `${slugify(title)}-${Date.now()}`,
      price_cents: priceCents,
      category_id: category,
      size: size || null,
    };

    if (images.length > 0) {
      const imageUrls: string[] = [];
      for (const image of images) {
        const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";
        const imagePath = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from("misi-store-images").upload(imagePath, image, { contentType: image.type, upsert: false });
        if (uploadError) throw uploadError;
        const { data: imageData } = supabase.storage.from("misi-store-images").getPublicUrl(imagePath);
        imageUrls.push(imageData.publicUrl);
      }
      update.image_urls = imageUrls;
    }

    const { data, error } = await supabase.from("products").update(update).eq("id", id).select().single();
    if (error) throw error;
    return NextResponse.json({ product: data });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Admin product update failed:", error);
    return NextResponse.json({ error: "Could not update product" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const { error } = await getSupabaseAdmin().from("products").update({ is_available: false }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Could not remove product" }, { status: 500 });
  }
}
