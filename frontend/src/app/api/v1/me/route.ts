import { NextResponse } from "next/server";
import { FALLBACK_USER } from "@/lib/fallbackData";

export async function GET() {
  return NextResponse.json({ user: FALLBACK_USER });
}
