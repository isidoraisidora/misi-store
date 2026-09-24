import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return new NextResponse("Недостасува токен за потврда.", { status: 400 });

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { data, error } = await getSupabaseAdmin().rpc("confirm_order", { token_hash: tokenHash });
  if (error) return new NextResponse("Линкот е невалиден или нарачката е веќе обработена.", { status: 400 });

  const result = Array.isArray(data) ? data[0] : data;
  if (result.result_status === "discarded") return new NextResponse("Оваа нарачка е отфрлена бидејќи производот повеќе не е достапен или линкот истекол.", { status: 409 });
  return new NextResponse(`Нарачката ${result.order_number} е потврдена. Ви благодариме!`, { status: 200 });
}
