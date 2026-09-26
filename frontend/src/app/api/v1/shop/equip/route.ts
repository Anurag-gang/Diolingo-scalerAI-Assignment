import { NextResponse } from "next/server";
import { FALLBACK_USER, FALLBACK_SHOP_ITEMS } from "@/lib/fallbackData";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const user = {
      ...FALLBACK_USER,
      equipped_outfit: body.item_code || FALLBACK_USER.equipped_outfit,
    };
    return NextResponse.json({
      success: true,
      message: "Item equipped successfully!",
      user,
      items: FALLBACK_SHOP_ITEMS,
    });
  } catch {
    return NextResponse.json({
      success: true,
      message: "Item equipped successfully!",
      user: FALLBACK_USER,
      items: FALLBACK_SHOP_ITEMS,
    });
  }
}
