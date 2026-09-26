import { NextResponse } from "next/server";
import { FALLBACK_SHOP_ITEMS } from "@/lib/fallbackData";

export async function GET() {
  return NextResponse.json({
    items: FALLBACK_SHOP_ITEMS,
  });
}
