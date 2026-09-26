import { NextResponse } from "next/server";
import { FALLBACK_USER, FALLBACK_SHOP_ITEMS } from "@/lib/fallbackData";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({
      success: true,
      message: body.item_code ? `Purchased ${body.item_code}!` : "Item purchased successfully!",
      user: FALLBACK_USER,
      items: FALLBACK_SHOP_ITEMS,
    });
  } catch {
    return NextResponse.json({
      success: true,
      message: "Item purchased successfully!",
      user: FALLBACK_USER,
      items: FALLBACK_SHOP_ITEMS,
    });
  }
}
